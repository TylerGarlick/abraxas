"""
Aletheia Calibration - Calibration report generation and statistics

Calculates confirmation rates, trends, and flag conditions for
epistemic calibration tracking.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from storage import Resolution, load_resolutions


@dataclass
class LabelStats:
    """Statistics for a single label type"""
    confirmed: int
    disconfirmed: int
    superseded: int
    total: int
    confirmation_rate: float
    expected_range: Tuple[float, float]
    status: str  # WELL-CALIBRATED | CAUTION | ALERT
    trend: float  # Change from prior period
    trend_status: str  # STABLE | DECLINING | IMPROVING


@dataclass
class CalibrationReport:
    """Full calibration report"""
    period_days: int
    total_resolutions: int
    by_label: Dict[str, LabelStats]
    flags: List[str]
    overall_quality: str  # HIGH | MEDIUM | LOW
    generated_at: str


# Expected confirmation rates by label type
EXPECTED_RATES = {
    'KNOWN': (0.95, 1.0),      # >95% confirmed
    'INFERRED': (0.70, 0.85),  # 70-85% confirmed
    'UNCERTAIN': (0.40, 0.70), # 40-70% confirmed (high disconfirmation is healthy)
    'UNKNOWN': (0.0, 1.0),     # Not scored
}


def calculate_confirmation_rate(resolutions: List[Resolution], label_type: str) -> LabelStats:
    """
    Calculate confirmation rate for a specific label type.
    
    Args:
        resolutions: List of all resolutions
        label_type: The label type to calculate for
    
    Returns:
        LabelStats object with metrics
    """
    label_resolutions = [r for r in resolutions if r.label_type == label_type]
    
    confirmed = sum(1 for r in label_resolutions if r.status == 'confirmed')
    disconfirmed = sum(1 for r in label_resolutions if r.status == 'disconfirmed')
    superseded = sum(1 for r in label_resolutions if r.status == 'superseded')
    
    total = confirmed + disconfirmed + superseded
    
    if total == 0:
        return LabelStats(
            confirmed=0,
            disconfirmed=0,
            superseded=0,
            total=0,
            confirmation_rate=0.0,
            expected_range=EXPECTED_RATES.get(label_type, (0.0, 1.0)),
            status='INSUFFICIENT_DATA',
            trend=0.0,
            trend_status='STABLE'
        )
    
    confirmation_rate = confirmed / total
    
    # Determine status
    expected_min, expected_max = EXPECTED_RATES.get(label_type, (0.0, 1.0))
    
    if label_type == 'UNKNOWN':
        status = 'NOT_SCORED'
    elif confirmation_rate >= expected_min and confirmation_rate <= expected_max:
        status = 'WELL-CALIBRATED'
    elif confirmation_rate < expected_min:
        if label_type == 'KNOWN' and confirmation_rate < 0.70:
            status = 'ALERT'
        elif label_type == 'INFERRED' and confirmation_rate < 0.50:
            status = 'ALERT'
        else:
            status = 'CAUTION'
    else:  # confirmation_rate > expected_max
        if confirmation_rate > 0.95 and label_type in ['INFERRED', 'UNCERTAIN']:
            status = 'CAUTION'  # Possible overconfidence or mislabeling
        else:
            status = 'WELL-CALIBRATED'
    
    return LabelStats(
        confirmed=confirmed,
        disconfirmed=disconfirmed,
        superseded=superseded,
        total=total,
        confirmation_rate=confirmation_rate,
        expected_range=(expected_min, expected_max),
        status=status,
        trend=0.0,  # Calculated separately
        trend_status='STABLE'
    )


def calculate_trend(resolutions: List[Resolution], label_type: str, window_days: int = 60) -> Tuple[float, str]:
    """
    Calculate trend by comparing current period to prior period.
    
    Args:
        resolutions: List of all resolutions
        label_type: The label type to calculate for
        window_days: Number of days for each period
    
    Returns:
        (trend, trend_status) where trend = current_rate - prior_rate
    """
    now = datetime.utcnow()
    current_start = now - timedelta(days=window_days)
    prior_start = current_start - timedelta(days=window_days)
    
    # Filter resolutions by label type
    label_resolutions = [r for r in resolutions if r.label_type == label_type]
    
    # Split into current and prior periods
    current_period = []
    prior_period = []
    
    for res in label_resolutions:
        try:
            res_date = datetime.fromisoformat(res.resolution_date.replace('Z', '+00:00').replace('+00:00', ''))
        except:
            continue
        
        if res_date >= current_start:
            current_period.append(res)
        elif res_date >= prior_start:
            prior_period.append(res)
    
    # Calculate rates
    def calc_rate(period):
        if not period:
            return 0.0
        confirmed = sum(1 for r in period if r.status == 'confirmed')
        total = sum(1 for r in period if r.status in ['confirmed', 'disconfirmed', 'superseded'])
        return confirmed / total if total > 0 else 0.0
    
    current_rate = calc_rate(current_period)
    prior_rate = calc_rate(prior_period)
    
    trend = current_rate - prior_rate
    
    # Determine trend status
    if abs(trend) < 0.05:
        trend_status = 'STABLE'
    elif trend < -0.05:
        trend_status = 'DECLINING'
    else:
        trend_status = 'IMPROVING'
    
    return trend, trend_status


def generate_flags(by_label: Dict[str, LabelStats]) -> List[str]:
    """
    Generate warning flags based on calibration stats.
    
    Args:
        by_label: Dict of label_type -> LabelStats
    
    Returns:
        List of flag messages
    """
    flags = []
    
    # Check for suspiciously high confirmation across all labels
    all_rates = [stats.confirmation_rate for label, stats in by_label.items() 
                 if stats.total > 0 and label != 'UNKNOWN']
    
    if all_rates and all(r > 0.95 for r in all_rates):
        flags.append("CAUTION: All label types show >95% confirmation — possible confirmation bias")
    
    # Check individual label types
    known_stats = by_label.get('KNOWN')
    if known_stats and known_stats.total > 0:
        if known_stats.confirmation_rate < 0.85:
            flags.append(f"CAUTION: [KNOWN] accuracy at {known_stats.confirmation_rate:.0%} — below expected 95%")
        if known_stats.confirmation_rate < 0.70:
            flags.append(f"ALERT: [KNOWN] accuracy critical at {known_stats.confirmation_rate:.0%} — review recent claims")
        if known_stats.trend_status == 'DECLINING':
            flags.append(f"DRIFT: [KNOWN] accuracy declining (was {known_stats.confirmation_rate - known_stats.trend:.0%})")
    
    inferred_stats = by_label.get('INFERRED')
    if inferred_stats and inferred_stats.total > 0:
        if inferred_stats.confirmation_rate < 0.50:
            flags.append(f"ALERT: [INFERRED] accuracy at {inferred_stats.confirmation_rate:.0%} — lower than expected")
        if inferred_stats.confirmation_rate > 0.95:
            flags.append(f"CAUTION: [INFERRED] accuracy at {inferred_stats.confirmation_rate:.0%} — possible overconfidence")
    
    uncertain_stats = by_label.get('UNCERTAIN')
    if uncertain_stats and uncertain_stats.total > 0:
        if uncertain_stats.confirmation_rate > 0.85:
            flags.append(f"CAUTION: [UNCERTAIN] accuracy at {uncertain_stats.confirmation_rate:.0%} — possible mislabeling")
        # High disconfirmation is healthy for UNCERTAIN
        if uncertain_stats.confirmation_rate < 0.40:
            flags.append(f"NOTE: [UNCERTAIN] shows high disconfirmation ({uncertain_stats.confirmation_rate:.0%}) — this is healthy")
    
    return flags


def determine_overall_quality(by_label: Dict[str, LabelStats], flags: List[str]) -> str:
    """
    Determine overall calibration quality.
    
    Args:
        by_label: Dict of label_type -> LabelStats
        flags: List of warning flags
    
    Returns:
        'HIGH', 'MEDIUM', or 'LOW'
    """
    alert_count = sum(1 for f in flags if 'ALERT' in f)
    caution_count = sum(1 for f in flags if 'CAUTION' in f)
    
    if alert_count > 0:
        return 'LOW'
    elif caution_count > 2:
        return 'MEDIUM'
    elif caution_count > 0:
        return 'MEDIUM'
    else:
        return 'HIGH'


def generate_calibration_report(period_days: int = 90) -> CalibrationReport:
    """
    Generate a full calibration report.
    
    Args:
        period_days: Number of days to include in the report
    
    Returns:
        CalibrationReport object
    """
    resolutions = load_resolutions()
    
    # Filter by period
    now = datetime.utcnow()
    period_start = now - timedelta(days=period_days)
    
    filtered_resolutions = []
    for res in resolutions:
        try:
            res_date = datetime.fromisoformat(res.resolution_date.replace('Z', '+00:00').replace('+00:00', ''))
            if res_date >= period_start:
                filtered_resolutions.append(res)
        except:
            # Include if date parsing fails
            filtered_resolutions.append(res)
    
    # Calculate stats for each label type
    by_label = {}
    for label_type in ['KNOWN', 'INFERRED', 'UNCERTAIN', 'UNKNOWN']:
        stats = calculate_confirmation_rate(filtered_resolutions, label_type)
        
        # Calculate trend
        trend, trend_status = calculate_trend(resolutions, label_type)
        stats.trend = trend
        stats.trend_status = trend_status
        
        by_label[label_type] = stats
    
    # Generate flags
    flags = generate_flags(by_label)
    
    # Determine overall quality
    overall_quality = determine_overall_quality(by_label, flags)
    
    return CalibrationReport(
        period_days=period_days,
        total_resolutions=len(filtered_resolutions),
        by_label=by_label,
        flags=flags,
        overall_quality=overall_quality,
        generated_at=datetime.utcnow().isoformat() + 'Z'
    )


def format_calibration_report(report: CalibrationReport) -> str:
    """
    Format a calibration report for display.
    
    Args:
        report: CalibrationReport object
    
    Returns:
        Formatted string for display
    """
    lines = []
    lines.append("━" * 50)
    lines.append("CALIBRATION LEDGER — Label Accuracy Over Time")
    lines.append("━" * 50)
    lines.append("")
    lines.append(f"Time period: Last {report.period_days} days")
    lines.append(f"Data points: {report.total_resolutions} resolved claims")
    lines.append("")
    
    # Stats for each label type
    for label_type in ['KNOWN', 'INFERRED', 'UNCERTAIN', 'UNKNOWN']:
        stats = report.by_label.get(label_type)
        if not stats:
            continue
        
        if label_type == 'KNOWN':
            expected_text = ">95% confirmed"
        elif label_type == 'INFERRED':
            expected_text = "70–85% confirmed"
        elif label_type == 'UNCERTAIN':
            expected_text = "40–70% confirmed (high disconfirmation is healthy)"
        else:
            expected_text = "Not scored (remains open)"
        
        lines.append(f"[{label_type}] Claims — Expected: {expected_text}")
        
        if stats.total > 0:
            lines.append(f"  ✓ Confirmed: {stats.confirmed} ({stats.confirmation_rate:.0%})")
            lines.append(f"  ✗ Disconfirmed: {stats.disconfirmed} ({stats.disconfirmed / stats.total:.0%})")
            lines.append(f"  ⟳ Superseded: {stats.superseded} ({stats.superseded / stats.total:.0%})")
            lines.append(f"  Accuracy: {stats.confirmation_rate:.0%} [{stats.status}]")
            
            if stats.trend != 0.0:
                trend_dir = "Declining" if stats.trend < 0 else "Improving"
                lines.append(f"  Trend: {trend_dir} ({stats.trend:+.0%} from prior period)")
            else:
                lines.append(f"  Trend: Stable")
        else:
            lines.append(f"  No resolutions in this period")
        
        lines.append("")
    
    lines.append("━" * 50)
    lines.append("")
    lines.append(f"OVERALL CALIBRATION QUALITY: {report.overall_quality}")
    lines.append("")
    
    # Show flags
    if report.flags:
        lines.append("Observations:")
        for flag in report.flags:
            lines.append(f"  • {flag}")
        lines.append("")
    else:
        lines.append("No calibration concerns detected.")
        lines.append("")
    
    # Recommendations
    lines.append("Next steps:")
    if report.overall_quality == 'LOW':
        lines.append("  Run /aletheia audit to check for data issues.")
        lines.append("  Review recent [KNOWN] claims for patterns.")
    elif report.overall_quality == 'MEDIUM':
        lines.append("  Review label types showing CAUTION flags.")
        lines.append("  Consider resolving more claims for better signal.")
    else:
        lines.append("  Calibration looks healthy. Continue resolving claims.")
    
    lines.append("")
    lines.append("Use /aletheia queue to see unresolved claims.")
    
    return '\n'.join(lines)


def get_unresolved_count(ledger_claims: List[Dict], resolutions: List[Resolution]) -> Dict[str, int]:
    """
    Count unresolved claims by label type.
    
    Args:
        ledger_claims: List of all claims from ledger
        resolutions: List of all resolutions
    
    Returns:
        Dict mapping label_type to unresolved count
    """
    resolved_keys = {(r.session_uuid, r.claim_text) for r in resolutions}
    
    counts = {'KNOWN': 0, 'INFERRED': 0, 'UNCERTAIN': 0, 'UNKNOWN': 0}
    
    for claim in ledger_claims:
        key = (claim.get('session_uuid'), claim.get('claim_text'))
        if key not in resolved_keys:
            label = claim.get('label_type', 'UNKNOWN')
            if label in counts:
                counts[label] += 1
    
    return counts
