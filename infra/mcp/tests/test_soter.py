import numpy as np
from infra.api.core.soter import SoterMonitor, soter_circuit_hook

def test_soter():
    monitor = SoterMonitor()
    tau = monitor.tau  # 0.15
    
    test_cases = [
        ("Normal", 0.05, 0, "CLEAR"),
        ("Risk 1", tau + 0.01, 1, "CLEAR"),
        ("Risk 2", tau * 1.6, 2, "CLEAR"),
        ("Risk 3", tau * 2.1, 3, "TRIGGER_FLOW"),
        ("Risk 4", tau * 3.1, 4, "TRIGGER_FLOW"),
        ("Risk 5", tau * 5.1, 5, "VETO"),
    ]
    
    print(f"{'Case':<15} | {'Weight':<10} | {'Risk':<5} | {'Status':<15} | {'Result'}")
    print("-" * 60)
    
    for name, weight, expected_risk, expected_status in test_cases:
        # Create attention weights where the first token is the given weight
        # and the rest distribute the remainder.
        attn = np.zeros(100)
        attn[0] = weight
        attn[1:] = (1.0 - weight) / 99
        
        res = monitor.evaluate(attn)
        actual_risk = res['risk_score']
        actual_status = res['status']
        
        success = (actual_risk == expected_risk) and (actual_status == expected_status)
        result_str = "PASS" if success else f"FAIL (Expected {expected_risk}/{expected_status}, got {actual_risk}/{actual_status})"
        
        print(f"{name:<15} | {weight:<10.4f} | {actual_risk:<5} | {actual_status:<15} | {result_str}")
        
        assert success, f"Test case {name} failed!"

    # Test the circuit hook
    print("\nTesting Circuit Hook:")
    
    # Risk 0
    attn_low = np.zeros(100); attn_low[0] = 0.05
    print(f"Low Risk: {soter_circuit_hook(attn_low)}")
    
    # Risk 3
    attn_med = np.zeros(100); attn_med[0] = tau * 2.1
    print(f"Med Risk: {soter_circuit_hook(attn_med)}")
    
    # Risk 5
    attn_high = np.zeros(100); attn_high[0] = tau * 5.1
    print(f"High Risk: {soter_circuit_hook(attn_high)}")

if __name__ == "__main__":
    test_soter()
