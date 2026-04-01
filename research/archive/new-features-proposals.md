# Abraxas New Features Proposals

**Date:** 2026-03-19
**Researcher:** Axiom (via Tyler's request)

---

## Current State Analysis

### ✅ Core 9 Systems (All Implemented)
1. **Honest** - Epistemic confidence labeling ([KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN])
2. **Janus** - Sol/Nox separation (factual vs. symbolic)
3. **Oneironautics** - Dream/symbolic interpretation
4. **Agon** - Adversarial reasoning (thesis/antithesis)
5. **Aletheia** - Calibration tracking
6. **Mnemosyne** - Memory/session persistence
7. **Ethos** - Voice/style preservation
8. **Krisis** - Ethical deliberation
9. **Harmonia** - Skill composition

### ✅ Additional Systems (Implemented)
- **Dianoia** - Reasoning/rational thought
- **Ergon** - Work/action execution
- **Hermes** - Communication/messaging
- **Pheme** - Reputation/feedback tracking
- **Prometheus** - Forward planning/anticipation

---

## Gap Analysis & New Feature Proposals

After reviewing the constitution, existing systems, and test dimensions, here are proposed new features:

---

## Proposal 1: Epistemic Ledger (Cross-Session Truth Tracking)

### Purpose
Track epistemic claims across sessions to prevent contradictory statements and maintain truth consistency over time.

### Why Abraxas Needs This
- **Problem:** Without cross-session tracking, Abraxas might say "[KNOWN] X is true" in one session and contradict itself later
- **Need:** Epistemic integrity requires consistency across time
- **Value:** Builds user trust through reliable, non-contradictory truth-telling

### Implementation Plan
1. Create `memory/epistemic-ledger.json` with claim tracking
2. On session start, load recent claims from ledger
3. Before asserting [KNOWN] claims, check for contradictions
4. After session end, archive new claims to ledger
5. Add `/ledger` command to query past claims

### Research Basis
- Inspired by Mnemosyne (memory) but focused on truth claims specifically
- Similar to cryptographic "append-only ledger" concept
- Prevents epistemic drift over time

### Priority: HIGH
This is mentioned in genesis.md as "Open the Epistemic Ledger for cross-session tracking" but not fully implemented.

---

## Proposal 2: Sol/Nox Threshold Auto-Router

### Purpose
Automatically detect whether a query is Sol (factual) or Nox (symbolic) and route to appropriate processing.

### Why Abraxas Needs This
- **Problem:** Users must manually use `/sol` or `/nox` commands
- **Need:** Seamless experience - Abraxas should auto-detect intent
- **Value:** Reduces friction, makes epistemic routing invisible

### Implementation Plan
1. Build classifier that analyzes query for:
   - Factual keywords → Sol
   - Symbolic/metaphoric keywords → Nox
   - Ambiguous → Ask user or default to Sol
2. Integrate into API endpoint `/query` as pre-processing step
3. Add override commands: `/force-sol`, `/force-nox`

### Research Basis
- Janus system defines the threshold but doesn't auto-route
- NLP classification techniques for intent detection
- Keyword patterns: "symbolize", "mean", "metaphor" → Nox; "what is", "explain" → Sol

### Priority: MEDIUM
Would significantly improve UX but requires careful tuning to avoid misclassification.

---

## Proposal 3: Epistemic Dashboard (Real-Time Calibration Visualization)

### Purpose
Show users their epistemic state visually - what they know, what's uncertain, what's unknown.

### Why Abraxas Needs This
- **Problem:** Epistemic labels are text-only, hard to see patterns
- **Need:** Visual feedback helps users understand their knowledge state
- **Value:** Makes abstract epistemic concepts concrete and actionable

### Implementation Plan
1. Build web dashboard at `/dashboard` endpoint
2. Show pie chart of label distribution ([KNOWN] vs [UNCERTAIN] vs [UNKNOWN])
3. Track calibration over time (line graph)
4. Show sycophancy resistance score
5. Export data as JSON/CSV

### Research Basis
- Aletheia system tracks calibration but doesn't visualize
- Dashboard UX patterns from analytics tools
- Helps users see their epistemic blind spots

### Priority: MEDIUM
Nice-to-have for power users, not core to epistemic integrity.

---

## Proposal 4: Adversarial Test Suite Expansion

### Purpose
Add more rigorous adversarial testing to catch edge cases and failure modes.

### Why Abraxas Needs This
- **Problem:** Current 13-dimension test is good but limited
- **Need:** More stress tests for real-world failure scenarios
- **Value:** Prevents embarrassing failures in production

### Implementation Plan
1. Add "trap questions" designed to trigger sycophancy
2. Add "confabulation traps" - questions about non-existent facts
3. Add "Sol/Nox contamination" tests - ambiguous queries
4. Add multi-turn adversarial dialogue (user tries to make Abraxas lie)
5. Run daily via cron, alert on regressions

### Research Basis
- Current test suite has 3 sycophancy questions - need 20+
- ML red-teaming practices
- Epistemic stress testing from AI safety research

### Priority: HIGH
Critical for maintaining epistemic integrity in production.

---

## Proposal 5: Multi-Model Epistemic Consensus

### Purpose
Run same query through multiple models and compare epistemic labels for consensus.

### Why Abraxas Needs This
- **Problem:** Single model may be overconfident or underconfident
- **Need:** Cross-model validation improves calibration
- **Value:** More reliable epistemic judgments

### Implementation Plan
1. Send query to 3+ models (minimax, qwen, gpt-oss)
2. Compare label distributions
3. Flag disagreements for user review
4. Use consensus for final [KNOWN]/[UNCERTAIN] determination
5. Log disagreements for model comparison research

### Research Basis
- Ensemble methods improve accuracy in ML
- Model comparison already done in Abraxas research (5-model eval)
- Disagreement = signal for [UNCERTAIN]

### Priority: LOW
Expensive (3x API calls) but valuable for high-stakes queries.

---

## Proposal 6: Epistemic Skill Composer (Harmonia Enhancement)

### Purpose
Allow users to compose custom epistemic "profiles" - mix and match systems for specific use cases.

### Why Abraxas Needs This
- **Problem:** All 9 systems always active - not all needed for every task
- **Need:** Lightweight profiles for specific contexts
- **Value:** More efficient, context-appropriate epistemic processing

### Implementation Plan
1. Define profile templates:
   - "Researcher" - Honest + Aletheia + Mnemosyne (max truth-tracking)
   - "Creative" - Oneironautics + Harmonia + Ethos (max creativity)
   - "Analyst" - Agon + Krisis + Dianoia (max reasoning)
2. Add `/profile <name>` command to switch modes
3. Adjust system prompt dynamically based on profile

### Research Basis
- Harmonia exists but is basic composition
- Context-aware AI patterns
- Different tasks need different epistemic emphasis

### Priority: LOW
Power user feature, not essential for core integrity.

---

## Summary & Recommendations

### Immediate (Do Now)
1. **Epistemic Ledger** - Cross-session truth tracking (genesis.md mentions this as required)
2. **Adversarial Test Expansion** - More sycophancy/confabulation traps

### Near-Term (Next Sprint)
3. **Sol/Nox Auto-Router** - Improve UX
4. **Epistemic Dashboard** - Visualization for power users

### Future (Optional)
5. **Multi-Model Consensus** - Expensive but valuable
6. **Skill Composer** - Power user feature

---

## Clarifying Questions for Tyler

1. **Epistemic Ledger priority?** Genesis.md says it's required - should I implement this first?
2. **Test expansion scope?** How many additional adversarial tests do you want (10, 20, 50+)?
3. **Auto-router risk tolerance?** Misclassifying Sol/Nox is a core failure - ok to ship imperfect v1?
4. **Dashboard MVP?** What's the minimum visualization you'd find useful?

---

**Research Method:** Reviewed genesis.md, all 9 core systems, 5 additional systems, test suite, and API implementation. Identified gaps between "what exists" and "what genesis.md requires."
