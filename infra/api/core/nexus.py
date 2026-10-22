import hashlib
import json
import time
from typing import List, Optional, Any
from dataclasses import dataclass, asdict

@dataclass
class CognitiveBlock:
    index: int
    timestamp: float
    agent: str  # Logos, Janus, or Agon
    content: Any
    previous_hash: str
    nonce: int = 0
    hash: Optional[str] = None

    def compute_hash(self) -> str:
        # Exclude the hash field itself from the computation
        block_data = {
            "index": self.index,
            "timestamp": self.timestamp,
            "agent": self.agent,
            "content": self.content,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
        }
        block_string = json.dumps(block_data, sort_keys=True).encode('utf-8')
        return hashlib.sha256(block_string).hexdigest()

    def __post_init__(self):
        if self.hash is None:
            self.hash = self.compute_hash()

class NexusChain:
    def __init__(self, storage_path: str = "nexus_ledger.json"):
        self.storage_path = storage_path
        self.chain: List[CognitiveBlock] = self._load_chain()

    def _load_chain(self) -> List[CognitiveBlock]:
        try:
            with open(self.storage_path, 'r') as f:
                data = json.load(f)
                return [CognitiveBlock(**block) for block in data]
        except (FileNotFoundError, json.JSONDecodeError):
            # Create genesis block
            genesis = CognitiveBlock(
                index=0,
                timestamp=time.time(),
                agent="Nexus",
                content="Genesis Block: The Iron Chain Initiated",
                previous_hash="0" * 64
            )
            return [genesis]

    def add_block(self, agent: str, content: Any) -> CognitiveBlock:
        prev_block = self.chain[-1]
        new_block = CognitiveBlock(
            index=len(self.chain),
            timestamp=time.time(),
            agent=agent,
            content=content,
            previous_hash=prev_block.hash
        )
        self.chain.append(new_block)
        self._save_chain()
        return new_block

    def _save_chain(self):
        with open(self.storage_path, 'w') as f:
            json.dump([asdict(block) for block in self.chain], f, indent=2)

    def validate_chain(self) -> tuple[bool, Optional[int]]:
        """
        Returns (is_valid, corrupted_index). 
        If is_valid is True, corrupted_index is None.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]

            # Check if current hash is correct
            if current.hash != current.compute_hash():
                return False, i
            
            # Check if linked to previous hash
            if current.previous_hash != previous.hash:
                return False, i
        
        return True, None

# Global instance for the API core
nexus = NexusChain()
