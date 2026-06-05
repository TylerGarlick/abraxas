import unittest
from skills.common.graphql_client import gql_client
from skills.sovereign_scribe.python.logic import SovereignScribeLogic
from skills.oneironautics.python.logic import OneironauticsLogic
from skills.ledger.python.logic import LedgerLogic

class TestAbraxasGraphQLIntegration(unittest.TestCase):
    def test_sovereign_scribe_gauntlet(self):
        """Verify that Sovereign Scribe persists incidents and marks via GraphQL."""
        scribe = SovereignScribeLogic()
        fragment = "The Sovereign Brain requires zero-trust verification."
        source = "Internal Codex"
        
        print("\nTesting Sovereign Scribe Gauntlet...")
        result = scribe.run_gauntlet(fragment, source)
        
        self.assertEqual(result["status"], "PROMOTED")
        self.assertIn("result", result)
        print(f"Scribe Result: {result}")

    def test_oneironautics_dream_cycle(self):
        """Verify dream logging starts a cycle in GraphQL."""
        oneiro = OneironauticsLogic()
        dream = "I saw a golden eye opening in a void of obsidian."
        tags = ["symbolic", "awakening"]
        
        print("\nTesting Oneironautics Dream Logging...")
        result = oneiro.log_dream(dream, tags)
        
        self.assertTrue(result["success"])
        self.assertIn("graphql_response", result)
        print(f"Oneiro Result: {result}")

    def test_ledger_task_flow(self):
        """Verify task creation and status updates via GraphQL."""
        ledger = LedgerLogic()
        
        print("\nTesting Ledger Task Flow...")
        # 1. Create Task
        create_res = ledger.create_task("Verify GraphQL Parity", project="SovereignBrain")
        self.assertNotIn("error", create_res)
        task_id = create_res.get("id")
        print(f"Created Task ID: {task_id}")
        
        # 2. Update Status
        update_res = ledger.update_task_status(task_id, "ready")
        self.assertNotIn("error", update_res)
        # The server returns the Enum as uppercase 'READY'
        self.assertEqual(update_res.get("status"), "READY")
        print(f"Updated Status to: {update_res.get('status')}")

if __name__ == "__main__":
    unittest.main()
