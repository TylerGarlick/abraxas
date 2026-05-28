import asyncio
import unittest
from unittest.mock import AsyncMock
from infra.bridge.sieve import SovereignSieve, Signal, SignalPrediction

class TestSieveV2(unittest.TestCase):
    def setUp(self):
        self.sieve = SovereignSieve()

    def test_signal_prediction_returns_empty_without_graph(self):
        predictions = self.sieve.predict_next("test-domain")
        self.assertEqual(predictions, [])

    def test_signal_prediction_with_graph_client(self):
        class StubGraphClient:
            pass
        sieve = SovereignSieve(graph_client=StubGraphClient())
        predictions = sieve.predict_next("test-domain")
        self.assertIsInstance(predictions, list)
        if predictions:
            self.assertIsInstance(predictions[0], SignalPrediction)
            self.assertIsInstance(predictions[0].grounded_in_truths, list)
            self.assertGreaterEqual(predictions[0].confidence_interval, 0.0)

    def test_signal_dataclass(self):
        signal = Signal(
            source="test",
            content="anomaly detected",
            timestamp="2026-05-12T00:00:00Z",
            metadata={"priority": "high"}
        )
        valence = self.sieve.calculate_valence(signal)
        self.assertGreater(valence, 0.3)

    def test_is_high_valence(self):
        signal = Signal(
            source="test",
            content="anomaly paradigm shift unexpectedly breaking",
            timestamp="2026-05-12T00:00:00Z",
            metadata={"priority": "high"}
        )
        self.assertTrue(self.sieve.is_high_valence(signal))

    def test_strip_noise(self):
        result = self.sieve.strip_noise("http://example.com\nReal content\n---\nMore content\n***divider***")
        self.assertNotIn("http://", result)
        self.assertIn("Real content", result)
        self.assertIn("More content", result)

if __name__ == "__main__":
    unittest.main()
