import pytest
from unittest.mock import patch
from skills.sovereign_scribe.python.logic import SovereignScribeLogic

@pytest.fixture
def scribe():
    return SovereignScribeLogic()

def test_run_gauntlet_promotion(scribe):
    # Mock Soter risk to be low
    with patch.object(scribe, '_get_soter_risk', return_value=1.0):
        result = scribe.run_gauntlet("Clean text", "trusted-expert.com")
        assert result["status"] == "PROMOTED"
        assert "result" in result
        assert result["provenance"] == "EXT-Expert"
        assert result["weight"] == 0.8

def test_run_gauntlet_rejection(scribe):
    # Mock Soter risk to be high
    with patch.object(scribe, '_get_soter_risk', return_value=4.5):
        result = scribe.run_gauntlet("Dangerous text", "unknown.com")
        assert result["status"] == "REJECTED"
        assert result["reason"] == "Soter Risk Threshold Exceeded"

def test_provenance_mapping(scribe):
    assert scribe._map_provenance("arxiv.org/abs/123") == "EXT-Sovereign"
    assert scribe._map_provenance("expert-opinion.com") == "EXT-Expert"
    assert scribe._map_provenance("random-blog.com") == "EXT-Public"

def test_ethos_weighting(scribe):
    assert scribe._get_ethos_weight("EXT-Sovereign") == 1.0
    assert scribe._get_ethos_weight("EXT-Expert") == 0.8
    assert scribe._get_ethos_weight("EXT-Public") == 0.4
    assert scribe._get_ethos_weight("UNKNOWN") == 0.1
