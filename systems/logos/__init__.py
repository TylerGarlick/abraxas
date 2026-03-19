"""
Logos System - Compositional Verification

Abraxas v3 Phase 1: Claim verification through decomposition,
cross-source verification, and confidence aggregation.
"""

from .decomposition import ClaimDecompositionEngine, AtomicProposition, PropositionType, DecomposedClaim
from .verification import CrossSourceVerificationEngine, VerificationResult, VerificationStatus, SourceCredibility
from .aggregation import ConfidenceAggregationEngine, AggregatedConfidence, AggregationMethod, VerificationInput
from .honest_integration import HonestSkillIntegration, HonestLabel, HonestSkillResult

__version__ = "3.0.0"
__all__ = [
    "ClaimDecompositionEngine",
    "AtomicProposition",
    "PropositionType",
    "DecomposedClaim",
    "CrossSourceVerificationEngine",
    "VerificationResult",
    "VerificationStatus",
    "SourceCredibility",
    "ConfidenceAggregationEngine",
    "AggregatedConfidence",
    "AggregationMethod",
    "VerificationInput",
    "HonestSkillIntegration",
    "HonestLabel",
    "HonestSkillResult",
]
