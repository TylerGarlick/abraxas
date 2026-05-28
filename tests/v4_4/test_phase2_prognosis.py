import unittest
import datetime
from dataclasses import dataclass, field
from typing import List
from skills.prognosis.python.forecaster import PrognosisForecaster
from skills.prognosis.python.tracker import PrognosisTracker

class MockGraphClient:
    pass

class MockAlethiaClient:
    def log_resolution(self, *args):
        pass

class TestPhase2Prognosis(unittest.TestCase):
    def setUp(self):
        self.graph = MockGraphClient()
        self.alethia = MockAlethiaClient()
        self.forecaster = PrognosisForecaster(self.graph, self.alethia)
        self.tracker = PrognosisTracker(self.alethia)

    def test_rupture_forecast_structure(self):
        forecast = self.forecaster.forecast_rupture("ai-safety", ["truth-a", "truth-b"])
        self.assertTrue(len(forecast.id) > 0)
        self.assertEqual(forecast.domain, "ai-safety")
        self.assertGreaterEqual(len(forecast.grounded_in_truths), 2)
        self.assertIn("%", forecast.probability_interval)

    def test_forecast_grounding(self):
        forecast = self.forecaster.forecast_rupture("cybersecurity", ["t1", "t2"])
        self.assertGreaterEqual(len(forecast.grounded_in_truths), 2)

    def test_forecast_default_fallback(self):
        forecast = self.forecaster.forecast_rupture("unknown")
        self.assertGreaterEqual(len(forecast.grounded_in_truths), 2)

    def test_signal_anticipation_baseline(self):
        predictions = self.forecaster.signal_anticipate("geopolitics")
        self.assertGreaterEqual(len(predictions), 1)
        self.assertIn("confidence", predictions[0])

    def test_calibration_loop(self):
        score = self.forecaster.calibrate("rupture-01", "No actual collapse occurred.")
        self.assertTrue(score.calibrated)

    def test_tracker_resolution(self):
        resolution = self.tracker.resolve_forecast("f-1", "Accurate", 0.1)
        self.assertEqual(len(self.tracker.resolutions), 1)

    def test_calibration_report(self):
        self.tracker.resolve_forecast("f-1", "Ok", 0.1)
        report = self.tracker.calibration_report()
        self.assertEqual(report["forecasts"], 1)

if __name__ == "__main__":
    unittest.main()
