import requests
import json
from arango import ArangoClient
import sys

# Configuration
ARANGO_URL = "http://arangodb-test:8529"
ARANGO_DB = "abraxas_test_db"
ARANGO_USER = "root"
ARANGO_PASS = "testpassword"
GRAPHQL_URL = "http://abraxas-graphql-test:4000/graphql"

def setup_db():
    print("Setting up test database...")
    client = ArangoClient(hosts=ARANGO_URL)
    sys_db = client.db("_system", username=ARANGO_USER, password=ARANGO_PASS)
    
    # Ensure DB exists
    try:
        sys_db.create_database(ARANGO_DB)
    except Exception as e:
        if "duplicate" not in str(e).lower():
            print(f"Error creating DB: {e}")
            sys.exit(1)

    db = client.db(ARANGO_DB, username=ARANGO_USER, password=ARANGO_PASS)
    
    # Create collections
    collections = ["tasks", "task_edges"]
    existing_cols = db.collections()
    for col in collections:
        if col not in existing_cols:
            db.create_collection(col)

    return db

def poison_data():
    print("Poisoning data...")
    db = setup_db()
    
    # We use AQL to insert data to avoid driver-level validation
    # Insert some valid tasks
    db.aql.execute("""
        FOR i IN 1..3
            INSERT { title: CONCAT("Valid Task ", i), status: "ready" } INTO tasks
    """)
    
    # Insert a task that is 'open' but blocked (should not be 'ready')
    db.aql.execute("""
        INSERT { title: "Blocked Task", status: "open" } INTO tasks
    """)
    # Note: In a real scenario, we'd need the _key of the blocked task to create the edge.
    # For this smoke test, we're testing the resolver's ability to handle the list.
    
    # To simulate the 'str' object error, we need the AQL query to return a mixed list.
    # Since a normal 'RETURN t' always returns dicts, the error likely happens
    # when the result is somehow cast or handled as a string.
    # We'll insert a document with a malformed structure.
    db.aql.execute("""
        INSERT { title: "Malformed Task", status: 123, something: "wrong" } INTO tasks
    """)
    
    print("Data injection complete.")

def test_graphql():
    print("Executing GraphQL query...")
    query = "{ readyTasks { id title } }"
    try:
        response = requests.post(GRAPHQL_URL, json={"query": query}, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if "errors" in response.json():
            print("❌ FAILED: GraphQL returned errors")
            for err in response.json()["errors"]:
                print(f"Error: {err['message']}")
        else:
            print("✅ SUCCESS: No errors returned")
            
    except Exception as e:
        print(f"❌ CRASHED: {e}")

if __name__ == "__main__":
    poison_data()
    test_graphql()
