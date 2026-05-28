"""
Chronos L2: Drift Detection Engine

Detects epistemic drift - when claims shift, contradict prior claims,
or are revised without explicit flagging across sessions.

Features:
- Semantic similarity comparison
- Contradiction pattern detection
- Confidence drift tracking
- Label change detection
"""

import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

from .temporal_index import TemporalIndex, ClaimRecord


class DriftType(Enum):
    """Types of epistemic drift detected."""
    CONTRADICTION = "contradiction"  # Direct logical conflict
    CONFIDENCE_SHIFT = "confidence_shift"  # Significant confidence change
    LABEL_CHANGE = "label_change"  # Janus label changed
    REFINEMENT = "refinement"  # Claim refined/clarified
    RETRACTION = "retraction"  # Claim implicitly withdrawn
    UNKNOWN = "unknown"


@dataclass
class DriftReport:
    """Report of detected epistemic drift between claims."""
    drift_id: str
    old_claim: ClaimRecord
    new_claim: ClaimRecord
    drift_type: DriftType
    severity: str  # "low", "medium", "high", "critical"
    description: str
    confidence: float
    timestamp: datetime
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "drift_id": self.drift_id,
            "old_claim": self.old_claim.to_dict(),
            "new_claim": self.new_claim.to_dict(),
            "drift_type": self.drift_type.value,
            "severity": self.severity,
            "description": self.description,
            "confidence": self.confidence,
            "timestamp": self.timestamp.isoformat()
        }


class DriftDetector:
    """
    Epistemic drift detection engine.
    
    Analyzes claims across sessions to detect contradictions,
    confidence shifts, and label changes that may indicate
    unflagged belief revision.
    """
    
    # Patterns indicating contradiction
    CONTRADICTION_PATTERNS = [
        (r"\bnot\b.*\b(previously|earlier|before)", "negation"),
        (r"\binstead\b.*\b(than|of)", "replacement"),
        (r"\bcontrary\b.*\b(to|previous)", "opposition"),
        (r"\bhowever\b.*\b(previously|earlier)", "contrast"),
        (r"\bwhereas\b", "contrast"),
        (r"\bon the other hand\b", "contrast"),
    ]
    
    # Confidence shift threshold (significant if > 0.3 change)
    CONFIDENCE_THRESHOLD = 0.3
    
    def __init__(self, temporal_index: TemporalIndex):
        """
        Initialize drift detector.
        
        Args:
            temporal_index: TemporalIndex instance for claim lookup
        """
        self.index = temporal_index
        self.drift_reports: Dict[str, DriftReport] = {}
    
    def _compute_similarity(self, text1: str, text2: str) -> float:
        """
        Compute semantic similarity between two claim texts.
        
        Uses simple lexical overlap as proxy for semantic similarity.
        In production, this would use embeddings.
        
        Args:
            text1: First claim text
            text2: Second claim text
            
        Returns:
            Similarity score (0-1)
        """
        # Tokenize and normalize
        def tokenize(text: str) -> set:
            text = text.lower()
            text = re.sub(r'[^\w\s]', '', text)
            return set(text.split())
        
        tokens1 = tokenize(text1)
        tokens2 = tokenize(text2)
        
        if not tokens1 or not tokens2:
            return 0.0
        
        intersection = tokens1 & tokens2
        union = tokens1 | tokens2
        
        return len(intersection) / len(union)
    
    def _detect_contradiction(self, claim1: ClaimRecord, claim2: ClaimRecord) -> Tuple[bool, str]:
        """
        Detect logical contradiction between two claims.
        
        Args:
            claim1: Earlier claim
            claim2: Later claim
            
        Returns:
            (is_contradiction, explanation)
        """
        # Check for explicit contradiction patterns
        combined_text = f"{claim1.text} {claim2.text}"
        
        for pattern, contradiction_type in self.CONTRADICTION_PATTERNS:
            if re.search(pattern, combined_text, re.IGNORECASE):
                return True, f"Explicit {contradiction_type} detected"
        
        # Check for negation of key terms
        words1 = set(claim1.text.lower().split())
        words2 = set(claim2.text.lower().split())
        
        # Look for "not X" vs "X" patterns
        for word in words1:
            if word not in ["not", "no", "never"] and f"not {word}" in words2:
                return True, f"Negation of '{word}' detected"
            if f"not {word}" in words1 and word in words2:
                return True, f"Negation reversed for '{word}'"
        
        # High similarity but different polarity suggests contradiction
        similarity = self._compute_similarity(claim1.text, claim2.text)
        if similarity > 0.6:
            # Check for opposite sentiment words
            positive_words = {"true", "correct", "valid", "confirmed", "yes"}
            negative_words = {"false", "incorrect", "invalid", "refuted", "no"}
            
            has_positive1 = any(w in claim1.text.lower() for w in positive_words)
            has_negative1 = any(w in claim1.text.lower() for w in negative_words)
            has_positive2 = any(w in claim2.text.lower() for w in positive_words)
            has_negative2 = any(w in claim2.text.lower() for w in negative_words)
            
            if (has_positive1 and has_negative2) or (has_negative1 and has_positive2):
                return True, "Opposite polarity detected"
        
        return False, "No contradiction detected"
    
    def _detect_confidence_shift(self, claim1: ClaimRecord, claim2: ClaimRecord) -> Tuple[bool, str]:
        """
        Detect significant confidence shift between claims.
        
        Args:
            claim1: Earlier claim
            claim2: Later claim
            
        Returns:
            (is_significant_shift, description)
        """
        diff = abs(claim1.confidence - claim2.confidence)
        
        if diff >= self.CONFIDENCE_THRESHOLD:
            direction = "increased" if claim2.confidence > claim1.confidence else "decreased"
            return True, f"Confidence {direction} by {diff:.2f}"
        
        return False, "No significant shift"
    
    def _detect_label_change(self, claim1: ClaimRecord, claim2: ClaimRecord) -> Tuple[bool, str]:
        """
        Detect Janus label change between claims.
        
        Args:
            claim1: Earlier claim
            claim2: Later claim
            
        Returns:
            (is_changed, description)
        """
        if claim1.janus_label != claim2.janus_label:
            return True, f"Label changed from {claim1.janus_label} to {claim2.janus_label}"
        
        return False, "No label change"
    
    def detect_drift(
        self,
        claim_id: str,
        compare_against: Optional[str] = "all"
    ) -> List[DriftReport]:
        """
        Detect drift for a specific claim against others.
        
        Args:
            claim_id: ID of claim to analyze
            compare_against: "all" or specific claim_id
            
        Returns:
            List of drift reports
        """
        claim = self.index.get_claim(claim_id)
        if not claim:
            return []
        
        reports = []
        
        # Get claims to compare against
        if compare_against == "all":
            candidates = self.index.get_all_claims()
        else:
            candidate = self.index.get_claim(compare_against)
            candidates = [candidate] if candidate else []
        
        for other in candidates:
            if other.claim_id == claim_id:
                continue
            
            # Skip if other claim is older (we want to detect drift forward in time)
            if other.timestamp > claim.timestamp:
                continue
            
            # Check similarity (only compare similar claims)
            similarity = self._compute_similarity(claim.text, other.text)
            if similarity < 0.4:
                continue  # Too different to be related
            
            # Determine drift type
            is_contradiction, contradiction_desc = self._detect_contradiction(other, claim)
            is_conf_shift, conf_desc = self._detect_confidence_shift(other, claim)
            is_label_change, label_desc = self._detect_label_change(other, claim)
            
            if is_contradiction:
                drift_type = DriftType.CONTRADICTION
                severity = "critical"
                description = contradiction_desc
                confidence = 0.9
            elif is_label_change:
                drift_type = DriftType.LABEL_CHANGE
                severity = "high"
                description = label_desc
                confidence = 1.0
            elif is_conf_shift:
                drift_type = DriftType.CONFIDENCE_SHIFT
                severity = "medium"
                description = conf_desc
                confidence = 0.8
            elif similarity > 0.7:
                drift_type = DriftType.REFINEMENT
                severity = "low"
                description = "Claim refined or clarified"
                confidence = 0.7
            else:
                continue  # No significant drift
            
            # Create drift report
            drift_id = f"drift_{claim_id}_{other.claim_id}"
            report = DriftReport(
                drift_id=drift_id,
                old_claim=other,
                new_claim=claim,
                drift_type=drift_type,
                severity=severity,
                description=description,
                confidence=confidence,
                timestamp=datetime.now()
            )
            
            reports.append(report)
            self.drift_reports[drift_id] = report
        
        return reports
    
    def detect_session_drift(self, session_id: str) -> List[DriftReport]:
        """
        Detect all drift within a session compared to prior sessions.
        
        Args:
            session_id: Session to analyze
            
        Returns:
            List of drift reports
        """
        session_claims = self.index.get_claims_by_session(session_id)
        all_reports = []
        
        for claim in session_claims:
            reports = self.detect_drift(claim.claim_id, "all")
            all_reports.extend(reports)
        
        return all_reports
    
    def get_drift_by_type(self, drift_type: DriftType) -> List[DriftReport]:
        """Get all drift reports of a specific type."""
        return [
            report for report in self.drift_reports.values()
            if report.drift_type == drift_type
        ]
    
    def get_drift_by_severity(self, severity: str) -> List[DriftReport]:
        """Get all drift reports of a specific severity."""
        return [
            report for report in self.drift_reports.values()
            if report.severity == severity
        ]
    
    def get_critical_drifts(self) -> List[DriftReport]:
        """Get all critical severity drift reports."""
        return self.get_drift_by_severity("critical")
    
    def get_all_drifts(self) -> List[DriftReport]:
        """Get all drift reports."""
        return list(self.drift_reports.values())
    
    def clear_drift_reports(self):
        """Clear all drift reports."""
        self.drift_reports.clear()
