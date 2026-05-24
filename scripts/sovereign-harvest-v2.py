import requests
import json
from pathlib import Path

# Config
DOLT_URL = "http://localhost:3306" # This is the SQL port, but we need the REST API for Dolt
DOLT_REST_URL = "http://localhost:8080" # Standard Dolt REST port (if enabled)
ARANGO_URL = "http://localhost:8529"
ARANGO_USER = "root"
ARANGO_PASS = "sovereign_password_placeholder"
ARANGO_DB = "abraxas_db"
ARANGO_COLL = "sovereign_ledger"

# Actually, since the Dolt server is a separate container, we should check its REST port.
# If REST is disabled, we can use a temporary container to run 'dolt export'.

def arango_post(data):
    url = f"{ARANGO_URL}/_db/{ARANGO_DB}/_api/document/{ARANGO_COLL}"
    resp = requests.post(url, auth=(ARANGO_USER, ARANGO_PASS), json=data)
    return resp.status_code == 200

def harvest_project(project_path):
    print(f"Harvesting {project_path}...")
    # Use docker exec to run 'dolt dump' or 'dolt sql' directly on the local folder
    # We mount the project folder to a temporary dolt container
    cmd = f"docker run --rm -v {project_path}:/data dolthub/dolt sql -H localhost -P 3306 -u root -p 'sovereign_password_placeholder' -d beads -e 'SELECT * FROM issues'"
    # Wait, that's for a server. For a local folder, we use:
    cmd = f"docker run --rm -v {project_path}:/data dolthub/dolt -f /data sql -e 'SELECT id, title, description, priority, status FROM issues' --json"
    
    try:
        import subprocess
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error harvesting {project_path}: {result.stderr}")
            return

        tasks = json.loads(result.stdout)
        for t in tasks:
            item = {
                "project": project_path.split("/")[-2],
                "title": t.get("title", "Unknown"),
                "description": t.get("description", ""),
                "priority": t.get("priority", "medium"),
                "status": "open",
                "stp": {
                    "dod": "MIGRATED: Requires definition",
                    "verification": "MIGRATED: Requires definition",
                    "quality_audit": "MIGRATED: Requires definition"
                },
                "children": [],
                "artifacts": [],
                "metadata": {"original_id": t.get("id"), "migration": "Sovereign_Harvest_v2"},
                "created_at": "2026-04-28T00:00:00Z",
                "updated_at": "2026-04-28T00:00:00Z"
            }
            arango_post(item)
        print(f"Imported {len(tasks)} tasks from {project_path}.")
    except Exception as e:
        print(f"Failure: {e}")

def main():
    # Target folders based on previous 'find'
    targets = [
        "/root/.openclaw/workspace/projects/satchel/.beads/embeddeddolt/satchel",
        "/root/.openclaw/workspace/projects/asclepius/.beads/embeddeddolt/asclepius",
        "/root/.openclaw/workspace/projects/screepy/.beads/embeddeddolt/screepy",
        "/root/.openclaw/workspace/projects/outerspace/.beads/embeddeddolt/outerspace"
    ]
    for target in targets:
        harvest_project(target)

if __name__ == "__main__":
    main()
