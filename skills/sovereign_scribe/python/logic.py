import datetime
import random
from typing import Dict, Any, Optional
from skills.common.graphql_client import gql_client
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
            
            # Log the incident via GraphQL
            gql_client.execute(
                """
                mutation($input: SoterIncidentInput!) {
                    createIncident(input: $input) {
                        id
                    }
                }
                """,
                {"input": {
                    "request": fragment,
                    "score": score,
                    "resolved": False,
                    "patterns": []
                }}
            )
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
            # Transition from MCP call to GraphQL Mutation
            commitment_data = {
                "label": "KNOWN" if weight > 0.8 else "INFERRED",
                "topic": fragment[:100],
                "reasoningChain": f"Sovereign Scribe Gauntlet: Weight {weight}, Provenance {provenance}",
                "sessionId": "sovereign-scribe-session"
            }
            
            mutation_result = gql_client.execute(
                """
                mutation($input: EpistemicMarkInput!) {
                    createEpistemicMark(input: $input) {
                        id
                        timestamp
                    }
                }
                """,
                {"input": commitment_data}
            )
            commitment = mutation_result.get("createEpistemicMark", "COMMITTED")
        except Exception as e:
            raise RuntimeError(f"Sovereign Gauntlet failed at Mnemosyne stage: {str(e)}")
        
        return {
            "status": "PROMOTED",
            "result": commitment,
            "provenance": provenance,
            "weight": weight,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
