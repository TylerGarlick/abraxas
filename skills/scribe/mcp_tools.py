from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.scribe.python.logic import logic
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Scribe tools to the Abraxas MCP server."""
    
    @mcp.tool()
    def ingest_fragment(fragment: str, source: str) -> str:
        """
        Ingests a fragment of external data through the Sovereign Gauntlet.
        """
        result = logic.run_gauntlet(fragment, source)
        return json.dumps(result, indent=2)
