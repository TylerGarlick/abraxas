import pytest
from skills.epistemic_atlas.python.logic import EpistemicAtlas
from infra.mcp.db_manager import DBManager
from infra.mcp.context import AbraxasContext

class MockDB:
    def __init__(self):
        self.data = {}
    def collection(self, name):
        return self
    def get(self, key):
        return self.data.get(key)

def test_provenance_tracing():
    mock_db_mgr = DBManager(AbraxasContext(root_dir="."))
    mock_db_mgr.db = MockDB()
    atlas = EpistemicAtlas(mock_db_mgr)
    
    result = atlas.trace_provenance("BELIEF_001")
    assert "provenance_chain" in result
    assert result["status"] == "COMPLETE"

def test_domain_mapping():
    atlas = EpistemicAtlas()
    result = atlas.map_epistemic_state("Cosmology")
    
    assert result["domain"] == "Cosmology"
    assert "metrics" in result
    assert "topological_clusters" in result

def test_identify_gaps():
    atlas = EpistemicAtlas()
    gaps = atlas.find_missing_fragments("BELIEF_VOID")
    assert isinstance(gaps, list)
    assert len(gaps) > 0
    assert "FRAGMENT_REQUIRED_" in gaps[0]
