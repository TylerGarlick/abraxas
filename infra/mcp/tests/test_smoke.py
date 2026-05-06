import unittest
import json
from unittest.mock import MagicMock
from infra.mcp.context import get_context
from infra.mcp.registry import MCPRegistry
from mcp.server.fastmcp import FastMCP

# Import the logic directly to test the tool-to-logic path
from skills.sovereign_engine.python.logic import SovereignEngineLogic
from skills.dream_reservoir.python.logic import dream_reservoir_logic as dream_logic
from skills.guardrail_monitor.python.logic import GuardrailLogic
from skills.research_engine.python.logic import ResearchEngineLogic
from skills.aletheia_truth.python.logic import AletheiaTruthLogic

class TestMCPSmoke(unittest.TestCase):
    def setUp(self):
        self.context = get_context()
        # We use mocks for the MCP server since we only care about the logic execution
        self.mcp_mock = MagicMock(spec=FastMCP)

    def test_sovereign_engine_execution(self):
        """Verify Sovereign Engine logic via its tool path."""
        logic = SovereignEngineLogic()
        result = logic.calculate_rlcr([True, False, True])
        self.assertIsInstance(result, float) # Logic returns float, tool converts to str

    def test_dream_reservoir_execution(self):
        """Verify Dream Reservoir logic via its tool path."""
        # the logic.py uses a singleton 'dream_reservoir_logic'
        result = dream_logic.query_provenance("entity_123", "dream")
        self.assertIsInstance(result, list)

    def test_guardrail_monitor_execution(self):
        """Verify Guardrail Monitor logic via its tool path."""
        logic = GuardrailLogic()
        # Testing an internal component of GuardrailLogic
        result = logic.pheme.verify_ground_truth("The sky is blue", sources=["s1", "s2"])
        self.assertIsNotNone(result)

    def test_research_engine_execution(self):
        """Verify Research Engine logic via its tool path."""
        logic = ResearchEngineLogic()
        result = logic.health_check(verbose=True)
        self.assertIsInstance(result, str)

    def test_aletheia_truth_execution(self):
        """Verify Aletheia Truth logic via its tool path."""
        logic = AletheiaTruthLogic()
        result = logic.episteme_trace("Some claim")
        self.assertIsInstance(result, str)

if __name__ == "__main__":
    unittest.main()
