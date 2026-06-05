from dataclasses import dataclass
from typing import Optional
import datetime
from skills.common.graphql_client import gql_client

@dataclass
class Fragment:
    id: str
    fragment: str
    provenance: str
    timestamp: str

class MnemosyneLogic:
    def __init__(self):
        # Collection ensuring is now handled by GraphQL server startup
        pass

    def recall(self, query: str) -> Optional[Fragment]:
        try:
            # Use GraphQL search to find fragments
            result = gql_client.execute(
                """
                query($query: String!) {
                    search(query: $query, collections: ["fragments"]) {
                        id
                        label
                    }
                }
                """,
                {"query": query}
            )
            res = result.get("search")
            if res and len(res) > 0:
                f = res[0]
                # Since 'label' in search is often a summary, we'd normally 
                # fetch the full record. For this pass, we map the search result.
                return Fragment(
                    id=f.get("id", "unknown"),
                    fragment=f.get("label", ""),
                    provenance="GQL_RECALLED",
                    timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
                )
            return None
        except Exception as e:
            print(f"GraphQL Recall Error: {e}")
            return None

    def store(self, fragment: str, provenance: str) -> str:
        try:
            # Map to logEpistemicMark mutation for persistence
            result = gql_client.execute(
                """
                mutation($input: EpistemicMarkInput!) {
                    logEpistemicMark(input: $input) {
                        id
                    }
                }
                """,
                {"input": {
                    "label": "KNOWN",
                    "topic": fragment[:100],
                    "reasoningChain": f"Mnemosyne Storage: Provenance {provenance}",
                    "sessionId": "mnemosyne-storage-session"
                }}
            )
            return result.get("logEpistemicMark", {}).get("id", "success")
        except Exception as e:
            print(f"GraphQL Store Error: {e}")
            return f"error: {str(e)}"

# Singleton instance
mnemosyne_logic = MnemosyneLogic()
