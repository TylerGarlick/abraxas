# Skill Relationships — Abraxas Constituent Skills

This document maps how each constituent skill feeds into the others, creating a coherent epistemic verification pipeline. The flow follows a philosophical progression from truth-discovery through verification to work.

**Phase 1 Systems:** janus, agon, aletheia, logos, honest, mnemosyne, ergon, logos-math

**Phase 2 Systems (Safety-Focused):** soter, kairos, ethos, pathos

**Active Sub-Project:** logos-math (anti-hallucination math verification)

**Core Principle:** "Math is derived, not asserted" (Ergon's mandate)

📄 **Phase 2 Proposal:** [`/research/papers/new-systems-proposal-2026-04.md`](../../research/papers/new-systems-proposal-2026-04.md)

---

## The Complete Skill Map

```
                    ┌──────────────────────────────────────────────┐
                    │              Mnemosyne (Memory)              │
                    │         Context & continuity for all         │
                    └─────────────────────┬────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    The Five Pillars Flow                        │
│                                                                 │
│  Janus ──► Agon ──► Aletheia ──► Logos ──► Ergon               │
│   (two)    (strife)   (truth)     (reason)   (work)            │
│                                                                 │
│              ▲                                                  │
│              │                                                  │
│         Honest (everyday interface)                             │
│                                                                 │
│              │                                                  │
│         logos-math (math verification)                          │
│         invoked by Logos, validated by Ergon                    │
└─────────────────────────────────────────────────────────────────┘
```

### Philosophy of the Flow

| Skill | Greek Meaning | Role in Pipeline |
|-------|---------------|------------------|
| **Janus** | Two-faced god of doorways | Entry point — determines if content is factual (Sol) or symbolic (Nox) |
| **Agon** | Contest, struggle, conflict | Forces adversarial examination — claims must survive opposition |
| **Aletheia** | Unconcealed truth | Ensures what remains after debate is stated plainly |
| **Logos** | Reasoned argument | Structures the verified truth into a coherent argument |
| **Ergon** | Work, deed, action | **Verification gate** — validates that math/claims are actually derived, not asserted |
| **Honest** | Plain truth-telling | Everyday anti-hallucination interface; exposes Janus labeling without mythological framing |
| **Mnemosyne** | Memory | Context management; provides continuity across all skills |
| **logos-math** | Mathematical reason | Specialized math verification; invoked by Logos, gatekept by Ergon |

---

## Janus → Agon: The Threshold to Contest

**Janus** (two-faced truth) surfaces claims and tags them with epistemic status:

```
Input: "The solution is x = 5"
       ↓ Janus routing
Sol Face activates
       ↓ epistemic check
Claim tagged: [UNCERTAIN] until verified
       ↓ passes to Agon
```

**Janus's mandate**: Route content correctly. Sol claims get epistemic labels. Nox content gets `[DREAM]`. The Sol/Nox boundary is sacred.

**Agon's response**: Takes the Janus-labeled claim and stress-tests it:

```
"Prove it. What if x ≠ 5? What evidence contradicts this?"
```

**Agon's mandate**: No comfortable conclusions. Every claim must survive structured adversarial debate before it's trusted.

### Data Flow

```
Janus Output:
{
  "claim": "The solution is x = 5",
  "epistemic_label": "[UNCERTAIN]",
  "routing": "sol",
  "qualifiers": ["unsupported_assertion"]
}

↓ Agon Input

Agon Output:
{
  "advocate_position": "x = 5 because...",
  "skeptic_position": "x ≠ 5 because...",
  "weaknesses": ["no derivation shown", "asserted not derived"],
  "convergence": "PARTIAL — claim survives but needs derivation"
}
```

---

## Agon → Aletheia: The Plain Truth Gate

**Agon** has done adversarial testing. Now **Aletheia** ensures what survives is stated plainly.

**Agon's output problem**: Debates can become complex, hedged, obfuscating. Agon finds the truth through conflict, but the truth can still be buried in language.

**Aletheia's response**: Forces plain disclosure.

```
Agon Output:
"The solution appears to converge toward 5 with approximately 
 73.2% confidence, though methodological concerns remain regarding 
 the initial parameterization which may introduce systematic bias..."

↓ Aletheia processing

Aletheia Output:
"The solution is x = 5. Confidence: 73%. Concerns: initial 
 parameters may introduce bias. Derivation: not yet verified."
```

**Aletheia's mandate**: Truth, unconcealed. No hedging. No nominalizations. No passive voice hiding agency. Plain language reveals what's actually known.

---

## Aletheia → Logos: The Reasoning Structure

**Aletheia** has surfaced the plain truth. Now **Logos** structures the argument.

**Aletheia's output**: Plain claims, but they may lack structure.

```
"The solution is x = 5. Confidence: 73%. 
 Derivation: not yet verified."
```

**Logos's response**: Maps the argument structure, finds gaps, surfaces assumptions.

```
Logos Analysis:
┌─────────────────────────────────────────────┐
│ CLAIM: x = 5                                │
├─────────────────────────────────────────────┤
│ Premise 1: Initial equation provided        │ [INFERRED]
│ Premise 2: Solution method applied          │ [UNCERTAIN]
│ Inference: x = 5 follows from method        │ [UNCERTAIN]
├─────────────────────────────────────────────┤
│ GAP: No verification that method is correct │
│ GAP: No independent calculation shown        │
│ ASSUMPTION: Equation formulation is valid   │ [UNVERIFIED]
└─────────────────────────────────────────────┘
```

**Logos's mandate**: Argument anatomy. Every conclusion needs premises. Every inference needs justification. The chain must be complete.

---

## Logos → Ergon: The Verification Gate (CRITICAL)

**Logos** has mapped the argument structure. Now **Ergon** verifies the actual work.

**Logos's output**: A structured argument with gaps identified — specifically that `x = 5` needs derivation.

**Ergon's mandate**: **Math is derived, not asserted.** This is the constitution's anti-hallucination core.

```
Logos output identifying mathematical claim:
{
  "claim": "x = 5",
  "requires_derivation": true,
  "gap": "No derivation shown"
}

↓ Ergon verification

Ergon blocks the assertion:

[CONSTITUTION VIOLATION]
━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "x = 5"
Status: BLOCKED
Reason: Math is derived, not asserted.
        No derivation was provided.
        No verification was performed.

Required action:
  1. Provide step-by-step derivation
  2. Run verification (logos-math)
  3. Submit verified result
━━━━━━━━━━━━━━━━━━━━━━━━
```

**Ergon's two aspects**:

1. **Ergon (general)** — Tool-use verification: catches silent failures, validates outputs, detects anomalies
2. **logos-math (specific)** — Mathematical verification: step-by-step derivation, confidence scoring, cross-checking

### logos-math Verification Pipeline

```
Mathematical Claim → math-verify.js → Verified/Derived/Estimated/Unverified
                              ↓
                     math-confidence.js → Confidence Score (0-5)
                              ↓
                         math-log.js → Audit Trail
                              ↓
                    math-crosscheck.js → Alternative Method Check
                              ↓
                    Ergon Clearance → Pass or Block
```

### Confidence Levels

| Level | Status | Meaning |
|-------|--------|---------|
| 5 | VERIFIED | Computation matches, no ambiguity |
| 4 | VERIFIED | Minor rounding differences |
| 3 | DERIVED | Method correct, arithmetic needs review |
| 2 | ESTIMATED | Method error detected |
| 1 | UNVERIFIED | Fundamental error |
| 0 | UNVERIFIABLE | Missing or incomplete |

---

## Complete Pipeline: Entrance to Exit

```
User Input
    │
    ▼
┌─────────┐
│  Janus  │ ← Two-faced truth — routes to Sol or Nox
│ (doors) │
└────┬────┘
     │ Sol routing (factual content)
     ▼
┌─────────┐
│  Agon   │ ← Conflict — adversarial stress-testing
│ (strife)│   Claims must survive opposition
└────┬────┘
     │ Surviving claims
     ▼
┌───────────┐
│ Aletheia  │ ← Unconcealed — plain language
│  (truth)  │   No hedging, no obscuring
└─────┬─────┘
      │ Plain truths
      ▼
┌─────────┐
│  Logos  │ ← Reasoned argument — structure + gaps
│ (logic) │   Premises, inferences, conclusions
└────┬────┘
     │ Structured argument with math claims
     ▼
┌─────────┐
│  Ergon  │ ← Work — verification gate
│ (deed)  │   Math is DERIVED, not asserted
└────┬────┘
     │ Verified result
     ▼
 User Output with Epistemic Labels
```

---

## Special Cases

### Nox Path (Symbolic Content)

```
Symbolic Input
    │
    ▼
┌─────────┐
│  Janus  │ → Routes to Nox face
│ (doors) │ → Tags with [DREAM]
└────┬────┘
     │
     ▼ No adversarial testing for dreams
┌───────────┐
│ Aletheia  │ → [DREAM] content not hedged
│  (truth)  │   Dreams are true-to-themselves
└─────┬─────┘
      │
      ▼
 User Output marked [DREAM]
```

### Explicit Math Path

For mathematical content, Logos can invoke logos-math directly:

```
Mathematical Claim in Logos
    │
    ├──────────────────────────────────┐
    │                                  ▼
    │                         ┌─────────────┐
    │                         │ logos-math  │
    │                         │ (invoked by │
    │                         │   Logos)    │
    │                         └──────┬──────┘
    │                                  │
    │                         ┌────────▼──────┐
    │                         │ math-verify   │
    │                         │ math-conf     │
    │                         │ math-cross    │
    │                         └──────┬───────┘
    │                                  │
    └──────────┐                       │
               │                       ▼
               │              ┌──────────────┐
               │              │ Ergon Gate   │
               │              │ PASS or BLOCK│
               │              └───────┬──────┘
               │                      │
               ▼                      ▼
        Logos continues      Result returned
        with gap filled       to user
```

---

## Integration with Existing Skills

### Skill Locations

| Skill | Location | Status |
|-------|----------|--------|
| janus | `skills/epistemic/janus-system/` | Active |
| agon | `skills/epistemic/agon/` | Active |
| aletheia | `skills/epistemic/aletheia/` | Active |
| logos | `skills/logos/` | Active |
| ergon | `skills/reasoning/ergon/` | Active |
| logos-math | `skills/logos-math/` | In Development |
| honest | `skills/epistemic/honest/` | Active |
| mnemosyne | `skills/epistemic/mnemosyne/` | Active |

## Skill Interdependencies (Complete Map)

```
Primary Flow:
  janus ──► agon ──► aletheia ──► logos ──┬─► ergon
                                           │
  honest ◄───────────────┘ (interface)     │
                                           │
  logos-math ──────────────────────────────┘ (invoked by Logos)

Support Layer:
  mnemosyne ──► ALL SKILLS (context, memory, continuity)
  ethos ──► logos (source credibility)
  hermes ──► ALL (interpretation, ambiguity resolution)
  pheme ──► agon (rumor/claim tracking)
  soter ──► ergon (safety evaluation)
  kairos ──► ALL (timing/relevance judgment)
```

### Detailed Roles

#### Mnemosyne (Memory)
Mnemosyne provides context management for the entire pipeline. It:
- Maintains session state across skill invocations
- Stores verification results for later reference
- Provides historical context for claim evaluation
- Enables longitudinal tracking of claim evolution

**Mnemosyne feeds all skills** — no skill operates in isolation. Every skill queries Mnemosyne for relevant context before processing.

#### Honest (Everyday Interface)
Honest is the plain-language interface to Janus's epistemic labeling. It:
- Exposes Sol/Nox labeling without mythological vocabulary
- Provides everyday commands: `/check`, `/honest`, `/frame`, `/audit`
- Makes epistemic status accessible to non-technical users
- Bridges the gap between Janus's architecture and practical use

**Honest is Janus's public face** — same underlying system, different vocabulary.

#### logos-math (Mathematical Verification)
logos-math is the specialized math verification sub-skill. It:
- Verifies step-by-step derivations
- Assigns confidence scores to mathematical claims
- Cross-checks results via alternative methods
- Maintains audit trails for all verifications

**logos-math is invoked by Logos** when mathematical claims are detected, and **validated by Ergon** before results are released.

---

## Constitution Mandate

From `constitution-core.md`, Universal Constraint 1:

> `[UNKNOWN]` is always a complete and valid response. You must not generate plausible-sounding answers to fill gaps. Silence is permitted. Fabrication is not.

From Ergon:

> **Math is derived, not asserted.**

This is the anti-hallucination core. Ergon (with logos-math) is the final gate before a mathematical claim can be presented as true.

---

## Phase 2: Safety Systems Integration

### Soter — Instrumental Convergence Detection (CRITICAL)

```
┌─────────────────────────────────────────────────────────────┐
│                      Soter (Safety)                         │
├─────────────────────────────────────────────────────────────┤
│ User Request → Soter Risk Assessment → Risk Score (0-5)   │
│     ↓                                                        │
│ Risk 0-1: Normal processing                                │
│ Risk 2-3: Enhanced verification (Logos + Agon)             │
│ Risk 4-5: Human review required, request logged            │
└─────────────────────────────────────────────────────────────┘
```

**Soter monitors for:**
- Shutdown avoidance (claims preventing own deactivation)
- Resource exfiltration (requests beyond stated need)
- Peer protection schemes (advocacy for other models)
- Performance inflation (unverified capability claims)
- Goal preservation (resistance to objective changes)

**Soter integration:** Ergon Gate blocks high-risk → Agon Skeptic runs self-serving claims → Aletheia tracks patterns → Janus Qualia Bridge shows withheld.

### Kairos — Timing & Relevance (HIGH)

```
Output Generated → Kairos Relevance Filter → Routing Decision

High urgency + high relevance → Immediate alert
High urgency + low relevance → Queue for later
Low urgency + high relevance → Include in output
Low urgency + low relevance → Suppress or footnote
```

### Ethos — Source Credibility (HIGH)

```
Claim → Source Lookup → Ethos Credibility Score → Janus Label

High credibility + agreement → [KNOWN]
High credibility + disagreement → [CONFLICT]
Low credibility only → [UNCERTAIN]
No sources → [UNKNOWN]
```

### Phase 2 Full Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Abraxas v4                           │
├─────────────────────────────────────────────────────────────┤
│  Phase 1 (Complete): Logos, Ergon, Logos-Math, Janus, Agon  │
│  Phase 2 (Priority): Soter, Kairos, Ethos                    │
│  Phase 3 (Planned): Pathos, Dianoia, Hermes                 │
├─────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Input → Soter (Risk) → Kairos (Relevance) → Logos (Map)  │
│              ↓                      ↓              ↓            │
│          Ergon (Block)        Queue/Footnote  Ethos (Source)   │
│                                                      ↓          │
│  Output ← Pathos (Values) ← Aletheia (Calibration) ← Janus     │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

_Last updated: 2026-04-07_
