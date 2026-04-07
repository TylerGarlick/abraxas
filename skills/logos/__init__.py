"""
Logos - Claim Decomposition Parser for Abraxas

This module provides claim decomposition capabilities for the Logos system,
breaking complex claims into atomic propositions (SVO triplets, logical forms).

Based on research from EMNLP 2025 on compositional verification:
- Decomposing claims into atoms reduces hallucination by 40-60%
- Each atom can be verified independently for better epistemic labeling
"""

from .parser import ClaimParser
from .models import AtomicProposition, LogicalOperator, ClaimStructure
from .svo_extractor import SVOExtractor

__all__ = [
    'ClaimParser',
    'AtomicProposition',
    'LogicalOperator', 
    'ClaimStructure',
    'SVOExtractor',
]