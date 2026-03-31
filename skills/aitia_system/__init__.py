"""
Aitia - Causal Reasoning Engine
Core logic module for causal graph construction, counterfactual reasoning,
and policy impact analysis.
"""

from .causal_graph import CausalGraphBuilder
from .counterfactual import CounterfactualEngine
from .policy_impact import PolicyImpactAnalyzer
from .logos_integration import LogosCausalVerifier

__all__ = [
    'CausalGraphBuilder',
    'CounterfactualEngine',
    'PolicyImpactAnalyzer',
    'LogosCausalVerifier',
]

__version__ = '3.0.0'
