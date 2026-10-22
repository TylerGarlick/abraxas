# Honest Integration Guide

How to use Honest alongside development tools, PR review, and coding sessions.

---

## Overview

Honest is a 9-command Claude Code skill for plain-language anti-hallucination. This guide covers integration patterns for software development contexts: code review, PR feedback, debugging sessions, architectural decisions, and documentation.

Honest works best as a lightweight layer applied *before* you act on AI output — not after.

---

## Quick Reference

| Command | What It Does |
|---------|-------------|
| `/check` | Verify a specific claim or statement |
| `/trace` | Show where a claim comes from |
| `/honest` | Force maximum-honesty response mode |
| `/label` | Label confidence on a statement |
| `/sources` | List sources used in a response |
| `/split` | Separate what's known from what's guessed |
| `/flag` | Mark a claim as needing verification |
| `/frame [name]` | Load a context frame for the session |
| `/audit` | Review the session for unlabeled guesses |

---

## Development Workflows

### PR Review Sessions

Use Honest to separate confirmed behavior from LLM interpretation when reviewing pull requests.

**Pattern: Frame first, then review**

```
/frame expert
[Paste diff or code change]
/split
```

`/frame expert` primes Honest for a higher-confidence, lower-hedge mode. `/split` after pasting a diff forces explicit separation of what is structurally verifiable (e.g., "this function is now called before initialization") from what is inferred (e.g., "this will likely cause a race condition under load").

**What to watch for in `/split` output:**
- Any claim labeled `[INFERRED]` or `[UNCERTAIN]` about runtime behavior — test it before acting
- `[UNKNOWN]` on performance or security claims — do not merge on the basis of these

---

### Debugging Sessions

When debugging, LLMs often present guesses as diagnoses. Honest surfaces the difference.

**Pattern: `/honest` before hypothesis generation**

```
/honest
Here is the stack trace: [paste trace]
What could cause this?
```

In `/honest` mode, Claude will prefix each candidate cause with its epistemic status. Causes it knows are structurally consistent with the trace are `[KNOWN]`. Causes that are plausible but not derivable from the trace are `[INFERRED]`. Causes it is unsure of are `[UNCERTAIN]`.

This prevents the common failure mode of debugging the most-confidently-stated hypothesis instead of the most likely one.

**Pattern: `/check` on a suspected cause**

```
/check "The connection pool is exhausted because the timeout is set too low"
```

Forces explicit grounding: does the code actually set a timeout? Is the pool size bounded? `/check` will flag any part of the claim that is not verifiable from context.

---

### Architectural Decisions

Architecture discussions with AI often blur empirical claims (benchmark data, known limitations) with opinion (best practices, trade-off recommendations).

**Pattern: `/label` on recommendations**

```
/label
Should I use Postgres or SQLite for this use case?
```

Runs the response with confidence labels on every substantive claim. A response that would otherwise read as authoritative becomes clearly marked: `[KNOWN]` for documented capability differences, `[INFERRED]` for workload projections, `[UNCERTAIN]` for claims about your specific system behavior.

**Pattern: `/frame skeptic` for high-stakes decisions**

```
/frame skeptic
We're considering moving to a microservices architecture. What are the risks?
```

The `skeptic` frame instructs Honest to lead with risks, gaps, and failure modes rather than benefits. Use this before acting on a recommendation, not just after.

---

### Documentation Writing

When using AI to draft technical documentation, `/audit` surfaces where the LLM filled gaps with plausible-sounding content.

**Pattern: Write first, audit second**

```
[Ask for documentation draft]
/audit
```

`/audit` reviews the session for claims that were asserted without grounding. In documentation contexts, common audit findings include: version numbers stated as current but unverified, API parameter descriptions inferred from naming conventions rather than actual signatures, and behavior claims that are plausible but not confirmed.

---

### Code Generation

When generating code, use `/trace` to verify that suggested APIs, methods, or patterns actually exist in the versions you're targeting.

**Pattern: `/trace` on unfamiliar APIs**

```
[Receive code suggestion using unfamiliar library]
/trace the method `client.stream_response()`
```

Forces Claude to identify whether the method is from training data (and which version), inferred from naming patterns, or genuinely unknown. This catches hallucinated APIs before you spend time debugging non-existent methods.

---

## Frame Reference for Development

Pre-built frames relevant to development sessions:

| Frame | Best For |
|-------|---------|
| `expert` | Technical discussions where you want lower hedge, higher precision |
| `skeptic` | Architecture decisions, security review, risk assessment |
| `learner` | Onboarding to unfamiliar codebases or technologies |

Load with: `/frame expert`, `/frame skeptic`, `/frame learner`

Create a session-specific frame for a recurring context:

```
/frame save "reviewing-payment-service"
Context: We are reviewing the payment-service codebase.
Known constraints: PCI-DSS compliance required, no external HTTP calls from core payment flow.
Flag any recommendation that would violate these constraints.
```

---

## Integration with Janus System

Honest is the plain-language interface to the Janus System. If you need full Sol/Nox epistemic labeling (e.g., for sessions involving both factual analysis and speculative design work), load the Janus skill alongside Honest.

**Escalation pattern:**

1. Start with Honest for most development sessions
2. When you need explicit `[DREAM]`/`[KNOWN]` separation (e.g., exploring speculative architecture vs. documenting actual system behavior), switch to `/sol` (Janus Sol face)
3. Return to Honest for follow-up verification

---

## Common Mistakes

**Using `/honest` after acting on output** — the value is in the pre-action check, not the retrospective label.

**Ignoring `[INFERRED]` labels** — inferred claims are often correct but not verifiable from context. Treat them as hypotheses, not facts.

**Not framing before long sessions** — without a frame, Honest applies default hedging behavior. Framing once at the start calibrates the session.

**Over-relying on `/audit`** — audit is a catch mechanism, not a replacement for checking `[INFERRED]` and `[UNCERTAIN]` claims in real time.
