from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.plan.python.logic import PlanLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Plan tools to the Abraxas MCP server."""
    logic = PlanLogic()

    @mcp.tool()
    def start_clarity_session(query: str) -> str:
        """Converts vague requests into actionable specs via high-leverage questioning."""
        result = logic.start_clarity_session(query)
        return str(result)

    @mcp.tool()
    def extract_unknowns(session_id: str) -> str:
        """Extracts unknowns (Goal, Audience, Format, Success, Timeline, Data)."""
        result = logic.extract_unknowns(session_id)
        return str(result)

    @mcp.tool()
    def export_map(session_id: str) -> str:
        """Exports the final clarity map for implementation."""
        result = logic.export_map(session_id)
        return str(result)
