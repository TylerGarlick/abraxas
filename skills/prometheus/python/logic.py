from typing import Dict, Any, Optional
import datetime

class PrometheusLogic:
    def __init__(self):
        self.profile = {"preferences": {}, "signals": []}

    def get_profile(self, user_id: str) -> Dict[str, Any]:
        """Retrieves the current user preference profile."""
        return {
            "success": True,
            "user_id": user_id,
            "profile": self.profile
        }

    def set_preference(self, key: str, value: Any, weight: float = 1.0) -> Dict[str, Any]:
        """Sets a specific user preference with a weight."""
        self.profile["preferences"][key] = {"value": value, "weight": weight}
        return {
            "success": True,
            "action": "set_preference",
            "key": key,
            "value": value
        }

    def record_signal(self, signal_type: str, payload: Any) -> Dict[str, Any]:
        """Records an implicit or explicit signal for profile evolution."""
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.profile["signals"].append({"timestamp": now, "type": signal_type, "payload": payload})
        return {
            "success": True,
            "action": "record_signal",
            "signal_type": signal_type
        }
