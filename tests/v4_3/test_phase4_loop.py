import asyncio
import unittest
from unittest.mock import AsyncMock
from infra.hunter.loop import HunterLoop, SovereignReport

class TestPhase4HunterLoop(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.mock_mcp = AsyncMock()
        self.hunter = HunterLoop(mcp_client=self.mock_mcp)

    async def test_full_loop_execution(self):
        """
        Test the full chain: Moltbook Signal -> Sieve -> Aporia -> Auto-Agon -> Sovereign Report.
        """
        # Mock the Auto-Agon tool for a successful promotion
        self.mock_mcp.call_tool.side_effect = lambda tool, args: (
            "Convergence rate: 85%\n[CLAIM SUPPORTED]" if tool == "agon_debate" else "OK"
        )

        report = await self.hunter.run_once()
        
        self.assertIsNotNone(report)
        self.assertIsInstance(report, SovereignReport)
        self.assertEqual(report.epistemic_status, "PROMOTED")
        self.assertTrue(report.convergence_rate >= 0.80)
        self.assertIn("Sovereign Report", report.to_markdown()) # Ensure markdown is generated

        print("\n✓ Phase 4 Hunter Loop Verified: Autonomous discovery chain is deterministic.")

if __name__ == "__main__":
    unittest.main()
