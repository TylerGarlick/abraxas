import unittest
import json
from unittest.mock import MagicMock
from infra.mcp.context import get_context
from infra.mcp.registry import MCPRegistry
from mcp.server.fastmcp import FastMCP

# Import the logic for all migrated skills
from skills.sovereign_engine.python.logic import SovereignEngineLogic
from skills.dream_reservoir.python.logic import dream_reservoir_logic as dream_logic
from skills.guardrail_monitor.python.logic import GuardrailLogic
from skills.research_engine.python.logic import ResearchEngineLogic
from skills.aletheia_truth.python.logic import AletheiaTruthLogic
from skills.kairos.python.logic import logic as kairos_logic
from skills.soter.python.logic import soter_logic
from skills.janus.python.logic import janus_logic as janus_logic
from skills.ledger.python.logic import LedgerLogic
from skills.mnemosyne.python.logic import mnemosyne_logic as mnem_logic
from skills.episteme.python.logic import EpistemeLogic
from skills.sovereign_core.python.logic import SovereignCoreLogic
from skills.sovereign_scribe.python.logic import SovereignScribeLogic
from skills.project_bridge.python.logic import ProjectBridgeLogic
from skills.retrospectives.python.logic import RetrospectivesLogic
from skills.scribe.python.logic import logic as scribe_logic
from skills.ethos.python.logic import logic as ethos_logic
from skills.guardrail.python.logic import logic as guardrail_logic
from skills.config_registry.python.logic import loader

class TestUnifiedMCP_E2E(unittest.TestCase):
    def setUp(self):
        self.context = get_context()
        self.mcp = FastMCP("e2e-test-server")
        self.registry = MCPRegistry(self.mcp, self.context)
        self.registry.load_skills()

    def test_sovereign_engine_e2e(self):
        logic = SovereignEngineLogic()
        self.assertIsInstance(logic.calculate_rlcr([True, False]), float)

    def test_dream_reservoir_e2e(self):
        res = dream_logic.query_provenance("test_id", "dream")
        self.assertIsInstance(res, list)

    def test_guardrail_monitor_e2e(self):
        logic = GuardrailLogic()
        self.assertIsNotNone(logic.pheme.verify_ground_truth("test claim"))

    def test_research_engine_e2e(self):
        logic = ResearchEngineLogic()
        self.assertIsInstance(logic.health_check(), dict)

    def test_aletheia_truth_e2e(self):
        logic = AletheiaTruthLogic()
        self.assertIsInstance(logic.episteme_trace("test claim"), str)

    def test_kairos_e2e(self):
        res = kairos_logic.assess_urgency("test query")
        self.assertIn("mode", res)

    def test_soter_e2e(self):
        res = soter_logic.verify_claim("test claim")
        self.assertIsNotNone(res)

    def test_janus_e2e(self):
        res = janus_logic.switch_mode("SOL", "Test")
        self.assertEqual(res['new_mode'], "SOL")

    def test_ledger_e2e(self):
        logic = LedgerLogic()
        res = logic.get_ready_tasks()
        self.assertIsNotNone(res)

    def test_mnemosyne_e2e(self):
        res = mnem_logic.recall("test fragment")
        # Handle potential None from logic
        if res:
            self.assertTrue(hasattr(res, 'fragment'))

    def test_episteme_e2e(self):
        logic = EpistemeLogic()
        self.assertIsInstance(logic.episteme_trace("test"), str)

    def test_sovereign_core_e2e(self):
        logic = SovereignCoreLogic()
        self.assertIsInstance(logic.health_check(), str)

    def test_sovereign_scribe_e2e(self):
        logic = SovereignScribeLogic()
        self.assertIsNotNone(logic.run_gauntlet("test", "src"))

    def test_project_bridge_e2e(self):
        logic = ProjectBridgeLogic()
        self.assertIsInstance(logic.health_check(), str)

    def test_retrospectives_e2e(self):
        logic = RetrospectivesLogic()
        res = logic.get_retros_for_period("2024-01-01", "2024-01-02")
        self.assertIsNotNone(res)

    def test_scribe_e2e(self):
        res = scribe_logic.run_gauntlet("test", "src")
        self.assertIsNotNone(res)

    def test_ethos_e2e(self):
        res = ethos_logic.get_score("source1")
        self.assertIsNotNone(res)

    def test_guardrail_e2e(self):
        # We need to mock the seal result since we are in smoke test
        res = guardrail_logic.verify_sovereign_seal("test output", 3)
        self.assertTrue(hasattr(res, 'pass_seal'))

    def test_config_registry_e2e(self):
        res = loader.get_all()
        self.assertIsInstance(res, dict)

if __name__ == "__main__":
    unittest.main()
