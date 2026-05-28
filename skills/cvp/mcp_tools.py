from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.cvp.python.logic import CVPLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers CVP tools to the Abraxas MCP server."""
    logic = CVPLogic()

    @mcp.tool()
    def resolve_consensus(paths: list, threshold: int = 3) -> str:
        """Implements N-of-M agreement rules to transform probabilistic output into verified consensus."""
        result = logic.resolve_consensus(paths, threshold)
        return str(result)

    @mcp.tool()
    def log_sovereign_gap(gap_description: str, severity: str) -> str:
        """Logs a divergence between output and constitutional truth."""
        result = logic.log_sovereign_gap(gap_description, severity)
        return str(result)
