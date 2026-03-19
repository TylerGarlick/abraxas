# Aletheia Architecture

## System Design

Aletheia is a **calibration feedback engine** that sits atop the Janus epistemic ledger without modifying it. It extends the Janus system with ground-truth tracking, allowing users to resolve labeled claims after the fact and maintain a personal calibration record.

### Design Principles

**1. Append-Only Immutability**

The core Janus ledger (`~/.janus/ledger.md`, `~/.janus/sessions/{uuid}.md`) is immutable. Aletheia never modifies these files. Instead, it writes to a separate `~/.janus/resolutions.md` file — a parallel index that maps claims to their resolutions.

**Rationale:** The Janus ledger is a temporal record of epistemic observations. It should not be rewritten. Resolutions are metadata *about* those observations; they belong in a separate layer.

**Implementation consequence:** Queries sometimes require cross-referencing two files (ledger + resolution index), but this ensures data integrity and clean audit trails.

**2. User-Centric Calibration**

Aletheia's calibration ledger is owned by the user. It records the user's *personal* epistemic practice — what they labeled with what confidence, and whether they were right.

**This is NOT:**
- Model evaluation (measuring AI system accuracy)
- Statistical research (aggregating calibration across many users)
- Scoring (rewarding or penalizing the user)

**This IS:**
- A personal feedback system (did my confidence match reality?)
- A practice instrument (how can I improve my epistemic discipline?)
- A mirror (what do my calibration patterns reveal about my reasoning?)

**Implementation consequence:** Aletheia never labels the user as "good" or "bad." It shows patterns and raises questions.

**3. Friction-Driven Visibility**

Unresolved claims should be visible and slightly uncomfortable to ignore. `/aletheia status` surfaces epistemic debt at session open. The goal is to encourage resolution practice, not to police the user.

**Implementation consequence:** Lightweight, fast queries (2-second runs). Complex operations are available but not default.

---

## Persistence Layer

### File Structure

```
~/.janus/
├── ledger.md                  # Append-only chronicle (Janus, immutable)
├── sessions/
│   ├── {uuid-1}.md           # Closure Report (Janus, immutable)
│   ├── {uuid-2}.md
│   └── ...
├── config.md                  # User preferences (Janus, mutable)
└── resolutions.md            # Resolution index (Aletheia, append-only Aletheia-controlled)
```

### `~/.janus/resolutions.md` Schema

**Header (written once on first use):**

```markdown
# Janus Resolution Index

Auto-managed by Aletheia skill. Do not edit by hand.
Schema version: 1.0
Last updated: 2026-03-10T14:22:33-UTC
```

**Per-session blocks:**

```markdown
## Session {uuid}

**Session opened:** {ISO 8601 date}
**Total resolutions:** {count}

### [KNOWN] Resolutions

- **{topic}**
  - Original claim: "{exact text from ledger}"
  - Status: confirmed | disconfirmed | superseded
  - Resolution date: {ISO 8601}
  - Resolution note: "{narrative}"

### [INFERRED] Resolutions

[... same format ...]

### [UNCERTAIN] Resolutions

[... same format ...]

### [UNKNOWN] Resolutions

[... same format ...]
```

**Append-only constraint:** New sessions are appended; existing sessions are never modified. If a user re-resolves a claim, a new entry is added to that session's section, and the old entry is archived or replaced (implementation choice — can go either way).

### Schema Versioning

The `resolutions.md` header includes `schema-version: 1.0`. This allows future versions of Aletheia to:

1. Detect legacy resolutions in older schema formats
2. Provide migration paths (e.g., `/aletheia migrate-legacy-resolutions`)
3. Maintain backward compatibility

Current schema version: **1.0**

---

## Query Algorithms

### Claim Search (Used by confirm/disconfirm/supersede)

When user provides a claim string (e.g., `/aletheia confirm "COVID vaccines are >90% effective"`):

**Algorithm:**

1. **Exact match search** (preferred)
   - Search ledger.md for exact string match (case-insensitive)
   - If found, extract session UUID and label type
   - Return: (uuid, label, exact_text, context)

2. **Fuzzy search** (fallback)
   - If exact match fails, compute similarity score for all claims in ledger
   - Return top 5 candidates ranked by similarity
   - User selects the intended claim
   - Extract metadata as above

3. **Context window** (optimization)
   - If user provides session ref (`/aletheia confirm session:{uuid}`), search only that session's claims
   - Reduces search space significantly for users with large ledgers

**Time complexity:**
- Exact match: O(n) where n = number of claims in ledger
- Fuzzy search: O(n log n) with approximate string matching
- With session filter: O(m) where m = claims in that session

**Optimization for large ledgers:**
- Build an index on first use: `~/.janus/.aletheia-index` (hidden file, auto-maintained)
- Index maps claim → (session_uuid, label_type, ledger_offset)
- Enables O(log n) lookup after index is warm

---

### Calibration Report (Used by /aletheia calibration)

**Algorithm:**

1. **Load resolutions.md**
   - Parse all resolutions
   - Group by label type: [KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]

2. **Calculate base metrics**
   ```
   for each label_type:
       confirmed = count(status == "confirmed")
       disconfirmed = count(status == "disconfirmed")
       superseded = count(status == "superseded")

       total = confirmed + disconfirmed + superseded
       confirmation_rate = confirmed / total
       disconfirmation_rate = disconfirmed / total
       supersession_rate = superseded / total
   ```

3. **Calculate trend (if data available)**
   ```
   period_current = claims resolved in last X days
   period_prior = claims resolved in prior X days (using date-based filtering)

   for each label_type:
       trend = confirmation_rate_current - confirmation_rate_prior
       flag if trend < -0.05 (declining by >5%, possible calibration drift)
   ```

4. **Compare against expected ranges**
   ```
   [KNOWN]:      expected >95% confirmed
   [INFERRED]:   expected 70–85% confirmed
   [UNCERTAIN]:  expected 40–70% confirmed (high disconfirmation is healthy)
   [UNKNOWN]:    not scored (remains open indefinitely)
   ```

5. **Flag anomalies**
   - If [KNOWN] confirmation < 85%, flag: "CAUTION: Below expected"
   - If [INFERRED] confirmation < 50%, flag: "ALERT: Lower than expected"
   - If [UNCERTAIN] confirmation > 85%, flag: "CAUTION: Possible mislabeling or overconfidence"
   - If overall confirmation > 95%, flag: "CAUTION: Possible confirmation bias"
   - If disconfirmation rate declining over time, flag: "DRIFT: Calibration may be degrading"

6. **Produce summary**
   - Display formatted table with metrics, trends, and flags
   - Include interpretive guidance
   - Recommend actions (audit, review specific label type, etc.)

**Time complexity:** O(n) where n = total resolved claims (must scan all resolutions).

**Performance note:** For users with 1000+ resolutions, this can take 1–2 seconds. Acceptable.

---

### Status Query (Used by /aletheia status)

**Algorithm:**

1. **Count unresolved claims per label type**
   ```
   for each session in ~/janus/sessions/
       for each label in that session's report
           if (session_uuid, label) not in resolutions.md:
               unresolved[label_type] += 1
   ```

2. **Calculate expected unresolved**
   ```
   expected[KNOWN] = num_sessions * 0.1  (expect ~10% of KNOWN to remain unresolved)
   expected[INFERRED] = num_sessions * 0.4  (expect ~40% to remain unresolved)
   expected[UNCERTAIN] = num_sessions * 0.5  (expect ~50% to remain unresolved)
   expected[UNKNOWN] = num_sessions * 0.8  (expect ~80% to remain open)

   These are rough heuristics; adjust based on user behavior.
   ```

3. **Surface oldest unresolved claims**
   ```
   sort all unresolved claims by session date (oldest first)
   return top 5 for user review
   ```

4. **Produce summary**
   - Total count per label type
   - Comparison to expected
   - Age of oldest claims (highlight very old items)
   - Quick actions (copy-paste command to resolve next item)

**Time complexity:** O(n) where n = number of sessions.

**Performance optimization:** Cache unresolved counts; invalidate cache when `/aletheia confirm/disconfirm/supersede` is called.

---

### Audit Query (Used by /aletheia audit)

**Algorithm:**

1. **Validate all resolutions.md entries**
   ```
   for each resolution in resolutions.md:
       session_uuid = resolution.session_uuid
       claim_text = resolution.original_claim

       # Check session exists
       if not exists(~/.janus/sessions/{uuid}.md):
           flag: "ORPHANED: Session {uuid} not found"

       # Check claim exists in ledger
       if claim_text not found in ledger.md or sessions/{uuid}.md:
           flag: "ORPHANED: Claim not found in ledger"
   ```

2. **Detect resolution conflicts**
   ```
   for each claim_text:
       resolutions = [r for r in resolutions.md if r.claim == claim_text]
       if len(resolutions) > 1:
           if exists contradiction (confirmed + disconfirmed on same claim):
               flag: "CONFLICT: Claim marked both confirmed and disconfirmed"
               # Note: This is expected if user changed their mind; flag for review
   ```

3. **Validate resolutions.md format**
   - Check YAML front matter present
   - Check schema-version field present
   - Check markdown syntax valid
   - Check all required fields present in each resolution

4. **Validate ledger.md structure**
   - Check file readable
   - Check markdown syntax valid
   - Check no obvious corruption

5. **Produce report**
   - Summary: "Status: HEALTHY" or "Status: ISSUES FOUND"
   - Count: orphaned, conflicts, format issues
   - Detailed list of problems
   - Recommended fixes

**Time complexity:** O(n) where n = total resolutions.

---

## Integration Points

### Reading from Janus Ledger

Aletheia reads from three Janus files (never modifies):

1. **ledger.md**
   - Contains summary-level observations
   - Used to validate that claims exist before marking them resolved

2. **sessions/{uuid}.md**
   - Contains full Closure Report with detailed label lists
   - Primary source for claim text and context

3. **config.md**
   - Contains user preferences (e.g., auto-load default frame)
   - Aletheia respects these (e.g., applies default frame when contextualizing resolutions)

### Writing to Aletheia Domain

Aletheia writes exclusively to:

1. **resolutions.md**
   - All resolution records
   - All calibration metadata
   - All audit logs

2. **~/.janus/.aletheia-index** (hidden, auto-maintained)
   - Optional performance index
   - Never user-facing
   - Safely deletable (auto-rebuilds on next query)

---

## Error Handling

### Claim Not Found

When user tries to resolve a claim that doesn't exist in ledger:

```
Cannot find claim in ledger:
"[KNOWN] Quantum computers will break RSA by 2030"

Possible reasons:
1. Claim text does not match exactly (check spacing, punctuation)
2. Claim was never labeled in the ledger (not from a Janus session)
3. Ledger has been modified or corrupted

Options:
1. Run /aletheia queue to find similar claims
2. Try /aletheia confirm session:{uuid} to browse this session's claims
3. Paste the exact claim text from the ledger

If you believe the ledger is corrupted, run /aletheia audit.
```

### Orphaned Resolution (Audit Mode)

When audit detects a resolution referencing a deleted session:

```
Orphaned resolution detected:
  Session: 2025-08-10T12:34:22-UTC
  Claim: "[INFERRED] Quantum computers will break RSA"
  Resolution: confirmed (2026-01-15)

This session file no longer exists in ~/.janus/sessions/

Options:
1. If you deleted the session intentionally, remove this resolution:
   /aletheia audit --remove-orphans

2. If the session was deleted by accident and you have a backup, restore it.

3. Leave it as-is (orphaned resolutions are harmless; they just reference missing data).
```

### Schema Version Mismatch

When Aletheia encounters resolutions in an old schema format:

```
Warning: resolutions.md uses schema version 0.9; this skill expects 1.0

Your resolution index may be from an older version of Aletheia.

Options:
1. Migrate to new schema:
   /aletheia migrate-legacy-resolutions
   (Creates backup at ~/.janus/resolutions.md.bak first)

2. Continue with current schema (some features may not work).

Recommendation: Run migration to ensure full compatibility.
```

---

## Performance Considerations

### Query Performance by Scale

| Operation | <100 Resolutions | <500 Resolutions | <2000 Resolutions |
|:---|:---|:---|:---|
| `/aletheia confirm` | <0.1s | 0.2s | 0.5s |
| `/aletheia status` | <0.1s | 0.1s | 0.2s |
| `/aletheia calibration` | <0.1s | 0.3s | 1.0s |
| `/aletheia queue` | <0.1s | 0.2s | 0.5s |
| `/aletheia audit` | <0.1s | 0.2s | 0.8s |

**Optimization strategy:**
- Use indexing after ~200 resolutions
- Cache unresolved counts (invalidate on write)
- Lazy-load resolution details (show summary first, details on demand)

---

## Data Integrity & Recovery

### Backup Strategy

Aletheia auto-creates backups:
- On first write: `~/.janus/resolutions.md.v1-backup`
- On migration: `~/.janus/resolutions.md.bak`
- Manual: `/aletheia backup` creates timestamped copy

### Recovery

If resolutions.md becomes corrupted:

1. Check backups: `ls ~/.janus/resolutions.md*`
2. Restore from backup: `cp ~/.janus/resolutions.md.bak ~/.janus/resolutions.md`
3. Run audit: `/aletheia audit`
4. Report issue if needed

---

## Future Extensions

### Possible Enhancements

1. **Tagging resolutions** — Add tags to resolutions (`#forecast`, `#hypothesis`, `#learned`) for custom grouping

2. **Time-weighted calibration** — Adjust calibration scores based on time lag between claim and resolution (claims resolved soon are weighted higher than those resolved years later)

3. **Evidence linking** — Allow resolutions to include URLs or citations (validates reachability)

4. **Batch operations** — `/aletheia confirm claim1, claim2, claim3` to resolve multiple claims at once

5. **Comparative calibration** — Compare your calibration across different time periods or claim domains

6. **Integration with Agon** — Auto-import Agon Convergence Reports as claims available for resolution

All require schema extension; all maintain backward compatibility with v1.0.

