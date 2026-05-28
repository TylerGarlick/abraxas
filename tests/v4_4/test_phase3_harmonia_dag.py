import asyncio
import unittest
from unittest.mock import AsyncMock
from skills.harmonia.python.orchestrator import HarmoniaOrchestrator

class TestHarmoniaDAGOptimization(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.mcp = AsyncMock()
        self.orchestrator = HarmoniaOrchestrator(self.mcp)

    async def test_harmonia_dag_audit(self):
        self.orchestrator.compose("test-chain", ["synesis_map", "prognosis_forecast", "metanoia_agon_audit", "synesis_map"])
        audit = self.orchestrator.audit_dag("test-chain")
        self.assertIn("efficiency_score", audit)
        self.assertLess(audit["efficiency_score"], 1.0)
        self.assertGreaterEqual(len(audit["redundancy"]), 1)

    async def test_harmonia_dag_audit_simple(self):
        self.orchestrator.compose("clean-chain", ["synesis_map", "prognosis_forecast"])
        audit = self.orchestrator.audit_dag("clean-chain")
        self.assertEqual(audit["efficiency_score"], 1.0)
        self.assertEqual(len(audit["bottlenecks"]), 0)

    async def test_harmonia_dag_audit_deep_chain(self):
        self.orchestrator.compose("deep-chain", ["a", "b", "c", "d", "e"])
        audit = self.orchestrator.audit_dag("deep-chain")
        self.assertGreaterEqual(len(audit["bottlenecks"]), 1)

    async def test_harmonia_dag_refinement(self):
        self.orchestrator.compose("optimize-me", ["synesis_map", "synesis_map", "prognosis_forecast", "a", "b", "c", "d"])
        refinement = self.orchestrator.propose_refinement("optimize-me")
        self.assertGreater(refinement["efficiency_delta"], 0.0)
        self.assertGreaterEqual(len(refinement["proposals"]), 1)

    async def test_harmonia_dag_refinement_noop(self):
        self.orchestrator.compose("perfect", ["a", "b"])
        refinement = self.orchestrator.propose_refinement("perfect")
        self.assertEqual(refinement["status"], "NO_CHANGE")

if __name__ == "__main__":
    unittest.main()
