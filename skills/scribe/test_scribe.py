"""
Unit tests for Scribe System - Source Provenance & Citation Integrity

Tests cover:
- Source capture (S1)
- Reliability scoring (S2)
- Link checking (S3)
- Provenance tracking (S4)
"""

import pytest
import os
import shutil
from datetime import datetime, timezone, timedelta

from scribe.source_capture import SourceCapture, SourceMetadata
from scribe.reliability_scorer import ReliabilityScorer, ReliabilityFactor
from scribe.link_checker import LinkChecker, LinkStatus
from scribe.provenance_tracker import ProvenanceTracker, AlertType


@pytest.fixture
def temp_storage():
    """Create temporary storage directory for tests."""
    storage_path = "/tmp/test_scribe"
    os.makedirs(storage_path, exist_ok=True)
    yield storage_path
    shutil.rmtree(storage_path, ignore_errors=True)


@pytest.fixture
def source_capture(temp_storage):
    """Create SourceCapture with test storage."""
    return SourceCapture(storage_path=temp_storage)


@pytest.fixture
def sample_sources(source_capture):
    """Create sample sources for testing."""
    source1_id = source_capture.capture_source(
        url="https://arxiv.org/abs/2026.12345",
        title="Test Paper",
        author="John Doe"
    )
    
    source2_id = source_capture.capture_source(
        url="https://www.nytimes.com/2026/03/19/test-article",
        title="News Article"
    )
    
    source3_id = source_capture.capture_source(
        url="https://example.gov/official-report",
        title="Government Report"
    )
    
    return source1_id, source2_id, source3_id


class TestSourceCapture:
    """Tests for S1: Source Capture Engine."""
    
    def test_capture_source(self, source_capture):
        """Test basic source capture."""
        source_id = source_capture.capture_source(
            url="https://example.com/test",
            title="Test Page"
        )
        
        assert source_id is not None
        assert len(source_id) == 16
        
        source = source_capture.get_source(source_id)
        assert source is not None
        assert source.title == "Test Page"
        assert source.source_type == "unknown"
    
    def test_url_normalization(self, source_capture):
        """Test URL normalization."""
        url1 = "https://Example.com/Test?utm_source=google&gclid=abc123"
        url2 = "https://example.com/test"
        
        id1 = source_capture.capture_source(url1)
        id2 = source_capture.capture_source(url2)
        
        # Should be deduplicated
        assert id1 == id2
    
    def test_source_type_classification(self, source_capture):
        """Test source type classification."""
        academic_url = "https://arxiv.org/abs/test"
        gov_url = "https://example.gov/report"
        news_url = "https://reuters.com/article"
        social_url = "https://twitter.com/user"
        
        academic = source_capture.capture_source(academic_url)
        gov = source_capture.capture_source(gov_url)
        news = source_capture.capture_source(news_url)
        social = source_capture.capture_source(social_url)
        
        assert source_capture.get_source(academic).source_type == "academic"
        assert source_capture.get_source(gov).source_type == "official"
        assert source_capture.get_source(news).source_type == "news"
        assert source_capture.get_source(social).source_type == "social"
    
    def test_reliability_scoring(self, source_capture):
        """Test initial reliability scoring."""
        academic = source_capture.capture_source("https://arxiv.org/abs/test")
        social = source_capture.capture_source("https://twitter.com/user")
        
        assert source_capture.get_source(academic).reliability_score > 0.8
        assert source_capture.get_source(social).reliability_score < 0.5
    
    def test_get_sources_by_type(self, source_capture, sample_sources):
        """Test filtering sources by type."""
        academic = source_capture.get_sources_by_type("academic")
        assert len(academic) == 1
        assert academic[0].source_type == "academic"
    
    def test_update_reliability(self, source_capture, sample_sources):
        """Test reliability score updates."""
        source_id = sample_sources[0]
        
        result = source_capture.update_source_reliability(source_id, 0.5)
        assert result is True
        
        source = source_capture.get_source(source_id)
        assert source.reliability_score == 0.5
    
    def test_persistence(self, source_capture, temp_storage):
        """Test source persistence to disk."""
        source_id = source_capture.capture_source("https://example.com/test")
        
        # Verify file was created
        sources_file = os.path.join(temp_storage, "sources.json")
        assert os.path.exists(sources_file)
        
        # Create new capture and load from disk
        new_capture = SourceCapture(storage_path=temp_storage)
        loaded_source = new_capture.get_source(source_id)
        
        assert loaded_source is not None
        assert loaded_source.url == "https://example.com/test"
    
    def test_statistics(self, source_capture, sample_sources):
        """Test source statistics."""
        stats = source_capture.get_statistics()
        
        assert stats["total_sources"] == 3
        assert stats["by_type"]["academic"] == 1
        assert stats["by_type"]["news"] == 1
        assert stats["by_type"]["official"] == 1


class TestReliabilityScorer:
    """Tests for S2: Reliability Scorer Engine."""
    
    def test_record_accuracy(self, source_capture, sample_sources):
        """Test accuracy recording."""
        scorer = ReliabilityScorer(source_capture)
        
        scorer.record_accuracy(sample_sources[0], True, "claim_001")
        scorer.record_accuracy(sample_sources[0], False, "claim_002")
        
        info = scorer.get_source_reliability(sample_sources[0])
        assert info["track_record"]["total"] == 2
        assert info["track_record"]["accurate"] == 1
        assert info["accuracy_rate"] == 0.5
    
    def test_apply_retraction_penalty(self, source_capture, sample_sources):
        """Test retraction penalty application."""
        scorer = ReliabilityScorer(source_capture)
        
        old_score = source_capture.get_source(sample_sources[0]).reliability_score
        
        update = scorer.apply_retraction_penalty(
            sample_sources[0],
            "Data fabrication"
        )
        
        assert update.factor == ReliabilityFactor.RETRACTION
        assert update.new_score < old_score
        assert update.new_score >= 0.0
    
    def test_apply_correction_penalty(self, source_capture, sample_sources):
        """Test correction penalty application."""
        scorer = ReliabilityScorer(source_capture)
        
        old_score = source_capture.get_source(sample_sources[0]).reliability_score
        
        update = scorer.apply_correction_penalty(
            sample_sources[0],
            "Minor factual error"
        )
        
        assert update.factor == ReliabilityFactor.CORRECTION
        assert update.new_score < old_score
    
    def test_apply_consensus_bonus(self, source_capture, sample_sources):
        """Test consensus bonus application."""
        scorer = ReliabilityScorer(source_capture)
        
        old_score = source_capture.get_source(sample_sources[0]).reliability_score
        
        update = scorer.apply_consensus_bonus(
            sample_sources[0],
            [sample_sources[1]],
            "Test topic"
        )
        
        assert update.factor == ReliabilityFactor.CONSENSUS
        assert update.new_score > old_score
    
    def test_calculate_track_record_score(self, source_capture, sample_sources):
        """Test track record score calculation."""
        scorer = ReliabilityScorer(source_capture)
        
        # Record multiple accuracy outcomes
        for i in range(5):
            scorer.record_accuracy(sample_sources[0], i % 2 == 0)
        
        score = scorer.calculate_track_record_score(sample_sources[0])
        assert score is not None
        assert 0.0 <= score <= 1.0
    
    def test_get_low_reliability_sources(self, source_capture, sample_sources):
        """Test filtering low reliability sources."""
        scorer = ReliabilityScorer(source_capture)
        
        # Artificially lower one source
        source_capture.update_source_reliability(sample_sources[0], 0.3)
        
        low = scorer.get_low_reliability_sources(threshold=0.5)
        assert len(low) == 1
        assert low[0]["current_score"] == 0.3


class TestLinkChecker:
    """Tests for S3: Link Checker Engine."""
    
    @pytest.mark.asyncio
    async def test_check_link_active(self, source_capture, sample_sources):
        """Test checking an active link."""
        checker = LinkChecker(source_capture)
        
        # Test with a known working URL
        result = await checker.check_link(sample_sources[0])
        
        assert result.source_id == sample_sources[0]
        assert result.check_timestamp is not None
        assert result.response_time_ms >= 0
    
    def test_classify_status(self, source_capture):
        """Test status classification logic."""
        checker = LinkChecker(source_capture)
        
        assert checker._classify_status(200, "content") == LinkStatus.ACTIVE
        assert checker._classify_status(404, "") == LinkStatus.NOT_FOUND
        assert checker._classify_status(500, "") == LinkStatus.SERVER_ERROR
        assert checker._classify_status(301, "") == LinkStatus.REDIRECTED
        assert checker._classify_status(None, "") == LinkStatus.TIMEOUT
    
    def test_detect_retraction(self, source_capture):
        """Test retraction detection."""
        checker = LinkChecker(source_capture)
        
        retracted_content = "This paper has been retracted due to errors"
        normal_content = "This is a normal paper"
        
        assert checker._detect_retraction(retracted_content) is True
        assert checker._detect_retraction(normal_content) is False
    
    def test_detect_correction(self, source_capture):
        """Test correction detection."""
        checker = LinkChecker(source_capture)
        
        corrected_content = "This article has been corrected"
        normal_content = "This is a normal article"
        
        assert checker._detect_correction(corrected_content) is True
        assert checker._detect_correction(normal_content) is False
    
    def test_schedule_next_check(self, source_capture, sample_sources):
        """Test check scheduling logic."""
        checker = LinkChecker(source_capture)
        
        # Active source should be scheduled for 30 days
        checker._schedule_next_check(sample_sources[0], LinkStatus.ACTIVE)
        next_check = checker.scheduled_checks[sample_sources[0]]
        
        assert next_check > datetime.now(timezone.utc)
        assert (next_check - datetime.now(timezone.utc)).days >= 29
    
    def test_get_due_checks(self, source_capture, sample_sources):
        """Test getting due checks."""
        checker = LinkChecker(source_capture)
        
        # Manually schedule a past check
        checker.scheduled_checks[sample_sources[0]] = datetime.now(timezone.utc) - timedelta(days=1)
        
        due = checker.get_due_checks()
        assert sample_sources[0] in due
    
    def test_statistics(self, source_capture, sample_sources):
        """Test link checker statistics."""
        checker = LinkChecker(source_capture)
        
        stats = checker.get_statistics()
        assert "total_checks" in stats
        assert "sources_monitored" in stats


class TestProvenanceTracker:
    """Tests for S4: Provenance Tracker Engine."""
    
    def test_register_claim_sources(self, source_capture, sample_sources):
        """Test registering claim sources."""
        scorer = ReliabilityScorer(source_capture)
        checker = LinkChecker(source_capture)
        tracker = ProvenanceTracker(source_capture, scorer, checker)
        
        chain = tracker.register_claim_sources(
            claim_id="test_claim",
            source_ids=[sample_sources[0], sample_sources[1]]
        )
        
        assert chain.claim_id == "test_claim"
        assert len(chain.source_ids) == 2
        assert chain.depth == 1
    
    def test_get_affected_claims(self, source_capture, sample_sources):
        """Test getting affected claims."""
        scorer = ReliabilityScorer(source_capture)
        checker = LinkChecker(source_capture)
        tracker = ProvenanceTracker(source_capture, scorer, checker)
        
        tracker.register_claim_sources("claim_001", [sample_sources[0]])
        tracker.register_claim_sources("claim_002", [sample_sources[0]])
        
        affected = tracker.get_affected_claims(sample_sources[0])
        assert "claim_001" in affected
        assert "claim_002" in affected
    
    def test_get_claim_provenance(self, source_capture, sample_sources):
        """Test getting claim provenance."""
        scorer = ReliabilityScorer(source_capture)
        checker = LinkChecker(source_capture)
        tracker = ProvenanceTracker(source_capture, scorer, checker)
        
        tracker.register_claim_sources("test_claim", [sample_sources[0]])
        
        provenance = tracker.get_claim_provenance("test_claim")
        
        assert provenance["claim_id"] == "test_claim"
        assert len(provenance["sources"]) == 1
    
    def test_alert_callback(self, source_capture, sample_sources):
        """Test alert callback registration."""
        scorer = ReliabilityScorer(source_capture)
        checker = LinkChecker(source_capture)
        tracker = ProvenanceTracker(source_capture, scorer, checker)
        
        alerts_received = []
        
        def callback(alert):
            alerts_received.append(alert)
        
        tracker.register_alert_callback(callback)
        
        # Manually create an alert
        from scribe.provenance_tracker import ProvenanceAlert
        
        alert = ProvenanceAlert(
            alert_id="test_alert",
            alert_type=AlertType.RETRACTION,
            source_id=sample_sources[0],
            severity="critical",
            message="Test retraction",
            timestamp=datetime.now(timezone.utc)
        )
        
        tracker.alerts[alert.alert_id] = alert
        tracker._emit_alert(alert)
        
        assert len(alerts_received) == 1
        assert alerts_received[0].alert_id == "test_alert"
    
    def test_acknowledge_alert(self, source_capture, sample_sources):
        """Test alert acknowledgment."""
        scorer = ReliabilityScorer(source_capture)
        checker = LinkChecker(source_capture)
        tracker = ProvenanceTracker(source_capture, scorer, checker)
        
        from scribe.provenance_tracker import ProvenanceAlert
        
        alert = ProvenanceAlert(
            alert_id="test_alert",
            alert_type=AlertType.CORRECTION,
            source_id=sample_sources[0],
            severity="medium",
            message="Test correction",
            timestamp=datetime.now(timezone.utc)
        )
        
        tracker.alerts[alert.alert_id] = alert
        
        result = tracker.acknowledge_alert("test_alert")
        assert result is True
        
        acknowledged_alert = tracker.alerts["test_alert"]
        assert acknowledged_alert.metadata.get("acknowledged") is True
    
    def test_statistics(self, source_capture, sample_sources):
        """Test provenance tracker statistics."""
        scorer = ReliabilityScorer(source_capture)
        checker = LinkChecker(source_capture)
        tracker = ProvenanceTracker(source_capture, scorer, checker)
        
        tracker.register_claim_sources("test_claim", [sample_sources[0]])
        
        stats = tracker.get_statistics()
        
        assert stats["total_chains"] == 1
        assert stats["tracked_claims"] == 1
        assert stats["tracked_sources"] == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
