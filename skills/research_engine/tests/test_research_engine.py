import pytest
from unittest.mock import patch, MagicMock
from skills.research_engine.python.logic import ResearchEngineLogic
import os

@pytest.fixture
def engine():
    # Reset singleton for tests
    ResearchEngineLogic._instance = None
    return ResearchEngineLogic()

def test_web_search_placeholder(engine):
    # Mocking external API to return failure/placeholder
    with patch("requests.post", side_effect=Exception("Connection error")):
        result = engine.web_search("Sovereign AI")
        assert "error" in result
        assert "Search" in result["error"]

def test_web_fetch_invalid_url(engine):
    result = engine.web_fetch("not-a-url")
    assert "error" in result

def test_synthesize_report_basic(engine):
    sources = [
        {"type": "url", "value": "http://example.com/1"},
        {"type": "query", "value": "Sovereign AI"}
    ]
    # Mock fetch and search to avoid network calls
    with patch.object(engine, 'web_fetch', return_value={"title": "T1", "content": "Point 1. Point 2."}), \
         patch.object(engine, 'web_search', return_value={"results": []}):
        
        result = engine.synthesize_report("Sovereign AI", sources)
        assert result["topic"] == "Sovereign AI"
        assert result["sourcesAnalyzed"] == 2
        assert len(result["findings"]) == 2

def test_deep_dive_research(engine):
    # Mock web_search to provide results
    with patch.object(engine, 'web_search', return_value={"results": [{"title": "Res1"}]}):
        result = engine.deep_dive_research("What is Sovereign AI?", max_iterations=2)
        assert result["researchQuestion"] == "What is Sovereign AI?"
        assert result["iterations"] == 2
        assert any(entry["action"] == "initial_search" for entry in result["researchLog"])

def test_health_check(engine):
    with patch("requests.get") as mock_get:
        mock_get.return_value = MagicMock(status_code=200)
        result = engine.health_check(verbose=True)
        assert result["status"] == "healthy"
        assert "diagnostics" in result
