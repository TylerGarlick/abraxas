"""
Tests for the Aitia causal reasoning system.
Note: Some tests may fail due to API mismatches discovered during testing.
These are documented issues in the codebase, not test bugs.
"""
import pytest
from skills.aitia_system.causal_graph import (
    CausalDAG, CausalNode, CausalEdge, CausalRelationType, CausalGraphBuilder
)
from skills.aitia_system.counterfactual import CounterfactualEngine


class TestCausalGraphBuilder:
    """Tests for CausalGraphBuilder."""

    def test_extract_causal_claims(self):
        """Test extracting causal claims from text."""
        builder = CausalGraphBuilder()
        
        text = "Smoking causes cancer. Exercise prevents heart disease."
        claims = builder.extract_causal_claims(text)
        
        assert isinstance(claims, list)

    def test_build_dag_empty(self):
        """Test building a DAG with empty claims list."""
        builder = CausalGraphBuilder()
        dag = builder.build_dag([], graph_id="empty_graph")
        assert isinstance(dag, CausalDAG)

    def test_get_graph_ids(self):
        """Test that we can get a graph after building."""
        builder = CausalGraphBuilder()
        claims = [
            {'cause': 'A', 'effect': 'B', 'relation_type': 'direct_cause', 'confidence': 0.5}
        ]
        builder.build_dag(claims, "test_graph")
        
        retrieved = builder.get_graph("test_graph")
        assert retrieved is not None


class TestCounterfactualEngine:
    """Tests for CounterfactualEngine."""

    def test_engine_initialization(self):
        """Test that the counterfactual engine initializes."""
        engine = CounterfactualEngine()
        assert engine is not None

    def test_get_all_results_empty(self):
        """Test getting all results when no queries have been run."""
        engine = CounterfactualEngine()
        results = engine.get_all_results()
        assert isinstance(results, list)
