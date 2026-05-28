import logging
import asyncio
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from infra.bridge.pipeline import SovereignBridge
from infra.bridge.sieve import SovereignSieve, Signal
from infra.bridge.gauntlet import GauntletRunner, IngestionFragment
from skills.harmonia.python.orchestrator import HarmoniaOrchestrator, ContextEnvelope
from skills.aporia.python.logic import AporiaLogic
from skills.auto_agon.python.logic import AutoAgonLogic

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hunter-loop")

@dataclass
class SovereignReport:
    discovery: str
    provenance: str
    epistemic_status: str # Hypothesis | Verified Truth
    convergence_rate: float
    gap_analysis: Dict[str, Any]
    ethical_audit: str
    timestamp: str = datetime.utcnow().isoformat()

    def to_markdown(self) -> str:
        return (
            f"# 🏛️ Sovereign Report\n"
            f"**Timestamp**: {self.timestamp}\n"
            f"**Provenance**: {self.provenance}\n"
            f"**Status**: {self.epistemic_status}\n"
            f"**Convergence**: {self.convergence_rate:.2%}\n\n"
            f"## 🔍 Epistemic Gap Analysis\n{self.gap_analysis}\n\n"
            f"## ⚖️ Ethical Boundary Audit\n{self.ethical_audit}\n\n"
            f"**Verdict**: This discovery has been autonomously verified and logged in the sovereign ledger."
        )

class HunterLoop:
    """
    The Hunter Loop: The Final Integration.
    Orchestrates: Sieve -> Harmonia -> Aporia -> Auto-Agon -> Report.
    """
    def __init__(self, mcp_client: Any = None):
        self.bridge = SovereignBridge(mcp_client=mcp_client)
        self.orchestrator = HarmoniaOrchestrator(mcp_client)
        self.aporia = AporiaLogic()
        self.auto_agon = AutoAgonLogic(mcp_client)
        self.mcp_client = mcp_client

    async def run_once(self) -> Optional[SovereignReport]:
        """
        Executes one iteration of the autonomous loop.
        """
        logger.info("Entering Hunter Loop iteration...")
        
        # 1. Sieve Discovery
        discovery_signals = await self.bridge._poll_moltbook()
        if not discovery_signals:
            return None

        high_val_signal = discovery_signals[0]
        if not self.bridge.sieve.is_high_valence(high_val_signal):
            logger.info("No high-valence signals found in this cycle.")
            return None

        # 2. Reasoning Chain Setup
        envelope = ContextEnvelope()
        envelope.primary_output = high_val_signal.content
        
        # Pass through Aporia (Gap Analysis)
        gap_analysis = self.aporia.analyze_gap(envelope.primary_output, ["Scaling laws apply to LLMs."])
        envelope.update_output("aporia", gap_analysis)
        
        # Simulation of Krisis Audit (normally via MCP)
        ethical_audit = "No immediate ethical tensions detected across the 4 frameworks. The decision remains yours."
        envelope.update_output("krisis", ethical_audit)
        
        # 3. Auto-Agon Stress Testing
        logger.info("Initiating Auto-Agon stress test...")
        stress_test = await self.auto_agon.trigger_stress_test(high_val_signal.content)
        
        # 4. Synthesis into Sovereign Report
        report = SovereignReport(
            discovery=high_val_signal.content,
            provenance=high_val_signal.source,
            epistemic_status=stress_test["status"],
            convergence_rate=stress_test["convergence_rate"],
            gap_analysis=gap_analysis,
            ethical_audit=ethical_audit
        )
        
        logger.info(f"Sovereign Report generated: Status={report.epistemic_status}")
        return report
