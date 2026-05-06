from mcp.server.fastmcp import FastMCP
from infra.mcp.context import AbraxasContext
from skills.config_registry.python.logic import loader, masker
import json

def register_tools(mcp: FastMCP, context: AbraxasContext):
    """Registers Config Registry tools to the Abraxas MCP server."""
    
    @mcp.tool()
    def config_get(path: str) -> str:
        """
        Fetch a configuration value by dot-notation path (e.g., "Soter.RiskThreshold").
        """
        try:
            val = loader.get_value(path)
            return json.dumps({"value": val, "path": path, "masked": False}, indent=2)
        except Exception as e:
            return f"Error: {str(e)}"

    @mcp.tool()
    def config_get_all() -> str:
        """
        Return entire configuration with secrets masked.
        """
        config = loader.get_all()
        res = masker.mask_secrets(config)
        res["version"] = loader.get_version()
        res["lastLoadTime"] = loader.get_last_load_time()
        return json.dumps(res, indent=2)

    @mcp.tool()
    def config_get_section(section: str) -> str:
        """
        Return a specific configuration section (e.g., "Soter", "Ethos").
        """
        section_data = loader.get_section(section)
        res = masker.mask_secrets(section_data, section)
        res["section"] = section
        return json.dumps(res, indent=2)

    @mcp.tool()
    def config_reload() -> str:
        """
        Force reload configuration from file.
        """
        result = loader.reload()
        return json.dumps(result, indent=2)
