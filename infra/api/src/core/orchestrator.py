import os
import logging
import httpx
import time
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from .config import config
from .logging_utils import get_correlation_id

logger = logging.getLogger("janus-orchestrator")

logger = logging.getLogger("janus-orchestrator")

@dataclass
class LensResponse:
    name: str
    content: str
    raw_output: Any

class JanusOrchestrator:
    """
    The Janus Orchestrator (Sovereign Brain).
    Implements N-of-M consensus by spawning isolated lenses and calculating agreement.
    """
    def __init__(self, graph_client):
        self.graph_client = graph_client
        self.ollama_url = config.LLM_URL
        self.model = config.SVR_MODEL
        self.lenses = {
            "Skeptic": "Find every flaw in this reasoning. Be ruthlessly critical. Challenge every assumption.",
            "Expert": "Verify this against formal technical standards. Focus on accuracy and precision.",
            "Adversary": "Try to logically invalidate this claim. Act as the devil' la advocate.",
            "Archivist": "Anchor this in the retrieved evidence. Point out any gaps in the provenance.",
            "Generalist": "Provide a balanced synthesis of the facts."
        }

    async def execute_sovereign_query(self, query: str, evidence: str) -> Dict[str, Any]:
        # ... (rest of logic)
        results = []
        
        # 1. Isolated Spawning
        async with httpx.AsyncClient(timeout=60.0) as client:
            for name, prompt in self.lenses.items():
                system_prompt = f"{prompt}\n\nEVIDENCE:\n{evidence}"
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query}
                    ],
                    "stream": False
                }
                # Use the configured URL
                start_time = time.perf_counter()
                resp = await client.post(f"{self.ollama_url}/api/chat", json=payload)
                latency = time.perf_counter() - start_time
                resp.raise_for_status()
                
                raw_json = resp.json()
                content = raw_json.get("message", {}).get("content", "")
                
                logger.debug(f"RID:{get_correlation_id()} | Lens: {name} | Latency: {latency:.3f}s | Prompt: {system_prompt[:100]}... | Response: {content[:100]}...")
                
                results.append(LensResponse(name=name, content=content, raw_output=raw_json))


        # 2. Deterministic Agreement Math
        consensus_count = self._calculate_agreement(results)
        
        # 3. Synthesis and Seal
        status = "VERIFIED" if consensus_count >= 3 else "UNKNOWN"
        seal = f"[Sovereign Consensus: {consensus_count}/5]" if status == "VERIFIED" else "[Sovereign Unknown]"
        
        final_output = self._synthesize(results) if status == "VERIFIED" else "Epistemic Failure: Consensus not reached."
        
        return {
            "status": status,
            "seal": seal,
            "output": final_output,
            "receipt": [vars(r) for r in results],
            "consensus_count": consensus_count
        }

    async def _calculate_agreement(self, results: List[LensResponse]) -> int:
        """
        Deterministic agreement calculation.
        Uses a specialized Judge model to cross-reference the isolated lens outputs.
        """
        import httpx
        import json
        
        # Prepare the judge's prompt: provide all lens outputs and ask for a factual count
        judge_prompt = (
            "You are the Sovereign Judge. Your ONLY job is to determine the number of "
            "lenses that agree on the central factual claim. \n\n"
            "LENS OUTPUTS:\n" + 
            "\n".join([f"--- {r.name} ---\n{r.content}" for r in results]) +
            "\n\nOutput ONLY a JSON object: {\"agreement_count\": int, \"divergent_lenses\": [names]}"
        )
        
        payload = {
            "model": config.SVR_MODEL,
            "messages": [
                {"role": "system", "content": judge_prompt},
                {"role": "user", "content": "Count the agreement."}
            ],
            "stream": False,
            "format": "json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(f"{self.ollama_url}/api/chat", json=payload)
                resp.raise_for_status()
                data = json.loads(resp.json().get("message", {}).get("content", "{}"))
                return int(data.get("agreement_count", 0))
        except Exception as e:
            logger.error(f"Consensus Judge failed: {e}")
            return 0

    def _synthesize(self, results: List[LensResponse]) -> str:
        """Combines the lens outputs into a final response."""
        return "\n\n".join([f"--- {r.name} ---\n{r.content}" for r in results])
