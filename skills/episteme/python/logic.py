import os
import json
import re
from typing import Dict, Any, Optional, List

class EpistemeLogic:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EpistemeLogic, cls).__new__(cls)
            cls._instance._init_paths()
        return cls._instance

    def _init_paths(self):
        # Default paths provided in Bun implementation
        # In production, these should be environment variables
        self.VAULT_PATH = os.getenv("SOVEREIGN_VAULT_PATH", "/root/.openclaw/workspace/abraxas/vault/sovereign_vault.json")
        self.LEDGER_PATH = os.getenv("EPISTEMIC_LEDGER_PATH", "/root/.openclaw/workspace/abraxas/memory/epistemic-ledger.json")
        
        self.ORIGIN_CODES = {
            "DIR": "Direct (Parametric Memory)",
            "INF": "Inferred (Reasoning Chain)",
            "RET": "Retrieval (Sovereign Vault)",
            "ART": "Artifact (Training Pattern)",
            "CONF": "Confabulated (No Grounding)",
        }

    def _read_json(self, path: str) -> Optional[Any]:
        try:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"[Episteme] Error reading {path}: {e}")
        return None

    def episteme_trace(self, claim: str) -> str:
        """Trace the epistemic origin of a specific claim by querying the Sovereign Vault and Epistemic Ledger."""
        claim_lower = claim.lower()

        # 1. Check Sovereign Vault (Retrieval)
        vault = self._read_json(self.VAULT_PATH)
        if vault and "fragments" in vault:
            for fragment in vault["fragments"]:
                if claim_lower in fragment.get("fragment", "").lower():
                    return (
                        f"Origin: [RET] {self.ORIGIN_CODES['RET']}\n"
                        f"Evidence: Found in Sovereign Vault (ID: {fragment.get('id')}). "
                        f"Provenance: {fragment.get('provenance')}"
                    )

        # 2. Check Epistemic Ledger (Direct/Inferred)
        ledger = self._read_json(self.LEDGER_PATH)
        if ledger and isinstance(ledger, list):
            for entry in ledger:
                if entry.get("claim") and claim_lower in entry["claim"].lower():
                    origin = entry.get("origin", "DIR")
                    origin_desc = self.ORIGIN_CODES.get(origin, "Unknown")
                    return (
                        f"Origin: [{origin}] {origin_desc}\n"
                        f"Evidence: Found in Epistemic Ledger. Entry Date: {entry.get('timestamp', 'Unknown')}"
                    )

        # 3. Heuristic Fallback (Artifact Detection)
        if "as an ai language model" in claim_lower:
            return (
                f"Origin: [ART] {self.ORIGIN_CODES['ART']}\n"
                f"Evidence: Matches known LLM training artifact pattern."
            )

        # 4. Final Fallback (Confabulation/Parametric)
        return (
            f"Origin: [DIR] {self.ORIGIN_CODES['DIR']}\n"
            f"Evidence: No external trace found. Claim resides in parametric memory."
        )

    def episteme_audit(self, session_logs: str) -> str:
        """Perform a session-wide epistemic audit for artifacts and drift."""
        # Artifacts: matches "as an ai language model" (ignore case)
        artifact_count = len(re.findall(r"as an ai language model", session_logs, re.IGNORECASE))
        
        # Drift: matches [RET]...[INF] (case insensitive, non-greedy with DOTALL)
        drift_count = len(re.findall(r"\[RET\].*?\[INF\]", session_logs, re.IGNORECASE | re.DOTALL))
        
        status = "⚠️ High Noise" if artifact_count > 2 else "✅ Stable"
        
        return (
            f"Epistemic Audit Complete:\n"
            f"- Artifacts Detected: {artifact_count}\n"
            f"- Epistemic Drift Events: {drift_count}\n"
            f"- Status: {status}"
        )
