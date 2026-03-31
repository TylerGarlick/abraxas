"""
Scribe S4: Provenance Tracker Engine

Maintains source provenance graphs, tracks citation chains,
and generates alerts when sources are downgraded or retracted.

Features:
- Provenance graph construction
- Citation chain tracking
- Downgrade alerting
- Impact analysis for source changes
"""

from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
import json
import os

from .source_capture import SourceCapture, SourceMetadata
from .reliability_scorer import ReliabilityScorer, ReliabilityUpdate
from .link_checker import LinkChecker, LinkCheckResult, LinkStatus


class AlertType(Enum):
    """Types of provenance alerts."""
    RETRACTION = "retraction"
    CORRECTION = "correction"
    RELIABILITY_DROP = "reliability_drop"
    LINK_ROT = "link_rot"
    CONSENSUS_CHANGE = "consensus_change"


@dataclass
class ProvenanceAlert:
    """Alert for source provenance change."""
    alert_id: str
    alert_type: AlertType
    source_id: str
    severity: str  # "low", "medium", "high", "critical"
    message: str
    timestamp: datetime
    affected_claims: List[str] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "alert_id": self.alert_id,
            "alert_type": self.alert_type.value,
            "source_id": self.source_id,
            "severity": self.severity,
            "message": self.message,
            "timestamp": self.timestamp.isoformat(),
            "affected_claims": self.affected_claims,
            "metadata": self.metadata
        }


@dataclass
class CitationChain:
    """Chain of citations linking claims to sources."""
    chain_id: str
    claim_id: str
    source_ids: List[str]
    depth: int  # Levels of indirection
    created: datetime
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "chain_id": self.chain_id,
            "claim_id": self.claim_id,
            "source_ids": self.source_ids,
            "depth": self.depth,
            "created": self.created.isoformat(),
            "metadata": self.metadata
        }


class ProvenanceTracker:
    """
    Source provenance tracking engine.
    
    Maintains provenance graphs, tracks citation chains,
    and generates alerts for source quality changes.
    """
    
    def __init__(
        self,
        source_capture: SourceCapture,
        reliability_scorer: ReliabilityScorer,
        link_checker: LinkChecker,
        storage_path: Optional[str] = None
    ):
        """
        Initialize provenance tracker.
        
        Args:
            source_capture: SourceCapture instance
            reliability_scorer: ReliabilityScorer instance
            link_checker: LinkChecker instance
            storage_path: Path to persist data
        """
        self.capture = source_capture
        self.scorer = reliability_scorer
        self.link_checker = link_checker
        self.storage_path = storage_path or os.path.expanduser("~/.abraxas/scribe")
        
        self.citation_chains: Dict[str, CitationChain] = {}
        self.claim_to_sources: Dict[str, List[str]] = {}  # claim_id -> source_ids
        self.source_to_claims: Dict[str, List[str]] = {}  # source_id -> claim_ids
        self.alerts: Dict[str, ProvenanceAlert] = {}
        self.alert_callbacks: List[Callable] = []  # Functions to call on alert
        
        os.makedirs(self.storage_path, exist_ok=True)
        self._load_data()
    
    def register_claim_sources(
        self,
        claim_id: str,
        source_ids: List[str]
    ) -> CitationChain:
        """
        Register sources for a claim.
        
        Args:
            claim_id: Claim identifier
            source_ids: List of source IDs supporting this claim
            
        Returns:
            CitationChain record
        """
        chain_id = f"chain_{claim_id}_{len(source_ids)}"
        
        chain = CitationChain(
            chain_id=chain_id,
            claim_id=claim_id,
            source_ids=source_ids,
            depth=1,  # Direct sources
            created=datetime.now(timezone.utc)
        )
        
        self.citation_chains[chain_id] = chain
        self.claim_to_sources[claim_id] = source_ids
        
        # Update reverse mapping
        for source_id in source_ids:
            if source_id not in self.source_to_claims:
                self.source_to_claims[source_id] = []
            self.source_to_claims[source_id].append(claim_id)
        
        self._save_data()
        
        return chain
    
    def register_alert_callback(self, callback: callable):
        """
        Register callback function for alerts.
        
        Args:
            callback: Function(alert: ProvenanceAlert) -> None
        """
        self.alert_callbacks.append(callback)
    
    def _emit_alert(self, alert: ProvenanceAlert):
        """Emit alert to registered callbacks."""
        self.alerts[alert.alert_id] = alert
        
        for callback in self.alert_callbacks:
            try:
                callback(alert)
            except Exception as e:
                print(f"Alert callback error: {e}")
    
    def check_source_retraction(self, source_id: str) -> Optional[ProvenanceAlert]:
        """
        Check if source has been retracted and emit alert.
        
        Args:
            source_id: Source to check
            
        Returns:
            ProvenanceAlert if retracted, None otherwise
        """
        history = self.link_checker.get_link_history(source_id)
        if not history:
            return None
        
        latest = history[-1]
        if not latest.retraction_detected:
            return None
        
        affected = self.source_to_claims.get(source_id, [])
        
        alert = ProvenanceAlert(
            alert_id=f"alert_retract_{source_id}",
            alert_type=AlertType.RETRACTION,
            source_id=source_id,
            severity="critical",
            message=f"Source {source_id} has been retracted",
            timestamp=datetime.now(timezone.utc),
            affected_claims=affected,
            metadata={
                "url": latest.url,
                "check_date": latest.check_timestamp.isoformat()
            }
        )
        
        self._emit_alert(alert)
        return alert
    
    def check_source_correction(self, source_id: str) -> Optional[ProvenanceAlert]:
        """
        Check if source has been corrected and emit alert.
        
        Args:
            source_id: Source to check
            
        Returns:
            ProvenanceAlert if corrected, None otherwise
        """
        history = self.link_checker.get_link_history(source_id)
        if not history:
            return None
        
        latest = history[-1]
        if not latest.correction_detected:
            return None
        
        affected = self.source_to_claims.get(source_id, [])
        
        alert = ProvenanceAlert(
            alert_id=f"alert_correct_{source_id}",
            alert_type=AlertType.CORRECTION,
            source_id=source_id,
            severity="medium",
            message=f"Source {source_id} has been corrected",
            timestamp=datetime.now(timezone.utc),
            affected_claims=affected,
            metadata={
                "url": latest.url,
                "check_date": latest.check_timestamp.isoformat()
            }
        )
        
        self._emit_alert(alert)
        return alert
    
    def check_reliability_drop(
        self,
        source_id: str,
        threshold: float = 0.2
    ) -> Optional[ProvenanceAlert]:
        """
        Check if source reliability dropped significantly.
        
        Args:
            source_id: Source to check
            threshold: Minimum drop to trigger alert
            
        Returns:
            ProvenanceAlert if dropped, None otherwise
        """
        updates = self.scorer.get_updates_by_factor(
            self.scorer.reliability_scorer.RELIABILITY_FACTOR.RETRACTION
        )
        
        source_updates = [u for u in updates if u.source_id == source_id]
        if not source_updates:
            return None
        
        latest = source_updates[-1]
        drop = latest.old_score - latest.new_score
        
        if drop < threshold:
            return None
        
        affected = self.source_to_claims.get(source_id, [])
        severity = "high" if drop > 0.4 else "medium"
        
        alert = ProvenanceAlert(
            alert_id=f"alert_drop_{source_id}",
            alert_type=AlertType.RELIABILITY_DROP,
            source_id=source_id,
            severity=severity,
            message=f"Source {source_id} reliability dropped by {drop:.2f}",
            timestamp=datetime.now(timezone.utc),
            affected_claims=affected,
            metadata={
                "old_score": latest.old_score,
                "new_score": latest.new_score,
                "drop": drop
            }
        )
        
        self._emit_alert(alert)
        return alert
    
    def check_link_rot(self, source_id: str) -> Optional[ProvenanceAlert]:
        """
        Check if source link has rotted (404, timeout, etc).
        
        Args:
            source_id: Source to check
            
        Returns:
            ProvenanceAlert if link rotted, None otherwise
        """
        history = self.link_checker.get_link_history(source_id)
        if not history:
            return None
        
        latest = history[-1]
        if latest.status not in [LinkStatus.NOT_FOUND, LinkStatus.TIMEOUT]:
            return None
        
        affected = self.source_to_claims.get(source_id, [])
        
        alert = ProvenanceAlert(
            alert_id=f"alert_rot_{source_id}",
            alert_type=AlertType.LINK_ROT,
            source_id=source_id,
            severity="high",
            message=f"Source {source_id} link is no longer accessible",
            timestamp=datetime.now(timezone.utc),
            affected_claims=affected,
            metadata={
                "url": latest.url,
                "status": latest.status.value,
                "http_code": latest.http_code
            }
        )
        
        self._emit_alert(alert)
        return alert
    
    def run_all_checks(self) -> List[ProvenanceAlert]:
        """
        Run all provenance checks for all sources.
        
        Returns:
            List of generated alerts
        """
        alerts = []
        
        for source_id in self.capture.sources.keys():
            # Check retraction
            alert = self.check_source_retraction(source_id)
            if alert:
                alerts.append(alert)
            
            # Check correction
            alert = self.check_source_correction(source_id)
            if alert:
                alerts.append(alert)
            
            # Check reliability drop
            alert = self.check_reliability_drop(source_id)
            if alert:
                alerts.append(alert)
            
            # Check link rot
            alert = self.check_link_rot(source_id)
            if alert:
                alerts.append(alert)
        
        return alerts
    
    def get_affected_claims(self, source_id: str) -> List[str]:
        """
        Get all claims affected by a source change.
        
        Args:
            source_id: Source to query
            
        Returns:
            List of affected claim IDs
        """
        return self.source_to_claims.get(source_id, [])
    
    def get_claim_provenance(self, claim_id: str) -> Dict[str, Any]:
        """
        Get provenance info for a claim.
        
        Args:
            claim_id: Claim to query
            
        Returns:
            Provenance information
        """
        source_ids = self.claim_to_sources.get(claim_id, [])
        sources = []
        
        for sid in source_ids:
            source = self.capture.get_source(sid)
            if source:
                reliability = self.scorer.get_source_reliability(sid)
                sources.append({
                    "source": source.to_dict(),
                    "reliability": reliability
                })
        
        chain = self.citation_chains.get(
            next((c.chain_id for c in self.citation_chains.values() 
                  if c.claim_id == claim_id), None)
        )
        
        return {
            "claim_id": claim_id,
            "sources": sources,
            "citation_chain": chain.to_dict() if chain else None,
            "alerts": [
                a.to_dict() for a in self.alerts.values()
                if claim_id in a.affected_claims
            ]
        }
    
    def get_all_alerts(self) -> List[ProvenanceAlert]:
        """Get all provenance alerts."""
        return list(self.alerts.values())
    
    def get_unacknowledged_alerts(self) -> List[ProvenanceAlert]:
        """
        Get alerts that haven't been acknowledged.
        
        Returns:
            List of unacknowledged alerts
        """
        return [
            a for a in self.alerts.values()
            if not a.metadata.get("acknowledged")
        ]
    
    def acknowledge_alert(self, alert_id: str) -> bool:
        """
        Acknowledge an alert.
        
        Args:
            alert_id: Alert to acknowledge
            
        Returns:
            True if acknowledged, False if not found
        """
        if alert_id not in self.alerts:
            return False
        
        self.alerts[alert_id].metadata["acknowledged"] = True
        self.alerts[alert_id].metadata["acknowledged_at"] = datetime.now(timezone.utc).isoformat()
        
        self._save_data()
        return True
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get provenance tracker statistics."""
        return {
            "total_chains": len(self.citation_chains),
            "tracked_claims": len(self.claim_to_sources),
            "tracked_sources": len(self.source_to_claims),
            "total_alerts": len(self.alerts),
            "alerts_by_type": {
                at.value: len([a for a in self.alerts.values() if a.alert_type == at])
                for at in AlertType
            },
            "unacknowledged": len(self.get_unacknowledged_alerts())
        }
    
    def _save_data(self):
        """Persist provenance data to disk."""
        data_file = os.path.join(self.storage_path, "provenance.json")
        
        data = {
            "citation_chains": {cid: c.to_dict() for cid, c in self.citation_chains.items()},
            "claim_to_sources": self.claim_to_sources,
            "source_to_claims": self.source_to_claims,
            "alerts": {aid: a.to_dict() for aid, a in self.alerts.items()}
        }
        
        with open(data_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def _load_data(self):
        """Load provenance data from disk."""
        data_file = os.path.join(self.storage_path, "provenance.json")
        
        if not os.path.exists(data_file):
            return
        
        try:
            with open(data_file, "r") as f:
                data = json.load(f)
            
            self.citation_chains = {
                cid: CitationChain(
                    chain_id=c["chain_id"],
                    claim_id=c["claim_id"],
                    source_ids=c["source_ids"],
                    depth=c["depth"],
                    created=datetime.fromisoformat(c["created"]),
                    metadata=c.get("metadata", {})
                )
                for cid, c in data.get("citation_chains", {}).items()
            }
            self.claim_to_sources = data.get("claim_to_sources", {})
            self.source_to_claims = data.get("source_to_claims", {})
            self.alerts = {
                aid: ProvenanceAlert(
                    alert_id=a["alert_id"],
                    alert_type=AlertType(a["alert_type"]),
                    source_id=a["source_id"],
                    severity=a["severity"],
                    message=a["message"],
                    timestamp=datetime.fromisoformat(a["timestamp"]),
                    affected_claims=a.get("affected_claims", []),
                    metadata=a.get("metadata", {})
                )
                for aid, a in data.get("alerts", {}).items()
            }
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Warning: Could not load provenance data: {e}")
            self.citation_chains = {}
            self.claim_to_sources = {}
            self.source_to_claims = {}
            self.alerts = {}
