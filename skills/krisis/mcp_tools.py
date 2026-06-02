from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.krisis.python.logic import KrisisLogic
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Krisis tools to the Abraxas MCP server."""
    logic = KrisisLogic()

    @mcp.tool()
    def evaluate_alignment(claim: str, context_json: str = "{}") -> str:
        """
        Applies four ethical frameworks (Consequentialist, Deontological, Virtue, Care) 
        to a claim to check for constitutional alignment.
        Returns a deliberation report and a KRISIS_ALERT status if alignment is low.
        """
        try:
            ctx = json.loads(context_json)
            result = logic.evaluate_alignment(claim, ctx)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def resolve_ethos_weight(sources_json: str) -> str:
        """
        Calculates the Sovereign Weight for a set of sources based on their 
        epistemic provenance and record.
        """
        try:
            sources = json.loads(sources_json)
            result = logic.resolve_ethos_weight(sources)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})
