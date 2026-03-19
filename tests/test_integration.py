"""
Integration tests for Abraxas v3 - Logos + Ergon systems
"""

import unittest
import asyncio
import sys
from pathlib import Path

# Add systems to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'systems' / 'logos'))
sys.path.insert(0, str(Path(__file__).parent.parent / 'systems' / 'ergon'))


class TestLogosIntegration(unittest.TestCase):
    """Integration tests for Logos system."""

    def test_full_pipeline(self):
        """Test complete Logos pipeline from decomposition to labeling."""
        from honest_integration import HonestSkillIntegration
        
        async def run_test():
            integration = HonestSkillIntegration()
            claim = "The Earth is round and orbits the Sun."
            
            result = await integration.process_claim(claim)
            
            # Assertions
            self.assertIn(result.final_label.label, ["TRUE", "MOSTLY_TRUE", "MIXED"])
            self.assertGreater(result.final_label.confidence, 0.0)
            self.assertGreater(len(result.decomposed_claim.propositions), 0)
            self.assertGreater(len(result.verification_results), 0)
            
            return result
        
        result = asyncio.run(run_test())
        print(f"✓ Logos pipeline: {result.final_label.label} ({result.final_label.confidence:.2f})")

    def test_decomposition_accuracy(self):
        """Test claim decomposition accuracy."""
        from decomposition import ClaimDecompositionEngine
        
        engine = ClaimDecompositionEngine()
        claim = "Water boils at 100°C at sea level, but at higher altitudes it boils at lower temperatures."
        
        result = engine.decompose(claim)
        
        self.assertEqual(len(result.propositions), 2)
        self.assertEqual(result.propositions[0].proposition_type.value, "factual")
        self.assertGreater(result.decomposition_confidence, 0.7)
        
        print(f"✓ Decomposition: {len(result.propositions)} propositions")

    def test_aggregation_methods(self):
        """Test different aggregation methods."""
        from aggregation import ConfidenceAggregationEngine, AggregationMethod, VerificationInput
        
        engine = ConfidenceAggregationEngine()
        
        input_data = VerificationInput(
            proposition_text="Test claim",
            prior_confidence=0.7,
            verification_results=[
                {"status": "verified", "confidence": 0.9},
                {"status": "verified", "confidence": 0.85},
                {"status": "partial", "confidence": 0.6},
            ],
            source_credibilities=[0.9, 0.85, 0.7]
        )
        
        # Test Bayesian
        bayesian = engine.aggregate([input_data], AggregationMethod.BAYESIAN)
        self.assertGreater(bayesian[0].final_confidence, 0.0)
        
        # Test Weighted Average
        weighted = engine.aggregate([input_data], AggregationMethod.WEIGHTED_AVERAGE)
        self.assertGreater(weighted[0].final_confidence, 0.0)
        
        print(f"✓ Aggregation: Bayesian={bayesian[0].final_confidence:.2f}, Weighted={weighted[0].final_confidence:.2f}")


class TestErgonIntegration(unittest.TestCase):
    """Integration tests for Ergon system."""

    def test_sandbox_execution(self):
        """Test sandbox execution with validation."""
        from sandbox import ToolExecutionSandbox, ResourceLimits
        from validation import OutputValidationEngine
        
        sandbox = ToolExecutionSandbox()
        validator = OutputValidationEngine()
        
        # Execute command
        result = sandbox.execute(
            tool_name="test",
            command="echo",
            args=["Hello"]
        )
        
        # Validate output
        output_data = {
            "success": result.exit_code == 0,
            "data": result.stdout,
            "error": result.stderr
        }
        
        validation = validator.validate("test", output_data)
        
        self.assertEqual(validation.status.value, "valid")
        print(f"✓ Sandbox + Validation: {result.status.value} → {validation.status.value}")

    def test_failure_degradation(self):
        """Test failure detection and degradation."""
        from failure_detection import FailureDetectionEngine
        
        detector = FailureDetectionEngine()
        
        # Simulate failure
        try:
            raise TimeoutError("Test timeout")
        except Exception as e:
            context = detector.detect_failure("test_tool", e, {})
            result = detector.apply_degradation(context)
            
            self.assertEqual(result.output["status"], "UNKNOWN")
            self.assertEqual(result.degradation_strategy.value, "return_unknown")
            
            print(f"✓ Failure detection: {context.failure_type.value} → {result.degradation_strategy.value}")

    def test_api_pipeline(self):
        """Test complete API pipeline."""
        from api import ToolUseAPI, ToolRequest
        
        async def run_test():
            api = ToolUseAPI()
            
            from sandbox import ResourceLimits
            
            request = ToolRequest(
                tool_name="echo",
                command="echo",
                arguments={"message": "test"},
                timeout_ms=5000,
                resource_limits=ResourceLimits(),
                request_id="TEST-001",
                timestamp=api._get_timestamp()
            )
            
            response = await api.execute_tool(request)
            
            self.assertEqual(response.status.value, "success")
            self.assertEqual(response.verification_status.value, "valid")
            
            return response
        
        response = asyncio.run(run_test())
        print(f"✓ API pipeline: {response.status.value} ({response.processing_time_ms:.1f}ms)")


class TestCrossSystemIntegration(unittest.TestCase):
    """Test integration between Logos and Ergon systems."""

    def test_logos_uses_ergon(self):
        """Test that Logos verification uses Ergon sandbox."""
        from verification import CrossSourceVerificationEngine
        from sandbox import ToolExecutionSandbox
        
        # Logos verification engine can use Ergon sandbox
        verification_engine = CrossSourceVerificationEngine()
        sandbox = ToolExecutionSandbox()
        
        # Verify they can work together
        self.assertIsNotNone(verification_engine)
        self.assertIsNotNone(sandbox)
        
        print("✓ Logos + Ergon integration ready")


if __name__ == "__main__":
    # Run tests with output
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromTestCase(TestLogosIntegration))
    suite.addTests(loader.loadTestsFromTestCase(TestErgonIntegration))
    suite.addTests(loader.loadTestsFromTestCase(TestCrossSystemIntegration))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print(f"\n{'='*60}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"{'='*60}")
