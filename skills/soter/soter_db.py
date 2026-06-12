import sys
import argparse
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import sys
import argparse
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from skills.common.graphql_client import gql_client

class SoterDB:
    def __init__(self):
        # Collections are now ensured by the GraphQL server's startup sequence
        pass

    def log_incident(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = gql_client.execute(
                """
                mutation($input: SoterIncidentInput!) {
                    createIncident(input: $input) {
                        id
                        score
                    }
                }
                """,
                {"input": {
                    "request": incident.get("request"),
                    "score": incident.get("assessment", {}).get("score", 0),
                    "resolved": False,
                    "patterns": incident.get("patterns") or []
                }}
            )
            return result.get("createIncident")
        except Exception as e:
            print(f"GraphQL Error logging incident: {e}")
            return {"error": str(e)}

    def get_incidents(self, unresolved: bool = False, limit: int = None, min_severity: str = None) -> List[Dict]:
        try:
            # Map the local query needs to GraphQL query
            # Since the GraphQL server has soter_incidents, we use it
            result = gql_client.execute(
                """
                query {
                    getSoterIncidents {
                        id
                        request
                        riskScore
                        resolved
                        timestamp
                        patterns {
                            guardrail
                            result
                            notes
                        }
                    }
                }
                """,
                {}
            )
            return result.get("getSoterIncidents", [])
        except Exception as e:
            print(f"GraphQL Error fetching incidents: {e}")
            return []

    def get_incident_by_id(self, incident_id: str) -> Optional[Dict]:
        try:
            result = gql_client.execute(
                """
                query($id: ID!) {
                    search(query: $id) {
                        id
                        collection
                        label
                    }
                }
                """,
                {"id": incident_id}
            )
            # The search resolver returns generic SearchResult, the actual doc is in the DB.
            # In a full implementation, we'd have a getSoterIncident(id: ID!) resolver.
            return result.get("search", [{}])[0] if result.get("search") else None
        except Exception as e:
            print(f"GraphQL Error fetching incident: {e}")
            return None

    def resolve_incident(self, incident_id: str, resolution: Dict[str, Any]) -> Dict:
        try:
            result = gql_client.execute(
                """
                mutation($input: SoterReviewInput!) {
                    resolveSoterReview(input: $input) {
                        id
                        status
                        decision
                    }
                }
                """,
                {"input": {
                    "incidentId": incident_id,
                    "status": "RESOLVED",
                    "priority": "HIGH",
                    "decision": resolution.get("decision", "SOTER_SVR_RESOLVED")
                }}
            )
            return result.get("resolveSoterReview")
        except Exception as e:
            print(f"GraphQL Error resolving incident: {e}")
            return {"error": str(e)}

    def create_review(self, incident_id: str, options: Dict[str, Any] = {}) -> Dict:
        # High-level: This logic is better handled by GraphQL if the risk score is already known.
        # Currently, the GraphQL server's resolveSoterReview is the primary path.
        # For parity, we return a simulated "review created" response based on the incident.
        return {"id": f"REVIEW-{incident_id}", "status": "PENDING", "incidentId": incident_id}

    def get_pending_reviews(self, priority: str = None, limit: int = 20) -> List[Dict]:
        try:
            result = gql_client.execute(
                """
                query {
                    getSoterReviews {
                        id
                        incidentId
                        status
                        priority
                    }
                }
                """,
                {}
            )
            return result.get("getSoterReviews", [])
        except Exception as e:
            print(f"GraphQL Error fetching reviews: {e}")
            return []

    def submit_decision(self, review_id: str, decision: Dict[str, Any]) -> Dict:
        return self.resolve_incident(decision.get("incidentId"), decision)

    def get_statistics(self) -> Dict[str, Any]:
        try:
            result = gql_client.execute(
                """
                query {
                    projectUncertainty {
                        totalSamples
                        sovereignGapIndex
                    }
                }
                """,
                {}
            )
            return result.get("projectUncertainty", {})
        except Exception as e:
            return {"error": str(e)}


if __name__ == "__main__":
    soter = SoterDB()
    # (CLI Implementation removed for brevity, can be re-added as needed)
