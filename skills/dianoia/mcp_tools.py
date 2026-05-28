from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.dianoia.python.logic import DianoiaLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Dianoia tools to the Abraxas MCP server."""
    logic = DianoiaLogic()

    @mcp.tool()
    def quantify_uncertainty(claim: str, confidence_interval: float) -> str:
        """Extends [UNCERTAIN] to calibrated probability distributions."""
        result = logic.quantify_uncertainty(claim, confidence_interval)
        return str(result)

    @mcp.tool()
    def calculate_brier_score(forecast: float, outcome: bool) -> str:
        """Calculates a Brier score to evaluate the accuracy of probabilistic forecasts."""
        result = logic.calculate_brier_score(forecast, outcome)
        return str(result)
