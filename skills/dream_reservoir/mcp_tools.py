from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.dream_reservoir.python.logic import dream_reservoir_logic as logic
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Dream Reservoir tools to the Abraxas MCP server."""
    
    @mcp.tool()
    def query_provenance(entity_id: str, entity_type: str) -> str:
        """
        Retrieve provenance chain from the ArangoDB reservoir.
        """
        results = logic.query_provenance(entity_id, entity_type)
        return json.dumps(results, indent=2)
