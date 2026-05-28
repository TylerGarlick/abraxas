from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.hermes.python.logic import HermesLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Hermes tools to the Abraxas MCP server."""
    logic = HermesLogic()

    @mcp.tool()
    def add_agent_position(agent_id: str, claim: str, weight: float) -> str:
        """Tracks agent positions in a consensus ledger."""
        result = logic.add_agent_position(agent_id, claim, weight)
        return str(result)

    @mcp.tool()
    def compute_consensus(claim_id: str) -> str:
        """Computes consensus by weighting agent responses by track record."""
        result = logic.compute_consensus(claim_id)
        return str(result)

    @mcp.tool()
    def weight_record(agent_id: str, accuracy: float) -> str:
        """Updates an agent's weight based on historical accuracy."""
        result = logic.weight_record(agent_id, accuracy)
        return str(result)
