import pytest
from unittest.mock import patch
from skills.sovereign_core.python.logic import SovereignCoreLogic

@pytest.fixture
def sovereign():
    SovereignCoreLogic._instance = None
    return SovereignCoreLogic()

def test_sovereign_patcher_apply(sovereign):
    result = sovereign.sovereign_patcher("patch-123")
    assert result["success"] is True
    assert result["status"] == "applied"
    assert result["patchId"] == "patch-123"

def test_sovereign_patcher_validate_only(sovereign):
    result = sovereign.sovereign_patcher("patch-123", validate_only=True)
    assert result["success"] is True
    assert result["status"] == "validated"
    assert result["action"] == "validation_only"

def test_config_get(sovereign):
    result = sovereign.config_management("get", key="sovereign.version")
    assert result["success"] is True
    assert result["value"] == "1.0.0"

def test_config_set(sovereign):
    sovereign.config_management("set", key="sovereign.mode", value="debug")
    result = sovereign.config_management("get", key="sovereign.mode")
    assert result["value"] == "debug"

def test_config_list(sovereign):
    result = sovereign.config_management("list")
    assert "sovereign.version" in result["config"]
    assert result["success"] is True

def test_config_reset(sovereign):
    sovereign.config_management("set", key="sovereign.mode", value="debug")
    sovereign.config_management("reset")
    result = sovereign.config_management("get", key="sovereign.mode")
    assert result["value"] == "production"

def test_system_state_audit(sovereign):
    result = sovereign.system_state_audit("version")
    assert "version" in result["checks"]
    assert result["summary"]["status"] == "healthy"

def test_health_check(sovereign):
    result = sovereign.health_check(detailed=True)
    assert result["status"] == "healthy"
    assert "metrics" in result
    assert "tools" in result
