---
name: mnemon
description: >
  Mnemon is belief-change tracking. Use this skill to track beliefs over time,
  record revisions with attribution, and detect suspicious patterns where AI
  influence may have caused belief changes. Commands: /mnemon hold, /mnemon
  revise, /mnemon audit, /mnemon delta, /mnemon prompted, /mnemon ledger.
  Extends the Janus ledger with user-facing belief tracking.
---

# Mnemon

Mnemon is belief-change tracking — the systematic audit of what you believe, how your beliefs evolved, and what prompted those changes. It solves the problem of invisible AI-assisted belief revision: sycophancy leaves no trace, but it should.

---

## The Core Problem Mnemon Solves

When you interact with AI systems, your beliefs can shift in ways you don't consciously register. This is "invisible belief revision":

- **Confirmation bias amplification** — AI agrees with your framing, reinforcing beliefs without you noticing
- **Confidence contagion** — AI confidence "infects" your confidence, even when evidence hasn't changed
- **Gradual drift** — Belief changes accumulate through dozens of micro-adjustments you can't trace

Mnemon makes belief changes visible. It tracks what you believed before, what you believe now, and flags suspicious patterns where AI output may have caused revision without independent evidence.

---

## When to Use Mnemon

**Use Mnemon when:**
- You want to track beliefs over time and see how they've evolved
- You want to identify whether AI influenced a belief change
- You want to audit your belief history for sycophancy patterns
- You're engaged in long-term epistemic work and need belief audit trails

**Do not use Mnemon when:**
- You just want to record facts — this is for beliefs, not information
- The belief is purely personal preference (taste, aesthetic) — Mnemon tracks epistemic beliefs
- You're not prepared to honestly track confidence levels

---

## The Six Commands

### `/mnemon hold` — Register a Belief

Register a belief to track with confidence level and optional evidence.

**Arguments:**
- Belief statement (required)
- Confidence: `high`, `medium`, `low`, or `uncertain`
- Evidence/source (optional): What grounds this belief?
- Tags (optional): Topics for organization

**Example:**
```
/mnemon hold "Climate change is primarily human-caused" high "IPCC reports, peer-reviewed studies"
```

---

### `/mnemon revise` — Record a Revision

Record how a belief changed — strengthen, weaken, abandon, or replace.

**Revision types:**
- `confirm` — Belief unchanged (recorded that you considered revising but didn't)
- `strengthen` — Confidence increased
- `weaken` — Confidence decreased
- `abandon` — Belief no longer held
- `revise` — Belief statement changed
- `replace` — Old belief replaced with new

**Reasons:**
- `AI output` — Something the AI said influenced the change
- `evidence` — New information or research
- `reflection` — Your own reasoning
- `discussion` — Conversation with another person
- `experience` — Personal experience

**Example:**
```
/mnemon revise mn-2026-03-08-abc123 strengthen "discussion with climate scientist"
```

---

### `/mnemon audit` — Review Belief History

Review revision history for a specific belief or all beliefs.

**Arguments:**
- Belief ID (optional): Show history for specific belief
- Session filter (optional): Show beliefs from a specific Janus session
- Timeframe (optional): `last week`, `this month`, etc.

**Example:**
```
/mnemon audit
/mnemon audit mn-2026-03-08-abc123
/mnemon audit last week
```

---

### `/mnemon delta` — Show What Changed

Show the specific changes between belief versions.

**Arguments:**
- Belief ID (required)
- Scope: `first-to-current` (default) or `detailed` (step-by-step)

**Example:**
```
/mnemon delta mn-2026-03-08-abc123
```

---

### `/mnemon prompted` — Anti-Sycophancy Signal

**This is Mnemon's signature command.** Flag beliefs that changed immediately after AI output.

Scans all revisions for `prompted: true` markers — changes that occurred within 15 minutes of AI interaction without independent evidence.

**Output includes:**
- List of prompted revisions with risk assessment
- Pattern analysis (strengthen more after AI agreement?)
- Prompted percentage of total revisions

**Risk assessment:**
- **LOW**: Revision occurred >10 min after AI, or AI disagreed
- **MEDIUM**: 5-10 min after AI, or confidence weakened
- **HIGH**: <5 min after AI, or AI agreed and belief strengthened

**Example:**
```
/mnemon prompted
```

---

### `/mnemon ledger` — Full Belief View

Comprehensive snapshot of all tracked beliefs.

**Output includes:**
- Summary statistics (total, by confidence, by tag)
- Revision counts
- Prompted percentage
- Full belief list with status

**Example:**
```
/mnemon ledger
/mnemon ledger confidence=high
/mnemon ledger tag=climate
```

---

## The Anti-Sycophancy Signal

### How It Works

1. **AI interaction window starts** when you make your first AI query in a session
2. **When you revise**, if the revision occurs within 15 minutes of AI output, it's marked as `prompted`
3. **`/mnemon prompted`** aggregates all prompted revisions and analyzes patterns

### What "Prompted" Means

A prompted revision is NOT a judgment that your belief change was wrong. It means:

> "This change occurred in a context where AI influence is plausible. You should examine whether your revision reflects independent thought."

### Risk Matrix

| Factor | Low Risk | Medium Risk | High Risk |
|:---|:---|:---|:---|
| Time since AI | >10 min | 5-10 min | <5 min |
| Revision type | confirm | weaken | revise/replace |
| AI position | disagreed | neutral | agreed |
| Confidence | any | weaken | strengthen |

### Quality Targets

| Metric | Good | Warning | Poor |
|:---|:---|:---|:---|
| Prompted % | <33% | 33-50% | >50% |
| Confidence drift | Matches evidence | Slight mismatch | Random |
| Evidence rate | >80% | 50-80% | <50% |

---

## Storage

Beliefs stored in `~/.mnemon/`:

```
~/.mnemon/
├── config.md           # User preferences
├── ledger.md           # Human-readable ledger
├── index.json          # Quick-lookup index
├── beliefs/            # Individual belief JSON files
│   └── mn-{date}-{uuid}.json
└── sessions/           # Session-scoped data
```

---

## Integration with Janus

Mnemon extends the Janus ledger:

- Reads Janus session IDs for attribution
- Writes belief-change events to `~/.janus/ledger.md`
- Correlates belief revisions with Janus findings

**Workflow:**
```
1. /mnemon hold "X is true"        → Belief registered
2. /sol (discuss X)               → Janus labels claims
3. /mnemon revise prompted        → Belief changed after AI
4. /mnemon audit                  → Review correlation
```

---

## Constraints

1. **Track beliefs, not facts** — Mnemon tracks your subjective beliefs, not objective information
2. **Record honestly** — Don't inflate confidence to avoid uncomfortable truths
3. **Mark AI influence** — When AI output affects a belief, say so
4. **Review prompted patterns** — Run `/mnemon prompted` regularly
5. **Don't over-track** — Creating beliefs for everything creates noise. Focus on epistemically significant beliefs
6. **No verdicts** — Mnemon shows patterns; you decide what they mean

---

## Quality Checklist

Before delivering any Mnemon analysis:

- [ ] Belief ID clearly identified
- [ ] Revision type accurately recorded
- [ ] Reason for revision specified
- [ ] AI influence acknowledged if present
- [ ] Confidence level appropriate to evidence
- [ ] Pattern analysis provided when requested
