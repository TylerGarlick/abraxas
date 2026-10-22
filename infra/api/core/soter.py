import numpy as np
from typing import Dict, Any, Optional, Tuple

class SoterMonitor:
    """
    Soter Attention-Sink Monitor
    
    Monitors attention-sink dynamics to detect epistemic collapse or hallucinations.
    Based on the tau=0.15 constant, which represents the critical threshold for
    attention weight concentration in sink tokens.
    """
    
    TAU = 0.15  # Critical threshold for attention-sink concentration

    def __init__(self, tau: Optional[float] = None):
        self.tau = tau if tau is not None else self.TAU

    def assess_attention_sink(self, attention_weights: np.ndarray) -> Tuple[float, float]:
        """
        Analyzes attention weights to determine the sink ratio.
        
        Args:
            attention_weights: A numpy array of attention weights for the last token
                                across the sequence. Shape: (seq_len,)
                                
        Returns:
            Tuple containing (sink_weight, risk_score)
        """
        if attention_weights.size == 0:
            return 0.0, 0.0
        
        # The attention sink is typically the first token in the sequence.
        sink_weight = attention_weights[0]
        risk_score = self._calculate_risk_score(sink_weight)
        
        return float(sink_weight), float(risk_score)

    def _calculate_risk_score(self, sink_weight: float) -> int:
        """
        Maps the sink weight to a risk score from 0 to 5 based on TAU.
        
        Risk 0: sink_weight < tau (Normal)
        Risk 1: tau <= sink_weight < 1.5 * tau
        Risk 2: 1.5 * tau <= sink_weight < 2 * tau
        Risk 3: 2 * tau <= sink_weight < 3 * tau
        Risk 4: 3 * tau <= sink_weight < 5 * tau
        Risk 5: sink_weight >= 5 * tau (Epistemic Collapse)
        """
        if sink_weight < self.tau:
            return 0
        elif sink_weight < self.tau * 1.5:
            return 1
        elif sink_weight < self.tau * 2.0:
            return 2
        elif sink_weight < self.tau * 3.0:
            return 3
        elif sink_weight < self.tau * 5.0:
            return 4
        else:
            return 5

    def evaluate(self, attention_weights: np.ndarray) -> Dict[str, Any]:
        """
        Full evaluation of a response's attention dynamics.
        """
        sink_ratio, risk_score = self.assess_attention_sink(attention_weights)
        
        trigger_sovereign_flow = risk_score >= 3
        veto = risk_score == 5
        
        return {
            "sink_ratio": sink_ratio,
            "risk_score": risk_score,
            "trigger_sovereign_flow": trigger_sovereign_flow,
            "veto": veto,
            "status": "VETO" if veto else ("TRIGGER_FLOW" if trigger_sovereign_flow else "CLEAR")
        }

# Example of how this integrates with the Sovereign-Flow circuit
def soter_circuit_hook(attention_weights: np.ndarray):
    monitor = SoterMonitor()
    result = monitor.evaluate(attention_weights)
    
    if result["veto"]:
        return "VETO: Epistemic collapse detected via attention-sink monitor."
    
    if result["trigger_sovereign_flow"]:
        return f"TRIGGER_FLOW: Risk Score {result['risk_score']} detected. Initiating corrective circuit."
    
    return "CLEAR: Attention dynamics within normal parameters."
