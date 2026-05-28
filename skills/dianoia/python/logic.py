from typing import Dict, Any, Optional
import datetime

class DianoiaLogic:
    def __init__(self):
        self.calibration_data = []

    def quantify_uncertainty(self, claim: str, confidence_interval: float) -> Dict[str, Any]:
        """Extends [UNCERTAIN] to calibrated probability distributions."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        return {
            "success": True,
            "timestamp": now,
            "action": "quantify_uncertainty",
            "claim": claim,
            "distribution": "Normal",
            "interval": confidence_interval
        }

    def calculate_brier_score(self, forecast: float, outcome: bool) -> Dict[str, Any]:
        """Calculates a Brier score to evaluate the accuracy of probabilistic forecasts."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        score = (forecast - (1 if outcome else 0))**2
        return {
            "success": True,
            "timestamp": now,
            "action": "calculate_brier_score",
            "score": score,
            "grade": "A" if score < 0.25 else "B"
        }
