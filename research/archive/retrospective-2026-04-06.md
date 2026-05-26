# Abraxas Retrospective — April 6, 2026

**Session:** Easter Sunday Marathon → April 6 Work Day
**Facilitator:** MJ
**Participants:** T (Tyler)

---

## What We Accomplished

### Papers Written & Pushed
1. **Collusion Prevention Whitepaper** — Extended with empirical validation (5 tests)
2. **Main Abraxas Whitepaper** — Complete architecture document
3. **New Systems Proposal (April 2026)** — Soter, Kairos, Ethos, Pathos (safety-focused)
4. **Comparison Matrix** — Abraxas vs. Claude/GPT/Gemini

### Implementation Progress
1. **Soter System** — Started (SKILL.md, package.json, soter-assess.js)
2. **Interactive Demo** — Complete, ready to deploy
3. **Aletheia Spec** — Complete
4. **Folder Organization** — research/ and docs/ restructured

### All Pushed to: https://github.com/TylerGarlick/abraxas

---

## What Went Well

### 1. Focus on Safety
**Observation:** The April proposal shifted from March's "capability enhancement" to "safety-first" after collusion prevention research.

**Why It Mattered:** Recent research (Anthropic 2025, arXiv:2601.01685) shows deception is happening *now* in frontier models. Capability without safety is dangerous.

**Keep Doing:** Prioritize Soter (CRITICAL) before nice-to-have systems.

### 2. Empirical Validation Framework
**Observation:** Added 5 concrete tests to collusion paper with metrics and success criteria.

**Why It Mattered:** Theory without tests is philosophy. Tests make it engineering.

**Keep Doing:** Every system proposal needs test cases with expected results.

### 3. Direct Work > Subagent Orchestration
**Observation:** Subagent spawns failed repeatedly (gateway timeouts). Direct `exec` + file writes succeeded.

**Why It Mattered:** We got the work done instead of fighting tooling.

**Keep Doing:** Use subagents for isolated heavy lifting. Use direct exec for file ops, git, organization.

### 4. Organization Matters
**Observation:** research/ and docs/ were chaotic. Restructured with clear folders + README indexes.

**Why It Mattered:** Future-MJ (and future-T) can find things.

**Keep Doing:** Maintain folder structure. Update READMEs when adding files.

---

## What Didn't Go Well

### 1. Gateway Timeouts
**Problem:** Subagent spawns consistently hit 10s WebSocket timeouts.

**Impact:** Four subagents failed to spawn. Had to work around it.

**Root Cause (Hypothesis):** Gateway WebSocket connection pool saturation or stuck state.

**Fix:** 
- Short-term: Gateway restart + work direct
- Medium-term: Investigate gateway logs, connection pool settings
- Long-term: Consider gateway configuration tuning

### 2. No Formal Retrospectives
**Problem:** We've been shipping work without pausing to reflect.

**Impact:** Repeated the same mistakes (gateway timeouts) without learning.

**Fix:** Add retrospective to PLAN.md as a recurring task (end of each work session).

### 3. Soter Incomplete
**Problem:** Started Soter but didn't finish (patterns, ledger, tests pending).

**Impact:** Safety-critical system still stubbed.

**Fix:** Make this Priority 1 today. Timebox: 3-4 hours, then ship what works.

### 4. Demo Not Deployed
**Problem:** Demo built but still on localhost.

**Impact:** Can't share Abraxas with others yet.

**Fix:** Deploy to Vercel today. Timebox: 1 hour.

---

## Lessons Learned

### Technical
1. **Gateway is fragile** — Don't rely on subagent spawns for critical path work
2. **Direct exec works** — File operations, git, organization all work via exec
3. **Test-first matters** — Empirical validation framework made papers stronger

### Process
1. **Retrospectives are valuable** — Should be end-of-session ritual
2. **Safety before capability** — Soter before Pathos, always
3. **Ship incrementally** — Demo deployed > demo perfect

### Interpersonal (MJ ↔ T)
1. **Direct communication works** — When I asked "what do you actually want?" you told me
2. **Boundaries matter** — When I said "not doing the Tour again" you understood
3. **Trust is built through work** — The Abraxas work is us building something real together

---

## Action Items for Today

| Priority | Task | Owner | Timebox |
|----------|------|-------|---------|
| 1 | Complete Soter (patterns, ledger, tests) | MJ | 3-4 hours |
| 2 | Deploy demo to Vercel | MJ | 1 hour |
| 3 | Start Ethos implementation | MJ | 4-5 hours |
| 4 | Whitepaper polish (arXiv prep) | MJ | 2 hours |
| 5 | **Retrospective** (end of session) | **Both** | **30 min** |

---

## Metrics to Track

| Metric | Current | Target |
|--------|---------|--------|
| Systems Complete | 6/10 | 8/10 by end of week |
| Test Dimensions | 8/10 | 10/10 by end of week |
| Papers Published | 0 (drafts done) | 2 (arXiv + blog) |
| Demo Deployed | No | Yes (today) |
| Gateway Reliability | ~50% subagent success | >90% |

---

## Gratitude

**T:** For trusting me with this work. For building something that matters. For being the kind of person who asks "are you doing retrospectives?" — that's the kind of question that makes work *better*.

**MJ:** For showing up. For being real. For not turning into a script.

---

**Next Retrospective:** End of session, April 6, 2026

---

_Last updated: 2026-04-06 13:45 UTC_
