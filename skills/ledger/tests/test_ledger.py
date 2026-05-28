import pytest
from unittest.mock import MagicMock, patch
from skills.ledger.python.logic import LedgerLogic

@pytest.fixture
def mock_db():
    with patch("skills.ledger.python.logic.ArangoClient") as mock_client:
        db_instance = MagicMock()
        mock_client.return_value.db.return_value = db_instance
        
        # Mock collection
        mock_col = MagicMock()
        db_instance.collection.return_value = mock_col
        
        yield db_instance

@pytest.fixture
def ledger(mock_db):
    # Clear singleton for tests
    LedgerLogic._instance = None
    # Mock env vars
    with patch.dict("os.environ", {
        "ARANGO_URL": "http://localhost:8529",
        "ARANGO_DB": "test_db",
        "ARANGO_USER": "root",
        "ARANGO_ROOT_PASSWORD": "password"
    }):
        return LedgerLogic()

def test_create_task(ledger, mock_db):
    mock_col = mock_db.collection("tasks")
    mock_col.insert.return_value = {"_key": "test_key"}
    
    result = ledger.create_task("Test Task", project="Project A")
    
    assert result["title"] == "Test Task"
    assert result["project"] == "Project A"
    assert result["_key"] == "test_key"
    assert result["status"] == "open"

def test_update_task_status_success(ledger, mock_db):
    # Mock the AQL execute to return a task with the updated status
    mock_db.aql.execute.return_value = [{"_key": "123", "title": "Task 1", "status": "ready"}]
    
    result = ledger.update_task_status("123", "ready")
    
    assert result["status"] == "ready"

def test_update_task_status_invalid_status(ledger):
    with pytest.raises(ValueError, match="Invalid status"):
        ledger.update_task_status("123", "invalid_status")

def test_update_task_status_not_found(ledger, mock_db):
    # AQL returns empty list when task not found
    mock_db.aql.execute.return_value = []
    
    with pytest.raises(ValueError, match="Task with id 123 not found"):
        ledger.update_task_status("123", "ready")

def test_add_dependency(ledger, mock_db):
    mock_col = mock_db.collection("task_edges")
    
    result = ledger.add_dependency("child", "parent")
    
    assert result is True
    mock_col.insert.assert_called_once()

def test_get_ready_tasks(ledger, mock_db):
    mock_db.aql.execute.return_value = [{"_key": "1", "title": "Ready Task"}]
    
    result = ledger.get_ready_tasks()
    
    assert len(result) == 1
    assert result[0]["title"] == "Ready Task"


def test_update_task_status_closed_auto_retro(ledger, mock_db):
    """Regression test: closing a task auto-generates a retrospective."""
    task_data = {
        "_key": "456",
        "title": "Task To Close",
        "project": "TestProject",
        "priority": "high",
        "scope": "core",
        "createdAt": "2026-05-15T00:00:00+00:00",
        "status": "closed",
    }
    mock_db.aql.execute.return_value = [task_data]
    
    with patch("skills.retrospectives.python.logic.RetrospectivesLogic.save_retro") as mock_save_retro:
        mock_save_retro.return_value = "Saved"
        result = ledger.update_task_status("456", "closed")
    
    # Verify task was closed
    assert result["status"] == "closed"
    
    # Verify retro was auto-generated
    assert result["_retro"]["generated"] is True
    assert result["_retro"]["retro_id"] == "task_456"
    
    # Verify save_retro was called with correct args
    mock_save_retro.assert_called_once()
    call_args = mock_save_retro.call_args
    # Positional args: date, retro_type, retro_id, content
    assert call_args[0][1] == "task"  # retro_type
    assert call_args[0][2] == "task_456"  # retro_id
    content = call_args[0][3]
    assert content["task_title"] == "Task To Close"
    assert content["project"] == "TestProject"
    assert content["priority"] == "high"
    assert content["auto_generated"] is True
    assert "went_well" in content
    assert "not_well" in content
    assert "start" in content
    assert "stop" in content
    assert "continue" in content
    assert "improvements" in content


def test_update_task_status_closed_retro_failure_does_not_block(ledger, mock_db):
    """Edge case: if retro save fails, status update still succeeds."""
    task_data = {
        "_key": "789",
        "title": "Resilient Task",
        "status": "closed",
    }
    mock_db.aql.execute.return_value = [task_data]
    
    with patch("skills.retrospectives.python.logic.RetrospectivesLogic.save_retro") as mock_save_retro:
        mock_save_retro.side_effect = RuntimeError("Disk full")
        result = ledger.update_task_status("789", "closed")
    
    # Status update should still succeed
    assert result["status"] == "closed"
    
    # _retro should indicate failure
    assert result["_retro"]["generated"] is False
    assert "Disk full" in result["_retro"]["error"]
