import asyncio
import unittest
from unittest.mock import AsyncMock, MagicMock

from infra.bridge.pipeline import SovereignBridge
from infra.bridge.sieve import SovereignSieve, Signal

class TestPhase2Intake(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.bridge = SovereignBridge()
        self.sieve = SovereignSieve()

    async def test_sieve_valence_logic(self):
        """Verify that high-valence signals pass and noise is blocked."""
        # High Valence: Novel + Urgent
        high_sig = Signal(
            source="test", 
            content="CRITICAL: Paradigm shift in AGI architecture observed. Unexpected results. Breaking news.", 
            timestamp="now", 
            metadata={"priority": "high"}
        )
        # Low Valence: Generic/Noise
        low_sig = Signal(
            source="test", 
            content="I think the weather is nice today.", 
            timestamp="now", 
            metadata={"priority": "low"}
        )

        self.assertTrue(self.sieve.is_high_valence(high_sig), "High-valence signal should pass.")
        self.assertFalse(self.sieve.is_high_valence(low_sig), "Low-valence signal should be blocked.")

    async def test_bridge_discovery_cycle(self):
        """Test the full polling and filtering cycle."""
        # Mock the dispatch to scribe to count successful ingestions
        self.bridge._dispatch_to_scribe = AsyncMock() 

        
        await self.bridge.run_discovery_cycle()
        
        # Based on simulated data: Moltbook signal is high-valence, Discord is low.
        self.assertEqual(self.bridge._dispatch_to_scribe.call_count, 1)
        
        # Verify the a lmost-certain content of the passed signal
        called_args = self.bridge._dispatch_to_scribe.call_args[0][0]
        self.assertIn("scaling laws are plateauing", called_args)

if __name__ == "__main__":
    unittest.main()
