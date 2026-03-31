"""
Unit tests for Logos System - Claim Decomposition Engine
"""

import unittest
import sys
sys.path.insert(0, '/home/ubuntu/.openclaw/workspace/abraxas')

from skills.logos.decomposition import ClaimDecompositionEngine, AtomicProposition, PropositionType, DecomposedClaim


class TestClaimDecompositionEngine(unittest.TestCase):
    """Test cases for claim decomposition."""

    def setUp(self):
        """Set up test fixtures."""
        self.engine = ClaimDecompositionEngine()

    def test_simple_claim_decomposition(self):
        """Test decomposition of a simple claim."""
        claim = "The Earth orbits the Sun."
        result = self.engine.decompose(claim)
        
        self.assertIsInstance(result, DecomposedClaim)
        self.assertEqual(result.original_claim, claim)
        self.assertGreater(len(result.propositions), 0)
        self.assertGreater(result.decomposition_confidence, 0.0)

    def test_complex_claim_with_conjunctions(self):
        """Test decomposition of claims with conjunctions."""
        claim = "Climate change is real, and it affects weather patterns, but some scientists disagree."
        result = self.engine.decompose(claim)
        
        self.assertGreater(len(result.propositions), 1, "Should decompose into multiple propositions")
        self.assertIn(PropositionType.FACTUAL, [p.proposition_type for p in result.propositions])

    def test_conditional_claim(self):
        """Test decomposition of conditional claims."""
        claim = "If CO2 levels rise, then global temperatures will increase."
        result = self.engine.decompose(claim)
        
        # Check if any proposition contains conditional logic
        has_conditional = any("if" in p.text.lower() or "then" in p.text.lower() for p in result.propositions)
        self.assertTrue(has_conditional)

    def test_causal_claim(self):
        """Test decomposition of causal claims."""
        claim = "Vaccines prevent disease transmission."
        result = self.engine.decompose(claim)
        
        self.assertGreater(len(result.propositions), 0)

    def test_confidence_extraction(self):
        """Test confidence extraction from claims."""
        claim = "I'm certain that water is H2O."
        result = self.engine.decompose(claim)
        
        self.assertGreater(result.decomposition_confidence, 0.8)

    def test_empty_claim(self):
        """Test handling of empty claims."""
        result = self.engine.decompose("")
        self.assertEqual(len(result.propositions), 0)

    def test_full_pipeline(self):
        """Test end-to-end decomposition pipeline."""
        claim = "The moon landing happened in 1969, and it was broadcast on TV."
        result = self.engine.decompose(claim)
        
        # Verify decomposition
        self.assertGreater(len(result.propositions), 0)
        
        # Verify all propositions have required fields
        for prop in result.propositions:
            self.assertIsNotNone(prop.text)
            self.assertIsNotNone(prop.proposition_type)
            self.assertIsNotNone(prop.confidence)


if __name__ == '__main__':
    unittest.main()
