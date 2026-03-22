"""
L4: Integration with Honest Skill
Auto-labels decomposed claims and integrates with existing Honest skill.
"""

import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone

try:
    from .decomposition import ClaimDecompositionEngine, DecomposedClaim, AtomicProposition
    from .verification import CrossSourceVerificationEngine, VerificationResult, VerificationStatus
    from .aggregation import ConfidenceAggregationEngine, AggregatedConfidence, VerificationInput
except ImportError:
    from decomposition import ClaimDecompositionEngine, DecomposedClaim, AtomicProposition
    from verification import CrossSourceVerificationEngine, VerificationResult, VerificationStatus
    from aggregation import ConfidenceAggregationEngine, AggregatedConfidence, VerificationInput


@dataclass
class HonestLabel:
    """Label assigned to a claim by the Honest skill."""
    label: str  # "TRUE", "FALSE", "MIXED", "UNVERIFIED", "OPINION"
    confidence: float
    reasoning: str
    sources: List[str]
    timestamp: str
    claim_id: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "label": self.label,
            "confidence": self.confidence,
            "reasoning": self.reasoning,
            "sources": self.sources,
            "timestamp": self.timestamp,
            "claim_id": self.claim_id,
            "metadata": self.metadata
        }


@dataclass
class HonestSkillResult:
    """Complete result from Honest skill integration."""
    original_claim: str
    decomposed_claim: DecomposedClaim
    verification_results: List[VerificationResult]
    aggregated_confidence: AggregatedConfidence
    final_label: HonestLabel
    processing_time_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "original_claim": self.original_claim,
            "decomposed_claim": self.decomposed_claim.to_dict(),
            "verification_results": [r.to_dict() for r in self.verification_results],
            "aggregated_confidence": self.aggregated_confidence.to_dict(),
            "final_label": self.final_label.to_dict(),
            "processing_time_ms": self.processing_time_ms,
            "metadata": self.metadata
        }


class HonestSkillIntegration:
    """
    Integration layer between Logos system and Honest skill.
    
    Automates claim labeling by:
    1. Decomposing complex claims (L1)
    2. Verifying against sources (L2)
    3. Aggregating confidence (L3)
    4. Generating final labels
    """

    # Label mapping based on confidence thresholds
    LABEL_THRESHOLDS = {
        "TRUE": 0.85,
        "MOSTLY_TRUE": 0.70,
        "MIXED": 0.50,
        "MOSTLY_FALSE": 0.30,
        "FALSE": 0.15,
        "UNVERIFIED": 0.0  # Default when insufficient evidence
    }

    def __init__(
        self,
        decomposition_engine: Optional[ClaimDecompositionEngine] = None,
        verification_engine: Optional[CrossSourceVerificationEngine] = None,
        aggregation_engine: Optional[ConfidenceAggregationEngine] = None
    ):
        self.decomposition_engine = decomposition_engine or ClaimDecompositionEngine()
        self.verification_engine = verification_engine or CrossSourceVerificationEngine()
        self.aggregation_engine = aggregation_engine or ConfidenceAggregationEngine()
        
        self.processing_history: List[HonestSkillResult] = []

    async def process_claim(self, claim: str, claim_id: Optional[str] = None) -> HonestSkillResult:
        """
        Process a claim through the complete Logos pipeline.
        
        Args:
            claim: The claim to verify
            claim_id: Optional identifier for the claim
            
        Returns:
            HonestSkillResult with complete analysis
        """
        start_time = datetime.now(timezone.utc)
        claim_id = claim_id or self._generate_claim_id(claim)
        
        # L1: Decompose claim
        decomposed = self.decomposition_engine.decompose(claim)
        
        # L2: Verify each proposition
        verification_results = []
        for prop in decomposed.propositions:
            result = await self.verification_engine.verify_proposition(prop.text)
            verification_results.append(result)
        
        # L3: Aggregate confidence
        aggregation_inputs = self._prepare_aggregation_inputs(
            decomposed, verification_results
        )
        aggregated_results = self.aggregation_engine.aggregate(aggregation_inputs)
        
        # L4: Generate final label
        if aggregated_results:
            final_aggregated = aggregated_results[0]
            final_label = self._generate_label(
                claim_id,
                final_aggregated.final_confidence,
                verification_results,
                final_aggregated
            )
        else:
            final_label = self._generate_unverified_label(claim_id)
            final_aggregated = None
        
        # Calculate processing time
        end_time = datetime.now(timezone.utc)
        processing_time_ms = (end_time - start_time).total_seconds() * 1000
        
        result = HonestSkillResult(
            original_claim=claim,
            decomposed_claim=decomposed,
            verification_results=verification_results,
            aggregated_confidence=final_aggregated,
            final_label=final_label,
            processing_time_ms=processing_time_ms,
            metadata={
                "pipeline_version": "3.0.0",
                "num_propositions": len(decomposed.propositions),
                "num_sources_checked": sum(len(r.sources_checked) for r in verification_results)
            }
        )
        
        self.processing_history.append(result)
        return result

    def _generate_claim_id(self, claim: str) -> str:
        """Generate unique claim identifier."""
        import hashlib
        timestamp = datetime.now(timezone.utc).isoformat()
        claim_hash = hashlib.md5(f"{claim}:{timestamp}".encode()).hexdigest()[:12]
        return f"CLM-{claim_hash}"

    def _prepare_aggregation_inputs(
        self,
        decomposed: DecomposedClaim,
        verification_results: List[VerificationResult]
    ) -> List[VerificationInput]:
        """Prepare inputs for confidence aggregation."""
        inputs = []
        
        for i, prop in enumerate(decomposed.propositions):
            # Get verification result for this proposition
            if i < len(verification_results):
                ver_result = verification_results[i]
                
                # Extract source credibilities
                source_credibilities = []
                for source in ver_result.sources_checked:
                    cred = self.verification_engine.get_source_credibility(source)
                    if cred:
                        source_credibilities.append(cred.credibility_score)
                    else:
                        source_credibilities.append(0.5)
                
                # Create verification input
                input_data = VerificationInput(
                    proposition_text=prop.text,
                    prior_confidence=prop.confidence,
                    verification_results=[ver_result.to_dict()],
                    source_credibilities=source_credibilities,
                    metadata={"proposition_id": prop.metadata.get("id")}
                )
                inputs.append(input_data)
        
        return inputs

    def _generate_label(
        self,
        claim_id: str,
        confidence: float,
        verification_results: List[VerificationResult],
        aggregated: AggregatedConfidence
    ) -> HonestLabel:
        """Generate final label based on confidence."""
        # Determine label based on thresholds
        label = "UNVERIFIED"
        for label_name, threshold in sorted(
            self.LABEL_THRESHOLDS.items(),
            key=lambda x: x[1],
            reverse=True
        ):
            if confidence >= threshold and label_name != "UNVERIFIED":
                label = label_name
                break
        
        # Generate reasoning
        reasoning = self._generate_reasoning(confidence, verification_results, label)
        
        # Collect sources
        all_sources = set()
        for result in verification_results:
            all_sources.update(result.sources_checked)
        
        return HonestLabel(
            label=label,
            confidence=confidence,
            reasoning=reasoning,
            sources=list(all_sources),
            timestamp=self._get_timestamp(),
            claim_id=claim_id,
            metadata={
                "uncertainty_bounds": aggregated.uncertainty_bounds,
                "method_used": aggregated.method_used.value,
                "recommendation": aggregated.recommendation
            }
        )

    def _generate_reasoning(
        self,
        confidence: float,
        verification_results: List[VerificationResult],
        label: str
    ) -> str:
        """Generate human-readable reasoning for the label."""
        if label == "TRUE":
            return f"Strong evidence across {len(verification_results)} sources supports this claim with {confidence:.0%} confidence."
        elif label == "MOSTLY_TRUE":
            return f"Moderate evidence supports this claim, but some sources show partial or mixed results."
        elif label == "MIXED":
            return f"Sources are divided on this claim with approximately equal supporting and contradicting evidence."
        elif label == "MOSTLY_FALSE":
            return f"Most sources contradict this claim, though some uncertainty remains."
        elif label == "FALSE":
            return f"Strong evidence across multiple sources contradicts this claim."
        else:
            return f"Insufficient evidence to verify this claim. Additional source checking recommended."

    def _generate_unverified_label(self, claim_id: str) -> HonestLabel:
        """Generate default unverified label."""
        return HonestLabel(
            label="UNVERIFIED",
            confidence=0.0,
            reasoning="Unable to complete verification pipeline",
            sources=[],
            timestamp=self._get_timestamp(),
            claim_id=claim_id,
            metadata={"error": "Verification pipeline incomplete"}
        )

    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        return datetime.now(timezone.utc).isoformat()

    def get_processing_history(self, limit: int = 10) -> List[HonestSkillResult]:
        """Get recent processing history."""
        return self.processing_history[-limit:]

    def export_results(self, output_path: str) -> None:
        """Export processing results to JSON file."""
        export_data = [r.to_dict() for r in self.processing_history]
        with open(output_path, 'w') as f:
            json.dump(export_data, f, indent=2)


# Example usage
if __name__ == "__main__":
    import asyncio

    async def main():
        integration = HonestSkillIntegration()
        
        test_claim = "Climate change is caused by human activities and will lead to severe weather patterns."
        
        result = await integration.process_claim(test_claim, claim_id="TEST-001")
        print(json.dumps(result.to_dict(), indent=2))

    asyncio.run(main())
