import unittest
from unittest.mock import AsyncMock
from skills.auto_agon.python.logic import AutoAgonLogic, AgonAuditReport, EvolutionReport

class MockMCP:
    def __init__(self):
        self.call_tool = AsyncMock()

class TestPhase3Metanoia(unittest.TestCase):
    def setUp(self):
        self.mcp = MockMCP()
        self.logic = AutoAgonLogic(self.mcp)

    def test_agon_self_audit(self):
        report = self.logic.self_audit()
        self.assertIsInstance(report, AgonAuditReport)
        self.assertGreaterEqual(len(report.weakness_patterns), 1)
        self.assertGreaterEqual(len(report.blind_spots), 1)
        self.assertGreater(len(report.recommendation), 10)

    def test_agon_parameter_evolution(self):
        original = self.logic.promotion_threshold
        evolution = self.logic.evolve_parameters("promotion_threshold")
        self.assertIsInstance(evolution, EvolutionReport)
        self.assertEqual(evolution.previous_value, original)
        self.assertEqual(evolution.new_value, 0.85)
        self.assertEqual(self.logic.promotion_threshold, 0.85)

    def test_evolution_unknown_target_graceful(self):
        evolution = self.logic.evolve_parameters("nonexistent")
        self.assertEqual(evolution.previous_value, evolution.new_value)

    def test_domain_heuristics_evolution(self):
        evolution = self.logic.evolve_parameters("domain_heuristics")
        self.assertIsInstance(evolution, EvolutionReport)
        self.assertIn("MULTI_DOMAIN", str(evolution.new_value))

    def test_audit_detects_permissive_threshold(self):
        self.logic.promotion_threshold = 0.70
        report = self.logic.self_audit()
        blind_spot_texts = " ".join(report.blind_spots).lower()
        self.assertIn("permissive", blind_spot_texts)

if __name__ == "__main__":
    unittest.main()
