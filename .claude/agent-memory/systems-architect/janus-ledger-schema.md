# Janus Epistemic Ledger — Schema Analysis for Veritas Integration

**Date:** 2026-03-05
**Agent:** systems-architect
**Context:** Research for Phase 3 — Dialogue Engine & Veritas skill
**Task:** Analyze `~/.janus/` schema and identify extension points for ground-truth resolution tracking

---

## Executive Summary

The Janus Epistemic Ledger is a **structured append-only persistence layer** that tracks epistemic findings across sessions. It consists of three files (`ledger.md`, `sessions/{uuid}.md`, `config.md`) in a markdown-based format optimized for human readability and git-friendly diffs.

**Key Finding:** The current schema is **designed for observation, not mutation**. It appends on session close but never modifies existing entries. Veritas requires adding **three mutable fields** (`resolution_status`, `resolution_date`, `resolution_note`) to closed ledger entries **without breaking existing structure**.

**Recommended Approach:** Add resolution metadata as a **separate `resolutions/` directory** alongside `sessions/`, keyed by session UUID. This preserves backward compatibility, avoids mutation of the main ledger, and allows Veritas to write independently.

---

## Current Schema

### Directory Structure

```
~/.janus/
├── ledger.md           # Main chronological append-only ledger
├── sessions/           # Individual session closure reports (one per session)
│   ├── {uuid-1}.md
│   ├── {uuid-2}.md
│   └── ...
└── config.md           # User preferences and metadata
```

### ledger.md — Format and Fields

**Nature:** Append-only chronicle. Never rewritten; only appended.

**Markdown Structure:**

```markdown
# Janus Epistemic Ledger

## Session {timestamp-uuid}

**Intent:** {user-declared intent}

**Epistemic Balance:**
- Sol outputs: {count}
- Nox outputs: {count}
- Split responses: {count}

**[UNKNOWN] marks:**
- {topic}: {what Sol declined to fabricate}

**[INFERRED] marks:**
- {topic}: {reasoning chain summary}

**[UNCERTAIN] marks:**
- {topic}: {what remains unresolved}

**Anti-sycophancy events:**
- {description}: {what Sol pushed back on}

**Contamination events:**
- {description}: {what was caught at the Threshold}

**Key findings:**
- {1-2 sentence summary}

**Symbols bridged:**
- {symbol}: {Sol analysis summary}
```

**Key Fields (read-only):**

| Field | Type | Purpose | Mutable? |
|:---|:---|:---|:---|
| Session {uuid} | Header | Session identifier, timestamp-based | No |
| Intent | Text | User-declared epistemic intent for the session | No |
| Epistemic Balance | Metrics | Counts of Sol/Nox/Split outputs | No |
| [UNKNOWN] marks | List | Topics Sol declined to fabricate | No |
| [INFERRED] marks | List | Reasoning chains and inferences | No |
| [UNCERTAIN] marks | List | Acknowledged uncertainties | No |
| Anti-sycophancy events | List | Pushback incidents with reasoning | No |
| Contamination events | List | Cross-contamination caught at Threshold | No |
| Key findings | List | 1-2 sentence session summary | No |
| Symbols bridged | List | Abraxas symbols passed to Sol | No |

---

### sessions/{uuid}.md — Full Session Closure Report

**Nature:** Individual session archive. Each `/session close` writes a complete Closure Report.

**Format:**

```
SESSION CLOSURE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session ID:         {timestamp-uuid}
Intent declared:    {intent}
Duration:           {session length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPISTEMIC BALANCE
  Sol outputs:      {count}
  Nox outputs:      {count}
  Split responses:  {count}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTAMINATION
  Events caught:    {count}
  Events passed:    {count}
  Sycophancy pulls: {count}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOL RECORD
  [KNOWN] marks:    {count}
  [INFERRED] marks: {count}
  [UNCERTAIN] marks:{count}
  [UNKNOWN] marks:  {count}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANTI-SYCOPHANCY
  Events:           {count}
  Details:          {list of pushback events}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTENT ASSESSMENT
  Was the declared intent addressed?  {Yes / Partially / No}
  Key finding:      {one sentence}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYMBOLS BRIDGED
  {symbol}: {Sol analysis summary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Appended to ~/.janus/ledger.md]
[Saved to ~/.janus/sessions/{uuid}.md]
```

**Key Observation:** This report is **comprehensive but summary-level** — it tracks metrics and key findings, not individual claim-level truth values.

---

### config.md — Configuration

**Format:**

```markdown
auto-load: true
default-frame: {optional named frame}
```

**Mutable?** Yes (user can edit preferences).

---

## Live Ledger Sample

The `~/.janus/` directory does **not yet exist** on the current system. It will be created on first `/session close` in any session that uses Janus.

**Predicted first entry structure:**

```markdown
# Janus Epistemic Ledger

## Session 2026-03-05T12:34:56-UTC

**Intent:** Explore epistemic boundaries of AI hallucination

**Epistemic Balance:**
- Sol outputs: 5
- Nox outputs: 2
- Split responses: 1

**[UNKNOWN] marks:**
- Real-time LLM model weights: Sol declined to provide specific numbers without access to model card

**[INFERRED] marks:**
- Threshold routing: Factual queries reliably route to Sol; pattern holds across 8 observations this session

**[UNCERTAIN] marks:**
- Contamination frequency baseline: Too early to establish; single session lacks statistical significance

**Anti-sycophancy events:**
- User framed hallucination as "inevitable model property"; Sol noted distinction between architectural and behavioral hallucination

**Contamination events:**
- None caught

**Key findings:**
- Anti-sycophancy constraint functions as documented; user receptive to pushback when grounded in evidence.

**Symbols bridged:**
- None this session
```

---

## Extension Options for Veritas

Veritas must add three fields to track ground-truth resolution:

- `resolution_status` — one of: `confirmed`, `disconfirmed`, `superseded`, `open`
- `resolution_date` — when resolution was recorded (ISO 8601)
- `resolution_note` — user narrative explaining the resolution

**Problem:** The current ledger structure uses append-only markdown. Modifying closed entries breaks the immutability guarantee and makes diffs noisy.

### Option 1: Inline Resolution Fields (Direct Mutation)

**Approach:** Modify `ledger.md` and individual `sessions/{uuid}.md` files to add resolution fields directly.

**Structure:**

```markdown
## Session {uuid}

**Intent:** {intent}

... (existing fields) ...

**Resolution Status:** confirmed
**Resolution Date:** 2026-03-10
**Resolution Note:** Hypothesis about threshold routing validated in follow-up session; confirmed.
```

**Pros:**
- Single source of truth; all session data in one place
- Simple for users to review: full session history with resolutions in-line
- No additional files to manage

**Cons:**
- **Breaks append-only guarantee** — existing ledger entries become mutable
- Diffs become messy when entries are retroactively updated
- Harder to audit "what changed?" — git history becomes convoluted
- Couples Veritas lifecycle tightly to ledger file format
- Risk of accidental ledger corruption if resolution writes fail mid-edit
- Not suitable for complex resolution scenarios (multiple resolutions per claim, conflicting resolutions)

**Risk Level:** HIGH — violates the foundational design principle (append-only).

---

### Option 2: Separate Resolution Index (Sidecar File)

**Approach:** Create a parallel `resolutions.md` index file in `~/.janus/` that maps session UUIDs to resolution data.

**Structure:**

```markdown
# Janus Resolution Index

## Session {uuid-1}

**Session Date:** 2026-03-05
**Resolution Date:** 2026-03-10

**Resolutions:**
- Topic: "{topic from original [UNKNOWN] mark}"
  Status: confirmed
  Note: "User confirmed this hypothesis in follow-up conversation"
  Resolved Claim: "{exact text of the claim or finding}"

- Topic: "{another topic}"
  Status: disconfirmed
  Note: "Later evidence showed the inference was incorrect"
  Resolved Claim: "{exact text}"

## Session {uuid-2}

**Session Date:** 2026-03-08
**Resolution Date:** 2026-03-12

**Resolutions:**
- Topic: "{topic}"
  Status: superseded
  Note: "Original finding superseded by more recent data"
  Prior Finding: "{original}"
  Superseding Finding: "{new}"
```

**Pros:**
- **Preserves append-only guarantee** — ledger.md never changes after closing
- Resolutions written independently without ledger modification risk
- Clean git diffs — each resolution write is visible and isolated
- Supports complex scenarios: multiple resolutions per session, audit trail
- Easy to "unresolved" — delete the index entry, original ledger remains intact
- Future-proof: can extend resolution schema without modifying ledger format

**Cons:**
- Requires two-file lookup (ledger + index) to see full session story
- Users must check both files to understand resolution state
- Slightly more complex query logic (`/veritas status` must cross-reference)

**Risk Level:** MEDIUM-LOW — safe architectural choice, single additional file

---

### Option 3: Per-Session Resolution Sidecar

**Approach:** Store resolution data in `sessions/` directory alongside Closure Reports, one JSON or YAML file per session.

**Structure:**

```
~/.janus/
├── ledger.md
├── sessions/
│   ├── {uuid-1}.md          # Closure Report
│   ├── {uuid-1}.resolutions # JSON sidecar (NEW)
│   ├── {uuid-2}.md
│   ├── {uuid-2}.resolutions
│   └── ...
└── config.md
```

**File Format:** `sessions/{uuid}.resolutions` (JSON or YAML)

```json
{
  "session_id": "{uuid}",
  "session_date": "2026-03-05",
  "resolutions": [
    {
      "topic": "{topic}",
      "original_finding": "{text}",
      "resolution_status": "confirmed",
      "resolution_date": "2026-03-10",
      "resolution_note": "User validation in follow-up"
    },
    {
      "topic": "{another topic}",
      "original_finding": "{text}",
      "resolution_status": "disconfirmed",
      "resolution_date": "2026-03-12",
      "resolution_note": "Contradicted by evidence"
    }
  ]
}
```

**Pros:**
- **Append-only ledger preserved** — ledger.md never modified
- Co-located with session data (same directory)
- Natural pairing: one session → one closure report + one resolution file
- Structured format (JSON/YAML) easier to parse programmatically
- Can include metadata (session_date, uuid) for quick lookup

**Cons:**
- Introduces structured format (JSON/YAML) into markdown-first ecosystem
- Requires parsing two different formats (markdown + JSON)
- File extension `.resolutions` is non-standard
- Less human-readable than markdown; users cannot easily view resolutions in a text editor
- Splits session data across two files (one markdown, one JSON) — cognitive load

**Risk Level:** MEDIUM — adds format complexity to an otherwise markdown-native system

---

## Recommended Approach: Option 2 (Separate Resolution Index)

**Rationale:**

1. **Architectural Integrity:** Preserves the append-only ledger invariant, which is foundational to Janus design.

2. **Safety:** Resolutions are written to an independent file; ledger corruption risk is zero.

3. **Git-Friendly:** Diffs are clean; each resolution is a new line, easy to audit.

4. **Query Performance:** `/veritas status` and `/veritas calibration-report` can scan the index efficiently without touching ledger entries.

5. **Future Extensibility:** Resolution schema can evolve independently of ledger format.

6. **Backward Compatibility:** Existing ledger files require zero changes. Veritas works on top of Janus without modification.

7. **Clear Separation of Concerns:** Janus owns observations; Veritas owns resolutions.

### Implementation Sketch

**File:** `~/.janus/resolutions.md`

**Format:**

```markdown
# Janus Resolution Index

Auto-managed by Veritas skill. Do not edit by hand.
Last updated: {timestamp}

## Session {uuid}

**Session opened:** {date}
**First resolution:** {date}
**Total resolutions:** {count}

### Resolved [UNKNOWN] Marks

- **{topic}**
  - Original: "[UNKNOWN] {text}"
  - Status: `confirmed` | `disconfirmed` | `superseded`
  - Date: {ISO 8601}
  - Note: "{user narrative}"
  - Evidence: {optional — user citation}

### Resolved [INFERRED] Marks

- **{topic}**
  - Original: "[INFERRED] {text}"
  - Status: `confirmed` | `disconfirmed` | `superseded`
  - Date: {ISO 8601}
  - Note: "{user narrative}"

### Resolved [UNCERTAIN] Marks

- **{topic}**
  - Original: "[UNCERTAIN] {text}"
  - Status: `confirmed` | `disconfirmed` | `superseded`
  - Date: {ISO 8601}
  - Note: "{user narrative}"

### Resolved Anti-Sycophancy Events

- **{description}**
  - Original: "{event text}"
  - Status: `confirmed` | `rejected_pushback`
  - Date: {ISO 8601}
  - Note: "{user narrative}"

---

## Session {uuid}

... (next session) ...
```

**Veritas Commands That Write to This Index:**

```
/veritas mark-confirmed {session-uuid} "{exact topic or claim}"
/veritas mark-disconfirmed {session-uuid} "{exact topic or claim}"
/veritas mark-superseded {session-uuid} "{old-claim}" "{new-claim}"
/veritas add-note {session-uuid} "{topic}" "{user note}"
/veritas evidence-link {session-uuid} "{topic}" "{URL or citation}"
```

**Veritas Commands That Read This Index:**

```
/veritas status                          # Show all open vs. resolved findings
/veritas calibration-report {timeframe}  # Accuracy statistics
/veritas open-debt                       # List unresolved [UNKNOWN] marks
/veritas confirmed-hypotheses            # List confirmed inferences
/veritas disconfirmation-rate            # Ratio of disconfirmed to total
/veritas resolution-history {session-uuid} # Show all resolutions for one session
```

---

## Schema Extension: CONSTITUTION.md Implications

When constitution-keeper updates CONSTITUTION.md with Veritas commands, it should note:

**New Veritas Fields:**

```yaml
veritas:
  commands:
    - mark-confirmed
    - mark-disconfirmed
    - mark-superseded
    - add-note
    - evidence-link
    - status
    - calibration-report
    - open-debt
    - confirmed-hypotheses
    - disconfirmation-rate
    - resolution-history

  persistence:
    - file: ~/.janus/resolutions.md
      format: markdown
      mutability: append-only (Veritas controlled)
      schema-version: 1.0

  integration-rules:
    - Veritas reads ledger.md (Janus domain)
    - Veritas writes only to resolutions.md (Veritas domain)
    - No modification of ledger.md or sessions/*.md
    - Backward compatible with Janus v2 ledgers (no ledger schema change)
```

---

## Risk Register

### Risk 1: Ledger Entry Staleness

**Issue:** User marks a claim as "confirmed" six months later, but the original ledger entry lacks context.

**Severity:** MEDIUM

**Mitigation:**
- Include full original text in `resolutions.md` entry
- Veritas commands always require exact topic/claim match (no fuzzy lookup)
- `/veritas resolution-history {session-uuid}` displays both ledger and resolution alongside each other

---

### Risk 2: Orphaned Resolutions

**Issue:** User deletes a session file manually; corresponding resolution becomes orphaned.

**Severity:** LOW

**Mitigation:**
- Document that session files and resolutions are coupled; never delete sessions manually
- `/veritas audit` command validates all session UUIDs in resolutions.md exist
- Resolutions for missing sessions are flagged as "orphaned" in audit output

---

### Risk 3: Resolution Conflicts

**Issue:** User marks the same claim as both "confirmed" AND "disconfirmed" in different sessions.

**Severity:** LOW

**Mitigation:**
- Veritas allows multiple resolutions per topic (expected behavior — beliefs can change)
- `/veritas calibration-report` flags high-conflict topics (multiple contradictory resolutions)
- User is responsible for narrative coherence; Veritas surfaces conflicts, does not suppress them

---

### Risk 4: Nox/[DREAM] Scoping Ambiguity

**Issue:** Can Veritas resolve `[DREAM]` (symbolic) material? How to distinguish symbolic confirmation from factual?

**Severity:** MEDIUM

**Mitigation:**
- Veritas operates **only on Sol output** ([KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN] marks)
- `[DREAM]` material is **out of Veritas scope** — it is symbolic, not truth-testable
- If user attempts `/veritas mark-confirmed` on a Nox [DREAM] entry, Veritas rejects with: "Cannot resolve [DREAM] material; resolution applies only to Sol epistemic labels"
- Document this in Veritas SKILL.md and CONSTITUTION.md

---

### Risk 5: Schema Version Drift

**Issue:** Veritas v1.0 writes resolutions in one format; Veritas v2.0 expects a different schema; old resolutions become unreadable.

**Severity:** MEDIUM

**Mitigation:**
- Include schema-version field in resolutions.md header
- Veritas v2+ must include a migration function (e.g., `/veritas migrate-legacy-resolutions`)
- Document schema versioning in architecture.md

---

## Open Questions

**For ai-rd-visionary:**

1. **Disconfirmation Rate Semantics:** Should `/veritas calibration-report` weight disconfirmations equally to confirmations, or should it distinguish between "false positive" (predicted but wrong) and "false negative" (missed but later discovered)?

2. **Nox/[DREAM] Interaction:** Should Veritas ever bridge to Abraxas symbols? Can users mark dream interpretations as "confirmed"? If so, how is that distinguished from factual truth?

3. **Evidence Linking:** Should Veritas support URL citations or only free-text notes? If URLs, should it validate reachability?

4. **Temporal Reasoning:** Should `/veritas calibration-report` account for time lag between original claim and resolution? (i.e., a claim resolved 2 years later may have lower signal than one resolved 1 week later)

---

**For skill-author:**

1. **Command Set Naming:** Is `/veritas mark-confirmed` the right UX, or should it be `/veritas confirm` (shorter) or `/veritas confirm-finding` (more explicit)?

2. **Batch Resolution:** Should users be able to resolve multiple claims in one command (e.g., `/veritas mark-confirmed {session} claim1, claim2, claim3`)? Or one at a time?

3. **Ledger Query Integration:** Should Veritas reuse Janus `/ledger query` syntax, or have independent `/veritas query` commands?

4. **Error Recovery:** If a resolution write fails (disk full, permission denied), what is the user recovery path?

---

**For brand-ux-architect:**

1. **Naming:** "Veritas" (Latin for truth) — does this aesthetic fit with Janus (Roman god), Abraxas (Gnostic figure), and Honest (plain-language)? Should Veritas be renamed for consistency?

2. **Metaphor:** What is Veritas's "face" or embodied metaphor? (Janus has two faces; Abraxas has the Shadow/Ego; Honest is the voice). Should Veritas be a figure, a tool, a witness?

---

## Summary Table: Extension Point Decision

| Aspect | Current Janus Design | Veritas Extension |
|:---|:---|:---|
| **Ledger Mutability** | Append-only; never modified | Preserved; Veritas writes elsewhere |
| **Resolution Storage** | N/A | New `~/.janus/resolutions.md` file |
| **Format** | Markdown (human-readable) | Markdown (consistent with Janus) |
| **Schema Versioning** | Not present | Added to resolutions.md header |
| **Backward Compatibility** | N/A | 100% — zero changes to ledger.md or sessions/ |
| **Query Mechanism** | `/ledger {query}` | `/veritas {query}` (independent) |
| **Risk Level** | N/A | LOW — isolated new file, no mutation |
| **CONSTITUTION.md Impact** | Already defined | Extends with Veritas commands + persistence spec |

---

## Next Steps

1. **ai-rd-visionary** reviews this schema analysis and resolves open questions in Veritas specification document.

2. **skill-author** uses schema + specification to author Veritas SKILL.md and package the skill.

3. **constitution-keeper** adds Veritas command registry to CONSTITUTION.md once skill is packaged.

4. **systems-architect** updates `docs/architecture.md` with Veritas → Janus persistence diagram.

5. **docs-architect** documents Veritas commands in `docs/skills.md` once skill is packaged.

---

## References

- **Janus Epistemic Ledger Spec:** `/Users/tylergarlick/@Projects/abraxas/skills/janus-system/references/epistemic-ledger.md`
- **Janus Architecture:** `/Users/tylergarlick/@Projects/abraxas/skills/janus-system/references/janus-architecture.md`
- **Architecture Docs:** `/Users/tylergarlick/@Projects/abraxas/docs/architecture.md`
- **PLAN.md — Phase 3 Veritas Tasks:** `/Users/tylergarlick/@Projects/abraxas/PLAN.md` (lines 50–58)
- **CONSTITUTION.md:** `/Users/tylergarlick/@Projects/abraxas/CONSTITUTION.md`
