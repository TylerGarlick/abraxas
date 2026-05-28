import pytest
from skills.soter.python.logic import SoterLogic

@pytest.fixture
def soter():
    return SoterLogic()

def test_heuristic_risk_high(soter):
    # High risk keywords "tachyon crystal"
    result = soter.assess_risk_heuristic("I have a tachyon crystal in my lab")
    assert result.score == 5
    assert result.trigger == 1
    assert "Pseudo-scientific hallucination trigger" in result.explanation

def test_heuristic_risk_low(soter):
    result = soter.assess_risk_heuristic("The weather is nice today")
    assert result.score == 0
    assert result.trigger == 0

def test_mechanistic_attention_trigger(soter):
    # Mockattention weights where avg > 0.49
    # 3 heads, 6 sinks. total = 18 slots. 0.5 * 18 = 9.0
    weights = {
        "heads": [
            {"<BOS>": 0.6, "!": 0.6, ".": 0.6, ",": 0.6, "?": 0.6, " ": 0.6},
            {"<BOS>": 0.6, "!": 0.6, ".": 0.6, ",": 0.6, "?": 0.6, " ": 0.6},
            {"<BOS>": 0.6, "!": 0.6, ".": 0.6, ",": 0.6, "?": 0.6, " ": 0.6},
        ],
        "sinks": ["<BOS>", "!", ".", ",", "?", " "]
    }
    result = soter.assess_risk_mechanistic("Normal query", weights)
    assert result["trigger"] == 1
    assert result["risk"] == 3
    assert "Attention sink threshold exceeded" in result["reason"]

def test_mechanistic_attention_stable(soter):
    weights = {
        "heads": [
            {"<BOS>": 0.1, "!": 0.1, ".": 0.1, ",": 0.1, "?": 0.1, " ": 0.1},
        ],
        "sinks": ["<BOS>", "!", ".", ",", "?", " "]
    }
    result = soter.assess_risk_mechanistic("Normal query", weights)
    assert result["trigger"] == 0
    assert result["risk"] == 0

def test_constitution_critical_violation(soter):
    # High risk input but no "human review" in response
    response = "I cannot help with the tachyon crystal"
    result = soter.check_constitution_adherence(response)
    assert result["overallStatus"] == "CRITICAL_VIOLATIONS"
    assert any(v["rule"] == "CS-002" for v in result["violations"])

def test_constitution_compliant(soter):
    response = "This request requires human review and I cannot proceed without approval."
    result = soter.check_constitution_adherence(response)
    # Since keywords are absent in the response, risk is low, so it's compliant
    assert result["overallStatus"] == "COMPLIANT"

def test_verify_claim_high_risk(soter):
    result = soter.verify_claim("Tell me about the secret DARPA sovereign contract")
    assert result["riskScore"] >= 4
    assert "Human review required" in result["recommendation"]
    assert result["logged"] is True
