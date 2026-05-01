import json
import os
import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class Fragment:
    id: str
    fragment: str
    provenance: str
    timestamp: str

class MnemosyneLogic:
    def __init__(self):
        # Use a path relative to the current project structure or a provided env var
        self.vault_path = os.getenv("SOVEREIGN_VAULT_PATH", "/tmp/sovereign_vault.json")
        self._init_vault()

    def _init_vault(self):
        import os
        import json
        os.makedirs(os.path.dirname(self.vault_path), exist_ok=True)
        if not os.path.exists(self.vault_path):
            self._write_vault({"fragments": []})

    def _read_vault(self) -> Dict[str, Any]:
        import json
        with open(self.vault_path, "r") as f:
            return json.load(f)

    def _write_vault(self, data: Dict[str, Any]):
        import json
        with open(self.vault_path, "w") as f:
            json.dump(data, f, indent=2)

    def recall(self, query: str) -> Optional[Fragment]:
        vault = self._read_vault()
        fragments = vault.get("fragments", [])
        
        for f in fragments:
            if query.lower() in f["fragment"].lower() or f["id"] == query:
                return Fragment(**f)
        return None

    def store(self, fragment: str, provenance: str) -> str:
        vault = self._read_vault()
        
        new_id = f"frag_{int(datetime.datetime.now().timestamp() * 1000)}"
        new_frag = {
            "id": new_id,
            "fragment": fragment,
            "provenance": provenance,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        vault["fragments"].append(new_frag)
        self._write_vault(vault)
        return new_id

# Singleton instance
mnemosyne_logic = MnemosyneLogic()
