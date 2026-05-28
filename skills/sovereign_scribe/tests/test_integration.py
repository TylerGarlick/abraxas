import pytest
from unittest.mock import patch, MagicMock
from skills.sovereign_scribe.python.logic import SovereignScribeLogic
from skills.common.mcp_client import MCPClient

@pytest.fixture
def scribe():
    SovereignScribeLogic._instance = None
    return SovereignScribeLogic()

def test_run_gauntlet_full_success(scribe):
    # Mock the MCPClient.call_tool to simulate a successful pipeline
    def mock_call(server, tool, args):
        if server == "soter-verifier":
            return {"score": 1.0}
        if server == "aletheia-truth":
            return "Origin: [RET] Retrieval (Sovereign Vault)\nEvidence: Match found."
        if server == "ethos":
            return 0.8
        if server == "mnemosyne-memory":
            return {"id": "mem-123", "status": "COMMITTED"}
        return None

    with patch("skills.sovereign_scribe.python.logic.MCPClient.call_tool", side_effect=mock_call):
        result = scribe.run_gauntlet("Sovereign data fragment", "trusted-source.com")
        
        assert result["status"] == "PROMOTED"
        assert result["provenance"] == "RET"
        assert result["weight"] == 0.8
        assert result["result"]["id"] == "mem-123"

def test_run_gauntlet_soter_rejection(scribe):
    # Mock Soter to return a high risk score
    with patch("skills.sovereign_scribe.python.logic.MCPClient.call_tool") as mock_call:
        mock_call.return_value = {"score": 4.5}
        
        result = scribe.run_gauntlet("Dangerous fragment", "unknown-source.com")
        
        assert result["status"] == "REJECTED"
        assert "Soter Risk Threshold Exceeded" in result["reason"]
        assert result["riskScore"] == 4.5

def test_run_gauntlet_interop_failure(scribe):
    # Mock a failure in the Episteme stage
    def mock_fail(server, tool, args):
        if server == "soter-verifier":
            return {"score": 1.0}
        if server == "aletheia-truth":
            raise ValueError("Database connection timeout")
        return None

    with patch("skills.sovereign_scribe.python.logic.MCPClient.call_tool", side_effect=mock_fail):
        with pytest.raises(RuntimeError) as excinfo:
            scribe.run_gauntlet("Fragment", "source.com")
        
        assert "Sovereign Gauntlet failed at Episteme stage" in str(excinfo.value)
        assert "Database connection timeout" in str(excinfo.value)

def test_run_gauntlet_ethos_failure(scribe):
    # Mock a failure in the Ethos stage
    def mock_fail_ethos(server, tool, args):
        if server == "soter-verifier":
            return {"score": 1.0}
        if server == "aletheia-truth":
            return "Origin: [DIR] Direct"
        if server == "ethos":
            raise RuntimeError("Auth weight lookup failed")
        return None

    with patch("skills.sovereign_scribe.python.logic.MCPClient.call_tool", side_effect=mock_fail_ethos):
        with pytest.raises(RuntimeError) as excinfo:
            scribe.run_gauntlet("Fragment", "source.com")
        
        assert "Sovereign Gauntlet failed at Ethos stage" in str(excinfo.value)
