---
name: retrospectives
description: "The reflection and iterative improvement layer, managing project and session retrospectives."
---

# Retrospectives Skill

The Retrospectives skill provides a structured way to capture, organize, and act upon project and session reflections. It transforms raw feedback into actionable ledger tasks to drive iterative improvement.

## Core Capabilities

The system organizes retrospectives into a time-indexed hierarchy (Year $\rightarrow$ Month $\rightarrow$ Day) to ensure historical continuity and easy retrieval.

### Retrospective Capture
Supports three levels of reflection:
- **Task-based**: Post-mortems for specific high-impact tasks.
- **Daily**: Session-end reflections on daily progress.
- **Weekly**: Higher-level architectural and process reviews.

### The Reflection Schema
Every retrospective captures a structured state:
- **Well**: What went right? (Successes to replicate)
- **Not Well**: What failed? (Pain points to resolve)
- **Start**: New behaviors or tools to adopt.
- **Stop**: Counter-productive patterns to cease.
- **Continue**: Stable practices to maintain.
- **Improvements**: Direct actionable goals.

### Actionable Ledger
The skill integrates with the project ledger. When a retrospective identifies a critical failure or improvement, it can spawn a `ledgerTask`, linking the theoretical reflection to an actual work item.

## Commands

### `save_retro`
Persists a structured retrospective to the sovereign memory.
- **Arguments**: `date` (YYYY-MM-DD), `type` (task/day/week), `id`, `content` (RetroSchema).

### `get_retros_for_period`
Retrieves all retrospectives within a specific date window.
- **Arguments**: `start_date`, `end_date`.

### `create_ledger_task`
Transforms a retrospective finding into a formal ledger task.
- **Arguments**: `description`, `priority`, `source_retro_id`.

## Implementation Details

- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ RetrospectivesLogic).
- **Storage**: Filesystem-based hierarchy using JSON documents.
- **Organization**: Time-series layout for optimized retrieval and historical auditing.
