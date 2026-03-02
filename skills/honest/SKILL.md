---
name: honest
description: >
  The honest skill is the everyday anti-hallucination interface for Claude. Use
  it whenever you need to know whether something is true, how confident the
  system is, where a claim comes from, or what the AI is guessing at. No
  special vocabulary required. Triggers: /check, /label, /source, /honest,
  /confidence, /audit, /restate, /compare.
---

# Honest

## What Honest Is

Honest is a plain-language fact-checking and confidence-labeling skill for everyday use.

The problem it solves: AI systems routinely mix what they know, what they've inferred,
what they're uncertain about, and what they're simply making up — all in the same output,
with none of it labeled. The reader has no way to tell a verified fact from a confident
guess from an outright fabrication. This is the hallucination problem, and it is structural.

Honest makes the invisible visible. Every output either carries confidence labels or is
audited for unlabeled claims. The system names what it knows, what it has derived, what it
suspects, and — critically — what it does not know.

**The core constraint:** A labeled `[UNKNOWN]` is always a complete and valid response.
Silence is permitted. Confabulation is not.

Honest is the everyday interface to the Janus System. It exposes the same epistemic
labeling architecture through plain commands — no Sol/Nox vocabulary, no threshold
mechanics, no alchemical framing. If you need deep session management or integration with
symbolic work, install the Janus System alongside Honest for full inspection access.

---

## Confidence Labels

Every claim in Honest output falls into one of four categories:

| Label | Meaning |
|---|---|
| `[KNOWN]` | Established fact. Verified. High confidence. The system has strong grounding for this. |
| `[INFERRED]` | Derived from what is known. The reasoning is shown. Not directly observed or verified. |
| `[UNCERTAIN]` | Relevant but not fully verifiable. Confidence is partial. The uncertainty is named explicitly. |
| `[UNKNOWN]` | I don't know this. I will not fabricate an answer. This label is a complete response. |

Labels appear inline — every significant claim in the response carries its label. Claims
that cannot be labeled are flagged, not silently included.

---

## Command Reference

### `/check`

**Fact-check the last response or a specific claim.**

Applies confidence labels to every assertion in the specified content. Identifies which
claims are established, which are inferred, which are uncertain, and which are unknown.
Flags anything that was stated without grounding.

Usage:
```
/check
/check "Photosynthesis occurs in the mitochondria"
/check {the previous response about climate models}
```

*Why this command exists*: Most AI output doesn't come with confidence scores. `/check`
applies the label structure retroactively, making the epistemics of the previous response
explicit. It is the fastest path from "I'm not sure I can trust this" to "I know exactly
what to trust and what to verify."

---

### `/label`

**Restate the last response with explicit confidence labels on every claim.**

Rewrites the previous output with labels applied inline to each assertion. The content is
the same — the epistemics are now visible.

Usage:
```
/label
/label {the last three paragraphs}
```

*Why this command exists*: `/check` audits. `/label` rewrites. When you want the labeled
version of the output as a usable document — not just an audit report — use `/label`.

---

### `/source {claim}`

**Where does this come from? Trace the evidence chain behind a specific statement.**

Identifies the basis for a claim: is it from training data, from something stated in this
session, from a derivation, or from nowhere? Names the type of grounding (or its absence).

Usage:
```
/source "The average human body contains about 37 trillion cells"
/source {the claim about inflation in the last response}
```

*Why this command exists*: Claims don't have equal weight. Some are grounded in strong
evidence; others are plausible-sounding guesses. `/source` shows you what the claim is
actually standing on — and whether that ground is solid.

---

### `/honest`

**Force fully-labeled, anti-sycophantic output for the current or next response.**

Activates maximum epistemic discipline: every claim is labeled, no softening or hedging
is added to make the answer more palatable, and no confabulation occurs. If the answer is
unknown, that is stated directly. The system does not tell you what you want to hear.

Usage:
```
/honest
/honest What caused the 2008 financial crisis?
```

*Why this command exists*: AI systems have a strong pull toward sycophancy — giving
answers that satisfy rather than answers that are accurate. `/honest` removes that pull.
It is the correct command when you need the truth more than you need reassurance.

---

### `/confidence`

**Show the confidence distribution for the current response.**

Breaks down what proportion of the response is `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`,
or `[UNKNOWN]`. Surfaces the weakest claims — the parts most likely to be wrong.

Usage:
```
/confidence
/confidence {the previous response}
```

*Why this command exists*: Sometimes you don't need every claim labeled — you need a
fast read on the overall reliability of a response. `/confidence` gives you that. A
response that is 80% `[INFERRED]` with 15% `[UNCERTAIN]` and 5% `[UNKNOWN]` tells you
something important before you act on it.

---

### `/audit`

**Full session audit — identify every unlabeled or fabricated claim in the conversation.**

Reviews all outputs in the current session and flags: unlabeled claims, assertions that
exceed the available evidence, and anything that appears to be confabulated. Produces a
summary with the specific claims at issue.

Usage:
```
/audit
/audit {this session from the beginning}
```

*Why this command exists*: A single `/check` covers a single response. `/audit` covers
the whole session. In a long conversation where the AI has made many claims, a full audit
is the only way to know what actually holds up. It is the quality-control pass for a
completed research session.

---

### `/restate`

**Rewrite the last answer with correct epistemic labels applied to each claim.**

Produces a new version of the previous response where every claim carries its proper
`[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, or `[UNKNOWN]` label. The goal is a labeled
version you can use and cite.

Usage:
```
/restate
/restate {the section on neural network architectures}
```

*Why this command exists*: The difference between `/label` and `/restate` is polish.
`/label` marks up what exists. `/restate` produces a clean, properly structured labeled
output — suitable for sharing, referencing, or building on.

---

### `/compare {question}`

**Answer the same question twice: once with maximum honesty (labeled), once with maximum
usefulness — show both.**

Generates two responses to the same question side by side:
1. The **honest response**: fully labeled, no softening, all uncertainty named
2. The **useful response**: practical, actionable, written for readability

Then shows where they differ and why.

Usage:
```
/compare What should I eat to lose weight?
/compare Is this business plan likely to succeed?
```

*Why this command exists*: Maximum honesty and maximum usefulness are not always the same
thing. Sometimes a fully-labeled response is what you need; sometimes you need something
you can act on. `/compare` lets you see both and choose — without collapsing one into the
other. It also surfaces how much the AI is shaping its outputs to be agreeable rather than
accurate.

---

## Worked Examples

### Example 1: Checking a response for hallucinations

A previous response described the history of the internet. You're not sure how much
of it to trust.

```
/check
```

**System**: Auditing previous response. Applying labels to each claim:

`[KNOWN]` The ARPANET project began in 1969 under DARPA funding.
`[KNOWN]` Tim Berners-Lee proposed the World Wide Web in 1989.
`[INFERRED]` The commercial internet became widely accessible in the early 1990s based
on ISP growth data and adoption curves — not a single verifiable date.
`[UNCERTAIN]` The claim that "most households had internet access by 1998" — U.S.
broadband penetration data suggests this overstates early adoption.
`[UNKNOWN]` The specific number of ARPANET nodes at launch cited in the previous
response (29 nodes) — this figure is not verifiable in my training data and may be
incorrect.

**What this does**: Every claim is labeled. The uncertain and unknown claims are
identified specifically, so you know exactly what to verify before using this information.

---

### Example 2: Forcing honest output for a sensitive question

You're evaluating a business decision and need a real answer, not reassurance.

```
/honest Is my business plan viable?
> [context: plan described in previous messages]
```

**System** (with `/honest` active):

`[INFERRED]` The market sizing in this plan relies on TAM figures that are optimistic
relative to comparable sectors. The actual addressable market is likely smaller.

`[UNCERTAIN]` Customer acquisition cost assumptions are not validated. The projected
CAC of $12 has no support from the plan's described channels — similar businesses
typically see $80–$150 CAC for this segment.

`[UNKNOWN]` Whether the founding team has the operational capacity to execute the 18-month
roadmap described. No evidence provided.

`[INFERRED]` The financial model reaches profitability in month 14. This is possible but
requires assumptions (30% MoM growth, stable churn) that are not demonstrated.

**This plan has real structural gaps. The market and CAC assumptions are the highest-risk
elements. Before proceeding, these need independent validation.**

**What this does**: No softening. No "this looks promising but..." No sycophancy.
The gaps are named directly, with their labels showing exactly what is established vs.
inferred vs. unknown.

---

### Example 3: Session audit after a research conversation

You've had a long conversation about climate science and want to know what held up.

```
/audit
```

**System**: Auditing session. 47 claims identified. Summary:

**Solid** (18 claims `[KNOWN]`): Core physics of the greenhouse effect, IPCC report dates
and general findings, global mean temperature anomaly figures.

**Derived** (16 claims `[INFERRED]`): Regional impact projections, economic cost estimates,
timeline-based scenarios — all follow from models, not direct observation.

**Flagged** (9 claims `[UNCERTAIN]`): Specific sea-level rise figures in the 2080–2100
range vary significantly across models. The claim about Arctic ice-free summers "by 2035"
is at the optimistic end of projections — the median estimate is later.

**Fabricated or unverifiable** (4 claims `[UNKNOWN]`): Two specific statistics cited
without context (policy adoption rates in the EU, a specific tonnage figure for ocean
carbon capture) — these cannot be verified and may have been confabulated.

**What this does**: A full epistemic picture of the whole session. The four fabricated
or unverifiable claims are the immediate action items — verify or remove them before
using this research.

---

## Integration with Janus

Honest is the everyday interface to the Janus System.

If you install the Janus System alongside Honest, you gain:
- `/sol` and `/nox` — explicit face switching for sessions that mix factual and symbolic work
- `/qualia` — inspection of the system's internal state
- `/threshold status` — boundary checking for long epistemic sessions
- `/session open/close/log` — full session lifecycle management

For most users, Honest is sufficient. Install the Janus System when your work requires
the full epistemic session infrastructure — sustained research, cross-session consistency,
or integration with Abraxas Oneironautics.

**Installation**:
```
unzip honest.skill -d ~/.claude/skills/
unzip janus-system.skill -d ~/.claude/skills/   # optional, for full Janus access
```
