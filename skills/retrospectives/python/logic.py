import datetime
from typing import List, Dict, Any, Optional
from infra.mcp.context import AbraxasContext

class RetrospectivesLogic:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(RetrospectivesLogic, cls).__new__(cls)
        return cls._instance

    def __init__(self, context: Optional[AbraxasContext] = None):
        # We use the context provided during tool registration or a fallback
        self.context = context

    def set_context(self, context: AbraxasContext):
        self.context = context

    def save_retro(self, date: str, retro_type: str, retro_id: str, content: Dict[str, Any]) -> str:
        """Save a retrospective assessment to ArangoDB."""
        if not self.context:
            raise RuntimeError("Context not initialized for RetrospectivesLogic")
        
        coll = self.context.db.collection("retrospectives")
        
        # Normalize the document for the collection
        doc = {
            "date": date,
            "type": retro_type,
            "retro_id": retro_id,
            **content,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        # If retro_id is meant to be the primary key, we can use it as _key.
        # Otherwise, let ArangoDB handle it and we store retro_id as an attribute.
        try:
            # Try to use retro_id as the key for idempotency
            coll.insert(doc, key=retro_id)
        except Exception:
            # If key exists or is invalid, fallback to standard insert
            coll.insert(doc)
            
        return f"Retrospective saved successfully for {date} ({retro_type})"

    def get_retros_for_period(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Retrieve retrospectives within a given date range using AQL."""
        if not self.context:
            raise RuntimeError("Context not initialized for RetrospectivesLogic")
        
        query = """
        FOR r IN retrospectives
            FILTER r.date >= @start AND r.date <= @end
            SORT r.date ASC
            RETURN r
        """
        bind_vars = {"start": start_date, "end": end_date}
        
        try:
            return self.context.execute_aql(query, bind_vars)
        except Exception as e:
            raise RuntimeError(f"Error retrieving retros: {str(e)}")

    def create_ledger_task(self, description: str, priority: str, source_retro_id: str) -> str:
        """Create a task in the project tasks collection as a result of a retro finding."""
        if not self.context:
            raise RuntimeError("Context not initialized for RetrospectivesLogic")
        
        coll = self.context.db.collection("tasks")
        
        task_doc = {
            "title": f"[Retro-Improvement] {description}",
            "project": "Sovereign Brain",
            "scope": f"Origin: Retrospective {source_retro_id}",
            "priority": priority,
            "status": "open",
            "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        
        try:
            coll.insert(task_doc)
            return f"Ledger task created successfully: {description}"
        except Exception as e:
            raise RuntimeError(f"Error creating ledger task: {str(e)}")
