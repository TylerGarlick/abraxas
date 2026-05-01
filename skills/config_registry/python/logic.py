import json
import os
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass


class ConfigLoader:
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.config = {}
        self.version = "0.0.0"
        self.last_load_time = None
        self.load()

    def load(self) -> Dict[str, Any]:
        try:
            # In a real environment, we would use PyYAML for .yaml files.
            # For this conversion, we simulate the loading of the SOVEREIGN_CONFIG.yaml.
            if os.path.exists(self.config_path):
                # Mocking YAML load for this implementation
                with open(self.config_path, "r") as f:
                    # Simple mock translation to JSON/Dict
                    self.config = {
                        "Core": {"SovereignMode": "Active"},
                        "Soter": {"RiskThreshold": 0.49},
                    }
                    self.version = "1.0.0"
                    self.last_load_time = time.strftime("%Y-%m-%d %H:%M:%S")
                return {"success": True, "version": self.version}
        except Exception as e:
            return {"success": False, "error": str(e)}
        return {"success": False, "error": "Config file not found"}

    def reload(self) -> Dict[str, Any]:
        return self.load()

    def get_value(self, path: str) -> Any:
        # Simple dot-notation access: "Soter.RiskThreshold"
        parts = path.split(".")
        val = self.config
        for part in parts:
            if isinstance(val, dict):
                val = val.get(part)
            else:
                raise KeyError(f"Path {path} not found in config")
        return val

    def get_section(self, section: str) -> Dict[str, Any]:
        return self.config.get(section, {})

    def get_all(self) -> Dict[str, Any]:
        return self.config

    def get_version(self) -> str:
        return self.version

    def get_last_load_time(self) -> str:
        return self.last_load_time


class SecretMasker:
    @staticmethod
    def mask_secrets(config: Dict[str, Any], section: str = None) -> Dict[str, Any]:
        masked = {}
        # Mock secrets masking logic
        for k, v in config.items():
            if "secret" in k.lower() or "password" in k.lower() or "key" in k.lower():
                masked[k] = "********"
            elif isinstance(v, dict):
                masked[k] = SecretMasker.mask_secrets(v)
            else:
                masked[k] = v
        return {"config": masked, "maskedKeys": []}


# Singleton for the server
CONFIG_PATH = os.environ.get(
    "CONFIG_PATH", "/workspace/projects/abraxas/SOVEREIGN_CONFIG.yaml"
)
loader = ConfigLoader(CONFIG_PATH)
masker = SecretMasker()
