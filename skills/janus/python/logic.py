import logging
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("JanusLogic")

@dataclass
class ReasoningPath:
    id: int
    lens: str
    query: str
    result: Optional[str] = None

class JanusLogic:
    def __init__(self):
        self.cognitive_modes = {
            "NOX": "Intuitive (Probabilistic)",
            "SOL": "Analytical (Deterministic)",
        }
        self.lenses = {
            "SKEPTIC": "The Skeptic - Searching for flaws and contradictions.",
            "EXPERT": "The Expert - Focusing on technical accuracy.",
            "ADVERSARY": "The Adversary - Attempting to break the logic.",
            "ARCHIVIST": "The Archivist - Grounding claims in the Sovereign Vault.",
            "GENERALIST": "The Generalist - Synthesizing a balanced view.",
        }
        self.current_mode = "NOX"

    def switch_mode(self, mode: str, reason: str = "Soter Trigger") -> str:
        if mode not in self.cognitive_modes:
            raise ValueError(f"Invalid mode. Must be one of {list(self.cognitive_modes.keys())}")
        
        self.current_mode = mode
        return f"Janus Mode Switch:\n- New Mode: {self.cognitive_modes[mode]}\n- Reason: {reason}\n- Action: Cognitive state transitioned."

    def spawn_paths(self, query: str, m_paths: int = 5) -> List[ReasoningPath]:
        # In a real implementation, this would likely trigger LLM calls.
        # Here we implement the logic of path and lens assignment.
        available_lenses = list(self.lenses.values())
        paths = []
        for i in range(m_paths):
            lens = available_lenses[i % len(available_lenses)]
            paths.append(ReasoningPath(id=i+1, lens=lens, query=query))
        
        return paths

    def resolve_consensus(self, path_results: List[str]) -> Dict[str, Any]:
        if not path_results:
            return {"error": "No path results provided"}

        consensus_map = {}
        for res in path_results:
            clean_res = res.strip().lower()
            consensus_map[clean_res] = consensus_map.get(clean_res, 0) + 1

        best_claim = max(consensus_map, key=consensus_map.get)
        max_votes = consensus_map[best_claim]
        total = len(path_results)
        
        is_sovereign = max_votes >= 3  # Standard N=3 rule
        seal = f"[Sovereign Consensus: {max_votes}/{total}]" if is_sovereign else "[Sovereign Unknown]"
        
        return {
            "bestClaim": best_claim,
            "votes": f"{max_votes}/{total}",
            "seal": seal,
            "result": "EMITTED" if is_sovereign else "BLOCKED"
        }

# Singleton instance
janus_logic = JanusLogic()
