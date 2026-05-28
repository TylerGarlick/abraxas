import math
from typing import List, Dict, Any, Optional

class SovereignEngineLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SovereignEngineLogic, cls).__new__(cls)
            cls._instance._init_config()
        return cls._instance

    def _init_config(self):
        self.config = {
            "lambda": 0.5,
            "alpha": 0.7,
            "beta": 0.1,
            "mPaths": 5,
            "nThreshold": 3,
            "tauThreshold": 0.15,
        }

    def calculate_sovereign_weight(self, risk_scores: List[float], target_index: int, lambda_val: Optional[float] = None) -> float:
        """Calculate sovereign weight using softmax-like distribution of risk scores."""
        l = lambda_val if lambda_val is not None else self.config["lambda"]
        
        exponents = [math.exp(-l * r) for r in risk_scores]
        sum_exponents = sum(exponents)
        
        if sum_exponents == 0:
            return 0.0
            
        return exponents[target_index] / sum_exponents

    def compute_integrated_confidence(self, arch_conf: float, rlcr_score: float, alpha: Optional[float] = None) -> float:
        """Compute integrated confidence using linear combination of architecture confidence and RLCR."""
        a = alpha if alpha is not None else self.config["alpha"]
        return (a * arch_conf) + ((1 - a) * rlcr_score)

    def calculate_rlcr(self, history: List[bool], beta: Optional[float] = None) -> float:
        """Calculate Reliability-Lattice Confidence Rate (RLCR) based on historical correctness."""
        if not history:
            return 0.5
        
        b = beta if beta is not None else self.config["beta"]
        
        numerator = 0.0
        denominator = 0.0
        t = len(history)
        
        for tau_idx, correct in enumerate(history):
            tau = tau_idx + 1
            weight = math.exp(-b * (t - tau))
            if correct:
                numerator += weight
            denominator += weight
            
        return numerator / denominator

    def verify_consensus(self, answers: List[str], threshold: Optional[int] = None) -> Dict[str, Any]:
        """Verify if a consensus has been reached across multiple answers."""
        n_threshold = threshold if threshold is not None else self.config["nThreshold"]
        
        counts = {}
        for a in answers:
            counts[a] = counts.get(a, 0) + 1
            
        winner = None
        max_count = 0
        
        for answer, count in counts.items():
            if count > max_count:
                max_count = count
                winner = answer
                
        if max_count < n_threshold:
            return {"winner": None, "count": max_count}
            
        return {"winner": winner, "count": max_count}

    def get_epistemic_label(self, confidence: float) -> str:
        """Map confidence score to an epistemic label."""
        if confidence >= 0.95:
            return "[KNOWN]"
        if confidence >= 0.70:
            return "[INFERRED]"
        if confidence >= 0.40:
            return "[UNCERTAIN]"
        return "[UNKNOWN]"
