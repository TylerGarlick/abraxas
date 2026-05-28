from enum import Enum
import os
import logging

logger = logging.getLogger("sovereign-state")

class EpistemicMode(Enum):
    SOL = "sol"   # Deterministic / Verified / Sovereign
    NOX = "nox"   # Generative / Intuitive / Dreaming
    AUTO = "auto" # Dynamic routing based on Soter risk

class SovereignStateManager:
    """
    Deterministic State Machine for Abraxas v4.1.
    Enforces the operational path based on the current epistemic mode.
    """
    def __init__(self):
        self.current_mode = EpistemicMode.AUTO
        
    def set_mode(self, mode: str):
        try:
            self.current_mode = EpistemicMode(mode.lower())
            logger.info(f"Sovereign State transitioned to: {self.current_mode.name}")
        except ValueError:
            logger.warning(f"Invalid mode requested: {mode}. Defaulting to AUTO.")
            self.current_mode = EpistemicMode.AUTO

    def get_required_pipeline(self) -> list:
        """
        Returns the sequence of gates that MUST be passed for the current mode.
        """
        if self.current_mode == EpistemicMode.SOL:
            return ["SOTER_SCAN", "JANUS_CONSENSUS", "GROUNDING_CHECK", "SOTER_VETO"]
        
        if self.current_mode == EpistemicMode.NOX:
            return ["PROBABILISTIC_GEN"]
            
        if self.current_mode == EpistemicMode.AUTO:
            # AUTO starts with a scan to decide the path
            return ["SOTER_SCAN", "DYNAMIC_SKELETON_ROUTE"]
            
        return ["PROBABILISTIC_GEN"]

    def resolve_auto_mode(self, risk_score: float) -> EpistemicMode:
        """
        Deterministic transition: If risk > threshold, force SOL mode.
        """
        threshold = float(os.getenv("SOTER_THRESHOLD", "5.0"))
        if risk_score > threshold:
            return EpistemicMode.SOL
        return EpistemicMode.NOX
