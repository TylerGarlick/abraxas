import requests
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("abraxas-gql-client")

class GraphQLClient:
    """
    A unified client for interacting with the Abraxas GraphQL server.
    Provides a clean interface for queries and mutations.
    """
    def __init__(self, endpoint: str = "http://localhost:9000/graphql"):
        self.endpoint = endpoint

    def execute(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes a GraphQL operation.
        """
        payload = {"query": query}
        if variables:
            payload["variables"] = variables

        try:
            response = requests.post(self.endpoint, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "errors" in data:
                logger.error(f"GraphQL Errors: {data['errors']}")
                raise RuntimeError(f"GraphQL Server returned errors: {data['errors']}")
                
            return data.get("data", {})
        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP Request failed: {e}")
            raise RuntimeError(f"Failed to connect to GraphQL server at {self.endpoint}: {e}")

    def mutate(self, mutation_name: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        """
        Helper to execute a mutation.
        Assumes mutation format: mutation { mutationName(input: $input) { ... } }
        Note: Because different mutations return different types, 
        this is a generic wrapper. The specific query string is still required
        for field selection.
        """
        # This is a simplified wrapper. For complex returns, use .execute()
        # For a truly generic mutate, we would need a schema map of return fields.
        # For now, we'll rely on .execute() for precise control in skills.
        pass

# Singleton instance for easy access across skills
gql_client = GraphQLClient()
