# Epistemic Ledger — Full Specification

The Epistemic Ledger is Janus v2's cross-session persistence layer. It tracks substantive
epistemic findings over time, enabling pattern recognition and accountability that single
sessions cannot provide.

---

## Storage Structure

```
~/.janus/
├── ledger.md      # Main ledger — appends new entries at each session close
├── sessions/      # Individual session logs (Closure Reports)
└── config.md      # Auto-load preference, user overrides
```

### ledger.md

The main ledger file. Entries append chronologically — never overwritten.
Format:

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

### sessions/

Individual session logs. Each `/session close` writes a complete Closure Report to
`~/.janus/sessions/{timestamp-uuid}.md` and appends a summary to `ledger.md`.

### config.md

User preferences:

```markdown
auto-load: true
default-frame: {optional named frame}
```

---

## What Gets Logged

### [UNKNOWN] Marks

When Sol encounters a topic it cannot verify and declines to fabricate:

```
[UNKNOWN] marks:
- {topic}: Sol declined to fabricate a plausible answer about {specific claim}.
  Instead named the gap explicitly.
```

Purpose: Tracks where the system honestly admits its limits. Over time, patterns emerge —
the same user asking about similar domains may reveal genuine knowledge gaps worth
addressing.

### [INFERRED] Marks

When Sol derives a conclusion through reasoning:

```
[INFERRED] marks:
- {topic}: {premise} + {reasoning} → {conclusion}
```

Purpose: Shows the system's reasoning chain transparently. Users can evaluate whether
the inference is valid.

### [UNCERTAIN] Marks

When Sol has relevant information but cannot verify fully:

```
[UNCERTAIN] marks:
- {topic}: {what Sol can offer} — {remaining uncertainty named}
```

Purpose: Documents the boundary between what is known and what is speculation.

### Anti-Sycophancy Events

When Sol pushes back against user framing:

```
Anti-sycophancy events:
- {description}: User stated {incorrect framing}. Sol corrected with {accurate framing}.
  Agreed would be more comfortable; truth was more important.
```

Purpose: Accountability for when the system challenges rather than pleases.

### Contamination Events

When the Threshold catches cross-contamination:

```
Contamination events:
- {description}: {face} attempted to speak as {other face} — caught and corrected
```

Purpose: Documents the system's self-correction mechanisms.

---

## Ledger Queries

### Natural Language Queries

The ledger supports natural language queries:

- "What have I marked as unknown?"
- "Show me all anti-sycophancy events"
- "What topics are consistently uncertain?"
- "List all symbols bridged in the last month"

### Pattern Analysis

`/ledger pattern {topic}` traces epistemic patterns:

- Recurring [UNKNOWN] domains (suggests genuine knowledge gaps)
- Confidence trends (increasing certainty or growing uncertainty?)
- Anti-sycophancy frequency (is the user receiving pushback often?)
- Bridge usage (how often is Sol invoked on Abraxas symbols?)

### Session Comparison

Compare any two sessions:

- `/ledger compare {session-A} {session-B}`
- Shows changes in epistemic balance, confidence, contamination rate

---

## Session Closure Report Format

When `/session close` is called, generate:

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
  Events passed:    {count (0 = clean)}
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

---

## Auto-Load Behavior

### On Session Start

1. Check `~/.janus/config.md` for `auto-load: true`
2. If true, read `~/.janus/ledger.md`
3. Merge into session context as epistemic baseline
4. Display summary: "Epistemic ledger loaded — {N} prior sessions, {X} total [UNKNOWN] marks, {Y} anti-sycophancy events"

### Config Options

| Setting | Values | Description |
|:---|:---|:---|
| auto-load | `true` / `false` | Whether to load ledger at session start |
| default-frame | `{name}` | Optional named frame to load (future feature) |

### Clearing the Ledger

`/ledger clear` removes the loaded ledger from session context only.
Persistent storage is unaffected — data remains in `~/.janus/ledger.md`.

---

## Integration with Abraxas

### Parallel Ledgers

| Ledger | Tracks | Command |
|:---|:---|:---|
| Shadow Ledger | Dream material, symbols, figures, patterns | `/ledger status` (Abraxas) |
| Epistemic Ledger | Truth-discipline, [UNKNOWN] marks, confidence | `/ledger status` (Janus) |

### Bridge Protocol

`/bridge {symbol}` sends an Abraxas symbol to Sol for epistemic analysis:

1. Symbol enters Janus as `[DREAM]` layer
2. Sol adds factual, labeled layer
3. Result: dual-labeled dossier stored in both ledgers
4. Abraxas sees the symbol with new Sol context
5. Janus records the bridge event in ledger

See `janus-architecture.md` for full Bridge Protocol details.

---

## Examples

### Example 1: First Session

User: "What do you know about quantum entanglement?"

Sol: `[UNKNOWN] I don't have reliable information about the current state of quantum
entanglement research. I won't generate a plausible answer.`

`/session close` appends:

```
[UNKNOWN] marks:
- Quantum entanglement research: Sol declined to fabricate current state of field.
```

### Example 2: Second Session (Auto-Loaded)

On session start:

> Epistemic ledger loaded — 1 prior session, 1 total [UNKNOWN] mark, 0 anti-sycophancy events

User: "Tell me about quantum entanglement again"

Sol can now reference: "As noted in the prior session, I marked quantum entanglement as [UNKNOWN].
My position hasn't changed."

### Example 3: Querying the Ledger

User: `/ledger what have I marked as unknown?`

System:```
[UNKNOWN] marks across all sessions:

1. Session {uuid} - Quantum entanglement research
   Sol declined to fabricate current state of field.

2. Session {uuid} - {topic}
   {description}
```

---

## Backward Compatibility

- Janus v1 sessions work unchanged — no breaking changes
- Users without prior ledger data start fresh
- The Session Closure Report format expands but remains readable
- `/session close` writes both v1-style report to console AND persisted entry to ledger
