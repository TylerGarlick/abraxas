"""
Aletheia - Epistemic Calibration and Resolution System

This package provides the core infrastructure for tracking
epistemic calibration and ground-truth feedback.
"""

__version__ = "1.0.0"

from .aletheia import confirm, disconfirm, supersede, status, calibration, queue, audit
from .storage import Resolution, load_resolutions, save_resolution
from .resolver import find_claim, fuzzy_search, validate_sol_label
from .calibration import generate_calibration_report, format_calibration_report

__all__ = [
    'confirm', 'disconfirm', 'supersede', 'status', 'calibration', 'queue', 'audit',
    'Resolution', 'load_resolutions', 'save_resolution',
    'find_claim', 'fuzzy_search', 'validate_sol_label',
    'generate_calibration_report', 'format_calibration_report',
]
