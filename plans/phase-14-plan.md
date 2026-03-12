# Phase 14 — Error Recovery

**Status:** [PENDING]

Error recovery, diagnostic reasoning, and meta-cognitive fallback skill (Hephaestus).

---

## Overview

**Hephaestus** — Error recovery, diagnostic reasoning, meta-cognitive fallback

Greek *Hephaistos* (Ἥφαιστος) — god of the forge, the mender of broken things, the only Olympian with a physical disability who became the greatest craftsman. A skill for graceful failure — diagnosing what went wrong, recovering to known-good states, recording lessons learned, preventing recurrence.

**Problem:** The Abraxas stack has Soter for orchestration and checkpointing, but no dedicated skill for post-hoc error diagnosis and recovery. Hephaestus becomes the "repair layer" — invoked when things break, not prevented from breaking. Complements Soter's prevention with recovery.

---

## Prerequisites

- [x] Soter complete (Phase 12) — checkpoint/rollback foundation
- [x] Mnemosyne complete — session state management
- [x] Aletheia complete — claim verification patterns

---

## Skills to Deliver

### Hephaestus — Error recovery, diagnostic reasoning

| Task | Status | Agent |
|------|--------|-------|
| Specification document — diagnostic heuristics, recovery protocols, lesson extraction | [ ] Pending | ai-rd-visionary |
| Brand naming and aesthetic fit | [ ] Pending | brand-ux-architect |
| SKILL.md authoring: /hephaestus diagnose, recover, learn, bounds, checkpoint, rollback | [ ] Pending | skill-author |
| Skill packaging and testing | [ ] Pending | skill-author |
| docs/skills.md updated | [ ] Pending | docs-architect |
| CONSTITUTION.md extended; constitution-keeper review | [ ] Pending | constitution-keeper |

---

## Commands to Deliver

| Command | Purpose |
|---------|---------|
| `/hephaestus diagnose {failure}` | Analyze what went wrong; trace error to root cause |
| `/hephaestus recover {context}` | Attempt recovery to known-good state |
| `/hephaestus learn {error}` | Extract and record lessons from failure |
| `/hephaestus bounds {operation}` | Define safe recovery parameters |
| `/hephaestus checkpoint` | Save current state as recovery point |
| `/hephaestus rollback` | Revert to last checkpoint |

---

## Anti-Scheming Design

| Constraint | Rationale |
|------------|-----------|
| Cannot suppress diagnostic findings | Error diagnosis must be honest |
| Cannot modify learned lessons | Lesson log is append-only |
| Recovery must preserve audit trail | All recovery actions traceable |
| Human approval for state override | Cannot auto-recover from critical errors |

---

## Integration Points

- **Soter** — Hephaestus extends Soter's checkpoint/rollback with diagnostic layer
- **Mnemosyne** — Uses session persistence for recovery state
- **Aletheia** — Lessons inform future calibration
- **Krisis** — Ethical failures route through Krisis before Hephaestus

---

## Design Considerations

| Consideration | Approach |
|---------------|----------|
| Distinction from Soter | Soter prevents errors through orchestration; Hephaestus repairs after errors — complementary |
| Lesson storage | Separate from epistemic ledger; meta-cognitive learning |
| Recovery scope | Can recover from skill failures, not system-level crashes |
| Diagnostic depth | Root cause analysis, not surface symptom treatment |