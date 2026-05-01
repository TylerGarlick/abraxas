import pytest
from skills.janus.python.logic import JanusLogic

@pytest.fixture
def janus():
    return JanusLogic()

def test_mode_switch(janus):
    res = janus.switch_mode("SOL", "Testing")
    assert "Analytical (Deterministic)" in res
    assert janus.current_mode == "SOL"

def test_spawn_paths(janus):
    paths = janus.spawn_paths("Is the earth flat?", m_paths=3)
    assert len(paths) == 3
    assert paths[0].query == "Is the earth flat?"
    assert paths[0].lens is not None

def test_resolve_consensus_sovereign(janus):
    results = ["Yes", "Yes", "Yes", "No"]
    res = janus.resolve_consensus(results)
    assert res["bestClaim"] == "yes"
    assert res["result"] == "EMITTED"
    assert "Sovereign Consensus: 3/4" in res["seal"]

def test_resolve_consensus_blocked(janus):
    results = ["Yes", "No", "Maybe"]
    res = janus.resolve_consensus(results)
    assert res["result"] == "BLOCKED"
    assert "Sovereign Unknown" in res["seal"]
