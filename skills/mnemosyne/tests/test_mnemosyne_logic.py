import pytest
import os
from skills.mnemosyne.python.logic import MnemosyneLogic

@pytest.fixture
def mnemosyne(tmp_path):
    # Override vault path to use temp directory for tests
    vault_file = tmp_path / "test_vault.json"
    logic = MnemosyneLogic()
    logic.vault_path = str(vault_file)
    logic._init_vault()
    return logic

def test_store_and_recall(mnemosyne):
    frag = "The secret code is 12345"
    prov = "Internal Audit"
    fid = mnemosyne.store(frag, prov)
    
    # Recall by ID
    result = mnemosyne.recall(fid)
    assert result is not None
    assert result.fragment == frag
    assert result.provenance == prov
    
    # Recall by keyword
    result_kw = mnemosyne.recall("secret code")
    assert result_kw is not None
    assert result_kw.fragment == frag

def test_recall_missing(mnemosyne):
    result = mnemosyne.recall("non-existent item")
    assert result is None
