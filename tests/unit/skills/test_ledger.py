import unittest
from unittest.mock import MagicMock
from skills.ledger.python.logic import LedgerLogic

class TestLedgerLogic(unittest.TestCase):
    def setUp(self):
        # Mock ArangoDB client and database
        self.mock_db = MagicMock()
        self.mock_collection = MagicMock()
        self.mock_db.collection.return_value = self.mock_collection
        self.mock_db.has_collection.return_value = True
        
        # Inject mock DB into the singleton
        LedgerLogic._instance = None
        self.logic = LedgerLogic()
        self.logic.db = self.mock_db

    def test_update_task_status_fix(self):
        """Verify update_task_status uses _key instead of raw id for the update call."""
        mock_task = {"_key": "test_key_123", "title": "Test Task", "status": "open"}
        self.mock_collection.get.return_value = mock_task
        
        self.logic.update_task_status("test_id_123", "closed")
        
        # Check that update was called with {"_key": "test_key_123"}
        self.mock_collection.update.assert_called_once()
        called_args = self.mock_collection.update.call_args[0][0]
        self.assertEqual(called_args, {"_key": "test_key_123"})

    def test_delete_task(self):
        """Verify delete_task correctly handles existing and non-existing tasks."""
        # Case 1: Task exists
        mock_task = {"_key": "test_key_456"}
        self.mock_collection.get.return_value = mock_task
        
        res = self.logic.delete_task("test_id_456")
        self.assertTrue(res)
        self.mock_collection.delete.assert_called_with("test_key_456")
        
        # Case 2: Task not found
        self.mock_collection.get.return_value = None
        res = self.logic.delete_task("non_existent")
        self.assertFalse(res)

if __name__ == "__main__":
    unittest.main()
