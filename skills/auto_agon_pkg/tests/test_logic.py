import pytest
from skills.auto_agon.python.logic import AutoAgonLogic

def test_hardening_logic():
    logic = AutoAgonLogic()
    
    # Test a "strong" claim
    claim_id = "C1"
    content = "This is a long and detailed claim with sufficient evidence to survive a red-team attack."
    result = logic.trigger_stress_test(claim_id, content)
    
    assert result.survived is True
    assert result.hardening_score >= 0.8
    assert logic.promote_to_truth(result) is True

def test_fragile_claim():
    logic = AutoAgonLogic()
    
    # Test a "weak" claim
    claim_id = "C2"
    content = "Shorty"
    result = logic.trigger_stress_test(claim_id, content)
    
    assert result.survived is False
    assert result.hardening_score < 0.8
    assert logic.promote_to_truth(result) is False
