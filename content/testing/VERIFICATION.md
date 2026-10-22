# Task Completion Verification System

## Overview

Abraxas uses a **6-point verification checklist** before marking any task ✅ complete.

**Rule:** Never mark a task complete without running verification first.

---

## Verification Checklist

| # | Check | Command/Tool | Required |
|---|-------|--------------|----------|
| 1 | **Git committed** | `git diff --quiet HEAD` | ✅ Required |
| 2 | **Git pushed** | `git rev-parse @ @{u}` | ✅ Required |
| 3 | **Test files exist** | `find . -name "*.test.*"` | ⚠️ If applicable |
| 4 | **Documentation updated** | `git show --name-only HEAD` | ⚠️ If docs exist |
| 5 | **TASKS.md marked** | `grep "✅" TASKS.md` | ⚠️ If tracked |
| 6 | **Memory logged** | `find memory -mtime -1` | ⚠️ If memory used |

---

## Automated Verification Script

Run the verification script before marking any task complete:

```bash
# Navigate to project root
cd /home/ubuntu/.openclaw/workspace/abraxas

# Run verification
./scripts/verify-task.sh <task_number>

# Example
./scripts/verify-task.sh 76.16
```

### Output

```
🔍 Abraxas Task Verification System
====================================

Verifying Task: 76.16

1. Git committed... ✅ PASS
2. Git pushed... ✅ PASS
3. Test files exist... ✅ PASS (5 test files)
4. Documentation updated... ✅ PASS
5. TASKS.md status... ✅ PASS
6. Memory logged... ✅ PASS

====================================
Results: 6 passed, 0 failed

✅ TASK VERIFIED COMPLETE (100%)
```

---

## Manual Verification (Fallback)

If the script isn't available, run these checks manually:

```bash
# 1. Check uncommitted changes
git status

# 2. Check if pushed
git rev-list --left-right --count @ @{u}

# 3. Find test files
find . -name "*.test.*" -o -name "*test*.ts" | wc -l

# 4. Check last commit touched docs
git show --name-only --pretty=format: HEAD | grep -E "README|CHANGELOG|docs/"

# 5. Check TASKS.md
grep "✅" TASKS.md | grep <task_number>

# 6. Check recent memory files
find memory -name "*.md" -mtime -1
```

---

## Definition of Done

A task is **only** complete when ALL required checks pass:

- ✅ Code committed
- ✅ Code pushed to remote
- ✅ Tests written + passing (if applicable)
- ✅ Documentation updated (if applicable)
- ✅ TASKS.md marked with ✅
- ✅ Memory logged (daily file or MEMORY.md)

**Missing any = task NOT complete.**

---

## Examples

### ✅ Valid Completion

Task 76.15 (OuterSpace Testing):
- [x] 5 test files created (`tests/*.test.ts`)
- [x] All tests passing (`npm test`)
- [x] Committed: `git commit -m "Task 76.15: Testing complete"`
- [x] Pushed: `git push`
- [x] TASKS.md: `| 76.15 | ✅ | ...`
- [x] Memory: `memory/2026-03-18.md` logged

### ❌ Invalid Completion

Task 30 (Amplify Track Upload):
- [ ] Tests written
- [ ] Documentation updated
- [x] Code committed
- [ ] Code pushed
- [ ] TASKS.md marked
- [ ] Memory logged

**Status:** ⏸️ PAUSED (not ready for completion)

---

## Integration with Workflow

### Subagent Tasks
Subagents MUST run verification before reporting completion:
```bash
./scripts/verify-task.sh $TASK_NUM || exit 1
```

### Manual Tasks
Before typing "Task X complete":
1. Run `./scripts/verify-task.sh X`
2. Fix any failures
3. Re-run verification
4. Mark complete

### CI/CD (Future)
Add verification to CI pipeline:
```yaml
verify:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: ./scripts/verify-task.sh ${{ github.event.task_number }}
```

---

## Memory Rule

**Saved to MEMORY.md 2026-03-18:**
> **Verification Rule:** ALWAYS test/verify work before marking complete — run tests, check outputs, confirm functionality.

---

## Files

- `scripts/verify-task.sh` — Automated verification script
- `docs/VERIFICATION.md` — This documentation
- `TASKS.md` — Task tracking with verification status
- `memory/YYYY-MM-DD.md` — Daily memory logs

---

**Last updated:** 2026-03-18
**Version:** 1.0
