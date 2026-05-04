import os
import json
from typing import Any, Dict, List, Optional
from mcp.server.fastmcp import FastMCP
from arango import ArangoClient

# Initialize FastMCP server
mcp = FastMCP("arangodb-manager")

# Environment Configuration
ARANGO_URL = os.getenv("ARANGO_URL", "http://arangodb:8529")
ARANGO_DB = os.getenv("ARANGO_DB", "abraxas")
ARANGO_USER = os.getenv("ARANGO_USER", "root")
ARANGO_ROOT_PASSWORD = os.getenv("ARANGO_ROOT_PASSWORD", "")

def get_db_connection():
    """
    Returns a connection to the ArangoDB database.
    Ensures the database exists, creating it if necessary.
    """
    client = ArangoClient(hosts=ARANGO_URL)
    
    # Use root credentials to check/create database
    sys_db = client.db('_system', username=ARANGO_USER, password=ARANGO_ROOT_PASSWORD)
    
    if not sys_db.has_database(ARANGO_DB):
        sys_db.create_database(ARANGO_DB)
    
    return client.db(ARANGO_DB, username=ARANGO_USER, password=ARANGO_ROOT_PASSWORD)

@mcp.tool()
def execute_aql(query: str, bind_vars: Optional[Dict[str, Any]] = None) -> List[Any]:
    """
    Executes a raw AQL query against the ArangoDB database.
    :param query: The AQL query string.
    :param bind_vars: Optional mapping of variables to values.
    """
    try:
        db = get_db_connection()
        cursor = db.aql.execute(query, bind_vars=bind_vars or {})
        return [doc for doc in cursor]
    except Exception as e:
        return [{"error": str(e)}]

@mcp.tool()
def seed_database(json_path: str) -> Dict[str, Any]:
    """
    Seeds the ArangoDB database using a JSON file.
    The JSON file should be relative to the workspace root (/workspace).
    Format: { "collections": { "name": { "type": "document|edge", "data": [...] } } }
    """
    # Ensure we are looking in /workspace if running in Docker
    full_path = json_path if json_path.startswith('/') else f"/workspace/{json_path}"
    
    try:
        with open(full_path, 'r') as f:
            seed_data = json.load(f)
        
        db = get_db_connection()
        results = {}
        
        collections = seed_data.get("collections", {})
        for coll_name, config in collections.items():
            coll_type = config.get("type", "document")
            data = config.get("data", [])
            
            # Create collection if it doesn't exist
            if not db.has_collection(coll_name):
                if coll_type == "edge":
                    db.create_collection(coll_name, edge=True)
                else:
                    db.create_collection(coll_name)
            
            coll = db.collection(coll_name)
            
            # Bulk insert/upsert data
            # For simplicity in seeding, we use a bulk import approach
            # If 'data' is a list of docs, we insert them
            if data:
                coll.import_json(data) # Note: python-arango might require a file for import_json
                # Fallback to manual loop if import_json isn't the preferred API for lists
                for item in data:
                    coll.insert(item)
            
            results[coll_name] = f"Successfully processed {len(data)} items"
            
        return {"status": "success", "details": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@mcp.tool()
def manage_schema(action: str, collection_name: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Dynamically manages the ArangoDB schema.
    Actions: 'create_collection', 'delete_collection', 'create_index'.
    """
    try:
        db = get_db_connection()
        params = params or {}
        
        if action == "create_collection":
            is_edge = params.get("edge", False)
            db.create_collection(collection_name, edge=is_edge)
            return {"status": "success", "message": f"Collection {collection_name} created."}
            
        elif action == "delete_collection":
            db.drop_collection(collection_name)
            return {"status": "success", "message": f"Collection {collection_name} deleted."}
            
        elif action == "create_index":
            coll = db.collection(collection_name)
            fields = params.get("fields", [])
            type_ = params.get("type", "persistent")
            coll.add_hash([f for f in fields]) if type_ == "hash" else coll.add_skiplist([f for f in fields])
            return {"status": "success", "message": f"Index created on {collection_name} for {fields}"}
            
        else:
            return {"status": "error", "message": f"Unsupported action: {action}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    mcp.run()
