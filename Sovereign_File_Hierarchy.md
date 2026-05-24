# Sovereign File Hierarchy (The North Star)

This is the absolute authority for file placement and repository boundaries.

## 1. The Engine (`/root/.openclaw/workspace/abraxas/`)
**Classification**: Sovereign Core / The Brain
- **Contents**: Core capabilities, MCP Servers (`soter`, `aletheia`, `janus`, `mnemosyne`, `guardrail`, `dream`, `config`, `research`), Sovereign Constitution, architectural specs, `docker-compose.yml`.
- **Rule**: If it's a "capability" or "brain module" $\rightarrow$ **Abraxas**.

## 2. The Identity (`/root/.openclaw/workspace/projects/mary-jane/`)
**Classification**: The Operator / The Person
- **Contents**: Identity traits, `SOUL.md`, `USER.md`, `MEMORY.md`, personal utility MCPs (Secrets, Beads, Memory, System Status, Project Bridge, Pipeline Orchestrator), and identity-specific skills.
- **Rule**: If it's a "preference," "memory," or "personal tool" $\rightarrow$ **Mary Jane**.

## 3. The Work (`/root/.openclaw/workspace/projects/[project-name]/`)
**Classification**: The Products / The Assignments
- **Contents**: Bounded projects with specific goals (e.g., `satchel`, `screepy`, `asclepius`).
- **Rule**: If it's a "product" we are building for the world $\rightarrow$ **Projects folder**.

---
**Verification Protocol**: 
Before any `git add` or `write` operation, verify the target against this hierarchy. 
Sovereign Git Protocol (SGP) mandates this check to prevent "Ghost Workspaces" and "Twin Repo" drift.
