"""
D4: Integration with Aletheia
Calibration tracking and reporting
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import json
import os

# Import from calibration module
try:
    from .calibration import (
        ProbabilityCalibrationModule,
        CalibrationRecord,
        CalibrationReport,
        CalibrationBin
    )
except ImportError:
    from calibration import (
        ProbabilityCalibrationModule,
        CalibrationRecord,
        CalibrationReport,
        CalibrationBin
    )


@dataclass
class CalibrationTrackingEvent:
    """Event in calibration tracking"""
    event_id: str
    event_type: str  # PREDICTION/OUTCOME/DRIFT/ALERT
    claim_id: str
    model_id: str
    timestamp: float
    value: float
    metadata: Dict = field(default_factory=dict)


@dataclass
class CalibrationDriftAlert:
    """Alert for calibration drift"""
    alert_id: str
    model_id: str
    drift_magnitude: float
    previous_ece: float
    current_ece: float
    threshold_exceeded: bool
    timestamp: float
    recommended_action: str


@dataclass
class AletheiaCalibrationReport:
    """Comprehensive calibration report for Aletheia"""
    model_id: str
    tracking_period: Dict  # start, end
    total_predictions: int
    total_outcomes: int
    current_ece: float
    current_mce: float
    is_calibrated: bool
    drift_detected: bool
    drift_magnitude: float
    historical_ece: List[float]
    alerts: List[CalibrationDriftAlert]
    recommendations: List[str]
    export_timestamp: float


class AletheiaCalibrationTracker:
    """
    Integrate Dianoia calibration with Aletheia truth-tracking
    
    Provides:
    - Continuous calibration monitoring
    - Drift detection and alerts
    - Historical calibration trends
    - Export for Aletheia integration
    """
    
    def __init__(
        self,
        calibration_module: Optional[ProbabilityCalibrationModule] = None,
        storage_dir: str = "~/.abraxas/aletheia"
    ):
        self.calibration_module = calibration_module or ProbabilityCalibrationModule()
        self.storage_dir = os.path.expanduser(storage_dir)
        self.events: List[CalibrationTrackingEvent] = []
        self.alerts: List[CalibrationDriftAlert] = []
        self.reports: Dict[str, AletheiaCalibrationReport] = {}
        
        self._ensure_storage()
        self._load_events()
    
    def _ensure_storage(self):
        """Create storage directory"""
        os.makedirs(self.storage_dir, exist_ok=True)
    
    def _load_events(self):
        """Load historical events"""
        path = os.path.join(self.storage_dir, "tracking_events.json")
        if os.path.exists(path):
            with open(path, 'r') as f:
                data = json.load(f)
                self.events = [
                    CalibrationTrackingEvent(**e) for e in data
                ]
    
    def _save_events(self):
        """Save events to disk"""
        path = os.path.join(self.storage_dir, "tracking_events.json")
        data = [vars(e) for e in self.events]
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def track_prediction(
        self,
        claim_id: str,
        model_id: str,
        predicted_confidence: float,
        metadata: Optional[Dict] = None
    ) -> CalibrationTrackingEvent:
        """
        Track a prediction event
        
        Args:
            claim_id: Claim identifier
            model_id: Model identifier
            predicted_confidence: Predicted confidence
            metadata: Additional metadata
            
        Returns:
            CalibrationTrackingEvent
        """
        event = CalibrationTrackingEvent(
            event_id=f"evt_{len(self.events)}",
            event_type="PREDICTION",
            claim_id=claim_id,
            model_id=model_id,
            timestamp=datetime.now().timestamp(),
            value=predicted_confidence,
            metadata=metadata or {}
        )
        
        self.events.append(event)
        self._save_events()
        
        # Also record in calibration module
        # (Outcome will be recorded later when claim is verified)
        
        return event
    
    def track_outcome(
        self,
        claim_id: str,
        model_id: str,
        actual_outcome: bool,
        metadata: Optional[Dict] = None
    ) -> CalibrationTrackingEvent:
        """
        Track an outcome event
        
        Args:
            claim_id: Claim identifier
            model_id: Model identifier
            actual_outcome: Whether claim was verified
            metadata: Additional metadata
            
        Returns:
            CalibrationTrackingEvent
        """
        event = CalibrationTrackingEvent(
            event_id=f"evt_{len(self.events)}",
            event_type="OUTCOME",
            claim_id=claim_id,
            model_id=model_id,
            timestamp=datetime.now().timestamp(),
            value=1.0 if actual_outcome else 0.0,
            metadata=metadata or {}
        )
        
        self.events.append(event)
        self._save_events()
        
        # Record in calibration module
        self.calibration_module.record_prediction(
            claim_id=claim_id,
            predicted_confidence=0.5,  # Would lookup from prediction
            actual_outcome=actual_outcome,
            model_id=model_id,
            metadata=metadata
        )
        
        return event
    
    def check_drift(
        self,
        model_id: str = "default",
        window_size: int = 50
    ) -> Optional[CalibrationDriftAlert]:
        """
        Check for calibration drift
        
        Compares recent calibration to historical baseline.
        
        Args:
            model_id: Model identifier
            window_size: Number of recent predictions to analyze
            
        Returns:
            CalibrationDriftAlert if drift detected
        """
        # Get current calibration
        current_report = self.calibration_module.get_calibration_report(model_id)
        
        if not current_report:
            return None
        
        current_ece = current_report.expected_calibration_error
        
        # Get historical average ECE
        historical_ece = self._calculate_historical_ece(model_id, window_size)
        
        if historical_ece is None:
            return None
        
        # Calculate drift
        drift_magnitude = abs(current_ece - historical_ece)
        
        # Threshold: drift > 0.05 is significant
        threshold = 0.05
        threshold_exceeded = drift_magnitude > threshold
        
        if not threshold_exceeded:
            return None
        
        # Generate alert
        alert = CalibrationDriftAlert(
            alert_id=f"alert_{len(self.alerts)}",
            model_id=model_id,
            drift_magnitude=drift_magnitude,
            previous_ece=historical_ece,
            current_ece=current_ece,
            threshold_exceeded=True,
            timestamp=datetime.now().timestamp(),
            recommended_action=self._generate_drift_recommendation(
                current_ece, historical_ece, drift_magnitude
            )
        )
        
        self.alerts.append(alert)
        return alert
    
    def _calculate_historical_ece(
        self,
        model_id: str,
        window_size: int
    ) -> Optional[float]:
        """Calculate historical average ECE"""
        # Filter events for this model
        model_events = [e for e in self.events if e.model_id == model_id]
        
        if len(model_events) < window_size:
            return None
        
        # Use recent events
        recent = model_events[-window_size:]
        
        # Simplified: just average prediction confidence
        # In production, would recalculate ECE
        avg_confidence = sum([e.value for e in recent if e.event_type == "PREDICTION"]) / len([e for e in recent if e.event_type == "PREDICTION"])
        
        # Approximate ECE from confidence distribution
        # (In production, would use actual calibration data)
        return avg_confidence * 0.1  # Rough approximation
    
    def _generate_drift_recommendation(
        self,
        current_ece: float,
        historical_ece: float,
        drift_magnitude: float
    ) -> str:
        """Generate recommendation for drift"""
        if current_ece > historical_ece:
            # Calibration getting worse
            if current_ece > 0.1:
                return "URGENT: Recalibrate model immediately - ECE exceeds 0.10"
            else:
                return "WARNING: Calibration degrading - review recent predictions"
        else:
            # Calibration improving
            return "Calibration improving - continue monitoring"
    
    def generate_aletheia_report(
        self,
        model_id: str = "default",
        period_days: int = 30
    ) -> AletheiaCalibrationReport:
        """
        Generate comprehensive calibration report for Aletheia
        
        Args:
            model_id: Model identifier
            period_days: Reporting period in days
            
        Returns:
            AletheiaCalibrationReport
        """
        # Get current calibration
        report = self.calibration_module.get_calibration_report(model_id)
        
        if not report:
            report = self.calibration_module.get_calibration_report(model_id, min_samples=1)
        
        # Get historical ECE trend
        historical_ece = []
        for i in range(1, 11):
            ece = self._calculate_historical_ece(model_id, i * 10)
            if ece is not None:
                historical_ece.append(ece)
        
        # Check for drift
        drift_alert = self.check_drift(model_id)
        drift_detected = drift_alert is not None
        drift_magnitude = drift_alert.drift_magnitude if drift_alert else 0.0
        
        # Get model alerts
        model_alerts = [a for a in self.alerts if a.model_id == model_id]
        
        # Generate recommendations
        recommendations = self._generate_aletheia_recommendations(
            report, drift_detected, drift_magnitude, model_alerts
        )
        
        aletheia_report = AletheiaCalibrationReport(
            model_id=model_id,
            tracking_period={
                'start': datetime.now().timestamp() - (period_days * 86400),
                'end': datetime.now().timestamp()
            },
            total_predictions=report.total_predictions,
            total_outcomes=len([e for e in self.events if e.event_type == "OUTCOME" and e.model_id == model_id]),
            current_ece=report.expected_calibration_error,
            current_mce=report.maximum_calibration_error,
            is_calibrated=report.is_calibrated,
            drift_detected=drift_detected,
            drift_magnitude=drift_magnitude,
            historical_ece=historical_ece,
            alerts=model_alerts,
            recommendations=recommendations,
            export_timestamp=datetime.now().timestamp()
        )
        
        self.reports[model_id] = aletheia_report
        return aletheia_report
    
    def _generate_aletheia_recommendations(
        self,
        report: CalibrationReport,
        drift_detected: bool,
        drift_magnitude: float,
        alerts: List[CalibrationDriftAlert]
    ) -> List[str]:
        """Generate recommendations for Aletheia report"""
        recommendations = []
        
        if not report.is_calibrated:
            recommendations.append(
                f"Model is uncalibrated (ECE={report.expected_calibration_error:.3f})"
            )
            recommendations.append("Implement probability calibration correction")
        
        if drift_detected:
            recommendations.append(
                f"Calibration drift detected (magnitude={drift_magnitude:.3f})"
            )
            recommendations.append("Investigate recent prediction patterns")
        
        if len(alerts) > 3:
            recommendations.append(
                f"Multiple drift alerts ({len(alerts)}) - consider model retraining"
            )
        
        if report.total_predictions < 100:
            recommendations.append(
                "Limited calibration data - continue tracking for robust analysis"
            )
        
        if not recommendations:
            recommendations.append("Calibration tracking nominal")
            recommendations.append("Continue regular monitoring")
        
        return recommendations
    
    def export_for_aletheia(
        self,
        model_id: str = "default"
    ) -> Dict:
        """
        Export calibration data for Aletheia integration
        
        Returns dict compatible with Aletheia truth-tracking system.
        """
        report = self.generate_aletheia_report(model_id)
        
        return {
            'model_id': model_id,
            'calibration_status': 'CALIBRATED' if report.is_calibrated else 'UNCALIBRATED',
            'ece': report.current_ece,
            'mce': report.current_mce,
            'drift_detected': report.drift_detected,
            'drift_magnitude': report.drift_magnitude,
            'total_predictions': report.total_predictions,
            'total_outcomes': report.total_outcomes,
            'tracking_period': report.tracking_period,
            'alerts': [vars(a) for a in report.alerts],
            'historical_ece': report.historical_ece,
            'recommendations': report.recommendations,
            'aletheia_integration': {
                'truth_tracking_ready': report.is_calibrated,
                'confidence_adjustment': 1.0 if report.is_calibrated else 0.9,
                'reliability_score': max(0.0, 1.0 - report.current_ece)
            }
        }
    
    def get_alerts(self, model_id: Optional[str] = None) -> List[CalibrationDriftAlert]:
        """Get calibration alerts"""
        if model_id:
            return [a for a in self.alerts if a.model_id == model_id]
        return self.alerts
    
    def get_report(self, model_id: str) -> Optional[AletheiaCalibrationReport]:
        """Get Aletheia report by model ID"""
        return self.reports.get(model_id)
