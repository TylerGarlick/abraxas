
import unittest
from unittest.mock import AsyncMock
from infra.api.core.cmea import CMEAArbitrator

class TestCMEAIntegration(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.mock_mcp = AsyncMock()
        self.arbitrator = CMEAArbitrator(self.mock_mcp)

    async def test_hallucination_detection(self):
        text = "The sky is blue. This is a hallucination."
        models = ["model_a", "model_b", "model_c"]
        
        results = await self.arbitrator.verify_response(text, models)
        
        # Claim 1: "The sky is blue." -> Truth
        # Claim 2: "This is a hallucination." -> model_a says False, others True (probably)
        
        # a-la-carte verification
        self.assertTrue(results[0]["confidence"] > 0)
        self.assertTrue(any(r["is_hallucination"] for r in results))

    async def test_consensus_logic(self):
        # Manually check arbitration
        from dataclasses import dataclass
        @dataclass
        class ModelResponse:
            model_name: str
            truth_value: bool
            confidence: float
            label: str
            
        responses = [
            ModelResponse("A", True, 0.9, "Empirical"),
            ModelResponse("B", True, 0.8, "Theoretical"),
            ModelResponse("C", False, 0.9, "Empirical"),
        ]
        
        consensus, conf, label = self.arbitrator.arbitrate(responses)
        self.assertTrue(consensus)
        self.assertAlmostEqual(conf, 0.866, places=2)
        self.assertEqual(label, "Empirical")

if __name__ == "__main__":
    unittest.main()
