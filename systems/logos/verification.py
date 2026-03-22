"""
L2: Cross-Source Verification
Checks each atomic proposition against multiple sources.
"""

import asyncio
from typing import List, Dict, Any, Optional, Set
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod


class VerificationStatus(Enum):
    VERIFIED = "verified"
    CONTRADICTED = "contradicted"
    PARTIAL = "partial"
    UNKNOWN = "unknown"
    PENDING = "pending"


class SourceType(Enum):
    WEB = "web"
    ACADEMIC = "academic"
    NEWS = "news"
    SOCIAL_MEDIA = "social_media"
    OFFICIAL = "official"
    USER_PROVIDED = "user_provided"


@dataclass
class SourceCredibility:
    """Credibility score for a source."""
    source_name: str
    credibility_score: float  # 0.0 to 1.0
    bias_score: float  # -1.0 (left) to 1.0 (right)
    reliability_history: float
    fact_check_rating: Optional[str] = None


@dataclass
class VerificationResult:
    """Result of verifying a proposition against sources."""
    proposition_text: str
    status: VerificationStatus
    confidence: float
    sources_checked: List[str]
    supporting_sources: List[str] = field(default_factory=list)
    contradicting_sources: List[str] = field(default_factory=list)
    evidence_snippets: List[str] = field(default_factory=list)
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "proposition_text": self.proposition_text,
            "status": self.status.value,
            "confidence": self.confidence,
            "sources_checked": self.sources_checked,
            "supporting_sources": self.supporting_sources,
            "contradicting_sources": self.contradicting_sources,
            "evidence_snippets": self.evidence_snippets,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


class SourceVerifier(ABC):
    """Abstract base class for source verification."""
    
    @abstractmethod
    async def verify(self, proposition: str, sources: List[str]) -> VerificationResult:
        """Verify a proposition against sources."""
        pass


class CrossSourceVerificationEngine:
    """
    Engine for verifying propositions against multiple sources.
    
    Implements cross-source checking to reduce bias and improve
    verification accuracy through triangulation.
    """

    def __init__(self, source_credibility_db: Optional[Dict[str, SourceCredibility]] = None):
        self.source_credibility_db = source_credibility_db or self._load_default_credibility()
        self.verification_cache: Dict[str, VerificationResult] = {}

    def _load_default_credibility(self) -> Dict[str, SourceCredibility]:
        """Load default source credibility scores."""
        return {
            "wikipedia": SourceCredibility("wikipedia", 0.75, 0.0, 0.80, "mixed"),
            "bbc": SourceCredibility("bbc", 0.85, -0.1, 0.90, "high"),
            "reuters": SourceCredibility("reuters", 0.90, 0.0, 0.92, "high"),
            "ap_news": SourceCredibility("ap_news", 0.88, 0.0, 0.91, "high"),
            "nature": SourceCredibility("nature", 0.95, 0.0, 0.95, "high"),
            "science": SourceCredibility("science", 0.94, 0.0, 0.94, "high"),
            "nytimes": SourceCredibility("nytimes", 0.82, -0.2, 0.85, "mixed"),
            "wsj": SourceCredibility("wsj", 0.83, 0.2, 0.86, "mixed"),
            "guardian": SourceCredibility("guardian", 0.80, -0.3, 0.84, "mixed"),
            "fox_news": SourceCredibility("fox_news", 0.70, 0.4, 0.75, "mixed"),
            "cnn": SourceCredibility("cnn", 0.75, -0.25, 0.78, "mixed"),
            "snopes": SourceCredibility("snopes", 0.88, 0.0, 0.90, "high"),
            "politi_fact": SourceCredibility("politi_fact", 0.87, -0.1, 0.89, "high"),
            "government": SourceCredibility("government", 0.85, 0.1, 0.88, "high"),
            "academic_journal": SourceCredibility("academic_journal", 0.92, 0.0, 0.93, "high"),
        }

    async def verify_proposition(
        self,
        proposition: str,
        required_sources: int = 3,
        source_types: Optional[List[SourceType]] = None
    ) -> VerificationResult:
        """
        Verify a proposition against multiple sources.
        
        Args:
            proposition: The atomic proposition to verify
            required_sources: Minimum number of sources to check
            source_types: Optional filter for source types
            
        Returns:
            VerificationResult with status and confidence
        """
        # Check cache first
        cache_key = self._cache_key(proposition)
        if cache_key in self.verification_cache:
            return self.verification_cache[cache_key]
        
        # Select sources for verification
        sources = self._select_sources(source_types or list(SourceType))
        
        # Verify against each source (simulated - would integrate with actual APIs)
        results = await self._check_all_sources(proposition, sources)
        
        # Aggregate results
        verification = self._aggregate_verification(results, proposition)
        
        # Cache result
        self.verification_cache[cache_key] = verification
        
        return verification

    def _cache_key(self, proposition: str) -> str:
        """Generate cache key for proposition."""
        import hashlib
        return hashlib.md5(proposition.encode()).hexdigest()

    def _select_sources(self, available_types: List[SourceType]) -> List[str]:
        """Select diverse sources for verification."""
        # Prioritize high-credibility sources across different types
        selected = []
        
        # Always include fact-checkers if available
        fact_checkers = ["snopes", "politi_fact"]
        selected.extend(fact_checkers)
        
        # Add news sources with diverse bias
        news_sources = ["reuters", "ap_news", "bbc"]
        selected.extend(news_sources[:2])
        
        # Add academic sources for scientific claims
        selected.extend(["nature", "science"][:1])
        
        return selected[:5]  # Limit to 5 sources

    async def _check_all_sources(
        self,
        proposition: str,
        sources: List[str]
    ) -> Dict[str, Any]:
        """
        Check proposition against all selected sources.
        
        In production, this would call actual search/verification APIs.
        """
        # Simulated source checking
        # In production, integrate with:
        # - Google Fact Check API
        # - News API
        # - Academic search APIs
        # - Web search
        
        results = {}
        for source in sources:
            # Simulate verification (replace with actual API calls)
            credibility = self.source_credibility_db.get(source, SourceCredibility(source, 0.5, 0.0, 0.5))
            
            # Mock verification logic
            is_supporting = hash(proposition + source) % 2 == 0
            
            results[source] = {
                "supports": is_supporting,
                "credibility": credibility.credibility_score,
                "bias": credibility.bias_score,
                "snippet": f"Source {source} {'supports' if is_supporting else 'does not address'} '{proposition[:50]}...'"
            }
            
            # Simulate async delay
            await asyncio.sleep(0.1)
        
        return results

    def _aggregate_verification(
        self,
        source_results: Dict[str, Any],
        proposition: str
    ) -> VerificationResult:
        """
        Aggregate results from multiple sources into final verification.
        
        Uses weighted voting based on source credibility.
        """
        supporting = []
        contradicting = []
        unknown = []
        
        weighted_support = 0.0
        weighted_contradict = 0.0
        
        for source, result in source_results.items():
            credibility = result["credibility"]
            
            if result["supports"]:
                supporting.append(source)
                weighted_support += credibility
            else:
                # Treat non-support as unknown, not contradiction
                # (absence of evidence ≠ evidence of absence)
                unknown.append(source)
        
        # Determine status
        total_weight = weighted_support + weighted_contradict
        
        if total_weight == 0:
            status = VerificationStatus.UNKNOWN
            confidence = 0.5
        elif weighted_support > weighted_contradict * 2:
            status = VerificationStatus.VERIFIED
            confidence = min(0.95, weighted_support / total_weight)
        elif weighted_contradict > weighted_support * 2:
            status = VerificationStatus.CONTRADICTED
            confidence = min(0.95, weighted_contradict / total_weight)
        else:
            status = VerificationStatus.PARTIAL
            confidence = 0.6
        
        evidence_snippets = [r["snippet"] for r in source_results.values()]
        
        return VerificationResult(
            proposition_text=proposition,
            status=status,
            confidence=confidence,
            sources_checked=list(source_results.keys()),
            supporting_sources=supporting,
            contradicting_sources=contradicting,
            evidence_snippets=evidence_snippets,
            timestamp=self._get_timestamp(),
            metadata={
                "weighted_support": weighted_support,
                "weighted_contradict": weighted_contradict,
                "num_sources": len(source_results)
            }
        )

    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()

    def get_source_credibility(self, source_name: str) -> Optional[SourceCredibility]:
        """Get credibility score for a source."""
        return self.source_credibility_db.get(source_name)

    def register_source(self, name: str, credibility: SourceCredibility) -> None:
        """Register a new source with credibility scores."""
        self.source_credibility_db[name] = credibility


# Example usage
if __name__ == "__main__":
    async def main():
        engine = CrossSourceVerificationEngine()
        
        test_proposition = "Climate change is primarily caused by human activities"
        
        result = await engine.verify_proposition(test_proposition, required_sources=3)
        print(result.to_dict())

    asyncio.run(main())
