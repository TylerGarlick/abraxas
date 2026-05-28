import pytest
from skills.guardrail_monitor.python.logic import GuardrailLogic

@pytest.fixture
def guardrail():
    return GuardrailLogic()

def test_pathos_extract_values(guardrail):
    extracted = guardrail.pathos.extract_values("I must have accurate and safe results")
    assert len(extracted) >= 2
    categories = [v["category"] for v in extracted]
    assert "safety" in categories
    assert "accuracy" in categories

def test_pathos_saliency(guardrail):
    # High salience input
    result = guardrail.pathos.check_value_saliency("safety", "I need this to be fast and safe")
    assert result["saliencyScore"] > 0.5
    assert "Safety vs Efficiency tension detected" in result["conflicts"]

def test_pheme_verify_unverifiable(guardrail):
    result = guardrail.pheme.verify_ground_truth("The moon is made of cheese", sources=[])
    assert result["status"] == "UNVERIFIABLE"
    assert result["confidence"] == 0.0

def test_kratos_arbitrate_precedence(guardrail):
    # Nature vs Twitter
    result = guardrail.kratos.arbitrate_conflict(
        "Claim A", "Claim B", 
        "nature.com", "twitter.com", 
        "scientific"
    )
    assert result["winner"] == "A"
    assert result["precedenceUsed"] is True

def test_kratos_arbitrate_domain_rule(guardrail):
    # FDA in medical domain
    result = guardrail.kratos.arbitrate_conflict(
        "Claim A", "Claim B", 
        "fda.gov", "generic_blog.com", 
        "medical"
    )
    assert result["winner"] == "A"
    assert "Health authority takes precedence" in result["reasoning"]
