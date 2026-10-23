---
name: docs-maintenance
description: Use when cleaning, verifying, or synchronizing project documentation. Keeps READMEs and docs aligned with code.
category: maintenance
---

# Documentation Maintenance Skill

This skill ensures that the Abraxas project's knowledge base—comprising `README.md`, `/docs`, `/skills`, and `/research`—remains organized, high-signal, and technically accurate.

## 🎯 Objectives
- **Zero Link Rot**: All relative links must be verified and functional.
- **Epistemic Purity**: Remove all banned terms (ArangoDB, python, beads) and personal identifying information.
- **Code-Doc Sync**: Automatically identify new logic in `/mcp`, `/skills`, or `/core` and trigger documentation updates.
- **Structural Integrity**: Maintain a consistent directory hierarchy and ensure every major folder has a descriptive `README.md`.

## 🛠️ Workflow

### Phase 1: The Clean Sweep (Verification)
Run these checks whenever documentation is modified or a new release is planned:
1. **Banned Term Audit**: 
   - Scan for `ArangoDB`, `python`, `beads`, and `TylerGarlick` (case-insensitive).
   - Replace with approved terminology: "the graph database", "the system language", "the issue tracker", and "[USER]".
2. **Link Validation**:
   - Traverse all `.md` files in `/docs` and `/research`.
   - Verify all `[text](path)` relative links exist on disk.
   - Fix broken paths (especially those crossing from `/research` to `/docs`).

### Phase 2: The Synchronization (Update)
Run this after every significant code change:
1. **Feature Detection**: 
   - Scan `/mcp/src/tools`, `/skills`, and `/core` for new files or exported functions.
   - Compare detected features against `docs/systems/skills.md` and `README.md`.
2. **Doc Gap Analysis**:
   - Identify features that exist in code but are missing from documentation.
   - Propose updates to the `README.md` "Core Documentation" section or the `Sovereign Brain Manual`.

### Phase 3: Value Enhancement
- **Example Generation**: Ensure every new skill has at least 3 practical examples in `docs/manual/ABRAXAS_EXAMPLES.md`.
- **Index Refresh**: Update `docs/README.md` and `research/INDEX.md` to include new high-value documents.

## 📝 Implementation Details
The skill uses the `maintain_docs.py` utility for automated scanning.

### Maintenance Commands
- `python skills/docs-maintenance/maintain_docs.py --verify`: Runs the full audit.
- `python skills/docs-maintenance/maintain_docs.py --sync`: Detects code-doc gaps.
- `python skills/docs-maintenance/maintain_docs.py --clean`: Performs the banned term sweep.

## ⚠️ Pitfalls
- **Link-Crossing**: Links from `/research` to `/docs` often break during reorganization. Always use `os.path.normpath` for verification.
- **Over-Cleaning**: Ensure that technical references to `python` are only removed from *user-facing* docs, not from actual code comments or build scripts.
