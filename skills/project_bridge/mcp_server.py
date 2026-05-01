from mcp.server.fastmcp import FastMCP
from skills.project_bridge.python.logic import ProjectBridgeLogic

mcp = FastMCP("project-bridge")
logic = ProjectBridgeLogic()

@mcp.tool()
def cross_project_search(query: str, projects: list = None, file_pattern: str = "*", case_sensitive: bool = False, max_results: int = 20) -> str:
    """Search across multiple project repositories for files, code, or content."""
    result = logic.cross_project_search(query, projects, file_pattern, case_sensitive, max_results)
    return str(result)

@mcp.tool()
def unified_retrospective(project: str = None, start_date: str = None, end_date: str = None, tags: list = None, limit: int = 50) -> str:
    """Retrieve retrospectives from multiple projects in a unified format."""
    result = logic.unified_retrospective(project, start_date, end_date, tags, limit)
    return str(result)

@mcp.tool()
def project_mapping(action: str, source_project: str = None, target_project: str = None, relationship_type: str = None, metadata: dict = None) -> str:
    """Manage and query project-to-project relationships and dependencies."""
    result = logic.project_mapping(action, source_project, target_project, relationship_type, metadata)
    return str(result)

@mcp.tool()
def health_check(detailed: bool = False) -> str:
    """Check the health status of the project bridge server and connected project repositories."""
    result = logic.health_check(detailed)
    return str(result)
