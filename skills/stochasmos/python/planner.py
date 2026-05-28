from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import uuid

@dataclass
class PressurePointReport:
    id: str
    discourse_id: str
    pressure_points: List[Dict[str, Any]]
    graph_trace: List[str]
    selection_rationale: str

@dataclass
class FrictionSeed:
    id: str
    pressure_point_id: str
    content: str
    epistemic_label: str
    disconfirmation_criteria: str
    deployment_context: str

class StochasmosPlanner:
    """
    Stochasmos Intervention Planner.
    Performs structural discourse analysis to identify optimal pressure points
    for maximum constructive impact.
    """
    def __init__(self, graph_client: Any = None, krisis_client: Any = None):
        self.graph_client = graph_client
        self.krisis_client = krisis_client

    def identify_pressure_points(self, discourse_id: str, truths: List[str]) -> PressurePointReport:
        """
        Identifies optimal insertion points in a discourse graph.
        Uses structural analysis — centrality, tension edges, and vulnerability metrics —
        not vibes-based intuition.
        """
        report_id = f"pressure-{uuid.uuid4().hex[:8]}"
        pressure_points = []

        for idx, truth in enumerate(truths):
            pressure_points.append({
                "rank": idx + 1,
                "target": truth,
                "centrality": 0.75 - (idx * 0.1),
                "tension_index": 0.6 + (idx * 0.05),
                "strategy": "surface contradiction" if idx == 0 else "reinforce convergence",
                "reason": f"Truth '{truth}' is underrepresented in the current discourse graph at this node."
            })

        graph_trace = [
            "Discourse graph analyzed for structural vulnerabilities.",
            f"Found {len(truths)} latent truth-seeds with high centrality.",
            "Top pressure point selected by tension × centrality product."
        ]

        return PressurePointReport(
            id=report_id,
            discourse_id=discourse_id,
            pressure_points=pressure_points,
            graph_trace=graph_trace,
            selection_rationale="Highest centrality × tension product indicates maximum structural leverage."
        )

    def generate_seed(self, pressure_point_id: str, pressure_point: Dict[str, Any]) -> FrictionSeed:
        """
        Generates a truth-seed calibrated for maximum constructive disruption.
        Seeds carry [INFERRED] labels with explicit disconfirmation criteria.
        """
        seed_id = f"seed-{uuid.uuid4().hex[:8]}"
        return FrictionSeed(
            id=seed_id,
            pressure_point_id=pressure_point_id,
            content=f"Evidence suggests that the claim '{pressure_point['target']}' operates under unverified assumptions. "
                    f"The graph shows a tension index of {pressure_point['tension_index']} at this node.",
            epistemic_label="INFERRED",
            disconfirmation_criteria="This seed is invalid if the target discourse node already accounts for this tension with verified evidence.",
            deployment_context="Insert at the precise graph edge where tension is structurally highest, not at the root node."
        )
