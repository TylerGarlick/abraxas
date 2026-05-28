from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.mnemon.python.logic import MnemonLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Mnemon tools to the Abraxas MCP server."""
    logic = MnemonLogic()

    @mcp.tool()
    def record_belief(claim: str, confidence: float, lens: str) -> str:
        """Records a belief fragment with epistemic lens and confidence."""
        result = logic.record_belief(claim, confidence, lens)
        return str(result)

    @mcp.tool()
    def track_revision(belief_id: str, new_confidence: float, reason: str) -> str:
        """Tracks the revision of a belief over time."""
        result = logic.track_revision(belief_id, new_confidence, reason)
        return str(result)

    @mcp.tool()
    def flag_prompted(belief_id: str, source_prompt: str) -> str:
        """Flags a belief as having been elicited by a specific prompt."""
        result = logic.flag_prompted(belief_id, source_prompt)
        return str(result)
