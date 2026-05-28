import unittest
from skills.oneironautics.python.logic import OneironauticsLogic
from skills.cvp.python.logic import CVPLogic
from skills.pheme.python.logic import PhemeLogic
from skills.dianoia.python.logic import DianoiaLogic
from skills.mnemon.python.logic import MnemonLogic
from skills.prometheus.python.logic import PrometheusLogic
from skills.chronos.python.logic import ChronosLogic
from skills.harmonia.python.logic import HarmoniaLogic
from skills.hermes.python.logic import HermesLogic
from skills.plan.python.logic import PlanLogic

class TestAspirationalSystems(unittest.TestCase):
    def setUp(self):
        self.oneironautics = OneironauticsLogic()
        self.cvp = CVPLogic()
        self.pheme = PhemeLogic()
        self.dianoia = DianoiaLogic()
        self.mnemon = MnemonLogic()
        self.prometheus = PrometheusLogic()
        self.chronos = ChronosLogic()
        self.harmonia = HarmoniaLogic()
        self.hermes = HermesLogic()
        self.plan = PlanLogic()

    def test_oneironautics(self):
        res = self.oneironautics.log_dream("A flying city", ["surreal"])
        self.assertTrue(res["success"])
        res = self.oneironautics.witness_symbol("Golden Key", "positive", "doorway")
        self.assertTrue(res["success"])
        res = self.oneironautics.update_shadow_ledger("Fear", "Acceptance of loss")
        self.assertTrue(res["success"])

    def test_cvp(self):
        res = self.cvp.resolve_consensus(["A", "A", "B"], threshold=2)
        self.assertEqual(res["result"], "CONSENSUS")
        res = self.cvp.log_sovereign_gap("Hallucination in Sol mode", "High")
        self.assertTrue(res["success"])

    def test_pheme(self):
        res = self.pheme.verify_claim("Earth is round", ["Source A"])
        self.assertEqual(res["status"], "VERIFIED")
        res = self.pheme.update_source_trust("Source A", 0.9, "Consistent record")
        self.assertTrue(res["success"])

    def test_dianoia(self):
        res = self.dianoia.quantify_uncertainty("Quantum state", 0.05)
        self.assertTrue(res["success"])
        res = self.dianoia.calculate_brier_score(0.8, True)
        self.assertLess(res["score"], 0.25)

    def test_mnemon(self):
        res = self.mnemon.record_belief("Sovereign identity", 0.99, "Analytical")
        self.assertTrue(res["success"])
        b_id = res["timestamp"] # using timestamp as ID based on logic.py
        res = self.mnemon.track_revision(b_id, 0.95, "Slight drift")
        self.assertTrue(res["success"])

    def test_prometheus(self):
        res = self.prometheus.get_profile("user-1")
        self.assertTrue(res["success"])
        res = self.prometheus.set_preference("detail", "high", 1.0)
        self.assertTrue(res["success"])
        res = self.prometheus.record_signal("explicit", "Prefer brevity")
        self.assertTrue(res["success"])

    def test_chronos(self):
        res = self.chronos.index_claim("claim-1", "2026-05-15T00:00Z", 1)
        self.assertTrue(res["success"])
        res = self.chronos.detect_drift("claim-1", "State A")
        self.assertTrue(res["success"])

    def test_harmonia(self):
        res = self.harmonia.compose_workflow("test-wf", ["Soter", "Janus"])
        self.assertTrue(res["success"])
        res = self.harmonia.check_conflict("test-wf")
        self.assertTrue(res["success"])

    def test_hermes(self):
        res = self.hermes.add_agent_position("agent-x", "True", 0.8)
        self.assertTrue(res["success"])
        res = self.hermes.compute_consensus("claim-z")
        self.assertEqual(res["consensus"], "Strong")

    def test_plan(self):
        res = self.plan.start_clarity_session("Build a bridge")
        self.assertTrue(res["success"])
        s_id = res["session_id"]
        res = self.plan.extract_unknowns(s_id)
        self.assertTrue(res["success"])
        res = self.plan.export_map(s_id)
        self.assertTrue(res["success"])

if __name__ == "__main__":
    unittest.main()
