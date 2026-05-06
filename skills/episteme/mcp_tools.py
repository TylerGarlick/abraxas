from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.episteme.python.logic import EpistemeLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Episteme tools to the Abraxas MCP server."""
    logic = EpistemeLogic()

    @mcp.tool()
    def episteme_trace(claim: str) -> str:
        """Trace the epistemic origin of a specific claim by querying the Sovereign Vault and Epistemic Ledger."""
        return logic.episteme_trace(claim)

    @mcp.tool()
    def episteme_audit(session_logs: str) -> str:
        """Perform a session-wide epistemic audit for artifacts and drift."""
        return logic.episteme_audit(session_logs)
