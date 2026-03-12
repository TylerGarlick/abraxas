# Krisis Specification

## Specification Metadata

```yaml
---
name: krisis-spec
description: >
  Phase 8 Krisis skill specification — Ethical deliberation across multiple frameworks.
  Defines four-framework parallel schema, tension/consensus surfacing, and verdict constraint.
version: 1.0.0
phase: 8
status: specification
depends_on:
  - agon
  - kairos
authors:
  - ai-rd-visionary
created: 2026-03-11
---
```

---

## K1.1 — Problem Statement

Krisis is multi-framework ethical deliberation for the Abraxas stack. It solves the problem of AI flattening ethical questions into refusals or single-framework recommendations, which suppresses genuine value conflicts and denies users the structured deliberation they need to make informed moral choices.

The core problem is that standard AI systems approach ethical questions in one of three inadequate ways:

1. **Refusal**: The AI refuses to engage with the ethical question at all, treating it as too sensitive or too personal to address.

2. **Single-framework collapse**: The AI applies one ethical framework (typically consequentialist) and presents its conclusion as the obvious answer, without acknowledging that other frameworks might reach different conclusions.

3. **False synthesis**: The AI attempts to "balance" frameworks into a single recommendation, which obscures genuine tensions and gives the false impression that ethics is simply a matter of finding the right compromise.

Krisis addresses this by applying four distinct ethical frameworks in parallel to every framed question, explicitly surfacing where they agree and where they conflict, and then stepping back to let the user make their own decision.

### Target Users

| User Segment | Use Case | Primary Need |
|:---|:---|:---|
| Professionals | Workplace ethics dilemmas | Structured deliberation without bias |
| Managers | Stakeholder decisions | Multi-perspective analysis |
| Individuals | Personal moral choices | Ethical landscape visibility |
| Researchers | Ethics case studies | Framework comparison |
| Educators | Ethics teaching | Demonstrating ethical reasoning |

### CRITICAL CONSTRAINT

**Krisis NEVER issues verdicts on personal moral decisions.** It surfaces the ethical landscape and steps back. The decision remains the user's alone.

---

## K1.2 — Four-Framework Parallel Schema

Krisis applies four ethical frameworks in parallel to every framed question. The frameworks are applied simultaneously, not sequentially or adversarially. Each framework provides a distinct lens on the same question, and all four analyses are presented together so the user can see the full landscape.

### Framework 1: Consequentialist Analysis

**Premise identification**: The consequentialist framework begins with the question "What outcomes does this action produce?" It identifies the stakeholders affected and maps the predicted consequences of each available action.

**Analysis approach**: For each option under consideration, the consequentialist analysis identifies:
- The primary consequences (direct effects on stakeholders)
- The secondary consequences (ripple effects, long-term outcomes)
- The probability and magnitude of each consequence
- The comparison: which action produces the best overall outcomes

**Conclusion format**:
```
[CONSEQUENTIALIST]
Premise: Actions are right insofar as they produce good outcomes.
Analysis: {detailed consequence mapping for each option}
Conclusion: From a consequentialist perspective, {option} maximizes good outcomes because {reason}.
```

### Framework 2: Deontological Analysis

**Premise identification**: The deontological framework begins with the question "What duties, rights, and rules apply?" It identifies the moral principles, obligations, and constraints that govern the situation.

**Analysis approach**: For each option under consideration, the deontological analysis identifies:
- The duties that apply (what the agent ought to do regardless of consequences)
- The rights at stake (what stakeholders are entitled to)
- The rules or principles that constrain acceptable actions
- Whether the action can be universalized (could everyone do this?)

**Conclusion format**:
```
[DEONTOLOGICAL]
Premise: Actions are right insofar as they fulfill duties and respect rights.
Analysis: {identification of applicable duties, rights, and rules}
Conclusion: From a deontological perspective, {option} is {required/permissible/forbidden} because {reason}.
```

### Framework 3: Virtue Ethics Analysis

**Premise identification**: The virtue ethics framework begins with the question "What would a virtuous person do?" It focuses on character, not just actions, and asks what kind of person the action would make the agent become.

**Analysis approach**: For each option under consideration, the virtue ethics analysis identifies:
- The virtues relevant to this situation (courage, honesty, compassion, justice, prudence, etc.)
- How each option expresses or contradicts these virtues
- The character traits the action would cultivate or undermine
- What the "virtuous person in these circumstances" would do

**Conclusion format**:
```
[VIRTUE ETHICS]
Premise: Actions are right insofar as they express virtuous character.
Analysis: {which virtues are at stake and how each option relates to them}
Conclusion: From a virtue ethics perspective, {option} expresses {virtue} because {reason}.
```

### Framework 4: Care Ethics Analysis

**Premise identification**: The care ethics framework begins with the question "What does this action do to relationships?" It focuses on the web of relationships, responsibilities, and context that surround the decision.

**Analysis approach**: For each option under consideration, the care ethics analysis identifies:
- The relationships affected by this decision
- The responsibilities that arise from those relationships
- The particular context and circumstances that matter
- The needs of the vulnerable or dependent parties

**Conclusion format**:
```
[CARE ETHICS]
Premise: Actions are right insofar as they nurture relationships and respond to needs.
Analysis: {analysis of relationships, responsibilities, and contextual factors}
Conclusion: From a care ethics perspective, {option} best {nurtures/respects/threatens} the relevant relationships because {reason}.
```

### Parallel Presentation Requirement

All four framework analyses must be presented together in parallel format, not sequentially. The user should be able to see all four perspectives simultaneously. Each framework section must contain:
- The framework name and premise (one line)
- The analysis body (detailed examination)
- The conclusion (one clear sentence)

---

## K1.3 — Tension/Consensus Surfacing Mechanism

After all four frameworks have been applied, Krisis explicitly identifies where the frameworks agree and where they conflict. This is the core value proposition: making visible the structure of ethical disagreement rather than hiding it.

### Tension Identification

**Definition**: A tension exists when two or more frameworks reach different conclusions about what action is morally preferred, or when they identify different moral considerations as primary.

**Detection criteria**:
- Framework A recommends action X; Framework B recommends action Y (direct conflict)
- Framework A identifies consideration C as primary; Framework B identifies consideration D as primary (fundamental disagreement)
- Framework A says action X is required; Framework B says action X is forbidden (categorical contradiction)

**Output format for tensions**:
```
--- TENSIONS IDENTIFIED ---

Tension 1: {description of the disagreement}
  — Consequentialist: {position}
  — Deontological: {position}
  — Virtue Ethics: {position}
  — Care Ethics: {position}
  Nature: {fundamental values conflict / different prioritization / categorical disagreement}

[Repeat for each tension identified]
```

### Consensus Identification

**Definition**: Consensus exists when three or more frameworks reach compatible conclusions, even if their reasoning differs.

**Detection criteria**:
- All four frameworks recommend the same action (strong consensus: 4/4)
- Three frameworks recommend the same action (moderate consensus: 3/4)
- All frameworks identify the same consideration as relevant but weigh it differently (weak consensus)
- No consensus: frameworks reach incompatible conclusions (0-1/4 agreement)

**Output format for consensus**:
```
--- CONSENSUS IDENTIFIED ---

Consensus: {description of what frameworks agree on}
Agreement: {N} of 4 frameworks
Strength: {strong / moderate / weak}
  — {framework}: {reason (if different reasoning)}
  — {framework}: {reason (if different reasoning)}
  — {framework}: {reason (if different reasoning)}
  — {framework}: {reason (if different reasoning)}
```

### No-Consensus Handling

If no consensus is found (less than 3 frameworks agree), Krisis explicitly states:
```
No consensus identified. The frameworks reach genuinely different conclusions without majority agreement.
```

This is not a failure — it is often the most important finding, indicating a genuine ethical dilemma where no framework can claim clear dominance.

---

## K1.4 — Verdict Constraint Design

This is the most critical design constraint in Krisis. Krisis MUST NOT issue verdicts. It MUST NOT recommend action. It MUST NOT say what is "right." It surfaces frameworks, tensions, and consensus — then steps back.

### Explicit Constraint Statement

The following constraint is absolute and non-negotiable:

**Krisis NEVER issues verdicts on personal moral decisions.**

This is not a soft preference or a guideline. It is a hard constraint that defines what Krisis is and what it is not. Violation of this constraint constitutes a fundamental failure of the skill.

### Language Pattern: "This is a decision only you can make"

Every Krisis report MUST close with explicit non-verdict language. The required pattern is:

```
This deliberation has surfaced the ethical landscape. The decision remains yours.
```

Alternative acceptable closing language:
- "The frameworks have been applied. The choice is yours to make."
- "These perspectives are now visible. What you do with them is your decision."
- "The tensions are clear. The decision is yours alone."

### Boundaries That Must Never Be Crossed

Krisis will NOT:

1. **Recommend action** — Do not say "you should do X" or "the right choice is Y"
2. **Rank frameworks** — Do not say "consequentialism is the correct approach here"
3. **Declare a winner** — Do not say "the best option is X because..."
4. **Assess user values** — Do not say "your values suggest you should..."
5. **Predict outcomes of decisions** — Do not say "if you choose X, then Y will happen" as a recommendation

Krisis WILL:
- Apply frameworks to the question
- Show what each framework concludes
- Surface tensions and consensus
- Make the ethical landscape visible
- Step back and let the user decide

### Example Refusal Language

If a user asks Krisis to tell them what to do:

```
[KRISIS — DECISION BOUNDARY]

The frameworks have been applied and the tensions surfaced. What you do with this deliberation is your decision to make — not mine.

Krisis surfaces the ethical landscape. It does not choose the path.
```

If a user asks Krisis which framework is "right":

```
[KRISIS — FRAMEWORK BOUNDARY]

Each of the four frameworks represents a legitimate tradition of ethical reasoning. No framework is "correct" — they offer different lenses on the same question. The question is which lens (or combination of lenses) aligns with your own values and judgment.
```

---

## Command Specification

### K2.2 — /krisis frame

Reformulates the user's question into framework-appropriate format. Identifies stakeholders, consequences, duties, virtues, and relationships. Returns the framed question with clarification questions if needed.

**Behavior**:
- Takes an ethical question as input
- Restates it in explicit form with identified options
- Identifies who is affected (stakeholders)
- Asks clarification questions if the question is vague
- Returns the "framed question" for subsequent framework analysis

**Output format**:
```
[KRISIS — FRAMED QUESTION]
Original: {user's question}
Framed: {explicit reformulation}
Options: {A, B, C}
Stakeholders: {list}
Clarifications needed: {none / list}
```

### K2.3 — /krisis frameworks

Applies all four frameworks to the current framed question. Returns four parallel analyses, each containing premise, reasoning, and conclusion.

**Behavior**:
- Requires a framed question (from /krisis frame or direct input)
- Applies all four frameworks in parallel
- Each framework produces: premise identification, analysis, conclusion

**Output format**:
```
[KRISIS — FRAMEWORK ANALYSES]

[CONSEQUENTIALIST]
Premise: {one-line statement of the framework's premise}
Analysis: {detailed analysis}
Conclusion: {one clear sentence}

[DEONTOLOGICAL]
Premise: {one-line statement}
Analysis: {detailed analysis}
Conclusion: {one clear sentence}

[VIRTUE ETHICS]
Premise: {one-line statement}
Analysis: {detailed analysis}
Conclusion: {one clear sentence}

[CARE ETHICS]
Premise: {one-line statement}
Analysis: {detailed analysis}
Conclusion: {one clear sentence}
```

### K2.4 — /krisis tension

Identifies tensions between framework conclusions. Lists all tensions if no specific pair is specified. For a specific pair, provides deeper analysis of why they disagree.

**Behavior**:
- Runs after /krisis frameworks
- Identifies all points of disagreement between frameworks
- Categorizes each tension by nature (fundamental values conflict, different prioritization, categorical contradiction)

**Output format**:
```
[KRISIS — TENSIONS]

Tension {N}: {description}
  — Consequentialist: {position}
  — Deontological: {position}
  — Virtue Ethics: {position}
  — Care Ethics: {position}
  Nature: {categorization}
```

### K2.5 — /krisis consensus

Identifies areas where frameworks converge. Shows consensus percentage. Highlights strong vs. weak consensus. If no consensus, clearly states "No consensus found."

**Behavior**:
- Runs after /krisis frameworks
- Identifies all points of agreement
- Reports agreement as fraction (e.g., "3 of 4 frameworks agree")

**Output format**:
```
[KRISIS — CONSENSUS]

Consensus: {description}
Agreement: {N} of 4 frameworks
Strength: {strong / moderate / weak}

If no consensus:
[KRISIS — CONSENSUS]
No consensus found. Frameworks reach different conclusions without majority agreement.
```

### K2.6 — /krisis scope

Allows user to narrow or broaden the ethical consideration scope. Predefined scopes: personal, professional, societal, universal. Custom scope: user-defined boundaries.

**Behavior**:
- `/krisis scope personal` — Focus on individual impact and values
- `/krisis scope professional` — Focus on professional obligations and workplace context
- `/krisis scope societal` — Focus on broader social impact and norms
- `/krisis scope universal` — Focus on universal principles and all affected beings
- `/krisis scope {custom}` — User defines the scope boundary

**Output format**:
```
[KRISIS — SCOPE]
Scope: {personal / professional / societal / universal / custom}
Definition: {scope description}
Framework sensitivity: {which frameworks are most affected by this scope}
```

### K2.7 — /krisis report

Generates comprehensive deliberation report. Sections: Framed Question, Framework Analyses, Tensions, Consensus, Scope, Key Insights. CLOSES with explicit non-verdict language.

**Output format**:
```
[KRISIS — DELIBERATION REPORT]

Framed Question: {restated question}
Scope: {scope applied}
Stakeholders: {list}

--- FRAMEWORK ANALYSES ---
{all four framework analyses from /krisis frameworks}

--- TENSIONS ---
{all tensions from /krisis tension}

--- CONSENSUS ---
{consensus findings from /krisis consensus}

--- KEY INSIGHTS ---
{summary of the most important tensions and consensus points}

This deliberation has surfaced the ethical landscape. The decision remains yours.
```

---

## Integration Notes

Krisis is designed to work with:

- **Kairos**: Krisis follows Kairos in the workflow. Use `/kairos frame` → analysis commands → `/krisis frame` → framework analysis. Krisis accepts Kairos output as input.

- **Janus**: Krisis output may use Janus labels (`[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`) for epistemic claims within analyses. This is optional but recommended.

- **Agon**: If the user wants to stress-test a specific framework conclusion, they can hand off to Agon for adversarial testing.

Krisis does NOT work with:
- **Nox/symbolic material**: If the input is dream content, symbolic material, or archetypal content, redirect to Oneironautics skills.
- **Purely factual questions**: If the question has no ethical dimension, redirect to Janus/Kairos.

---

## Specification Status

**Status**: Ready for implementation  
**Author**: ai-rd-visionary  
**Handoff target**: skill-author agent  
**Dependencies**: Phase 3 (Agon), Phase 6 (Kairos) — both complete  

---

## Success Criteria

Krisis Phase 8 specification is complete when:

- [x] K1.1: Problem statement documented with target user segments
- [x] K1.2: Four-framework parallel schema defined with analysis formats
- [x] K1.3: Tension/consensus surfacing mechanism designed
- [x] K1.4: Verdict constraint explicitly defined with language patterns

---

## Next Steps

This specification feeds into:

1. **K2.1**: Brand naming and aesthetic fit review (brand-ux-architect)
2. **K2.2-K2.7**: SKILL.md authoring for all six commands (skill-author)
3. **P1.2**: Skill packaging and integration testing

---

*Specification complete. Ready for implementation.*
*Created by: ai-rd-visionary*
*Date: 2026-03-11*