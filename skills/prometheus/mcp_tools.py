from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.prometheus.python.logic import PrometheusLogic

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Prometheus tools to the Abraxas MCP server."""
    logic = PrometheusLogic()

    @mcp.tool()
    def get_profile(user_id: str) -> str:
        """Retrieves the current user preference profile."""
        result = logic.get_profile(user_id)
        return str(result)

    @mcp.tool()
    def set_preference(key: str, value: str, weight: float = 1.0) -> str:
        """Sets a specific user preference with a weight."""
        result = logic.set_preference(key, value, weight)
        return str(result)

    @mcp.tool()
    def record_signal(signal_type: str, payload: str) -> str:
        """Records an implicit or explicit signal for profile evolution."""
        result = logic.record_signal(signal_type, payload)
        return str(result)
