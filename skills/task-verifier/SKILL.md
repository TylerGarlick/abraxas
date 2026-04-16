---
name: task-verifier
description: |
  Verifies that tasks are truly complete by checking that expected outputs were actually produced. Runs automatically after subagent completes, or on demand. Uses automatic verification where possible (file exists, content checks, command output) and flags for manual verification where not. Triggers: "verify task", "MJ verify", "is task done", "task complete", "check outputs", "verify done".
---

# SKILL.md — Task Verifier

## Purpose

Every task should produce something verifiable — a file, a code change, a report, a commit. The Task Verifier checks that what's expected was actually delivered, and flags for manual review when it can't verify automatically.

## Verification Modes

| Mode | When Used | What It Does |
|------|-----------|--------------|
| `auto` | Can check files/code | Runs checks, logs result |
| `manual` | User needs to review | Flags for T to approve |
| `hybrid` | Partial auto, partial manual | Auto-check what it can, escalate rest |

## Per-Factory Verification

### Research Factory
- Auto: `brief.md` exists and has content (>100 chars)
- Auto: headings present (Summary, Key Findings, Sources, Conclusions)
- Manual: quality of sources — flag if no URLs cited

### Writing Factory
- Auto: `output.md` exists and has content (>200 chars)
- Auto: correct file path specified in task
- Manual: tone, clarity — flag for T review

### Software Factory
- Auto: `src/` directory exists
- Auto: `README.md` exists
- Auto: `package.json` or equivalent exists (for Node projects)
- Auto: `src/` has actual code files (not just empty dirs)
- Manual: code quality, architecture decisions

### GitHub Factory
- Auto: `report.md` exists and has content
- Auto: commit count matches expected
- Manual: significance of activity — flag for T review

## Verification Script

```bash
cd /home/ubuntu/.openclaw/workspace/
node scripts/verify-task.js <taskId>
```

This runs the appropriate checks for the task type and outputs a report.

## Verification Schema

Each task can have a `verification` block:

```json
{
  "taskId": "abc123",
  "type": "software",
  "verification": {
    "mode": "auto",
    "checks": [
      { "name": "src_exists", "path": "src/", "check": "exists", "passed": true },
      { "name": "readme_exists", "path": "README.md", "check": "exists", "passed": true },
      { "name": "has_code", "path": "src/", "check": "has_files", "passed": true },
      { "name": "package_json", "path": "package.json", "check": "exists", "passed": false, "fail": true }
    ],
    "verifiedAt": "ISO-8601",
    "verifiedBy": "auto",
    "overall": "passed|failed|manual_review"
  }
}
```

## Verification Checklist by Factory

### Research
- [ ] `brief.md` created
- [ ] Brief has >100 chars
- [ ] Has required sections (Summary, Key Findings, Sources, Conclusions)
- [ ] Sources cited (at least 2 URLs)

### Writing
- [ ] `output.md` created
- [ ] Output has >200 chars
- [ ] Output matches requested format

### Software
- [ ] `src/` directory exists
- [ ] `README.md` exists
- [ ] README has setup instructions
- [ ] `src/` has code files (not empty)
- [ ] Dependencies declared (package.json, requirements.txt, etc.)
- [ ] Code compiles/runs without syntax errors (basic check)

### GitHub
- [ ] `report.md` created
- [ ] Report has >100 chars
- [ ] At least 3 repos mentioned
- [ ] Recent commits documented

## When to Flag for Manual

- Cannot programmatically verify quality (e.g., "is the writing good?")
- Task objective is subjective (e.g., "make it look nice")
- External state required (e.g., "did the deploy work?")
- User explicitly requested manual sign-off

## After Verification

1. If all auto-checks pass → mark task as `verified` in tasks.json
2. If any auto-check fails → mark task as `verification_failed`, report what failed
3. If manual required → mark as `manual_review`, notify T with "needs your review"
4. ALWAYS log to lessons-learned.json after verification
