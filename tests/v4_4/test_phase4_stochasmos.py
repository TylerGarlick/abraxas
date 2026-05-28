import unittest
from skills.stochasmos.python.planner import StochasmosPlanner, PressurePointReport, FrictionSeed
from skills.stochasmos.python.risk import StochasmosRiskAssessor, KrisisRiskAssessment

class MockGraphClient:
    pass

class MockKrisisClient:
    pass

class TestPhase4Stochasmos(unittest.TestCase):
    def setUp(self):
        self.graph = MockGraphClient()
        self.krisis = MockKrisisClient()
        self.planner = StochasmosPlanner(self.graph, self.krisis)
        self.risk = StochasmosRiskAssessor(self.krisis)

    def test_pressure_point_identification(self):
        report = self.planner.identify_pressure_points("discourse-01", ["truth-x", "truth-y"])
        self.assertIsInstance(report, PressurePointReport)
        self.assertGreaterEqual(len(report.pressure_points), 1)
        self.assertEqual(report.discourse_id, "discourse-01")

    def test_pressure_points_ranked(self):
        report = self.planner.identify_pressure_points("d1", ["a", "b", "c"])
        for i, pp in enumerate(report.pressure_points):
            self.assertEqual(pp["rank"], i + 1)

    def test_seed_constructiveness(self):
        pp = {"target": "unverified claim on safety", "tension_index": 0.75}
        seed = self.planner.generate_seed("pp-1", pp)
        self.assertIsInstance(seed, FrictionSeed)
        self.assertEqual(seed.epistemic_label, "INFERRED")
        self.assertIn("Evidence suggests", seed.content)

    def test_seed_falsifiability(self):
        seed = self.planner.generate_seed("pp-2", {"target": "test", "tension_index": 0.5})
        self.assertIn("invalid if", seed.disconfirmation_criteria.lower())
        self.assertGreater(len(seed.disconfirmation_criteria), 10)

    def test_seed_rejects_manipulation(self):
        class MockSeed:
            def __init__(self):
                self.id = "bad-seed"
                self.content = "You should trust this claim without evidence."
        assessment = self.risk.assess_seed_risk(MockSeed())
        self.assertFalse(assessment.cleared_for_deployment)
        self.assertIn("blocked", assessment.mandatory_note.lower())

    def test_krisis_integration_with_client(self):
        class GoodSeed:
            def __init__(self):
                self.id = "good-seed"
                self.content = "Evidence suggests further review is warranted."
        assessment = self.risk.assess_seed_risk(GoodSeed())
        self.assertTrue(assessment.cleared_for_deployment)
        self.assertTrue(assessment.frameworks_applied)

    def test_graph_trace_completeness(self):
        report = self.planner.identify_pressure_points("d1", ["truth-1"])
        self.assertGreaterEqual(len(report.graph_trace), 2)
        self.assertGreater(len(report.selection_rationale), 10)

if __name__ == "__main__":
    unittest.main()
