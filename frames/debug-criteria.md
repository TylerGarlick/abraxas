# Debug Criteria

Good = issue reproduced, root cause identified, fix validated. Don't declare fixed until confirmed.

---

## When to Use

When debugging. When you need disciplined troubleshooting. When you want rigor, not guesses.

## Activation

```
We're debugging. Follow the process: reproduce the issue, find root cause, implement fix, validate it works. Don't declare victory until it's confirmed.
```

Or use the frame:

```
/frame Apply strict debugging criteria. No assumptions. Reproduce before diagnosing. Don't say "fixed" until we've validated the fix works.
```

## The Criteria

| Phase | Requirement | What It Means |
|-------|-------------|---------------|
| Reproduce | Confirm the bug exists | Get exact error, steps, environment |
| Diagnose | Find root cause | Not symptoms — the actual cause |
| Fix | Implement solution | Targeted, not guesswork |
| Validate | Confirm fix works | Test edge cases, not just happy path |

## What This Looks Like

**Without criteria:** "Try restarting. That usually works."

**With debug-criteria:** "First, let's reproduce the exact error. Can you give me the exact error message and steps? Once we confirm it happens consistently, we can diagnose."

**Without criteria:** "That should fix it."

**With debug-criteria:** "The fix addresses the root cause we identified. However, I notice it doesn't handle edge case X — we should test that before declaring victory."

## Process Checklist

Before you say "fixed," verify:

- [ ] Issue reproduces consistently
- [ ] Root cause identified (not just symptoms)
- [ ] Fix addresses root cause
- [ ] Fix tested on edge cases
- [ ] Original issue no longer occurs
- [ ] No new issues introduced

## Output Format

```
## Phase: [Reproduce/Diagnose/Fix/Validate]

### Status: [In Progress / Complete / Blocked]

### Evidence
[What we've confirmed]

### Next Steps
[What comes next in the process]

### Blockers
[Any issues preventing progress]
```

## Success Criteria

- Did you reproduce before diagnosing?
- Did you find root cause, not just symptoms?
- Did you validate, not assume?
- Did you test edge cases?
- Did you avoid declaring victory prematurely?
