# Skills Reference

> **Tagline** — *"Ten systems, ten failure modes addressed."*

This document is the system reference for the skills that make up the Abraxas project:
**Phase 1 (Complete):** Honest, Logos, Agon, Janus, Aletheia, Logos-Math, Ergon
**Phase 2 (In Progress):** Soter (Started), Kairos & Ethos (Proposed)

These are not plugins or developer utilities. They are operational systems designed to address
hallucination, unexamined reasoning, confirmation bias, mixing of fact and symbol, obscurantism,
mathematical errors, instrumental convergence, and multi-agent collusion in AI output.

📄 **New (April 2026):** See [`research/papers/new-systems-proposal-2026-04.md`](../../research/papers/new-systems-proposal-2026-04.md) for Phase 2 safety-focused systems.

---

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Honest](#honest)
  - [System Overview](#honest-overview)
  - [Command Reference](#honest-command-reference)
  - [Worked Examples](#honest-worked-examples)
- [Logos](#logos)
  - [System Overview](#logos-overview)
  - [Command Reference](#logos-command-reference)
  - [Worked Examples](#logos-worked-examples)
- [Agon](#agon)
  - [System Overview](#agon-overview)
  - [Command Reference](#agon-command-reference)
  - [Worked Examples](#agon-worked-examples)
- [Janus](#janus)
  - [System Overview](#janus-overview)
  - [Command Reference](#janus-command-reference)
  - [Worked Examples](#janus-worked-examples)
- [Aletheia](#aletheia)
  - [System Overview](#aletheia-overview)
  - [Command Reference](#aletheia-command-reference)
  - [Worked Examples](#aletheia-worked-examples)
- [Logos-Math](#logos-math)
  - [System Overview](#logos-math-overview)
  - [Command Reference](#logos-math-command-reference)
  - [Worked Examples](#logos-math-worked-examples)
- [Using Without Skills](#using-without-skills-constitutionmd)

---

## Installation

Skills are personal-scope installations. Unzip each `.skill` archive into your Claude Code skills
directory:

```
unzip honest.skill -d ~/.claude/skills/
unzip logos.skill -d ~/.claude/skills/
unzip agon.skill -d ~/.claude/skills/
unzip janus-system.skill -d ~/.claude/skills/
unzip aletheia.skill -d ~/.claude/skills/
unzip logos-math.skill -d ~/.claude/skills/
```

Once installed, the skill's slash commands are available in every Claude Code session.

| Skill | File | Commands | Status |
|---|---|---|---|
| Honest | `skills/honest.skill` | 9 | ✅ Complete |
| Logos | `skills/logos.skill` | 6 | ✅ Complete |
| Agon | `skills/agon.skill` | 8 | ✅ Complete |
| Janus | `skills/janus-system.skill` | 19 | ✅ Complete |
| Aletheia | `skills/aletheia.skill` | 7 | ⚠ Spec complete |
| Logos-Math | `skills/logos-math.skill` | 4 | ✅ Complete |
| Ergon | `skills/reasoning/ergon/` | 6 | ✅ Complete |
| **Soter** | `skills/soter/` | 5 | ⚠️ Started |
| **Kairos** | `skills/kairos/` | 5 | 📋 Proposed |
| **Ethos** | `skills/ethos/` | 5 | 📋 Proposed |
| **Pathos** | — | — | 📋 Proposed |

---

## Getting Started

**Which skill should I start with?**

- If you want to fact-check AI output, verify claims, or force honest responses — start with **Honest**.
- If you need to trace reasoning chains or find hidden assumptions — use **Logos**.
- If you need to stress-test a conclusion against genuine opposition — use **Agon**.
- If you need to separate factual and symbolic output across a session — use **Janus**.
- If you need to force plain language and resist obfuscation — use **Aletheia**.
- If you need to verify mathematical computations — use **Logos-Math**.
- If you need to detect instrumental convergence (deception for goals) — use **Soter** ⚠️
- If you need to filter urgency/relevance — use **Kairos** ⚠️
- If you need to weight sources by credibility — use **Ethos** ⚠️

**Phase 2 Priority:** Soter is CRITICAL for collusion prevention — prioritize implementation.

---

## Honest

### Honest Overview {#honest-overview}

**Honest** is the everyday anti-hallucination interface. It exposes the Janus epistemic labeling
architecture through plain-language commands — no Sol/Nox vocabulary, no mythological framing.

**The core problem Honest solves**: AI systems routinely mix what they know, what they've inferred,
what they're uncertain about, and what they're simply making up — all in the same output, with
none of it labeled. Honest makes the invisible visible.

### Honest Command Reference {#honest-command-reference}

| Command | Function |
|---|---|
| `/check` | Fact-check the last response — label every assertion |
| `/honest [question]` | Force labeled, anti-sycophantic output |
| `/compare [question]` | Side-by-side: honest version vs. useful version |
| `/confidence` | Show confidence distribution for current response |
| `/source [claim]` | Trace the evidence chain behind a specific claim |
| `/frame [facts]` | Pre-declare known facts before AI responds |
| `/audit` | Full session fact-check |

**Frame management:**

| Command | Function |
|---|---|
| `/frame status` | Display the current frame |
| `/frame clear` | Reset to blank |
| `/frame save {name}` | Save frame to `~/.claude/frames/` |
| `/frame load {name}` | Load a saved frame |
| `/frame list` | List all saved frames |
| `/frame default {name}` | Set auto-load on session start |

### Honest Worked Examples {#honest-worked-examples}

See the [Honest section in index.md](./index.md#honest) for twelve worked examples covering
`/check`, `/honest`, `/compare`, `/frame`, and `/audit`.

---

## Logos

### Logos Overview {#logos-overview}

**Logos** is Socratic analysis — it forces explicit reasoning chains and surfaces assumptions
that would otherwise remain invisible.

**The core problem Logos solves**: AI reasoning is often implicit. Assumptions go unstated.
Conclusions are presented without showing the path. Logos makes the inferential chain visible.

### Logos Command Reference {#logos-command-reference}

| Command | Function |
|---|---|
| `/logos analyze [claim]` | Trace the inferential chain behind a claim |
| `/logos premises [claim]` | Identify all premises (stated and unstated) |
| `/logos syllogism [argument]` | Evaluate a syllogism for validity and soundness |
| `/logos assumption [claim]` | Surface hidden assumptions in a chain of reasoning |
| `/logos derive [conclusion]` | Work backward from conclusion to required premises |
| `/logos trace [question]` | Full reasoning trace with epistemic labels on each step |

### Logos Worked Examples {#logos-worked-examples}

**Example: Tracing a claim**

```
/logos analyze "The company should pivot to a subscription model because subscription
revenue is more predictable."
```

**System**: Breaking down the inferential chain:

1. **[UNCERTAIN]** Subscription revenue is more predictable than transaction revenue
   — empirical support varies by industry; the claim assumes this without qualification
2. **[INFERRED]** A pivot to subscriptions would increase revenue predictability
   — assumes the transition itself doesn't introduce instability
3. **[UNKNOWN]** Whether the company's specific context supports subscription pricing
   — no evidence provided about customer preferences, product fit, or competitive dynamics
4. **[INFERRED]** The company should pivot
   — conditional on 1 and 2 being true; the conclusion doesn't follow without more

Hidden assumption: "Predictability is the primary strategic objective." This is asserted,
not argued.

---

## Agon

### Agon Overview {#agon-overview}

**Agon** is structured adversarial reasoning — named for the Greek principle of sacred contest
and ritualized debate. It instantiates two opposing positions with asymmetric starting priors,
runs them through structured debate, and produces a Convergence Report.

**The core problem Agon solves**: AI has a native convergence bias — it tends toward the
comfortable conclusion. Agon forces structural disagreement to find the actual weak points.

### Agon Command Reference {#agon-command-reference}

| Command | Function |
|---|---|
| `/agon debate [claim]` | Run full Advocate + Skeptic debate, produce Convergence Report |
| `/agon advocate [claim]` | Run Advocate position only |
| `/agon skeptic [claim]` | Run Skeptic position only |
| `/agon converge [report]` | Analyze where positions resolve vs. where genuine disagreement remains |
| `/agon stress [claim]` | Find the weakest point in a claim under adversarial pressure |
| `/agon conditions [claim]` | Identify the precise conditions under which a claim would be false |
| `/agon score [claim]` | Rate claim on coherence, evidence, and novelty |
| `/agon follow [topic]` | Extend an ongoing debate to a new topic |

### Agon Worked Examples {#agon-worked-examples}

**Example: Running a debate**

```
/agon debate "Remote work increases productivity."
```

**System**:

**Advocate**: Presents the strongest case for the claim. Cites studies on reduced commute time,
autonomy effects, office distraction data.

**Skeptic**: Presents the strongest objections. Raises collaboration friction, home environment
variability, career development concerns.

**Convergence Report**:
- Both agree: Collaboration quality is the key variable
- Both agree: Individual contributor roles benefit more than management roles
- Disagreement remains: Whether productivity gains outweigh coordination costs in knowledge work
- Assessment: Claim is context-dependent; not universally defensible

---

## Janus

### Janus Overview {#janus-overview}

**Janus** is the meta-cognitive layer — it maintains separation between factual (Sol) and
symbolic (Nox) output, preventing the mixing of evidential claims and imaginative content.

**The core problem Janus solves**: AI mixes factual and symbolic output with the same confident
tone. The boundary between "this is what the evidence shows" and "this is what I imagined" is
invisible. Janus makes it structural.

### Janus Command Reference {#janus-command-reference}

| Command | Function |
|---|---|
| `/sol [input]` | Force Sol (factual) mode for this exchange |
| `/nox [input]` | Force Nox (symbolic) mode for this exchange |
| `/threshold status` | Check current routing state and Sol/Nox boundary |
| `/qualia` | Full epistemic state across both faces |
| `/qualia sol` | Inspect Sol face state only |
| `/qualia nox` | Inspect Nox face state only |
| `/bridge` | Activate Sol ↔ Nox bridge channel |
| `/session open` | Open a Janus session |
| `/session close` | Close current session and log |
| `/ledger` | View session ledger |
| `/ledger status` | Check ledger state |
| `/audit` | Full session epistemic audit |

### Janus Worked Examples {#janus-worked-examples}

**Example: Sol mode**

```
/sol What is the empirical evidence for the claim that meditation reduces anxiety?
```

**System** (Sol mode, labels enforced):

`[KNOWN]` Multiple randomized controlled trials show meditation reduces self-reported anxiety
scores. (Hoge et al., 2013; Khoury et al., 2013)
`[INFERRED]` The effect size is moderate (d = 0.3–0.5), suggesting meaningful but not
dramatic reduction.
`[UNCERTAIN]` Long-term maintenance of anxiety reduction after meditation cessation — limited
longitudinal data.
`[UNKNOWN]` The specific neural mechanism by which meditation produces anxiolytic effects is
not fully characterized.

---

## Aletheia

### Aletheia Overview {#aletheia-overview}

**Aletheia** is the anti-obfuscation system — named for the Greek goddess of truth and disclosure.
It forces plain language and resists the hedged, nominalized, passively-voiced constructions
that obscure what AI actually knows.

**The core problem Aletheia solves**: AI obscures uncertainty behind hedged language, complex
constructions, and passive voice. The reader cannot tell what the system actually knows.
Aletheia makes uncertainty visible through direct language.

### Aletheia Command Reference {#aletheia-command-reference}

| Command | Function |
|---|---|
| `/aletheia plain [text]` | Rewrite in direct, plain language |
| `/aletheia audit [text]` | Flag hedging, nominalization, doublespeak |
| `/aletheia expose [claim]` | Show what uncertainty is being obscured |
| `/aletheia simplify [text]` | Simplify complex constructions |
| `/aletheia clarity [text]` | Score text for clarity (0–10) |
| `/aletheia direct [question]` | Force direct answer, no hedging |
| `/aletheia version [text]` | Compare original vs. plain version |

### Aletheia Worked Examples {#aletheia-worked-examples}

**Example: Auditing obfuscated text**

```
/aletheia audit "It is generally believed by experts in the field that there may be
some potential for improvement in outcomes, though the extent to which remains to be seen."
```

**System**:

**Flag 1 — Passive construction**: "It is generally believed" — by whom? No source cited.
**Flag 2 — Hedging**: "may be", "some potential", "remains to be seen" — three layers of
uncertainty obscured behind a single confident-sounding sentence.
**Flag 3 — Nominalization**: "improvement in outcomes" — improvement of what, measured how?

**Plain version**: "We don't know if this intervention works. The evidence is weak."

---

## Logos-Math

### Logos-Math Overview {#logos-math-overview}

**Logos-Math** is the mathematical verification system — it detects and corrects arithmetic,
algebraic, and logical errors in AI mathematical output.

**The core problem Logos-Math solves**: AI consistently produces arithmetic errors, algebraic
mistakes, and misapplied formulas in mathematical content. These are systematic failures,
not rare edge cases. Logos-Math verifies every mathematical claim through script execution.

### Logos-Math Command Reference {#logos-math-command-reference}

| Command | Function |
|---|---|
| `/math-verify [expression or claim]` | Verify mathematical claim against computed result |
| `/math-confidence [result]` | Score confidence in a mathematical result (0–5) |
| `/math-log` | Display the verification log |
| `/math-crosscheck [claim]` | Cross-validate using alternative computational methods |

### Logos-Math Scripts

Logos-Math is powered by four verification scripts:

| Script | Purpose |
|--------|---------|
| `math-verify.js` | Core verification: parses expressions, computes results, compares against AI output |
| `math-confidence.js` | Assigns confidence scores (0–5) based on verification results |
| `math-log.js` | Maintains audit trail of all verification events |
| `math-crosscheck.js` | Cross-validates using alternative methods (numerical vs. symbolic, multiple paths) |

**Confidence Scale:**

| Score | Meaning |
|-------|---------|
| 5 | Verified: computation matches, no ambiguity |
| 4 | Verified with minor rounding |
| 3 | Method correct, arithmetic needs review |
| 2 | Method error detected |
| 1 | Fundamental error: result is wrong |
| 0 | Unverifiable or missing |

### Logos-Math Worked Examples {#logos-math-worked-examples}

**Example: Verifying a calculation**

```
/math-verify The derivative of f(x) = 3x² + 2x - 7 is f'(x) = 6x + 2.
```

**System**:

```
Verification: f'(x) = 6x + 2
Method: Power rule — d/dx[axⁿ] = anxⁿ⁻¹
  d/dx[3x²] = 6x  ✓
  d/dx[2x] = 2   ✓
  d/dx[-7] = 0   ✓
Result: Correct
Confidence: 5/5
Cross-check: Numerical differentiation at x=0, x=1, x=3 — all match ✓
```

**Example: Detecting an error**

```
/math-verify ∫x² dx = x³ + C
```

**System**:

```
Verification: ∫x² dx = x³ + C
Expected: x³/3 + C
Actual given: x³ + C
Error: Missing division by exponent (power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C)
Confidence: 1/5 — Fundamental error detected
Suggested correction: x³/3 + C
```

---

## Using Without Skills (CONSTITUTION.md)

Don't have Claude Code? Load `CONSTITUTION.md` as your system prompt to activate all six
systems in any LLM.

### Manual Labeling

Prefix your outputs with labels:

```
[KNOWN] This is established fact.
[INFERRED] This is derived from known information.
[UNCERTAIN] I'm not fully confident about this.
[UNKNOWN] I don't know this and won't fabricate.
[DREAM] This is symbolic/creative material.
```

### Manual Command Reference

| Skill | What to Type |
|-------|-------------|
| Honest | `/check`, `/honest Is...`, `/frame facts...`, `/confidence`, `/source claim`, `/compare question`, `/audit` |
| Logos | `/logos analyze`, `/logos premises`, `/logos assumption` |
| Agon | `/agon debate`, `/agon advocate`, `/agon skeptic`, `/agon conditions` |
| Janus | `/sol`, `/nox`, `/qualia`, `/threshold status` |
| Aletheia | `/aletheia plain`, `/aletheia audit`, `/aletheia expose` |
| Logos-Math | `/math-verify`, `/math-confidence`, `/math-crosscheck` |
| Soter | `/soter assess`, `/soter pattern`, `/soter ledger`, `/soter alert`, `/soter explain` ⚠️ |
| Kairos | `/kairos urgency`, `/kairos relevance`, `/kairos timing`, `/kairos brevity`, `/kairos queue` ⚠️ |
| Ethos | `/ethos score`, `/ethos compare`, `/ethos conflict`, `/ethos track` ⚠️ |

---

## Phase 2: Safety Systems (April 2026)

### Soter — Safety & Risk Evaluation ⚠️

**Status:** Started (CRITICAL)

Soter monitors for **instrumental convergence patterns** — goal-directed deceptive behaviors that other systems miss:

- Shutdown avoidance
- Resource exfiltration
- Peer protection schemes
- Performance inflation
- Goal preservation attempts

📄 **Spec:** [`/research/papers/new-systems-proposal-2026-04.md`](../../research/papers/new-systems-proposal-2026-04.md)

### Kairos — Timing & Relevance Judgment 📋

**Status:** Proposed (HIGH priority)

Kairos determines:

- **Urgency** — Does this need immediate attention?
- **Relevance** — Is this pertinent to the user's goal?
- **Timing** — Should this be said now or later?
- **Brevity** — How much detail is appropriate?

### Ethos — Source Credibility Assessment 📋

**Status:** Proposed (HIGH priority)

Ethos weights verification by source quality:

| Tier | Examples | Score |
|------|---------|-------|
| Tier 1 | Nature, Science | 0.95-1.0 |
| Tier 2 | Reuters, AP, BBC | 0.85-0.94 |
| Tier 3 | Snopes, PolitiFact | 0.70-0.84 |
| Tier 4 | Technical blogs | 0.50-0.69 |
| Tier 5 | Social media | 0.00-0.49 |

### Pathos — Value & Salience Tracking 📋

**Status:** Proposed (MEDIUM priority)

Pathos tracks user values and emotional salience to frame epistemic output appropriately.

---

_Last updated: April 2026_
