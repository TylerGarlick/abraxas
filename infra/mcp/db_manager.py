from typing import Any, Optional, List, Dict
import logging
from arango import ArangoClient
from infra.mcp.context import AbraxasContext

logger = logging.getLogger("mcp-db-manager")

class DBManager:
    """
    Handles ArangoDB initialization, collection creation, and seeding.
    Ensures that the database is ready for the unified MCP server.
    """
    def __init__(self, context: AbraxasContext):
        self.context = context
        self.client = None
        self.db = None

    def connect(self):
        """Establish connection to ArangoDB using context environment variables."""
        try:
            url = self.context.get_env("ARANGO_URL", "http://localhost:8529")
            user = self.context.get_env("ARANGO_USER", "root")
            password = self.context.get_env("ARANGO_ROOT_PASSWORD", "password")
            db_name = self.context.get_env("ARANGO_DB", "abraxas_db")
            
            self.client = ArangoClient(hosts=url)
            
            # Retry loop to ensure DB is available and created
            for attempt in range(5):
                try:
                    self.db = self.client.db(db_name, password=password)
                    # Test connection with a simple call
                    self.db.properties()
                    logger.info(f"Successfully connected to ArangoDB database: {db_name}")
                    return True
                except Exception as e:
                    if "database not found" in str(e).lower() or "404" in str(e):
                        logger.info(f"Database {db_name} not found. Creating it (attempt {attempt+1}/5)...")
                        try:
                            # Use the client's create_database method if it exists, 
                            # but based on version 8.x, it's often via a separate admin logic.
                            # Most setups use the root user to create databases.
                            admin_db = self.client.db('_system', password=password)
                            admin_db.create_database(db_name)
                            self.db = self.client.db(db_name, password=password)
                            return True
                        except Exception as create_e:
                            logger.warning(f"Create database failed: {create_e}")
                    else:
                        logger.warning(f"Connection attempt {attempt+1} failed: {e}")
                    import time
                    time.sleep(2)
            
            logger.error(f"Failed to connect to ArangoDB after 5 attempts.")
            return False
        except Exception as e:
            logger.error(f"Critical failure in connect(): {str(e)}")
            return False

    def initialize_schema(self, skill_manifests: List[Dict] = None):
        """
        Creates collections and indexes based on manifests provided by skills.
        Includes the Dream Reservoir graph and Epistemic Ledger.
        """
        if not self.db:
            return False
            
        try:
            # Core Collections
            core_collections = [
                {"name": "tasks", "edge": False},
                {"name": "task_edges", "edge": True},
                {"name": "provenance_chain", "edge": True},
                {"name": "knowledge_fragments", "edge": False},
                {"name": "epistemic_ledger", "edge": False}, # Added Ledger
                {"name": "fragments", "edge": False},
                {"name": "claims", "edge": False},
                {"name": "events", "edge": False},
            ]
            
            # Sovereign Edges
            sovereign_edges = [
                {"name": "DERIVED_FROM", "edge": True},
                {"name": "NEXT_STEP", "edge": True},
                {"name": "SUPERSEDES", "edge": True},
            ]
            
            # Dream Reservoir Graph Schema: Session -> Hypothesis -> Concept -> Plan
            dream_collections = [
                {"name": "dream_sessions", "edge": False},
                {"name": "hypotheses", "edge": False},
                {"name": "concepts", "edge": False},
                {"name": "actionable_plans", "edge": False},
            ]

            dream_edges = [
                {"name": "SESS_TO_HYPO", "edge": True},
                {"name": "HYPO_TO_CONCEPT", "edge": True},
                {"name": "CONCEPT_TO_PLAN", "edge": True},
            ]

            benchmark_collections = [
                {"name": "benchmark_results", "edge": False},
            ]
            
            all_defaults = core_collections + sovereign_edges + dream_collections + dream_edges + benchmark_collections
            
            for col in all_defaults:
                if not self.db.has_collection(col["name"]):
                    self.db.create_collection(col["name"], edge=col["edge"])
                    logger.info(f"Created collection: {col['name']}")

            if skill_manifests:
                for manifest in skill_manifests:
                    for collection in manifest.get("collections", []):
                        if not self.db.has_collection(collection):
                            # Assume non-edge if just a string
                            is_edge = False if isinstance(collection, str) else collection.get("edge", False)
                            name = collection if isinstance(collection, str) else collection.get("name")
                            self.db.create_collection(name, edge=is_edge)
                            logger.info(f"Created skill collection: {name}")
            return True
        except Exception as e:
            logger.error(f"Schema initialization failed: {str(e)}")
            return False

    def seed_standard_guardrails(self):
        """Seeds the base Sovereign Standard guardrails into knowledge_fragments."""
        if not self.db: return False
        try:
            col = self.db.collection("knowledge_fragments")
            # Base Sovereign Standard entries
            guardrails = [
                {"key": "Sovereign_AntiSycophancy", "value": "Truth over comfort. Accuracy > Agreement.", "type": "constraint"},
                {"key": "Sovereign_NoConfabulation", "value": "[UNKNOWN] is a complete valid response. Fabrication is forbidden.", "type": "constraint"},
                {"key": "Sovereign_EpistemicLabeling", "value": "All Sol claims must be labeled [KNOWN], [INFERRED], [UNCERTAIN], or [UNKNOWN].", "type": "constraint"},
            ]
            for item in guardrails:
                # Simple upsert by key
                existing = col.get({"key": item["key"]})
                if existing:
                    col.update(existing['_key'], item)
                else:
                    col.insert(item)
            logger.info("Seeded Sovereign Standard guardrails.")
            return True
        except Exception as e:
            logger.error(f"Guardrail seeding failed: {str(e)}")
            return False

    def seed_ledger_baseline(self):
        """Seeds the Epistemic Ledger with initial structural templates."""
        if not self.db: return False
        try:
            col = self.db.collection("epistemic_ledger")
            baseline = {
                "template": "Standard Entry",
                "fields": ["claim", "label", "evidence_chain", "resolution_status"],
                "version": "1.0"
            }
            col.insert({"type": "baseline_template", "data": baseline})
            logger.info("Seeded Epistemic Ledger baseline.")
            return True
        except Exception as e:
            logger.error(f"Ledger seeding failed: {str(e)}")
            return False

    def seed_data(self, seed_functions: list = None):
        """Executes seed functions and built-in baseline seeding."""
        try:
            # Built-in seeds
            self.seed_standard_guardrails()
            self.seed_ledger_baseline()
            
            if seed_functions:
                for seed_func in seed_functions:
                    seed_func(self.db)
            logger.info("Database seeding completed successfully.")
            return True
        except Exception as e:
            logger.error(f"Seeding failed: {str(e)}")
            return False
