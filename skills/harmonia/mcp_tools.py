from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.harmonia.python.logic import HarmoniaLogic
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Harmonia tools to the Abraxas MCP server."""
    logic = HarmoniaLogic()

    @mcp.tool()
    def compose_workflow(workflow_id: str, sequence_json: str) -> str:
        """
        Composes multiple Abraxas skills into unified workflows.
        Input 'sequence_json' should be a JSON list of step objects:
        [{"id": "s1", "skill": "logos", "tool": "map", "depends_on": null}, ...]
        """
        try:
            sequence = json.loads(sequence_json)
            result = logic.compose_workflow(workflow_id, sequence)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def execute_sequence(workflow_id: str, inputs_json: str) -> str:
        """
        Executes a composed sequence of skill invocations.
        Input 'inputs_json' is a JSON object of initial state values.
        """
        try:
            inputs = json.loads(inputs_json)
            result = logic.execute_sequence(workflow_id, inputs)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)})

    @mcp.tool()
    def check_conflict(workflow_id: str) -> str:
        """
        Checks for state handoff conflicts in a DAG.
        Verifies if every step's dependencies are produced by preceding steps.
        """
        result = logic.check_conflict(workflow_id)
        return json.dumps(result, indent=2)

