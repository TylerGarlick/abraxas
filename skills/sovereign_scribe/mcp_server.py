from mcp.server.fastmcp import FastMCP
from skills.sovereign_scribe.python.logic import SovereignScribeLogic

mcp = FastMCP("sovereign-scribe")
logic = SovereignScribeLogic()

@mcp.tool()
def ingest_fragment(fragment: str, source: str) -> str:
    """Ingests a fragment of external data through the Sovereign Gauntlet (Soter -> Episteme -> Ethos -> Mnemosyne)."""
    result = logic.run_gauntlet(fragment, source)
    return str(result)
