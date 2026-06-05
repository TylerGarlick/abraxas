from typing import Dict, Any, Optional
import datetime
from skills.common.graphql_client import gql_client

class OneironauticsLogic:
    def __init__(self):
        # The shadow_ledger is now managed by the GraphQL server/ArangoDB
        pass

    def log_dream(self, dream_text: str, tags: Optional[list] = None) -> Dict[str, Any]:
        """Logs a dream entry by creating a plan/session in the GraphQL server."""
        try:
            # The server uses createPlan or similar for starting cycles.
            # Based on the mutation list, we use createPlan as the entry point.
            result = gql_client.execute(
                """
                mutation($input: ActionablePlanInput!) {
                    createPlan(input: $input) {
                        id
                    }
                }
                """,
                {"input": {
                    "summary": dream_text,
                    "steps": tags or [],
                    "riskAssessment": "C-Sovereign"
                }}
            )
            return {
                "success": True,
                "graphql_response": result,
                "action": "createPlan"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def witness_symbol(self, symbol: str, valence: str, manifestation: str) -> Dict[str, Any]:
        """Witnesses a symbol by creating a symbol in the GraphQL server."""
        try:
            result = gql_client.execute(
                """
                mutation($input: SymbolUpdateInput!) {
                    createSymbol(input: $input) {
                        id
                    }
                }
                """,
                {"input": {
                    "id": f"sym-{symbol.lower().replace(' ', '_')}",
                    "stage": "NIGREDO",
                    "intention": f"Valence: {valence} | Manifestation: {manifestation}"
                }}
            )
            return {
                "success": True,
                "graphql_response": result,
                "action": "createSymbol"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_shadow_ledger(self, quality: str, insight: str) -> Dict[str, Any]:
        """Updates the shadow ledger via the createShadowEntry mutation."""
        try:
            result = gql_client.execute(
                """
                mutation($input: ShadowEntryInput!) {
                    createShadowEntry(input: $input) {
                        id
                        timestamp
                    }
                }
                """,
                {"input": {
                    "category": quality,
                    "content": insight,
                    "sessionId": "default-session"
                }}
            )
            return {
                "success": True,
                "graphql_response": result,
                "action": "createShadowEntry"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
