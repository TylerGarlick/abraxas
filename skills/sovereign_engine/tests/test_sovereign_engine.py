import pytest
from skills.sovereign_engine.python.logic import SovereignEngineLogic

@pytest.fixture
def engine():
    return SovereignEngineLogic()

def test_calculate_sovereign_weight(engine):
    risk_scores = [0.1, 0.2, 0.3]
    # Target index 0 should have the highest weight (lowest risk)
    weight_0 = engine.calculate_sovereign_weight(risk_scores, 0)
    weight_2 = engine.calculate_sovereign_weight(risk_scores, 2)
    assert weight_0 > weight_2

def test_compute_integrated_confidence(engine):
    # alpha=0.7: 0.7*0.9 + 0.3*0.5 = 0.63 + 0.15 = 0.78
    result = engine.compute_integrated_confidence(0.9, 0.5)
    assert result == pytest.approx(0.78)

def test_calculate_rlcr_empty(engine):
    assert engine.calculate_rlcr([]) == 0.5

def test_calculate_rlcr_perfect(engine):
    # history: [T, T, T]
    assert engine.calculate_rlcr([True, True, True]) == 1.0

def test_calculate_rlcr_mixed(engine):
    # history: [T, F, T]
    result = engine.calculate_rlcr([True, False, True])
    assert 0.0 < result < 1.0

def test_verify_consensus_success(engine):
    answers = ["A", "A", "A", "B"]
    result = engine.verify_consensus(answers)
    assert result["winner"] == "A"
    assert result["count"] == 3

def test_verify_consensus_fail(engine):
    answers = ["A", "B", "C", "D"]
    result = engine.verify_consensus(answers)
    assert result["winner"] is None
    assert result["count"] == 1

def test_get_epistemic_label(engine):
    assert engine.get_epistemic_label(0.96) == "[KNOWN]"
    assert engine.get_epistemic_label(0.80) == "[INFERRED]"
    assert engine.get_epistemic_label(0.50) == "[UNCERTAIN]"
    assert engine.get_epistemic_label(0.20) == "[UNKNOWN]"
