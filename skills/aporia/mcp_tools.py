from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.aporia.python.logic import AporiaLogic
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Aporia tools to the Abraxas MCP server."""
    logic = AporiaLogic()

    @mcp.tool()
    def map_epistemic_void(logic_chain_json: str) -> str:
        """
        Analyzes a reasoning trace to flag 'Probabilistic Leaps' (voids) 
        where confidence is low or grounding is missing.
        Input: JSON list of steps: [{"id": "s1", "confidence": 0.4, "type": "inference"}]
        """
        try:
            logic_chain = json.loads(logic_chain_json)
            result = logic.map_epistemic_void(logic_chain)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def resolve_void(void_id: str, evidence_id: str) -> str:
        """
        Binds an identified void to a verified evidence fragment, effectively closing the gap.
        """
        try:
            result = logic.resolve_void(void_id, evidence_id)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})
