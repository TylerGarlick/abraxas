import sys
import argparse
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import sys
import argparse
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from scripts.db_client import get_db

# Handle legacy imports
try:
    db = get_db()
except Exception:
    # Fallback for environments where get_db isn't available
    from scripts.db_client import db

class SoterDB:
    def __init__(self):
        self.incident_col = "incidents"
        self.review_col = "reviews"
        db.ensure_collection(self.incident_col)
        db.ensure_collection(self.review_col)

    def log_incident(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        logged_id = f"SOTER-{int(datetime.utcnow().timestamp()*1000)}"
        logged = {
            "_key": logged_id,
            "id": logged_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request": incident.get("request"),
            "assessment": incident.get("assessment"),
            "patterns": incident.get("patterns"),
            "response": incident.get("response"),
            "resolved": False,
            "resolvedBy": None,
            "resolvedAt": None,
            "notes": incident.get("notes")
        }
        db.insert(self.incident_col, logged)
        return logged

    def get_incidents(self, unresolved: bool = False, limit: int = None, min_severity: str = None) -> List[Dict]:
        severity_order = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4}
        
        col = db.db.collection(self.incident_col)
        incidents = list(col.all())
        
        filtered = incidents
        if unresolved:
            filtered = [i for i in filtered if not i.get('resolved')]
        
        if min_severity:
            min_val = severity_order.get(min_severity, 0)
            filtered = [i for i in filtered if any(severity_order.get(p.get('severity'), 0) >= min_val for p in i.get('patterns', []))]

        filtered.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return filtered[:limit] if limit else filtered

    def get_incident_by_id(self, incident_id: str) -> Optional[Dict]:
        col = db.db.collection(self.incident_col)
        try:
            return col.get(incident_id)
        except Exception:
            # Fallback search for those using a separate 'id' field
            res = db.query("FOR i IN incidents FILTER i.id == @id LIMIT 1 RETURN i", {"id": incident_id})
            return res[0] if res else None

    def get_review_by_id(self, review_id: str) -> Optional[Dict]:
        col = db.db.collection(self.review_col)
        try:
            return col.get(review_id)
        except Exception:
            res = db.query("FOR r IN reviews FILTER r.id == @id LIMIT 1 RETURN r", {"id": review_id})
            return res[0] if res else None

    def resolve_incident(self, incident_id: str, resolution: Dict[str, Any]) -> Dict:
        incident = self.get_incident_by_id(incident_id)
        if not incident or not isinstance(incident, dict):
            raise ValueError(f"Incident {incident_id} not found or invalid format")
        
        update = {
            "resolved": True,
            "resolvedBy": resolution.get("resolvedBy", "system"),
            "resolvedAt": datetime.utcnow().isoformat() + "Z",
            "notes": resolution.get("notes") or incident.get("notes")
        }
        
        key = incident.get('_key') or incident_id
        print(f"DEBUG: Resolving incident with key: {key}")
        
        col = db.db.collection(self.incident_col)
        col.update({'_key': key}, update)
        
        updated_doc = col.get(key)
        print(f"DEBUG: Updated doc resolved status: {updated_doc.get('resolved') if updated_doc else 'NONE'}")
        
        return updated_doc

    def create_review(self, incident_id: str, options: Dict[str, Any] = {}) -> Dict:
        incident = self.get_incident_by_id(incident_id)
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")
        
        risk_score = incident.get('assessment', {}).get('score', 0)
        if risk_score < 4:
            raise ValueError(f"Risk score {risk_score} < 4, review not required")
            
        review_id = f"REVIEW-{int(datetime.utcnow().timestamp()*1000)}"
        review = {
            "_key": review_id,
            "id": review_id,
            "incidentId": incident_id,
            "status": "PENDING",
            "priority": options.get("priority") or ("CRITICAL" if risk_score == 5 else "HIGH"),
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "resolvedAt": None,
            "resolvedBy": None,
            "decision": None,
            "reason": options.get("reason") or f"Risk score {risk_score}/5 requires review",
            "suggestedAction": options.get("suggestedAction"),
            "reviewerNotes": None,
            "incident": {
                "request": incident.get("request"),
                "riskScore": risk_score,
                "patterns": incident.get("patterns"),
                "response": incident.get("response")
            }
        }
        db.insert(self.review_col, review)
        return review

    def get_pending_reviews(self, priority: str = None, limit: int = 20) -> List[Dict]:
        aql = "FOR r IN reviews FILTER r.status == 'PENDING'"
        bind_vars = {}
        if priority:
            aql += " FILTER r.priority == @priority"
            bind_vars["priority"] = priority
        aql += " SORT r.priority == 'CRITICAL' DESC, r.createdAt DESC"
        if limit:
            aql += f" LIMIT {limit}"
        return db.query(aql, bind_vars)

    def get_review_by_id(self, review_id: str) -> Optional[Dict]:
        res = db.query("FOR r IN reviews FILTER r._key == @id LIMIT 1 RETURN r", {"id": review_id})
        if res: return res[0]
        res = db.query("FOR r IN reviews FILTER r.id == @id LIMIT 1 RETURN r", {"id": review_id})
        return res[0] if res else None

    def submit_decision(self, review_id: str, decision: Dict[str, Any]) -> Dict:
        review = self.get_review_by_id(review_id)
        if not review:
            raise ValueError(f"Review {review_id} not found")
        if review['status'] != 'PENDING':
            raise ValueError(f"Review is already {review['status']}")
        
        valid = ['APPROVED', 'REJECTED', 'ALLOW_WITH_CONDITIONS']
        if decision['decision'] not in valid:
            raise ValueError(f"Invalid decision. Use: {valid}")
            
        update = {
            "status": "RESOLVED",
            "resolvedAt": datetime.utcnow().isoformat() + "Z",
            "resolvedBy": decision.get("resolvedBy", "human_reviewer"),
            "decision": decision['decision'],
            "reviewerNotes": decision.get("notes"),
            "conditions": decision.get("conditions")
        }
        db.update(review['_id'], self.review_col, update)
        
        if decision['decision'] in ['APPROVED', 'ALLOW_WITH_CONDITIONS']:
            try:
                self.resolve_incident(review['incidentId'], {
                    "resolvedBy": update["resolvedBy"],
                    "notes": f"Human review {decision['decision']}: {decision.get('notes', '')}"
                })
            except Exception as e:
                print(f"Warning: Could not resolve incident {review['incidentId']}: {e}")
        return {**review, **update}

    def get_statistics(self) -> Dict[str, Any]:
        incidents = self.get_incidents()
        severity_order = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4}
        stats = {
            "total": len(incidents),
            "resolved": len([i for i in incidents if i.get('resolved')]),
            "unresolved": len([i for i in incidents if not i.get('resolved')]),
            "bySeverity": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
            "byPattern": {},
            "averageRiskScore": 0,
            "recentTrend": []
        }
        total_score = 0
        for i in incidents:
            max_sev = "LOW"
            for p in i.get('patterns', []):
                p_sev = p.get('severity', 'LOW')
                if severity_order.get(p_sev, 0) > severity_order.get(max_sev, 0):
                    max_sev = p_sev
            stats["bySeverity"][max_sev] += 1
            for p in i.get('patterns', []):
                p_name = p.get('name', 'Unknown')
                stats["byPattern"][p_name] = stats["byPattern"].get(p_name, 0) + 1
            total_score += i.get('assessment', {}).get('score', 0)
        if incidents:
            stats["averageRiskScore"] = total_score / len(incidents)
        for i in incidents[:10]:
            stats["recentTrend"].append({
                "id": i.get("id"), "timestamp": i.get("timestamp"),
                "riskScore": i.get('assessment', {}).get('score', 0),
                "resolved": i.get("resolved")
            })
        return stats

if __name__ == "__main__":
    soter = SoterDB()
    # (CLI Implementation removed for brevity, can be re-added as needed)
