"""
Scribe System - Source Provenance & Citation Integrity

Traditional: record-keeper, scribe

Tracks where claims originated, validates citation integrity,
and monitors source reliability over time. Detects when sources
are retracted, corrected, or downgraded in reliability.

Modules:
- S1: source_capture.py - Source metadata capture at claim creation
- S2: reliability_scorer.py - Source reliability scoring engine
- S3: link_checker.py - Link rot and retraction detection
- S4: provenance_tracker.py - Source provenance tracking & alerts
"""

from .source_capture import SourceCapture
from .reliability_scorer import ReliabilityScorer
from .link_checker import LinkChecker
from .provenance_tracker import ProvenanceTracker

__version__ = "1.0.0"
__all__ = [
    "SourceCapture",
    "ReliabilityScorer",
    "LinkChecker",
    "ProvenanceTracker"
]
