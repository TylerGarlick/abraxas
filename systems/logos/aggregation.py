"""
L3: Confidence Aggregation
Combines verification results into final confidence scores.
"""

import math
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum


class AggregationMethod(Enum):
    BAYESIAN = "bayesian"
    WEIGHTED_AVERAGE = "weighted_average"
    DEMPSTER_SHAFER = "dempster_shafer"
    FUZZY_LOGIC = "fuzzy_logic"
    CONSENSUS = "consensus"


@dataclass
class VerificationInput:
    """Input for confidence aggregation."""
    proposition_text: str
    prior_confidence: float  # Initial confidence before verification
    verification_results: List[Dict[str, Any]]  # Results from L2
    source_credibilities: List[float]
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AggregatedConfidence:
    """Final aggregated confidence score."""
    proposition_text: str
    final_confidence: float
    method_used: AggregationMethod
    uncertainty_bounds: Tuple[float, float]  # (lower, upper)
    contributing_factors: Dict[str, float]
    recommendation: str
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "proposition_text": self.proposition_text,
            "final_confidence": self.final_confidence,
            "method_used": self.method_used.value,
            "uncertainty_bounds": self.uncertainty_bounds,
            "contributing_factors": self.contributing_factors,
            "recommendation": self.recommendation,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


class ConfidenceAggregationEngine:
    """
    Engine for aggregating confidence from multiple verification results.
    
    Implements multiple aggregation methods to handle different types
    of evidence and uncertainty.
    """

    def __init__(self, default_method: AggregationMethod = AggregationMethod.BAYESIAN):
        self.default_method = default_method
        self.aggregation_history: List[AggregatedConfidence] = []

    def aggregate(
        self,
        inputs: List[VerificationInput],
        method: Optional[AggregationMethod] = None
    ) -> List[AggregatedConfidence]:
        """
        Aggregate confidence for multiple propositions.
        
        Args:
            inputs: List of verification inputs
            method: Aggregation method (uses default if None)
            
        Returns:
            List of aggregated confidence results
        """
        method = method or self.default_method
        results = []
        
        for input_data in inputs:
            result = self._aggregate_single(input_data, method)
            results.append(result)
            self.aggregation_history.append(result)
        
        return results

    def _aggregate_single(
        self,
        input_data: VerificationInput,
        method: AggregationMethod
    ) -> AggregatedConfidence:
        """Aggregate confidence for a single proposition."""
        
        if method == AggregationMethod.BAYESIAN:
            confidence = self._bayesian_aggregation(input_data)
        elif method == AggregationMethod.WEIGHTED_AVERAGE:
            confidence = self._weighted_average_aggregation(input_data)
        elif method == AggregationMethod.DEMPSTER_SHAFER:
            confidence = self._dempster_shafer_aggregation(input_data)
        elif method == AggregationMethod.CONSENSUS:
            confidence = self._consensus_aggregation(input_data)
        else:
            confidence = self._weighted_average_aggregation(input_data)
        
        # Calculate uncertainty bounds
        uncertainty = self._calculate_uncertainty(input_data, confidence)
        
        # Generate recommendation
        recommendation = self._generate_recommendation(confidence, uncertainty)
        
        # Identify contributing factors
        factors = self._identify_contributing_factors(input_data, confidence)
        
        return AggregatedConfidence(
            proposition_text=input_data.proposition_text,
            final_confidence=confidence,
            method_used=method,
            uncertainty_bounds=uncertainty,
            contributing_factors=factors,
            recommendation=recommendation,
            timestamp=self._get_timestamp(),
            metadata={
                "num_sources": len(input_data.verification_results),
                "prior_confidence": input_data.prior_confidence,
                "aggregation_version": "1.0.0"
            }
        )

    def _bayesian_aggregation(self, input_data: VerificationInput) -> float:
        """
        Bayesian confidence aggregation.
        
        Updates prior confidence based on evidence likelihood.
        P(H|E) = P(E|H) * P(H) / P(E)
        """
        prior = input_data.prior_confidence
        
        # Calculate likelihood from verification results
        supporting_count = 0
        total_weight = 0.0
        
        for i, result in enumerate(input_data.verification_results):
            # Extract verification status
            status = result.get("status", "unknown")
            credibility = input_data.source_credibilities[i] if i < len(input_data.source_credibilities) else 0.5
            
            if status == "verified":
                supporting_count += 1
                total_weight += credibility
            elif status == "contradicted":
                total_weight -= credibility * 0.5
        
        # Bayesian update
        if total_weight == 0:
            return prior
        
        likelihood_ratio = 1 + (supporting_count / max(1, len(input_data.verification_results)))
        posterior = (likelihood_ratio * prior) / (likelihood_ratio * prior + (1 - prior))
        
        # Normalize to [0, 1]
        return min(1.0, max(0.0, posterior))

    def _weighted_average_aggregation(self, input_data: VerificationInput) -> float:
        """
        Weighted average confidence aggregation.
        
        Simple but effective for combining multiple source confidences.
        """
        if not input_data.verification_results:
            return input_data.prior_confidence
        
        weighted_sum = 0.0
        total_weight = 0.0
        
        for i, result in enumerate(input_data.verification_results):
            confidence = result.get("confidence", 0.5)
            weight = input_data.source_credibilities[i] if i < len(input_data.source_credibilities) else 0.5
            
            # Adjust confidence based on verification status
            status = result.get("status", "unknown")
            if status == "verified":
                adjusted_confidence = confidence
            elif status == "contradicted":
                adjusted_confidence = 1.0 - confidence
            elif status == "partial":
                adjusted_confidence = confidence * 0.6
            else:  # unknown
                adjusted_confidence = 0.5
            
            weighted_sum += adjusted_confidence * weight
            total_weight += weight
        
        if total_weight == 0:
            return 0.5
        
        return weighted_sum / total_weight

    def _dempster_shafer_aggregation(self, input_data: VerificationInput) -> float:
        """
        Dempster-Shafer theory for uncertainty handling.
        
        Better suited for conflicting evidence.
        """
        # Initialize belief masses
        belief_true = input_data.prior_confidence
        belief_false = 1.0 - input_data.prior_confidence
        belief_uncertain = 0.0
        
        for i, result in enumerate(input_data.verification_results):
            status = result.get("status", "unknown")
            confidence = result.get("confidence", 0.5)
            weight = input_data.source_credibilities[i] if i < len(input_data.source_credibilities) else 0.5
            
            if status == "verified":
                m_true = confidence * weight
                m_false = 0.0
                m_uncertain = (1.0 - confidence) * weight
            elif status == "contradicted":
                m_true = 0.0
                m_false = confidence * weight
                m_uncertain = (1.0 - confidence) * weight
            else:
                m_true = 0.0
                m_false = 0.0
                m_uncertain = weight
            
            # Dempster's combination rule
            conflict = belief_true * m_false + belief_false * m_true
            if conflict < 1.0:
                new_true = (belief_true * m_true + belief_true * m_uncertain + belief_uncertain * m_true) / (1.0 - conflict)
                new_false = (belief_false * m_false + belief_false * m_uncertain + belief_uncertain * m_false) / (1.0 - conflict)
                new_uncertain = (belief_uncertain * m_uncertain) / (1.0 - conflict)
                
                belief_true = new_true
                belief_false = new_false
                belief_uncertain = new_uncertain
        
        return belief_true

    def _consensus_aggregation(self, input_data: VerificationInput) -> float:
        """
        Consensus-based aggregation.
        
        Requires agreement across diverse sources.
        """
        if not input_data.verification_results:
            return input_data.prior_confidence
        
        # Count verification statuses
        verified_count = sum(1 for r in input_data.verification_results if r.get("status") == "verified")
        contradicted_count = sum(1 for r in input_data.verification_results if r.get("status") == "contradicted")
        total = len(input_data.verification_results)
        
        # Calculate consensus score
        if verified_count == total:
            return 0.95
        elif verified_count > total * 0.8:
            return 0.85
        elif verified_count > total * 0.6:
            return 0.70
        elif contradicted_count > total * 0.6:
            return 0.20
        else:
            return 0.50

    def _calculate_uncertainty(
        self,
        input_data: VerificationInput,
        confidence: float
    ) -> Tuple[float, float]:
        """Calculate uncertainty bounds around confidence."""
        # Base uncertainty on number of sources and agreement
        num_sources = len(input_data.verification_results)
        
        # More sources = less uncertainty
        source_factor = 1.0 / math.sqrt(max(1, num_sources))
        
        # Check agreement level
        statuses = [r.get("status", "unknown") for r in input_data.verification_results]
        agreement = statuses.count("verified") / max(1, len(statuses))
        
        # Calculate margin of error
        margin = 0.15 * source_factor * (1.0 - agreement)
        
        lower = max(0.0, confidence - margin)
        upper = min(1.0, confidence + margin)
        
        return (lower, upper)

    def _generate_recommendation(self, confidence: float, uncertainty: Tuple[float, float]) -> str:
        """Generate recommendation based on confidence level."""
        width = uncertainty[1] - uncertainty[0]
        
        if confidence >= 0.85 and width < 0.1:
            return "HIGH_CONFIDENCE: Claim can be treated as verified"
        elif confidence >= 0.70 and width < 0.15:
            return "MODERATE_CONFIDENCE: Claim is likely true but monitor for updates"
        elif confidence >= 0.50:
            return "LOW_CONFIDENCE: Claim requires additional verification"
        elif confidence >= 0.30:
            return "UNCERTAIN: Insufficient evidence to determine truth value"
        else:
            return "LIKELY_FALSE: Evidence suggests claim is incorrect"

    def _identify_contributing_factors(
        self,
        input_data: VerificationInput,
        confidence: float
    ) -> Dict[str, float]:
        """Identify factors contributing to final confidence."""
        factors = {}
        
        # Prior influence
        factors["prior_confidence"] = input_data.prior_confidence * 0.3
        
        # Source diversity
        num_sources = len(input_data.verification_results)
        factors["source_diversity"] = min(1.0, num_sources / 5.0) * 0.25
        
        # Average credibility
        avg_cred = sum(input_data.source_credibilities) / max(1, len(input_data.source_credibilities))
        factors["source_credibility"] = avg_cred * 0.25
        
        # Verification agreement
        verified_count = sum(1 for r in input_data.verification_results if r.get("status") == "verified")
        factors["verification_agreement"] = (verified_count / max(1, len(input_data.verification_results))) * 0.2
        
        return factors

    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.utcnow().isoformat()

    def get_aggregation_history(self, limit: int = 10) -> List[AggregatedConfidence]:
        """Get recent aggregation history."""
        return self.aggregation_history[-limit:]


# Example usage
if __name__ == "__main__":
    engine = ConfidenceAggregationEngine()
    
    test_input = VerificationInput(
        proposition_text="Climate change is primarily caused by human activities",
        prior_confidence=0.75,
        verification_results=[
            {"status": "verified", "confidence": 0.90},
            {"status": "verified", "confidence": 0.88},
            {"status": "partial", "confidence": 0.70},
            {"status": "verified", "confidence": 0.92},
        ],
        source_credibilities=[0.90, 0.88, 0.75, 0.92]
    )
    
    result = engine.aggregate([test_input], AggregationMethod.BAYESIAN)
    print(result[0].to_dict())
