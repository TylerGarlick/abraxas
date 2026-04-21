"""
Unit Tests for Aletheia Calibration

Tests for calibration.py - Rate calculation, trends, flags
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'python'))

from storage import Resolution

import calibration

import pytest


class TestConfirmationRateCalculation:
    """Tests for confirmation rate calculation"""
    
    def test_calculate_confirmation_rate_all_confirmed(self):
        """Test rate calculation with all confirmed"""
        resolutions = [
            Resolution(
                session_uuid="uuid-1",
                claim_text="[KNOWN] Claim 1",
                label_type="KNOWN",
                status="confirmed",
                resolution_date="2026-04-21T00:00:00Z"
            ),
            Resolution(
                session_uuid="uuid-2",
                claim_text="[KNOWN] Claim 2",
                label_type="KNOWN",
                status="confirmed",
                resolution_date="2026-04-21T00:00:00Z"
            ),
        ]
        
        stats = calibration.calculate_confirmation_rate(resolutions, "KNOWN")
        
        assert stats.confirmed == 2
        assert stats.disconfirmed == 0
        assert stats.superseded == 0
        assert stats.total == 2
        assert stats.confirmation_rate == 1.0
        assert stats.status == "WELL-CALIBRATED"
    
    def test_calculate_confirmation_rate_mixed(self):
        """Test rate calculation with mixed statuses"""
        resolutions = [
            Resolution(
                session_uuid="uuid-1",
                claim_text="[KNOWN] Claim 1",
                label_type="KNOWN",
                status="confirmed",
                resolution_date="2026-04-21T00:00:00Z"
            ),
            Resolution(
                session_uuid="uuid-2",
                claim_text="[KNOWN] Claim 2",
                label_type="KNOWN",
                status="disconfirmed",
                resolution_date="2026-04-21T00:00:00Z"
            ),
            Resolution(
                session_uuid="uuid-3",
                claim_text="[KNOWN] Claim 3",
                label_type="KNOWN",
                status="superseded",
                resolution_date="2026-04-21T00:00:00Z"
            ),
        ]
        
        stats = calibration.calculate_confirmation_rate(resolutions, "KNOWN")
        
        assert stats.confirmed == 1
        assert stats.disconfirmed == 1
        assert stats.superseded == 1
        assert stats.total == 3
        assert stats.confirmation_rate == pytest.approx(0.333, rel=0.01)
    
    def test_calculate_confirmation_rate_empty(self):
        """Test rate calculation with no resolutions"""
        resolutions = []
        
        stats = calibration.calculate_confirmation_rate(resolutions, "KNOWN")
        
        assert stats.confirmed == 0
        assert stats.total == 0
        assert stats.confirmation_rate == 0.0
        assert stats.status == "INSUFFICIENT_DATA"
    
    def test_calculate_confirmation_rate_unknown_not_scored(self):
        """Test UNKNOWN label is not scored"""
        resolutions = [
            Resolution(
                session_uuid="uuid-1",
                claim_text="[UNKNOWN] Claim 1",
                label_type="UNKNOWN",
                status="confirmed",
                resolution_date="2026-04-21T00:00:00Z"
            ),
        ]
        
        stats = calibration.calculate_confirmation_rate(resolutions, "UNKNOWN")
        
        assert stats.status == "NOT_SCORED"
    
    def test_calculate_confirmation_rate_known_below_expected(self):
        """Test KNOWN below 95% triggers CAUTION"""
        resolutions = [
            Resolution(session_uuid=f"uuid-{i}", claim_text=f"Claim {i}", label_type="KNOWN", status="confirmed", resolution_date="2026-04-21T00:00:00Z")
            for i in range(9)
        ]
        resolutions.append(
            Resolution(session_uuid="uuid-10", claim_text="Claim 10", label_type="KNOWN", status="disconfirmed", resolution_date="2026-04-21T00:00:00Z")
        )
        
        stats = calibration.calculate_confirmation_rate(resolutions, "KNOWN")
        
        assert stats.confirmation_rate == 0.9
        assert stats.status == "CAUTION"


class TestTrendCalculation:
    """Tests for trend calculation"""
    
    def test_calculate_trend_stable(self):
        """Test trend calculation with stable rates"""
        now = datetime.utcnow()
        
        # Create resolutions spread across periods
        resolutions = []
        
        # Prior period (60-120 days ago)
        for i in range(5):
            date = (now - timedelta(days=90)).isoformat() + "Z"
            resolutions.append(Resolution(
                session_uuid=f"uuid-{i}",
                claim_text=f"Claim {i}",
                label_type="KNOWN",
                status="confirmed",
                resolution_date=date
            ))
        
        # Current period (0-60 days ago)
        for i in range(5, 10):
            date = (now - timedelta(days=30)).isoformat() + "Z"
            resolutions.append(Resolution(
                session_uuid=f"uuid-{i}",
                claim_text=f"Claim {i}",
                label_type="KNOWN",
                status="confirmed",
                resolution_date=date
            ))
        
        trend, trend_status = calibration.calculate_trend(resolutions, "KNOWN", window_days=60)
        
        assert abs(trend) < 0.05  # Should be stable
        assert trend_status == "STABLE"
    
    def test_calculate_trend_declining(self):
        """Test trend detection for declining accuracy"""
        now = datetime.utcnow()
        
        resolutions = []
        
        # Prior period: all confirmed
        for i in range(10):
            date = (now - timedelta(days=90)).isoformat() + "Z"
            resolutions.append(Resolution(
                session_uuid=f"uuid-{i}",
                claim_text=f"Claim {i}",
                label_type="KNOWN",
                status="confirmed",
                resolution_date=date
            ))
        
        # Current period: mostly disconfirmed
        for i in range(10, 20):
            date = (now - timedelta(days=30)).isoformat() + "Z"
            resolutions.append(Resolution(
                session_uuid=f"uuid-{i}",
                claim_text=f"Claim {i}",
                label_type="KNOWN",
                status="disconfirmed",
                resolution_date=date
            ))
        
        trend, trend_status = calibration.calculate_trend(resolutions, "KNOWN", window_days=60)
        
        assert trend < -0.05  # Declining
        assert trend_status == "DECLINING"
    
    def test_calculate_trend_improving(self):
        """Test trend detection for improving accuracy"""
        now = datetime.utcnow()
        
        resolutions = []
        
        # Prior period: mostly disconfirmed
        for i in range(10):
            date = (now - timedelta(days=90)).isoformat() + "Z"
            resolutions.append(Resolution(
                session_uuid=f"uuid-{i}",
                claim_text=f"Claim {i}",
                label_type="KNOWN",
                status="disconfirmed",
                resolution_date=date
            ))
        
        # Current period: all confirmed
        for i in range(10, 20):
            date = (now - timedelta(days=30)).isoformat() + "Z"
            resolutions.append(Resolution(
                session_uuid=f"uuid-{i}",
                claim_text=f"Claim {i}",
                label_type="KNOWN",
                status="confirmed",
                resolution_date=date
            ))
        
        trend, trend_status = calibration.calculate_trend(resolutions, "KNOWN", window_days=60)
        
        assert trend > 0.05  # Improving
        assert trend_status == "IMPROVING"


class TestFlagGeneration:
    """Tests for calibration flag generation"""
    
    def test_generate_flags_no_issues(self):
        """Test no flags when calibration is good"""
        by_label = {
            'KNOWN': calibration.LabelStats(
                confirmed=95, disconfirmed=3, superseded=2, total=100,
                confirmation_rate=0.95, expected_range=(0.95, 1.0),
                status='WELL-CALIBRATED', trend=0.0, trend_status='STABLE'
            ),
            'INFERRED': calibration.LabelStats(
                confirmed=75, disconfirmed=20, superseded=5, total=100,
                confirmation_rate=0.75, expected_range=(0.70, 0.85),
                status='WELL-CALIBRATED', trend=0.0, trend_status='STABLE'
            ),
            'UNCERTAIN': calibration.LabelStats(
                confirmed=55, disconfirmed=40, superseded=5, total=100,
                confirmation_rate=0.55, expected_range=(0.40, 0.70),
                status='WELL-CALIBRATED', trend=0.0, trend_status='STABLE'
            ),
        }
        
        flags = calibration.generate_flags(by_label)
        
        assert len(flags) == 0
    
    def test_generate_flags_known_below_expected(self):
        """Test flag for KNOWN below expected"""
        by_label = {
            'KNOWN': calibration.LabelStats(
                confirmed=80, disconfirmed=15, superseded=5, total=100,
                confirmation_rate=0.80, expected_range=(0.95, 1.0),
                status='CAUTION', trend=0.0, trend_status='STABLE'
            ),
        }
        
        flags = calibration.generate_flags(by_label)
        
        assert len(flags) > 0
        assert "KNOWN" in flags[0]
        assert "CAUTION" in flags[0]
    
    def test_generate_flags_confirmation_bias(self):
        """Test flag for suspiciously high confirmation across all labels"""
        by_label = {
            'KNOWN': calibration.LabelStats(
                confirmed=98, disconfirmed=1, superseded=1, total=100,
                confirmation_rate=0.98, expected_range=(0.95, 1.0),
                status='WELL-CALIBRATED', trend=0.0, trend_status='STABLE'
            ),
            'INFERRED': calibration.LabelStats(
                confirmed=97, disconfirmed=2, superseded=1, total=100,
                confirmation_rate=0.97, expected_range=(0.70, 0.85),
                status='WELL-CALIBRATED', trend=0.0, trend_status='STABLE'
            ),
            'UNCERTAIN': calibration.LabelStats(
                confirmed=96, disconfirmed=3, superseded=1, total=100,
                confirmation_rate=0.96, expected_range=(0.40, 0.70),
                status='CAUTION', trend=0.0, trend_status='STABLE'
            ),
        }
        
        flags = calibration.generate_flags(by_label)
        
        assert len(flags) > 0
        assert any("confirmation bias" in f.lower() for f in flags)
    
    def test_generate_flags_uncertain_mislabeling(self):
        """Test flag for UNCERTAIN with too high confirmation"""
        by_label = {
            'UNCERTAIN': calibration.LabelStats(
                confirmed=90, disconfirmed=8, superseded=2, total=100,
                confirmation_rate=0.90, expected_range=(0.40, 0.70),
                status='CAUTION', trend=0.0, trend_status='STABLE'
            ),
        }
        
        flags = calibration.generate_flags(by_label)
        
        assert len(flags) > 0
        assert "UNCERTAIN" in flags[0]
        assert "mislabeling" in flags[0].lower()


class TestOverallQuality:
    """Tests for overall quality determination"""
    
    def test_determine_overall_quality_high(self):
        """Test HIGH quality with no flags"""
        by_label = {
            'KNOWN': calibration.LabelStats(
                confirmed=95, disconfirmed=3, superseded=2, total=100,
                confirmation_rate=0.95, expected_range=(0.95, 1.0),
                status='WELL-CALIBRATED', trend=0.0, trend_status='STABLE'
            ),
        }
        
        quality = calibration.determine_overall_quality(by_label, [])
        
        assert quality == 'HIGH'
    
    def test_determine_overall_quality_medium(self):
        """Test MEDIUM quality with caution flags"""
        by_label = {}
        flags = ["CAUTION: Some issue", "CAUTION: Another issue"]
        
        quality = calibration.determine_overall_quality(by_label, flags)
        
        assert quality == 'MEDIUM'
    
    def test_determine_overall_quality_low(self):
        """Test LOW quality with alert flags"""
        by_label = {}
        flags = ["ALERT: Critical issue"]
        
        quality = calibration.determine_overall_quality(by_label, flags)
        
        assert quality == 'LOW'


class TestCalibrationReport:
    """Tests for full calibration report generation"""
    
    def test_generate_calibration_report(self):
        """Test full report generation"""
        resolutions = [
            Resolution(
                session_uuid=f"uuid-{i}",
                claim_text=f"Claim {i}",
                label_type="KNOWN",
                status="confirmed",
                resolution_date=datetime.utcnow().isoformat() + "Z"
            )
            for i in range(10)
        ]
        
        # Mock load_resolutions
        original_load = calibration.load_resolutions
        calibration.load_resolutions = lambda: resolutions
        
        report = calibration.generate_calibration_report(period_days=90)
        
        assert isinstance(report, calibration.CalibrationReport)
        assert report.period_days == 90
        assert report.total_resolutions == 10
        assert 'KNOWN' in report.by_label
        
        # Restore
        calibration.load_resolutions = original_load
    
    def test_format_calibration_report(self):
        """Test report formatting"""
        report = calibration.CalibrationReport(
            period_days=90,
            total_resolutions=100,
            by_label={
                'KNOWN': calibration.LabelStats(
                    confirmed=90, disconfirmed=8, superseded=2, total=100,
                    confirmation_rate=0.90, expected_range=(0.95, 1.0),
                    status='CAUTION', trend=-0.02, trend_status='DECLINING'
                )
            },
            flags=["CAUTION: KNOWN below expected"],
            overall_quality='MEDIUM',
            generated_at=datetime.utcnow().isoformat() + "Z"
        )
        
        formatted = calibration.format_calibration_report(report)
        
        assert "CALIBRATION LEDGER" in formatted
        assert "KNOWN" in formatted
        assert "CAUTION" in formatted


class TestUnresolvedCount:
    """Tests for unresolved claim counting"""
    
    def test_get_unresolved_count(self):
        """Test unresolved count calculation"""
        ledger_claims = [
            {'session_uuid': 'uuid-1', 'claim_text': 'Claim 1', 'label_type': 'KNOWN'},
            {'session_uuid': 'uuid-2', 'claim_text': 'Claim 2', 'label_type': 'KNOWN'},
            {'session_uuid': 'uuid-3', 'claim_text': 'Claim 3', 'label_type': 'INFERRED'},
        ]
        
        resolutions = [
            Resolution(
                session_uuid='uuid-1',
                claim_text='Claim 1',
                label_type='KNOWN',
                status='confirmed',
                resolution_date='2026-04-21T00:00:00Z'
            )
        ]
        
        counts = calibration.get_unresolved_count(ledger_claims, resolutions)
        
        assert counts['KNOWN'] == 1  # Claim 2 unresolved
        assert counts['INFERRED'] == 1  # Claim 3 unresolved
    
    def test_get_unresolved_count_all_resolved(self):
        """Test unresolved count when all resolved"""
        ledger_claims = [
            {'session_uuid': 'uuid-1', 'claim_text': 'Claim 1', 'label_type': 'KNOWN'},
        ]
        
        resolutions = [
            Resolution(
                session_uuid='uuid-1',
                claim_text='Claim 1',
                label_type='KNOWN',
                status='confirmed',
                resolution_date='2026-04-21T00:00:00Z'
            )
        ]
        
        counts = calibration.get_unresolved_count(ledger_claims, resolutions)
        
        assert counts['KNOWN'] == 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
