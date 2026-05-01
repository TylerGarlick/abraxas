import os
import datetime
from typing import List, Dict, Any, Optional
from arango import ArangoClient

class LedgerLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LedgerLogic, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        url = os.getenv("ARANGO_URL")
        db_name = os.getenv("ARANGO_DB")
        user = os.getenv("ARANGO_USER")
        password = os.getenv("ARANGO_ROOT_PASSWORD")

        if not all([url, db_name, user, password]):
            raise EnvironmentError("Missing required ArangoDB environment variables: ARANGO_URL, ARANGO_DB, ARANGO_USER, ARANGO_ROOT_PASSWORD")

        self.client = ArangoClient(servers=url)
        self.db = self.client.db(db_name, username=user, password=password)
        self.ensure_collections()

    def ensure_collections(self):
        """Ensure tasks and task_edges collections exist."""
        if not self.db.collection("tasks").exists():
            self.db.create_collection("tasks")
        
        if not self.db.collection("task_edges").exists():
            self.db.create_collection("task_edges", edge=True)

    def create_task(self, title: str, project: Optional[str] = None, scope: Optional[str] = None, priority: Optional[str] = None) -> Dict[str, Any]:
        """Create a new task in the ledger."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        task = {
            "title": title,
            "project": project,
            "scope": scope,
            "priority": priority,
            "status": "open",
            "createdAt": now,
            "updatedAt": now,
        }
        res = self.db.collection("tasks").save(task)
        task["_key"] = res["_key"]
        return task

    def get_ready_tasks(self) -> List[Dict[str, Any]]:
        """Get tasks that are ready to be worked on.
        A task is ready if status is 'ready' OR (status is 'open' AND has no 'blocks' dependencies that are not closed).
        """
        query = """
        FOR t IN tasks
            FILTER t.status == 'ready' 
            OR (t.status == 'open' AND LENGTH(
                FOR v, e IN 1..1 INBOUND t._id task_edges
                FILTER e.type == 'blocks' AND v.status != 'closed'
                RETURN 1
            ) == 0)
            RETURN t
        """
        cursor = self.db.aql.execute(query)
        return list(cursor)

    def update_task_status(self, id: str, status: str) -> Dict[str, Any]:
        """Update the status of a task."""
        if status not in ["open", "ready", "testing", "closed"]:
            raise ValueError(f"Invalid status: {status}. Must be one of ['open', 'ready', 'testing', 'closed']")

        task = self.db.collection("tasks").get(id)
        if not task:
            raise ValueError(f"Task with id {id} not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        updated_task = {**task, "status": status, "updatedAt": now}
        self.db.collection("tasks").update(id, updated_task)
        return updated_task

    def add_dependency(self, child_id: str, parent_id: str, dep_type: str = "blocks") -> bool:
        """Add a dependency between two tasks. Child blocks Parent."""
        edge = {
            "_from": f"tasks/{child_id}",
            "_to": f"tasks/{parent_id}",
            "type": dep_type,
        }
        self.db.collection("task_edges").save(edge)
        return True

    def get_task(self, id: str) -> Optional[Dict[str, Any]]:
        """Get a single task by id."""
        return self.db.collection("tasks").get(id)

    def get_tasks_by_project(self, project: str) -> List[Dict[str, Any]]:
        """Get all tasks for a specific project."""
        query = "FOR t IN tasks FILTER t.project == @project RETURN t"
        cursor = self.db.aql.execute(query, bind_vars={"project": project})
        return list(cursor)
