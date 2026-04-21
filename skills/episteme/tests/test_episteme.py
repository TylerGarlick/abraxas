#!/usr/bin/env python3
"""
Unit Tests for Episteme Commands

Tests the trace, audit, and calibrate scripts for correct behavior.
"""

import unittest
import subprocess
import sys
import os
import json

SCRIPTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/scripts"

class TestTrace(unittest.TestCase):
    """Test cases for trace.py"""
    
    def test_trace_simple_fact(self):
        """Test tracing a simple factual claim."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/trace.py", "The Earth orbits the Sun"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("[KNOWN]", result.stdout)
        self.assertIn("Epistemic Trace", result.stdout)
    
    def test_trace_uncertainty_markers(self):
        """Test that uncertainty markers are detected."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/trace.py", "This might possibly be true"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("[UNCERTAIN]", result.stdout)
    
    def test_trace_multiple_propositions(self):
        """Test tracing multiple propositions in one claim."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/trace.py", "The sky is blue. Water is wet. Fire is hot."],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Proposition 1", result.stdout)
        self.assertIn("Proposition 2", result.stdout)
        self.assertIn("Proposition 3", result.stdout)
    
    def test_trace_no_args(self):
        """Test that trace.py shows usage when no arguments provided."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/trace.py"],
            capture_output=True,
            text=True
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Usage", result.stdout)


class TestAudit(unittest.TestCase):
    """Test cases for audit.py"""
    
    def test_audit_simple_claim(self):
        """Test auditing a simple claim."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/audit.py", "Vitamin C prevents colds"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Epistemic Audit", result.stdout)
        self.assertIn("Status:", result.stdout)
    
    def test_audit_absolute_claim(self):
        """Test that absolute claims are flagged."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/audit.py", "This always works perfectly"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("absolute_claim", result.stdout)
    
    def test_audit_statistical_claim(self):
        """Test that statistical claims without sources are flagged."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/audit.py", "90% of people agree with this"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("statistical_without_source", result.stdout)
    
    def test_audit_json_output(self):
        """Test JSON output format."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/audit.py", "Test claim", "--json"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        # Should contain JSON section
        self.assertIn("JSON Output:", result.stdout)
    
    def test_audit_no_args(self):
        """Test that audit.py shows usage when no arguments provided."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/audit.py"],
            capture_output=True,
            text=True
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Usage", result.stdout)


class TestCalibrate(unittest.TestCase):
    """Test cases for calibrate.py"""
    
    def test_calibrate_simple_claim(self):
        """Test calibrating a simple claim."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/calibrate.py", "This will definitely succeed"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Episteme Calibration", result.stdout)
        self.assertIn("Refinement Suggestions:", result.stdout)
    
    def test_calibrate_absolute_language(self):
        """Test that absolute language is flagged for qualification."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/calibrate.py", "This always works"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("qualification", result.stdout.lower())
    
    def test_calibrate_causal_claim(self):
        """Test that causal claims are flagged for precision."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/calibrate.py", "This causes improved performance"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("causal", result.stdout.lower())
    
    def test_calibrate_prediction(self):
        """Test that predictions are flagged for temporal precision."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/calibrate.py", "This will happen next year"],
            capture_output=True,
            text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("projection", result.stdout.lower())
    
    def test_calibrate_no_args(self):
        """Test that calibrate.py shows usage when no arguments provided."""
        result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/calibrate.py"],
            capture_output=True,
            text=True
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Usage", result.stdout)


class TestIntegration(unittest.TestCase):
    """Integration tests for Episteme workflow"""
    
    def test_full_workflow(self):
        """Test the full trace -> audit -> calibrate workflow."""
        claim = "AI will definitely replace all human jobs within 10 years"
        
        # Step 1: Trace
        trace_result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/trace.py", claim],
            capture_output=True,
            text=True
        )
        self.assertEqual(trace_result.returncode, 0)
        
        # Step 2: Audit
        audit_result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/audit.py", claim],
            capture_output=True,
            text=True
        )
        self.assertEqual(audit_result.returncode, 0)
        
        # Step 3: Calibrate
        calibrate_result = subprocess.run(
            [sys.executable, f"{SCRIPTS_DIR}/calibrate.py", claim],
            capture_output=True,
            text=True
        )
        self.assertEqual(calibrate_result.returncode, 0)
        
        # Verify all three produced output
        self.assertIn("Epistemic Trace", trace_result.stdout)
        self.assertIn("Epistemic Audit", audit_result.stdout)
        self.assertIn("Episteme Calibration", calibrate_result.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)
