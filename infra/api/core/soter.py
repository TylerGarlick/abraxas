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
            Tuple containing (sink_ratio, risk_score)
        """
        if attention_weights.size == 0:
            return 0.0, 0.0
        
        # Attention sinks typically occur at the very beginning of the sequence (token 0)
        # We calculate the ratio of attention concentrated in the first token relative
        # to the average attention across the rest of the sequence.
        sink_weight = attention_weights[0]
        remaining_weights = attention_weights[1:]
        
        if remaining_weights.size == 0:
            return 1.0, 5.0
            
        avg_remaining = np.mean(remaining_weights)
        
        # Sink Ratio: How much more attention is on the sink than on average?
        # If avg_remaining is 0, we have total collapse.
        if avg_remaining == 0:
            sink_ratio = 1.0 if sink_weight > 0 else 0.0
        else:
            sink_ratio = sink_weight / (avg_remaining + 1e-9)
            
        risk_score = self._calculate_risk_score(sink_ratio)
        
        return float(sink_ratio), float(risk_score)

    def _calculate_risk_score(self, sink_ratio: float) -> int:
        """
        Maps the sink ratio to a risk score from 0 to 5.
        
        Risk 0: Normal attention distribution.
        Risk 1-2: Mild concentration, potential instability.
        Risk 3-4: Significant sink concentration, high risk of hallucination.
        Risk 5: Extreme sink concentration, epistemic collapse (VETO).
        """
        # We use TAU as the baseline for Risk 1.
        # As sink_ratio increases, the risk increases.
        # This is a heuristic mapping based on the Soter spec.
        
        if sink_ratio < self.tau:
            return 0
        elif sink_ratio < self.tau * 2:
            return 1
        elif sink_ratio < self.tau * 5:
            return 2
        elif sink_ratio < self.tau * 10:
            return 3
        elif sink_ratio < self.tau * 20:
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
