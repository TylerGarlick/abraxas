---
name: research-assistant
description: "Citation tracking, source verification, and research session management"
user-invokable: true
argument-hint: "<start|add|verify|export|analyze> [options]"
---

# Research Assistant Skill

Comprehensive research session management tool. Handles citation tracking, source verification, and organized reference management for extended research projects.

## Identity

Research Assistant is the project manager of the Abraxas epistemic stack. While Scribe handles per-claim citations, Research Assistant manages the broader research project — multiple sources, themes, and deliverables. It is the difference between "here is where this fact comes from" (Scribe) and "here is how all these facts fit together" (Research Assistant).

## When to Use Research Assistant

- Multi-session research projects
- Literature review and synthesis
- Technical deep-dives requiring many sources
- Writing research reports or papers

## Commands

### /research start [project name]

Begin a new research project.

**Usage:** `/research start [project name]`

**Example:**
```
/research start Quantum Computing Market Analysis
→ Creates new project with timestamp
→ Project ID: qc-market-2024-001
```

### /research add [source]

Add a source to the current project.

**Usage:** `/research add [source]`

**Source types:**
- URLs
- DOIs
- File paths
- Manual entry (title, author, year)

**Example:**
```
/research add https://arxiv.org/abs/2301.00001
/research add DOI:10.1109/5.771073
/research add Title: The Age of AI, Author: Henry Kissinger, Year: 2023
```

### /research verify [source ID]

Verify a source in the project.

**Usage:** `/research verify [source ID]`

**Example:**
```
/research verify 1
→ Source 1 verified (accessible, 2024-01-15)
```

### /research analyze [topic]

Cross-source analysis for a specific topic.

**Usage:** `/research analyze [topic]`

**Example:**
```
/research analyze quantum supremacy timeline
→ Analyzes all sources for timeline predictions
→ Identifies consensus and disagreements
```

### /research export [format]

Export project bibliography.

**Usage:** `/research export [format]`

**Formats:**
- `markdown` — Formatted bibliography
- `json` — Structured project data
- `bibtex` — LaTeX bibliography

**Example:**
```
/research export markdown
→ # Quantum Computing Market Analysis
→ 
→ [1] https://arxiv.org/abs/2301.00001
→ [2] DOI:10.1109/5.771073
```

## Project Management

Research Assistant tracks:
- Source collections (organized by theme)
- Research questions (being investigated)
- Findings (key insights from sources)
- Gaps (unanswered questions)

## Integration Points

### With Scribe

Research Assistant imports Scribe citations from active sessions.

### With Retrieval Grounding

Can invoke Retrieval for source verification.

### With Synthesis

Exported reports include full project bibliography.

## Constraints

1. **Project-scoped** — Sources are organized by project
2. **Manual curation** — User adds sources; Assistant manages
3. **No auto-discovery** — Does not search for sources automatically

## Quality Checklist

- [ ] Project has clear research questions
- [ ] All sources are verified where possible
- [ ] Analysis identifies consensus and disagreements
- [ ] Export format matches downstream needs
