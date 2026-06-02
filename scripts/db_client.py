import os
import logging
from typing import Any, Dict, List, Optional
from python_arango import ArangoClient


logger = logging.getLogger(__name__)

class AbraxasDB:
    """
    Sovereign Brain Database Client.
    Provides a simplified interface to ArangoDB.
    """
    def __init__(self):
        self.url = os.environ.get("ARANGO_URL", "http://arangodb:8529")
        self.user = os.environ.get("ARANGO_USER", "root")
        self.password = os.environ.get("ARANGO_ROOT_PASSWORD", "password")
        self.db_name = os.environ.get("ARANGO_DB", "abraxas_prod")
        
        try:
            self.client = ArangoClient(hosts=self.url)
            self.sys_db = self.client.db("_system", password=self.password)
            
            # Ensure the product DB exists
            if not self.sys_db.databases().get(self.db_name):
                self.sys_db.create_database(self.db_name)
            
            self.db = self.client.db(self.db_name, password=self.password)
            logger.info(f"Connected to ArangoDB at {self.url}, DB: {self.db_name}")
        except Exception as e:
            logger.error(f"Failed to initialize ArangoDB connection: {e}")
            self.db = None

    def ensure_collection(self, name: str, edge: bool = False):
        """Ensures a collection exists."""
        if not self.db: return
        try:
            if self.db.collections().get(name):
                return
            self.db.create_collection(name, edge=edge)
            logger.info(f"Created collection: {name}")
        except Exception as e:
            logger.error(f"Error ensuring collection {name}: {e}")

    def query(self, aql: str, bind_vars: Dict[str, Any] = None) -> List[Any]:
        """Executes an AQL query."""
        if not self.db: return []
        try:
            return self.db.aql.execute(aql, bind_vars=bind_vars or {})
        except Exception as e:
            logger.error(f"AQL Query failed: {aql} | Error: {e}")
            return []

    def insert(self, collection: str, document: Dict[str, Any]) -> str:
        """Inserts a document into a collection."""
        if not self.db: return ""
        try:
            res = self.db.collection(collection).insert(document)
            return res['_id']
        except Exception as e:
            logger.error(f"Insert failed for {collection}: {e}")
            return ""

    def update(self, doc_id: str, collection: str, document: Dict[str, Any]) -> bool:
        """Updates a document in a collection."""
        if not self.db: return False
        try:
            self.db.collection(collection).update(doc_id, document)
            return True
        except Exception as e:
            logger.error(f"Update failed for {doc_id} in {collection}: {e}")
            return False

    def delete(self, doc_id: str, collection: str) -> bool:
        """Deletes a document from a collection."""
        if not self.db: return False
        try:
            self.db.collection(collection).delete(doc_id)
            return True
        except Exception as e:
            logger.error(f"Delete failed for {doc_id} in {collection}: {e}")
            return False

    def collection(self, name: str):
        """Returns the collection object."""
        if not self.db: return None
        return self.db.collection(name)

def get_db():
    """Singleton getter for the DB client."""
    if not hasattr(get_db, "_instance"):
        get_db._instance = AbraxasDB()
    return get_db._instance
