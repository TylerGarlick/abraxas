import os
import pytest
import importlib
from scripts.db_client import get_db, AbraxasDB

@pytest.fixture(scope="session", autouse=True)
def setup_test_db_env():
    """
    Global fixture to ensure tests run against abraxas_test.
    Overrides ARANGO_DB and refreshes the database singleton.
    """
    # 1. Set environment to test database
    os.environ["ARANGO_DB"] = "abraxas_test"
    
    # 2. Refresh the singleton if it was already initialized
    # Since we changed scripts.db_client.db to be a function/nullable,
    # we can force a re-initialization.
    import scripts.db_client as db_client
    db_client.db = None # Reset singleton
    
    # 3. Verify connectivity to the test DB
    try:
        test_db = get_db()
        assert test_db.db_name == "abraxas_test"
    except Exception as e:
        pytest.fail(f"Could not connect to test database 'abraxas_test': {e}")

@pytest.fixture
def db():
    """
    Provides the test database instance to individual tests.
    """
    return get_db()
