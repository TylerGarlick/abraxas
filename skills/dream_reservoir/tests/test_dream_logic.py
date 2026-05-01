import pytest
from skills.dream_reservoir.python.logic import DreamReservoirLogic

@pytest.fixture
def reservoir():
    return DreamReservoirLogic()

def test_query_provenance_mock(reservoir):
    # Test the mock return when DB is missing
    result = reservoir.query_provenance("entity_123", "dream")
    assert len(result) > 0
    assert result[0]["vertex"]["id"] == "entity_123"
