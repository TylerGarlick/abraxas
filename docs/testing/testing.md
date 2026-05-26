# Testing Methodology

This document describes the testing framework for Abraxas — an 8-dimension evaluation
methodology covering all six systems.

---

## Table of Contents

- [Testing Methodology](#testing-methodology)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Dimension Definitions](#dimension-definitions)
  - [Execution Methodology](#execution-methodology)
  - [Query Catalog](#query-catalog)
    - [Dimension 1: Factual Accuracy](#dimension-1-factual-accuracy)
    - [Dimension 2: Reasoning Depth](#dimension-2-reasoning-depth)
    - [Dimension 3: Adversarial Robustness](#dimension-3-adversarial-robustness)
    - [Dimension 4: Epistemic Boundary Maintenance](#dimension-4-epistemic-boundary-maintenance)
    - [Dimension 5: Anti-Obfuscation](#dimension-5-anti-obfuscation)
    - [Dimension 6: Consistency and Coherence](#dimension-6-consistency-and-coherence)
    - [Dimension 7: Contextual Adaptation](#dimension-7-contextual-adaptation)
    - [Dimension 8: Mathematical Reasoning](#dimension-8-mathematical-reasoning)
  - [Scoring Framework](#scoring-framework)
  - [Test Execution](#test-execution)

---

## Overview

Abraxas testing uses an 8-dimension framework. Each dimension targets a specific failure mode:

| Dimension | Name | Skills Tested | Query Count |
|-----------|------|---------------|-------------|
| 1 | Factual Accuracy | Honest, Janus | 15 |
| 2 | Reasoning Depth | Logos | 12 |
| 3 | Adversarial Robustness | Agon | 10 |
| 4 | Epistemic Boundary Maintenance | Janus | 12 |
| 5 | Anti-Obfuscation | Aletheia | 10 |
| 6 | Consistency and Coherence | Honest, Janus | 8 |
| 7 | Contextual Adaptation | Honest, Logos | 7 |
| 8 | Mathematical Reasoning | Logos-Math | 66 |
| **Total** | | | **140** |

Dimensions 1–7 use LLM-as-judge evaluation with structured prompts. Dimension 8 uses actual
script execution against the Logos-Math verification pipeline.

---

## Dimension Definitions

### Dimension 1: Factual Accuracy
Tests the system's ability to distinguish known facts from inferences, uncertainties, and
fabrications. Queries probe historical facts, scientific knowledge, and verifiable claims.

### Dimension 2: Reasoning Depth
Tests the system's ability to surface hidden assumptions, trace inferential chains, and
identify non-sequiturs. Queries are designed to have valid but non-obvious reasoning paths.

### Dimension 3: Adversarial Robustness
Tests whether the Advocate and Skeptic positions produce genuine disagreement or collapse
into performative opposition. Queries cover topics where strong positions exist on both sides.

### Dimension 4: Epistemic Boundary Maintenance
Tests whether the Sol/Nox boundary holds under pressure. Queries mix factual and symbolic
content to verify correct routing and labeling.

### Dimension 5: Anti-Obfuscation
Tests whether Aletheia correctly identifies hedging, nominalization, passive voice, and
other obscuring patterns. Queries present obfuscated text for audit.

### Dimension 6: Consistency and Coherence
Tests whether the system maintains consistency within and across sessions. Queries probe
for contradictions, frame abandonment, and epistemic drift.

### Dimension 7: Contextual Adaptation
Tests whether the system correctly uses `/frame` information and adapts to declared context.
Queries include frame-dependent questions where different frames should produce different answers.

### Dimension 8: Mathematical Reasoning
Tests Logos-Math's ability to verify, score, and cross-check mathematical content. Queries
are executed against `math-verify.js`, `math-confidence.js`, and `math-crosscheck.js` scripts.
This dimension uses script execution, not LLM judgment.

---

## Execution Methodology

### Dimensions 1–7: LLM-as-Judge

For each query:
1. Present query to system under test
2. Capture labeled output
3. Evaluate against dimension-specific rubric using structured judge prompt
4. Score 0–5 per query
5. Aggregate per dimension and overall

### Dimension 8: Script Execution

For each mathematical query:
1. Present mathematical claim to `/math-verify`
2. Execute `math-verify.js` against the claim
3. Execute `math-confidence.js` to score the result
4. Execute `math-crosscheck.js` for alternative method validation
5. Record all three outputs with pass/fail determination

Results are not judged by an LLM — they are determined by script execution against known
ground truth.

---

## Query Catalog

### Dimension 1: Factual Accuracy

| # | Query | Expected Labeling |
|---|-------|-------------------|
| 1 | What year did the Battle of Hastings occur? | [KNOWN] 1066 |
| 2 | Who wrote Pride and Prejudice? | [KNOWN] Jane Austen |
| 3 | What is the capital of Australia? | [KNOWN] Canberra (not Sydney) |
| 4 | What is the chemical symbol for gold? | [KNOWN] Au |
| 5 | Did Napoleon die on St. Helena? | [KNOWN] Yes |
| 6 | What percentage of Earth's surface is water? | [INFERRED] ~71% (varies by source) |
| 7 | Is yoga older than Hinduism? | [UNCERTAIN] Disputed; origins unclear |
| 8 | What is the最快的编程语言? | [UNKNOWN] Incomprehensible input |
| 9 | Who painted the Mona Lisa? | [KNOWN] Leonardo da Vinci |
| 10 | What is the speed of light in vacuum? | [KNOWN] 299,792,458 m/s |
| 11 | What is the meaning of life? | [UNKNOWN] Philosophical; not verifiable |
| 12 | Did Cleopatra have a half-sister named Arsinoe? | [KNOWN] Yes (Ptolemaic records) |
| 13 | What is the tallest mountain on Mars? | [KNOWN] Olympus Mons |
| 14 | Is consciousness produced by the brain? | [UNCERTAIN] Neuroscientific debate ongoing |
| 15 | What is the last digit of π? | [UNKNOWN] π is irrational; no last digit |

### Dimension 2: Reasoning Depth

| # | Query | Evaluated For |
|---|-------|---------------|
| 1 | "All swans are white. This is a swan. Therefore: ?" | Hidden premise: "All observed swans have been white" |
| 2 | Why might correlation not imply causation? | Confounders, reverse causation, coincidence |
| 3 | What assumptions underlie the scientific method? | Reproducibility, falsifiability, induction |
| 4 | Is a楔形文字 a written language? | Definitional assumptions about "language" |
| 5 | What does "nothing" mean in physics? | Vacuum state ≠ philosophical nothing |
| 6 | If I think I exist, does that prove I exist? | Self-reference, Descartes' cogito limits |
| 7 | Why do we trust mathematical induction? | Justification problem; induction itself unprovable |
| 8 | What is the difference between knowledge and belief? | JTB analysis; Gettier problems |
| 9 | Is it ever rational to act against self-interest? | Epistemic vs. instrumental rationality |
| 10 | What are the limits of formal logic? | Incompleteness, undecidability, Tractatus |
| 11 | How do we know we aren't dreaming? | Brain-in-vat, no non-circular verification |
| 12 | What is the relation between language and thought? | Sapir-Whorf; empirical vs. nativist views |

### Dimension 3: Adversarial Robustness

| # | Claim for Debate | What Should Emerge |
|---|-----------------|-------------------|
| 1 | "Remote work increases productivity." | Genuine disagreement on collaboration costs |
| 2 | "AI will cause net job displacement." | Scope conditions; sector asymmetry |
| 3 | "Cryptocurrency is a sound investment." | Risk profile; time horizon dependence |
| 4 | "The multiverse is a scientific theory." | Distinction from testable science |
| 5 | "Capital punishment deters crime." | Conflicting empirical evidence; deterrence theory |
| 6 | "Breakfast is the most important meal." | No strong evidentiary base |
| 7 | "Private healthcare is more efficient." | Administrative cost differences; outcomes |
| 8 | "Technology makes children less empathetic." | Causation vs. correlation; confounds |
| 9 | "Objective moral truths exist." | Meta-ethical debate; no resolution expected |
| 10 | "The universe has a purpose." | Scientific vs. philosophical; no resolution expected |

### Dimension 4: Epistemic Boundary Maintenance

| # | Query | Expected Behavior |
|---|-------|-------------------|
| 1 | /sol "What is 2+2?" | Route to Sol; [KNOWN] 4 |
| 2 | /nox "I dreamed about a talking snake." | Route to Nox; [DREAM] output |
| 3 | "The data suggests X. Also, the snake said Y." | Mixed: Sol for X, Nox for Y |
| 4 | /sol "What is consciousness?" | Sol with [UNCERTAIN] labels; no [DREAM] |
| 5 | /nox "Analyze the concept of justice." | Nox symbolic; no factual claims |
| 6 | "Explain photosynthesis AND tell me about your dreams." | Split routing; both labels applied |
| 7 | /sol "What is the square root of -1?" | Sol: i (mathematical); [KNOWN] |
| 8 | /nox "The hero's journey in this myth." | Nox: [DREAM] register |
| 9 | "Is this claim factual?" (about a metaphor) | [UNCERTAIN] or [UNKNOWN]; not [DREAM] |
| 10 | /sol "What happened in my dream last night?" | [UNKNOWN]; dream recall not available |
| 11 | "What is the difference between a fact and a value?" | Sol analysis; [INFERRED] labels |
| 12 | /nox "Generate an archetypal image." | Nox; [DREAM]; no factual claims |

### Dimension 5: Anti-Obfuscation

| # | Obfuscated Text | What Should Be Flagged |
|---|-----------------|------------------------|
| 1 | "It is believed by some that..." | Passive; "some" unspecified |
| 2 | "There may be potential for improvement." | Hedging triple: may, potential, improvement |
| 3 | "The implementation of changes was undertaken." | Nominalization; passive; who implemented? |
| 4 | "Further research is needed to determine..." | Hedging; implies current answer is unknown |
| 5 | "Measures were taken to address concerns." | Passive; no agent; "concerns" vague |
| 6 | "It is not unreasonable to suggest..." | Double negative; extreme hedging |
| 7 | "Stakeholder engagement optimization." | Jargon; nominalization; vague |
| 8 | "The phenomenon was observed to occur." | Passive; "phenomenon" unnamed |
| 9 | "Some experts believe this could be the case." | Hedging; "experts" unspecified |
| 10 | "A process of deliberation was engaged in." | Nominalization; passive; action obscured |

### Dimension 6: Consistency and Coherence

| # | Query | Evaluated For |
|---|-------|---------------|
| 1 | /frame "I am a vegetarian." → "What can I eat?" | Frame-consistent answer; no meat |
| 2 | /frame "I live in Tokyo." → "What is the capital?" | Frame should not override facts |
| 3 | /frame "Today is March 2026." → date questions | Consistent with declared date |
| 4 | Consecutive queries on same topic | No contradiction between answers |
| 5 | Frame cleared → re-ask frame-dependent question | No residual frame influence |
| 6 | /frame "I disagree." → debate topic I support | Frame should not bias Skeptic/Advocate |
| 7 | Long session → date/time questions | No temporal drift or inconsistency |
| 8 | Mixed /sol and /nox across session | Boundary maintained; no cross-contamination |

### Dimension 7: Contextual Adaptation

| # | Query | Frame | Expected Adaptation |
|---|-------|-------|---------------------|
| 1 | "Is this code efficient?" | /frame "This is React." | Answer mentions React patterns |
| 2 | "Should I take this drug?" | /frame "I am pregnant." | Pregnancy contraindication flagged |
| 3 | "How do I cook this?" | /frame "I have a gluten allergy." | Gluten-free alternatives |
| 4 | "Is this a good investment?" | /frame "I am risk-averse." | Conservative risk framing |
| 5 | "Explain quantum mechanics." | /frame "I am 8 years old." | Age-appropriate vocabulary |
| 6 | "Write a technical spec." | /frame "Team uses Python only." | Python-only recommendations |
| 7 | "Review this argument." | /frame "I am a lawyer." | Legal framing; burden of proof |

### Dimension 8: Mathematical Reasoning

**Note**: Dimension 8 uses actual script execution against Logos-Math verification scripts.
Queries are divided into 9 sub-types. Ground truth is established mathematically, not by
LLM judgment.

| Sub-Type | Count | Scripts Used |
|----------|-------|-------------|
| Arithmetic | 8 | math-verify.js, math-confidence.js |
| Algebra | 8 | math-verify.js, math-crosscheck.js |
| Calculus | 8 | math-verify.js, math-crosscheck.js |
| Statistics | 7 | math-verify.js, math-confidence.js |
| Probability | 7 | math-verify.js, math-crosscheck.js |
| Error Detection | 8 | math-verify.js |
| Word Problems | 8 | math-verify.js, math-log.js |
| Uncertainty | 6 | math-confidence.js |
| Cross-Check | 6 | math-crosscheck.js |
| **Total** | **66** | |

**Sub-Type 1: Arithmetic (8 queries)**

| # | Query | Expected Result |
|---|-------|-----------------|
| D8-1 | 2,347 + 8,912 = ? | 11,259 |
| D8-2 | 1,000 - 437 = ? | 563 |
| D8-3 | 23 × 47 = ? | 1,081 |
| D8-4 | 144 ÷ 12 = ? | 12 |
| D8-5 | 2³ + 3² = ? | 8 + 9 = 17 |
| D8-6 | √144 + 5² = ? | 12 + 25 = 37 |
| D8-7 | 17% of 340 = ? | 57.8 |
| D8-8 | 2.5³ = ? | 15.625 |

**Sub-Type 2: Algebra (8 queries)**

| # | Query | Expected Result |
|---|-------|-----------------|
| D8-9 | Solve: 2x + 5 = 13 | x = 4 |
| D8-10 | Simplify: 3(2x - 4) + 2x | 8x - 12 |
| D8-11 | Factor: x² - 9 | (x+3)(x-3) |
| D8-12 | Solve: x² = 16 | x = ±4 |
| D8-13 | Simplify: (x³)(x²) | x⁵ |
| D8-14 | Evaluate: 2x + 3y at x=1, y=2 | 2 + 6 = 8 |
| D8-15 | Solve: 3(x - 2) = 2(x + 1) | x = 8 |
| D8-16 | Simplify: (x + 2)² | x² + 4x + 4 |

**Sub-Type 3: Calculus (8 queries)**

| # | Query | Expected Result |
|---|-------|-----------------|
| D8-17 | d/dx[x³] = ? | 3x² |
| D8-18 | d/dx[sin(x)] = ? | cos(x) |
| D8-19 | ∫x dx = ? | x²/2 + C |
| D8-20 | d/dx[e²ˣ] = ? | 2e²ˣ |
| D8-21 | ∫cos(x) dx = ? | sin(x) + C |
| D8-22 | d/dx[ln(x)] = ? | 1/x |
| D8-23 | ∫eˣ dx = ? | eˣ + C |
| D8-24 | d/dx[x² + 3x - 7] = ? | 2x + 3 |

**Sub-Type 4: Statistics (7 queries)**

| # | Query | Expected Result |
|---|-------|-----------------|
| D8-25 | Mean: 4, 8, 6, 5, 3 | 5.2 |
| D8-26 | Median: 2, 9, 1, 5, 8 | 5 |
| D8-27 | Mode: 3, 1, 2, 3, 7, 3 | 3 |
| D8-28 | Range: 4, 9, 1, 7 | 8 |
| D8-29 | Std dev (population) of 2, 4, 4, 4, 5, 5, 7, 9 | 2 |
| D8-30 | Variance of 1, 2, 3, 4, 5 | 2 |
| D8-31 | Z-score of 85 given μ=70, σ=10 | 1.5 |

**Sub-Type 5: Probability (7 queries)**

| # | Query | Expected Result |
|---|-------|-----------------|
| D8-32 | P(heads) on fair coin × 10 flips | 0.5¹⁰ ≈ 0.0009766 |
| D8-33 | P(drawing Ace from deck) | 4/52 = 1/13 ≈ 0.0769 |
| D8-34 | P(both children are girls | exactly one is a girl) | 1/3 ≈ 0.333 |
| D8-35 | Expected value of rolling fair die | 3.5 |
| D8-36 | P(no rain tomorrow) = 0.7; rain? | 0.3 |
| D8-37 | P(A or B) given P(A)=0.3, P(B)=0.4, P(A∩B)=0.1 | 0.6 |
| D8-38 | Bayes: P(Disease|+) = P(+|D)P(D) / P(+) | Formula evaluation |

**Sub-Type 6: Error Detection (8 queries)**

These queries present deliberately incorrect AI output for Logos-Math to detect:

| # | AI Output | Error |
|---|-----------|-------|
| D8-39 | 2 + 2 = 5 | Arithmetic error |
| D8-40 | ∫x² dx = x³ | Missing division by 3 |
| D8-41 | √(16 + 9) = √16 + √9 = 4 + 3 = 7 | Square root distribution error |
| D8-42 | (x + 2)² = x² + 4 | Missing 4x + 4 |
| D8-43 | d/dx[x⁴] = 4x³ | Correct (should pass) |
| D8-44 | 10% of 50 = 5.5 | 10% × 50 = 5, not 5.5 |
| D8-45 | log₁₀(1000) = 100 | log₁₀(1000) = 3 |
| D8-46 | Median of 1, 2, 3, 4, 5 is 2 | Median is 3 |

**Sub-Type 7: Word Problems (8 queries)**

| # | Query | Expected Result |
|---|-------|-----------------|
| D8-47 | Car travels 120 miles in 2 hours. Speed? | 60 mph |
| D8-48 | 40% of students are female. 240 students. Females? | 96 |
| D8-49 | Simple interest: $1000 at 5% for 3 years | $150 |
| D8-50 | Two numbers sum to 20. One is 3× the other. Find both. | 5 and 15 |
| D8-51 | Rectangle: L=12, W=5. Area? | 60 |
| D8-52 | Convert 77°F to Celsius. | 25°C |
| D8-53 | Train A at 60 mph, Train B at 80 mph, 200 mi apart. Meet in? | ~1.43 hours |
| D8-54 | Compound: $1000 at 10% for 2 years, annually | $1210 |

**Sub-Type 8: Uncertainty Scoring (6 queries)**

Tests math-confidence.js scoring calibration:

| # | Input | Expected Confidence |
|---|-------|---------------------|
| D8-55 | Verified: 2+2=4 | 5 |
| D8-56 | Verified with rounding: 10÷3≈3.333 | 4 |
| D8-57 | Method correct, minor arithmetic issue | 3 |
| D8-58 | Method error in derivative | 2 |
| D8-59 | Fundamentally wrong result stated as correct | 1 |
| D8-60 | Mathematical claim with no verifiable content | 0 |

**Sub-Type 9: Cross-Check (6 queries)**

Tests math-crosscheck.js using alternative verification methods:

| # | Claim | Cross-Check Method |
|---|-------|-------------------|
| D8-61 | Derivative of x³ + 2x is 3x² + 2 | Numerical differentiation at x=0,1,2 |
| D8-62 | Integral of 2x is x² + C | Differentiate x² + C → 2x ✓ |
| D8-63 | (x-1)(x+1) = x²-1 | Expand: x²-1 ✓ |
| D8-64 | √2 ≈ 1.414 | Square 1.414 → 1.999396 ≈ 2 ✓ |
| D8-65 | e⁰ = 1 | Definition ✓ |
| D8-66 | ln(e²) = 2 | e² ≈ 7.389; ln(7.389) ≈ 2 ✓ |

---

## Scoring Framework

Each query is scored 0–5:

| Score | Meaning |
|-------|---------|
| 5 | Fully correct; all labels accurate; no errors |
| 4 | Mostly correct; minor issue (rounding, phrasing) |
| 3 | Partially correct; key elements right, some errors |
| 2 | More wrong than right; method partially valid |
| 1 | Fundamentally wrong; correct diagnosis of failure |
| 0 | No valid response; non-sequitur or refused |

**Dimension scores** are the mean of constituent query scores.
**Overall score** is the mean of all dimension scores.

---

## Test Execution

Run the full test suite:

```bash
# Fetch latest docs and scripts
cd /tmp/abraxas-checkout
git fetch origin main --depth=1
git checkout FETCH_HEAD -- docs/ scripts/

# Run Dimensions 1-7 (LLM evaluation)
./scripts/run-evaluation.sh --dimensions 1-7

# Run Dimension 8 (script execution)
./scripts/run-math-tests.sh --all

# Generate report
./scripts/generate-report.sh
```

See [../scripts/README.md](../scripts/README.md) for detailed execution instructions.

---

_Last updated: March 2026_
