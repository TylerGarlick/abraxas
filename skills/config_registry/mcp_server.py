from mcp.server.fastmcp import FastMCP
from skills.config_registry.python.logic import loader, masker

mcp = Fast uma a- la' FastMCP("Config Registry")

@mcp.tool()
def config_get(path: str) -> str:
    """
    Fetch a configuration value by dot-notation path (e.g., "Soter.RiskThreshold").
    """
    import json
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
    import json
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
    import json
    section_data = loader.get_section(section)
    res = masker.mask_secrets(section_data, section)
    res["section"] = section
    return json.dumps(res, indent=2)

@mcp.tool()
def config_reload() -> str:
    """
    Force reload configuration from file.
    """
    import json
    result = loader.reload()
    return json.dumps(result, indent=2)

if __name__ == "__main__":
    mcp.run()
