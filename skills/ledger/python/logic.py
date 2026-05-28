import os
import datetime
import logging
from typing import List, Dict, Any, Optional
from scripts.db_client import get_db

logger = logging.getLogger(__name__)

class LedgerLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LedgerLogic, cls).__new__(cls)
            # Initialize DB access for this instance
            cls._instance.db = get_db()
        return cls._instance

    def ensure_collections(self):
        """Ensure tasks and TASK_EDGES collections exist."""
        self.db.ensure_collection("tasks", edge=False)
        self.db.ensure_collection("TASK_EDGES", edge=True)

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
        res_id = self.db.insert("tasks", task)
        task["_key"] = res_id.split('/')[-1] if '/' in res_id else res_id
        return task

    def get_ready_tasks(self) -> List[Dict[str, Any]]:
        """Get tasks that are ready to be worked on."""
        query = """
        FOR t IN tasks
            FILTER t.status == 'ready' 
            OR (t.status == 'open' AND LENGTH(
                FOR v, e IN 1..1 INBOUND t._id TASK_EDGES
                FILTER e.type == 'blocks' AND v.status != 'closed'
                RETURN 1
            ) == 0)
            RETURN t
        """
        return self.db.query(query)

    def update_task_status(self, id: str, status: str) -> Dict[str, Any]:
        """Update the status of a task using the DB client."""
        if status not in ["open", "ready", "testing", "closed"]:
            raise ValueError(f"Invalid status: {status}. Must be one of ['open', 'ready', 'testing', 'closed']")

        task = self.db.collection("tasks").get(id) if hasattr(self.db, 'collection') else None # fallback
        # Since AbraxasDB wrapper might be limited, we use a la-simplified approach
        # Let's use a query for the get’
        res = self.db.query("FOR t IN tasks FILTER t._id == @id RETURN t", bind_vars={"id": id})
        if not res:
            raise ValueError(f"Task with id {id} not found")
        
        task = res[0]
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        updated_task = {**task, "status": status, "updatedAt": now}
        
        # Using the wrapper update
        self.db.update(task['_id'], "tasks", updated_task)

        if status == "closed":
            try:
                from skills.retrospectives.python.logic import RetrospectivesLogic
                retro_logic = RetrospectivesLogic()
                today = datetime.datetime.utcnow().strftime('%Y-%m-%d')
                retro_content = {
                    "task_id": task["_key"],
                    "task_title": task["title"],
                    "status": "closed",
                    "closure_date": now,
                    "auto_generated": True
                }
                retro_logic.save_retro(
                    date=today,
                    retro_type="task",
                    retro_id=task["_key"],
                    content=retro_content
                )
            except Exception as e:
                logger.error(f"Auto-retrospective trigger failed: {e}")

        return updated_task

    def add_dependency(self, child_id: str, parent_id: str, dep_type: str = "blocks") -> bool:
        """Add a dependency between two tasks. Child blocks Parent."""
        edge = {
            "_from": f"tasks/{child_id}",
            "_to": f"tasks/{parent_id}",
            "type": dep_type,
        }
        self.db.insert("TASK_EDGES", edge)
        return True

    def get_task(self, id: str) -> Optional[Dict[str, Any]]:
        """Get a single task by id."""
        res = self.db.query("FOR t IN tasks FILTER t._id == @id RETURN t", bind_vars={"id": id})
        return res[0] if res else None

    def delete_task(self, id: str) -> bool:
        """Delete a task from the ledger."""
        task = self.get_task(id)
        if not task:
            return False
        self.db.delete(task["_id"], "tasks")
        return True

    def get_tasks_by_project(self, project: str) -> List[Dict[str, Any]]:
        """Get all tasks for a specific project."""
        query = "FOR t IN tasks FILTER t.project == @project RETURN t"
        return self.db.query(query, bind_vars={"project": project})
