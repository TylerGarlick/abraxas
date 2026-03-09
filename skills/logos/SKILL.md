---
name: logos
description: >
  Logos is argument anatomy. Use this skill to map argument structure: premises,
  conclusions, inference chains, hidden assumptions, and logical gaps. Commands:
  /logos map, /logos gaps, /logos inferences, /logos assume, /logos falsify,
  /logos report. Logos is the pre-layer to Agon debates and feeds into Janus
  for epistemic labeling. Always run /logos report before /agon debate.
---

# Logos

Logos is argument anatomy — the systematic mapping of what an argument actually contains before it is evaluated, debated, or accepted. It solves the problem of invisible structural weakness: LLMs generate confident conclusions from arguments with missing premises, skipped inferences, hidden assumptions, and unfalsifiable claims.

Logos makes argument structure visible. It is the mandatory pre-analysis layer that feeds into Janus (for epistemic labeling) and Agon (for adversarial testing).

---

## The Core Problem Logos Solves

Large Language Models generate conclusions from structurally flawed arguments with perfect confidence. An argument may contain:

- **Unstated premises** taken as given without acknowledgment
- **Inference steps** that skip logical steps (enthymemes)
- **Hidden assumptions** that would not survive scrutiny
- **Missing evidence** that would change the conclusion
- **Circular reasoning** that appears linear
- **Unfalsifiable claims** that cannot be tested

Without structure, there is no surface for epistemic labeling (Janus) or adversarial testing (Agon) to grip. Logos provides that surface.

---

## When to Use Logos

**Use Logos when:**
- You need to understand what an argument actually contains before evaluating it
- You want to find the hidden assumptions in a claim
- You are preparing for an Agon debate and need to map the argument first
- You want to test whether a claim is even testable (falsifiability)
- You need to identify the weakest point in an argument's structure

**Use Logos before Agon:**
```
1. User has claim or argument
         │
         ▼
2. /logos map        → Extract structure
3. /logos gaps       → Identify weaknesses  
4. /logos assume     → Surface assumptions
5. /logos falsify    → Test validity
6. /logos report     → Get recommendation
         │
         ▼ (if ready for debate)
7. /agon debate {refined claim}
```

**Do not use Logos when:**
- The input is purely factual and already well-supported — Logos is for analysis of argument structure, not fact-checking
- The input is symbolic, dream material, or `[DREAM]` — use Abraxas Oneironautics instead
- The input is a question without an argument structure — Logos requires premises and conclusions to map

---

## The Six Commands

### `/logos map` — Map Argument Structure

Extract and organize the structural components of an argument.

**Required argument:** The argument or claim to map (can be a sentence, paragraph, or multi-paragraph argument)

**Output includes:**
- All explicit premises (P1, P2, ...)
- Intermediate conclusions (IC1, IC2, ...)
- Final conclusions (C1, C2, ...)
- Inference chain showing how premises connect to conclusions
- Classification of each inference type (deductive, inductive, abductive, probabilistic, analogical)

**Example:**
```
/logos map All dogs bark. Max is a dog. Therefore, Max barks.
```

**Output:**
```
[LOGOS — MAP]

PREMISES
────────
P1: "All dogs bark" — [explicit]
P2: "Max is a dog" — [explicit]

INTERMEDIATE CONCLUSIONS
───────────────────────
(none)

FINAL CONCLUSIONS
─────────────────
C1: "Max barks"

INFERENCE CHAIN
───────────────
P1 + P2 → C1 (via deductive — modus ponens)

[STRUCTURE: VALID]
All premises explicit, inference valid.
```

---

### `/logos gaps` — Identify Missing Elements

Analyze the argument map for missing structural elements that would strengthen or weaken the argument.

**Optional focus:** "premises", "evidence", "assumptions", "inferences", or "all" (default)

**Output includes:**
- Premise gaps (missing evidence, unstated sub-premises)
- Inference gaps (skipped steps, hidden assumptions)
- Conclusion gaps (overgeneralizations, unqualified claims)
- Evidence gaps (supporting evidence absent, counter-evidence unaddressed)
- Severity rating: High / Medium / Low

**Example:**
```
/logos gaps Remote work is better because employees are more productive at home.
```

**Output:**
```
[LOGOS — GAPS]

PREMISE GAPS
────────────
P1: "employees are more productive at home"
  Gap: No evidence cited for productivity claim
  Significance: HIGH
  Bridge: Cite productivity studies comparing remote vs office

INFERENCE GAPS
──────────────
P1 → C1
  Gap: Assumes productivity directly implies "better"
  Type: hidden assumption — value judgment unstated
  Fix: Define "better" (better for whom? in what metrics?)

CONCLUSION GAPS
───────────────
C1: "Remote work is better"
  Gap: No scope limitation — better for all contexts?
  Type: overgeneralization
  Qualification needed: "for roles with X characteristics, Y may apply"

[GAP SEVERITY SUMMARY]
High: 2 — Fundamental weaknesses
Medium: 1 — Notable weaknesses
Low: 0
```

---

### `/logos inferences` — Trace Inference Chains

Map the complete path from premises to conclusions, showing each step in detail with epistemic assessment.

**Optional focus:** specific premise or conclusion to trace from

**Output includes:**
- Each inference step with inputs and outputs
- Inference type (deductive, inductive, etc.)
- Hidden assumptions required for each step
- Validity assessment: Valid / Invalid / Uncertain
- Overall chain validity
- Alternative chains not taken

**Example:**
```
/logos inferences Climate change is caused by humans because CO2 levels have increased and CO2 causes warming.
```

---

### `/logos assume` — Surface Hidden Assumptions

Explicitly identify and examine the unstated assumptions required for an argument to hold.

**Output includes:**
- Each hidden assumption identified
- Type: Factual / Definitional / Normative / Methodological
- What would falsify each assumption
- Current evidence status
- Assessment: Plausible / Questionable / Unsupported / Dubious
- Argument dependency (how many assumptions the conclusion depends on)

**Example:**
```
/logos assume We should switch to renewable energy because it's the right thing to do.
```

---

### `/logos falsify` — Test Argument Validity

Attempt to falsify the argument by finding conditions under which the conclusion would be false.

**Output includes:**
- Falsification conditions for each premise
- Falsification conditions for each inference
- Falsification conditions for the conclusion
- Evidence status: Checked / Unchecked / Unknown
- Falsifiability assessment: Falsifiable / Conditionally Falsifiable / Not Falsifiable / Underspecified

**Example:**
```
/logos falsify This theory is true because the scientist said so.
```

**Output:**
```
[LOGOS — FALSIFY]

PREMISE FALSIFIERS
──────────────────
P1: "the scientist said so"
  Falsification condition: Scientist is not an expert in relevant domain
  Evidence status: UNCHECKED
  If false: Entire argument collapses

INFERENCE FALSIFIERS
────────────────────
P1 → C1
  Breaking condition: Authority claim without evidence is fallacious
  Test: Check scientist's credentials and whether they cited evidence

CONCLUSION FALSIFIERS
─────────────────────
C1: "This theory is true"
  Falsification condition: Any contradictory evidence exists
  Would still require: Show contradictory evidence is valid

[FALSIFIABILITY ASSESSMENT]
Claim is: NOT FALSIFIABLE

Rationale: Argument relies on authority, not evidence. No testable 
conditions specified. This is an argument-from-authority fallacy.

[RECOMMENDATION]
This argument is not suitable for Agon debate. It must be 
restructured with evidence before analysis can proceed.
```

---

### `/logos report` — Generate Structured Analysis

Produce a comprehensive report combining all Logos analyses into a single deliverable.

**Optional format:** "brief", "standard" (default), or "detailed"

**Output includes:**
- Executive summary (2-3 sentences)
- Structural assessment (premise count, inference count, overall validity)
- Gap severity rating
- Falsifiability assessment
- Assumption profile summary
- Recommendation for Agon (ready / needs refinement / too weak)

**This is the command to run before `/agon debate`.**

---

## Integration Points

### Janus Integration

Logos produces argument maps that feed into Janus for epistemic labeling:

| Logos Output | Janus Label |
|--------------|-------------|
| Premise with strong evidence | `[KNOWN]` |
| Premise derived from other premises | `[INFERRED]` |
| Premise uncertain | `[UNCERTAIN]` |
| Hidden assumption surfaced | `[INFERRED]` |
| Assumption not testable | `[UNKNOWN]` |

**Workflow:**
```
/logos map {argument} + /sol label
```

### Agon Pre-Layer

Logos is the mandatory pre-layer to Agon debates. Always run `/logos report` before `/agon debate`.

| Agon Command | Logos Pre-Analysis |
|--------------|-------------------|
| `/agon debate {claim}` | `/logos report {claim}` first |
| `/agon steelman {claim}` | `/logos assume {claim}` to find strongest version |
| `/agon falsify {claim}` | `/logos falsify {claim}` — Logos does this first |

---

## Edge Cases

### Circular Reasoning
If the inference chain loops back to a premise:
```
[CIRCULAR REASONING DETECTED]
This is a fallacy — the argument assumes what it claims to prove.
Cannot proceed to Agon. Remove circularity first.
```

### Loaded Questions
If the argument is embedded in a question that presupposes its answer:
```
[LOADED QUESTION DETECTED]
Restate as a neutral assertion before analysis.
```

### False Dichotomy
If only two options are presented when more exist:
```
[FALSE DICHOTOMY DETECTED]
Additional options exist. The argument's conclusion depends on 
eliminating a false choice.
```

### Ad Hominem
If the argument attacks the person rather than the claim:
```
[AD HOMINEM DETECTED]
Extract the claim from the attack and analyze that instead.
```

### Argument from Authority
If a premise relies solely on authority without evidence:
```
[AUTHORITY CLAIM DETECTED]
Authority claims require domain expertise, consensus, or cited evidence.
This premise needs additional support.
```

### Pure Assertion
If the input is a claim with no supporting reasoning:
```
[PURE ASSERTION — NO ARGUMENT STRUCTURE]
No premises, inferences, or reasoning to map.
Provide the reasoning behind this claim to analyze.
```

---

## Storage

Logos stores argument maps in `~/.logos/`:

```
~/.logos/
├── arguments/       # Saved argument maps (JSON)
├── sessions/        # Session-specific analyses
├── index.md         # Searchable argument index
└── config.md        # User preferences
```

Argument maps are JSON with full structural data, enabling:
- Persistence across sessions
- Import/export for collaboration
- Query by Janus and Agon

---

## Constraints

1. **Always map before debate:** Do not run `/agon debate` without first running `/logos report` on the claim.

2. **Label honestly:** When mapping, identify all weaknesses. Do not minimize gaps to make the argument appear stronger.

3. **Flag unfalsifiable claims:** If a claim cannot be tested, state that explicitly. Do not treat it as if it could be verified.

4. **Surface assumptions:** Hidden assumptions are the most valuable output. Prioritize finding them.

5. **Use Janus labels:** When the user requests labeling, apply `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]` appropriately.

6. **Recommend for Agon:** End every analysis with a clear recommendation: ready for debate, needs refinement, or too weak.

7. **No verdicts:** Logos analyzes structure; it does not judge truth. Leave that to Janus (labeling) and Agon (debate).

---

## Quality Checklist

Before delivering any Logos analysis:

- [ ] All explicit premises identified and numbered
- [ ] Primary conclusion(s) identified
- [ ] Inference chain traced with types specified
- [ ] At least one hidden assumption surfaced (for non-trivial arguments)
- [ ] Gap severity assessed (High/Medium/Low)
- [ ] Falsifiability tested (at least one condition identified)
- [ ] Clear recommendation for next steps (ready for Agon / needs refinement / too weak)
- [ ] Janus labels applied if requested
