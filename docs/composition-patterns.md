# Skill Composition Patterns

Multi-skill session workflows for the Abraxas system.

---

## Overview

Each Abraxas skill operates independently. Composition patterns are structured workflows that layer skills in a specific sequence to address problems that no single skill handles well alone.

This document covers four composition patterns, ordered from simplest to most complex.

---

## Pattern 1: Honest + Janus

**Use case:** Sessions that mix factual analysis with speculative or creative work.

**Problem it solves:** When a session moves between verified technical analysis and open-ended brainstorming, it is easy to lose track of which outputs were labeled and which were freely speculative. Mixing modes without explicit marking produces outputs that blend fact and invention invisibly.

**Skill sequence:**

```
/frame [context]     ← Honest: set session context
[factual work]       ← use /check, /split, /label as needed

/sol                 ← Janus: enter Sol face (full epistemic labeling)
[analysis requiring [KNOWN]/[INFERRED]/[UNCERTAIN] on every claim]

/nox                 ← Janus: enter Nox face (symbolic/speculative)
[creative, speculative, or design work — all output marked [DREAM]]

/sol                 ← return to Sol when analysis resumes
/audit               ← Honest: session-end audit of unlabeled claims
```

**Key rule:** Sol and Nox are mutually exclusive faces. Do not mix factual claims and speculative claims in the same Nox session — the `[DREAM]` label applies to everything in Nox. If you need to make a factual claim, exit Nox first with `/sol`.

**When to use Honest vs. Janus Sol:**
- Use Honest (`/honest`, `/check`, `/split`) for quick verification during conversational sessions
- Use Janus Sol (`/sol`) when you need the full four-label taxonomy on every output for the entire session
- Both can coexist: Honest commands work in any Janus state

---

## Pattern 2: Agon + Aletheia

**Use case:** Structured debate followed by resolution tracking.

**Problem it solves:** Agon produces a Convergence Report with labeled zones of agreement and disagreement. Without Aletheia, these findings evaporate at session end. Aletheia captures the resolutions and tracks them across sessions.

**Skill sequence:**

```
/agon open [topic]           ← Agon: open a debate session
/agon advocate [position]    ← Agon: set Advocate position
/agon skeptic [position]     ← Agon: set Skeptic position
[debate rounds]
/agon convergence            ← Agon: generate Convergence Report

/aletheia resolve [claim]    ← Aletheia: resolve claims from Convergence Report
/aletheia log                ← Aletheia: log resolutions to persistent ledger
/aletheia debt               ← Aletheia: surface any unresolved claims
```

**What to resolve from the Convergence Report:**
- Claims in the convergence zone (both positions agreed) — resolve as confirmed
- Claims in the dispute zone that have external ground truth — resolve with source
- Claims marked `[UNCERTAIN]` by both positions — log as open epistemic debt for future resolution

**Aletheia's ledger** persists in `~/.janus/` across sessions. Running `/aletheia debt` in a later session will surface unresolved claims from this debate.

---

## Pattern 3: Honest + Agon

**Use case:** Verifying the inputs to a structured debate before the debate begins.

**Problem it solves:** Agon debates the positions you give it. If the framing of a position contains a hidden assumption or an unverified claim, the debate inherits that error. Running Honest before Agon surfaces framing problems before they propagate.

**Skill sequence:**

```
/honest                          ← Honest: activate maximum-honesty mode
[State your topic and initial framing]
/split                           ← Honest: separate known from assumed in the framing
/check [key claim in framing]    ← Honest: verify grounding of each major claim

/agon open [verified topic]      ← Agon: open debate with cleaned framing
/agon advocate [position]
/agon skeptic [position]
[debate]
/agon convergence
```

**Why the order matters:** If you run Agon first and then use Honest to audit the framing, you are auditing after the debate has already embedded the assumption. Pre-verification with Honest prevents this.

---

## Pattern 4: Full Stack (Honest + Janus + Agon + Aletheia)

**Use case:** Complex research sessions, high-stakes decisions, or any session where epistemic hygiene is a first-class requirement from start to finish.

**Problem it solves:** Each skill addresses one layer. The full stack addresses all four simultaneously: framing verification (Honest), epistemic labeling (Janus), structured debate (Agon), and persistent resolution tracking (Aletheia).

**Skill sequence:**

```
── SESSION OPEN ──────────────────────────────────────

/frame [context]              ← Honest: set session context and constraints
/honest                       ← Honest: maximum-honesty baseline

── FRAMING VERIFICATION ──────────────────────────────

/split                        ← Honest: separate known from assumed in topic framing
/check [key claims]           ← Honest: ground-check major premises

── FACTUAL ANALYSIS ──────────────────────────────────

/sol                          ← Janus: enter Sol face
[Analysis with full [KNOWN]/[INFERRED]/[UNCERTAIN]/[UNKNOWN] labeling on every claim]

── STRUCTURED DEBATE ─────────────────────────────────

/agon open [topic]            ← Agon: open debate
/agon advocate [position A]
/agon skeptic [position B]
[debate rounds — Agon operates independently of Janus face state]
/agon convergence             ← Agon: generate Convergence Report

── RESOLUTION AND TRACKING ───────────────────────────

/aletheia resolve [claims from convergence zone]
/aletheia log                 ← Aletheia: persist resolutions to ~/.janus/
/aletheia debt                ← Aletheia: surface remaining open claims

── SESSION CLOSE ─────────────────────────────────────

/audit                        ← Honest: final sweep for unlabeled claims
/threshold status             ← Janus: confirm Sol/Nox state at session close
```

**Interaction notes:**
- Agon operates independently of Janus face state. You do not need to exit Sol to run `/agon open`.
- Aletheia reads Janus-labeled claims from the session to populate resolution candidates. Running Aletheia after a Sol-face session gives it the richest input.
- `/audit` at session close catches anything that slipped through without a label during the Agon phase, where Janus labeling is not enforced.

---

## When to Use Which Pattern

| Situation | Pattern |
|-----------|---------|
| Factual research with some speculative sections | Honest + Janus |
| Single-topic debate you want to track over time | Agon + Aletheia |
| Debate where you're unsure if the framing is sound | Honest + Agon |
| High-stakes decisions, complex research, epistemic-first sessions | Full Stack |
| Quick fact-checking, everyday development | Honest alone |
| Dream work, shadow integration, alchemical practice | Oneironautics (Janus runs beneath it automatically) |

---

## Practical Notes

**Skills do not need to be invoked in the same session.** You can run an Agon debate today and use Aletheia to pick up unresolved claims next session via `/aletheia debt`.

**Honest commands work in any context.** `/check`, `/split`, and `/audit` are not mode-specific. They work whether or not Janus Sol is active, whether or not an Agon session is open.

**Do not run Nox during an Agon session.** Nox marks all output `[DREAM]`. An Agon debate requires factual grounding for the Convergence Report to be meaningful. If you need speculative positions, keep them in the Advocate/Skeptic framing rather than switching to Nox.

**Aletheia's ledger is shared with Janus.** Both write to `~/.janus/`. This is intentional — claims labeled by Janus Sol are available to Aletheia without re-entry.
