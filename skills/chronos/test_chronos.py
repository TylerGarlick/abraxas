"""
Unit tests for Chronos System - Temporal Coherence Tracking

Tests cover:
- Temporal indexing (L1)
- Drift detection (L2)
- Contradiction resolution (L3)
- Timeline visualization (L4)
"""

import pytest
import os
import shutil
from datetime import datetime, timezone, timedelta

from chronos.temporal_index import TemporalIndex, ClaimRecord
from chronos.drift_detection import DriftDetector, DriftType
from chronos.contradiction_resolution import ResolutionEngine, ResolutionStrategy
from chronos.timeline_viz import TimelineVisualizer


@pytest.fixture
def temp_storage():
    """Create temporary storage directory for tests."""
    storage_path = "/tmp/test_chronos"
    os.makedirs(storage_path, exist_ok=True)
    yield storage_path
    shutil.rmtree(storage_path, ignore_errors=True)


@pytest.fixture
def temporal_index(temp_storage):
    """Create TemporalIndex with test storage."""
    return TemporalIndex(storage_path=temp_storage)


@pytest.fixture
def sample_claims(temporal_index):
    """Create sample claims for testing."""
    claim1_id = temporal_index.index_claim(
        text="The sky is blue",
        session_id="session_001",
        janus_label="KNOWN",
        confidence=0.9,
        sources=["https://example.com/sky"]
    )
    
    claim2_id = temporal_index.index_claim(
        text="The sky appears blue due to Rayleigh scattering",
        session_id="session_002",
        janus_label="KNOWN",
        confidence=0.85,
        sources=["https://example.com/physics"]
    )
    
    # Create a contradictory claim (after a short delay)
    import time
    time.sleep(0.1)
    claim3_id = temporal_index.index_claim(
        text="The sky is not always blue; it can be gray or dark",
        session_id="session_003",
        janus_label="INFERRED",
        confidence=0.75,
        sources=[]
    )
    
    return claim1_id, claim2_id, claim3_id


class TestTemporalIndex:
    """Tests for L1: Temporal Index Engine."""
    
    def test_index_claim(self, temporal_index):
        """Test basic claim indexing."""
        claim_id = temporal_index.index_claim(
            text="Test claim",
            session_id="test_session",
            janus_label="KNOWN",
            confidence=0.8
        )
        
        assert claim_id is not None
        assert len(claim_id) == 16  # SHA256 hex[:16]
        
        claim = temporal_index.get_claim(claim_id)
        assert claim is not None
        assert claim.text == "Test claim"
        assert claim.session_id == "test_session"
        assert claim.janus_label == "KNOWN"
        assert claim.confidence == 0.8
    
    def test_get_claims_by_session(self, temporal_index, sample_claims):
        """Test retrieving claims by session."""
        claims = temporal_index.get_claims_by_session("session_001")
        assert len(claims) == 1
        assert claims[0].text == "The sky is blue"
    
    def test_get_claims_by_label(self, temporal_index, sample_claims):
        """Test filtering claims by Janus label."""
        known_claims = temporal_index.get_claims_by_label("KNOWN")
        inferred_claims = temporal_index.get_claims_by_label("INFERRED")
        
        assert len(known_claims) == 2
        assert len(inferred_claims) == 1
    
    def test_get_claims_by_time_range(self, temporal_index, sample_claims):
        """Test time-range queries."""
        now = datetime.now(timezone.utc)
        start = now - timedelta(hours=1)
        end = now + timedelta(hours=1)
        
        claims = temporal_index.get_claims_by_time_range(start, end)
        assert len(claims) == 3
    
    def test_delete_claim(self, temporal_index):
        """Test claim deletion."""
        claim_id = temporal_index.index_claim(
            text="To be deleted",
            session_id="test",
            janus_label="UNKNOWN",
            confidence=0.5
        )
        
        result = temporal_index.delete_claim(claim_id)
        assert result is True
        
        claim = temporal_index.get_claim(claim_id)
        assert claim is None
    
    def test_persistence(self, temporal_index, temp_storage):
        """Test index persistence to disk."""
        claim_id = temporal_index.index_claim(
            text="Persistent claim",
            session_id="test",
            janus_label="KNOWN",
            confidence=0.9
        )
        
        # Verify file was created
        index_file = os.path.join(temp_storage, "temporal_index.json")
        assert os.path.exists(index_file)
        
        # Create new index and load from disk
        new_index = TemporalIndex(storage_path=temp_storage)
        loaded_claim = new_index.get_claim(claim_id)
        
        assert loaded_claim is not None
        assert loaded_claim.text == "Persistent claim"
    
    def test_statistics(self, temporal_index, sample_claims):
        """Test index statistics."""
        stats = temporal_index.get_statistics()
        
        assert stats["total_claims"] == 3
        assert stats["total_sessions"] == 3
        assert stats["labels"]["KNOWN"] == 2
        assert stats["labels"]["INFERRED"] == 1


class TestDriftDetection:
    """Tests for L2: Drift Detection Engine."""
    
    def test_detect_confidence_shift(self, temporal_index, sample_claims):
        """Test confidence drift detection."""
        detector = DriftDetector(temporal_index)
        
        # Get first and third claims (different confidence)
        claim1 = temporal_index.get_claim(sample_claims[0])
        claim3 = temporal_index.get_claim(sample_claims[2])
        
        # Manually create a drift scenario
        is_shift, desc = detector._detect_confidence_shift(claim1, claim3)
        assert is_shift is True
        assert "decreased" in desc.lower()
    
    def test_detect_label_change(self, temporal_index, sample_claims):
        """Test label change detection."""
        detector = DriftDetector(temporal_index)
        
        claim1 = temporal_index.get_claim(sample_claims[0])  # KNOWN
        claim3 = temporal_index.get_claim(sample_claims[2])  # INFERRED
        
        is_changed, desc = detector._detect_label_change(claim1, claim3)
        assert is_changed is True
        assert "KNOWN" in desc
        assert "INFERRED" in desc
    
    def test_detect_contradiction(self, temporal_index):
        """Test contradiction pattern detection."""
        detector = DriftDetector(temporal_index)
        
        # Create contradictory claims
        old_claim = ClaimRecord(
            claim_id="old",
            text="The experiment was successful",
            session_id="s1",
            timestamp=datetime.now(timezone.utc) - timedelta(hours=1),
            janus_label="KNOWN",
            confidence=0.9
        )
        
        new_claim = ClaimRecord(
            claim_id="new",
            text="However, the experiment was not successful",
            session_id="s2",
            timestamp=datetime.now(timezone.utc),
            janus_label="INFERRED",
            confidence=0.7
        )
        
        temporal_index.claims["old"] = old_claim
        temporal_index.claims["new"] = new_claim
        
        is_contradiction, desc = detector._detect_contradiction(old_claim, new_claim)
        assert is_contradiction is True
    
    def test_detect_drift(self, temporal_index, sample_claims):
        """Test full drift detection."""
        detector = DriftDetector(temporal_index)
        
        drifts = detector.detect_drift(sample_claims[2])  # Third claim
        assert len(drifts) > 0
        
        # Should detect label change at minimum
        drift_types = [d.drift_type for d in drifts]
        assert DriftType.LABEL_CHANGE in drift_types or DriftType.CONTRADICTION in drift_types
    
    def test_get_critical_drifts(self, temporal_index, sample_claims):
        """Test filtering critical drifts."""
        detector = DriftDetector(temporal_index)
        detector.detect_drift(sample_claims[2])
        
        critical = detector.get_critical_drifts()
        assert isinstance(critical, list)


class TestResolutionEngine:
    """Tests for L3: Contradiction Resolution Engine."""
    
    def test_resolve_by_recency(self, temporal_index, sample_claims):
        """Test recency-based resolution."""
        detector = DriftDetector(temporal_index)
        drifts = detector.detect_drift(sample_claims[2])
        
        if not drifts:
            pytest.skip("No drifts detected")
        
        resolver = ResolutionEngine(temporal_index)
        result = resolver.resolve(drifts[0], ResolutionStrategy.RECENCY)
        
        assert result.strategy == ResolutionStrategy.RECENCY
        assert "newer" in result.action_taken.lower()
    
    def test_resolve_by_confidence(self, temporal_index, sample_claims):
        """Test confidence-based resolution."""
        detector = DriftDetector(temporal_index)
        drifts = detector.detect_drift(sample_claims[2])
        
        if not drifts:
            pytest.skip("No drifts detected")
        
        resolver = ResolutionEngine(temporal_index)
        result = resolver.resolve(drifts[0], ResolutionStrategy.CONFIDENCE)
        
        assert result.strategy == ResolutionStrategy.CONFIDENCE
        assert "confidence" in result.action_taken.lower()
    
    def test_resolve_by_sources(self, temporal_index, sample_claims):
        """Test source-based resolution."""
        detector = DriftDetector(temporal_index)
        drifts = detector.detect_drift(sample_claims[2])
        
        if not drifts:
            pytest.skip("No drifts detected")
        
        resolver = ResolutionEngine(temporal_index)
        result = resolver.resolve(drifts[0], ResolutionStrategy.SOURCE_STRENGTH)
        
        assert result.strategy == ResolutionStrategy.SOURCE_STRENGTH
        assert "source" in result.action_taken.lower()
    
    def test_resolve_merge(self, temporal_index, sample_claims):
        """Test merge resolution."""
        detector = DriftDetector(temporal_index)
        drifts = detector.detect_drift(sample_claims[2])
        
        if not drifts:
            pytest.skip("No drifts detected")
        
        resolver = ResolutionEngine(temporal_index)
        result = resolver.resolve(drifts[0], ResolutionStrategy.MERGE)
        
        assert result.strategy == ResolutionStrategy.MERGE
        assert "merged" in result.action_taken.lower()
        assert result.metadata.get("merged_claim_id") is not None
    
    def test_resolve_manual(self, temporal_index, sample_claims):
        """Test manual resolution flagging."""
        detector = DriftDetector(temporal_index)
        drifts = detector.detect_drift(sample_claims[2])
        
        if not drifts:
            pytest.skip("No drifts detected")
        
        resolver = ResolutionEngine(temporal_index)
        result = resolver.resolve(drifts[0], ResolutionStrategy.MANUAL)
        
        assert result.strategy == ResolutionStrategy.MANUAL
        assert result.metadata.get("requires_user_input") is True
    
    def test_reconcile_labels(self, temporal_index):
        """Test label reconciliation logic."""
        resolver = ResolutionEngine(temporal_index)
        
        claim1 = ClaimRecord(
            claim_id="c1",
            text="Test",
            session_id="s1",
            timestamp=datetime.now(timezone.utc),
            janus_label="KNOWN",
            confidence=0.9
        )
        
        claim2 = ClaimRecord(
            claim_id="c2",
            text="Test",
            session_id="s2",
            timestamp=datetime.now(timezone.utc),
            janus_label="INFERRED",
            confidence=0.8
        )
        
        reconciled = resolver._reconcile_labels(claim1, claim2)
        assert reconciled == "KNOWN"  # Higher priority


class TestTimelineVisualizer:
    """Tests for L4: Timeline Visualization Engine."""
    
    def test_generate_ascii_timeline(self, temporal_index, sample_claims):
        """Test ASCII timeline generation."""
        detector = DriftDetector(temporal_index)
        detector.detect_drift(sample_claims[2])
        
        resolver = ResolutionEngine(temporal_index)
        drifts = detector.get_all_drifts()
        for drift in drifts:
            resolver.resolve(drift)
        
        viz = TimelineVisualizer(temporal_index, drifts, resolver.get_all_resolutions())
        timeline = viz.generate_ascii_timeline(limit=20)
        
        assert "EPISTEMIC TIMELINE" in timeline
        assert "Chronos" in timeline
        assert len(timeline) > 100
    
    def test_generate_html_timeline(self, temporal_index, sample_claims):
        """Test HTML timeline generation."""
        detector = DriftDetector(temporal_index)
        detector.detect_drift(sample_claims[2])
        
        viz = TimelineVisualizer(temporal_index, detector.get_all_drifts())
        html = viz.generate_html_timeline()
        
        assert "<!DOCTYPE html>" in html
        assert "timeline" in html.lower()
        assert "event" in html.lower()
    
    def test_claim_evolution(self, temporal_index, sample_claims):
        """Test claim evolution tracing."""
        detector = DriftDetector(temporal_index)
        detector.detect_drift(sample_claims[2])
        
        viz = TimelineVisualizer(temporal_index, detector.get_all_drifts())
        evolution = viz.generate_claim_evolution(sample_claims[2])
        
        assert len(evolution) > 0
        assert evolution[0]["event"] == "created"
    
    def test_export_timeline_json(self, temporal_index, temp_storage, sample_claims):
        """Test JSON export."""
        output_path = os.path.join(temp_storage, "timeline.json")
        
        viz = TimelineVisualizer(temporal_index)
        viz.export_timeline(output_path, format="json")
        
        assert os.path.exists(output_path)
        
        import json
        with open(output_path, "r") as f:
            data = json.load(f)
        assert isinstance(data, list)
    
    def test_statistics(self, temporal_index, sample_claims):
        """Test timeline statistics."""
        viz = TimelineVisualizer(temporal_index)
        stats = viz.get_statistics()
        
        assert stats["total_events"] == 3  # 3 claims
        assert stats["claims"] == 3
        assert stats["drifts"] == 0  # No drifts computed yet


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
