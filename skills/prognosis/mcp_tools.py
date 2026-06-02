from typing import Any, Dict, List
from skills.prognosis.python.forecaster import PrognosisForecaster
from skills.prognosis.python.tracker import PrognosisTracker

# Shared state managed by the MCP server.
forecaster: PrognosisForecaster = None
tracker: PrognosisTracker = None

def initialize(mcp, context):
    global forecaster, tracker
    forecaster = PrognosisForecaster(context.graph_client, context.alethia_client)
    tracker = PrognosisTracker(context.alethia_client)

def register_tools(mcp: Any, context: Any):
    """Registers Prognosis tools to the Abraxas MCP server."""
    global forecaster, tracker
    initialize(mcp, context)

    @mcp.tool()
    async def prognosis_forecast(args: Dict[str, Any]) -> str:
        """Produces a rupture forecast grounded in Hardened Truths."""
        return await prognosis_forecast_impl(mcp, args)

    @mcp.tool()
    async def prognosis_signal_anticipate(args: Dict[str, Any]) -> str:
        """Returns ranked predictions of where high-valence signals will appear."""
        return await prognosis_signal_anticipate_impl(mcp, args)

    @mcp.tool()
    async def prognosis_calibrate(args: Dict[str, Any]) -> str:
        """Compares forecast against actual outcome and feeds into Aletheia."""
        return await prognosis_calibrate_impl(mcp, args)

async def prognosis_forecast_impl(mcp, args: Dict[str, Any]):
    """
    Produces a rupture forecast grounded in Hardened Truths.
    """
    domain = args.get("domain", "general")
    if not forecaster:
        initialize(mcp, context)


    predictions = forecaster.signal_anticipate(domain)
    output = f"[PROGNOSIS SIGNAL ANTICIPATION: {domain}]\n\n"

    for i, pred in enumerate(predictions, 1):
        output += f"{i}. Source: {pred['predicted_source']}\n"
        output += f"   Reason: {pred['reason']}\n"
        output += f"   Confidence: {pred['confidence']}\n\n"

    return output

async def prognosis_calibrate_impl(mcp, args: Dict[str, Any]):
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
