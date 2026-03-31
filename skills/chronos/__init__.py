"""
Chronos System - Temporal Coherence Tracking

Greek: χρόνος (chronos) - "time"

Tracks epistemic claims across sessions and detects epistemic drift -
when claims shift, contradict prior claims, or are revised without
explicit flagging.

Modules:
- C1: temporal_index.py - Claim indexing by session timestamp
- C2: drift_detection.py - Semantic contradiction detection across time
- C3: contradiction_resolution.py - Resolution strategies for temporal conflicts
- C4: timeline_viz.py - Epistemic timeline visualization
"""

from .temporal_index import TemporalIndex
from .drift_detection import DriftDetector
from .contradiction_resolution import ResolutionEngine
from .timeline_viz import TimelineVisualizer

__version__ = "1.0.0"
__all__ = [
    "TemporalIndex",
    "DriftDetector", 
    "ResolutionEngine",
    "TimelineVisualizer"
]
