---
name: common-issues
description: >
  Troubleshooting guide for common issues encountered in Mary Jane workspace.
  Includes solutions for subagent timeouts, git secrets exposure, API failures,
  and other recurring problems.
  
  Triggers: When user describes issues like "subagent died", "timeout", 
  "token expired", "API failed", "git push rejected"
---

# Common Issues & Solutions

A living document of issues encountered and their solutions.

## 🔴 Subagent Timeout / Premature Death

**Symptoms:**
- Subagent dies after 7-8 minutes
- "Gateway restart" messages
- Incomplete results

**Root Causes:**
1. `llm.idleTimeoutSeconds` (default 60s) kills idle connections
2. `gateway.channelHealthCheckMinutes` restarts active subagents

**Solution:**
```bash
# In openclaw.json, set:
{
  "llm": {
    "idleTimeoutSeconds": 0
  },
  "gateway": {
    "channelHealthCheckMinutes": 0
  }
}
```

**Verification:** Run a long task (10+ min) and confirm completion.

---

## 🔴 Exposed Secrets in Git

**Symptoms:**
- "Token rejected" after routine push
- Git history shows API keys
- Security audit found exposed secrets

**Immediate Actions:**
1. **Rotate the exposed token** (this is mandatory)
2. Remove from git history:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch <file>' \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push:
   ```bash
   git push --force origin main
   ```

**Prevention:**
- Use secrets manager (MJ_MASTER_KEY)
- Run security audit daily
- Use pre-commit hooks

---

## 🔴 HuggingFace API 504 Timeouts

**Symptoms:**
- "Gateway Timeout" errors
- API requests fail intermittently
- FLUX models unavailable

**Solutions:**
1. **Retry with backoff** - Wait 30-60s and retry
2. **Use SDXL fallback** - Set `preset=concept` for sensitive content
3. **Simplify prompts** - Remove "professional photography", "dramatic lighting"

**Retry Logic:**
```python
for attempt in range(3):
    try:
        result = generate_image(prompt)
        break
    except TimeoutError:
        time.sleep(2 ** attempt)  # 2, 4, 8 seconds
        prompt = simplify_prompt(prompt)
```

---

## 🔴 Bead Already Exists / Duplicate

**Symptoms:**
- `bd create` fails with "already exists"
- Duplicate beads for same task

**Solution:**
```bash
# List existing beads
bd list --status open

# Use existing bead ID instead of creating new
bd show <existing-id>
```

---

## 🔴 Git Push Rejected (non-fast-forward)

**Symptoms:**
- `! [rejected] main -> main (non-fast-forward)`
- Remote has commits you don't have

**Solutions:**
1. **Rebase workflow** (preferred):
   ```bash
   git pull --rebase
   git push origin main
   ```

2. **Force with lease** (safer than --force):
   ```bash
   git fetch origin
   git push --force origin main
   ```

---

## 🟡 Cron Jobs Not Running

**Symptoms:**
- Expected task didn't run
- No output in log file

**Debug:**
```bash
# Check cron is running
ps aux | grep cron

# Check cron logs
grep CRON /var/log/syslog

# Test script manually
bash /path/to/script.sh

# Check cron permissions
crontab -l
```

---

## 🟡 Pre-commit Hook Not Working

**Symptoms:**
- Secrets pass through despite hook
- Hook doesn't run

**Debug:**
```bash
# Check hook exists and is executable
ls -la .git/hooks/pre-commit

# Test manually
.git/hooks/pre-commit

# Skip hook (emergency only)
git commit --no-verify -m "Emergency fix"
```

---

## Adding New Issues

When you encounter and solve a new issue:

1. Add entry to this skill with:
   - Symptom description
   - Root cause
   - Step-by-step solution
   - Prevention measures

2. Create a bead to track the issue for future reference

---

*This skill is auto-updated from retrospectives*
