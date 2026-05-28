from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.sovereign_scribe.python.logic import SovereignScribeLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Sovereign Scribe tools to the Abraxas MCP server."""
    logic = SovereignScribeLogic()

    @mcp.tool()
    def ingest_fragment(fragment: str, source: str) -> str:
        """Ingests a fragment of external data through the Sovereign Gauntlet (Soter -> Episteme -> Ethos -> Mnemosyne)."""
        result = logic.run_gauntlet(fragment, source)
        return str(result)
