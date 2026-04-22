"""
Tests for the Chronos temporal reasoning and drift detection system.
"""
import pytest
from datetime import datetime, timezone, timedelta
from skills.chronos.temporal_index import TemporalIndex, ClaimRecord
from skills.chronos.drift_detection import DriftDetector, DriftType


class TestTemporalIndex:
    """Tests for TemporalIndex."""

    def test_index_claim(self):
        """Test indexing a claim in the temporal index."""
        index = TemporalIndex()
        
        # Use the actual API: index_claim(text, session_id, janus_label, confidence)
        claim_id = index.index_claim(
            text="The sky is blue",
            session_id="s1",
            janus_label="[KNOWN]",
            confidence=0.9
        )
        assert claim_id is not None
        assert len(claim_id) > 0

    def test_get_claim(self):
        """Test retrieving a claim by ID."""
        index = TemporalIndex()
        
        claim_id = index.index_claim(
            text="The sky is blue",
            session_id="s1",
            janus_label="[KNOWN]",
            confidence=0.9
        )
        
        retrieved = index.get_claim(claim_id)
        assert retrieved is not None
        assert retrieved.text == "The sky is blue"

    def test_get_recent_claims(self):
        """Test getting the most recent claims."""
        index = TemporalIndex()
        
        for i in range(5):
            index.index_claim(
                text=f"Claim {i}",
                session_id="s1",
                janus_label="[KNOWN]",
                confidence=0.8
            )
        
        recent = index.get_recent_claims(limit=3)
        assert len(recent) == 3

    def test_delete_claim(self):
        """Test deleting a claim."""
        index = TemporalIndex()
        
        claim_id = index.index_claim(
            text="Test claim",
            session_id="s1",
            janus_label="[KNOWN]",
            confidence=0.9
        )
        
        deleted = index.delete_claim(claim_id)
        assert deleted is True
        
        retrieved = index.get_claim(claim_id)
        assert retrieved is None

    def test_get_statistics(self):
        """Test getting index statistics."""
        index = TemporalIndex()
        
        index.index_claim(
            text="Test claim",
            session_id="s1",
            janus_label="[KNOWN]",
            confidence=0.9
        )
        
        stats = index.get_statistics()
        assert isinstance(stats, dict)
        assert "total_claims" in stats

    def test_get_claims_by_label(self):
        """Test retrieving claims by Janus label."""
        index = TemporalIndex()
        
        index.index_claim(text="Known claim", session_id="s1", janus_label="[KNOWN]", confidence=0.9)
        index.index_claim(text="Unknown claim", session_id="s2", janus_label="[UNKNOWN]", confidence=0.5)
        
        known_claims = index.get_claims_by_label("[KNOWN]")
        unknown_claims = index.get_claims_by_label("[UNKNOWN]")
        
        assert len(known_claims) >= 1
        assert len(unknown_claims) >= 1


class TestDriftDetector:
    """Tests for DriftDetector.
    
    Note: DriftDetector.detect_drift takes claim_id strings, not ClaimRecord objects.
    This is a documented API issue in the codebase.
    """

    def test_drift_detector_initialization(self):
        """Test that DriftDetector can be initialized with a TemporalIndex."""
        index = TemporalIndex()
        detector = DriftDetector(index)
        assert detector is not None

    def test_drift_types_exist(self):
        """Test that all drift types are defined."""
        assert DriftType.CONTRADICTION is not None
        assert DriftType.CONFIDENCE_SHIFT is not None
        assert DriftType.LABEL_CHANGE is not None
        assert DriftType.REFINEMENT is not None
        assert DriftType.RETRACTION is not None
