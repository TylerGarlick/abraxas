"""
Scribe S2: Reliability Scorer Engine

Calculates and updates source reliability scores based on:
- Source type and domain reputation
- Historical accuracy track record
- Retraction/correction history
- Cross-source verification

Features:
- Dynamic reliability scoring
- Track record tracking
- Retraction penalty application
- Consensus-based adjustment
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
import json
import os

from .source_capture import SourceMetadata, SourceCapture


class ReliabilityFactor(Enum):
    """Factors affecting reliability scores."""
    SOURCE_TYPE = "source_type"
    DOMAIN_REP = "domain_reputation"
    RETRACTION = "retraction"
    CORRECTION = "correction"
    ACCURACY_TRACK = "accuracy_track_record"
    CONSENSUS = "cross_source_consensus"
    AGE = "source_age"


@dataclass
class ReliabilityUpdate:
    """Record of a reliability score update."""
    source_id: str
    old_score: float
    new_score: float
    factor: ReliabilityFactor
    reason: str
    timestamp: datetime
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "source_id": self.source_id,
            "old_score": self.old_score,
            "new_score": self.new_score,
            "factor": self.factor.value,
            "reason": self.reason,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }


class ReliabilityScorer:
    """
    Source reliability scoring engine.
    
    Dynamically adjusts source reliability based on track record,
    retractions, corrections, and cross-source verification.
    """
    
    # Penalty/bonus magnitudes
    PENALTY_RETRACTION = -0.50  # Major penalty for retraction
    PENALTY_CORRECTION = -0.20  # Moderate penalty for correction
    BONUS_CONSISTENT = 0.10     # Bonus for consistent accuracy
    BONUS_CONSENSUS = 0.15      # Bonus for cross-source consensus
    
    # Minimum/maximum bounds
    MIN_SCORE = 0.0
    MAX_SCORE = 1.0
    
    def __init__(self, source_capture: SourceCapture, storage_path: Optional[str] = None):
        """
        Initialize reliability scorer.
        
        Args:
            source_capture: SourceCapture instance for source lookup
            storage_path: Path to persist reliability data
        """
        self.capture = source_capture
        self.storage_path = storage_path or os.path.expanduser("~/.abraxas/scribe")
        self.update_history: List[ReliabilityUpdate] = []
        self.source_track_record: Dict[str, Dict] = {}  # source_id -> accuracy history
        
        os.makedirs(self.storage_path, exist_ok=True)
        self._load_data()
    
    def _clamp_score(self, score: float) -> float:
        """Clamp score to valid range."""
        return max(self.MIN_SCORE, min(self.MAX_SCORE, score))
    
    def record_accuracy(
        self,
        source_id: str,
        was_accurate: bool,
        claim_id: Optional[str] = None
    ):
        """
        Record accuracy outcome for a source.
        
        Args:
            source_id: Source that made the claim
            was_accurate: Whether the claim was accurate
            claim_id: Optional claim identifier
        """
        if source_id not in self.source_track_record:
            self.source_track_record[source_id] = {
                "total": 0,
                "accurate": 0,
                "claims": []
            }
        
        record = self.source_track_record[source_id]
        record["total"] += 1
        if was_accurate:
            record["accurate"] += 1
        if claim_id:
            record["claims"].append({
                "claim_id": claim_id,
                "accurate": was_accurate,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        self._save_data()
    
    def apply_retraction_penalty(
        self,
        source_id: str,
        retraction_reason: str,
        retraction_date: Optional[datetime] = None
    ) -> ReliabilityUpdate:
        """
        Apply major penalty for source retraction.
        
        Args:
            source_id: Retracted source
            retraction_reason: Reason for retraction
            retraction_date: Date of retraction
            
        Returns:
            ReliabilityUpdate record
        """
        source = self.capture.get_source(source_id)
        if not source:
            raise ValueError(f"Source not found: {source_id}")
        
        old_score = source.reliability_score
        new_score = self._clamp_score(old_score + self.PENALTY_RETRACTION)
        
        update = ReliabilityUpdate(
            source_id=source_id,
            old_score=old_score,
            new_score=new_score,
            factor=ReliabilityFactor.RETRACTION,
            reason=f"Retraction: {retraction_reason}",
            timestamp=retraction_date or datetime.now(timezone.utc),
            metadata={"retraction_reason": retraction_reason}
        )
        
        self.capture.update_source_reliability(source_id, new_score)
        self.update_history.append(update)
        self._save_data()
        
        return update
    
    def apply_correction_penalty(
        self,
        source_id: str,
        correction_reason: str
    ) -> ReliabilityUpdate:
        """
        Apply moderate penalty for source correction.
        
        Args:
            source_id: Corrected source
            correction_reason: Nature of correction
            
        Returns:
            ReliabilityUpdate record
        """
        source = self.capture.get_source(source_id)
        if not source:
            raise ValueError(f"Source not found: {source_id}")
        
        old_score = source.reliability_score
        new_score = self._clamp_score(old_score + self.PENALTY_CORRECTION)
        
        update = ReliabilityUpdate(
            source_id=source_id,
            old_score=old_score,
            new_score=new_score,
            factor=ReliabilityFactor.CORRECTION,
            reason=f"Correction: {correction_reason}",
            timestamp=datetime.now(timezone.utc),
            metadata={"correction_reason": correction_reason}
        )
        
        self.capture.update_source_reliability(source_id, new_score)
        self.update_history.append(update)
        self._save_data()
        
        return update
    
    def apply_consensus_bonus(
        self,
        source_id: str,
        consensus_sources: List[str],
        claim_topic: str
    ) -> ReliabilityUpdate:
        """
        Apply bonus when source agrees with consensus.
        
        Args:
            source_id: Source in consensus
            consensus_sources: Other sources in agreement
            claim_topic: Topic of the claim
            
        Returns:
            ReliabilityUpdate record
        """
        source = self.capture.get_source(source_id)
        if not source:
            raise ValueError(f"Source not found: {source_id}")
        
        old_score = source.reliability_score
        new_score = self._clamp_score(old_score + self.BONUS_CONSENSUS)
        
        update = ReliabilityUpdate(
            source_id=source_id,
            old_score=old_score,
            new_score=new_score,
            factor=ReliabilityFactor.CONSENSUS,
            reason=f"Consensus agreement with {len(consensus_sources)} sources on {claim_topic}",
            timestamp=datetime.now(timezone.utc),
            metadata={
                "consensus_sources": consensus_sources,
                "claim_topic": claim_topic
            }
        )
        
        self.capture.update_source_reliability(source_id, new_score)
        self.update_history.append(update)
        self._save_data()
        
        return update
    
    def calculate_track_record_score(self, source_id: str) -> Optional[float]:
        """
        Calculate reliability based on historical accuracy.
        
        Args:
            source_id: Source to evaluate
            
        Returns:
            Track record score (0-1) or None if no history
        """
        if source_id not in self.source_track_record:
            return None
        
        record = self.source_track_record[source_id]
        if record["total"] == 0:
            return None
        
        accuracy_rate = record["accurate"] / record["total"]
        
        # Weight by sample size (more confident with larger samples)
        confidence_weight = min(1.0, record["total"] / 10)  # Max confidence at 10+ claims
        
        return accuracy_rate * confidence_weight
    
    def recalculate_all_scores(self) -> Dict[str, ReliabilityUpdate]:
        """
        Recalculate all source scores based on track records.
        
        Returns:
            Dict of source_id -> ReliabilityUpdate
        """
        updates = {}
        
        for source_id in self.capture.sources.keys():
            source = self.capture.get_source(source_id)
            if not source:
                continue
            
            old_score = source.reliability_score
            
            # Get track record score
            track_score = self.calculate_track_record_score(source_id)
            
            if track_score is not None:
                # Blend base score with track record
                new_score = self._clamp_score((old_score + track_score) / 2)
            else:
                new_score = old_score
            
            if new_score != old_score:
                update = ReliabilityUpdate(
                    source_id=source_id,
                    old_score=old_score,
                    new_score=new_score,
                    factor=ReliabilityFactor.ACCURACY_TRACK,
                    reason="Recalculated based on track record",
                    timestamp=datetime.now(timezone.utc)
                )
                self.capture.update_source_reliability(source_id, new_score)
                self.update_history.append(update)
                updates[source_id] = update
        
        self._save_data()
        return updates
    
    def get_source_reliability(self, source_id: str) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive reliability info for a source.
        
        Args:
            source_id: Source to query
            
        Returns:
            Reliability information dict
        """
        source = self.capture.get_source(source_id)
        if not source:
            return None
        
        track_record = self.source_track_record.get(source_id, {})
        source_updates = [
            u for u in self.update_history if u.source_id == source_id
        ]
        
        return {
            "source_id": source_id,
            "current_score": source.reliability_score,
            "source_type": source.source_type,
            "domain": source.domain,
            "track_record": track_record,
            "accuracy_rate": track_record.get("accurate", 0) / max(track_record.get("total", 1), 1),
            "update_count": len(source_updates),
            "recent_updates": [u.to_dict() for u in source_updates[-5:]]
        }
    
    def get_all_updates(self) -> List[ReliabilityUpdate]:
        """Get all reliability update records."""
        return self.update_history.copy()
    
    def get_updates_by_factor(self, factor: ReliabilityFactor) -> List[ReliabilityUpdate]:
        """Get updates for a specific factor."""
        return [u for u in self.update_history if u.factor == factor]
    
    def get_low_reliability_sources(self, threshold: float = 0.5) -> List[Dict]:
        """
        Get sources with reliability below threshold.
        
        Args:
            threshold: Reliability threshold
            
        Returns:
            List of low-reliability source info
        """
        low_sources = []
        for source in self.capture.get_all_sources():
            if source.reliability_score < threshold:
                low_sources.append(self.get_source_reliability(source.source_id))
        return low_sources
    
    def _save_data(self):
        """Persist reliability data to disk."""
        data_file = os.path.join(self.storage_path, "reliability_data.json")
        
        data = {
            "update_history": [u.to_dict() for u in self.update_history],
            "source_track_record": self.source_track_record
        }
        
        with open(data_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def _load_data(self):
        """Load reliability data from disk."""
        data_file = os.path.join(self.storage_path, "reliability_data.json")
        
        if not os.path.exists(data_file):
            return
        
        try:
            with open(data_file, "r") as f:
                data = json.load(f)
            
            self.update_history = [
                ReliabilityUpdate(
                    source_id=d["source_id"],
                    old_score=d["old_score"],
                    new_score=d["new_score"],
                    factor=ReliabilityFactor(d["factor"]),
                    reason=d["reason"],
                    timestamp=datetime.fromisoformat(d["timestamp"]),
                    metadata=d.get("metadata", {})
                )
                for d in data.get("update_history", [])
            ]
            self.source_track_record = data.get("source_track_record", {})
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Warning: Could not load reliability data: {e}")
            self.update_history = []
            self.source_track_record = {}
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get reliability scorer statistics."""
        return {
            "total_updates": len(self.update_history),
            "sources_tracked": len(self.source_track_record),
            "by_factor": {
                factor.value: len(self.get_updates_by_factor(factor))
                for factor in ReliabilityFactor
            },
            "low_reliability_count": len(self.get_low_reliability_sources())
        }
