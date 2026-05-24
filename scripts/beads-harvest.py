import os
import json
import sqlite3
import requests
from pathlib import Path

# Configuration
ARANGO_URL = "http://localhost:8529"
ARANGO_USER = "root"
ARANGO_PASS = "sovereign_password_placeholder"
ARANGO_DB = "abraxas_db"
ARANGO_COLL = "sovereign_ledger"

def arango_post(endpoint, data):
    url = f"{ARANGO_URL}/_db/{ARANGO_DB}/{endpoint}"
    resp = requests.post(url, auth=(ARANGO_USER, ARANGO_PASS), json=data)
    resp.raise_for_status()
    return resp.json()

def migrate_beads_db(db_path, project_name):
    print(f"Harvesting {project_name} from {db_path}...")
    try:
        # Beads uses SQLite for embedded mode
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Fetch issues (beads uses 'issues' table typically)
        cursor.execute("SELECT id, title, description, priority, status FROM issues")
        rows = cursor.fetchall()
        
        for row in rows:
            issue_id, title, desc, priority, status = row
            
            # Map status to Sovereign status
            # Original: open, ready, closed etc.
            sov_status = "open"
            if status == "closed": sov_status = "closed"
            elif status == "ready": sov_status = "ready"

            # Map priority
            sov_priority = priority if priority in ["high", "medium", "low", "chore"] else "medium"

            item = {
                "project": project_name,
                "title": title,
                "description": desc or "",
                "priority": sov_priority,
                "status": sov_status,
                "stp": {
                    "dod": "MIGRATED: Requires definition",
                    "verification": "MIGRATED: Requires definition",
                    "quality_audit": "MIGRATED: Requires definition"
                },
                "children": [],
                "artifacts": [],
                "metadata": {"original_beads_id": issue_id, "migration_date": "2026-04-28"},
                "created_at": "2026-04-28T00:00:00Z",
                "updated_at": "2026-04-28T00:00:00Z"
            }
            
            arango_post("_api/document", item)
            
        conn.close()
        print(f"Successfully migrated {len(rows)} tasks for {project_name}.")
    except Exception as e:
        print(f"Failed to migrate {project_name}: {e}")

def main():
    workspace = Path("/root/.openclaw/workspace")
    # Find all .beads directories
    for beads_dir in workspace.glob("**/ .beads"):
        # Identify project name from path
        # e.g. /root/.openclaw/workspace/projects/satchel/.beads -> satchel
        parts = beads_dir.parts
        try:
            proj_idx = parts.index("projects") + 1
            project_name = parts[proj_idx]
        except (ValueError, IndexError):
            project_name = "global"

        # Look for the actual SQLite DB file
        # In embedded mode, it's often under .beads/embeddeddolt/
        db_files = list(beads_dir.glob("**/beads.db")) # common name
        if not db_files:
            # some versions use different naming or just the folder
            db_files = list(beads_dir.glob("**/*.db"))

        for db_file in db_files:
            migrate_beads_db(str(db_file), project_name)

if __name__ == "__main__":
    main()
