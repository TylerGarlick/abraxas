from dataclasses import dataclass
from typing import Optional
import datetime
from scripts.db_client import get_db

db = get_db()

@dataclass
class Fragment:

    id: str
    fragment: str
    provenance: str
    timestamp: str

class MnemosyneLogic:
    def __init__(self):
        self.collection = "fragments"
        # Ensure collection exists
        db.ensure_collection(self.collection, edge=False)

    def recall(self, query: str) -> Optional[Fragment]:
        aql = f"FOR f IN {self.collection} FILTER CONTAINS(LOWER(f.fragment), LOWER(@query)) OR f.id == @query RETURN f"
        res = db.query(aql, bind_vars={"query": query})
        
        if res:
            f = res[0]
            return Fragment(
                id=f.get("id", f["_key"]),
                fragment=f["fragment"],
                provenance=f["provenance"],
                timestamp=f["timestamp"]
            )
        return None

    def store(self, fragment: str, provenance: str) -> str:
        now = datetime.datetime.utcnow().isoformat()
        new_id = f"frag_{int(datetime.datetime.now().timestamp() * 1000)}"
        doc = {
            "id": new_id,
            "fragment": fragment,
            "provenance": provenance,
            "timestamp": now
        }
        
        res_id = db.insert(self.collection, doc)
        return res_id

# Singleton instance
mnemosyne_logic = MnemosyneLogic()
