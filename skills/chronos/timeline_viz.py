"""
Chronos L4: Timeline Visualization Engine

Generates epistemic timeline visualizations showing claim evolution,
drift detection points, and resolution actions over time.

Features:
- Timeline generation (text/ASCII/HTML)
- Claim evolution tracking
- Drift event marking
- Export to multiple formats
"""

from typing import Dict, List, Optional
from datetime import datetime
from dataclasses import dataclass

from .temporal_index import TemporalIndex, ClaimRecord
from .drift_detection import DriftReport, DriftType
from .contradiction_resolution import ResolutionResult, ResolutionStrategy


@dataclass
class TimelineEvent:
    """A single event in the epistemic timeline."""
    timestamp: datetime
    event_type: str  # "claim", "drift", "resolution"
    claim_id: str
    description: str
    severity: Optional[str] = None
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
    
    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "timestamp": self.timestamp.isoformat(),
            "event_type": self.event_type,
            "claim_id": self.claim_id,
            "description": self.description,
            "severity": self.severity,
            "metadata": self.metadata
        }


class TimelineVisualizer:
    """
    Epistemic timeline visualization engine.
    
    Generates visual representations of claim evolution,
    drift events, and resolution actions over time.
    """
    
    # Severity color mapping (for HTML output)
    SEVERITY_COLORS = {
        "low": "#90EE90",      # light green
        "medium": "#FFD700",   # gold
        "high": "#FFA500",     # orange
        "critical": "#FF4500", # orange-red
    }
    
    # Event type symbols
    EVENT_SYMBOLS = {
        "claim": "●",
        "drift": "⚠",
        "resolution": "✓"
    }
    
    def __init__(
        self,
        temporal_index: TemporalIndex,
        drift_reports: List[DriftReport] = None,
        resolutions: List[ResolutionResult] = None
    ):
        """
        Initialize timeline visualizer.
        
        Args:
            temporal_index: TemporalIndex instance
            drift_reports: Optional list of drift reports to include
            resolutions: Optional list of resolutions to include
        """
        self.index = temporal_index
        self.drift_reports = drift_reports or []
        self.resolutions = resolutions or []
    
    def _build_events(self) -> List[TimelineEvent]:
        """Build timeline events from all sources."""
        events = []
        
        # Add claim events
        for claim in self.index.get_all_claims():
            events.append(TimelineEvent(
                timestamp=claim.timestamp,
                event_type="claim",
                claim_id=claim.claim_id,
                description=f"Claim: {claim.text[:50]}...",
                severity=None,
                metadata={"label": claim.janus_label, "confidence": claim.confidence}
            ))
        
        # Add drift events
        for drift in self.drift_reports:
            events.append(TimelineEvent(
                timestamp=drift.timestamp,
                event_type="drift",
                claim_id=drift.new_claim.claim_id,
                description=drift.description,
                severity=drift.severity,
                metadata={"drift_type": drift.drift_type.value}
            ))
        
        # Add resolution events
        for res in self.resolutions:
            events.append(TimelineEvent(
                timestamp=res.timestamp,
                event_type="resolution",
                claim_id=res.chosen_claim.claim_id,
                description=res.action_taken,
                severity=None,
                metadata={"strategy": res.strategy.value}
            ))
        
        # Sort by timestamp
        events.sort(key=lambda e: e.timestamp)
        
        return events
    
    def generate_ascii_timeline(
        self,
        limit: int = 20,
        time_range: Optional[tuple] = None
    ) -> str:
        """
        Generate ASCII text timeline.
        
        Args:
            limit: Maximum number of events to show
            time_range: Optional (start, end) datetime tuple
            
        Returns:
            ASCII timeline string
        """
        events = self._build_events()
        
        # Filter by time range if specified
        if time_range:
            start, end = time_range
            events = [e for e in events if start <= e.timestamp <= end]
        
        # Limit events
        events = events[:limit]
        
        lines = []
        lines.append("=" * 70)
        lines.append("EPISTEMIC TIMELINE (Chronos)")
        lines.append("=" * 70)
        lines.append("")
        
        for event in events:
            symbol = self.EVENT_SYMBOLS.get(event.event_type, "○")
            time_str = event.timestamp.strftime("%Y-%m-%d %H:%M")
            
            if event.severity:
                severity_marker = f"[{event.severity.upper()}]"
            else:
                severity_marker = ""
            
            lines.append(f"{symbol} {time_str} {severity_marker}")
            lines.append(f"  {event.description}")
            lines.append(f"  ID: {event.claim_id}")
            lines.append("")
        
        lines.append("=" * 70)
        lines.append(f"Total events: {len(events)}")
        lines.append("=" * 70)
        
        return "\n".join(lines)
    
    def generate_html_timeline(
        self,
        title: str = "Epistemic Timeline",
        include_claims: bool = True,
        include_drifts: bool = True,
        include_resolutions: bool = True
    ) -> str:
        """
        Generate HTML timeline with styling.
        
        Args:
            title: Timeline title
            include_claims: Include claim events
            include_drifts: Include drift events
            include_resolutions: Include resolution events
            
        Returns:
            HTML string
        """
        events = self._build_events()
        
        # Filter by event type
        if not include_claims:
            events = [e for e in events if e.event_type != "claim"]
        if not include_drifts:
            events = [e for e in events if e.event_type != "drift"]
        if not include_resolutions:
            events = [e for e in events if e.event_type != "resolution"]
        
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>{title}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }}
        .timeline {{ max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .event {{ padding: 15px 0; border-left: 3px solid #ddd; margin-left: 20px; padding-left: 20px; }}
        .event.claim {{ border-color: #4a90d9; }}
        .event.drift {{ border-color: #f5a623; }}
        .event.resolution {{ border-color: #7ed321; }}
        .event.critical {{ border-color: #d0021b; background: #fff5f5; }}
        .timestamp {{ color: #666; font-size: 0.9em; }}
        .description {{ margin: 8px 0; }}
        .metadata {{ color: #888; font-size: 0.85em; }}
        .severity {{ display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }}
        h1 {{ color: #333; border-bottom: 2px solid #4a90d9; padding-bottom: 10px; }}
    </style>
</head>
<body>
    <div class="timeline">
        <h1>{title}</h1>
"""
        
        for event in events:
            severity_class = f" {event.severity}" if event.severity else ""
            color = self.SEVERITY_COLORS.get(event.severity, "#ddd")
            severity_style = f"background: {color}" if event.severity else ""
            
            html += f"""
        <div class="event {event.event_type}{severity_class}">
            <div class="timestamp">{event.timestamp.strftime('%Y-%m-%d %H:%M:%S')}</div>
            <div class="description">{event.description}</div>
            <div class="metadata">
                ID: {event.claim_id} | Type: {event.event_type}
                {f'| <span class="severity" style="{severity_style}">{event.severity.upper()}</span>' if event.severity else ''}
            </div>
        </div>
"""
        
        html += f"""
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
            Total events: {len(events)}
        </div>
    </div>
</body>
</html>
"""
        
        return html
    
    def generate_claim_evolution(self, claim_id: str) -> List[Dict]:
        """
        Generate evolution trace for a specific claim.
        
        Args:
            claim_id: Claim to trace
            
        Returns:
            List of evolution events
        """
        claim = self.index.get_claim(claim_id)
        if not claim:
            return []
        
        evolution = []
        
        # Find related drift reports
        related_drifts = [
            d for d in self.drift_reports
            if d.new_claim.claim_id == claim_id or d.old_claim.claim_id == claim_id
        ]
        
        # Find related resolutions
        related_resolutions = [
            r for r in self.resolutions
            if r.chosen_claim.claim_id == claim_id or r.superseded_claim.claim_id == claim_id
        ]
        
        evolution.append({
            "timestamp": claim.timestamp.isoformat(),
            "event": "created",
            "details": claim.to_dict()
        })
        
        for drift in related_drifts:
            evolution.append({
                "timestamp": drift.timestamp.isoformat(),
                "event": "drift_detected",
                "details": drift.to_dict()
            })
        
        for res in related_resolutions:
            evolution.append({
                "timestamp": res.timestamp.isoformat(),
                "event": "resolution_applied",
                "details": res.to_dict()
            })
        
        evolution.sort(key=lambda x: x["timestamp"])
        
        return evolution
    
    def export_timeline(self, filepath: str, format: str = "json"):
        """
        Export timeline to file.
        
        Args:
            filepath: Output file path
            format: Output format ("json", "html", "txt")
        """
        events = self._build_events()
        
        if format == "json":
            import json
            data = [e.to_dict() for e in events]
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2)
        
        elif format == "html":
            html = self.generate_html_timeline()
            with open(filepath, "w") as f:
                f.write(html)
        
        elif format == "txt":
            txt = self.generate_ascii_timeline(limit=100)
            with open(filepath, "w") as f:
                f.write(txt)
        
        else:
            raise ValueError(f"Unknown format: {format}")
    
    def get_statistics(self) -> Dict:
        """Get timeline statistics."""
        events = self._build_events()
        
        return {
            "total_events": len(events),
            "claims": len([e for e in events if e.event_type == "claim"]),
            "drifts": len([e for e in events if e.event_type == "drift"]),
            "resolutions": len([e for e in events if e.event_type == "resolution"]),
            "by_severity": {
                "critical": len([e for e in events if e.severity == "critical"]),
                "high": len([e for e in events if e.severity == "high"]),
                "medium": len([e for e in events if e.severity == "medium"]),
                "low": len([e for e in events if e.severity == "low"])
            }
        }
