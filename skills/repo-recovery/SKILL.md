---
name: repo-recovery
description: |
  Preserves valuable files from a repository before resetting it, clones the repo, saves files to workspace, resets the branch, and pushes. Use when T wants to "reset" or "clean" a repo but preserve valuable parts. Triggers: "reset repo", "save repo before reset", "repo-recovery", "preserve files before reset", "MJ reset".
---

# SKILL.md — Repo Recovery

## Purpose

When T wants to reset a GitHub repository:
1. Clone the repo to `/tmp/{repo-name}/`
2. Save any valuable files to workspace before resetting
3. Reset the repo to a clean state
4. Push the reset to GitHub
5. Create a task in Mission Control to restore the valuable parts later

## Saved Files Location

All preserved files go to:
`/home/ubuntu/.openclaw/workspace/{repo-name}.old/`

## Workflow

### Step 1: Clone and Assess
```bash
cd /tmp && git clone https://<token>@github.com/<owner>/<repo>.git
find /tmp/<repo> -type f | grep -v ".git"
```

### Step 2: Save Valuable Parts
```bash
cp -r /tmp/<repo>/src /home/ubuntu/.openclaw/workspace/<repo>.old/
cp /tmp/<repo>/SPEC.md /home/ubuntu/.openclaw/workspace/<repo>.old/
cp /tmp/<repo>/README.md /home/ubuntu/.openclaw/workspace/<repo>.old/
cp /tmp/<repo>/package.json /home/ubuntu/.openclaw/workspace/<repo>.old/
```

### Step 3: Reset Branch
```bash
cd /tmp/<repo>
git checkout --orphan clean_state
git commit -m "Reset: previous implementation saved to workspace"
git push origin clean_state:main --force
```

### Step 4: Verify
```bash
curl -s -H "Authorization: token <token>" \
  "https://api.github.com/repos/<owner>/<repo>/git/trees/main?recursive=1" \
  | python3 -c "import sys,json; [print(t['path']) for t in json.load(sys.stdin)['tree'][:10]]"
```

## GitHub Token

Stored in MEMORY.md: `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`

## Important Rules

1. **Always save valuable files FIRST** before resetting
2. **Don't delete the remote repo** — just reset the branch
3. **Verify push succeeded** before declaring done
4. **Log everything in memory** — what was saved, what was reset, why
5. **Create a Mission Control task** to track restoration if needed
