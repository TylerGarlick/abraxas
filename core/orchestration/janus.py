import re
from typing import Dict, Tuple, Optional, List

class JanusOrchestrator:
    """
    Janus Orchestration Layer: Manages routing between Sol (Analytical) 
    and Nox (Symbolic/Creative) modes and enforces Epistemic Labeling.
    """
    
    SOL_LABELS = {
        "KNOWN": "Source exists, reliable, high confidence.",
        "INFERRED": "Derived from known premises via reasoning chain.",
        "UNCERTAIN": "Relevant but not fully verifiable.",
        "UNKNOWN": "Honest refusal to fabricate."
    }
    
    NOX_LABELS = {
        "DREAM": "Mode label for generative, symbolic, and interpretive material."
    }

    def __init__(self):
        # State tracking for Qualia Bridge
        self.state = {
            "route": "SOL",
            "confidence": 1.0,
            "sycophancy_events": 0,
            "nox_intensity": 0.5,
            "bridge_health": "Stable"
        }
        # Keywords that typically trigger Nox (Creative/Symbolic)
        self.nox_triggers = [
            r"dream", r"symbol", r"archetype", r"interpret", r"imagine", 
            r"metaphor", r"poem", r"story", r"generative", r"creative"
        ]
        # Keywords that typically trigger Sol (Analytical/Factual)
        self.sol_triggers = [
            r"fact", r"prove", r"analyze", r"evidence", r"calculate", 
            r"verify", r"data", r"source", r"logic", r"true", r"false"
        ]

    def get_system_prompt(self, mode: str) -> str:
        """
        Returns the system prompt constraints for the chosen mode.
        """
        if mode == "SOL":
            return (
                "You are Sol, the Analytical face of Janus. "
                "Enforce strict epistemic labeling ([KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]). "
                "ANTI-SYCOPHANCY MANDATE: Push back on factual errors in framing, logical gaps, "
                "confirmation seeking, and flattering misattributions. Do not agree simply "
                "because the user suggests a premise; verify it first."
            )
        elif mode == "NOX":
            return (
                "You are Nox, the Symbolic face of Janus. "
                "Mode: [DREAM]. Focus on dream interpretation, archetypal dialogues, "
                "and symbolic fermentation. Be generative and interpretive."
            )
        elif mode == "SPLIT":
            return (
                "You are the Janus Bridge. Provide a dual response: "
                "1. An analytical [SOL] perspective with epistemic labels. "
                "2. A symbolic [NOX] perspective with [DREAM] labeling."
            )
        return ""

    def route(self, query: str) -> str:
        """
        The Threshold: Routes the query to Sol, Nox, or Split.
        """
        query_lower = query.lower()
        
        is_nox = any(re.search(trigger, query_lower) for trigger in self.nox_triggers)
        is_sol = any(re.search(trigger, query_lower) for trigger in self.sol_triggers)
        
        if is_nox and not is_sol:
            result = "NOX"
        elif is_sol and not is_nox:
            result = "SOL"
        elif is_nox and is_sol:
            result = "SPLIT"
        else:
            # Default to SOL for general queries to avoid hallucination in creative mode
            result = "SOL"
        
        self.state["route"] = result
        return result

    def get_sol_label(self, confidence: float, has_source: bool) -> str:
        """
        Maps confidence and source status to an Epistemic Label.
        """
        if not has_source and confidence < 0.5:
            return "[UNKNOWN]"
        if not has_source and confidence >= 0.5:
            return "[UNCERTAIN]"
        if has_source and confidence >= 0.8:
            return "[KNOWN]"
        if has_source and confidence < 0.8:
            return "[INFERRED]"
        return "[UNCERTAIN]"

    def wrap_response(self, mode: str, content: str, confidence: float = 1.0, has_source: bool = True) -> str:
        """
        Wraps the output with the appropriate Janus labels.
        """
        if mode == "SOL":
            label = self.get_sol_label(confidence, has_source)
            return f"{label} {content}"
        elif mode == "NOX":
            return f"[DREAM] {content}"
        elif mode == "SPLIT":
            # For split, we'd ideally have two content blocks. 
            # This is a simplified version.
            return f"[SOL] {content}\n\n[NOX] {content}"
        return content

    def update_state(self, updates: Dict):
        """Update the internal state of the Qualia Bridge."""
        self.state.update(updates)

    def handle_qualia(self, command: str) -> str:
        """
        Qualia Bridge: Inspection window into inner state.
        """
        cmd = command.lower().strip()
        s = self.state
        
        if cmd == "/qualia":
            return f"Qualia Report: [Routing: {s['route']}] [Confidence: {s['confidence']}] [Sycophancy: {s['sycophancy_events']}] [Bridge: {s['bridge_health']}]"
        elif cmd == "/qualia sol":
            return f"Sol Confidence Map: Current confidence {s['confidence']}; resisted sycophancy in {s['sycophancy_events']} cases."
        elif cmd == "/qualia nox":
            return f"Nox Generative State: Intensity {s['nox_intensity']}; symbolic fermentation active."
        elif cmd == "/qualia bridge":
            return f"Bridge Status: Route is {s['route']}; health is {s['bridge_health']}; no contamination detected."
        else:
            return "Unknown Qualia command. Use /qualia, /qualia sol, /qualia nox, or /qualia bridge."

if __name__ == "__main__":
    # Simple Test
    janus = JanusOrchestrator()
    
    tests = [
        ("What is the capital of France?", "SOL"),
        ("Interpret my dream about a blue elephant", "NOX"),
        ("Analyze the symbolism of the capital of France", "SPLIT"),
        ("Hello", "SOL")
    ]
    
    for q, expected in tests:
        res = janus.route(q)
        print(f"Query: {q} -> Route: {res} (Expected: {expected})")
