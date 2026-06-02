import pytest
from infra.mcp.context import AbraxasContext
from infra.mcp.db_manager import DBManager
from skills.sieve.python.logic import SieveLogic
from skills.sovereign_anchor.python.logic import SovereignAnchor
from skills.auto_agon.python.logic import AutoAgonLogic
from skills.epistemic_atlas.python.logic import EpistemicAtlas

class MockDB:
    def __init__(self):
        self.data = {}
    def collection(self, name):
        return self
    def insert(self, doc, overwrite=False):
        key = doc.get('_key') or doc.get('key')
        self.data[key] = doc
    def get(self, key):
        return self.data.get(key)

def test_sovereign_pipeline_e2e():
    \"\"\"
    End-to-End Test: Signal -> Admitting -> Anchoring -> Hardening -> Atlas Mapping
    \"\"\"
    # 1. Setup
    ctx = AbraxasContext(root_dir=".")
    db_mgr = DBManager(ctx)
    db_mgr.db = MockDB()
    
    sieve = SieveLogic()
    anchor = SovereignAnchor(db_mgr)
    agon = AutoAgonLogic()
    atlas = EpistemicAtlas(db_mgr)
    
    # 2. Sieve: High-Valence Signal
    raw_signal = "We have detected a systemic rupture in the core logic of the Sovereign Brain."
    analysis = sieve.analyze_signal(raw_signal)
    assert analysis["admit_to_ledger"] is True, "Sieve should admit high-valence signal."
    
    # 3. Anchor: Convert to Genesis Block
    anchor_id = anchor.anchor_truth(raw_signal, {"context": "Sovereign Detection"})
    assert db_mgr.db.get(anchor_id)["content"] == raw_signal
    
    # 4. Auto-Agon: Hardening
    hardening_result = agon.trigger_stress_test(anchor_id, raw_signal)
    assert hardening_result.survived is True, "Long signals should survive hardening simulation."
    
    # 5. Atlas: Trace provenance
    trace = atlas.trace_provenance(anchor_id)
    assert trace["status"] == "COMPLETE"
    assert any(step["id"] == anchor_id for step in trace["provenance_chain"])

    print("✅ Sovereign E2E Pipeline Verified: Signal -> Anchor -> Agon -> Atlas")
