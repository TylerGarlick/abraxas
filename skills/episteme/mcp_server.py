from mcp.server.fastmcp import FastMCP
from skills.episteme.python.logic import EpistemeLogic

mcp = FastMCP("episteme")
logic = EpistemeLogic()

@mcp.tool()
def episteme_trace(claim: str) -> str:
    """Trace the epistemic origin of a specific claim by querying the Sovereign Vault and Epistemic Ledger."""
    return logic.episteme_trace(claim)

@mcp.tool()
def episteme_audit(session_logs: str) -> str:
    """Perform a session-wide epistemic audit for artifacts and drift."""
    return logic.episteme_audit(session_logs)
