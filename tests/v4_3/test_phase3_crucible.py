import asyncio
import unittest
from unittest.mock import AsyncMock
from skills.auto_agon.python.logic import AutoAgonLogic

class TestPhase3Crucible(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.mock_mcp = AsyncMock()
        self.logic = AutoAgonLogic(self.mock_mcp)

    async def test_truth_promotion_success(self):
        """Verify a claim with >80% convergence is promoted."""
        self.mock_mcp.call_tool.side_effect = lambda tool, args: (
            "Convergence rate: 85%\n[CLAIM SUPPORTED]" if tool == "agon_debate" else "OK"
        )
        
        result = await self.logic.trigger_stress_test("Testing is essential.")
        self.assertEqual(result["status"], "PROMOTED")
        self.assertEqual(result["convergence_rate"], 0.85)

    async def test_truth_promotion_failure(self):
        """Verify a claim with <80% convergence is contested."""
        self.mock_mcp.call_tool.side_effect = lambda tool, args: (
            "Convergence rate: 40%\n[CLAIM CONTESTED]" if tool == "agon_debate" else "OK"
        )
        
        result = await self.logic.trigger_stress_test("The moon is made of cheese.")
        self.assertEqual(result["status"], "CONTESTED")
        self.assertEqual(result["convergence_rate"], 0.40)

if __name__ == "__main__":
    unittest.main()
