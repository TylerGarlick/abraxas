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
    mock_col.save.return_value = {"_key": "test_key"}
    
    result = ledger.create_task("Test Task", project="Project A")
    
    assert result["title"] == "Test Task"
    assert result["project"] == "Project A"
    assert result["_key"] == "test_key"
    assert result["status"] == "open"

def test_update_task_status_success(ledger, mock_db):
    mock_col = mock_db.collection("tasks")
    mock_col.get.return_value = {"_key": "123", "title": "Task 1", "status": "open"}
    
    result = ledger.update_task_status("123", "ready")
    
    assert result["status"] == "ready"
    mock_col.update.assert_called_once()

def test_update_task_status_invalid_status(ledger):
    with pytest.raises(ValueError, match="Invalid status"):
        ledger.update_task_status("123", "invalid_status")

def test_update_task_status_not_found(ledger, mock_db):
    mock_col = mock_db.collection("tasks")
    mock_col.get.return_value = None
    
    with pytest.raises(ValueError, match="Task with id 123 not found"):
        ledger.update_task_status("123", "ready")

def test_add_dependency(ledger, mock_db):
    mock_col = mock_db.collection("task_edges")
    
    result = ledger.add_dependency("child", "parent")
    
    assert result is True
    mock_col.save.assert_called_once()

def test_get_ready_tasks(ledger, mock_db):
    mock_db.aql.execute.return_value = [{"_key": "1", "title": "Ready Task"}]
    
    result = ledger.get_ready_tasks()
    
    assert len(result) == 1
    assert result[0]["title"] == "Ready Task"
