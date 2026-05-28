import unittest
import sys
import os
from ethos_score import score_source, get_tier_info, get_source_info, calculate_weighted_confidence

# Ensure we can find the db client
sys.path.append(os.path.join(os.getcwd(), "../../.abraxas/db"))
from client import db

class TestEthosScore(unittest.TestCase):
    def test_tier_1_source(self):
        # Nature is Tier 1
        self.assertEqual(score_source("Nature"), 1)

    def test_tier_2_source(self):
        # Reuters is Tier 2
        self.assertEqual(score_source("Reuters"), 2)

    def test_unknown_source(self):
        # Random string should be Tier 5
        self.assertEqual(score_source("SomeFakeSource123"), 5)

    def test_tier_info(self):
        info = get_tier_info(1)
        self.assertEqual(info['name'], "Peer-Reviewed")
        self.assertEqual(info['weight'], 1.0)

    def test_source_info(self):
        info = get_source_info("Nature")
        self.assertIsNotNone(info)
        self.assertEqual(info['tier'], 1)
        self.assertEqual(info['domain'], "nature.com")

    def test_weighted_confidence_high(self):
        sources = [{"source": "Nature"}, {"source": "Science"}]
        res = calculate_weighted_confidence(sources)
        self.assertEqual(res['confidence'], "VERY HIGH")
        self.assertEqual(res['weightedScore'], 1.0)

    def test_weighted_confidence_low(self):
        sources = [{"source": "Twitter"}, {"source": "Reddit"}]
        res = calculate_weighted_confidence(sources)
        self.assertEqual(res['confidence'], "VERY LOW")
        self.assertEqual(res['weightedScore'], 0.2)

if __name__ == "__main__":
    unittest.main()
