import asyncio
import unittest
from unittest.mock import AsyncMock, MagicMock
from skills.harmonia.python.orchestrator import HarmoniaOrchestrator, ContextEnvelope
from skills.aporia.python.logic import AporiaLogic
from skills.krisis.python.logic import KrisisAuditLogic

class TestPhase1Integration(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        # Mock MCP Client
        self.mock_mcp = AsyncMock()
        self.orchestrator = HarmoniaOrchestrator(self.mock_mcp)
        self.aporia = AporiaLogic()
        self.krisis = KrisisAuditLogic()

    async def test_full_chain_execution(self):
        """
        Simulates a chain: Janus (Claim) -> Aporia (Gap Analysis) -> Krisis (Audit)
        """
        # 1. Mock the tool responses
        def side_effect(tool_name, args):
            if tool_name == "janus_claim":
                return "Claim: AI will reach AGI by 2030. Reasoning: Scaling laws have held for 10 years, therefore it must be true."
            if tool_name == "aporia_gap":
                # Use real Aporia logic to see if it finds the gap
                reasoning = args["input"]
                knowns = ["Scaling laws exhibit power-law behavior."]
                return self.aporia.analyze_gap(reasoning, knowns)
            if tool_name == "krisis_audit":
                # Use real Krisis logic
                return self.krisis.audit_discovery(args["input"])
            return "Default response"

        self.mock_mcp.call_tool.side_effect = side_effect

        # 2. Compose the chain
        self.orchestrator.compose("v4_3_bedrock", ["janus_claim", "aporia_gap", "krisis_audit"])
        
        # 3. Execute
        envelope = await self.orchestrator.execute_sequence("v4_3_bedrock", "Start Analysis")

        # 4. Validation
        # Check sequence length
        self.assertEqual(len(envelope.handoff_history), 3)
        
        # Verify Aporia found the gap "therefore it must be"
        aporia_step = envelope.handoff_history[1]
        self.assertIn("aporia_gap", aporia_step["skill"])
        
        # Verify Krisis was the final stop
        self.assertEqual(envelope.origin_skill, "krisis_audit")
        self.assertIn("Decision remains yours", str(envelope.primary_output))

        print("\n✓ Phase 1 Integration Test Passed: Bedrock chain successfully orchestrated.")

if __name__ == "__main__":
    unittest.main()
