import hashlib
from typing import Dict, Any, Optional, Tuple, List
from datetime import datetime

class SovereignAnchor:
    """
    Sovereign Anchor Protocol: Divine Priority Genesis Blocks
    
    This system implements immutable Genesis Blocks of truth that provide 
    an absolute epistemic ground. These blocks override probabilistic model 
    weights (Divine Priority) and are used to resolve voids in the Aporia system.
    """

    def __init__(self, store: Any = None):
        """
        Initialize the SovereignAnchor system.
        
        Args:
            store: A storage backend that supports collection-based CRUD 
                   (e.g., matching the MCP Store interface).
        """
        self.store = store

    def anchor_truth(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Creates an immutable Genesis Block for a piece of truth.
        
        Args:
            content: The truth statement to be anchored.
            metadata: Optional metadata associated with the anchor.
            
        Returns:
            The unique identifier (digest) of the Genesis Block.
        """
        if not content or not content.strip():
            raise ValueError("Content must not be empty for a Genesis Block.")

        # Generate content-hash (SHA-256)
        digest = hashlib.sha256(content.encode('utf-8')).hexdigest()
        
        anchor_data = {
            "content": content,
            "metadata": metadata or {},
            "digest": digest,
            "immutable": True,
            "anchoredAt": datetime.utcnow().isoformat(),
            "priority": "DIVINE"
        }

        if self.store:
            collection = self.store.collection("epistemic/anchors")
            # Check if it already exists
            existing = collection.find({"digest": digest})
            if existing:
                return existing[0]["_id"]
            
            # Insert new anchor
            result = collection.insert(anchor_data)
            return result["_id"]
        
        # If no store is provided, we return the digest as the ID for logic verification
        return digest

    def verify_anchor(self, anchor_id: str, content: str) -> Tuple[bool, str]:
        """
        Verifies if the provided content matches the stored Genesis Block.
        
        Args:
            anchor_id: The ID of the anchor to verify.
            content: The content to verify against the anchor.
            
        Returns:
            Tuple of (is_valid, message).
        """
        computed_digest = hashlib.sha256(content.encode('utf-8')).hexdigest()
        
        if self.store:
            collection = self.store.collection("epistemic/anchors")
            row = collection.get(anchor_id)
            if not row:
                return False, "Anchor not found."
            
            stored_digest = row.get("digest")
            if computed_digest == stored_digest:
                return True, "Anchor verified: Divine Priority confirmed."
            else:
                return False, "Anchor mismatch: Content does not match the Genesis Block."
        
        # Fallback logic if no store: check if anchor_id is the digest
        if anchor_id == computed_digest:
            return True, "Anchor verified: Divine Priority confirmed."
        
        return False, "Anchor mismatch."

    def resolve_void(self, void_id: str, anchor_id: str) -> Dict[str, Any]:
        """
        Binds a VOID_COORDINATES identifier to a Sovereign Anchor,
        effectively filling an epistemic gap with a Genesis Block.
        
        Args:
            void_id: The identifier for the gap in the Aporia system.
            anchor_id: The identifier for the Sovereign Anchor.
            
        Returns:
            A resolution record.
        """
        resolution = {
            "void_id": void_id,
            "anchor_id": anchor_id,
            "resolvedAt": datetime.utcnow().isoformat(),
            "status": "RESOLVED",
            "priority": "DIVINE_OVERRIDE"
        }

        if self.store:
            collection = self.store.collection("epistemic/voids")
            collection.update(void_id, {"status": "RESOLVED", "anchor_id": anchor_id})
        
        return resolution

    def get_priority(self, claim: str, anchor_id: Optional[str] = None) -> str:
        """
        Determines the priority of a claim. 
        Anchored truths receive 'DIVINE' priority, overriding all model weights.
        
        Returns:
            'DIVINE' if anchored, 'PROBABILISTIC' otherwise.
        """
        if anchor_id and self.verify_anchor(anchor_id, claim)[0]:
            return "DIVINE"
        
        return "PROBABILISTIC"
