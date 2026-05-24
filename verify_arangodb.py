
import os
from arango import ArangoClient

# Connection parameters from docker inspect
ARANGO_URL = "http://178.105.173.60:8529"
ARANGO_USER = "root"
ARANGO_PASSWORD = "TheBestPassword!"
ARANGO_DB = "abraxas_prod"
COLLECTION = "provenance_traces"

def test_epistemic_record():
    print(f"Connecting to ArangoDB at {ARANGO_URL}...")
    client = ArangoClient(hosts=ARANGO_URL)
    
    try:
        db = client.db(ARANGO_DB, username=ARANGO_USER, password=ARANGO_PASSWORD)
        print(f"Connected to database: {ARANGO_DB}")
        
        # 1. Ensure collection exists
        if not db.has_collection(COLLECTION):
            print(f"Creating collection {COLLECTION}...")
            db.create_collection(COLLECTION)
        
        # 2. Save a test provenance record
        test_id = "test_record_mj_verification"
        record = {
            "_key": test_id,
            "event": "verification_cycle",
            "timestamp": "2026-05-23T19:40:00Z",
            "details": "End-to-end validation of Permanent Epistemic Record",
            "status": "initial"
        }
        print(f"Saving record {test_id}...")
        try:
            db.collection(COLLECTION).insert(record)
        except Exception as e:
            if "unique constraint violated" in str(e):
                print("Record already exists, using existing record for test...")
                # We'll just use it and update it later, but for a clean test, 
                # let's just delete it first if it exists.
                db.collection(COLLECTION).delete(test_id)
                db.collection(COLLECTION).insert(record)
            else:
                raise e
        
        # 3. Retrieve and verify
        print(f"Retrieving record {test_id}...")
        retrieved = db.collection(COLLECTION).get(test_id)
        assert retrieved['_key'] == test_id
        assert retrieved['status'] == "initial"
        print("Retrieval successful.")
        
        # 4. Update the record
        print(f"Updating record {test_id}...")
        update_data = {
            "_key": test_id,
            "status": "updated"
        }
        # Use replace to ensure the state change is atomic and visible
        db.collection(COLLECTION).replace({"_key": test_id}, update_data)
        
        # Verify update
        updated = db.collection(COLLECTION).get(test_id)
        assert updated['status'] == "updated"
        print("Update successful.")
        
        # 5. Delete the record
        print(f"Deleting record {test_id}...")
        db.collection(COLLECTION).delete(test_id)
        
        # Verify deletion
        exists = db.collection(COLLECTION).has(test_id)
        assert not exists
        print("Deletion successful.")
        
        print("\n✅ Full test cycle completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise e

if __name__ == "__main__":
    test_epistemic_record()
