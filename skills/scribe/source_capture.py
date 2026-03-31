"""
Scribe S1: Source Capture Engine

Captures source metadata at claim creation time including URL,
publication date, source type, and initial reliability assessment.

Features:
- Source metadata extraction
- URL normalization
- Source type classification
- Initial reliability scoring
"""

import re
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from urllib.parse import urlparse
import json
import os


@dataclass
class SourceMetadata:
    """Metadata for a single source."""
    source_id: str
    url: str
    url_normalized: str
    source_type: str  # "academic", "news", "blog", "social", "official", "unknown"
    domain: str
    publication_date: Optional[datetime]
    capture_date: datetime
    title: Optional[str]
    author: Optional[str]
    reliability_score: float  # 0-1, initial assessment
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "source_id": self.source_id,
            "url": self.url,
            "url_normalized": self.url_normalized,
            "source_type": self.source_type,
            "domain": self.domain,
            "publication_date": self.publication_date.isoformat() if self.publication_date else None,
            "capture_date": self.capture_date.isoformat(),
            "title": self.title,
            "author": self.author,
            "reliability_score": self.reliability_score,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "SourceMetadata":
        """Deserialize from dictionary."""
        pub_date = None
        if data.get("publication_date"):
            pub_date = datetime.fromisoformat(data["publication_date"])
        
        capture_date = datetime.fromisoformat(data["capture_date"])
        
        return cls(
            source_id=data["source_id"],
            url=data["url"],
            url_normalized=data["url_normalized"],
            source_type=data["source_type"],
            domain=data["domain"],
            publication_date=pub_date,
            capture_date=capture_date,
            title=data.get("title"),
            author=data.get("author"),
            reliability_score=data["reliability_score"],
            metadata=data.get("metadata", {})
        )


class SourceCapture:
    """
    Source metadata capture engine.
    
    Captures and normalizes source information at claim creation,
    providing the foundation for provenance tracking.
    """
    
    # Domain patterns for source type classification
    SOURCE_TYPE_PATTERNS = {
        "academic": [
            r"\.edu$", r"\.ac\.", r"arxiv\.org", r"doi\.org",
            r"pubmed", r"scholar\.google", r"researchgate"
        ],
        "official": [
            r"\.gov$", r"\.gov\.", r"\.mil$", r"who\.int",
            r"un\.org", r"europa\.eu"
        ],
        "news": [
            r"reuters\.com", r"apnews\.com", r"bbc\.", r"cnn\.com",
            r"nytimes\.com", r"washingtonpost\.com", r"theguardian"
        ],
        "social": [
            r"twitter\.com", r"x\.com", r"facebook\.com", r"reddit\.com",
            r"tiktok\.com", r"instagram\.com"
        ],
        "blog": [
            r"medium\.com", r"substack\.com", r"wordpress\.com",
            r"blogspot", r"ghost\.org"
        ]
    }
    
    # Base reliability scores by source type
    BASE_RELIABILITY = {
        "academic": 0.85,
        "official": 0.90,
        "news": 0.75,
        "blog": 0.50,
        "social": 0.30,
        "unknown": 0.50
    }
    
    def __init__(self, storage_path: Optional[str] = None):
        """
        Initialize source capture engine.
        
        Args:
            storage_path: Path to persist source data (default: ~/.abraxas/scribe/)
        """
        self.storage_path = storage_path or os.path.expanduser("~/.abraxas/scribe")
        self.sources: Dict[str, SourceMetadata] = {}
        self.url_to_source: Dict[str, str] = {}  # normalized URL -> source_id
        
        os.makedirs(self.storage_path, exist_ok=True)
        self._load_sources()
    
    def _generate_source_id(self, url: str) -> str:
        """Generate unique source ID from URL."""
        return hashlib.sha256(url.encode()).hexdigest()[:16]
    
    def _normalize_url(self, url: str) -> str:
        """
        Normalize URL for consistent tracking.
        
        Removes tracking parameters, normalizes scheme, etc.
        """
        try:
            parsed = urlparse(url)
            
            # Normalize scheme
            scheme = parsed.scheme.lower() if parsed.scheme else "https"
            
            # Normalize domain
            netloc = parsed.netloc.lower()
            netloc = netloc.replace("www.", "")
            
            # Normalize path
            path = parsed.path.rstrip("/")
            
            # Remove common tracking parameters
            query_params = []
            if parsed.query:
                for param in parsed.query.split("&"):
                    if not param.lower().startswith(("utm_", "fbclid", "gclid", "referrer")):
                        query_params.append(param)
            
            query = "&".join(sorted(query_params)) if query_params else ""
            
            normalized = f"{scheme}://{netloc}{path}"
            if query:
                normalized += f"?{query}"
            
            return normalized
        except Exception:
            return url.lower()
    
    def _classify_source_type(self, url: str) -> str:
        """
        Classify source type based on URL patterns.
        
        Args:
            url: Source URL
            
        Returns:
            Source type string
        """
        url_lower = url.lower()
        
        for source_type, patterns in self.SOURCE_TYPE_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, url_lower):
                    return source_type
        
        return "unknown"
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            return domain.replace("www.", "")
        except Exception:
            return url.lower()
    
    def _estimate_reliability(self, source_type: str, domain: str) -> float:
        """
        Estimate initial reliability score.
        
        Args:
            source_type: Classified source type
            domain: Domain name
            
        Returns:
            Reliability score (0-1)
        """
        base_score = self.BASE_RELIABILITY.get(source_type, 0.50)
        
        # Adjustments based on domain reputation
        # (In production, this would query a reputation database)
        adjustments = {
            "wikipedia.org": 0.70,
            "arxiv.org": 0.85,
            "ncbi.nlm.nih.gov": 0.95,
            "nature.com": 0.90,
            "science.org": 0.90,
        }
        
        for known_domain, score in adjustments.items():
            if domain.endswith(known_domain):
                return max(base_score, score)
        
        return base_score
    
    def capture_source(
        self,
        url: str,
        title: Optional[str] = None,
        author: Optional[str] = None,
        publication_date: Optional[datetime] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Capture source metadata.
        
        Args:
            url: Source URL
            title: Page/document title
            author: Author name if available
            publication_date: Publication date if known
            metadata: Additional metadata
            
        Returns:
            source_id: Unique identifier for this source
        """
        normalized_url = self._normalize_url(url)
        
        # Check if we already have this source
        if normalized_url in self.url_to_source:
            return self.url_to_source[normalized_url]
        
        source_id = self._generate_source_id(url)
        source_type = self._classify_source_type(url)
        domain = self._extract_domain(url)
        reliability = self._estimate_reliability(source_type, domain)
        
        source = SourceMetadata(
            source_id=source_id,
            url=url,
            url_normalized=normalized_url,
            source_type=source_type,
            domain=domain,
            publication_date=publication_date,
            capture_date=datetime.now(timezone.utc),
            title=title,
            author=author,
            reliability_score=reliability,
            metadata=metadata or {}
        )
        
        self.sources[source_id] = source
        self.url_to_source[normalized_url] = source_id
        
        self._save_sources()
        
        return source_id
    
    def capture_sources(self, urls: List[str]) -> List[str]:
        """
        Capture multiple sources at once.
        
        Args:
            urls: List of URLs to capture
            
        Returns:
            List of source IDs
        """
        return [self.capture_source(url) for url in urls]
    
    def get_source(self, source_id: str) -> Optional[SourceMetadata]:
        """Get source metadata by ID."""
        return self.sources.get(source_id)
    
    def get_source_by_url(self, url: str) -> Optional[SourceMetadata]:
        """Get source by URL (normalized lookup)."""
        normalized = self._normalize_url(url)
        source_id = self.url_to_source.get(normalized)
        if source_id:
            return self.sources.get(source_id)
        return None
    
    def get_sources_by_type(self, source_type: str) -> List[SourceMetadata]:
        """Get all sources of a specific type."""
        return [
            source for source in self.sources.values()
            if source.source_type == source_type
        ]
    
    def get_sources_by_domain(self, domain: str) -> List[SourceMetadata]:
        """Get all sources from a specific domain."""
        return [
            source for source in self.sources.values()
            if source.domain == domain.lower()
        ]
    
    def get_all_sources(self) -> List[SourceMetadata]:
        """Get all captured sources."""
        return list(self.sources.values())
    
    def update_source_reliability(self, source_id: str, new_score: float) -> bool:
        """
        Update source reliability score.
        
        Args:
            source_id: Source to update
            new_score: New reliability score (0-1)
            
        Returns:
            True if updated, False if not found
        """
        if source_id not in self.sources:
            return False
        
        source = self.sources[source_id]
        source.reliability_score = new_score
        source.metadata["reliability_updated"] = datetime.now(timezone.utc).isoformat()
        
        self._save_sources()
        return True
    
    def delete_source(self, source_id: str) -> bool:
        """
        Delete a source record.
        
        Args:
            source_id: Source to delete
            
        Returns:
            True if deleted, False if not found
        """
        if source_id not in self.sources:
            return False
        
        source = self.sources[source_id]
        normalized = source.url_normalized
        
        del self.sources[source_id]
        if normalized in self.url_to_source:
            del self.url_to_source[normalized]
        
        self._save_sources()
        return True
    
    def _save_sources(self):
        """Persist sources to disk."""
        sources_file = os.path.join(self.storage_path, "sources.json")
        
        data = {
            "sources": {sid: s.to_dict() for sid, s in self.sources.items()},
            "url_to_source": self.url_to_source
        }
        
        with open(sources_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def _load_sources(self):
        """Load sources from disk."""
        sources_file = os.path.join(self.storage_path, "sources.json")
        
        if not os.path.exists(sources_file):
            return
        
        try:
            with open(sources_file, "r") as f:
                data = json.load(f)
            
            self.sources = {
                sid: SourceMetadata.from_dict(sdata)
                for sid, sdata in data.get("sources", {}).items()
            }
            self.url_to_source = data.get("url_to_source", {})
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Warning: Could not load sources: {e}")
            self.sources = {}
            self.url_to_source = {}
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get source capture statistics."""
        by_type = {}
        for source_type in self.BASE_RELIABILITY.keys():
            by_type[source_type] = len(self.get_sources_by_type(source_type))
        
        return {
            "total_sources": len(self.sources),
            "by_type": by_type,
            "avg_reliability": sum(s.reliability_score for s in self.sources.values()) / max(len(self.sources), 1),
            "unique_domains": len(set(s.domain for s in self.sources.values()))
        }
