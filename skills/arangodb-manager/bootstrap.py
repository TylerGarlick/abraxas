import os
import json
import time
from arango import ArangoClient

# Environment Configuration
ARANGO_URL = os.getenv("ARANGO_URL", "http://arangodb:8529")
ARANGO_DB = os.getenv("ARANGO_DB", "abraxas")
ARANGO_USER = os.getenv("ARANGO_USER", "root")
ARANGO_ROOT_PASSWORD = os.getenv("ARANGO_ROOT_PASSWORD", "")

def bootstrap():
    print(f"Starting bootstrap for database: {ARANGO_DB}...")
    client = ArangoClient(hosts=ARANGO_URL)
    
    # 1. Ensure Database Exists
    try:
        sys_db = client.db('_system', username=ARANGO_USER, password=ARANGO_ROOT_PASSWORD)
        if not sys_db.has_database(ARANGO_DB):
            print(f"Creating database {ARANGO_DB}...")
            sys_db.create_database(ARANGO_DB)
        else:
            print(f"Database {ARANGO_DB} already exists.")
    except Exception as e:
        print(f"Error during DB creation: {e}")
        return False

    db = client.db(ARANGO_DB, username=ARANGO_USER, password=ARANGO_ROOT_PASSWORD)

    # 2. Initialize Core Collections
    core_collections = [
        {"name": "tasks", "edge": False},
        {"name": "task_edges", "edge": True},
    ]
    
    for coll_cfg in core_collections:
        name = coll_cfg["name"]
        is_edge = coll_cfg["edge"]
        if not db.has_collection(name):
            print(f"Creating collection {name} (edge={is_edge})...")
            db.create_collection(name, edge=is_edge)
        else:
            print(f"Collection {name} already exists.")

    # 3. Seed from JSON files in /workspace/data/seeds/
    seed_dir = "/workspace/data/seeds"
    if os.path.exists(seed_dir):
        print(f"Checking for seed files in {seed_dir}...")
        for filename in os.listdir(seed_dir):
            if filename.endswith(".json"):
                print(f"Seeding from {filename}...")
                seed_path = os.path.join(seed_dir, filename)
                try:
                    with open(seed_path, 'r') as f:
                        seed_data = json.load(f)
                    
                    collections = seed_data.get("collections", {})
                    for coll_name, config in collections.items():
                        coll_type = config.get("type", "document")
                        data = config.get("data", [])
                        
                        if not db.has_collection(coll_name):
                            db.create_collection(coll_name, edge=(coll_type == "edge"))
                        
                        coll = db.collection(coll_name)
                        for item in data:
                            coll.insert(item, overwrite=True)
                    print(f"Successfully seeded {filename}")
                except Exception as e:
                    print(f"Failed to seed {filename}: {e}")
    else:
        print(f"No seed directory found at {seed_dir}, skipping initial data load.")

    print("Bootstrap completed successfully.")
    return True

if __name__ == "__main__":
    # Retry loop for ArangoDB availability
    retries = 10
    while retries > 0:
        if bootstrap():
            break
        print("ArangoDB not ready, retrying in 5 seconds...")
        time.sleep(5)
        retries -= 1
    
    if retries == 0:
        print("Bootstrap failed after multiple attempts.")
        exit(1)
