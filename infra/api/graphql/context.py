import os
from typing import Optional
from arango import ArangoClient


class GraphQLContext:
    def __init__(self):
        self._url = os.getenv("ARANGO_URL", "http://localhost:8529")
        self._db_name = os.getenv("ARANGO_DB", "abraxas_db")
        self._user = os.getenv("ARANGO_USER", "root")
        self._password = os.getenv("ARANGO_ROOT_PASSWORD", "password")
        self._client: Optional[ArangoClient] = None
        self._db = None

    @property
    def db(self):
        if self._db is None:
            self._client = ArangoClient(hosts=self._url)
            self._db = self._client.db(
                self._db_name, username=self._user, password=self._password
            )
        return self._db

    def execute_aql(self, query: str, bind_vars: Optional[dict] = None) -> list:
        try:
            cursor = self.db.aql.execute(query, bind_vars=bind_vars or {})
            return [doc for doc in cursor]
        except Exception as e:
            # Log the error for the server admins
            print(f"AQL Execution Error: {e}")
            # We re-raise as a custom exception or a generic one that 
            # we can catch in a global handler. 
            # For now, we let it bubble but ensure we are aware of the specific 
            # python-arango exception type.
            raise e

    def document(self, collection: str, key: str) -> Optional[dict]:
        try:
            return self.db.collection(collection).get(key)
        except Exception:
            return None

    def ensure_db(self):
        try:
            import time
            for attempt in range(5):
                try:
                    sys_client = ArangoClient(hosts=self._url)
                    sys_db = sys_client.db("_system", username=self._user, password=self._password)
                    sys_db.create_database(self._db_name)
                    print(f"Database {self._db_name} created.")
                    return
                except Exception as e:
                    if "duplicate" in str(e).lower() or "1201" in str(e):
                        print(f"Database {self._db_name} already exists.")
                        return
                    time.sleep(2)
            print(f"Warning: Could not ensure database {self._db_name}.")
        except Exception as e:
            print(f"Warning: ensure_db failed: {e}")


_context: Optional[GraphQLContext] = None


def get_graphql_context() -> GraphQLContext:
    global _context
    if _context is None:
        _context = GraphQLContext()
    return _context
