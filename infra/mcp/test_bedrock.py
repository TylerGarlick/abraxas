import os
from infra.mcp.context import get_context
from infra.mcp.db_manager import DBManager

def run_bedrock_test():
    print("🚀 Starting Bedrock Verification Test...")
    context = get_context()
    db_manager = DBManager(context)
    
    if not db_manager.connect():
        print("❌ DB Connection Failed")
        return

    # 1. Test Schema
    print("Checking schema...")
    db_manager.initialize_schema()
    
    # 2. Test Data Saving (SovereignAnchor pattern)
    print("Testing data persistence...")
    col = db_manager.db.collection("fragments")
    test_key = "TEST_ANCHOR_001"
    test_doc = {
        "key": test_key,
        "content": "Bedrock Test Claim: The system can save data.",
        "type": "TEST_BLOCK",
        "immutable": True
    }
    
    try:
        col.insert(test_doc)
        print(f"✅ Successfully saved test document: {test_key}")
    except Exception as e:
        print(f"❌ Save failed: {e}")
        return

    # 3. Test Retrieval
    print("Testing data retrieval...")
    retrieved = col.get(test_key)
    if retrieved and retrieved['content'] == test_doc['content']:
        print(f"✅ Successfully retrieved and verified document: {retrieved['content']}")
    else:
        print(f"❌ Retrieval mismatch or failure: {retrieved}")

    # 4. Check SVR_Evidence
    print("Checking SVR_Evidence collection...")
    if db_manager.db.has_collection("SVR_Evidence"):
        print("✅ SVR_Evidence collection exists.")
    else:
        print("❌ SVR_Evidence collection MISSING.")

if __name__ == "__main__":
    run_bedrock_test()
