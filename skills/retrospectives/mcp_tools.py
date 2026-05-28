from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.retrospectives.python.logic import RetrospectivesLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Retrospectives tools to the Abraxas MCP server."""
    logic = RetrospectivesLogic()
    logic.set_context(context)

    @mcp.tool()
    def save_retro(date: str, retro_type: str, retro_id: str, content: dict) -> str:
        """Save a retrospective assessment. Date must be YYYY-MM-DD. Type: task, day, or week."""
        return logic.save_retro(date, retro_type, retro_id, content)

    @mcp.tool()
    def get_retros_for_period(start_date: str, end_date: str) -> str:
        """Retrieve all retrospectives between two dates (YYYY-MM-DD)."""
        result = logic.get_retros_for_period(start_date, end_date)
        return json.dumps(result, indent=2)

    @mcp.tool()
    def create_ledger_task(description: str, priority: str, source_retro_id: str) -> str:
        """Create a task in the retrospective ledger based on a retro finding."""
        return logic.create_ledger_task(description, priority, source_retro_id)
