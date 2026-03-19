"""
D1: Probability Calibration Module
Confidence → probability mapping
"""

from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from datetime import datetime
import json
import os
import math


@dataclass
class CalibrationRecord:
    """Record of a prediction and its outcome"""
    record_id: str
    claim_id: str
    predicted_confidence: float
    predicted_probability: float
    actual_outcome: bool  # True if claim was verified
    timestamp: float
    model_id: str = "default"
    metadata: Dict = field(default_factory=dict)


@dataclass
class CalibrationBin:
    """A bin in the calibration histogram"""
    bin_id: int
    predicted_range: Tuple[float, float]  # (min, max)
    midpoint: float
    count: int
    actual_frequency: float  # Fraction of true outcomes
    expected_frequency: float  # Midpoint of bin
    calibration_error: float  # |actual - expected|


@dataclass
class CalibrationReport:
    """Complete calibration analysis report"""
    model_id: str
    total_predictions: int
    expected_calibration_error: float
    maximum_calibration_error: float
    is_calibrated: bool
    calibration_threshold: float
    bins: List[CalibrationBin]
    reliability_diagram_data: List[Dict]
    recommendations: List[str]
    timestamp: float


class ProbabilityCalibrationModule:
    """
    Map confidence scores to calibrated probabilities
    
    Ensures that when the system predicts 70% confidence,
    approximately 70% of those claims are actually true.
    """
    
    def __init__(self, storage_dir: str = "~/.abraxas/dianoia"):
        self.storage_dir = os.path.expanduser(storage_dir)
        self.records: List[CalibrationRecord] = []
        self.bin_count = 10  # Standard: 10 bins (0-0.1, 0.1-0.2, ...)
        self.calibration_threshold = 0.05  # ECE < 0.05 = calibrated
        self.reports: Dict[str, CalibrationReport] = {}
        
        self._ensure_storage()
        self._load_records()
    
    def _ensure_storage(self):
        """Create storage directory"""
        os.makedirs(self.storage_dir, exist_ok=True)
    
    def _load_records(self):
        """Load historical records"""
        path = os.path.join(self.storage_dir, "calibration_records.json")
        if os.path.exists(path):
            with open(path, 'r') as f:
                data = json.load(f)
                self.records = [
                    CalibrationRecord(**r) for r in data
                ]
    
    def _save_records(self):
        """Save records to disk"""
        path = os.path.join(self.storage_dir, "calibration_records.json")
        data = [vars(r) for r in self.records]
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def record_prediction(
        self,
        claim_id: str,
        predicted_confidence: float,
        actual_outcome: bool,
        model_id: str = "default",
        metadata: Optional[Dict] = None
    ) -> CalibrationRecord:
        """
        Record a prediction and its outcome for calibration tracking
        
        Args:
            claim_id: Unique claim identifier
            predicted_confidence: System's confidence (0.0-1.0)
            actual_outcome: Whether claim was verified (True/False)
            model_id: Model identifier
            metadata: Additional metadata
            
        Returns:
            CalibrationRecord
        """
        # Map confidence to probability (identity by default)
        predicted_probability = self.confidence_to_probability(
            predicted_confidence, model_id
        )
        
        record = CalibrationRecord(
            record_id=f"cal_{len(self.records)}",
            claim_id=claim_id,
            predicted_confidence=predicted_confidence,
            predicted_probability=predicted_probability,
            actual_outcome=actual_outcome,
            timestamp=datetime.now().timestamp(),
            model_id=model_id,
            metadata=metadata or {}
        )
        
        self.records.append(record)
        self._save_records()
        
        return record
    
    def confidence_to_probability(
        self,
        confidence: float,
        model_id: str = "default"
    ) -> float:
        """
        Convert raw confidence to calibrated probability
        
        Applies calibration correction based on historical performance.
        """
        # Get calibration report
        report = self.get_calibration_report(model_id)
        
        if not report or not report.is_calibrated:
            # If uncalibrated, apply conservative correction
            return confidence * 0.9  # Slight deflation
        
        # If calibrated, confidence ≈ probability
        return confidence
    
    def probability_to_confidence(
        self,
        probability: float,
        model_id: str = "default"
    ) -> float:
        """
        Convert calibrated probability back to confidence
        
        Inverse of confidence_to_probability
        """
        report = self.get_calibration_report(model_id)
        
        if not report or not report.is_calibrated:
            return probability / 0.9  # Inflate back
        
        return probability
    
    def get_calibration_report(
        self,
        model_id: str = "default",
        min_samples: int = 10
    ) -> Optional[CalibrationReport]:
        """
        Generate calibration report for a model
        
        Args:
            model_id: Model identifier
            min_samples: Minimum samples required
            
        Returns:
            CalibrationReport or None if insufficient data
        """
        # Filter records for this model
        model_records = [r for r in self.records if r.model_id == model_id]
        
        if len(model_records) < min_samples:
            return None
        
        # Create bins
        bins = self._create_bins(model_records)
        
        # Calculate ECE (Expected Calibration Error)
        ece = self._calculate_ece(bins)
        
        # Calculate MCE (Maximum Calibration Error)
        mce = max([b.calibration_error for b in bins])
        
        # Determine if calibrated
        is_calibrated = ece < self.calibration_threshold
        
        # Generate reliability diagram data
        reliability_data = self._create_reliability_data(bins)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            ece, mce, is_calibrated, bins
        )
        
        report = CalibrationReport(
            model_id=model_id,
            total_predictions=len(model_records),
            expected_calibration_error=ece,
            maximum_calibration_error=mce,
            is_calibrated=is_calibrated,
            calibration_threshold=self.calibration_threshold,
            bins=bins,
            reliability_diagram_data=reliability_data,
            recommendations=recommendations,
            timestamp=datetime.now().timestamp()
        )
        
        self.reports[model_id] = report
        return report
    
    def _create_bins(
        self,
        records: List[CalibrationRecord]
    ) -> List[CalibrationBin]:
        """Create calibration bins from records"""
        bins = []
        
        for i in range(self.bin_count):
            bin_min = i / self.bin_count
            bin_max = (i + 1) / self.bin_count
            midpoint = (bin_min + bin_max) / 2
            
            # Filter records in this bin
            bin_records = [
                r for r in records
                if bin_min <= r.predicted_confidence < bin_max
            ]
            
            count = len(bin_records)
            actual_freq = (
                sum([1 for r in bin_records if r.actual_outcome]) / count
                if count > 0 else 0.0
            )
            expected_freq = midpoint
            cal_error = abs(actual_freq - expected_freq)
            
            bins.append(CalibrationBin(
                bin_id=i,
                predicted_range=(bin_min, bin_max),
                midpoint=midpoint,
                count=count,
                actual_frequency=actual_freq,
                expected_frequency=expected_freq,
                calibration_error=cal_error
            ))
        
        return bins
    
    def _calculate_ece(self, bins: List[CalibrationBin]) -> float:
        """Calculate Expected Calibration Error"""
        total = sum([b.count for b in bins])
        
        if total == 0:
            return 1.0
        
        ece = 0.0
        for bin in bins:
            if bin.count > 0:
                weight = bin.count / total
                ece += weight * bin.calibration_error
        
        return ece
    
    def _create_reliability_data(
        self,
        bins: List[CalibrationBin]
    ) -> List[Dict]:
        """Create data for reliability diagram"""
        return [
            {
                'predicted': b.midpoint,
                'actual': b.actual_frequency,
                'count': b.count,
                'perfect': b.midpoint  # Diagonal line
            }
            for b in bins
        ]
    
    def _generate_recommendations(
        self,
        ece: float,
        mce: float,
        is_calibrated: bool,
        bins: List[CalibrationBin]
    ) -> List[str]:
        """Generate calibration recommendations"""
        recommendations = []
        
        if not is_calibrated:
            recommendations.append(
                f"System is uncalibrated (ECE={ece:.3f} > threshold={self.calibration_threshold})"
            )
            
            # Find worst-calibrated bin
            worst_bin = max(bins, key=lambda b: b.calibration_error)
            recommendations.append(
                f"Largest error in {worst_bin.predicted_range} range "
                f"(error={worst_bin.calibration_error:.3f})"
            )
            
            # Check for over/underconfidence
            avg_actual = sum([b.actual_frequency * b.count for b in bins]) / sum([b.count for b in bins]) if sum([b.count for b in bins]) > 0 else 0
            avg_predicted = sum([b.midpoint * b.count for b in bins]) / sum([b.count for b in bins]) if sum([b.count for b in bins]) > 0 else 0
            
            if avg_predicted > avg_actual + 0.1:
                recommendations.append("System is overconfident - consider deflating confidence scores")
            elif avg_actual > avg_predicted + 0.1:
                recommendations.append("System is underconfident - consider inflating confidence scores")
        else:
            recommendations.append("System is well-calibrated")
            recommendations.append("Continue monitoring for calibration drift")
        
        if mce > ece * 2:
            recommendations.append(
                f"High maximum error (MCE={mce:.3f}) suggests inconsistent calibration"
            )
        
        return recommendations
    
    def apply_calibration_correction(
        self,
        raw_confidence: float,
        model_id: str = "default"
    ) -> float:
        """
        Apply calibration correction to raw confidence
        
        Uses isotonic regression-style adjustment based on bin performance.
        """
        report = self.get_calibration_report(model_id)
        
        if not report:
            return raw_confidence
        
        # Find appropriate bin
        bin_idx = min(
            int(raw_confidence * self.bin_count),
            self.bin_count - 1
        )
        
        bin = report.bins[bin_idx]
        
        # Adjust based on actual frequency in bin
        if bin.count > 0:
            # Pull toward actual frequency
            correction = bin.actual_frequency - bin.midpoint
            corrected = raw_confidence + correction * 0.5  # Dampen correction
            return max(0.0, min(1.0, corrected))
        
        return raw_confidence
    
    def get_calibration_status(self, model_id: str = "default") -> Dict:
        """Get quick calibration status"""
        report = self.get_calibration_report(model_id)
        
        if not report:
            return {
                'status': 'INSUFFICIENT_DATA',
                'message': 'Need more predictions for calibration analysis',
                'current_count': len([r for r in self.records if r.model_id == model_id])
            }
        
        return {
            'status': 'CALIBRATED' if report.is_calibrated else 'UNCALIBRATED',
            'ece': report.expected_calibration_error,
            'mce': report.maximum_calibration_error,
            'total_predictions': report.total_predictions,
            'threshold': report.calibration_threshold
        }
    
    def export_calibration_data(self, model_id: str = "default") -> Dict:
        """Export calibration data for external analysis"""
        report = self.get_calibration_report(model_id)
        
        if not report:
            return {'error': 'Insufficient data'}
        
        return {
            'model_id': model_id,
            'total_predictions': report.total_predictions,
            'ece': report.expected_calibration_error,
            'mce': report.maximum_calibration_error,
            'is_calibrated': report.is_calibrated,
            'bins': [vars(b) for b in report.bins],
            'reliability_diagram': report.reliability_diagram_data,
            'records': [vars(r) for r in self.records if r.model_id == model_id]
        }
