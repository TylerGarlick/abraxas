import hashlib
import time
import os
from typing import List, Dict, Any, Optional, Tuple, Union
from dataclasses import dataclass, asdict

@dataclass
class CognitiveBlock:
    index: int
    timestamp: float
    content: str
    previous_hash: str
    verified: bool = False  # The "Grounding Anchor"

    def compute_hash(self) -> str:
        block_string = f"{self.index}{self.timestamp}{self.content}{self.previous_hash}{self.verified}"
        return hashlib.sha256(block_string.encode()).hexdigest()

class SovereignNexus:
    """
    Sovereign-Nexus: The Block Chain of Thought.
    Implements a verifiable sequence of reasoning where no single link 
    can be changed without breaking the entire chain of truth.
    """
    def __init__(self, graph_client):
        self.graph_client = graph_client
        # We use the 'events' collection in ArangoDB as our immutable ledger
        self.events_coll = graph_client.db.collection("events")

    def create_block(self, session_id: str, content: str, verified: bool = False) -> str:
        """
        Appends a new cognitive event to the chain.
        """
        # 1. Retrieve the last block for this session to get the previous hash
        last_block = self._get_last_block(session_id)
        
        index = 0
        prev_hash = "0" * 64
        if last_block:
            index = last_block['index'] + 1
            prev_hash = last_block['current_hash']

        # 2. Construct the new block
        block = CognitiveBlock(
            index=index,
            timestamp=time.time(),
            content=content,
            previous_hash=prev_hash,
            verified=verified
        )
        
        # 3. Hash and store
        block_data = asdict(block)
        block_data['current_hash'] = block.compute_hash()
        block_data['session_id'] = session_id
        
        return self.events_coll.insert(block_data)['_id']

    def _get_last_block(self, session_id: str) -> Optional[Dict]:
        query = """
        FOR e IN events
            FILTER e.session_id == @sid
            SORT e.index DESC
            LIMIT 1
            RETURN e
        """
        cursor = self.graph_client.db.aql.execute(query, bind_vars={"sid": session_id})
        results = list(cursor)
        return results[0] if results else None

    def validate_chain(self, session_id: str) -> Tuple[bool, str]:
        """
        Verifies the integrity of the entire reasoning chain.
        """
        query = """
        FOR e IN events
            FILTER e.session_id == @sid
            SORT e.index ASC
            RETURN e
        """
        cursor = self.graph_client.db.aql.execute(query, bind_vars={"sid": session_id})
        blocks = list(cursor)
        
        prev_hash = "0" * 64
        block_list = list(blocks)
        
        if not block_list:
            return False, "Chain is empty."

        # Genesis Block Verification
        if not block_list[0].get('verified', False):
            return False, "Genesis Block not verified by Human Anchor."

        for block in block_list:
            # Recalculate hash
            expected_hash = CognitiveBlock(
                index=block['index'],
                timestamp=block['timestamp'],
                content=block['content'],
                previous_hash=block['previous_hash'],
                verified=block['verified']
            ).compute_hash()
            
            if block['current_hash'] != expected_hash:
                return False, f"Hash mismatch at block {block['index']}"
            
            if block['previous_hash'] != prev_hash:
                return False, f"Chain broken at block {block['index']}"
            
            prev_hash = block['current_hash']

        return True, "Chain Verified: Grounded in reality."

    def generate_receipt(self, session_id: str) -> str:
        """
        Transforms the internal hash-chain into a human-readable Sovereign Receipt.
        """
        valid, msg = self.validate_chain(session_id)
        query = """
        FOR e IN events
            FILTER e.session_id == @sid
            SORT e.index ASC
            RETURN e
        """
        cursor = self.graph_client.db.aql.execute(query, bind_vars={"sid": session_id})
        blocks = list(cursor)
        
        receipt = [f"Sovereign Receipt: {msg}"]
        receipt.append("-" * 40)
        
        for b in blocks:
            status = "✅" if b['verified'] else "⚙️"
            receipt.append(f"{status} Block {b['index']} | Hash: {b['current_hash'][:8]}... | {b['content']}")
            
        return "\n".join(receipt)
