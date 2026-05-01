from mcp.server.fastmcp import FastMCP
from skills.sovereign_core.python.logic import SovereignCoreLogic

mcp = FastMCP("sovereign-core")
logic = SovereignCoreLogic()

@mcp.tool()
def sovereign_patcher(patch_id: str, validate_only: bool = False, force: bool = False) -> str:
    """Apply vetted updates to the sovereign system. Validates patches before application and maintains system integrity."""
    result = logic.sovereign_patcher(patch_id, validate_only, force)
    return str(result)

@mcp.tool()
def config_management(action: str, key: str = None, value: str = None, section: str = None) -> str:
    """Manage sovereign configuration settings. Read, write, and validate configuration values."""
    result = logic.config_management(action, key, value, section)
    return str(result)

@mcp.tool()
def system_state_audit(check_type: str = "full", verbose: bool = False) -> str:
    """Audit and verify the current system state including version, configuration, and integrity checks."""
    result = logic.system_state_audit(check_type, verbose)
    return str(result)

@mcp.tool()
def health_check(detailed: bool = False) -> str:
    """Check the health status of the sovereign core server and connected systems."""
    result = logic.health_check(detailed)
    return str(result)
