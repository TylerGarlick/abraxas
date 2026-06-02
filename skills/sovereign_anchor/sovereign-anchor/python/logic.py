from typing import Dict, Any, Optional
import logging
from infra.mcp.db_manager import DBManager
from infra.mcp.context import AbraxasContext

logger = logging.getLogger("sovereign-anchor")


class SovereignAnchor:
    """
    The Sovereign Anchor is the privileged write-operation for the Sovereign Brain.
    It creates immutable 'Genesis Blocks' (anchored truths) in the ArangoDB vault.
    """

    def __init__(self, db_manager: DBManager):
        self.db_manager = db_manager

    def anchor_truth(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """ Injects a truth fragment as an immutable Genesis Block."""
        if not self.db_manager.db:
            raise RuntimeError("Database not connected")

        col = self.db_manager.db.collection("fragments")

        # Ensure uniqueness via hash or key
        anchor_id = f"GENESIS_{hash(content)}"

        document = {
            "key": anchor_id,
            "content": content,
            "type": "GENESIS_BLOCK",
            "immutable": True,
            "metadata": metadata or {},
            "timestamp": "Sovereign_Time_0"
        }

        try:
            col.insert(document)
            logger.info(f"Sovereign Anchor: Successfully injected Genesis Block {anchor_id}")
            return anchor_id
        except Exception as e:
            logger.error(f"Sovereign Anchor failed to inject: {e}")
            raise e
