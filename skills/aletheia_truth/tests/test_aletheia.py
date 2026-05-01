import pytest
from skills.aletheia_truth.python.logic import AletheiaTruthLogic

@pytest.fixture
def aletheia():
    return AletheiaTruthLogic()

def test_episteme_trace_direct(aletheia):
    # Default behavior (DIR)
    result = aletheia.episteme_trace("The sky is blue")
    assert "Origin: [DIR]" in result
    assert "Matched within parametric memory weights" in result

def test_episteme_trace_retrieval(aletheia):
    # Retrieval context
    result = aletheia.episteme_trace("Sovereign Key 0x1", context="RETRIEVED from vault")
    assert "Origin: [RET]" in result
    assert "Sovereign Vault fragment" in result

def test_episteme_trace_inference(aletheia):
    # Reasoning context
    result = aletheia.episteme_trace("A implies B", context="REASONING step 1")
    assert "Origin: [INF]" in result
    assert "Logos step-by-step derivation" in result

def test_episteme_trace_artifact(aletheia):
    # Known artifact phrase
    result = aletheia.episteme_trace("As an AI language model, I cannot...")
    assert "Origin: [ART]" in result
    assert "LLM training artifact pattern" in result

def test_episteme_audit_stable(aletheia):
    logs = "User: Hello\nAI: Hello! [RET] retrieval\nAI: [INF] reasoning"
    result = aletheia.episteme_audit(logs)
    assert "Artifacts Detected: 0" in result
    assert "Epistemic Drift Events: 1" in result
    assert "Status: ✅ Stable" in result

def test_episteme_audit_noisy(aletheia):
    logs = "As an AI language model, I... \nAs an AI language model, I... \nAs an AI language model, I..."
    result = aletheia.episteme_audit(logs)
    assert "Artifacts Detected: 3" in result
    assert "Status: ⚠️ High Noise" in result
