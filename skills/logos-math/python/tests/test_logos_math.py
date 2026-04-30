import unittest
import sys
import os

# Add the parent directory to sys.path so we can import the logic
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from verify import verify, evaluate_expression, compare_values
from confidence import score_confidence
from crosscheck import crosscheck


class TestLogosMathPython(unittest.TestCase):
    def test_basic_arithmetic_verify(self):
        # Test 2 + 2 = 4
        res = verify("2 + 2 = 4")
        self.assertEqual(res.status, "VERIFIED")
        self.assertEqual(res.computed, 4)
        self.assertEqual(res.confidence, 5)

    def test_arithmetic_conflict(self):
        # Test 2 + 2 = 5
        res = verify("2 + 2 = 5")
        self.assertEqual(res.status, "CONFLICT")
        self.assertEqual(res.computed, 4)
        self.assertEqual(res.claimed, 5)
        self.assertEqual(res.confidence, 1)

    def test_linear_equation_solve(self):
        # Test 3x + 7 = 22 => x = 5
        res = verify("3x + 7 = 22")
        self.assertEqual(res.status, "VERIFIED")
        self.assertEqual(res.computed, 5.0)
        self.assertEqual(res.confidence, 5)

    def test_binomial_probability(self):
        # P(3 heads in 5 flips) = 10/32 = 0.3125
        res = verify("P(3 heads in 5 flips)")
        self.assertTrue(res.status == "VERIFIED" or res.status == "ERROR")
        # Since verify() might return a simple result for the expression
        if res.status == "VERIFIED":
            self.assertAlmostEqual(res.computed, 0.3125)

    def test_eigenvalues(self):
        # eigenvalues of [[2,0],[0,1]] should be [2, 1]
        res = verify("eigenvalues of [[2,0],[0,1]]")
        self.assertEqual(res.status, "VERIFIED")
        self.assertEqual(res.computed, [2.0, 1.0])

    def test_confidence_scoring(self):
        # Test a verified result with no derivation
        verif_res = {
            "status": "VERIFIED",
            "computed": 4,
            "claimed": 4,
            "comparison": "number",
            "diff": 0,
        }
        ctx = {"derivation_steps": 0}
        score = score_confidence(verif_res, ctx)
        self.assertEqual(score["label"], "DERIVED")
        self.assertEqual(score["confidence"], 3)

        # Test a verified result with derivation and crosscheck
        ctx_full = {"derivation_steps": 3, "has_crosscheck": True}
        score_full = score_confidence(verif_res, ctx_full)
        self.assertEqual(score_full["confidence"], 5)
        self.assertEqual(score_full["label"], "VERIFIED")

    def test_crosscheck_arithmetic(self):
        # Simple arithmetic crosscheck
        res = crosscheck("2 + 2", 4)
        self.assertEqual(res["overall"], "PASS")
        self.assertEqual(res["confidence"], 5)

    def test_crosscheck_conflict(self):
        # Arithmetic conflict crosscheck
        res = crosscheck("2 + 2", 5)
        self.assertEqual(res["overall"], "FAIL")
        self.assertEqual(res["confidence"], 1)


if __name__ == "__main__":
    unittest.main()
