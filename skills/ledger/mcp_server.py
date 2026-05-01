from mcp.server.fastmcp import FastMCP
from skills.ledger.python.logic import LedgerLogic

mcp = FastMCP("ledger")
logic = LedgerLogic()

@mcp.tool()
def create_task(title: str, project: str = None, scope: str = None, priority: str = None) -> str:
    """Create a new task in the ledger."""
    result = logic.create_task(title, project, scope, priority)
    return str(result)

@mcp.tool()
def get_ready_tasks() -> str:
    """Get tasks that are ready to be worked on."""
    result = logic.get_ready_tasks()
    return str(result)

@mcp.tool()
def update_task_status(id: str, status: str) -> str:
    """Update the status of a task. Valid statuses: open, ready, testing, closed."""
    result = logic.update_task_status(id, status)
    return str(result)

@mcp.tool()
def add_dependency(child_id: str, parent_id: str, type: str = "blocks") -> str:
    """Add a dependency between two tasks. Child blocks Parent."""
    result = logic.add_dependency(child_id, parent_id, type)
    return str(result)

@mcp.tool()
def get_task(id: str) -> str:
    """Get a single task by id."""
    result = logic.get_task(id)
    return str(result)

@mcp.tool()
def get_tasks_by_project(project: str) -> str:
    """Get all tasks for a specific project."""
    result = logic.get_tasks_by_project(project)
    return str(result)
