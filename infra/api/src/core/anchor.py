import os
import logging
from typing import Dict, Any, Tuple
from infra.api.src.core.graph import SovereignGraphClient

logger = logging.getLogger("sovereign-anchor")

class SovereignAnchor:
    """
    Sovereign Anchor Protocol.
    Allows the Human-Sovereign to inject immutable 'Genesis Blocks' 
    that override all probabilistic AI reasoning.
    """
    def __init__(self, graph_client: SovereignGraphClient):
        self.graph_client = graph_client

    def anchor_truth(self, content: str, provenance_id: str) -> str:
        """
        Injects a verified truth into the vault with a Divine weight (1.0).
        This creates a 'Genesis Block' that the system must treat as absolute.
        """
        # 1. Add as a high-weight fragment
        frag_id = self.graph_client.add_fragment(
            content=content, 
            provenance_id=provenance_id, 
            trust_weight=1.0
        )
        
        # 2. Mark the fragment as verified (Genesis Block status)
        # We use the 'fragments' collection to add a 'verified' flag
        self.graph_client.db.collection("fragments").update(
            {"_key": frag_id.split("/")[-1], "verified": True, "is_genesis": True}
        )
        
        logger.info(f"Sovereign Anchor established: {provenance_id} -> {frag_id}")
        return frag_id

    def verify_genesis(self, fragment_id: str) -> bool:
        """Checks if a fragment is a Human-Anchored Genesis Block."""
        frag = self.graph_client.db.collection("fragments").get(fragment_id)
        return frag.get("verified", False) and frag.get("is_genesis", False)
