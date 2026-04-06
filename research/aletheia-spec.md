# Aletheia Specification — Epistemic Calibration Tracking System

> **Version:** 1.0  
> **Status:** Ready for Implementation  
> **Created:** 2026-04-05  
> **Author:** Abraxas Subagent (Aletheia Spec Task)  
> **Based On:** genesis.md, aletheia/SKILL.md, aletheia-architecture.md, aletheia_tracker.py

---

## Executive Summary

Aletheia closes the epistemic loop. It transforms Abraxas from a system that *produces* confidence-labeled output into a system that *tracks whether those labels were accurate over time*.

**The Problem:** Epistemic labeling (e.g., `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`) is meaningless without ground-truth feedback. Without tracking whether labels were correct, confidence becomes theater.

**The Solution:** Aletheia maintains an append-only resolution index (`~/.janus/resolutions.md`) that records whether labeled claims were later confirmed, disconfirmed, or superseded. It provides calibration reports showing whether your confidence matches reality.

**Core Insight:** Calibration ≠ Accuracy. A well-calibrated `[UNCERTAIN]` label should have ~40-60% disconfirmation. A well-calibrated `[KNOWN]` label should have >95% confirmation. The goal is honest self-knowledge, not perfect prediction.

---

## System Purpose

### What Aletheia Tracks

| Label | Expected Confirmation Rate | Meaning |
|:---|:---|:---|
| `[KNOWN]` | >95% | Verified fact, strong grounding |
| `[INFERRED]` | 70-85% | Derived through clear reasoning |
| `[UNCERTAIN]` | 40-70% | Relevant but not fully verifiable (high disconfirmation is healthy) |
| `[UNKNOWN]` | Not scored | Tracked but not accuracy-scored; remains open indefinitely |

### What Aletheia Is NOT

- ❌ **Not model evaluation** — Does not measure AI system accuracy
- ❌ **Not a scorecard** — Does not label users as "good" or "bad"
- ❌ **Not for `[DREAM]` material** — Symbolic content is not truth-testable
- ❌ **Not real-time** — Resolutions happen after the fact, when ground truth emerges

### What Aletheia IS

- ✅ **Personal epistemic feedback** — Your history of engaging with uncertainty
- ✅ **Calibration practice** — Builds awareness of confidence vs. reality
- ✅ **Append-only ledger** — Immutable record of resolutions
- ✅ **Drift detection** — Flags when calibration degrades over time

---

## Architecture

### Persistence Layer

```
~/.janus/
├── ledger.md                  # Janus epistemic ledger (immutable, read-only for Aletheia)
├── sessions/
│   ├── {uuid-1}.md           # Closure Reports with labeled claims (immutable)
│   ├── {uuid-2}.md
│   └── ...
├── config.md                  # User preferences (Janus-controlled)
└── resolutions.md            # Aletheia resolution index (append-only, Aletheia-controlled)
```

### Key Invariants

1. **Janus ledger is immutable** — Aletheia never modifies `ledger.md` or `sessions/*.md`
2. **Resolutions are append-only** — New entries appended; existing entries never modified
3. **Sol-mode only** — Only `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]` can be resolved
4. **Session-keyed** — All resolutions reference a Janus session UUID

### resolutions.md Schema

```markdown
# Janus Resolution Index

Auto-managed by Aletheia skill. Do not edit by hand.
Schema version: 1.0
Last updated: 2026-04-05T12:00:00Z

## Session {session-uuid}

**Session opened:** 2026-04-05
**Total resolutions:** 3

### [KNOWN] Resolutions

- **Climate feedback loops**
  - Original claim: "[KNOWN] Arctic permafrost thaw releases methane"
  - Status: confirmed
  - Resolution date: 2026-04-10
  - Resolution note: "Confirmed by NOAA methane monitoring data Q1 2026"

### [INFERRED] Resolutions

- **AI timeline prediction**
  - Original claim: "[INFERRED] AGI will be achieved by 2030"
  - Status: disconfirmed
  - Resolution date: 2026-06-15
  - Resolution note: "Major architectural bottleneck discovered; timeline pushed to 2035+"

### [UNCERTAIN] Resolutions

- **Market prediction**
  - Original claim: "[UNCERTAIN] Remote work will remain >30% of tech jobs"
  - Status: superseded
  - Resolution date: 2026-05-20
  - Resolution note: "Superseded by: Hybrid models now dominate at ~40%; fully remote declined to 15%"
```

### Data Structures (Internal)

```python
class Resolution:
    session_uuid: str           # References Janus session
    claim_text: str             # Exact text from ledger
    label_type: str             # KNOWN | INFERRED | UNCERTAIN | UNKNOWN
    status: str                 # confirmed | disconfirmed | superseded
    resolution_date: str        # ISO 8601 timestamp
    resolution_note: str        # User narrative (optional)
    actual_finding: str         # Required for disconfirm/supersede
    created_at: str             # ISO 8601 timestamp

class CalibrationReport:
    period_days: int
    total_resolutions: int
    by_label: dict[str, LabelStats]
    trend: dict[str, float]     # Change in confirmation rate vs prior period
    flags: list[str]            # Warnings about drift, bias, anomalies

class LabelStats:
    confirmed: int
    disconfirmed: int
    superseded: int
    confirmation_rate: float    # confirmed / total
    expected_range: tuple       # (min, max) expected confirmation rate
    status: str                 # WELL-CALIBRATED | CAUTION | ALERT
```

---

## Command Specification

### `/aletheia confirm {claim}`

**Purpose:** Mark a labeled claim as confirmed by subsequent evidence.

**Syntax:**
```
/aletheia confirm "claim text"
/aletheia confirm session:{uuid}
/aletheia confirm    # Interactive mode: list unresolved claims from current session
```

**Behavior:**
1. Search `ledger.md` and `sessions/*.md` for exact claim match (case-insensitive)
2. If not found, offer fuzzy search with top 5 candidates
3. Verify claim has Sol-mode label (not `[DREAM]`)
4. Check if resolution already exists; if so, offer to update
5. Prompt for optional resolution note (Enter to skip)
6. Append resolution to `resolutions.md`

**Output:**
```
✓ Confirmed: "[KNOWN] Arctic permafrost thaw releases methane"
  Resolution date: 2026-04-10
  Note: "Confirmed by NOAA methane monitoring data Q1 2026"

Entry written to ~/.janus/resolutions.md
```

**Error Cases:**
- Claim not found → Show fuzzy search results
- `[DREAM]` label → Redirect to `/chronicle ledger`
- Resolution exists → Offer update or replacement

---

### `/aletheia disconfirm {claim}`

**Purpose:** Mark a labeled claim as disconfirmed; record what was actually true.

**Syntax:**
```
/aletheia disconfirm "claim text"
/aletheia disconfirm session:{uuid}
/aletheia disconfirm
```

**Behavior:**
1. Same search/resolution flow as `confirm`
2. **Require** "actual finding" field (what is actually true)
3. Optional context note

**Output:**
```
✗ Disconfirmed: "[INFERRED] AGI will be achieved by 2030"
  Actual finding: "Major architectural bottleneck discovered; timeline pushed to 2035+"
  Resolution date: 2026-06-15
  Note: "Consensus from AGI safety summit June 2026"

Entry written to ~/.janus/resolutions.md
```

---

### `/aletheia supersede {claim}`

**Purpose:** Mark a labeled claim as superseded (context changed; not wrong, now outdated).

**Syntax:**
```
/aletheia supersede "claim text"
/aletheia supersede session:{uuid}
/aletheia supersede
```

**Behavior:**
1. Same search/resolution flow as `confirm`
2. **Require** "superseded by" field (what replaced it)
3. Optional context note

**Output:**
```
⟳ Superseded: "[INFERRED] Best text editor for Python: VS Code"
  Superseded by: "Best text editor for Python: Neovim (as of 2026, for developers already in shell ecosystems)"
  Resolution date: 2026-03-10
  Context: "Community consensus shifted as Neovim ecosystem matured"

Entry written to ~/.janus/resolutions.md
```

---

### `/aletheia status`

**Purpose:** Show open epistemic debt — count of unresolved labeled claims.

**UX Constraint:** Must run in <2 seconds.

**Syntax:**
```
/aletheia status
```

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPISTEMIC DEBT — Unresolved Claims
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From 47 total sessions, 234 labeled claims remain unresolved.

[KNOWN]       18 unresolved  (expected: ~1 — very high priority)
[INFERRED]    67 unresolved  (expected: ~10–15 to resolve per 10 sessions)
[UNCERTAIN]   96 unresolved  (expected: ~20–30 per 10 sessions)
[UNKNOWN]     53 unresolved  (expected: keep unresolved; track indefinitely)

Last 5 unresolved (oldest first):
• [KNOWN] "AI regulation will be enacted in EU by 2025"  [Session 2024-11-15]
• [INFERRED] "LLM scaling will plateau by 2026"           [Session 2025-02-22]
• [UNCERTAIN] "Multimodal models will dominate by 2026"   [Session 2025-03-01]
• [INFERRED] "Python will remain most popular language"   [Session 2026-02-10]
• [UNKNOWN] "Cost of AGI research (when achieved)"        [Session 2026-03-01]

Use /aletheia queue to see full list.
Use /aletheia confirm|disconfirm|supersede to resolve claims.
```

**Lightweight Mode** (called in active Janus session):
```
3 unresolved from this session's prior work. Use /aletheia queue to review.
```

---

### `/aletheia calibration`

**Purpose:** Show calibration ledger — confirmation rates per label type with trend analysis.

**Syntax:**
```
/aletheia calibration
/aletheia calibration {days:30}
/aletheia calibration {days:90}
```

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALIBRATION LEDGER — Label Accuracy Over Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time period: Last 90 days
Data points: 145 resolved claims

[KNOWN] Claims — Expected: >95% confirmed
  ✓ Confirmed: 56 (86%)
  ✗ Disconfirmed: 7 (11%)
  ⟳ Superseded: 2 (3%)
  Accuracy: 86% [CAUTION: Below expected threshold]
  Trend: Declining (was 92% at 60-day mark)
  Confidence bias risk: MEDIUM

[INFERRED] Claims — Expected: 70–85% confirmed
  ✓ Confirmed: 42 (74%)
  ✗ Disconfirmed: 12 (21%)
  ⟳ Superseded: 1 (1%)
  Accuracy: 74% [WELL-CALIBRATED]
  Trend: Stable

[UNCERTAIN] Claims — Expected: 40–70% confirmed
  ✓ Confirmed: 8 (44%)
  ✗ Disconfirmed: 9 (50%)
  ⟳ Superseded: 1 (6%)
  Accuracy: 44% [WELL-CALIBRATED]
  Trend: Stable

[UNKNOWN] Claims
  Tracked but not resolved: 8
  ✓ Confirmed (when resolved): 2 (25%)
  ✗ Disconfirmed (when resolved): 6 (75%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL CALIBRATION QUALITY: MEDIUM

Concern: [KNOWN] accuracy has declined; review recent [KNOWN] claims.
Strength: [INFERRED] and [UNCERTAIN] are well-calibrated.
```

**Flag Conditions:**
| Condition | Flag |
|:---|:---|
| `[KNOWN]` < 85% | CAUTION: Below expected |
| `[KNOWN]` < 70% | ALERT: Critical underconfidence |
| `[INFERRED]` < 50% | ALERT: Lower than expected |
| `[INFERRED]` > 95% | CAUTION: Possible overconfidence |
| `[UNCERTAIN]` > 85% | CAUTION: Possible mislabeling |
| All labels > 95% | CAUTION: Possible confirmation bias |
| Trend < -5% | DRIFT: Calibration degrading |

---

### `/aletheia queue`

**Purpose:** List all unresolved claims, sorted by age (oldest first).

**Syntax:**
```
/aletheia queue
/aletheia queue [KNOWN]
/aletheia queue [INFERRED]
/aletheia queue [UNCERTAIN]
/aletheia queue [UNKNOWN]
```

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESOLUTION QUEUE — 234 Unresolved Claims
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[KNOWN] — 18 unresolved (HIGH PRIORITY)

1. [2024-11-15] "AI regulation will be enacted in EU by 2025"
   Session: 2024-11-15T09:22:33-UTC
   Status: OPEN for 482 days
   /aletheia confirm "AI regulation will be enacted in EU by 2025"

[... more claims ...]
```

---

### `/aletheia audit`

**Purpose:** Validate resolution index integrity; detect orphaned or conflicting resolutions.

**Syntax:**
```
/aletheia audit
/aletheia audit --fix-orphans
```

**Output (Healthy):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIT REPORT — Aletheia Resolution Index
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✓ HEALTHY

Total resolutions: 312
Sessions with resolutions: 28
Data consistency: 100%

No orphaned resolutions detected.
No session UUID conflicts detected.
No high-conflict topics detected.

Ledger integrity: OK
Resolutions.md format: OK
```

**Output (Issues):**
```
Status: ⚠ ISSUES FOUND

ORPHANED RESOLUTIONS (5)
  Session 2025-08-10T12:34:22-UTC
  Resolution: "[INFERRED] Quantum computers will break RSA"
  Action: Run /aletheia audit --fix-orphans

CONFLICTING RESOLUTIONS (2)
  Topic: "Python will remain most popular language"
  Resolution 1: confirmed (2026-01-15)
  Resolution 2: disconfirmed (2026-02-20)
  Note: Expected if belief changed; review for clarity.
```

---

## Integration Points

### Required: Janus System

Aletheia reads from:
- `~/.janus/ledger.md` — Main epistemic ledger
- `~/.janus/sessions/{uuid}.md` — Session Closure Reports

Aletheia writes to:
- `~/.janus/resolutions.md` — Resolution index (created on first use)

**Dependency:** Janus must be installed and active for Aletheia to function.

### Optional: Honest

Honest commands produce Sol-mode output with confidence labels. These claims are resolvable through Aletheia.

### Optional: Agon (Future)

Agon Convergence Reports contain labeled claims that are natural targets for Aletheia resolution.

### Optional: Abraxas Oneironautics

When `/bridge` produces Sol-mode analysis of Nox material, that Sol output is resolvable. The `[DREAM]` source material is not resolvable.

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

**Files to Create:**

```
skills/epistemic/aletheia/
├── SKILL.md                    # Main skill definition (exists, may need updates)
├── aletheia.py                 # Core Python module
├── resolver.py                 # Claim resolution logic
├── calibration.py              # Calibration report generation
├── storage.py                  # File I/O for resolutions.md
└── references/
    ├── aletheia-architecture.md  # Exists
    ├── calibration-practice.md   # Exists
    └── resolution-workflow.md    # Exists
```

**Files to Modify:**

```
skills/epistemic/
└── index.py                    # Add Aletheia to epistemic skill registry
```

**Key Components:**

1. **`storage.py`** — File I/O layer
   - `load_resolutions()` → Parse `resolutions.md`
   - `save_resolution(Resolution)` → Append entry
   - `create_header_if_needed()` → Initialize file with schema version
   - `backup_on_first_write()` → Create `.bak` copy

2. **`resolver.py`** — Claim matching
   - `find_claim(claim_text)` → Search ledger + sessions
   - `fuzzy_search(claim_text, threshold=0.8)` → Approximate matching
   - `validate_sol_label(label)` → Reject `[DREAM]`
   - `check_existing_resolution(uuid, claim)` → Detect duplicates

3. **`calibration.py`** — Report generation
   - `calculate_confirmation_rate(label_type)` → Stats per label
   - `calculate_trend(label_type, window_days)` → Compare periods
   - `generate_flags(stats)` → Warning conditions
   - `format_report(report)` → Human-readable output

4. **`aletheia.py`** — Command dispatcher
   - `confirm(claim, note)` → Main confirm logic
   - `disconfirm(claim, actual_finding, note)` → Disconfirm logic
   - `supersede(claim, superseded_by, note)` → Supersede logic
   - `status()` → Unresolved count
   - `calibration(days)` → Calibration report
   - `queue(label_filter)` → Unresolved list
   - `audit(fix_orphans)` → Integrity check

---

### Phase 2: Command Handlers (Week 2)

**Skill Command Registration:**

```python
# In SKILL.md or index.py
COMMANDS = {
    "/aletheia confirm": confirm_handler,
    "/aletheia disconfirm": disconfirm_handler,
    "/aletheia supersede": supersede_handler,
    "/aletheia status": status_handler,
    "/aletheia calibration": calibration_handler,
    "/aletheia queue": queue_handler,
    "/aletheia audit": audit_handler,
}
```

**Interactive Modes:**

- `confirm` with no args → List unresolved from current session
- `disconfirm` with no args → Same
- `supersede` with no args → Same
- All support `session:{uuid}` filter

---

### Phase 3: Test Cases (Week 2-3)

**Unit Tests:**

```python
# tests/test_aletheia_storage.py
def test_create_resolutions_file():
    """Verify resolutions.md created with correct header"""
    
def test_append_resolution():
    """Verify resolution appended without modifying existing"""
    
def test_backup_on_first_write():
    """Verify .bak file created on first write"""

# tests/test_aletheia_resolver.py
def test_exact_claim_match():
    """Verify exact claim text found in ledger"""
    
def test_fuzzy_claim_match():
    """Verify fuzzy search returns candidates"""
    
def test_reject_dream_label():
    """Verify [DREAM] claims rejected with helpful message"""
    
def test_detect_existing_resolution():
    """Verify duplicate resolution detected"""

# tests/test_aletheia_calibration.py
def test_confirmation_rate_calculation():
    """Verify rate = confirmed / (confirmed + disconfirmed + superseded)"""
    
def test_trend_calculation():
    """Verify trend = current_rate - prior_rate"""
    
def test_flag_conditions():
    """Verify flags triggered at correct thresholds"""
```

**Integration Tests:**

```python
# tests/test_aletheia_integration.py
def test_full_confirm_workflow():
    """End-to-end: claim → confirm → resolution in file"""
    
def test_calibration_report_generation():
    """Generate report with 100+ resolutions"""
    
def test_audit_with_orphans():
    """Create orphaned resolution, verify audit detects it"""
```

**Test Data:**

```python
# tests/fixtures/aletheia_fixtures.py
SAMPLE_CLAIMS = [
    ("[KNOWN] Water boils at 100°C at sea level", True),
    ("[INFERRED] AI scaling will continue through 2027", None),  # Unresolved
    ("[UNCERTAIN] Remote work will remain >30%", False),  # Disconfirmed
    ("[UNKNOWN] Cost of AGI research", None),  # Unresolved by design
]
```

---

### Phase 4: Performance Optimization (Week 3)

**Indexing Strategy:**

```python
# ~/.janus/.aletheia-index (auto-maintained, hidden)
{
    "claim_hash": {
        "session_uuid": "...",
        "label_type": "KNOWN",
        "ledger_offset": 12345
    }
}
```

**Caching:**

- Cache unresolved counts (invalidate on write)
- Cache calibration stats for 5 minutes
- Lazy-load resolution details

**Performance Targets:**

| Operation | Target | Fallback |
|:---|:---|:---|
| `/aletheia confirm` | <0.5s | <2s |
| `/aletheia status` | <0.2s | <1s |
| `/aletheia calibration` | <1s | <3s |
| `/aletheia queue` | <0.5s | <2s |
| `/aletheia audit` | <1s | <5s |

---

### Phase 5: Documentation & Polish (Week 4)

**User Documentation:**

- Update `README.md` with Aletheia overview
- Add `docs/aletheia/` with:
  - `getting-started.md` — First resolution workflow
  - `calibration-guide.md` — Interpreting reports
  - `faq.md` — Common questions

**Skill Documentation:**

- Ensure `SKILL.md` has complete command reference
- Add examples for each command
- Document error messages

---

## Test Case Design

### Unit Test Coverage

| Component | Tests | Purpose |
|:---|:---|:---|
| `storage.py` | 8 | File I/O, backups, schema validation |
| `resolver.py` | 12 | Claim matching, fuzzy search, label validation |
| `calibration.py` | 10 | Rate calculation, trends, flags |
| `aletheia.py` | 15 | Command handlers, error cases |
| **Total** | **45** | |

### Integration Test Coverage

| Workflow | Tests | Purpose |
|:---|:---|:---|
| Confirm flow | 3 | Full resolution lifecycle |
| Calibration report | 2 | Report generation with various data sizes |
| Audit flow | 2 | Orphan detection and cleanup |
| Edge cases | 5 | Empty ledger, corrupted files, missing sessions |
| **Total** | **12** | |

### Manual Test Scenarios

1. **First-time user:**
   - Run `/aletheia status` on empty system
   - Make first resolution
   - Verify `resolutions.md` created with header

2. **Calibration drift:**
   - Seed 100+ resolutions with known rates
   - Run `/aletheia calibration`
   - Verify flags triggered correctly

3. **Audit recovery:**
   - Delete a session file manually
   - Run `/aletheia audit`
   - Verify orphan detected
   - Run `--fix-orphans`
   - Verify cleanup successful

---

## Risk Analysis

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|:---|:---|:---|:---|
| Ledger corruption | Low | High | Backup on first write; audit command |
| Performance degradation | Medium | Medium | Indexing; caching; lazy loading |
| Fuzzy search false positives | Medium | Low | Show candidates; require user selection |
| Schema evolution | Medium | Medium | Schema version in header; migration path |

### UX Risks

| Risk | Likelihood | Impact | Mitigation |
|:---|:---|:---|:---|
| Commands feel bureaucratic | Medium | High | 2-second constraint; optional notes |
| Confirmation bias | High | High | Explicit warnings; disconfirmation tracking |
| Users ignore epistemic debt | Medium | Medium | Status shown at session open |
| Confusion about `[UNKNOWN]` | Medium | Low | FAQ; clear documentation |

---

## Success Metrics

### Functional Metrics

- ✅ All 7 commands implemented and tested
- ✅ `resolutions.md` schema v1.0 stable
- ✅ Integration with Janus verified
- ✅ Performance targets met (<2s for all commands)

### Calibration Metrics

- ✅ Users can see their confirmation rates per label type
- ✅ Trend detection working (60-day comparison)
- ✅ Flag conditions triggered correctly

### UX Metrics

- ✅ First resolution completed in <5 minutes
- ✅ `/aletheia status` runs in <2 seconds
- ✅ Error messages are actionable

---

## Future Extensions (Post-v1.0)

### Possible Enhancements

1. **Tagging** — Add `#forecast`, `#hypothesis`, `#learned` tags to resolutions
2. **Time-weighted calibration** — Weight recent resolutions higher than old ones
3. **Evidence linking** — Allow URLs/citations in resolution notes
4. **Batch operations** — `/aletheia confirm claim1, claim2, claim3`
5. **Comparative calibration** — Compare calibration across time periods or domains
6. **Agon integration** — Auto-import Convergence Reports as resolvable claims

### Schema Extension Path

All extensions maintain backward compatibility:
- New fields are optional
- Old schema versions are detected and migrated
- `schema-version` in header tracks format

---

## Appendix A: Command Quick Reference

| Command | Purpose | Required Args | Optional Args |
|:---|:---|:---|:---|
| `/aletheia confirm` | Mark claim confirmed | claim text or session ref | resolution note |
| `/aletheia disconfirm` | Mark claim disconfirmed | claim text, actual finding | context note |
| `/aletheia supersede` | Mark claim superseded | claim text, superseded by | context note |
| `/aletheia status` | Show unresolved count | none | none |
| `/aletheia calibration` | Show calibration report | none | days (30, 90, etc.) |
| `/aletheia queue` | List unresolved claims | none | label filter |
| `/aletheia audit` | Validate integrity | none | --fix-orphans |

---

## Appendix B: File Paths Summary

| File | Purpose | Created By | Mutable |
|:---|:---|:---|:---|
| `~/.janus/ledger.md` | Epistemic ledger | Janus | No |
| `~/.janus/sessions/*.md` | Closure Reports | Janus | No |
| `~/.janus/resolutions.md` | Resolution index | Aletheia | Append-only |
| `~/.janus/.aletheia-index` | Performance index | Aletheia | Yes (auto) |
| `skills/epistemic/aletheia/` | Skill code | Implementation | Yes |

---

## Appendix C: Glossary

| Term | Definition |
|:---|:---|
| **Aletheia** | Greek "un-hiddenness"; truth as disclosure, not possession |
| **Calibration** | Match between confidence and reality |
| **Confirmation rate** | % of claims marked confirmed / total resolved |
| **Disconfirmation rate** | % of claims marked disconfirmed / total resolved |
| **Epistemic debt** | Unresolved labeled claims |
| **Resolution** | Act of marking a claim as confirmed/disconfirmed/superseded |
| **Sol-mode** | Factual output with `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]` labels |
| **Nox-mode** | Symbolic output with `[DREAM]` label (not resolvable) |

---

*End of Aletheia Specification v1.0*
