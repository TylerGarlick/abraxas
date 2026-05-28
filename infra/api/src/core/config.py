import os
import logging
from typing import Any

logger = logging.getLogger("sovereign-config")

class SovereignConfig:
    """
    Deterministic Configuration Manager for Abraxas v4.1.
    Ensures that all model endpoints and IDs are environmentally driven.
    """
    def __init__(self):
        # Model Endpoints
        self.LLM_URL = os.getenv("ABRAXAS_LLM_URL", "http://localhost:11434")
        self.SVR_MODEL = os.getenv("ABRAXAS_SVR_MODEL", "gpt-oss:120b-cloud")
        self.SOTER_MODEL = os.getenv("ABRAXAS_SOTER_MODEL", "gpt-oss:120b-cloud")
        
        # Risk Thresholds (SOTER-001)
        try:
            self.SOTER_SENSITIVITY = float(os.getenv("ABRAXAS_SOTER_SENSITIVITY", "5.0"))
        except ValueError:
            logger.error("Invalid SOTER_SENSITIVITY value. Defaulting to 5.0")
            self.SOTER_SENSITIVITY = 5.0

    def validate_connectivity(self) -> bool:
        """
        Basic health check for the LLM endpoint.
        """
        import httpx
        try:
            # Ollama typically has a /api/tags or /tags endpoint for health checks
            # We try a generic request to see if the server is alive.
            with httpx.Client() as client:
                resp = client.get(f"{self.LLM_URL}/api/tags", timeout=2.0)
                return resp.status_code == 200
        except Exception as e:
            logger.error(f"LLM endpoint connectivity check failed: {e}")
            return False

# Singleton instance for the application
config = SovereignConfig()
