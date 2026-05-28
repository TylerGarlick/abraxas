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

def test_retro_loop_action_creation():
    """
    Test the full Retrospective Loop:
    1. Create a Task
    2. Create a Retrospective for that task with an 'aha moment' action (string)
    3. Verify the action was converted into a new Task with status 'open'
    """
    # 1. Create a Task
    create_task_mutation = """
    mutation CreateTask($input: TaskInput!) {
        createTask(input: $input) {
            id
            title
            status
        }
    }
    """
    task_input = {"title": "Initial Implementation Task", "project": "Retro Test"}
    task_data = query_graphql(create_task_mutation, {"input": task_input})
    task_id = task_data['createTask']['id']
    
    # 2. Create a Retrospective with a title-based action
    create_retro_mutation = """
    mutation CreateRetro($input: RetrospectiveInput!, $channelId: String!) {
        createRetrospective(input: $input, channelId: $channelId) {
            id
            taskId
            title
        }
    }
    """
    retro_input = {
        "taskId": f"tasks/{task_id}",
        "title": "Retro for Initial Task",
        "wentWell": "Everything was fast",
        "wentBad": "Missing validation",
        "actions": ["Implement strict validation for action tasks"] # This is the 'aha moment'
    }
    retro_data = query_graphql(create_retro_mutation, {"input": retro_input, "channelId": AUTH_CHANNEL})
    assert retro_data['createRetrospective'] is not None

    # 3. Verify the action task was created as 'open'
    search_tasks_query = """
    query SearchTasks($query: String!) {
        tasks(query: $query) {
            id
            title
            status
        }
    }
    """
    tasks_data = query_graphql(search_tasks_query, {"query": "Implement strict validation"})
    found_tasks = tasks_data['tasks']
    
    assert len(found_tasks) > 0
    assert found_tasks[0]['title'] == "Implement strict validation for action tasks"
    assert found_tasks[0]['status'] == "open"

def test_needs_retrospective_query():
    """
    Test the needsRetrospective query:
    1. Create a task without a retro
    2. Verify it appears in needsRetrospective
    3. Create a retro for it
    4. Verify it disappears from needsRetrospective
    """
    # 1. Create task
    create_task_mutation = """
    mutation CreateTask($input: TaskInput!) {
        createTask(input: $input) { id }
    }
    """
    task_id = query_graphql(create_task_mutation, {"input": {"title": "Gap Task"}}))['createTask']['id']
    
    # 2. Verify it's in needsRetrospective
    needs_retro_query = "query { needsRetrospective { id title } }"
    res = query_graphql(needs_retro_query)
    assert any(t['id'] == task_id for t in res['needsRetrospective'])
    
    # 3. Create retro
    create_retro_mutation = """
    mutation CreateRetro($input: RetrospectiveInput!, $channelId: String!) {
        createRetrospective(input: $input, channelId: $channelId) { id }
    }
    """
    retro_input = {"taskId": f"tasks/{task_id}", "title": "Closing the gap"}
    query_graphql(create_retro_mutation, {"input": retro_input, "channelId": AUTH_CHANNEL})
    
    # 4. Verify it's gone
    res_after = query_graphql(needs_retro_query)
    assert not any(t['id'] == task_id for t in res_after['needsRetrospective'])
