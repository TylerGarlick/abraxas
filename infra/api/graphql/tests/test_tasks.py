import pytest
from unittest.mock import MagicMock, patch
from infra.api.graphql.resolvers.queries import resolve_tasks
from infra.api.graphql.schema import Task, TaskStatus

@pytest.fixture
def mock_context():
    with patch("infra.api.graphql.resolvers.queries.get_graphql_context") as mock_get_ctx:
        mock_ctx = MagicMock()
        mock_get_ctx.return_value = mock_ctx
        yield mock_ctx

def test_resolve_tasks_all(mock_context):
    # Mock data
    mock_data = [
        {"_key": "t1", "title": "Task 1", "status": "open", "project": "P1"},
        {"_key": "t2", "title": "Task 2", "status": "ready", "project": "P1"},
    ]
    mock_context.execute_aql.return_value = mock_data
    
    results = resolve_tasks()
    
    assert len(results) == 2
    assert results[0].id == "t1"
    assert results[1].id == "t2"
    mock_context.execute_aql.assert_called_once()
    # Verify AQL query start
    args, _ = mock_context.execute_aql.call_args
    assert "FOR t IN tasks" in args[0]

def test_resolve_tasks_filter_project(mock_context):
    mock_data = [{"_key": "t1", "title": "Task 1", "status": "open", "project": "P1"}]
    mock_context.execute_aql.return_value = mock_data
    
    results = resolve_tasks(project="P1")
    
    assert len(results) == 1
    args, kwargs = mock_context.execute_aql.call_args
    assert "t.project == @project" in args[0]
    assert args[1]["project"] == "P1"

def test_resolve_tasks_filter_status(mock_context):
    mock_data = [{"_key": "t1", "title": "Task 1", "status": "ready", "project": "P1"}]
    mock_context.execute_aql.return_value = mock_data
    
    results = resolve_tasks(status=TaskStatus.READY)
    
    assert len(results) == 1
    args, kwargs = mock_context.execute_aql.call_args
    assert "t.status == @status" in args[0]
    assert args[1]["status"] == "ready"

def test_resolve_tasks_search_query(mock_context):
    mock_data = [{"_key": "t1", "title": "Search Me", "status": "open", "project": "P1"}]
    mock_context.execute_aql.return_value = mock_data
    
    results = resolve_tasks(query="search")
    
    assert len(results) == 1
    args, kwargs = mock_context.execute_aql.call_args
    assert "CONTAINS(LOWER(t.title), LOWER(@query))" in args[0]
    assert args[1]["query"] == "search"

def test_resolve_tasks_pagination(mock_context):
    mock_data = [{"_key": "t1", "title": "Task 1", "status": "open", "project": "P1"}]
    mock_context.execute_aql.return_value = la_list = mock_data
    
    results = resolve_tasks(limit=10, offset=5)
    
    assert len(results) == 1
    args, kwargs = mock_context.execute_aql.call_args
    assert "LIMIT @offset, @limit" in args[0]
    assert args[1]["offset"] == 5
    assert args[1]["limit"] == 10

def test_resolve_tasks_empty(mock_context):
    mock_context.execute_aql.return_value = []
    
    results = resolve_tasks(query="nonexistent")
    
    assert results == []
