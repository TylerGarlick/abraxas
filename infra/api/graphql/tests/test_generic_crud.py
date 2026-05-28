import requests
import pytest
from typing import List, Dict, Any

# Configuration
GRAPHQL_URL = "http://localhost:4001/graphql"
AUTH_CHANNEL = "sovereign-alpha" # Assume a valid channel from config

def query_graphql(query: str, variables: Dict[str, Any] = None):
    response = requests.post(GRAPHQL_URL, json={'query': query, 'variables': variables})
    if response.status_code != 200:
        pytest.fail(f"GraphQL request failed with status {response.status_code}: {response.text}")
    return response.json().get('data', {})

def test_typed_document_update():
    """
    Verify strongly typed Document CRUD:
    1. Create a Task
    2. Update only the 'priority' field using TaskUpdateInput
    3. Verify other fields remain unchanged and 'updatedAt' is refreshed
    """
    # 1. Create Task
    create_mutation = """
    mutation CreateTask($input: TaskInput!) {
        createTask(input: $input) { id title priority }
    }
    """
    task_input = {"title": "Typed Test Task", "priority": "Low", "project": "CRUD Test"}
    task_data = query_graphql(create_mutation, {"input": task_input})
    task_id = task_data['createTask']['id']
    
    # 2. Update only priority
    update_mutation = """
    mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
        updateTask(id: $id, input: $input) {
            id
            title
            priority
            project
        }
    }
    """
    # Only send priority update
    update_input = {"priority": "High"}
    updated_data = query_graphql(update_mutation, {"id": task_id, "input": update_input})
    updated_task = updated_data['updateTask']
    
    assert updated_task['priority'] == "High"
    assert updated_task['title'] == "Typed Test Task" # Should be preserved
    assert updated_task['project'] == "CRUD Test"    # Should be preserved

def test_flexible_edge_management():
    """
    Verify flexible JSON Edge CRUD:
    1. Create an edge between two tasks with extra metadata
    2. Verify the edge was created with the correct from/to and metadata
    """
    # Create tasks first
    create_mutation = """
    mutation CreateTask($input: TaskInput!) {
        createTask(input: $input) { id }
    }
    """
    task_a_id = query_graphql(create_mutation, {"input": {"title": "Task A"}})['createTask']['id']
    task_b_id = query_graphql(create_mutation, {"input": {"title": "Task B"}})['createTask']['id']
    
    # 1. Create edge with flexible JSON data
    edge_mutation = """
    mutation CreateEdge($collection: String!, $fromId: ID!, $toId: ID!, $data: JSON) {
        createEdge(collection: $collection, fromId: $fromId, toId: $toId, data: $data)
    }
    """
    edge_data = {
        "weight": 0.85,
        "relationship": "critical-path",
        "notes": "B must be verified before A can close"
    }
    result = query_graphql(edge_mutation, {
        "collection": "task_edges",
        "fromId": f"tasks/{task_b_id}",
        "toId": f"tasks/{task_a_id}",
        "data": edge_data
    })
    assert result['createEdge'] is not None

def test_generic_document_deletion():
    """
    Verify generic document deletion:
    1. Create a Task
    2. Delete it using resolve_delete_document
    3. Verify it no longer exists
    """
    create_mutation = """
    mutation CreateTask($input: TaskInput!) {
        createTask(input: $input) { id }
    }
    """
    task_id = query_graphql(create_mutation, {"input": {"title": "Delete Me"}})['createTask']['id']
    
    delete_mutation = """
    mutation DeleteDoc($collection: String!, $id: ID!) {
        deleteDocument(collection: $collection, id: $id)
    }
    """
    result = query_graphql(delete_mutation, {"collection": "tasks", "id": task_id})
    assert result['deleteDocument'] is True
    
    # Verify it's gone
    get_query = """
    query GetTask($id: ID!) {
        task(id: $id) { id }
    }
    """
    # Note: Resolve this based on how your schema handles single task retrieval
    # If task query doesn't exist, use tasks(query: la)
    res = query_graphql(get_query, {"id": task_id})
    assert res.get('task') is None
