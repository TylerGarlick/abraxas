---
name: security-audit
description: Scan repos and code for accidentally committed secrets, API keys, tokens, and credentials. Use when T says "audit secrets", "check for leaked tokens", "scan repo for secrets", "security audit", "find exposed keys", "check .gitignore", "scan for GH tokens", or when given a repo path to validate. Triggers on any repo audit task. Scans: git history, remote URLs, .env files, credential stores, git-credentials, hardcoded secrets in code.
---

# Security Audit Skill

Audit a repository or directory for accidentally committed secrets.

## When This Skill Fires

- T asks to "audit", "scan", or "check" repos for secrets
- A new repo is being onboarded and needs validation
- After a repo bootstrap or reset, verify no secrets leaked
- When tokens are suspected to be exposed

## Workflow

### Step 1: Gather Targets

Build a list of repos/directories to scan:

```bash
# Known repos under workspace
find ~/.openclaw/workspace -name ".git" -type d 2>/dev/null | xargs -I{} dirname {}

# Known repos in /tmp
find /tmp -maxdepth 2 -name ".git" -type d 2>/dev/null | xargs -I{} dirname {}

# Known repos in home directory
find ~ -maxdepth 3 -name ".git" -type d 2>/dev/null | xargs -I{} dirname {} 2>/dev/null
```

### Step 2: Scan Each Repo

For each discovered repo, run the `audit_repo.sh` script (see scripts/):

```bash
bash ~/.openclaw/skills/security-audit/scripts/audit_repo.sh /path/to/repo
```

The script checks:
1. Git remote URL for exposed tokens (`ghp_`, `github_pat_`)
2. `.env` and `.env.*` files not in .gitignore
3. Credential files (`~/.git-credentials`, `~/.gitpass`, `~/.netrc`)
4. Hardcoded secrets via grep patterns
5. .gitignore presence and quality

### Step 3: Audit Git Credential Stores

```bash
# Check for plaintext credential files
cat ~/.git-credentials 2>/dev/null
cat ~/.gitpass 2>/dev/null
cat ~/.netrc 2>/dev/null

# Check git config for embedded tokens
git config --global --list 2>/dev/null | grep -i 'token\|key\|secret'
```

### Step 4: Report Findings

For each finding, classify severity:

| Severity | Description |
|----------|-------------|
| CRITICAL | Active GH tokens (`ghp_`), OpenAI keys (`sk-`), AWS keys (`AKIA`) — exposed and exploitable |
| HIGH | Passwords, legacy tokens, credentials in git history |
| MEDIUM | Missing .gitignore, .env files not ignored, weak .gitignore |
| LOW | Token in remote URL (no push), config warnings |

**Format output as a table:**

| Repo | Issue | Severity | Remediation |
|------|-------|----------|-------------|
| /path/to/repo | `ghp_xxx` in remote URL | CRITICAL | Strip remote, rotate token |

### Step 5: Remediation

For CRITICAL/HIGH findings:

1. **Strip token from git remote** (replace with clean HTTPS):
   ```bash
   git remote set-url origin https://github.com/OWNER/REPO.git
   ```

2. **Rotate the exposed token** via GH API or GH settings UI

3. **Store new token in secrets manager**:
   ```bash
   cd ~/.openclaw/workspace/skills/secrets-manager
   node scripts/secrets-manager.js add <name> <token>
   ```

4. **Push clean state** if token was rotated

5. **Update git remote** with new token only when needed for push, then strip again

## Scripts

- `scripts/audit_repo.sh` — Core audit logic for a single repo
- `scripts/scan_patterns.sh` — Grep patterns for common secret types

See those files for implementation details. Execute scripts directly; do not read into context unless patching.
