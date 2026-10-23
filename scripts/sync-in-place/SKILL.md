# Sync‑In‑Place Skill

**Purpose** – Performs an in‑place `git pull`/`commit`/`push` for a repository that already resides under the workspace folder.  It replaces the old temporary‑clone approach used by the earlier sync tool.

**Usage**
```bash
sync-in-place <repo-name>
```
Where `<repo-name>` is the name of the folder under `~/.openclaw/workspace` that points to the Git repo you want to sync.

**Example**
```bash
sync-in-place mary-jane
```

If any changes are detected the script stages them, commits with a timestamped message, and pushes to the default remote.  No changes → no commit.
