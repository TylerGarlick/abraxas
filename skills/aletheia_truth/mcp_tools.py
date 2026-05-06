from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.aletheia_truth.python.logic import AletheiaTruthLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Aletheia Truth tools to the Abraxas MCP server."""
    logic = AletheiaTruthLogic()

    @mcp.tool()
    def episteme_trace(claim: str, context: str = None) -> str:
        """Trace the epistemic origin of a specific claim."""
        return logic.episteme_trace(claim, context)

    @mcp.tool()
    def episteme_audit(session_logs: str) -> str:
        """Perform a session-wide epistemic audit for artifacts and drift."""
        return logic.episteme_audit(session_logs)
