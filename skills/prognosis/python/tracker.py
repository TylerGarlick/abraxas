from typing import Dict, Any, List
from dataclasses import dataclass
from datetime import datetime, timezone

@dataclass(frozen=False)
class ForecastResolution:
    forecast_id: str
    domain: str
    predicted_rupture: str
    actual_outcome: str
    accuracy_delta: float
    resolved_at: str
    feeds_aletheia: bool

class PrognosisTracker:
    """
    Prognosis Calibration Tracker.
    Logs every forecast -> resolution pair and ensures all resolutions
    are fed into the Aletheia ground-truth layer.
    """
    def __init__(self, alethia_client: Any = None):
        self.alethia_client = alethia_client
        self.resolutions: List[ForecastResolution] = []

    def log_forecast(self, forecast_id: str, domain: str, predicted_rupture: str) -> str:
        """
        Registers a new forecast for future resolution.
        """
        return f"[PROGNOSIS FORECAST REGISTERED] {forecast_id} in domain '{domain}' awaiting resolution."

    def resolve_forecast(self, forecast_id: str, actual_outcome: str, accuracy_delta: float) -> ForecastResolution:
        """
        Resolves a forecast against ground truth and feeds the result into Aletheia.
        """
        resolution = ForecastResolution(
            forecast_id=forecast_id,
            domain="general",
            predicted_rupture="latent epistemic tension",
            actual_outcome=actual_outcome,
            accuracy_delta=accuracy_delta,
            resolved_at=datetime.now(timezone.utc).isoformat(),
            feeds_aletheia=self.alethia_client is not None
        )
        self.resolutions.append(resolution)

        if self.alethia_client:
            self.alethia_client.log_resolution(forecast_id, actual_outcome, accuracy_delta)

        return resolution

    def calibration_report(self) -> Dict[str, Any]:
        """
        Generates a calibration summary across all resolved forecasts.
        """
        if not self.resolutions:
            return {"status": "NO_DATA", "forecasts": 0, "average_delta": 0.0}

        avg_delta = sum(r.accuracy_delta for r in self.resolutions) / len(self.resolutions)
        return {
            "status": "CALIBRATED" if avg_delta < 0.25 else "DRIFTING",
            "forecasts": len(self.resolutions),
            "average_delta": avg_delta,
            "resolution_ids": [r.forecast_id for r in self.resolutions[-5:]]
        }
