# Chronos System - Temporal Coherence Tracking

**Greek:** χρόνος (chronos) — "time"

**Purpose:** Track epistemic claims across sessions and detect **epistemic drift** — when claims shift, contradict prior claims, or are revised without explicit flagging.

---

## Overview

Chronos maintains a temporal ledger of all epistemic claims, enabling:
- Detection of contradictions between session-N and session-N+k
- Tracking of confidence drift over time
- Identification of unflagged belief revisions
- Visualization of epistemic timelines

---

## Architecture (L1-L4 Pattern)

### L1: Temporal Index Engine
**File:** `temporal_index.py`

Indexes claims by session timestamp for efficient temporal queries.

**Features:**
- Claim indexing with session metadata
- Time-range queries
- Session-based retrieval
- Claim versioning support
- Persistent storage (~/.abraxas/chronos/)

**Key Classes:**
- `ClaimRecord` — Data structure for indexed claims
- `TemporalIndex` — Main indexing engine

---

### L2: Drift Detection Engine
**File:** `drift_detection.py`

Detects epistemic drift patterns across claims.

**Drift Types:**
| Type | Description | Severity |
|------|-------------|----------|
| `CONTRADICTION` | Direct logical conflict | Critical |
| `LABEL_CHANGE` | Janus label changed | High |
| `CONFIDENCE_SHIFT` | Significant confidence change (>0.3) | Medium |
| `REFINEMENT` | Claim refined/clarified | Low |

**Detection Methods:**
- Semantic similarity comparison (lexical overlap)
- Contradiction pattern matching (negation, contrast markers)
- Confidence delta tracking
- Label change detection

**Key Classes:**
- `DriftReport` — Detected drift between claims
- `DriftDetector` — Main detection engine

---

### L3: Contradiction Resolution Engine
**File:** `contradiction_resolution.py`

Provides strategies for resolving temporal conflicts.

**Resolution Strategies:**
| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `RECENCY` | Prefer newer claim | Default, most common |
| `CONFIDENCE` | Prefer higher confidence | When confidence is reliable |
| `SOURCE_STRENGTH` | Prefer better sourced | Research/academic contexts |
| `MANUAL` | Require user decision | High-stakes conflicts |
| `MERGE` | Combine both claims | Complementary information |
| `FLAG` | Flag both as contested | Irreconcilable differences |

**Key Classes:**
- `ResolutionResult` — Outcome of resolution
- `ResolutionEngine` — Strategy application engine

---

### L4: Timeline Visualization Engine
**File:** `timeline_viz.py`

Generates epistemic timeline visualizations.

**Output Formats:**
- ASCII text timeline (CLI)
- HTML timeline (web view)
- JSON export (data interchange)
- Claim evolution traces

**Features:**
- Event timeline (claims, drifts, resolutions)
- Severity color coding
- Export to multiple formats
- Statistical summaries

**Key Classes:**
- `TimelineEvent` — Single timeline event
- `TimelineVisualizer` — Visualization engine

---

## Commands

```
/chronos index {text} [--session {id}] [--label {label}] [--confidence {0-1}]
    Index a new claim with temporal metadata

/chronos drift {claim_id} [--against {claim_id|all}]
    Detect drift for a specific claim

/chronos session-drift {session_id}
    Detect all drift within a session

/chronos resolve {drift_id} [--strategy {recency|confidence|source|manual|merge|flag}]
    Resolve a detected drift

/chronos timeline [--limit {n}] [--format {ascii|html|json}]
    Generate epistemic timeline

/chronos evolution {claim_id}
    Show evolution trace for a specific claim

/chronos stats
    Show index statistics

/chronos critical
    Show all critical severity drifts
```

---

## Integration with Existing Systems

### Janus Integration
Chronos reads Janus labels (`[KNOWN]/[INFERRED]/[UNCERTAIN]/[UNKNOWN]`) from indexed claims and detects when labels change across time.

### Logos Integration
Chronos can index claims decomposed by Logos, tracking drift at the atomic proposition level for finer-grained detection.

### Mnemosyne Integration
Chronos builds on Mnemosyne's session storage infrastructure, using session IDs for temporal indexing.

### Aletheia Integration
Aletheia tracks calibration over time; Chronos tracks consistency over time. Together they provide full temporal epistemic coverage.

---

## Usage Examples

### Example 1: Index a Claim
```python
from chronos import TemporalIndex

index = TemporalIndex()
claim_id = index.index_claim(
    text="The experiment showed p < 0.05",
    session_id="session_2026_03_19_001",
    janus_label="KNOWN",
    confidence=0.85,
    sources=["https://example.com/study"]
)
```

### Example 2: Detect Drift
```python
from chronos import DriftDetector

detector = DriftDetector(index)
drifts = detector.detect_drift(claim_id)

for drift in drifts:
    print(f"Drift: {drift.drift_type} - {drift.severity}")
    print(f"  {drift.description}")
```

### Example 3: Resolve Contradiction
```python
from chronos import ResolutionEngine, ResolutionStrategy

resolver = ResolutionEngine(index, default_strategy=ResolutionStrategy.RECENCY)

for drift in detector.get_critical_drifts():
    result = resolver.resolve(drift)
    print(f"Resolved: {result.action_taken}")
```

### Example 4: Generate Timeline
```python
from chronos import TimelineVisualizer

viz = TimelineVisualizer(index, detector.get_all_drifts(), resolver.get_all_resolutions())
print(viz.generate_ascii_timeline(limit=20))
viz.export_timeline("timeline.html", format="html")
```

---

## Testing

Run tests:
```bash
cd /abraxas/systems/chronos
python -m pytest test_chronos.py -v
```

**Test Coverage:**
- Temporal indexing (CRUD operations)
- Drift detection patterns
- Resolution strategy application
- Timeline generation

---

## Storage

Chronos persists data to `~/.abraxas/chronos/`:
- `temporal_index.json` — Claim index
- Future: `drift_reports.json`, `resolutions.json`

---

## Performance Considerations

- Index loading is lazy (on first access)
- Similarity computation uses lexical overlap (fast, no embeddings)
- For production: consider embedding-based similarity for better accuracy
- Timeline generation is O(n log n) due to sorting

---

## Future Enhancements

1. **Embedding-based similarity** — Replace lexical overlap with semantic embeddings
2. **Automatic claim linking** — Link related claims without explicit comparison
3. **Drift alerting** — Real-time notifications when critical drift detected
4. **Cross-user drift** — Compare claims across different users' sessions
5. **Integration with Honest skill** — Auto-flag drift in everyday queries

---

## Version

**1.0.0** — Initial implementation (Phase 2, 2026-03-19)
