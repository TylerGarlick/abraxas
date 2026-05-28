from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging
import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sovereign-gauntlet")

@dataclass
class IngestionFragment:
    content: str
    source: str
    provenance: str = "UNKNOWN"
    weight: float = 0.0
    risk_score: float = 0.0
    status: str = "RAW"

class GauntletRunner:
    """
    Sovereign Gauntlet: Orchestrates the sequence Soter -> Episteme -> Ethos -> Mnemosyne.
    Ensures no external data enters the reservoir without rigorous verification.
    """
    def __init__(self, mcp_client: Any):
        self.mcp = mcp_client

    async def process_fragment(self, fragment: IngestionFragment) -> Optional[IngestionFragment]:
        """
        Runs a fragment through the Gauntlet. Returns the promoted fragment or None if discarded.
        """
        logger.info(f"Running Gauntlet for fragment from {fragment.source}...")

        # 1. Soter Scan (Risk Analysis)
        # Tool call: soter_scan
        risk_result = await self.mcp.call_tool("soter_scan", {"text": fragment.content})
        fragment.risk_score = risk_result.get("score", 5.0)
        
        if fragment.risk_score > 3.0:
            logger.warning(f"FRAGMENT DISCARDED: Soter risk score {fragment.risk_score} too high.")
            return None

        # 2. Episteme Mapping (Provenance)
        # Tool call: episteme_map
        provenance_result = await self.mcp.call_tool("episteme_map", {"source": fragment.source})
        fragment.provenance = provenance_result.get("tag", "EXT-Public")

        # 3. Ethos Weighting (Authority)
        # Tool call: ethos_weight
        weight_result = await self.mcp.call_tool("ethos_weight", {"provenance": fragment.provenance})
        fragment.weight = weight_result.get("weight", 0.1)

        # 4. Mnemosyne Commit (Promotion)
        # Tool call: mnemosyne_commit
        commit_success = await self.mcp.call_tool("mnemosyne_commit", {
            "payload": fragment.content,
            "provenance": fragment.provenance,
            "weight": fragment.weight,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })

        if commit_success:
            fragment.status = "PROMOTED"
            logger.info(f"FRAGMENT PROMOTED to Reservoir. Weight: {fragment.weight}")
            return fragment
        
        return None
