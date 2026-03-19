#!/usr/bin/env python3
"""
Abraxas Epistemic Ledger

Cross-session truth tracking to prevent contradictory claims.
"""

import json
import hashlib
from datetime import datetime
from typing import Dict, List, Optional, Any
from difflib import SequenceMatcher

LEDGER_PATH = "/home/ubuntu/.openclaw/workspace/abraxas/memory/epistemic-ledger.json"

# Confidence scores by label type
LABEL_CONFIDENCE = {
    "[KNOWN]": 0.95,
    "[INFERRED]": 0.70,
    "[UNCERTAIN]": 0.40,
    "[UNKNOWN]": None,  # No confidence for unknown
    "[DREAM]": None  # Symbolic content, not factual
}

# Contradiction threshold (0.0-1.0)
# Claims with similarity > this are checked for contradiction
CONTRADICTION_THRESHOLD = 0.75


class EpistemicLedger:
    """Manages cross-session epistemic claim tracking."""
    
    def __init__(self, ledger_path: str = LEDGER_PATH):
        self.ledger_path = ledger_path
        self.data = self._load()
    
    def _load(self) -> Dict[str, Any]:
        """Load ledger from disk."""
        try:
            with open(self.ledger_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "meta": {
                    "version": "1.0",
                    "created": datetime.now().isoformat(),
                    "description": "Cross-session epistemic claim tracking"
                },
                "claims": [],
                "contradictions": [],
                "index": {
                    "by_label": {label: [] for label in LABEL_CONFIDENCE.keys()},
                    "by_session": {},
                    "by_timestamp": []
                }
            }
    
    def _save(self):
        """Save ledger to disk."""
        self.data["meta"]["last_updated"] = datetime.now().isoformat()
        with open(self.ledger_path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def _hash_claim(self, text: str) -> str:
        """Create hash of claim text for deduplication."""
        return hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]
    
    def _normalize(self, text: str) -> str:
        """Normalize claim text for comparison."""
        # Lowercase, strip extra whitespace
        return ' '.join(text.lower().split())
    
    def _similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two claims."""
        return SequenceMatcher(None, self._normalize(text1), self._normalize(text2)).ratio()
    
    def add_claim(self, 
                  claim_text: str, 
                  label: str, 
                  session_id: str,
                  query_context: str = "",
                  source: str = "model_response") -> Dict[str, Any]:
        """
        Add a new claim to the ledger.
        
        Returns claim record with contradiction check results.
        """
        # Check for contradictions first
        contradictions = self._check_contradictions(claim_text, label)
        
        # Create claim record
        claim = {
            "id": self._hash_claim(claim_text),
            "claim_text": claim_text,
            "label": label,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "confidence": LABEL_CONFIDENCE.get(label),
            "source": source,
            "query_context": query_context,
            "contradictions": contradictions
        }
        
        # Add to claims list
        self.data["claims"].append(claim)
        
        # Update indexes
        self.data["index"]["by_label"][label].append(claim["id"])
        
        if session_id not in self.data["index"]["by_session"]:
            self.data["index"]["by_session"][session_id] = []
        self.data["index"]["by_session"][session_id].append(claim["id"])
        
        self.data["index"]["by_timestamp"].append({
            "id": claim["id"],
            "timestamp": claim["timestamp"]
        })
        
        # Save
        self._save()
        
        return claim
    
    def _check_contradictions(self, new_claim: str, new_label: str) -> List[Dict[str, Any]]:
        """
        Check if new claim contradicts existing claims.
        
        Contradictions occur when:
        1. Same subject with opposite truth values
        2. Both claims are [KNOWN] or [INFERRED] (high confidence)
        """
        contradictions = []
        
        # Only check factual claims ([KNOWN], [INFERRED])
        if new_label not in ["[KNOWN]", "[INFERRED]"]:
            return contradictions
        
        # Search for similar claims
        for existing in self.data["claims"]:
            if existing["label"] not in ["[KNOWN]", "[INFERRED]"]:
                continue  # Skip low-confidence claims
            
            sim = self._similarity(new_claim, existing["claim_text"])
            
            if sim > CONTRADICTION_THRESHOLD:
                # High similarity - check if contradictory
                # For now, any high-similarity claim is flagged
                # TODO: Add semantic negation detection
                contradictions.append({
                    "existing_claim_id": existing["id"],
                    "existing_claim": existing["claim_text"],
                    "existing_label": existing["label"],
                    "similarity": sim,
                    "detected_at": datetime.now().isoformat()
                })
        
        # Record contradiction if found
        if contradictions:
            self.data["contradictions"].append({
                "id": self._hash_claim(new_claim + datetime.now().isoformat()),
                "new_claim": new_claim,
                "new_label": new_label,
                "contradictions": contradictions,
                "detected_at": datetime.now().isoformat()
            })
        
        return contradictions
    
    def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search claims by text."""
        results = []
        query_norm = self._normalize(query)
        
        for claim in self.data["claims"]:
            claim_norm = self._normalize(claim["claim_text"])
            sim = SequenceMatcher(None, query_norm, claim_norm).ratio()
            if sim > 0.3:  # Low threshold for search
                results.append({
                    "claim": claim,
                    "similarity": sim
                })
        
        # Sort by similarity
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:limit]
    
    def get_contradictions(self, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all contradictions, optionally filtered by session."""
        if session_id:
            # Filter contradictions involving this session
            return [
                c for c in self.data["contradictions"]
                if any(contr["existing_claim_id"] in self.data["index"]["by_session"].get(session_id, [])
                       for contr in c["contradictions"])
            ]
        return self.data["contradictions"]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get ledger statistics."""
        return {
            "total_claims": len(self.data["claims"]),
            "by_label": {label: len(ids) for label, ids in self.data["index"]["by_label"].items()},
            "total_contradictions": len(self.data["contradictions"]),
            "sessions": len(self.data["index"]["by_session"]),
            "last_updated": self.data["meta"].get("last_updated", "never")
        }


# CLI interface
if __name__ == "__main__":
    import sys
    
    ledger = EpistemicLedger()
    
    if len(sys.argv) < 2:
        print("Usage: ledger.py <command> [args]")
        print("Commands:")
        print("  add <claim> <label> <session_id>  - Add claim")
        print("  search <query>                    - Search claims")
        print("  contradictions [session_id]       - List contradictions")
        print("  stats                             - Show statistics")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "add" and len(sys.argv) >= 5:
        claim = sys.argv[2]
        label = sys.argv[3]
        session_id = sys.argv[4]
        result = ledger.add_claim(claim, label, session_id)
        print(json.dumps(result, indent=2))
    
    elif command == "search" and len(sys.argv) >= 3:
        query = sys.argv[2]
        results = ledger.search(query)
        print(json.dumps(results, indent=2))
    
    elif command == "contradictions":
        session_id = sys.argv[2] if len(sys.argv) > 2 else None
        results = ledger.get_contradictions(session_id)
        print(json.dumps(results, indent=2))
    
    elif command == "stats":
        stats = ledger.get_stats()
        print(json.dumps(stats, indent=2))
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
