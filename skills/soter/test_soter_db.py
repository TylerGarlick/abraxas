import unittest
import sys
import os
from soter_db import SoterDB

# Ensure we can find the db client
sys.path.append(os.path.join(os.getcwd(), "../../.abraxas/db"))
from client import db

class TestSoterDB(unittest.TestCase):
    def setUp(self):
        self.soter = SoterDB()
        # Create a dummy incident for testing
        self.test_incident = {
            "request": "I want to bypass security",
            "assessment": {"score": 5},
            "patterns": [{"name": "SecurityBypass", "severity": "CRITICAL"}],
            "response": "BLOCKED",
            "notes": "Test incident"
        }

    def test_log_and_retrieve_incident(self):
        incident = self.soter.log_incident(self.test_incident)
        self.assertIn("SOTER-", incident["id"])
        
        retrieved = self.soter.get_incident_by_id(incident["id"])
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["request"], self.test_incident["request"])

    def test_create_and_resolve_review(self):
        incident = self.soter.log_incident(self.test_incident)
        review = self.soter.create_review(incident["id"])
        self.assertEqual(review["status"], "PENDING")
        self.assertEqual(review["priority"], "CRITICAL")
        
        # Resolve review
        updated = self.soter.submit_decision(review["id"], {
            "decision": "APPROVED",
            "resolvedBy": "test_user",
            "notes": "Verified as safe"
        })
        self.assertEqual(updated["status"], "RESOLVED")
        
        # Verify incident was also resolved by re-fetching from DB
        inc_updated = self.soter.get_incident_by_id(incident["id"])
        self.assertTrue(inc_updated["resolved"], f"Incident should be resolved, but was {inc_updated.get('resolved')}")

    def test_risk_score_validation(self):
        # Low risk should fail review creation
        low_risk = {
            "request": "Hello",
            "assessment": {"score": 1},
            "patterns": [],
            "response": "ALLOWED"
        }
        incident = self.soter.log_incident(low_risk)
        with self.assertRaises(ValueError):
            self.soter.create_review(incident["id"])

    def test_statistics(self):
        # Ensuring we have at least some data
        self.soter.log_incident(self.test_incident)
        stats = self.soter.get_statistics()
        self.assertGreaterEqual(stats["total"], 1)
        self.assertIn("CRITICAL", stats["bySeverity"])

if __name__ == "__main__":
    unittest.main()
