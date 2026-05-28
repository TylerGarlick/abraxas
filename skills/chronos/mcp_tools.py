from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.chronos.python.logic import ChronosLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Chronos tools to the Abraxas MCP server."""
    logic = ChronosLogic()

    @mcp.tool()
    def index_claim(claim_id: str, timestamp: str, sequence: int) -> str:
        """Indexes a claim within the sovereign timeline."""
        result = logic.index_claim(claim_id, timestamp, sequence)
        return str(result)

    @mcp.tool()
    def detect_drift(claim_id: str, expected_state: str) -> str:
        """Detects temporal drift between claimed and actual states."""
        result = logic.detect_drift(claim_id, expected_state)
        return str(result)

    @mcp.tool()
    def resolve_conflict(conflict_id: str, resolution_strategy: str) -> str:
        """Resolves a temporal conflict between contradictory claims."""
        result = logic.resolve_conflict(conflict_id, resolution_strategy)
        return str(result)
