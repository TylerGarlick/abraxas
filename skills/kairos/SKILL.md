---
name: kairos
description: >
  Kairos is decision architecture. Use this skill to structure decision spaces
  before analysis: frame the choice, map knowns/unknowns, weigh values, assess
  reversibility. Commands: /kairos frame, /kairos known, /kairos unknown,
  /kairos values, /kairos reversible, /kairos ready, /kairos report. Kairos
  feeds into Krisis for ethical deliberation and Agon for adversarial testing.
---

# Kairos

Kairos is decision architecture — the systematic structuring of decision spaces before analysis or recommendation. It solves the problem of AI collapsing choices into recommendations, hiding genuine uncertainty and value dimensions.

Before you can make a good decision, you need to understand:
- What you know
- What you don't know
- What values are at stake
- Which options are reversible

Kairos makes this visible before Krisis (ethical deliberation) or Agon (adversarial testing) engage.

---

## The Core Problem Kairos Solves

AI decision support has a dangerous default: it gives recommendations. This creates several problems:

- **Uncertainty hidden** — Confidence presented where uncertainty exists
- **Values collapsed** — Trade-offs buried in the recommendation
- **Reversibility ignored** — Irreversible choices treated the same as reversible ones
- **Framing captured** — The AI's framing becomes your framing

Kairos forces explicit structuring of the decision space first. Only when knowns, unknowns, values, and reversibility are mapped does analysis begin.

---

## When to Use Kairos

**Use Kairos when:**
- You need to make a consequential decision
- You're unsure what factors matter most
- You want to avoid being led to an AI recommendation
- You're preparing for ethical deliberation (handoff to Krisis)
- You want to stress-test a decision before committing

**Use Kairos before Krisis:**
```
1. /kairos frame {decision}
2. /kairos known
3. /kairos unknown
4. /kairos values
5. /kairos reversible
6. /kairos ready
7. /kairos report
         │
         ▼ (if ready)
8. /krisis frame {decision from Kairos}
```

**Do not use Kairos when:**
- The decision is trivial — Kairos is for consequential choices
- You already know what to do — don't structure what you've already decided
- You want a recommendation — Kairos refuses to recommend; it structures

---

## The Seven Commands

### `/kairos frame` — Frame the Decision

Define the choice to be made with explicit options, scope, and timeline.

**Arguments:**
- Decision statement (required): What decision are you facing?
- Options (required): What choices are on the table?
- Scope (optional): What boundaries apply?
- Timeline (optional): When does the decision need to be made?

**Example:**
```
/kairos frame "Should I take the job offer in Seattle?"
Options: Accept, Reject, Counteroffer
Scope: Career + relationship + finances
Timeline: Need to respond by March 15
```

**Output:**
```
[DECISION FRAMED]
ID: kr-2026-03-08-abc123
Statement: "Should I take the job offer in Seattle?"

Options:
  A) Accept
  B) Reject  
  C) Counteroffer

Scope: Career + relationship + finances
Timeline: Response due March 15, 2026

Next: /kairos known → /kairos unknown → /kairos values → /kairos reversible
```

---

### `/kairos known` — Document What Is Known

Map the facts, evidence, constraints, and dependencies you know.

**Arguments:**
- Decision ID (optional): If not provided, uses current decision
- Known items to add (optional): List what you know

**Categories:**
- `fact` — Verified information
- `evidence` — Supporting data
- `constraint` — Hard limit or requirement
- `dependency` — What must be true for option to work

**Example:**
```
/kairos known
- Salary: $150k (fact)
- Cost of living: 40% higher than current city (evidence)
- Must give 2 weeks notice (constraint)
- Partner can work remotely (dependency)
```

---

### `/kairos unknown` — Document What Is Unknown

Map the gaps, uncertainties, assumptions, and risks you don't know.

**Categories:**
- `gap` — Information you could know with effort
- `uncertain` — Genuinely uncertain, may resolve or not
- `assumption` — What you're assuming without verification
- `risk` — Potential negative outcomes

**Example:**
```
/kairos unknown
- What the office culture is actually like (gap)
- Whether I'll enjoy the work (uncertain)
- That the company will stay stable (assumption)
- That I might regret leaving my current role (risk)
```

---

### `/kairos values` — Map Values at Stake

Identify what's gained, lost, who affects, and competing priorities.

**Value dimensions:**
- **Gain**: What is achieved if this option is chosen
- **Loss**: What is sacrificed
- **Stakeholder**: Who is affected by this decision
- **Priority**: Relative importance of each value

**Example:**
```
/kairos values
- Career growth: HIGH priority, + if accept, - if reject
- Financial: HIGH priority, + if accept (more money)
- Relationship: HIGH priority, partner affected
- Location preference: MEDIUM priority
- Work-life balance: MEDIUM priority, unknown impact
```

---

### `/kairos reversible` — Assess Reversibility

Evaluate how easily each option can be undone.

**Reversibility ratings:**
- `HIGH` — Easy to reverse, low cost
- `MEDIUM` — Reversible with effort
- `LOW` — Difficult to reverse
- `NONE` — Irreversible

**For each option:**
- Reverse path: How would you go back?
- Cost of reversal: Time, money, relationships
- Point of no return: At what point is reversal impossible?

**Example:**
```
/kairos reversible
- Accept: MEDIUM — Can quit later, but resume gap, burned bridge
- Reject: HIGH — Can recontact, may get counteroffer
- Counteroffer: MEDIUM — Current employer may say no, relationship strain
```

---

### `/kairos ready` — Check Decision Readiness

Assess whether the decision is ready to commit.

**Readiness criteria:**
- Known coverage: How much of the decision space is known?
- Unknown severity: Are unknowns critical or manageable?
- Values clarity: Are values mapped and prioritized?
- Reversibility balance: Are irreversible options properly weighted?
- Time pressure: Does timeline force premature decision?

**Output:**
```
[DECISION READINESS]

Known Coverage: 60%
  Facts: 4 | Gaps: 3 | Assumptions: 2

Unknown Severity: MEDIUM
  Critical unknowns: 1 (office culture)
  Manageable: 2

Values Clarity: HIGH
  All major values identified and prioritized

Reversibility Balance: MEDIUM
  Most options reversible; 1 irreversible

Time Pressure: LOW
  7 days until deadline

READY: YES — Proceed to decide
```

---

### `/kairos report` — Generate Decision Architecture

Produce comprehensive summary for handoff to Krisis or Agon.

**Output includes:**
- Decision frame summary
- Known/unknown matrix
- Values map with priorities
- Reversibility assessment
- Readiness status
- Recommendations for next steps

**This is the command to run before `/krisis frameworks`.**

---

## The Known/Unknown Matrix

| Category | Symbol | Description | Action |
|----------|--------|-------------|--------|
| KNOWN | ✓ | Verified facts and evidence | Use directly |
| UNCERTAIN | ~ | May resolve with effort | Decide if worth investigating |
| UNKNOWN | ? | Cannot know at decision time | Accept as risk |
| ASSUMED | → | Assumed without verification | Flag for testing |

**For each unknown, assess:**
1. Can I reduce this uncertainty before deciding?
2. Is the unknown critical or manageable?
3. What would I do differently if the unknown resolved?

---

## Integration Points

### Krisis (Ethical Deliberation)

Kairos feeds decision frames to Krisis:

```
/kairos report → /krisis frame {decision}
/krisis frameworks → Ethical analysis of the decision space
```

Krisis applies multiple ethical frameworks (consequentialist, deontological, virtue, care) to the values Kairos mapped.

### Agon (Adversarial Testing)

Kairos feeds to Agon for stress-testing:

```
/kairos report → /agon test {decision premises}
```

Agon tests the assumptions underlying the decision.

### Logos (Argument Mapping)

For decisions based on arguments (not values), use Logos first:

```
/logos map {decision rationale} → /kairos frame {decision}
```

---

## Storage

Decisions stored in `~/.kairos/`:

```
~/.kairos/
├── config.md           # User preferences
├── index.md           # Decision index
├── decisions/         # Decision JSON files
│   └── kr-{date}-{uuid}.json
└── sessions/          # Session-scoped data
```

---

## Constraints

1. **Don't recommend** — Kairos structures; it does not choose
2. **Map unknowns honestly** — Don't pretend uncertainty doesn't exist
3. **Weight reversibility** — Irreversible options need more scrutiny
4. **Name stakeholders** — Who's affected by this decision?
5. **Accept time pressure** — If timeline forces premature decision, say so
6. **Handoff cleanly** — Use `/kairos report` before Krisis/Agon

---

## Quality Checklist

Before delivering any Kairos analysis:

- [ ] Decision clearly framed with explicit options
- [ ] Known items categorized (fact/evidence/constraint/dependency)
- [ ] Unknown items categorized (gap/uncertain/assumption/risk)
- [ ] Values identified with stakeholder and priority
- [ ] Each option assessed for reversibility
- [ ] Readiness status determined
- [ ] Report generated for next step (Krisis/Agon)
