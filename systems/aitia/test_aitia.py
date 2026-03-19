"""
Unit tests for Aitia (Causal Reasoning Engine)
"""

import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from aitia.causal_graph import CausalGraphBuilder, CausalRelationType, CausalDAG
from aitia.counterfactual import CounterfactualEngine, CounterfactualQuery
from aitia.policy_impact import PolicyImpactAnalyzer, PolicyIntervention
from aitia.logos_integration import LogosCausalVerifier


class TestCausalGraphBuilder(unittest.TestCase):
    """Test causal graph construction"""
    
    def setUp(self):
        self.builder = CausalGraphBuilder()
    
    def test_extract_causal_claims(self):
        """Test extraction of causal claims from text"""
        text = "Smoking causes lung cancer and increases mortality"
        claims = self.builder.extract_causal_claims(text)
        
        self.assertGreater(len(claims), 0)
        self.assertEqual(claims[0]['relation_type'], 'direct_cause')
        self.assertIn('cause', claims[0])
        self.assertIn('effect', claims[0])
    
    def test_build_dag(self):
        """Test building causal DAG from claims"""
        claims = [
            {'cause': 'smoking', 'effect': 'cancer', 'relation_type': 'direct_cause', 'confidence': 0.8},
            {'cause': 'cancer', 'effect': 'mortality', 'relation_type': 'direct_cause', 'confidence': 0.9}
        ]
        
        dag = self.builder.build_dag(claims, graph_id="test")
        
        self.assertIsInstance(dag, CausalDAG)
        self.assertGreaterEqual(len(dag.nodes), 2)
        self.assertGreaterEqual(len(dag.edges), 1)
        self.assertTrue(dag.to_dict()['is_dag'])
    
    def test_get_parents(self):
        """Test getting causal parents"""
        claims = [
            {'cause': 'A', 'effect': 'B', 'relation_type': 'direct_cause', 'confidence': 0.7},
            {'cause': 'B', 'effect': 'C', 'relation_type': 'direct_cause', 'confidence': 0.8}
        ]
        
        dag = self.builder.build_dag(claims, graph_id="test")
        parents = self.builder.get_parents("test", "var_1")  # B
        
        self.assertEqual(len(parents), 1)
    
    def test_get_descendants(self):
        """Test getting causal descendants"""
        claims = [
            {'cause': 'A', 'effect': 'B', 'relation_type': 'direct_cause', 'confidence': 0.7},
            {'cause': 'B', 'effect': 'C', 'relation_type': 'direct_cause', 'confidence': 0.8},
            {'cause': 'C', 'effect': 'D', 'relation_type': 'direct_cause', 'confidence': 0.9}
        ]
        
        dag = self.builder.build_dag(claims, graph_id="test")
        descendants = self.builder.get_descendants("test", "var_0")  # A
        
        self.assertGreater(len(descendants), 0)  # At least some descendants
    
    def test_cycle_removal(self):
        """Test automatic cycle removal"""
        claims = [
            {'cause': 'A', 'effect': 'B', 'relation_type': 'direct_cause', 'confidence': 0.9},
            {'cause': 'B', 'effect': 'C', 'relation_type': 'direct_cause', 'confidence': 0.8},
            {'cause': 'C', 'effect': 'A', 'relation_type': 'direct_cause', 'confidence': 0.3}  # Weakest
        ]
        
        dag = self.builder.build_dag(claims, graph_id="test")
        
        self.assertTrue(dag.to_dict()['is_dag'])


class TestCounterfactualEngine(unittest.TestCase):
    """Test counterfactual reasoning"""
    
    def setUp(self):
        self.engine = CounterfactualEngine()
        self.builder = CausalGraphBuilder()
    
    def test_intervene(self):
        """Test intervention on variable"""
        claims = [
            {'cause': 'smoking', 'effect': 'cancer', 'relation_type': 'direct_cause', 'confidence': 0.8}
        ]
        dag = self.builder.build_dag(claims, graph_id="test")
        
        state = self.engine._extract_state(dag)
        new_state = self.engine.intervene(dag, "var_0", 0.0, "set")
        
        self.assertEqual(new_state["var_0"], 0.0)
    
    def test_propagate_effects(self):
        """Test effect propagation through graph"""
        claims = [
            {'cause': 'A', 'effect': 'B', 'relation_type': 'direct_cause', 'confidence': 0.8},
            {'cause': 'B', 'effect': 'C', 'relation_type': 'direct_cause', 'confidence': 0.7}
        ]
        dag = self.builder.build_dag(claims, graph_id="test")
        
        initial_state = self.engine._extract_state(dag)
        final_state = self.engine.propagate_effects(dag, initial_state, "var_0", 1.0)
        
        self.assertIn("var_0", final_state)
        self.assertIn("var_1", final_state)
    
    def test_query(self):
        """Test counterfactual query"""
        claims = [
            {'cause': 'smoking', 'effect': 'cancer', 'relation_type': 'direct_cause', 'confidence': 0.8}
        ]
        dag = self.builder.build_dag(claims, graph_id="test")
        
        query = CounterfactualQuery(
            antecedent="If smoking eliminated",
            consequent="Cancer rates",
            intervention={"var_0": 0.0},
            graph_id="test"
        )
        
        result = self.engine.query(dag, query)
        
        self.assertEqual(result.query.antecedent, "If smoking eliminated")
        self.assertGreater(len(result.affected_variables), 0)
        self.assertGreater(result.confidence, 0.0)


class TestPolicyImpactAnalyzer(unittest.TestCase):
    """Test policy impact analysis"""
    
    def setUp(self):
        self.analyzer = PolicyImpactAnalyzer()
        self.builder = CausalGraphBuilder()
    
    def test_analyze_policy(self):
        """Test policy impact analysis"""
        claims = [
            {'cause': 'tax', 'effect': 'consumption', 'relation_type': 'preventing', 'confidence': 0.7},
            {'cause': 'consumption', 'effect': 'health', 'relation_type': 'contributing', 'confidence': 0.6}
        ]
        dag = self.builder.build_dag(claims, graph_id="test")
        
        # Use normalized variable IDs from the graph
        policy = PolicyIntervention(
            policy_id="tax_policy",
            name="Sin Tax",
            description="Tax harmful products",
            target_variables={"var_0": 1.0}  # tax -> var_0
        )
        
        result = self.analyzer.analyze(dag, policy)
        
        self.assertEqual(result.policy.policy_id, "tax_policy")
        self.assertGreater(len(result.direct_impacts), 0)
        self.assertIsInstance(result.recommendations, list)
    
    def test_compare_policies(self):
        """Test policy comparison"""
        claims = [
            {'cause': 'policy', 'effect': 'outcome', 'relation_type': 'direct_cause', 'confidence': 0.7}
        ]
        dag = self.builder.build_dag(claims, graph_id="test")
        
        # Use normalized variable IDs
        policies = [
            PolicyIntervention(policy_id="p1", name="Policy 1", description="Test", target_variables={"var_0": 0.5}),
            PolicyIntervention(policy_id="p2", name="Policy 2", description="Test", target_variables={"var_0": 1.0}),
        ]
        
        comparison = self.analyzer.compare_policies(dag, policies)
        
        self.assertIn('ranked_by_impact', comparison)
        self.assertIn('best_trade_off', comparison)


class TestLogosCausalVerifier(unittest.TestCase):
    """Test causal verification with Logos integration"""
    
    def setUp(self):
        self.verifier = LogosCausalVerifier()
    
    def test_verify_causal_claim(self):
        """Test verification of causal claim"""
        claim = "Climate change causes extreme weather"
        
        result = self.verifier.verify_causal_claim(claim)
        
        self.assertEqual(result.claim, claim)
        self.assertTrue(result.causal_structure_detected)
        self.assertIn(result.verification_status, ["VERIFIED", "PARTIAL", "UNVERIFIED"])
    
    def test_non_causal_claim(self):
        """Test verification of non-causal claim"""
        claim = "The sky is blue"
        
        result = self.verifier.verify_causal_claim(claim)
        
        self.assertFalse(result.causal_structure_detected)
        self.assertEqual(result.verification_status, "UNVERIFIED")
    
    def test_batch_verify(self):
        """Test batch verification"""
        claims = [
            "Smoking causes cancer",
            "Exercise improves health",
            "Water is wet"
        ]
        
        results = self.verifier.batch_verify(claims)
        
        self.assertEqual(len(results), 3)
        
        summary = self.verifier.get_verification_summary(results)
        self.assertEqual(summary['total_claims'], 3)


if __name__ == '__main__':
    unittest.main()
