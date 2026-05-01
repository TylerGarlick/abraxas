import pytest
import os
import json
import shutil
from unittest.mock import patch
from skills.retrospectives.python.logic import RetrospectivesLogic

@pytest.fixture
def retro_logic(tmp_path):
    # Set retro dir to temporary path
    test_dir = tmp_path / "retros"
    test_dir.mkdir()
    
    with patch.dict("os.environ", {"Sovereign_RETRO_DIR": str(test_dir)}):
        RetrospectivesLogic._instance = None
        return RetrospectivesLogic()

def test_save_retro(retro_logic):
    content = {"well": ["A"], "notWell": ["B"]}
    result = retro_logic.save_retro("2026-01-01", "day", "test-1", content)
    assert "Retrospective saved to" in result
    
    # Verify file exists
    expected_path = os.path.join(retro_logic.RETRO_BASE_DIR, "2026", "01", "01", "day_test-1.json")
    assert os.path.exists(expected_path)
    with open(expected_path, "r") as f:
        assert json.load(f) == content

def test_get_retros_for_period(retro_logic):
    # Setup a few retros
    retro_logic.save_retro("2026-01-01", "day", "1", {"val": "one"})
    retro_logic.save_retro("2026-01-02", "day", "2", {"val": "two"})
    retro_logic.save_retro("2026-01-05", "day", "3", {"val": "three"})
    
    # Range 1-3
    results = retro_logic.get_retros_for_period("2026-01-01", "2026-01-03")
    assert len(results) == 2
    
    # Range all
    results_all = retro_logic.get_retros_for_period("2026-01-01", "2026-01-05")
    assert len(results_all) == 3

def test_create_ledger_task(retro_logic):
    result = retro_logic.create_ledger_task("Fix bug", "high", "retro-123")
    assert "Ledger task created" in result
    
    ledger_path = os.path.join(retro_logic.RETRO_BASE_DIR, "ledger.json")
    assert os.path.exists(ledger_path)
    with open(ledger_path, "r") as f:
        entries = json.load(f)
        assert len(entries) == 1
        assert entries[0]["description"] == "Fix bug"
