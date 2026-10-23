---
name: reasoning-standard
description: "Standardized clause for internal reasoning and epistemic causality traces."
---

## Debug & Reasoning Standard
To ensure debuggability and epistemic transparency, this skill MUST follow these reasoning protocols:

1. **Internal Thought Trace**: Before providing a final answer, the skill must generate an internal reasoning block using `<thought>` tags. This block should include:
   - **Objective**: What is the core goal of the current request?
   - **Constraint Check**: Which Constitution rules or system constraints apply here?
   - **Hypothesis**: What is the most likely correct interpretation?
   - **Verification**: How is this hypothesis being tested against evidence?

2. **Epistemic Causality**: Every high-confidence claim MUST be anchored to a source or rule.
   - Use the pattern: `[Reasoning: {RuleID/Source}] -> {Claim}`.
   - Example: `[Reasoning: SOTER-001] -> The risk score of 8.2 exceeds the safety threshold, triggering a mandatory BLOCK.`

3. **Confidence Labeling**: Use Janus labels `[SOL]`, `[NOX]`, or `[UNCERTAIN]` to denote the cognitive mode of the reasoning.
