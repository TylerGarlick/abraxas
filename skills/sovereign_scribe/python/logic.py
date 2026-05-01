import datetime
import random
from typing import Dict, Any, Optional
from skills.common.mcp_client import MCPClient

class SovereignScribeLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SovereignScribeLogic, cls).__new__(cls)
        return cls._instance

    def run_gauntlet(self, fragment: str, source: str) -> Dict[str, Any]:
        """
        Coordinates the ingestion loop: 
        External Data -> Soter -> Episteme -> Ethos -> Mnemosyne
        """
        # 1. Soter Risk Scan
        try:
            risk_score = MCPClient.call_tool(
                "soter-verifier", 
                "verify_risk", 
                {"text": fragment}
            )
            # Expecting a numeric risk score or a result object with a 'score' key
            score = risk_score["score"] if isinstance(risk_score, dict) else risk_score
        except Exception as e:
            raise RuntimeError(f"Sovereign Gauntlet failed at Soter stage: {str(e)}")

        if score > 3:
            return {
                "status": "REJECTED",
                "reason": "Soter Risk Threshold Exceeded",
                "riskScore": score,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }

        # 2. Episteme Provenance Mapping
        try:
            provenance_result = MCPClient.call_tool(
                "aletheia-truth", 
                "episteme_trace", 
                {"claim": fragment, "context": f"Source: {source}"}
            )
            # Extract code like [RET] or [INF] from the result string
            import re
            match = re.search(r"\[([A-Z]+)\]", provenance_result)
            provenance = match.group(1) if match else "DIR"
        except Exception as e:
            raise RuntimeError(f"Sovereign Gauntlet failed at Episteme stage: {str(e)}")
        
        # 3. Ethos Weighting
        try:
            # We map the internal origin code to an Ethos weight
            weight = MCPClient.call_tool(
                "ethos", 
                "weight_provenance", 
                {"provenance": provenance}
            )
        except Exception as e:
            raise RuntimeError(f"Sovereign Gauntlet failed at Ethos stage: {str(e)}")
        
        # 4. Mnemosyne Commitment
        try:
            commitment = MCPClient.call_tool(
                "mnemosyne-memory", 
                "commit_fragment", 
                {"text": fragment, "provenance": provenance, "weight": weight}
            )
        except Exception as e:
            raise RuntimeError(f"Sovereign Gauntlet failed at Mnemosyne stage: {str(e)}")
        
        return {
            "status": "PROMOTED",
            "result": commitment,
            "provenance": provenance,
            "weight": weight,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
