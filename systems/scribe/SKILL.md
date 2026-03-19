# Scribe System - Source Provenance & Citation Integrity

**Traditional:** Record-keeper, scribe

**Purpose:** Track where claims originated, validate citation integrity, and monitor source reliability over time. Detects when sources are retracted, corrected, or downgraded in reliability.

---

## Overview

Scribe provides citation integrity for epistemic claims by:
- Capturing source metadata at claim creation
- Scoring source reliability dynamically
- Checking links for rot/retractions
- Alerting when sources degrade

---

## Architecture (L1-L4 Pattern)

### S1: Source Capture Engine
**File:** `source_capture.py`

Captures and normalizes source metadata at claim creation.

**Features:**
- URL normalization (remove tracking params)
- Source type classification (academic/news/blog/social/official)
- Initial reliability scoring
- Persistent storage

**Source Types:**
| Type | Examples | Base Reliability |
|------|----------|------------------|
| Academic | .edu, arxiv.org, doi.org | 0.85 |
| Official | .gov, .mil, who.int | 0.90 |
| News | reuters.com, apnews.com, bbc | 0.75 |
| Blog | medium.com, substack.com | 0.50 |
| Social | twitter.com, reddit.com | 0.30 |
| Unknown | Other | 0.50 |

**Key Classes:**
- `SourceMetadata` — Source data structure
- `SourceCapture` — Capture engine

---

### S2: Reliability Scorer Engine
**File:** `reliability_scorer.py`

Dynamically adjusts source reliability based on track record.

**Reliability Factors:**
| Factor | Impact | Description |
|--------|--------|-------------|
| SOURCE_TYPE | Base | Initial classification score |
| DOMAIN_REP | ±0.10 | Known domain reputation |
| RETRACTION | -0.50 | Major penalty for retraction |
| CORRECTION | -0.20 | Moderate penalty for correction |
| ACCURACY_TRACK | ±0.15 | Historical accuracy rate |
| CONSENSUS | +0.15 | Agreement with other sources |

**Track Record Tracking:**
- Records accuracy outcomes per claim
- Calculates accuracy rate over time
- Recalculates scores periodically

**Key Classes:**
- `ReliabilityUpdate` — Score change record
- `ReliabilityScorer` — Scoring engine

---

### S3: Link Checker Engine
**File:** `link_checker.py`

Monitors sources for link rot and retraction notices.

**Link Statuses:**
| Status | HTTP Code | Description |
|--------|-----------|-------------|
| ACTIVE | 200-206 | Page accessible, no issues |
| REDIRECTED | 301-308 | URL redirected |
| NOT_FOUND | 404 | Link rot (page gone) |
| SERVER_ERROR | 500+ | Server unavailable |
| TIMEOUT | — | Request timed out |
| RETRACTED | 200 | Retraction notice detected |
| CORRECTED | 200 | Correction notice detected |

**Detection Patterns:**
- Retraction: "retracted", "withdrawn", "expression of concern"
- Correction: "corrected", "amended", "erratum", "updated"

**Scheduling:**
- Active sources: check every 30 days
- Corrected/retracted: check every 1 day
- Broken links: check every 7 days

**Key Classes:**
- `LinkCheckResult` — Check outcome
- `LinkChecker` — Async checking engine

---

### S4: Provenance Tracker Engine
**File:** `provenance_tracker.py`

Maintains provenance graphs and generates alerts.

**Alert Types:**
| Type | Severity | Trigger |
|------|----------|---------|
| RETRACTION | Critical | Source retracted |
| CORRECTION | Medium | Source corrected |
| RELIABILITY_DROP | High/Medium | Score dropped >0.2 |
| LINK_ROT | High | 404/timeout |
| CONSENSUS_CHANGE | Medium | Consensus shifted |

**Features:**
- Citation chain tracking (claim → sources)
- Impact analysis (affected claims)
- Alert callbacks for real-time notification
- Alert acknowledgment workflow

**Key Classes:**
- `ProvenanceAlert` — Alert record
- `CitationChain` — Claim-source linkage
- `ProvenanceTracker` — Tracking engine

---

## Commands

```
/scribe capture {url} [--title {title}] [--author {author}]
    Capture source metadata from URL

/scribe reliability {source_id}
    Get reliability info for a source

/scribe check {source_id|--all}
    Check source link status

/scribe alerts [--unacknowledged]
    Show provenance alerts

/scribe acknowledge {alert_id}
    Acknowledge an alert

/scribe provenance {claim_id}
    Show provenance for a claim

/scribe affected {source_id}
    Show claims affected by a source

/scribe stats
    Show system statistics
```

---

## Integration with Existing Systems

### Chronos Integration
Chronos tracks claims over time; Scribe tracks sources over time. Together they provide full temporal provenance coverage.

### Logos Integration
Logos decomposes claims into atomic propositions; Scribe can track sources for each atom independently.

### Pheme Integration
Pheme verifies claims against sources; Scribe provides the source infrastructure for Pheme to use.

### Janus Integration
Janus labels claims; Scribe adds source provenance metadata to those labels.

---

## Usage Examples

### Example 1: Capture Sources
```python
from scribe import SourceCapture

capture = SourceCapture()
source_id = capture.capture_source(
    url="https://arxiv.org/abs/2026.12345",
    title="Example Paper",
    author="John Doe"
)
```

### Example 2: Check Reliability
```python
from scribe import ReliabilityScorer

scorer = ReliabilityScorer(capture)
info = scorer.get_source_reliability(source_id)
print(f"Score: {info['current_score']}")
print(f"Accuracy rate: {info['accuracy_rate']}")
```

### Example 3: Check Links
```python
import asyncio
from scribe import LinkChecker

checker = LinkChecker(capture)
result = asyncio.run(checker.check_link(source_id))
print(f"Status: {result.status}")
print(f"Retracted: {result.retraction_detected}")
```

### Example 4: Track Provenance
```python
from scribe import ProvenanceTracker

tracker = ProvenanceTracker(capture, scorer, checker)

# Register claim with sources
chain = tracker.register_claim_sources(
    claim_id="claim_001",
    source_ids=[source_id]
)

# Run checks and get alerts
alerts = tracker.run_all_checks()
for alert in alerts:
    print(f"Alert: {alert.alert_type} - {alert.severity}")
```

### Example 5: Alert Callback
```python
def handle_alert(alert):
    print(f"ALERT: {alert.message}")
    print(f"Affected claims: {alert.affected_claims}")

tracker.register_alert_callback(handle_alert)
```

---

## Testing

Run tests:
```bash
cd /abraxas/systems/scribe
python -m pytest test_scribe.py -v
```

**Test Coverage:**
- Source capture (URL normalization, classification)
- Reliability scoring (updates, track record)
- Link checking (async, status detection)
- Provenance tracking (alerts, chains)

---

## Storage

Scribe persists data to `~/.abraxas/scribe/`:
- `sources.json` — Source metadata
- `reliability_data.json` — Score history & track records
- `link_checks.json` — Check history & schedules
- `provenance.json` — Citation chains & alerts

---

## Performance Considerations

- Link checking is async (aiohttp)
- Batch checks for multiple sources
- Scheduled checks avoid redundant polling
- For production: consider background job queue

---

## Future Enhancements

1. **Retraction API integration** — Crossref, PubMed retraction APIs
2. **Wayback Machine fallback** — Archive.org for rotted links
3. **Domain reputation database** — External reputation scoring
4. **Citation graph visualization** — Interactive provenance graphs
5. **Integration with retrieval MCP** — Auto-capture during retrieval

---

## Version

**1.0.0** — Initial implementation (Phase 2, 2026-03-19)
