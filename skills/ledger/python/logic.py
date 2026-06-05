import os
import datetime
import logging
from typing import List, Dict, Any, Optional
from skills.common.graphql_client import gql_client

logger = logging.getLogger(__name__)

class LedgerLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LedgerLogic, cls).__new__(cls)
        return cls._instance

    def ensure_collections(self):
        """Collections are now ensured by the GraphQL server."""
        pass

    def create_task(self, title: str, project: Optional[str] = None, scope: Optional[str] = None, priority: Optional[str] = None) -> Dict[str, Any]:
        """Create a new task via GraphQL mutation."""
        try:
            mutation = """
            mutation CreateTask($input: TaskInput!) {
                createTask(input: $input) {
                    id
                    title
                    status
                }
            }
            """
            variables = {
                "input": {
                    "title": title,
                    "project": project,
                    "scope": scope,
                    "priority": priority,
                    "status": "OPEN"
                }
            }
            result = gql_client.execute(mutation, variables)
            return result.get("createTask", {"error": "Task creation failed"})
        except Exception as e:
            return {"error": str(e)}


    def get_ready_tasks(self) -> List[Dict[str, Any]]:
        """Get tasks that are ready to be worked on via GraphQL query."""
        try:
            result = gql_client.execute(
                """
                query {
                    tasks(status: ready) {
                        id
                        title
                        status
                    }
                }
                """,
                {}
            )
            return result.get("tasks", [])
        except Exception as e:
            logger.error(f"Failed to fetch ready tasks: {e}")
            return []

    def update_task_status(self, id: str, status: str) -> Dict[str, Any]:
        """Update the status of a task via GraphQL mutation."""
        try:
            # Normalize status to uppercase for GraphQL Enum TaskStatus
            normalized_status = status.upper()
            result = gql_client.execute(
                """
                mutation($input: TaskStatusInput!) {
                    updateTaskStatus(input: $input) {
                        id
                        status
                    }
                }
                """,
                {"input": {
                    "id": id,
                    "status": normalized_status
                }}
            )
            return result.get("updateTaskStatus", {"error": "status update failed"})
        except Exception as e:
            return {"error": str(e)}

    def add_dependency(self, child_id: str, parent_id: str, dep_type: str = "blocks") -> bool:
        """Add a dependency between two tasks via GraphQL mutation."""
        try:
            result = gql_client.execute(
                """
                mutation($input: DependencyInput!) {
                    createDependency(input: $input) {
                        fromId
                        toId
                        depType
                    }
                }
                """,
                {"input": {
                    "fromId": child_id,
                    "toId": parent_id,
                    "depType": dep_type
                }}
            )
            return True if result.get("createDependency") else False
        except Exception as e:
            logger.error(f"Failed to add dependency: {e}")
            return False

    def get_task(self, id: str) -> Optional[Dict[str, Any]]:
        """Get a single task by id via GraphQL search."""
        try:
            result = gql_client.execute(
                """
                query($id: String!) {
                    search(query: $id, collections: ["tasks"]) {
                        id
                        label
                    }
                }
                """,
                {"id": id}
            )
            res = result.get("search")
            return res[0] if res else None
        except Exception as e:
            return None

    def delete_task(self, id: str) -> bool:
        # Deletion is not currently implemented in the GraphQL schema mutations.
        # For now, we return a mock success or a 'not implemented' error.
        return False

    def get_tasks_by_project(self, project: str) -> List[Dict[str, Any]]:
        """Get all tasks for a specific project via GraphQL query."""
        try:
            result = gql_client.execute(
                """
                query($project: String) {
                    tasks(project: $project) {
                        id
                        title
                        status
                    }
                }
                """,
                {"project": project}
            )
            return result.get("tasks", [])
        except Exception as e:
            return []

