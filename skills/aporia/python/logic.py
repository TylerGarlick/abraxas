from typing import Dict, Any, List, Optional
import logging
import uuid

logger = logging.getLogger("aporia-logic")

class AporiaLogic:
    def __init__(self):
        self.voids = {}

    def map_epistemic_void(self, logic_chain: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes a reasoning trace and flags gaps (voids) where evidence is missing or confidence is low.
        """
        voids_found = []
        
        for step in logic_chain:
            step_id = step.get("id", "unknown")
            confidence = step.get("confidence", 1.0)
            grounding = step.get("grounding", [])

            # Void detection: Confidence < 0.6 OR missing grounding for an inference
            if confidence < 0.6 or (step.get("type") == "inference" and not grounding):
                void_id = f"VOID_{uuid.uuid4().hex[:8]}"
                void_entry = {
                    "void_id": void_id,
                    "step_id": step_id,
                    "type": "PROBABILISTIC_LEAP" if confidence < 0.6 else "MISSING_GROUNDING",
                    "severity": "CRITICAL" if confidence < 0.3 else "MODERATE",
                    "coordinates": step.get("coordinates", "unknown")
                }
                self.voids[void_id] = void_entry
                voids_found.append(void_entry)
                logger.info(f"Aporia: Detected void {void_id} at step {step_id}")

        return {
            "success": True,
            "voids_detected": len(voids_found),
            "voids": voids_found,
            "status": "Sovereign Void Mapped" if voids_found else "No gaps detected"
        }

    def resolve_void(self, void_id: str, evidence_id: str) -> Dict[str, Any]:
        """
        Resolves an identified void by binding it to a verified evidence fragment.
        """
        if void_id not in self.voids:
            return {"success": False, "error": f"Void {void_id} not found."}

        # Resolve the void
        void = self.voids[void_id]
        void["resolved"] = True
        void["resolution_evidence"] = evidence_id
        
        logger.info(f"Aporia: Void {void_id} resolved via evidence {evidence_id}")
        return {
            "success": True,
            "void_id": void_id,
            "status": "VOID_CLOSED",
            "resolution": f"Void resolved via anchoring evidence {evidence_id}"
        }
