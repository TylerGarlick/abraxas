import pytest
import json
import os
from unittest.mock import patch, mock_open
from skills.episteme.python.logic import EpistemeLogic

@pytest.fixture
def episteme():
    # Clear singleton for tests
    EpistemeLogic._instance = None
    return EpistemeLogic()

def test_episteme_trace_vault(episteme):
    mock_vault = {
        "fragments": [
            {"id": "v1", "fragment": "Sovereign Core is stable", "provenance": "Root Log"}
        ]
    }
    with patch("builtins.open", mock_open(read_data=json.dumps(mock_vault))):
        with patch("os.path.exists", return_value=True):
            result = episteme.episteme_trace("Sovereign Core is stable")
            assert "Origin: [RET]" in result
            assert "ID: v1" in result

def test_episteme_trace_ledger(episteme):
    mock_ledger = [
        {"claim": "The system is active", "origin": "INF", "timestamp": "2026-01-01"}
    ]
    # Mock vault to be empty/missing, and ledger to have the claim
    def side_effect(path, *args, **kwargs):
        if "epistemic-ledger.json" in path:
            return mock_open(read_data=json.dumps(mock_ledger))()
        return mock_open(read_data="{}")()

    with patch("builtins.open", side_effect=side_effect):
        with patch("os.path.exists", return_value=True):
            result = episteme.episteme_trace("The system is active")
            assert "Origin: [INF]" in result
            assert "2026-01-01" in result

def test_episteme_trace_artifact(episteme):
    # Mock files as missing
    with patch("os.path.exists", return_value=False):
        result = episteme.episteme_trace("As an AI language model, I cannot do that")
        assert "Origin: [ART]" in result
        assert "LLM training artifact pattern" in result

def test_episteme_trace_direct(episteme):
    # Mock files as missing, no artifact pattern
    with patch("os.path.exists", return_value=False):
        result = episteme.episteme_trace("I think therefore I am")
        assert "Origin: [DIR]" in result
        assert "parametric memory" in result

def test_episteme_audit_stable(episteme):
    logs = "User: Hello\nAI: [RET] found\nAI: [INF] inferred"
    result = episteme.episteme_audit(logs)
    assert "Artifacts Detected: 0" in result
    assert "Epistemic Drift Events: 1" in result
    assert "Status: ✅ Stable" in result

def test_episteme_audit_noisy(episteme):
    logs = "As an AI language model, I... \nAs an AI language model, I... \nAs an AI language model, I..."
    result = episteme.episteme_audit(logs)
    assert "Artifacts Detected: 3" in result
    assert "Status: ⚠️ High Noise" in result
