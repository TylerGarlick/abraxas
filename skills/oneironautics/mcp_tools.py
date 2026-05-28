from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.oneironautics.python.logic import OneironauticsLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Oneironautics tools to the Abraxas MCP server."""
    logic = OneironauticsLogic()

    @mcp.tool()
    def log_dream(dream_text: str, tags: list = None) -> str:
        """Logs a dream entry into the sovereign record."""
        result = logic.log_dream(dream_text, tags)
        return str(result)

    @mcp.tool()
    def witness_symbol(symbol: str, valence: str, manifestation: str) -> str:
        """Witnesses a symbol and its quality for integration."""
        result = logic.witness_symbol(symbol, valence, manifestation)
        return str(result)

    @mcp.tool()
    def update_shadow_ledger(quality: str, insight: str) -> str:
        """Updates the shadow ledger with integrated insights."""
        result = logic.update_shadow_ledger(quality, insight)
        return str(result)
