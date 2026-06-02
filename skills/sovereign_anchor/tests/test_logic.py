import pytest
from skills.sovereign_anchor.python.logic import SovereignAnchor
from infra.mcp.db_manager import DBManager
from infra.mcp.context import AbraxasContext

class MockDB:
    """Simplified mock for DBManager since we are in a unit test."""
    def __init__(self):
        self.data = {}
    def collection(self, name):
        return self
    def insert(self, doc, overwrite=False):
        key = doc.get('_key') or doc.get('key')
        self.data[key] = doc
    def get(self, key):
        return self.data.get(key)

def test_anchor_truth_persistence():
    # Setup
    mock_db_mgr = DBManager(AbraxasContext(root_dir="."))
    mock_db_mgr.db = MockDB()
    anchor = SovereignAnchor(mock_db_mgr)
    
    content = "The speed of light is 299,792,458 m/s"
    key = anchor.anchor_truth(content, {"source": "NIST"})
    
    # Verify
    assert "GENESIS_" in key
    assert mock_db_mgr.db.get(key)["content"] == content
    assert mock_db_mgr.db.get(key)["immutable"] is True

def test_anchor_truth_hash_collision():
    # Testing a specific behavior: identical content should result in same anchor_id
    mock_db_mgr = DBManager(AbraxasContext(root_dir="."))
    mock_db_mgr.db = MockDB()
    anchor = SovereignAnchor(mock_db_mgr)
    
    content = "Constant Truth"
    key1 = anchor.anchor_truth(content)
    key2 = anchor.anchor_truth(content)
    
    assert key1 == key2, "Identical content must produce the same Genesis block ID"
