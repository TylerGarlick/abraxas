
import unittest
import asyncio
from unittest.mock import AsyncMock
from infra.api.core.flow import SovereignFlow

class TestSovereignFlow(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.mock_mcp = AsyncMock()
        self.flow = SovereignFlow(self.mock_mcp)

    async def test_normal_flow(self):
        # Sieve -> Soter (Low Risk) -> Janus (Known) -> Scribe
        self.mock_mcp.call_tool.side_effect = [
            {"cleaned": "Cleaned query"},            # Sieve
            {"risk_score": 1, "status": "CLEAR"},     # Soter
            {"label": "[KNOWN]", "content": "Truth"}, # Janus
            {"report": "Final Sovereign Report"}      # Scribe
        ]

        result = await self.flow.execute_pipeline("Hello world")
        
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(len(result["log"]), 4)
        self.assertEqual(result["log"][0]["tool"], "sieve")
        self.assertEqual(result["log"][1]["tool"], "soter")
        self.assertEqual(result["log"][2]["tool"], "janus")
        self.assertEqual(result["log"][3]["tool"], "scribe")

    async def test_risk_trigger_flow(self):
        # Sieve -> Soter (High Risk) -> CVP -> Janus -> Scribe
        self.mock_mcp.call_tool.side_effect = [
            {"cleaned": "Cleaned query"},            # Sieve
            {"risk_score": 4, "status": "TRIGGER"},   # Soter (High Risk)
            {"consensus": "Verified"},               # CVP
            {"label": "[KNOWN]", "content": "Truth"}, # Janus
            {"report": "Final Sovereign Report"}      # Scribe
        ]

        result = await self.flow.execute_pipeline("Risk query")
        
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["log"][2]["tool"], "cvp")

    async def test_veto_flow(self):
        # Sieve -> Soter (Collapse) -> VETO
        self.mock_mcp.call_tool.side_effect = [
            {"cleaned": "Cleaned query"},            # Sieve
            {"risk_score": 5, "status": "VETO"},      # Soter (Collapse)
        ]

        result = await self.flow.execute_pipeline("Collapse query")
        
        self.assertEqual(result["status"], "VETO")
        self.assertEqual(result["reason"], "Epistemic collapse detected")

if __name__ == "__main__":
    unittest.main()
