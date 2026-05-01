import os
import logging
from arango import ArangoClient
import arango

# Configuration
ARANGO_URL = os.getenv("ARANGO_URL", "http://localhost:8529")
ARANGO_USER = os.getenv("ARANGO_USER", "root")
ARANGO_PASS = os.getenv("ARANGO_PASS", "5orange5")
DB_NAME = "abraxas_db"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def bootstrap():
    client = ArangoClient(hosts=ARANGO_URL)

    try:
        sys_db = client.db("_system", username=ARANGO_USER, password=ARANGO_PASS)

        # 1. Ensure Database exists
        if not sys_db.has_database(DB_NAME):
            logger.info(f"Creating database: {DB_NAME}")
            sys_db.create_database(DB_NAME)

        db = client.db(DB_NAME, username=ARANGO_USER, password=ARANGO_PASS)


        # 2. Define Collections
        for name in ["tasks", "lessons", "retrospectives"]:
            if not db.has_collection(name):
                logger.info(f"Creating collection: {name}")
                db.create_collection(name)

        for name in ["task_edges"]:
            if not db.has_collection(name):
                logger.info(f"Creating collection: {name}")
                db.create_collection(name, edge=True)

        # 3. Provision Indexes
        # Tasks indexing
        tasks = db.collection("tasks")
        tasks.add_persistent_index(fields=["status"])
        tasks.add_persistent_index(fields=["project"])

        # Lessons indexing
        lessons = db.collection("lessons")
        lessons.add_persistent_index(fields=["category"])

        # Retrospectives indexing
        retros = db.collection("retrospectives")
        retros.add_persistent_index(fields=["date"])

        logger.info("Indexes provisioned successfully.")

        # 4. Seed Data
        seed_tasks = [
            {
                "_key": "genesis_1",
                "title": "Provision ArangoDB Schema",
                "status": "closed",
                "project": "infra",
                "priority": "high",
            },
            {
                "_key": "genesis_2",
                "title": "Initialize Janus Routing",
                "status": "ready",
                "project": "janus",
                "priority": "medium",
            },
            {
                "_key": "genesis_3",
                "title": "Implement Oneironautics Ledger",
                "status": "open",
                "project": "oneironautics",
                "priority": "low",
            },
        ]

        seed_edges = [
            {"_from": "tasks/genesis_3", "_to": "tasks/genesis_2", "type": "blocks"},
        ]

        seed_lessons = [
            {
                "title": "Graph-based Task Tracking",
                "content": "Using edge collections for 'blocks' relationships allows for complex dependency resolution using AQL traversals.",
                "category": "architecture",
                "createdAt": "2026-04-30T00:00:00Z",
            }
        ]

        seed_retros = [
            {
                "title": "System Bootstrap Retrospective",
                "summary": "Initial ArangoDB environment setup. Verified that collections and indexes are correctly aligned with the Ledger MCP.",
                "date": "2026-04-30",
                "status": "completed",
            }
        ]

        # Insertion helper
        def seed_collection(col_name, data):
            col = db.collection(col_name)
            for item in data:
                # For documents with fixed _key, use replace to avoid duplicates on re-run
                if "_key" in item:
                    col.replace(item["_key"], item)
                else:
                    col.insert(item)
            logger.info(f"Seeded {col_name} with {len(data)} entries.")

        seed_collection("tasks", seed_tasks)
        seed_collection("task_edges", seed_edges)
        seed_collection("lessons", seed_lessons)
        seed_collection("retrospectives", seed_retros)

        logger.info("Bootstrap completed successfully.")

    except Exception as e:
        logger.error(f"Bootstrap failed: {e}")
        raise


if __name__ == "__main__":
    # Import arango here to make the script self-contained for the write tool
    # but in a real env this is at the top.
    import arango

    bootstrap()
