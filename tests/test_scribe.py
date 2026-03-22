"""
Tests for the Scribe provenance tracking system.
"""
import pytest
from datetime import datetime, timezone
from unittest.mock import Mock
from systems.scribe.source_capture import SourceCapture, SourceMetadata
from systems.scribe.reliability_scorer import ReliabilityScorer, ReliabilityFactor


class TestSourceCapture:
    """Tests for SourceCapture."""

    def test_capture_source(self):
        """Test capturing a source with URL."""
        capture = SourceCapture(storage_path=None)
        
        result = capture.capture_source("https://example.com/article")
        assert result is not None

    def test_get_nonexistent_source(self):
        """Test retrieving a source that doesn't exist."""
        capture = SourceCapture(storage_path=None)
        
        retrieved = capture.get_source("https://nonexistent.com/article")
        assert retrieved is None


class TestSourceMetadata:
    """Tests for SourceMetadata dataclass."""

    def test_to_dict(self):
        """Test serialization to dictionary."""
        metadata = SourceMetadata(
            source_id="s1",
            url="https://example.com",
            url_normalized="https://example.com",
            source_type="news",
            domain="example.com",
            publication_date=None,
            capture_date=datetime.now(timezone.utc),
            title="Test",
            author="Author",
            reliability_score=0.8
        )
        
        d = metadata.to_dict()
        assert isinstance(d, dict)
        assert d["source_id"] == "s1"
        assert d["url"] == "https://example.com"

    def test_from_dict(self):
        """Test deserialization from dictionary."""
        data = {
            "source_id": "s1",
            "url": "https://example.com",
            "url_normalized": "https://example.com",
            "source_type": "news",
            "domain": "example.com",
            "publication_date": None,
            "capture_date": datetime.now(timezone.utc).isoformat(),
            "title": "Test",
            "author": "Author",
            "reliability_score": 0.8
        }
        
        metadata = SourceMetadata.from_dict(data)
        assert metadata.source_id == "s1"
        assert metadata.url == "https://example.com"


class TestReliabilityFactor:
    """Tests for ReliabilityFactor enum."""

    def test_reliability_factors_defined(self):
        """Test that all reliability factors are defined."""
        assert ReliabilityFactor.SOURCE_TYPE is not None
        assert ReliabilityFactor.DOMAIN_REP is not None
        assert ReliabilityFactor.RETRACTION is not None
        assert ReliabilityFactor.CORRECTION is not None
        assert ReliabilityFactor.ACCURACY_TRACK is not None
        assert ReliabilityFactor.CONSENSUS is not None
        assert ReliabilityFactor.AGE is not None
