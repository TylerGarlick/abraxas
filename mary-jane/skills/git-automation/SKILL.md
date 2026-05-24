---
name: git-automation
description: >
  Automates git workflows to prevent push conflicts. Auto-pulls before push,
  handles divergent branches, and provides safe commit/push operations.
  Use when: "push", "git push", "commit and push", "sync changes".
triggers:
  - push
  - git push
  - commit and push
  - sync changes
---

# Git Automation Skill

Ensures safe git operations by auto-pulling before push to prevent conflicts.

## Safe Push Function

```python
import subprocess
import os

def safe_push(repo_path: str = None, message: str = None, add_all: bool = True):
    """
    Safely push to git with auto-pull to prevent divergent branch errors.
    
    Steps:
    1. git add -A (if add_all=True)
    2. git commit -m <message>
    3. git pull --rebase (prevents merge commits)
    4. git push
    
    Returns: (success: bool, output: str)
    """
    if repo_path:
        os.chdir(repo_path)
    
    def run(cmd, check=True):
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if check and result.returncode != 0:
            raise RuntimeError(f"Command failed: {cmd}\n{result.stderr}")
        return result
    
    try:
        # Stage
        if add_all:
            run("git add -A")
        
        # Commit if there are changes
        if message:
            result = run("git commit -m", check=False)
            if result.returncode != 0:
                if "nothing to commit" in result.stdout:
                    return True, "No changes to commit"
        
        # Auto-pull with rebase to prevent conflicts
        print("📥 Auto-pulling before push...")
        pull_result = run("git pull --rebase", check=False)
        if pull_result.returncode != 0:
            # Diverged - try to auto-resolve
            if "diverged" in pull_result.stderr:
                print("⚠️  Diverged branch detected. Attempting auto-stash...")
                run("git stash")
                run("git pull --rebase")
                run("git stash pop")
        
        # Push
        print("📤 Pushing to remote...")
        push_result = run("git push")
        
        return True, push_result.stdout or "Push successful"
        
    except Exception as e:
        return False, str(e)
```

## Usage

```python
# Simple push
safe_push(repo_path="/path/to/repo", message="Update files")

# Push specific files
safe_push(repo_path="/path/to/repo", message="Update docs", add_all=False)
subprocess.run("git add specific/file.txt", shell=True)
subprocess.run("git push", shell=True)

# Just pull and rebase (no commit)
def git_sync():
    subprocess.run("git pull --rebase", shell=True)
```

## CLI Commands

```bash
# Safe sync - add, commit, pull, push
./git-safe-sync.sh "Your commit message"

# Just pull-rebase
git pull --rebase

# Force push (DANGEROUS - use sparingly)
git push --force-with-lease
```

## Git Config Recommendations

Set these for safer defaults:

```bash
git config --global pull.rebase true
git config --global rebase.autostash true
git config --global push.default current
```

## Error Handling

| Error | Solution |
|-------|----------|
| "diverged" | Auto-stash, pull, pop, push |
| "nothing to commit" | Skip commit, just push |
| "rejected" | Pull-rebase, then push |
| "non-fast-forward" | Pull --rebase first |

## Tips

- Always pull before push in multi-agent environments
- Use `--force-with-lease` instead of `--force` (safer)
- Commit often to minimize divergence
- Set `pull.rebase = true` as default in global git config
