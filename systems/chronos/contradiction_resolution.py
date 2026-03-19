"""
Chronos L3: Contradiction Resolution Engine

Provides strategies for resolving temporal conflicts when drift
is detected. Helps users decide how to handle contradictions
between claims across time.

Features:
- Resolution strategy selection
- Conflict merging
- Revision tracking
- User preference learning
"""

from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

from .temporal_index import TemporalIndex, ClaimRecord
from .drift_detection import DriftReport, DriftType


class ResolutionStrategy(Enum):
    """Strategies for resolving temporal contradictions."""
    RECENCY = "recency"  # Prefer newer claim
    CONFIDENCE = "confidence"  # Prefer higher confidence
    SOURCE_STRENGTH = "source_strength"  # Prefer better sourced
    MANUAL = "manual"  # Require user decision
    MERGE = "merge"  # Combine both claims
    FLAG = "flag"  # Flag both as contested


@dataclass
class ResolutionResult:
    """Result of applying a resolution strategy."""
    resolution_id: str
    drift_report: DriftReport
    strategy: ResolutionStrategy
    chosen_claim: ClaimRecord
    superseded_claim: ClaimRecord
    action_taken: str
    timestamp: datetime
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "resolution_id": self.resolution_id,
            "drift_id": self.drift_report.drift_id,
            "strategy": self.strategy.value,
            "chosen_claim": self.chosen_claim.to_dict(),
            "superseded_claim": self.superseded_claim.to_dict(),
            "action_taken": self.action_taken,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }


class ResolutionEngine:
    """
    Contradiction resolution engine.
    
    Applies resolution strategies to detected drift reports,
    helping maintain epistemic coherence across sessions.
    """
    
    def __init__(
        self,
        temporal_index: TemporalIndex,
        default_strategy: ResolutionStrategy = ResolutionStrategy.RECENCY
    ):
        """
        Initialize resolution engine.
        
        Args:
            temporal_index: TemporalIndex instance
            default_strategy: Default resolution strategy
        """
        self.index = temporal_index
        self.default_strategy = default_strategy
        self.resolutions: Dict[str, ResolutionResult] = {}
        self.strategy_handlers: Dict[ResolutionStrategy, Callable] = {
            ResolutionStrategy.RECENCY: self._resolve_by_recency,
            ResolutionStrategy.CONFIDENCE: self._resolve_by_confidence,
            ResolutionStrategy.SOURCE_STRENGTH: self._resolve_by_sources,
            ResolutionStrategy.MANUAL: self._resolve_manual,
            ResolutionStrategy.MERGE: self._resolve_merge,
            ResolutionStrategy.FLAG: self._resolve_flag,
        }
    
    def resolve(
        self,
        drift_report: DriftReport,
        strategy: Optional[ResolutionStrategy] = None
    ) -> ResolutionResult:
        """
        Resolve a drift report using specified strategy.
        
        Args:
            drift_report: The drift report to resolve
            strategy: Resolution strategy (uses default if None)
            
        Returns:
            ResolutionResult with chosen claim and action
        """
        if strategy is None:
            strategy = self.default_strategy
        
        handler = self.strategy_handlers.get(strategy)
        if not handler:
            raise ValueError(f"Unknown strategy: {strategy}")
        
        result = handler(drift_report)
        self.resolutions[result.resolution_id] = result
        
        return result
    
    def _resolve_by_recency(self, drift: DriftReport) -> ResolutionResult:
        """Resolve by preferring newer claim."""
        # Newer claim is already in drift.new_claim
        chosen = drift.new_claim
        superseded = drift.old_claim
        
        action = f"Selected newer claim ({chosen.timestamp}) over older claim ({superseded.timestamp})"
        
        return ResolutionResult(
            resolution_id=f"res_{drift.drift_id}_recency",
            drift_report=drift,
            strategy=ResolutionStrategy.RECENCY,
            chosen_claim=chosen,
            superseded_claim=superseded,
            action_taken=action,
            timestamp=datetime.now()
        )
    
    def _resolve_by_confidence(self, drift: DriftReport) -> ResolutionResult:
        """Resolve by preferring higher confidence."""
        if drift.old_claim.confidence >= drift.new_claim.confidence:
            chosen = drift.old_claim
            superseded = drift.new_claim
        else:
            chosen = drift.new_claim
            superseded = drift.old_claim
        
        action = f"Selected higher confidence claim ({chosen.confidence:.2f}) over lower ({superseded.confidence:.2f})"
        
        return ResolutionResult(
            resolution_id=f"res_{drift.drift_id}_confidence",
            drift_report=drift,
            strategy=ResolutionStrategy.CONFIDENCE,
            chosen_claim=chosen,
            superseded_claim=superseded,
            action_taken=action,
            timestamp=datetime.now()
        )
    
    def _resolve_by_sources(self, drift: DriftReport) -> ResolutionResult:
        """Resolve by preferring better sourced claim."""
        old_source_count = len(drift.old_claim.sources)
        new_source_count = len(drift.new_claim.sources)
        
        if old_source_count >= new_source_count:
            chosen = drift.old_claim
            superseded = drift.new_claim
        else:
            chosen = drift.new_claim
            superseded = drift.old_claim
        
        action = f"Selected better sourced claim ({len(chosen.sources)} sources) over weaker ({len(superseded.sources)} sources)"
        
        return ResolutionResult(
            resolution_id=f"res_{drift.drift_id}_source",
            drift_report=drift,
            strategy=ResolutionStrategy.SOURCE_STRENGTH,
            chosen_claim=chosen,
            superseded_claim=superseded,
            action_taken=action,
            timestamp=datetime.now()
        )
    
    def _resolve_manual(self, drift: DriftReport) -> ResolutionResult:
        """Mark for manual resolution."""
        # For manual, we don't auto-select - just flag it
        action = "Flagged for manual user resolution"
        
        return ResolutionResult(
            resolution_id=f"res_{drift.drift_id}_manual",
            drift_report=drift,
            strategy=ResolutionStrategy.MANUAL,
            chosen_claim=drift.new_claim,  # Placeholder
            superseded_claim=drift.old_claim,  # Placeholder
            action_taken=action,
            timestamp=datetime.now(),
            metadata={"requires_user_input": True}
        )
    
    def _resolve_merge(self, drift: DriftReport) -> ResolutionResult:
        """Attempt to merge both claims."""
        # Simple merge: concatenate with reconciliation note
        merged_text = f"{drift.old_claim.text}. Updated: {drift.new_claim.text}"
        
        # Create merged claim record
        merged = ClaimRecord(
            claim_id=f"merged_{drift.drift_id}",
            text=merged_text,
            session_id=drift.new_claim.session_id,
            timestamp=datetime.now(),
            janus_label=self._reconcile_labels(drift.old_claim, drift.new_claim),
            confidence=(drift.old_claim.confidence + drift.new_claim.confidence) / 2,
            sources=list(set(drift.old_claim.sources + drift.new_claim.sources)),
            metadata={"merged_from": [drift.old_claim.claim_id, drift.new_claim.claim_id]}
        )
        
        action = f"Merged claims into unified statement"
        
        return ResolutionResult(
            resolution_id=f"res_{drift.drift_id}_merge",
            drift_report=drift,
            strategy=ResolutionStrategy.MERGE,
            chosen_claim=merged,
            superseded_claim=drift.old_claim,
            action_taken=action,
            timestamp=datetime.now(),
            metadata={"merged_claim_id": merged.claim_id}
        )
    
    def _resolve_flag(self, drift: DriftReport) -> ResolutionResult:
        """Flag both claims as contested."""
        action = "Both claims flagged as contested - coexist with warning"
        
        return ResolutionResult(
            resolution_id=f"res_{drift.drift_id}_flag",
            drift_report=drift,
            strategy=ResolutionStrategy.FLAG,
            chosen_claim=drift.new_claim,
            superseded_claim=drift.old_claim,
            action_taken=action,
            timestamp=datetime.now(),
            metadata={"contested": True, "both_retained": True}
        )
    
    def _reconcile_labels(self, claim1: ClaimRecord, claim2: ClaimRecord) -> str:
        """Reconcile Janus labels from two claims."""
        # Priority: KNOWN > INFERRED > UNCERTAIN > UNKNOWN
        priority = {"KNOWN": 4, "INFERRED": 3, "UNCERTAIN": 2, "UNKNOWN": 1}
        
        p1 = priority.get(claim1.janus_label, 0)
        p2 = priority.get(claim2.janus_label, 0)
        
        if p1 == p2:
            return claim1.janus_label
        return claim1.janus_label if p1 > p2 else claim2.janus_label
    
    def get_resolution(self, resolution_id: str) -> Optional[ResolutionResult]:
        """Get a resolution by ID."""
        return self.resolutions.get(resolution_id)
    
    def get_resolutions_by_strategy(self, strategy: ResolutionStrategy) -> List[ResolutionResult]:
        """Get all resolutions using a specific strategy."""
        return [
            res for res in self.resolutions.values()
            if res.strategy == strategy
        ]
    
    def get_pending_manual_resolutions(self) -> List[ResolutionResult]:
        """Get all resolutions requiring manual user input."""
        return [
            res for res in self.resolutions.values()
            if res.strategy == ResolutionStrategy.MANUAL
        ]
    
    def get_all_resolutions(self) -> List[ResolutionResult]:
        """Get all resolution results."""
        return list(self.resolutions.values())
    
    def clear_resolutions(self):
        """Clear all resolution results."""
        self.resolutions.clear()
