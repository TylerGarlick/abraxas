import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from infra.api.graphql.main import app
from infra.api.graphql.context import get_graphql_context

client = TestClient(app)

def test_arango_error_handling():
    """
    Test that AQLQueryExecuteError from python-arango is handled gracefully
    and does not trigger the 'str' object has no attribute 'get_location' crash.
    """
    # Create a mock for the ArangoDB execute method
    mock_db = MagicMock()
    
    # Simulate the specific error seen in the logs
    error_msg = "arango.exceptions.AQLQueryExecuteError: [HTTP 404][ERR 1228] database not found"
    mock_db.aql.execute.side_effect = Exception(error_msg)

    # Patch the get_graphql_context to return a mock context
    with patch('infra.api.graphql.context.get_graphql_context') as mock_get_ctx:
        mock_ctx_instance = MagicMock()
        # Important: our context implementation uses the .db property
        # Since GraphQLContext is a real class, we must ensure that the mock 
        # is used correctly by the resolver.
        # In the current code, GraphQLContext has a .db property.
        # We'll mock the property by making the instance mock return our mock_db.
        
        # Instead of mocking the class, let's mock the function that returns the instance.
        mock_ctx_instance.db = mock_db
        # Force execute_aql to use our mock_db
        mock_ctx_instance.execute_aql.side_effect = lambda query, bind_vars=None: mock_db.aql.execute(query, bind_vars=bind_vars or {})
        
        mock_get_ctx.return_value = mock_ctx_instance
        
        # Execute a query that triggers the resolver -> context.execute_aql path
        query = {
            "query": "{ tasks { id } }"
        }
        response = client.post("/graphql", json=query)
        
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        assert error_msg in data["errors"][0]["message"]


def test_generic_exception_handling():
    """
    Test that any generic exception in the resolver is caught by the 
    top-level middleware in main.py.
    """
    with patch('infra.api.graphql.resolvers.queries.resolve_tasks', side_effect=RuntimeError("Unexpected crash")):
        query = {
            "query": "{ tasks { id } }"
        }
        response = client.post("/graphql", json=query)
        
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        assert "Unexpected crash" in data["errors"][0]["message"]
