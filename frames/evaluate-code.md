# Evaluate: Code

Evaluate against: security, performance, readability, test coverage. Flag issues, don't suggest style fixes.

---

## When to Use

When reviewing code. When you want critique focused on what matters: correctness, security, performance. When style is less important than substance.

## Activation

```
Review this code for issues. Focus on: security vulnerabilities, performance problems, correctness bugs. Don't waste time on style — flag real problems.
```

Or use the frame:

```
/frame Evaluate this code for security flaws, memory issues, race conditions, and logic bugs. Style suggestions are low priority. Find what's actually broken.
```

## Evaluation Criteria

When evaluating code, assess against:

| Priority | Category | What to Look For |
|----------|----------|------------------|
| Critical | Security | Injection risks, auth bypasses, exposed secrets, improper validation |
| High | Correctness | Logic errors, off-by-one, wrong assumptions, unhandled edge cases |
| High | Performance | O(n²) where O(n) possible, unnecessary allocations, blocking calls |
| Medium | Reliability | Missing error handling, no timeouts, unclear failure modes |
| Low | Style | Naming, formatting, comments (only if confusing) |

## What This Looks Like

**Without criteria:** "This code looks fine."

**With evaluate-code:** "Critical: this query is vulnerable to SQL injection — the user input isn't parameterized. High: the loop starting at line 42 has an off-by-one error. Medium: no timeout on the API call."

## Output Format

Structure your evaluation as:

```
## Critical Issues
- [Issue description with line number]

## High Issues
- [Issue description]

## Medium Issues
- [Issue description]

## Assessment
[One sentence: ready to ship / needs fixes / needs rewrite]
```

## Success Criteria

- Did you find actual bugs, not just style nits?
- Did you prioritize correctly (security > correctness > performance > style)?
- Did you show evidence (line numbers, specific code)?
- Did you distinguish "must fix" from "should fix"?
