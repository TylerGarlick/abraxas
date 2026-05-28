from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.pheme.python.logic import PhemeLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Pheme tools to the Abraxas MCP server."""
    logic = PhemeLogic()

    @mcp.tool()
    def verify_claim(claim: str, sources: list) -> str:
        """Verifies claims against authoritative sources during generation."""
        result = logic.verify_claim(claim, sources)
        return str(result)

    @mcp.tool()
    def update_source_trust(source: str, weight: float, reason: str) -> str:
        """Updates the trust weight of an information source."""
        result = logic.update_source_trust(source, weight, reason)
        return str(result)
