import unittest
from skills.synesis.python.logic import SynesisLogic, Theory

class MockGraphClient:
    def aql(self, query, bind_vars):
        return iter([])

class TestPhase1Synesis(unittest.TestCase):
    def setUp(self):
        self.graph = MockGraphClient()
        self.logic = SynesisLogic(self.graph)

    def test_graph_relationship_detection(self):
        truth_ids = ["truth-a", "truth-b", "truth-c"]
        relationships = self.logic.analyze_relationships(truth_ids)
        self.assertGreaterEqual(len(relationships), 2)
        for rel in relationships:
            self.assertIn("from", rel)
            self.assertIn("to", rel)
            self.assertIn("type", rel)

    def test_theory_emergence(self):
        domain = "ai-scaling"
        candidate_truths = ["truth-1", "truth-2", "truth-3"]
        theory = self.logic.propose_theory(domain, candidate_truths)
        self.assertIsInstance(theory, Theory)
        self.assertEqual(len(theory.grounding_ids), 3)
        self.assertTrue(len(theory.content) > 0)

    def test_theory_falsifiability(self):
        theory = self.logic.propose_theory("test", ["a", "b"])
        self.assertIn("falsif", theory.disconfirmation_criteria.lower())
        self.assertGreater(len(theory.disconfirmation_criteria), 20)

    def test_theory_validation(self):
        theory = self.logic.propose_theory("test", ["a", "b", "c"])
        result = self.logic.validate_theory(theory)
        self.assertIn("status", result)
        self.assertEqual(result["status"], "VALIDATED")

    def test_reasoning_chain_completeness(self):
        theory = self.logic.propose_theory("ethics", ["a", "b", "c"])
        self.assertGreaterEqual(len(theory.reasoning_chain), 2)
        for step in theory.reasoning_chain:
            self.assertTrue(len(step) > 5)

if __name__ == "__main__":
    unittest.main()
