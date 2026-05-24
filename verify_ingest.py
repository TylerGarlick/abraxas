import os
import json
import logging
from arango import ArangoClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("verify-ingest")

def verify():
    host = "http://178.105.173.60:8529"
    db_name = "abraxas_prod"
    username = "root"
    password = "password"
    
    client = ArangoClient(hosts=host)
    db = client.db(db_name, username=username, password=password)
    
    results = {}
    
    collections = ["memory_entities", "memory_relations", "memory_events", "memory_markdown"]
    for col_name in collections:
        try:
            col = db.collection(col_name)
            count = col.count()
            results[col_name] = count
            logger.info(f"Collection {col_name}: {count} documents")
        except Exception as e:
            logger.error(f"Error checking collection {col_name}: {e}")
            results[col_name] = "Error"

    # Verify a specific entity (e.g., Tyler Garlick)
    try:
        doc = db.collection("memory_entities").get("pers_dd13328c")
        results["tyler_verify"] = "OK" if doc else "NOT FOUND"
    except Exception as e:
        results["tyler_verify"] = f"Error: {e}"

    return results

if __name__ == "__main__":
    res = verify()
    print(json.dumps(res, indent=2))
