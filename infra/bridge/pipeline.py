import logging
import asyncio
from typing import List, Dict, Any, Optional
from infra.bridge.sieve import SovereignSieve, Signal
import logging
import asyncio
from typing import List, Dict, Any, Optional
from infra.bridge.sieve import SovereignSieve, Signal
# Removed conflicting import to allow logic tests to run without MCP env
from infra.bridge.gauntlet import GauntletRunner, IngestionFragment


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sovereign-bridge")

class SovereignBridge:
    """
    The Sovereign Bridge: Signal Pipeline.
    Connects external high-signal sources (Moltbook, Discord) to the Sieve.
    """
    def __init__(self, mcp_client: Any = None):
        self.sieve = SovereignSieve()
        self.gauntlet = GauntletRunner(mcp_client) if mcp_client else None
        self.sources = {
            "moltbook": self._poll_moltbook,
            "discord": self._poll_discord
        }
        self.ingested_count = 0

    async def _poll_moltbook(self) -> List[Signal]:
        """Simulation of Moltbook API polling."""
        logger.info("Polling Moltbook for signals...")
        # Simulated signal: A discovery about AI scaling
        return [
            Signal(
                source="moltbook", 
                content="BREAKING: New data indicates scaling laws are plateauing in reasoning tasks. Unexpectedly high variance in Llama-4 results.", 
                timestamp="2026-05-12T10:00:00Z", 
                metadata={"priority": "high", "type": "observation"}
            )
        ]

    async def _poll_discord(self) -> List[Signal]:
        """Simulation of Discord API polling."""
        logger.info("Polling Discord for signals...")
        return [
            Signal(
                source="discord", 
                content="Just read a paper on BaseCal. It's just a basic regression. Not very novel.", 
                timestamp="2026-05-12T10:05:00Z", 
                metadata={"priority": "low", "type": "comment"}
            )
        ]

    async def run_discovery_cycle(self):
        """
        Orchestrates one full discovery cycle:
        Poll Sources -> Sieve -> Sovereign Scribe.
        """
        logger.info("Starting Sovereign Discovery Cycle...")
        all_signals = []
        
        for source, poll_func in self.sources.items():
            signals = await poll_func()
            all_signals.extend(signals)

        for signal in all_signals:
            if self.sieve.is_high_valence(signal):
                logger.info(f"High-valence signal detected from {signal.source}. Passing to Scribe.")
                cleaned_content = self.sieve.strip_noise(signal.content)
                await self._dispatch_to_scribe(cleaned_content, signal)
            else:
                logger.info(f"Signal from {signal.source} discarded by Sieve. Low valence.")

    async def _dispatch_to_scribe(self, content: str, signal: Signal):
        """
        Dispatches captured signal to the Sovereign Gauntlet.
        """
        if not self.gauntlet:
            logger.warning("Gauntlet not initialized. Scribe dispatch simulated.")
            return

        fragment = IngestionFragment(
            content=content,
            source=signal.source
        )
        
        promoted = await self.gauntlet.process_fragment(fragment)
        if promoted:
            self.ingested_count += 1
            logger.info(f"Autonomous Discovery committed to Reservoir from {signal.source}")
