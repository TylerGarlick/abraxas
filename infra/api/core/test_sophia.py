
import unittest
from unittest.mock import AsyncMock
from infra.api.core.sophia import SophiaRouter
from infra.api.core.flow import SovereignFlow

class TestSophiaIntegration(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.router = SophiaRouter()
        self.mock_mcp = AsyncMock()
        self.flow = SovereignFlow(self.mock_mcp)

    async def test_verification_route(self):
        query = "Is the Sovereign Brain deterministic?"
        workflow = self.router.route_intent(query)
        
        # Expect: ["sieve", "soter", "janus", "scribe"]
        self.assertEqual(workflow[0], "sieve")
        
        # Execute flow starting with the routed tool
        self.mock_mcp.call_tool.side_effect = [
            {"res": "ok"}, {"risk_score": 1}, {"res": "ok"}, {"res": "ok"}
        ]
        result = await self.flow.execute_pipeline(query, initial_tool=workflow[0])
        self.assertEqual(result["status"], "SUCCESS")

    async def test_audit_route(self):
        query = "Audit this document for consistency"
        workflow = self.router.route_intent(query)
        
        # Expect: ["omniscient_auditor"]
        self.assertEqual(workflow[0], "omniscient_auditor")
        
        self.mock_mcp.call_tool.return_value = {"res": "audit_complete"}
        result = await self.flow.execute_pipeline(query, initial_tool=workflow[0])
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["log"][0]["tool"], "omniscient_auditor")

if __name__ == "__main__":
    unittest.main()
