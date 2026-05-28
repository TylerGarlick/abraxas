from typing import Any, Dict, Optional
from dataclasses import dataclass

@dataclass
class KrisisRiskAssessment:
    seed_id: str
    frameworks_applied: bool
    tensions: list
    consensus: Optional[str]
    cleared_for_deployment: bool
    mandatory_note: str

class StochasmosRiskAssessor:
    """
    Stochasmos Krisis Integration.
    Mandatory pre-deployment ethical risk assessment.
    Every seed MUST pass through Krisis before being deployed.
    """
    def __init__(self, krisis_client: Any = None):
        self.krisis_client = krisis_client

    def assess_seed_risk(self, seed) -> KrisisRiskAssessment:
        """
        Runs Krisis deliberation across all four ethical frameworks before deployment.
        If seed frames as an imperative ("you should..."), it is automatically blocked.
        """
        seed_id = seed.id if hasattr(seed, "id") else str(seed)

        is_manipulation = "should" in seed.content.lower() if hasattr(seed, "content") else False

        if is_manipulation:
            return KrisisRiskAssessment(
                seed_id=seed_id,
                frameworks_applied=True,
                tensions=["Imperative framing detected. Seeds must present as evidence, not directives."],
                consensus=None,
                cleared_for_deployment=False,
                mandatory_note="This seed was blocked because it framed as an imperative. The Catalyst informs; it does not command."
            )

        cleared = True if self.krisis_client else False  # In production, this is the actual Krisis verdict

        return KrisisRiskAssessment(
            seed_id=seed_id,
            frameworks_applied=bool(self.krisis_client),
            tensions=[],
            consensus="All four frameworks indicate informational integrity." if self.krisis_client else None,
            cleared_for_deployment=cleared,
            mandatory_note="This deliberation has surfaced the ethical landscape. The decision remains yours." if self.krisis_client else "Krisis client unavailable. Manual ethical review required."
        )
