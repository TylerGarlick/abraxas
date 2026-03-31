"""
Chronos L1: Temporal Index Engine

Indexes epistemic claims by session timestamp for temporal tracking.
Provides efficient lookup of claims across time periods and sessions.

Features:
- Claim indexing with session metadata
- Time-range queries
- Session-based retrieval
- Claim versioning support
"""

import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import json
import os


@dataclass
class ClaimRecord:
    """A single claim record with temporal metadata."""
    claim_id: str
    text: str
    session_id: str
    timestamp: datetime
    janus_label: str  # [KNOWN]/[INFERRED]/[UNCERTAIN]/[UNKNOWN]
    confidence: float
    sources: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "claim_id": self.claim_id,
            "text": self.text,
            "session_id": self.session_id,
            "timestamp": self.timestamp.isoformat(),
            "janus_label": self.janus_label,
            "confidence": self.confidence,
            "sources": self.sources,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "ClaimRecord":
        """Deserialize from dictionary."""
        return cls(
            claim_id=data["claim_id"],
            text=data["text"],
            session_id=data["session_id"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            janus_label=data["janus_label"],
            confidence=data["confidence"],
            sources=data.get("sources", []),
            metadata=data.get("metadata", {})
        )


class TemporalIndex:
    """
    Temporal indexing engine for epistemic claims.
    
    Maintains an index of claims organized by session timestamp,
    enabling efficient temporal queries and drift detection.
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        """
        Initialize temporal index.
        
        Args:
            storage_path: Path to persist index data (default: ~/.abraxas/chronos/)
        """
        self.storage_path = storage_path or os.path.expanduser("~/.abraxas/chronos")
        self.claims: Dict[str, ClaimRecord] = {}
        self.session_index: Dict[str, List[str]] = {}  # session_id -> claim_ids
        self.timestamp_index: List[tuple] = []  # [(timestamp, claim_id), ...]
        
        # Ensure storage directory exists
        os.makedirs(self.storage_path, exist_ok=True)
        
        # Load existing index if available
        self._load_index()
    
    def _generate_claim_id(self, text: str, session_id: str) -> str:
        """Generate unique claim ID from content and session."""
        content = f"{text}:{session_id}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    def index_claim(
        self,
        text: str,
        session_id: str,
        janus_label: str,
        confidence: float,
        sources: Optional[List[str]] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Index a new claim with temporal metadata.
        
        Args:
            text: The claim text
            session_id: Session identifier
            janus_label: Epistemic label from Janus
            confidence: Confidence score (0-1)
            sources: Optional list of sources
            metadata: Optional additional metadata
            
        Returns:
            claim_id: Unique identifier for this claim
        """
        timestamp = datetime.now(timezone.utc)
        claim_id = self._generate_claim_id(text, session_id)
        
        record = ClaimRecord(
            claim_id=claim_id,
            text=text,
            session_id=session_id,
            timestamp=timestamp,
            janus_label=janus_label,
            confidence=confidence,
            sources=sources or [],
            metadata=metadata or {}
        )
        
        # Store in main index
        self.claims[claim_id] = record
        
        # Update session index
        if session_id not in self.session_index:
            self.session_index[session_id] = []
        self.session_index[session_id].append(claim_id)
        
        # Update timestamp index (for time-range queries)
        self.timestamp_index.append((timestamp, claim_id))
        self.timestamp_index.sort(key=lambda x: x[0])  # Keep sorted
        
        # Persist to disk
        self._save_index()
        
        return claim_id
    
    def get_claim(self, claim_id: str) -> Optional[ClaimRecord]:
        """Retrieve a claim by ID."""
        return self.claims.get(claim_id)
    
    def get_claims_by_session(self, session_id: str) -> List[ClaimRecord]:
        """Get all claims from a specific session."""
        claim_ids = self.session_index.get(session_id, [])
        return [self.claims[cid] for cid in claim_ids if cid in self.claims]
    
    def get_claims_by_time_range(
        self,
        start: datetime,
        end: Optional[datetime] = None
    ) -> List[ClaimRecord]:
        """
        Get claims within a time range.
        
        Args:
            start: Start timestamp
            end: End timestamp (default: now)
            
        Returns:
            List of claims within the range, sorted by timestamp
        """
        if end is None:
            end = datetime.now(timezone.utc)
        
        results = []
        for timestamp, claim_id in self.timestamp_index:
            if start <= timestamp <= end:
                if claim_id in self.claims:
                    results.append(self.claims[claim_id])
        
        return results
    
    def get_claims_by_label(self, label: str) -> List[ClaimRecord]:
        """Get all claims with a specific Janus label."""
        return [
            record for record in self.claims.values()
            if record.janus_label == label
        ]
    
    def get_recent_claims(self, limit: int = 10) -> List[ClaimRecord]:
        """Get the most recent claims."""
        recent = []
        for timestamp, claim_id in reversed(self.timestamp_index[-limit:]):
            if claim_id in self.claims:
                recent.append(self.claims[claim_id])
        return recent
    
    def get_all_claims(self) -> List[ClaimRecord]:
        """Get all indexed claims."""
        return list(self.claims.values())
    
    def delete_claim(self, claim_id: str) -> bool:
        """
        Delete a claim from the index.
        
        Args:
            claim_id: ID of claim to delete
            
        Returns:
            True if deleted, False if not found
        """
        if claim_id not in self.claims:
            return False
        
        record = self.claims[claim_id]
        
        # Remove from session index
        if record.session_id in self.session_index:
            self.session_index[record.session_id].remove(claim_id)
        
        # Remove from timestamp index
        self.timestamp_index = [
            (ts, cid) for ts, cid in self.timestamp_index
            if cid != claim_id
        ]
        
        # Remove from main index
        del self.claims[claim_id]
        
        # Persist changes
        self._save_index()
        
        return True
    
    def _save_index(self):
        """Persist index to disk."""
        index_file = os.path.join(self.storage_path, "temporal_index.json")
        
        data = {
            "claims": {cid: rec.to_dict() for cid, rec in self.claims.items()},
            "session_index": self.session_index,
            "timestamp_index": [
                (ts.isoformat(), cid) for ts, cid in self.timestamp_index
            ]
        }
        
        with open(index_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def _load_index(self):
        """Load index from disk."""
        index_file = os.path.join(self.storage_path, "temporal_index.json")
        
        if not os.path.exists(index_file):
            return
        
        try:
            with open(index_file, "r") as f:
                data = json.load(f)
            
            self.claims = {
                cid: ClaimRecord.from_dict(rec)
                for cid, rec in data.get("claims", {}).items()
            }
            self.session_index = data.get("session_index", {})
            self.timestamp_index = [
                (datetime.fromisoformat(ts), cid)
                for ts, cid in data.get("timestamp_index", [])
            ]
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Warning: Could not load temporal index: {e}")
            self.claims = {}
            self.session_index = {}
            self.timestamp_index = []
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get index statistics."""
        return {
            "total_claims": len(self.claims),
            "total_sessions": len(self.session_index),
            "labels": {
                label: len(self.get_claims_by_label(label))
                for label in ["KNOWN", "INFERRED", "UNCERTAIN", "UNKNOWN"]
            }
        }
