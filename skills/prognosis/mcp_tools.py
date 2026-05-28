from typing import Any, Dict, List
from skills.prognosis.python.forecaster import PrognosisForecaster
from skills.prognosis.python.tracker import PrognosisTracker

# Shared state managed by the MCP server.
forecaster: PrognosisForecaster = None
tracker: PrognosisTracker = None

def initialize(mcp):
    global forecaster, tracker
    forecaster = PrognosisForecaster(mcp.graph_client, mcp.alethia_client)
    tracker = PrognosisTracker(mcp.alethia_client)

async def prognosis_forecast(mcp, args: Dict[str, Any]):
    """
    Produces a rupture forecast grounded in Hardened Truths.
    """
    domain = args.get("domain", "general")
    if not forecaster:
        initialize(mcp)

    forecast = forecaster.forecast_rupture(domain, args.get("truths", []))
    tracker.log_forecast(forecast.id, domain, forecast.predicted_rupture)

    output = f"[PROGNOSIS FORECAST: {forecast.id}]\n"
    output += f"Domain: {forecast.domain}\n"
    output += f"Predicted Rupture: {forecast.predicted_rupture}\n"
    output += f"Grounded in Truths: {', '.join(forecast.grounded_in_truths)}\n"
    output += f"Probability: {forecast.probability_interval}\n\n"
    output += "Reasoning Trace:\n"
    for i, step in enumerate(forecast.reasoning_trace, 1):
        output += f"{i}. {step}\n"

    return output

async def prognosis_signal_anticipate(mcp, args: Dict[str, Any]):
    """
    Returns ranked predictions of where high-valence signals will appear.
    """
    domain = args.get("domain", "general")
    if not forecaster:
        initialize(mcp)

    predictions = forecaster.signal_anticipate(domain)
    output = f"[PROGNOSIS SIGNAL ANTICIPATION: {domain}]\n\n"

    for i, pred in enumerate(predictions, 1):
        output += f"{i}. Source: {pred['predicted_source']}\n"
        output += f"   Reason: {pred['reason']}\n"
        output += f"   Confidence: {pred['confidence']}\n\n"

    return output

async def prognosis_calibrate(mcp, args: Dict[str, Any]):
    """
    Compares forecast against actual outcome and feeds into Aletheia.
    """
    forecast_id = args.get("forecast_id")
    outcome = args.get("outcome")
    if not forecast_id or not outcome:
        return "Error: forecast_id and outcome are required."

    if not forecaster:
        initialize(mcp)

    score = forecaster.calibrate(forecast_id, outcome)
    tracker.resolve_forecast(forecast_id, outcome, score.accuracy_delta)

    output = f"[PROGNOSIS CALIBRATION: {forecast_id}]\n"
    output += f"Outcome: {score.outcome}\n"
    output += f"Accuracy Delta: {score.accuracy_delta:.2f}\n"
    output += f"Status: {'CALIBRATED' if score.calibrated else 'NEEDS REFINEMENT'}\n"

    return output
