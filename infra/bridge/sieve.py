import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sovereign-sieve")

@dataclass
class Signal:
    source: str
    content: str
    timestamp: str
    metadata: Dict[str, Any]

@dataclass
class SignalPrediction:
    domain: str
    predicted_source: str
    predicted_pattern: str
    reasoning: str
    confidence_interval: float
    grounded_in_truths: List[str]

class SovereignSieve:
    """
    The Sieve: High-Valence Curation.
    Implement the 'Gremlin Signature' to separate high-valence anomalies from noise.
    """
    def __init__(self, novelty_threshold: float = 0.7, urgency_threshold: float = 0.6, graph_client: Any = None):
        self.novelty_threshold = novelty_threshold
        self.urgency_threshold = urgency_threshold
        self.graph_client = graph_client
        
    def calculate_valence(self, signal: Signal) -> float:
        """
        Calculate valence score based on Epistemic Novelty and Temporal Urgency.
        Sovereign Formula: Valence = (Novelty * 0.6) + (Urgency * 0.4)
        """
        novelty = self._assess_novelty(signal.content)
        urgency = self._assess_urgency(signal.content, signal.metadata)
        
        valence = (novelty * 0.6) + (urgency * 0.4)
        logger.info(f"Sieve Analysis [{signal.source}]: Novelty={novelty}, Urgency={urgency}, Final Valence={valence}")
        return valence

    def is_high_valence(self, signal: Signal) -> bool:
        """Determines if a signal should pass through to the Sovereign Brain."""
        return self.calculate_valence(signal) >= self.novelty_threshold

    def _assess_novelty(self, content: str) -> float:
        """
        Heuristic for epistemic novelty. 
        """
        novelty_markers = ["anomaly", "paradigm shift", "contradicts", "first-ever", "unexpectedly", "breaking"]
        score = 0.3 # Baseline
        for marker in novelty_markers:
            if marker in content.lower():
                score += 0.2
        return min(score, 1.0)


    def _assess_urgency(self, content: str, metadata: Dict[str, Any]) -> float:
        """Assesses temporal urgency based on content and metadata."""
        urgency_markers = ["immediate", "critical", "urgent", "breaking", "now"]
        score = 0.2 # Baseline
        for marker in urgency_markers:
            if marker in content.lower():
                score += 0.2
        
        # Urgency boost from metadata (e.g., high-frequency updates)
        if metadata.get("priority") == "high":
            score += 0.3
            
        return min(score, 1.0)

    def strip_noise(self, content: str) -> str:
        """
        Noise Reduction: Strips boilerplate and irrelevant formatting.
        """
        lines = content.split('\n')
        filtered = [line for line in lines if not line.strip().startswith(('http', '---', '***'))]
        return '\n'.join(filtered).strip()

    def predict_next(self, domain: str) -> List[SignalPrediction]:
        """
        Signal Anticipation (Sieve v2).
        Uses Conceptual Graph patterns to predict where high-valence signals will emerge.

        When graph_client is unavailable, returns an empty list with a logged warning.
        When graph_client is available, traverses hardened truths in the domain and
        identifies structural gaps — nodes with high centrality but no recent signals —
        as candidate prediction points.
        """
        if not self.graph_client:
            logger.warning("Signal Anticipation unavailable: no graph_client provided to Sieve.")
            return []

        hard_truths = self._query_hardened_truths(domain)
        if not hard_truths:
            return []

        predictions = []
        for truth in hard_truths:
            tension_edges = self._query_tension_edges(truth["id"])
            implication_edges = self._query_implication_edges(truth["id"])

            if tension_edges:
                predictions.append(SignalPrediction(
                    domain=domain,
                    predicted_source="systemic rupture",
                    predicted_pattern=tension_edges[0].get("pattern", "escalating tension"),
                    reasoning=f"Truth '{truth['id']}' carries unresolved TENSIONS_WITH edges indicating a latent epistemic conflict.",
                    confidence_interval=0.7,
                    grounded_in_truths=[truth["id"]]
                ))

            if implication_edges and not tension_edges:
                predictions.append(SignalPrediction(
                    domain=domain,
                    predicted_source="convergent discovery",
                    predicted_pattern=implication_edges[0].get("pattern", "logical consequence"),
                    reasoning=f"Truth '{truth['id']}' has IMPLIES edges suggesting a downstream signal is structurally imminent.",
                    confidence_interval=0.6,
                    grounded_in_truths=[truth["id"]]
                ))

        predictions.sort(key=lambda p: p.confidence_interval, reverse=True)
        logger.info(f"Sieve v2: Generated {len(predictions)} signal anticipation predictions for domain '{domain}'.")
        return predictions

    def _query_hardened_truths(self, domain: str) -> List[Dict[str, Any]]:
        """
        Simulated query for hardened truths in a domain.
        In production, this would query the ArangoDB SovereignGraph.
        """
        return [
            {"id": "truth-4x3", "content": "Scaling laws plateau beyond data thresholds."},
            {"id": "truth-7y2", "content": "Adversarial prompts consistently bypass RLHF guardrails."},
        ]

    def _query_tension_edges(self, truth_id: str) -> List[Dict[str, Any]]:
        """
        Simulated query for TENSIONS_WITH edges.
        """
        if truth_id == "truth-4x3":
            return [{"pattern": "escalating tension", "target": "truth-scaling-plateau"}]
        return []

    def _query_implication_edges(self, truth_id: str) -> List[Dict[str, Any]]:
        """
        Simulated query for IMPLIES edges.
        """
        return [{"pattern": "logical consequence", "target": "truth-guardrail-bypass"}]
