import re
from typing import Dict, Any, Optional

class AletheiaTruthLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AletheiaTruthLogic, cls).__new__(cls)
            cls._instance._init_constants()
        return cls._instance

    def _init_constants(self):
        self.ORIGIN_CODES = {
            "DIR": "Direct (Parametric Memory)",
            "INF": "Inferred (Reasoning Chain)",
            "RET": "Retrieval (Sovereign Vault)",
            "ART": "Artifact (Training Pattern)",
            "CONF": "Confabulated (No Grounding)",
        }

    def episteme_trace(self, claim: str, context: Optional[str] = None) -> str:
        """Trace the epistemic origin of a specific claim."""
        origin = "DIR"
        evidence = "Matched within parametric memory weights."
        
        if context:
            if "RETRIEVED" in context:
                origin = "RET"
                evidence = "Claim found in Sovereign Vault fragment via Mnemosyne."
            elif "REASONING" in context:
                origin = "INF"
                evidence = "Derived via Logos step-by-step derivation."
        
        if "as an ai language model" in claim.lower():
            origin = "ART"
            evidence = "Matches known LLM training artifact pattern."

        origin_desc = self.ORIGIN_CODES.get(origin, "Unknown")
        return f"Origin: [{origin}] {origin_desc}\nEvidence: {evidence}"

    def episteme_audit(self, session_logs: str) -> str:
        """Perform a session-wide epistemic audit for artifacts and drift."""
        # Artifacts: matches "as an ai language model" (ignore case)
        artifact_count = len(re.findall(r"as an ai language model", session_logs, re.IGNORECASE))
        
        # Drift: matches [RET]...[INF] (case insensitive, non-greedy to capture individual events)
        drift_count = len(re.findall(r"\[RET\].*?\[INF\]", session_logs, re.IGNORECASE | re.DOTALL))
        
        status = "⚠️ High Noise" if artifact_count > 2 else "✅ Stable"
        
        return (
            f"Epistemic Audit Complete:\n"
            f"- Artifacts Detected: {artifact_count}\n"
            f"- Epistemic Drift Events: {drift_count}\n"
            f"- Status: {status}"
        )
