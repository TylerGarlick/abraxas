from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.prognosis.python.forecaster import PrognosisForecaster
from skills.prognosis.python.tracker import PrognosisTracker
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Prognosis tools to the Abraxas MCP server."""
    # Use a singleton or server-stored state
    # For this implementation, we attach to the mcp object for longevity
    if not hasattr(mcp, 'prognosis_forecaster'):
        mcp.prognosis_forecaster = PrognosisForecaster(getattr(mcp, 'graph_client', None), getattr(mcp, 'alethia_client', None))
    if not hasattr(mcp, 'prognosis_tracker'):
        mcp.prognosis_tracker = PrognosisTracker(getattr(mcp, 'alethia_client', None))

    @mcp.tool()
    def prognosis_forecast(domain: str, hard_truths_json: str = "[]") -> str:
        """
        Produces a rupture forecast grounded in Hardened Truths.
        Input: domain (string) and hard_truths (JSON list of IDs).
        """
        try:
            hard_truths = json.loads(hard_truths_json)
            forecaster = mcp.prognosis_forecaster
            forecast = forecaster.forecast_rupture(domain, hard_truths)
            
            output = f"[PROGNOSIS RUPTURE FORECAST: {domain}]\n"
            output += f"Forecast ID: {forecast.id}\n"
            output += f"Prediction: {forecast.predicted_rupture}\n"
            output += f"Grounding: {', '.join(forecast.grounded_in_truths)}\n"
            output += f"Probability Interval: {forecast.probability_interval}\n\n"
            output += "Reasoning Trace:\n"
            for i, step in enumerate(forecast.reasoning_trace, 1):
                output += f"{i}. {step}\n"
            return output
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def prognosis_signal_anticipate(domain: str) -> str:
        """
        Returns ranked predictions of where high-valence signals will appear.
        """
        try:
            forecaster = mcp.prognosis_forecaster
            predictions = forecaster.signal_anticipate(domain)
            
            output = f"[PROGNOSIS SIGNAL ANTICIPATION: {domain}]\n\n"
            for i, pred in enumerate(predictions, 1):
                output += f"{i}. Source: {pred['predicted_source']}\n"
                output += f"   Reason: {pred['reason']}\n"
                output += f"   Confidence: {pred['confidence']}\n\n"
            return output
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def prognosis_calibrate(forecast_id: str, outcome: str) -> str:
        """
        Compares a forecast against actual outcome and feeds into Aletheia.
        """
        try:
            forecaster = mcp.prognosis_forecaster
            tracker = mcp.prognosis_tracker
            
            score = forecaster.calibrate(forecast_id, outcome)
            tracker.resolve_forecast(forecast_id, outcome, score.accuracy_delta)
            
            output = f"[PROGNOSIS CALIBRATION: {forecast_id}]\n"
            output += f"Outcome: {score.outcome}\n"
            output += f"Accuracy Delta: {score.accuracy_delta:.2f}\n"
            output += f"Status: {'CALIBRATED' if score.calibrated else 'NEEDS REFINEMENT'}\n"
            return output
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})
