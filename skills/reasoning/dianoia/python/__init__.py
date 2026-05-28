"""
Dianoia - Uncertainty Quantification System
Core logic module for probability calibration, uncertainty bounds,
and distribution analysis.
"""

from .calibration import ProbabilityCalibrationModule
from .uncertainty_bounds import UncertaintyBoundsCalculator
from .distribution_analyzer import DistributionAnalyzer
from .aletheia_integration import AletheiaCalibrationTracker

__all__ = [
    'ProbabilityCalibrationModule',
    'UncertaintyBoundsCalculator',
    'DistributionAnalyzer',
    'AletheiaCalibrationTracker',
]

__version__ = '3.0.0'
