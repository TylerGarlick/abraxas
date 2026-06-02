from typing import Dict, Any, List, Optional
import logging
import uuid

logger = logging.getLogger("sieve-logic")

class SieveLogic:
    """
    The Sieve is the high-valence curation layer of the Sovereign Brain.
    It separates high-valence anomalies (signals) from environmental noise 
    using the 'gremlin signature' approach.
    """
    def __init__(self):
        # The "gremlin signature" represents a set of linguistic or structural 
        # patterns that indicate high-valence, non-trivial epistemic shifts.
        self.gremlin_signatures = [
            "paradigm shift", "systemic rupture", "epistemic collapse", 
            "structural anomaly", "irreversible transition", "high-valence signal"
        ]

    def analyze_signal(self, raw_input: str) -> Dict[str, Any]:
        """
        Processes a raw signal to determine if it should be admitted to the Sovereign Ledger.
        """
        # Simple valence calculation based on signature matching
        valence_score = 0.0
        matches = []
        
        input_lower = raw_input.lower()
        for sig in self.gremlin_signatures:
            if sig in input_lower:
                valence_score += 0.2
                matches.append(sig)
        
        # Adjust score based on structure (e.g., presence of complex logical markers)
        if "=>" in raw_input or "Therefore," in raw_input:
            valence_score += 0.1
            
        # Normalize score to 0.0 - 1.0
        final_score = min(1.0, valence_score)
        
        status = "NOISE"
        if final_score >= 0.6:
            status = "HIGH_VALENCE"
        elif final_score >= 0.3:
            status = "LOW_VALENCE"
            
        return {
            "input_snippet": raw_input[:100] + "..." if len(raw_input) > 100 else raw_input,
            "valence_score": final_score,
            "matches": matches,
            "status": status,
            "admit_to_ledger": status == "HIGH_VALENCE"
        }

    def curate_stream(self, signals: List[str]) -> List[Dict[str, Any]]:
        """
        Filters a stream of data, returning only the high-valence signals.
        """
        curated = []
        for signal in signals:
            analysis = self.analyze_signal(signal)
            if analysis["admit_to_ledger"]:
                curated.append(analysis)
        
        return curated
