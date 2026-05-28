import os
from typing import Any, Dict, List, Optional
from arango import ArangoClient

class SovereignGraphClient:
    """
    Skeletal Graph Client for Abraxas v4.1.
    Handles all interactions with the ArangoDB Provenance Graph.
    """
    def __init__(self):
        # Fix: Force localhost for host-side execution if 'arangodb' is in URL
        env_url = os.getenv("ARANGO_URL", "http://localhost:8529")
        self.url = env_url.replace("arangodb", "localhost")
        self.db_name = os.getenv("ARANGO_DB", "abraxas_db")
        self.user = os.getenv("ARANGO_USER", "root")
        self.password = os.getenv("ARANGO_ROOT_PASSWORD", "5orange5")
        
        self.client = ArangoClient(hosts=self.url)
        self.db = self.client.db(self.db_name, username=self.user, password=self.password)


    def ensure_skeleton_collections(self):
        """
        Ensures all v4.1 skeletal collections exist.
        This is the deterministic check required before server start.
        """
        doc_colls = ['fragments', 'claims', 'events']
        edge_colls = ['DERIVED_FROM', 'NEXT_STEP', 'SUPERSEDES', 'DEPENDS_ON', 'REINFORCES', 'TENSIONS_WITH', 'IMPLIES']
        
        # Verify document collections
        for coll in doc_colls:
            if not self.db.has_collection(coll):
                self.db.create_collection(coll)
        
        # Verify edge collections
        for coll in edge_colls:
            if not self.db.has_collection(coll):
                self.db.create_collection(coll, edge=True)

        # Ensure the SovereignGraph is formally defined as a graph object
        try:
            self.db.create_graph('SovereignGraph', edge_collections=edge_colls)
        except Exception:
            pass # Graph already exists

    def add_fragment(self, content: str, provenance_id: str, trust_weight: float = 1.0) -> str:
        """Adds a truth fragment to the vault."""
        coll = self.db.collection('fragments')
        doc = {
            "content": content,
            "provenance_id": provenance_id,
            "trust_weight": trust_weight
        }
        return coll.insert(doc)['_id']

    def create_claim(self, conclusion: str, evidence_ids: List[str]) -> str:
        """Creates a claim and links it to its evidence via DERIVED_FROM edges."""
        claim_coll = self.db.collection('claims')
        edge_coll = self.db.collection('DERIVED_FROM')
        
        claim_id = claim_coll.insert({"conclusion": conclusion})['_id']
        
        for eid in evidence_ids:
            edge_coll.insert({
                "_from": claim_id,
                "_to": eid,
                "type": "evidential"
            })
        return claim_id

    def get_provenance_chain(self, claim_id: str) -> List[Dict[str, Any]]:
        """
        Performs the 'Sovereign Receipt' traversal.
        Tours the graph from a claim back to its root fragments.
        """
        # Using a generic traversal instead of a named graph to avoid AQL 404s if the graph object isn't synced
        query = """
        FOR v, e IN 1..1 OUTBOUND @start_node DERIVED_FROM
        RETURN {
            node: v,
            edge: e
        }
        """
        cursor = self.db.aql.execute(query, bind_vars={"start_node": claim_id})
        return [doc for doc in cursor]

    def get_fragments_with_priority(self, query: str) -> List[Dict[str, Any]]:
        """
        Fetches fragments matching the query with Divine Priority sorting.
        Fragments with is_genesis == True come first (Divine Priority),
        then sorted by trust_weight DESC.
        """
        aql = """
        FOR f IN fragments
            FILTER CONTAINS(f.content, @q)
            SORT f.is_genesis DESC, f.trust_weight DESC
            RETURN f
        """
        cursor = self.db.aql.execute(aql, bind_vars={"q": query})
        return [doc for doc in cursor]
