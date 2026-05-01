import json
import os
from typing import Dict, Any, Optional

# Deterministic path for the Ethos Registry
REGISTRY_PATH = os.environ.get(
    "EthosRegistryPath", os.path.join(os.getcwd(), "references", "ethos-registry.json")
)


class EthosLogic:
    def _get_registry(self) -> Dict[str, Any]:
        try:
            if os.path.exists(REGISTRY_PATH):
                with open(REGISTRY_PATH, "r") as f:
                    return json.load(f)
        except Exception as e:
            print(f"[Ethos] Error reading registry: {e}")
        return {}

    def get_score(self, source: str) -> str:
        """
        Determine the credibility tier of a specific information source.
        """
        registry = self._get_registry()
        tier = "T5"
        weight = 0.2

        for t, data in registry.items():
            if any(s in source for s in data.get("sources", [])):
                tier = t
                weight = data.get("weight", 0.2)
                break

        desc = registry.get(tier, {}).get("description", "Unknown tier")
        return f"Source: {source}\nTier: {tier}\nWeight: {weight}\nStatus: {desc}"

    def resolve_conflict(self, source_a: str, source_b: str) -> str:
        """
        Resolve a conflict between two sources based on their credibility weights.
        """
        registry = self._get_registry()

        def get_weight(src: str) -> float:
            for t, data in registry.items():
                if any(s in src for s in data.get("sources", [])):
                    return float(data.get("weight", 0.2))
            return 0.2

        weight_a = get_weight(source_a)
        weight_b = get_weight(source_b)
        winner = source_a if weight_a > weight_b else source_b
        delta = abs(weight_a - weight_b)

        return (
            f"Conflict Resolution:\n"
            f"Source A: {weight_a}\n"
            f"Source B: {weight_b}\n"
            f"Winner: {winner}\n"
            f"Weight Delta: {delta:.2f}"
        )


# Singleton instance
logic = EthosLogic()
