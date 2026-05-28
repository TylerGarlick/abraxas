import os
import pytest
from infra.api.src.core.config import SovereignConfig

def test_config_defaults():
    """PROVE: Configuration falls back to verified defaults when env is empty."""
    # Mock environment to be empty
    os.environ.clear()
    cfg = SovereignConfig()
    assert cfg.LLM_URL == "http://localhost:11434"
    assert cfg.SVR_MODEL == "gpt-oss:120b-cloud"
    assert cfg.SOTER_SENSITIVITY == 5.0

def test_config_overrides():
    """PROVE: Configuration correctly reads environment overrides."""
    os.environ["ABRAXAS_LLM_URL"] = "http://cloud-ai:8080"
    os.environ["ABRAXAS_SVR_MODEL"] = "sovereign-v4-max"
    os.environ["ABRAXAS_SOTER_SENSITIVITY"] = "2.5"
    
    cfg = SovereignConfig()
    assert cfg.LLM_URL == "http://cloud-ai:8080"
    assert cfg.SVR_MODEL == "sovereign-v4-max"
    assert cfg.SOTER_SENSITIVITY == 2.5

def test_config_invalid_float():
    """PROVE: System handles corrupted sensitivity values gracefully."""
    os.environ["ABRAXAS_SOTER_SENSITIVITY"] = "NOT_A_NUMBER"
    cfg = SovereignConfig()
    assert cfg.SOTER_SENSITIVITY == 5.0 # Fallback
