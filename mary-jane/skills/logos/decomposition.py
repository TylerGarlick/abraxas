"""
L1: Claim Decomposition Engine
Breaks complex claims into atomic propositions for verification.
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum


class PropositionType(Enum):
    FACTUAL = "factual"
    OPINION = "opinion"
    PREDICTION = "prediction"
    NORMATIVE = "normative"
    QUANTIFIABLE = "quantifiable"


@dataclass
class AtomicProposition:
    """A single atomic claim that can be independently verified."""
    text: str
    proposition_type: PropositionType
    confidence: float = 1.0
    sources: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "type": self.proposition_type.value,
            "confidence": self.confidence,
            "sources": self.sources,
            "dependencies": self.dependencies,
            "metadata": self.metadata
        }


@dataclass
class DecomposedClaim:
    """Result of decomposing a complex claim."""
    original_claim: str
    propositions: List[AtomicProposition]
    decomposition_confidence: float
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "original_claim": self.original_claim,
            "propositions": [p.to_dict() for p in self.propositions],
            "decomposition_confidence": self.decomposition_confidence,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


class ClaimDecompositionEngine:
    """
    Engine for breaking complex claims into atomic propositions.
    
    Uses linguistic patterns, dependency parsing hints, and semantic
    markers to identify claim boundaries and atomic units.
    """

    # Linguistic markers for claim boundaries
    CONJUNCTIONS = ["and", "but", "or", "because", "therefore", "however", "although"]
    MODAL_VERBS = ["should", "could", "would", "may", "might", "must", "will"]
    CERTAINTY_MARKERS = ["definitely", "certainly", "obviously", "clearly", "undoubtedly"]
    HEDGING_MARKERS = ["possibly", "probably", "perhaps", "maybe", "arguably"]
    
    def __init__(self):
        self.proposition_counter = 0

    def decompose(self, claim: str) -> DecomposedClaim:
        """
        Decompose a complex claim into atomic propositions.
        
        Args:
            claim: The complex claim to decompose
            
        Returns:
            DecomposedClaim with atomic propositions
        """
        # Clean and normalize the claim
        claim = self._normalize(claim)
        
        # Split into candidate propositions
        candidates = self._split_claim(claim)
        
        # Classify each proposition
        propositions = []
        for candidate in candidates:
            prop = self._classify_proposition(candidate)
            if prop:
                propositions.append(prop)
        
        # Calculate decomposition confidence
        confidence = self._calculate_decomposition_confidence(claim, propositions)
        
        return DecomposedClaim(
            original_claim=claim,
            propositions=propositions,
            decomposition_confidence=confidence,
            timestamp=self._get_timestamp(),
            metadata={
                "num_propositions": len(propositions),
                "original_length": len(claim),
                "engine_version": "1.0.0"
            }
        )

    def _normalize(self, claim: str) -> str:
        """Normalize claim text."""
        # Remove extra whitespace
        claim = re.sub(r'\s+', ' ', claim).strip()
        # Remove leading/trailing quotes
        claim = claim.strip('"\'')
        return claim

    def _split_claim(self, claim: str) -> List[str]:
        """
        Split a complex claim into candidate propositions.
        
        Uses conjunctions, semicolons, and clause boundaries.
        """
        candidates = []
        
        # Split on sentence boundaries first
        sentences = re.split(r'[.!?]+', claim)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Split on conjunctions
            for conj in self.CONJUNCTIONS:
                # Split on conjunction with comma
                pattern = r',\s*' + conj + r'\s+'
                if re.search(pattern, sentence, re.IGNORECASE):
                    parts = re.split(pattern, sentence, flags=re.IGNORECASE)
                    candidates.extend([p.strip() for p in parts if p.strip()])
                    break
            else:
                # No conjunction split, add as-is
                candidates.append(sentence)
        
        # Filter out fragments
        candidates = [c for c in candidates if len(c) > 10]
        
        return candidates

    def _classify_proposition(self, text: str) -> Optional[AtomicProposition]:
        """
        Classify a proposition by type.
        
        Determines if it's factual, opinion, prediction, etc.
        """
        text_lower = text.lower()
        
        # Check for modal verbs (normative/prediction)
        for modal in self.MODAL_VERBS:
            if modal in text_lower:
                if modal in ["should", "must", "ought"]:
                    prop_type = PropositionType.NORMATIVE
                else:
                    prop_type = PropositionType.PREDICTION
                break
        else:
            # Check for certainty/hedging markers
            if any(marker in text_lower for marker in self.CERTAINTY_MARKERS):
                prop_type = PropositionType.FACTUAL
            elif any(marker in text_lower for marker in self.HEDGING_MARKERS):
                prop_type = PropositionType.OPINION
            # Check for quantifiable claims (numbers, percentages)
            elif re.search(r'\d+%|\d+ out of|\d+ times', text_lower):
                prop_type = PropositionType.QUANTIFIABLE
            else:
                prop_type = PropositionType.FACTUAL
        
        # Extract confidence from markers
        confidence = self._extract_confidence(text)
        
        self.proposition_counter += 1
        prop_id = f"P{self.proposition_counter:03d}"
        
        return AtomicProposition(
            text=text,
            proposition_type=prop_type,
            confidence=confidence,
            metadata={"id": prop_id}
        )

    def _extract_confidence(self, text: str) -> float:
        """Extract implied confidence from linguistic markers."""
        text_lower = text.lower()
        
        # High confidence markers
        if any(m in text_lower for m in self.CERTAINTY_MARKERS):
            return 0.95
        # Medium confidence
        elif "likely" in text_lower or "probably" in text_lower:
            return 0.75
        # Low confidence (hedging)
        elif any(m in text_lower for m in self.HEDGING_MARKERS):
            return 0.50
        # Default
        else:
            return 0.80

    def _calculate_decomposition_confidence(self, claim: str, propositions: List[AtomicProposition]) -> float:
        """
        Calculate confidence in the decomposition quality.
        
        Based on coverage, clarity, and completeness.
        """
        if not propositions:
            return 0.0
        
        # Coverage: did we capture the full claim?
        total_prop_length = sum(len(p.text) for p in propositions)
        coverage = min(1.0, total_prop_length / len(claim))
        
        # Clarity: average proposition confidence
        avg_confidence = sum(p.confidence for p in propositions) / len(propositions)
        
        # Completeness: reasonable number of propositions
        expected_props = max(1, len(claim) // 100)  # Rough heuristic
        completeness = min(1.0, len(propositions) / expected_props)
        
        return (coverage * 0.4 + avg_confidence * 0.3 + completeness * 0.3)

    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()

    def add_dependency(self, prop_id: str, depends_on: str) -> None:
        """Add dependency between propositions."""
        # This would be called post-decomposition to link related propositions
        pass


# Example usage
if __name__ == "__main__":
    engine = ClaimDecompositionEngine()
    
    test_claim = "Climate change is caused by human activities, and it will lead to severe weather patterns, although some scientists argue that natural cycles play a role."
    
    result = engine.decompose(test_claim)
    print(result.to_dict())
