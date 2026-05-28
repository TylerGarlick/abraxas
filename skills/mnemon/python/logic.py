from typing import Dict, Any, Optional
import datetime

class MnemonLogic:
    def __init__(self):
        self.beliefs = {}

    def record_belief(self, claim: str, confidence: float, lens: str) -> Dict[str, Any]:
        """Records a belief fragment with epistemic lens and confidence."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.beliefs[now] = {"claim": claim, "confidence": confidence, "lens": lens}
        return {
            "success": True,
            "timestamp": now,
            "action": "record_belief",
            "belief_id": now
        }

    def track_revision(self, belief_id: str, new_confidence: float, reason: str) -> Dict[str, Any]:
        """Tracks the revision of a belief over time."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if belief_id not in self.beliefs:
            return {"success": False, "error": "Belief ID not found"}
        
        self.beliefs[belief_id]["confidence"] = new_confidence
        self.beliefs[belief_id]["revision"] = {"reason": reason, "timestamp": now}
        return {
            "success": True,
            "timestamp": now,
            "action": "track_revision",
            "belief_id": belief_id
        }

    def flag_prompted(self, belief_id: str, source_prompt: str) -> Dict[str, Any]:
        """Flags a belief as having been elicited by a specific prompt."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if belief_id not in self.beliefs:
            return {"success": False, "error": "Belief ID not found"}
        
        self.beliefs[belief_id]["prompted"] = True
        self.beliefs[belief_id]["source_prompt"] = source_prompt
        return {
            "success": True,
            "timestamp": now,
            "action": "flag_prompted",
            "belief_id": belief_id
        }
