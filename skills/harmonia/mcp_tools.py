from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.harmonia.python.logic import HarmoniaLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Harmonia tools to the Abraxas MCP server."""
    logic = HarmoniaLogic()

    @mcp.tool()
    def compose_workflow(workflow_id: str, sequence: list) -> str:
        """Composes multiple Abraxas skills into unified workflows."""
        result = logic.compose_workflow(workflow_id, sequence)
        return str(result)

    @mcp.tool()
    def execute_sequence(workflow_id: str, inputs: dict) -> str:
        """Executes a composed sequence of skill invocations."""
        result = logic.execute_sequence(workflow_id, inputs)
        return str(result)

    @mcp.tool()
    def check_conflict(workflow_id: str) -> str:
        """Checks for state handoff conflicts in a DAG."""
        result = logic.check_conflict(workflow_id)
        return str(result)
