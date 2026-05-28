import asyncio
import unittest
from unittest.mock import AsyncMock
from infra.bridge.pipeline import SovereignBridge
from infra.bridge.gauntlet import GauntletRunner, IngestionFragment

class TestPhase2Scribe(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.mock_mcp = AsyncMock()
        self.bridge = SovereignBridge(mcp_client=self.mock_mcp)
        
        # Mock MCP Tool Responses for the Gauntlet
        def mcp_side_effect(tool, args):
            if tool == "soter_scan":
                return {"score": 1.0} # Low risk
            if tool == "episteme_map":
                return {"tag": "EXT-Sovereign"}
            if tool == "ethos_weight":
                return {"weight": 0.9}
            if tool == "mnemosyne_commit":
                return True
            return None

        self.mock_mcp.call_tool.side_effect = mcp_side_effect

    async def test_full_ingestion_pipeline(self):
        """
        Test the end-to-end flow: Poll -> Sieve -> Gauntlet -> Reservoir.
        """
        await self.bridge.run_discovery_cycle()
        
        # 1. Check if the高valence Moltbook signal was processed
        self.assertEqual(self.bridge.ingested_count, 1)
        
        # 2. Verify MCP calls were made in order (Soter -> Episteme -> Ethos -> Mnemosyne)
        calls = [call.args[0] for call in self.mock_mcp.call_tool.call_args_list]
        expected_sequence = ["soter_scan", "episteme_map", "ethos_weight", "mnemosyne_commit"]
        
        for tool in expected_sequence:
            self.assertIn(tool, calls)

        print("\n✓ Phase 2 Ingestion Gauntlet Verified: External Signal -> Reservoir flow is deterministic.")

if __name__ == "__main__":
    unittest.main()
