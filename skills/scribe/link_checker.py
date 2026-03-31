"""
Scribe S3: Link Checker Engine

Monitors sources for link rot, retraction notices, and corrections.
Periodically re-validates source URLs and detects availability changes.

Features:
- Link availability checking
- Retraction notice detection
- Correction page monitoring
- Scheduled re-validation
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from enum import Enum
import re
import os
import json

from .source_capture import SourceCapture, SourceMetadata


class LinkStatus(Enum):
    """Status of source link."""
    ACTIVE = "active"
    REDIRECTED = "redirected"
    NOT_FOUND = "not_found"
    SERVER_ERROR = "server_error"
    TIMEOUT = "timeout"
    RETRACTED = "retracted"
    CORRECTED = "corrected"


@dataclass
class LinkCheckResult:
    """Result of a link check."""
    source_id: str
    url: str
    status: LinkStatus
    http_code: Optional[int]
    check_timestamp: datetime
    response_time_ms: float
    retraction_detected: bool
    correction_detected: bool
    redirect_url: Optional[str]
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "source_id": self.source_id,
            "url": self.url,
            "status": self.status.value,
            "http_code": self.http_code,
            "check_timestamp": self.check_timestamp.isoformat(),
            "response_time_ms": self.response_time_ms,
            "retraction_detected": self.retraction_detected,
            "correction_detected": self.correction_detected,
            "redirect_url": self.redirect_url,
            "metadata": self.metadata
        }


class LinkChecker:
    """
    Source link availability checker.
    
    Periodically validates source URLs, detects link rot,
    and identifies retraction/correction notices.
    """
    
    # Retraction indicator patterns
    RETRACTION_PATTERNS = [
        r"retracted", r"retraction", r"withdrawn", r"withdrawal",
        r"expression of concern", r"erratum", r"correction notice"
    ]
    
    # Correction indicator patterns
    CORRECTION_PATTERNS = [
        r"corrected", r"correction", r"amended", r"amendment",
        r"updated", r"revision", r"erratum"
    ]
    
    # Request timeout (seconds)
    DEFAULT_TIMEOUT = 10
    
    def __init__(
        self,
        source_capture: SourceCapture,
        storage_path: Optional[str] = None,
        timeout: int = DEFAULT_TIMEOUT
    ):
        """
        Initialize link checker.
        
        Args:
            source_capture: SourceCapture instance
            storage_path: Path to persist check data
            timeout: Request timeout in seconds
        """
        self.capture = source_capture
        self.storage_path = storage_path or os.path.expanduser("~/.abraxas/scribe")
        self.timeout = timeout
        self.check_history: Dict[str, List[LinkCheckResult]] = {}
        self.scheduled_checks: Dict[str, datetime] = {}  # source_id -> next check time
        
        os.makedirs(self.storage_path, exist_ok=True)
        self._load_data()
    
    async def _fetch_url(self, url: str) -> tuple:
        """
        Fetch URL and return (status_code, content, response_time).
        
        Args:
            url: URL to fetch
            
        Returns:
            Tuple of (http_code, content_text, response_time_ms)
        """
        start_time = datetime.now()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=self.timeout, allow_redirects=True) as response:
                    content = await response.text()
                    elapsed = (datetime.now() - start_time).total_seconds() * 1000
                    return response.status, content, elapsed
        except asyncio.TimeoutError:
            return None, None, (datetime.now() - start_time).total_seconds() * 1000
        except Exception as e:
            return None, str(e), (datetime.now() - start_time).total_seconds() * 1000
    
    def _detect_retraction(self, content: str) -> bool:
        """
        Detect retraction notices in page content.
        
        Args:
            content: Page HTML/text content
            
        Returns:
            True if retraction detected
        """
        if not content:
            return False
        
        content_lower = content.lower()
        for pattern in self.RETRACTION_PATTERNS:
            if re.search(pattern, content_lower):
                return True
        return False
    
    def _detect_correction(self, content: str) -> bool:
        """
        Detect correction notices in page content.
        
        Args:
            content: Page HTML/text content
            
        Returns:
            True if correction detected
        """
        if not content:
            return False
        
        content_lower = content.lower()
        for pattern in self.CORRECTION_PATTERNS:
            if re.search(pattern, content_lower):
                return True
        return False
    
    def _classify_status(self, http_code: Optional[int], content: str) -> LinkStatus:
        """
        Classify link status based on HTTP code and content.
        
        Args:
            http_code: HTTP response code
            content: Page content
            
        Returns:
            LinkStatus enum value
        """
        if http_code is None:
            return LinkStatus.TIMEOUT
        
        if http_code >= 500:
            return LinkStatus.SERVER_ERROR
        
        if http_code == 404:
            return LinkStatus.NOT_FOUND
        
        if http_code in [301, 302, 307, 308]:
            return LinkStatus.REDIRECTED
        
        if http_code in [200, 201, 202, 204, 206]:
            if self._detect_retraction(content):
                return LinkStatus.RETRACTED
            if self._detect_correction(content):
                return LinkStatus.CORRECTED
            return LinkStatus.ACTIVE
        
        return LinkStatus.ACTIVE
    
    async def check_link(self, source_id: str) -> LinkCheckResult:
        """
        Check a single source link.
        
        Args:
            source_id: Source to check
            
        Returns:
            LinkCheckResult
        """
        source = self.capture.get_source(source_id)
        if not source:
            raise ValueError(f"Source not found: {source_id}")
        
        status_code, content, response_time = await self._fetch_url(source.url)
        status = self._classify_status(status_code, content)
        
        result = LinkCheckResult(
            source_id=source_id,
            url=source.url,
            status=status,
            http_code=status_code,
            check_timestamp=datetime.now(timezone.utc),
            response_time_ms=response_time,
            retraction_detected=(status == LinkStatus.RETRACTED),
            correction_detected=(status == LinkStatus.CORRECTED),
            redirect_url=None,  # Would need to extract from response
            metadata={
                "content_length": len(content) if content else 0,
                "source_type": source.source_type
            }
        )
        
        # Store in history
        if source_id not in self.check_history:
            self.check_history[source_id] = []
        self.check_history[source_id].append(result)
        
        # Schedule next check
        self._schedule_next_check(source_id, status)
        
        self._save_data()
        
        return result
    
    async def check_links(self, source_ids: List[str]) -> List[LinkCheckResult]:
        """
        Check multiple source links.
        
        Args:
            source_ids: List of sources to check
            
        Returns:
            List of LinkCheckResults
        """
        results = []
        for source_id in source_ids:
            try:
                result = await self.check_link(source_id)
                results.append(result)
            except Exception as e:
                results.append(LinkCheckResult(
                    source_id=source_id,
                    url=self.capture.get_source(source_id).url if self.capture.get_source(source_id) else "unknown",
                    status=LinkStatus.SERVER_ERROR,
                    http_code=None,
                    check_timestamp=datetime.now(timezone.utc),
                    response_time_ms=0,
                    retraction_detected=False,
                    correction_detected=False,
                    redirect_url=None,
                    metadata={"error": str(e)}
                ))
        
        return results
    
    async def check_all_sources(self) -> List[LinkCheckResult]:
        """
        Check all captured sources.
        
        Returns:
            List of LinkCheckResults
        """
        return await self.check_links(list(self.capture.sources.keys()))
    
    def _schedule_next_check(self, source_id: str, status: LinkStatus):
        """
        Schedule next check based on current status.
        
        Args:
            source_id: Source that was checked
            status: Current link status
        """
        # More frequent checks for problematic links
        if status in [LinkStatus.RETRACTED, LinkStatus.CORRECTED]:
            next_check = datetime.now(timezone.utc) + timedelta(days=1)
        elif status == LinkStatus.ACTIVE:
            next_check = datetime.now(timezone.utc) + timedelta(days=30)
        else:
            next_check = datetime.now(timezone.utc) + timedelta(days=7)
        
        self.scheduled_checks[source_id] = next_check
    
    def get_due_checks(self) -> List[str]:
        """
        Get sources due for re-validation.
        
        Returns:
            List of source_ids due for check
        """
        now = datetime.now(timezone.utc)
        due = []
        for source_id, next_check in self.scheduled_checks.items():
            if next_check <= now:
                due.append(source_id)
        return due
    
    def get_link_history(self, source_id: str) -> List[LinkCheckResult]:
        """
        Get check history for a source.
        
        Args:
            source_id: Source to query
            
        Returns:
            List of historical check results
        """
        return self.check_history.get(source_id, [])
    
    def get_broken_links(self) -> List[LinkCheckResult]:
        """
        Get all currently broken links.
        
        Returns:
            List of most recent results for broken links
        """
        broken = []
        for source_id, history in self.check_history.items():
            if history:
                latest = history[-1]
                if latest.status in [LinkStatus.NOT_FOUND, LinkStatus.SERVER_ERROR, LinkStatus.TIMEOUT]:
                    broken.append(latest)
        return broken
    
    def get_retracted_sources(self) -> List[LinkCheckResult]:
        """
        Get all sources with retraction detected.
        
        Returns:
            List of retracted source results
        """
        retracted = []
        for source_id, history in self.check_history.items():
            for result in history:
                if result.retraction_detected:
                    retracted.append(result)
        return retracted
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get link checker statistics."""
        total_checks = sum(len(h) for h in self.check_history.values())
        
        status_counts = {}
        for history in self.check_history.values():
            if history:
                latest = history[-1]
                status = latest.status.value
                status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            "total_checks": total_checks,
            "sources_monitored": len(self.check_history),
            "status_distribution": status_counts,
            "due_for_check": len(self.get_due_checks()),
            "broken_links": len(self.get_broken_links()),
            "retractions_detected": len(self.get_retracted_sources())
        }
    
    def _save_data(self):
        """Persist check data to disk."""
        data_file = os.path.join(self.storage_path, "link_checks.json")
        
        data = {
            "check_history": {
                sid: [r.to_dict() for r in history]
                for sid, history in self.check_history.items()
            },
            "scheduled_checks": {
                sid: sc.isoformat() for sid, sc in self.scheduled_checks.items()
            }
        }
        
        with open(data_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def _load_data(self):
        """Load check data from disk."""
        data_file = os.path.join(self.storage_path, "link_checks.json")
        
        if not os.path.exists(data_file):
            return
        
        try:
            with open(data_file, "r") as f:
                data = json.load(f)
            
            self.check_history = {
                sid: [
                    LinkCheckResult(
                        source_id=r["source_id"],
                        url=r["url"],
                        status=LinkStatus(r["status"]),
                        http_code=r["http_code"],
                        check_timestamp=datetime.fromisoformat(r["check_timestamp"]),
                        response_time_ms=r["response_time_ms"],
                        retraction_detected=r["retraction_detected"],
                        correction_detected=r["correction_detected"],
                        redirect_url=r["redirect_url"],
                        metadata=r.get("metadata", {})
                    )
                    for r in history
                ]
                for sid, history in data.get("check_history", {}).items()
            }
            self.scheduled_checks = {
                sid: datetime.fromisoformat(sc)
                for sid, sc in data.get("scheduled_checks", {}).items()
            }
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Warning: Could not load link check data: {e}")
            self.check_history = {}
            self.scheduled_checks = {}
