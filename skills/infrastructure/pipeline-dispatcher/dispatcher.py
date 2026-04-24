import os
import json
import subprocess
import requests
import re
import time

# Configuration
ARANGO_HOST = "http://localhost:8529"
ARANGO_USER = "root"
ARANGO_PASS = "[REDACTED_Sovereign_Credential]"
NODES_COLLECTION = "SovereignNodes"
EDGES_COLLECTION = "SovereignEdges"

# Staggered Launch Configuration
BATCH_SIZE = 5  # Maximum concurrent spawns per wave
BATCH_COOLDOWN_SECONDS = 30  # Cooldown between batches

def get_auth():
    return (ARANGO_USER, ARANGO_PASS)

def verify_write(response):
    """Verify ArangoDB writes. Allows 201 (Created) and 202 (Accepted/Updated)."""
    if response.status_code not in [201, 202]:
        raise Exception(f"ArangoDB Write Failure: Unexpected status {response.status_code}. Response: {response.text}")

def upsert_node(node_id, properties):
    """Upserts a node. If it exists, it updates; otherwise, it creates."""
    url = f"{ARANGO_HOST}/_api/document/{NODES_COLLECTION}/{node_id}"
    res = requests.put(url, json=properties, auth=get_auth())
    
    if res.status_code == 404:
        url_create = f"{ARANGO_HOST}/_api/document/{NODES_COLLECTION}"
        res_create = requests.post(url_create, json={"_key": node_id, **properties}, auth=get_auth())
        verify_write(res_create)
    else:
        verify_write(res)

def log_dispatch_to_graph(task_id, session_id, complexity):
    """Records the dispatch event in ArangoDB with Upsert logic."""
    try:
        upsert_node(task_id, {"type": "task", "status": "dispatched"})
        upsert_node(session_id, {"type": "session", "complexity": complexity, "status": "active"})
        
        edge_url = f"{ARANGO_HOST}/_api/document/{EDGES_COLLECTION}"
        res_edge = requests.post(edge_url, json={
            "_from": f"{NODES_COLLECTION}/{task_id}",
            "_to": f"{NODES_COLLECTION}/{session_id}",
            "label": "dispatched_to"
        }, auth=get_auth())
        # We don't crash on edge conflict since nodes are the primary truth
        if res_edge.status_code not in [201, 202]:
            print(f"Warning: Edge creation failed ({res_edge.status_code}), but nodes are synced.")
        
        print(f"Provenance synced: {task_id} -> {session_id}")
    except Exception as e:
        print(f"CRITICAL PROVENANCE FAILURE: {e}")
        raise e

def get_ready_tasks():
    """Scans beads for #ready tags with exponential backoff."""
    max_retries = 5
    retry_delay = 1
    
    for attempt in range(max_retries):
        try:
            result = subprocess.check_output(["bd", "list", "--status", "open", "--json"], text=True)
            data = json.loads(result)
            ready_tasks = [issue["id"] for issue in data if any("#ready" in label for label in issue.get("labels", []))]
            return ready_tasks
        except subprocess.CalledProcessError as e:
            error_out = e.output.decode() if hasattr(e, 'output') else str(e)
            if "exclusive lock" in error_out or "another process holds the exclusive lock" in error_out:
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (2 ** attempt))
                    continue
            print(f"Error scanning beads: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error scanning beads: {e}")
            return []

def estimate_complexity(task_id):
    import random
    complexities = {"High": 1800, "Medium": 900, "Low": 300}
    level = random.choice(list(complexities.keys()))
    return level, complexities[level]

def dispatch_task(task_id):
    level, timeout = estimate_complexity(task_id)
    print(f"Dispatching {task_id} | Complexity: {level} | Timeout: {timeout}s")
    
    session_id = f"sess_{hash(task_id) & 0xffffffff:x}"
    log_dispatch_to_graph(task_id, session_id, level)
    print(f"COMMAND: sessions_spawn(task='Execute {task_id}', timeoutSeconds={timeout})")
    return session_id

if __name__ == "__main__":
    ready_tasks = get_ready_tasks()
    if not ready_tasks:
        print("No #ready tasks found.")
    else:
        print(f"Found {len(ready_tasks)} ready tasks. Initiating staggered dispatch...")
        print(f"Batch size: {BATCH_SIZE} | Cooldown: {BATCH_COOLDOWN_SECONDS}s")
        
        # Process tasks in controlled waves
        total_tasks = len(ready_tasks)
        batches = [ready_tasks[i:i + BATCH_SIZE] for i in range(0, total_tasks, BATCH_SIZE)]
        
        for batch_num, batch in enumerate(batches, 1):
            print(f"\n=== Batch {batch_num}/{len(batches)} ({len(batch)} tasks) ===")
            
            # Dispatch this batch
            for task in batch:
                try:
                    dispatch_task(task)
                except Exception as e:
                    print(f"Sovereign Fault: Could not dispatch {task} due to provenance failure: {e}")
            
            # Cooldown between batches (except after the last batch)
            if batch_num < len(batches):
                print(f"Batch {batch_num} complete. Cooldown for {BATCH_COOLDOWN_SECONDS}s...")
                time.sleep(BATCH_COOLDOWN_SECONDS)
        
        print(f"\n✓ All {total_tasks} tasks dispatched in {len(batches)} batches.")
