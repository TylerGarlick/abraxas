import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import sys
import os

# Ensure root is in path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))

try:
    from infra.api.graphql.main import app
    from infra.api.graphql.context import get_graphql_context
except ImportError as e:
    print(f"Critical Import Error: {e}")
    raise

class TestGraphQLIntegration(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        # We mock the context to avoid needing a real ArangoDB instance for all tests
        self.patcher = patch("infra.api.graphql.context.get_graphql_context")
        self.mock_get_ctx = self.patcher.start()
        self.mock_ctx = MagicMock()
        self.mock_get_ctx.return_value = self.mock_ctx

    def tearDown(self):
        self.patcher.stop()

    def execute_query(self, query, variables=None):
        response = self.client.post(
            "/graphql",
            json={"query": query, "variables": variables or {}},
        )
        return response.json()

    def test_ready_tasks_success(self):
        """Test that readyTasks returns the list of tasks correctly."""
        # Mock AQL result for resolve_ready_tasks
        self.mock_ctx.execute_aql.return_value = [
            {"_key": "t1", "title": "Task 1", "status": "ready", "priority": "high"},
            {"_key": "t2", "title": "Task 2", "status": "open", "priority": "medium"},
        ]
        
        query = "{ readyTasks { id title status } }"
        result = self.execute_query(query)
        
        self.assertIn("data", result)
        self.assertEqual(len(result["data"]["readyTasks"]), 2)
        self.assertEqual(result["data"]["readyTasks"][0]["id"], "t1")

    def test_ready_tasks_with_corrupted_data(self):
        """Test that the fix for 'str' object error works when DB returns strings."""
        # Mock AQL returning mixed types (simulating the cause of the original bug)
        self.mock_ctx.execute_aql.return_value = [
            {"_key": "t1", "title": "Valid Task", "status": "ready"},
            "I am a corrupted string result", 
            None,
            {"_key": "t2", "title": "Valid Task 2", "status": "ready"}
        ]
        
        query = "{ readyTasks { id } }"
        result = self.execute_query(query)
        
        # Should not raise AttributeError and should return only the valid dicts
        self.assertIn("data", result)
        self.assertEqual(len(result["data"]["readyTasks"]), 2)

    def test_project_uncertainty_success(self):
        """Test the projectUncertainty query."""
        self.mock_ctx.execute_aql.return_value = [{
            "known": 10, "inferred": 5, "uncertain": 2, "unknown": 3, "dream": 20
        }]
        
        query = "{ projectUncertainty { known totalSamples sovereignGapIndex } }"
        result = self.execute_query(query)
        
        self.assertIn("data", result)
        self.assertEqual(result["data"]["projectUncertainty"]["known"], 10)
        self.assertIsInstance(result["data"]["projectUncertainty"]["sovereignGapIndex"], float)

    def test_search_functionality(self):
        """Test the search query."""
        self.mock_ctx.execute_aql.return_value = [
            {"_key": "c1", "name": "Sovereignty", "description": "desc"}
        ]
        
        query = 'query Search($q: String!) { search(query: $q) { id label } }'
        variables = {"q": "Sovereignty"}
        result = self.execute_query(query, variables)
        
        self.assertIn("data", result)
        self.assertEqual(result["data"]["search"][0]["id"], "c1")

    def test_create_task_mutation(self):
        """Test the create_task mutation."""
        # Note: In a real integration test, we'd mock the resolver return value 
        # but here we check if the endpoint accepts the mutation.
        # The actual resolver logic is usually tested in unit tests.
        
        query = """
        mutation CreateT($input: TaskInput!) {
            createTask(input: $input) {
                id
                title
            }
        }
        """
        variables = {
            "input": {"title": "New Integration Task", "priority": "high"}
        }
        
        # We need to mock the resolve_create_task since we are in an integration test
        with patch("infra.api.graphql.main.resolve_create_task") as mock_resolve:
            mock_resolve.return_value = MagicMock(id="t_new", title="New Integration Task")
            result = self.execute_query(query, variables)
            self.assertEqual(result["data"]["createTask"]["id"], "t_new")

if __name__ == "__main__":
    unittest.main()
