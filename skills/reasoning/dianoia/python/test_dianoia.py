"""
Unit tests for Dianoia (Uncertainty Quantification System)
"""

import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'python'))

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from calibration import ProbabilityCalibrationModule, CalibrationReport
from uncertainty_bounds import UncertaintyBoundsCalculator, ConfidenceLevel
from distribution_analyzer import DistributionAnalyzer, DistributionType
from aletheia_integration import AletheiaCalibrationTracker


class TestProbabilityCalibration(unittest.TestCase):
    """Test probability calibration module"""
    
    def setUp(self):
        self.calib = ProbabilityCalibrationModule(storage_dir="/tmp/dianoia_test")
    
    def test_record_prediction(self):
        """Test recording predictions"""
        record = self.calib.record_prediction(
            claim_id="test_001",
            predicted_confidence=0.75,
            actual_outcome=True,
            model_id="test"
        )
        
        self.assertEqual(record.claim_id, "test_001")
        self.assertEqual(record.predicted_confidence, 0.75)
        self.assertTrue(record.actual_outcome)
    
    def test_confidence_to_probability(self):
        """Test confidence to probability mapping"""
        prob = self.calib.confidence_to_probability(0.8, "test")
        
        self.assertGreater(prob, 0.0)
        self.assertLessEqual(prob, 1.0)
    
    def test_get_calibration_report(self):
        """Test calibration report generation"""
        # Record enough predictions
        for i in range(15):
            self.calib.record_prediction(
                claim_id=f"test_{i}",
                predicted_confidence=0.5 + (i % 10) * 0.05,
                actual_outcome=i % 2 == 0,
                model_id="test"
            )
        
        report = self.calib.get_calibration_report("test")
        
        self.assertIsInstance(report, CalibrationReport)
        self.assertGreater(report.total_predictions, 0)
        self.assertGreaterEqual(report.expected_calibration_error, 0.0)
        self.assertLessEqual(report.expected_calibration_error, 1.0)
    
    def test_calibration_status(self):
        """Test calibration status check"""
        status = self.calib.get_calibration_status("nonexistent")
        
        self.assertEqual(status['status'], 'INSUFFICIENT_DATA')


class TestUncertaintyBounds(unittest.TestCase):
    """Test uncertainty bounds calculator"""
    
    def setUp(self):
        self.calc = UncertaintyBoundsCalculator()
    
    def test_calculate_bounds(self):
        """Test uncertainty bounds calculation"""
        bounds = self.calc.calculate_bounds(
            claim_id="test_001",
            point_estimate=10.0,
            standard_error=0.5,
            sample_size=100,
            base_confidence=0.5
        )
        
        self.assertEqual(bounds.claim_id, "test_001")
        self.assertEqual(bounds.point_estimate, 10.0)
        self.assertEqual(bounds.standard_error, 0.5)
        self.assertIn(ConfidenceLevel.CL_95, bounds.confidence_intervals)
    
    def test_calculate_from_sample(self):
        """Test bounds from sample data"""
        sample = [1.2, 1.5, 1.3, 1.4, 1.6, 1.2, 1.5, 1.4, 1.3, 1.5]
        
        bounds = self.calc.calculate_from_sample(
            claim_id="sample_001",
            sample_data=sample,
            base_confidence=0.5
        )
        
        self.assertAlmostEqual(bounds.point_estimate, 1.39, places=2)
        self.assertGreater(bounds.standard_error, 0.0)
    
    def test_proportion_bounds(self):
        """Test proportion bounds (Wilson score)"""
        bounds = self.calc.calculate_proportion_bounds(
            claim_id="prop_001",
            successes=75,
            total=100,
            base_confidence=0.5
        )
        
        self.assertAlmostEqual(bounds.point_estimate, 0.75, places=2)
        self.assertGreater(bounds.margin_of_error, 0.0)
    
    def test_propagate_error_addition(self):
        """Test error propagation for addition"""
        b1 = self.calc.calculate_bounds("b1", 10.0, 0.5)
        b2 = self.calc.calculate_bounds("b2", 5.0, 0.3)
        
        result = self.calc.propagate_error("add", [b1, b2])
        
        self.assertAlmostEqual(result.output_estimate, 15.0, places=2)
        self.assertGreater(result.output_error, 0.0)
    
    def test_compare_bounds(self):
        """Test bounds comparison"""
        b1 = self.calc.calculate_bounds("b1", 10.0, 0.5)
        b2 = self.calc.calculate_bounds("b2", 11.0, 0.5)
        
        comparison = self.calc.compare_bounds(b1, b2)
        
        self.assertIn('overlaps', comparison)
        self.assertIn('statistically_significant', comparison)


class TestDistributionAnalyzer(unittest.TestCase):
    """Test distribution analyzer"""
    
    def setUp(self):
        self.analyzer = DistributionAnalyzer()
    
    def test_analyze_normal(self):
        """Test analysis of normal distribution"""
        import random
        random.seed(42)
        data = [random.gauss(0, 1) for _ in range(100)]
        
        analysis = self.analyzer.analyze(
            data_id="normal_test",
            data=data
        )
        
        self.assertEqual(analysis.sample_size, 100)
        self.assertIn(analysis.distribution_type, [DistributionType.NORMAL, DistributionType.UNKNOWN])
    
    def test_descriptive_statistics(self):
        """Test descriptive statistics"""
        data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        
        analysis = self.analyzer.analyze("test", data)
        
        self.assertAlmostEqual(analysis.descriptive_stats['mean'], 5.5, places=2)
        self.assertGreater(analysis.descriptive_stats['std'], 0.0)
    
    def test_skewness(self):
        """Test skewness calculation"""
        # Right-skewed data
        data = [1, 1, 1, 2, 2, 3, 5, 10, 20, 50]
        
        analysis = self.analyzer.analyze("skewed", data)
        
        self.assertGreater(analysis.skewness, 0.0)
    
    def test_detect_modality(self):
        """Test modality detection"""
        # Bimodal data
        data = [1, 1, 1, 1, 1, 9, 9, 9, 9, 9]
        
        analysis = self.analyzer.analyze("bimodal", data)
        
        self.assertGreaterEqual(analysis.modality, 1)
    
    def test_outlier_detection(self):
        """Test outlier detection"""
        data = [1, 2, 3, 4, 5, 100]  # 100 is outlier
        
        analysis = self.analyzer.analyze("outliers", data)
        
        self.assertGreater(len(analysis.outliers), 0)


class TestAletheiaIntegration(unittest.TestCase):
    """Test Aletheia calibration tracking"""
    
    def setUp(self):
        self.tracker = AletheiaCalibrationTracker(storage_dir="/tmp/aletheia_test")
    
    def test_track_prediction(self):
        """Test prediction tracking"""
        event = self.tracker.track_prediction(
            claim_id="test_001",
            model_id="test",
            predicted_confidence=0.75
        )
        
        self.assertEqual(event.event_type, "PREDICTION")
        self.assertEqual(event.claim_id, "test_001")
    
    def test_track_outcome(self):
        """Test outcome tracking"""
        event = self.tracker.track_outcome(
            claim_id="test_001",
            model_id="test",
            actual_outcome=True
        )
        
        self.assertEqual(event.event_type, "OUTCOME")
        self.assertTrue(event.value > 0.5)
    
    def test_export_for_aletheia(self):
        """Test Aletheia export"""
        # Record some data
        for i in range(10):
            self.tracker.track_prediction(f"claim_{i}", "test", 0.5 + i * 0.05)
            self.tracker.track_outcome(f"claim_{i}", "test", i % 2 == 0)
        
        export = self.tracker.export_for_aletheia("test")
        
        self.assertIn('model_id', export)
        self.assertIn('calibration_status', export)
        self.assertIn('aletheia_integration', export)


if __name__ == '__main__':
    unittest.main()
