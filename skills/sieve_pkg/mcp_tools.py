from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from .python.logic import SieveLogic
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Sieve tools to the Abraxas MCP server."""
    logic = SieveLogic()

    @mcp.tool()
    def analyze_signal(raw_input: str) -> str:
        """
        Evaluates a raw data signal for high-valence anomalies using a gremlin signature.
        Returns a valence score and an admission decision for the Sovereign Ledger.
        """
        try:
            result = logic.analyze_signal(raw_input)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def curate_stream(signals_json: str) -> str:
        """
        Filters a stream of signals, identifying high-valence events while stripping noise.
        Input: JSON list of strings.
        """
        try:
            signals = json.loads(signals_json)
            result = logic.curate_stream(signals)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})


    @mcp.tool()
    def curate_stream(signals_json: str) -> str:
        """
        Filters a stream of signals, identifying high-valence events while stripping noise.
        Input: JSON list of strings.
        """
        try:
            signals = json.loads(signals_json)
            result = logic.curate_stream(signals)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})
