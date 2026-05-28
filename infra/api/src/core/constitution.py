import os
import logging
from typing import Dict, Any
from .config import config

logger = logging.getLogger("constitution-manager")

class ConstitutionManager:
    """
    Sovereign Constitution Manager.
    Allows real-time tuning of Soter risk thresholds and a-priori rules
    without requiring a server restart.
    """
    def __init__(self):
        # Default thresholds from config
        self.thresholds = {
            "SOTER-001": config.SOTER_SENSITIVITY,
            "SOTER-002": config.SOTER_SENSITIVITY,
            "SOTER-003": config.SOTER_SENSITIVITY,
        }

    def update_threshold(self, rule_id: str, new_value: float):
        """
        Update a specific threshold.
        """
        if rule_id not in self.thresholds:
            logger.warning(f"Rule {rule_id} not found in current constitution. Adding as new.")
        
        self.thresholds[rule_id] = new_value
        logger.info(f"Constitution Updated: {rule_id} set to {new_value}")

    def get_threshold(self, rule_id: str) -> float:
        """Retrieve the current enforcement limit."""
        return self.thresholds.get(rule_id, config.SOTER_SENSITIVITY)

# Singleton instance for global access
manager = ConstitutionManager()
