"""
test_verify.py
Unit tests for Logos verification layer skill
"""

import unittest
import os
import sys
import json
import shutil
import tempfile
from unittest.mock import patch, MagicMock

# Add the skill directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from verify import (
    verify,
    verify_atom,
    verify_with_fallback,
    get_history,
    clear_cache,
    classify_atom,
    call_pheme_api,
    apply_janus_label,
    VerificationStatus,
    JanusLabel,
    AtomType,
    VerificationResult,
    LOGOS_DIR,
    CACHE_DIR
)


class TestLogosVerification(unittest.TestCase):
    """Main test class for Logos verification"""
    
    def setUp(self):
        """Set up test environment"""
        # Create temp directories for testing
        self.temp_dir = tempfile.mkdtemp()
        os.environ['HOME'] = self.temp_dir
        
        # Re-initialize paths for temp directory
        global LOGOS_DIR, CACHE_DIR
        LOGOS_DIR = os.path.join(self.temp_dir, ".logos")
        CACHE_DIR = os.path.join(LOGOS_DIR, "cache")
        os.makedirs(LOGOS_DIR, exist_ok=True)
        os.makedirs(CACHE_DIR, exist_ok=True)
    
    def tearDown(self):
        """Clean up test environment"""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_classify_factual_atoms(self):
        """Test classification of factual atoms"""
        self.assertEqual(classify_atom("The Earth orbits the Sun"), AtomType.FACTUAL)
        self.assertEqual(classify_atom("Water boils at 100 degrees C"), AtomType.FACTUAL)
        self.assertEqual(classify_atom("Paris is the capital of France"), AtomType.FACTUAL)
    
    def test_classify_inferential_atoms(self):
        """Test classification of inferential atoms"""
        self.assertEqual(classify_atom("Therefore, the hypothesis is true"), AtomType.INFERENTIAL)
        self.assertEqual(classify_atom("It probably rains often"), AtomType.INFERENTIAL)
        self.assertEqual(classify_atom("This might indicate a problem"), AtomType.INFERENTIAL)
    
    def test_classify_value_atoms(self):
        """Test classification of value atoms"""
        self.assertEqual(classify_atom("This is the right thing to do"), AtomType.VALUE)
        self.assertEqual(classify_atom("It is wrong to lie"), AtomType.VALUE)
        self.assertEqual(classify_atom("This is a good decision"), AtomType.VALUE)
    
    def test_pheme_verification_verified(self):
        """Test Pheme returns verified for known facts"""
        result = call_pheme_api("The Earth orbits the Sun")
        self.assertEqual(result.status, VerificationStatus.VERIFIED)
        self.assertGreater(len(result.sources), 0)
        self.assertGreater(result.confidence, 0.5)
    
    def test_pheme_verification_contradicted(self):
        """Test Pheme returns contradicted for false facts"""
        result = call_pheme_api("The Earth is flat")
        self.assertEqual(result.status, VerificationStatus.CONTRADICTED)
        self.assertGreater(result.confidence, 0.5)
    
    def test_pheme_verification_unverifiable(self):
        """Test Pheme returns unverifiable for unknown claims"""
        result = call_pheme_api("Some random xyz claim 123")
        self.assertEqual(result.status, VerificationStatus.UNVERIFIABLE)
    
    def test_janus_label_verified_factual(self):
        """Test Janus labeling for verified factual claims"""
        verification = call_pheme_api("The Earth orbits the Sun")
        janus = apply_janus_label(verification, AtomType.FACTUAL)
        self.assertEqual(janus.label, JanusLabel.KNOWN)
    
    def test_janus_label_contradicted(self):
        """Test Janus labeling for contradicted claims"""
        verification = call_pheme_api("The Earth is flat")
        janus = apply_janus_label(verification, AtomType.FACTUAL)
        self.assertEqual(janus.label, JanusLabel.UNKNOWN)
    
    def test_janus_label_inferential(self):
        """Test Janus labeling for inferential claims"""
        verification = VerificationResult(
            status=VerificationStatus.PENDING,
            sources=[],
            confidence=0.0,
            details="test"
        )
        janus = apply_janus_label(verification, AtomType.INFERENTIAL)
        self.assertEqual(janus.label, JanusLabel.INFERRED)
    
    def test_janus_label_value(self):
        """Test Janus labeling for value claims"""
        verification = VerificationResult(
            status=VerificationStatus.UNVERIFIABLE,
            sources=[],
            confidence=0.0,
            details="test"
        )
        janus = apply_janus_label(verification, AtomType.VALUE)
        self.assertEqual(janus.label, JanusLabel.UNCERTAIN)
    
    def test_verify_single_atom(self):
        """Test verifying a single atom"""
        result = verify_atom("The Earth orbits the Sun")
        
        self.assertEqual(result.atom, "The Earth orbits the Sun")
        self.assertEqual(result.atom_type, AtomType.FACTUAL)
        self.assertEqual(result.verification.status, VerificationStatus.VERIFIED)
        self.assertEqual(result.epistemic.label, JanusLabel.KNOWN)
        self.assertIn("KNOWN", result.combined_label)
    
    def test_verify_multiple_atoms(self):
        """Test verifying multiple atoms"""
        atoms = [
            "The Earth orbits the Sun",
            "Paris is the capital of France"
        ]
        result = verify(atoms)
        
        self.assertEqual(len(result['results']), 2)
        self.assertEqual(result['summary']['total'], 2)
    
    def test_verify_with_caching(self):
        """Test that caching works"""
        atom = "Water at 100C"
        
        # First verification
        result1 = verify_atom(atom)
        self.assertFalse(result1.cached)
        
        # Second verification should hit cache
        result2 = verify_atom(atom)
        self.assertTrue(result2.cached)
    
    def test_verify_skip_cache(self):
        """Test skip_cache option"""
        atom = "Test fact"
        
        # First verification
        verify_atom(atom)
        
        # Should return cached
        result1 = verify_atom(atom)
        self.assertTrue(result1.cached)
        
        # Should skip cache
        result2 = verify_atom(atom, skip_cache=True)
        self.assertFalse(result2.cached)
    
    def test_verify_with_fallback_success(self):
        """Test fallback verification succeeds"""
        atoms = ["Test atom 1", "Test atom 2"]
        result = verify_with_fallback(atoms)
        
        self.assertIn('results', result)
        self.assertFalse(result.get('fallback_applied', False))
    
    def test_summary_generation(self):
        """Test summary generation"""
        atoms = [
            "The Earth orbits the Sun",
            "The Earth is flat",
            "Some unknown claim"
        ]
        result = verify(atoms)
        
        summary = result['summary']
        self.assertEqual(summary['total'], 3)
        self.assertEqual(summary['verified'], 1)
        self.assertEqual(summary['contradicted'], 1)
        self.assertEqual(summary['unverifiable'], 1)
    
    def test_clear_cache(self):
        """Test clearing cache"""
        # Add something to cache
        verify_atom("Test atom")
        
        # Clear
        result = clear_cache()
        self.assertGreaterEqual(result['cleared'], 0)


class TestIntegrationPhemeJanus(unittest.TestCase):
    """Integration tests for Pheme + Janus"""
    
    def setUp(self):
        """Set up test environment"""
        self.temp_dir = tempfile.mkdtemp()
        os.environ['HOME'] = self.temp_dir
        
        global LOGOS_DIR, CACHE_DIR
        LOGOS_DIR = os.path.join(self.temp_dir, ".logos")
        CACHE_DIR = os.path.join(LOGOS_DIR, "cache")
        os.makedirs(LOGOS_DIR, exist_ok=True)
        os.makedirs(CACHE_DIR, exist_ok=True)
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_integrated_verification_labeling(self):
        """Test Pheme verification integrates with Janus labeling"""
        result = verify_atom("Paris is the capital of France")
        
        # Pheme verifies
        self.assertEqual(result.verification.status, VerificationStatus.VERIFIED)
        
        # Janus labels as KNOWN
        self.assertEqual(result.epistemic.label, JanusLabel.KNOWN)
        
        # Combined includes both
        self.assertIn("KNOWN", result.combined_label)
    
    def test_contradicted_integration(self):
        """Test contradicted claims integration"""
        result = verify_atom("Vaccines cause autism", skip_cache=True)
        
        # Pheme contradicts
        self.assertEqual(result.verification.status, VerificationStatus.CONTRADICTED)
        
        # Janus labels as UNKNOWN (contradicted facts = cannot know)
        self.assertEqual(result.epistemic.label, JanusLabel.UNKNOWN)
    
    def test_full_pipeline(self):
        """Test full verification pipeline"""
        atoms = [
            "The Earth orbits the Sun",
            "Some unverifiable claim",
            "This is wrong"  # Value claim
        ]
        result = verify(atoms)
        
        # Should have results for all atoms
        self.assertEqual(len(result['results']), 3)
        
        # Should have summary
        self.assertIn('summary', result)
        
        # Summary should have expected keys
        summary = result['summary']
        self.assertEqual(summary['total'], 3)


if __name__ == '__main__':
    unittest.main()