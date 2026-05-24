---
name: scribe
description: "Source-grounded citation management — tracks citations at creation time as a complement to Veritas"
user-invokable: true
argument-hint: "<track|verify|annotate|export> [options]"
---

# Scribe Skill

Source-grounded citation management tool. Creates and maintains citation trails for all referenced material during a session. Functions as the creation-time complement to Veritas (which tracks resolutions post-hoc).

## Identity

Scribe is the provenance layer of the Abraxas system. While Veritas tracks what was resolved after the fact, Scribe ensures citations exist at the moment of creation. It is the difference between "let me check if this is true" (Veritas) and "here is where this claim comes from" (Scribe).

## When to Use Scribe

- Research sessions requiring documented sources
- Technical writing with API/documentation references
- Analysis where claims must be traceable
- Any session where future verification will be needed

## Commands

### /scribe track [source]

Log a source citation for a claim or reference.

**Usage:** `/scribe track [source]`

**Source types:**
- URL (web pages, documentation)
- File path (local files)
- DOI (academic papers)
- Quote (book passages)

**Example:**
```
/scribe track https://docs.python.org/3/library/
/scribe track janus-system/SKILL.md
/scribe track DOI:10.1000/xyz123
```

### /scribe verify [source]

Verify a cited source exists and is accessible.

**Usage:** `/scribe verify [source]`

**Output:**
- Confirmation of source accessibility
- Last-modified date (if applicable)
- Any redirects or issues

**Example:**
```
/scribe verify https://example.com/api-docs
→ Source verified (200 OK, last modified: 2024-01-15)
```

### /scribe annotate [citation] [note]

Add metadata to an existing citation.

**Usage:** `/scribe annotate [citation] [note]`

**Example:**
```
/scribe annotate #1 Primary source for authentication flow
/scribe annotate #2 Check for version compatibility
```

### /scribe export

Export all citations from the session.

**Usage:** `/scribe export [format]`

**Formats:**
- `markdown` — Formatted bibliography
- `json` — Structured data
- `bibtex` — LaTeX bibliography

**Example:**
```
/scribe export markdown
→ # Session Citations
→ 
→ 1. [1] https://docs.python.org/3/library/
→ 2. [2] janus-system/SKILL.md
```

## Citation Numbering

Scribe uses incremental numbering (#1, #2, etc.) for easy reference in session work. These numbers persist within the session and can be referenced in annotations.

## Integration Points

### With Honest

Scribe citations can be used with Honest's `/check` and `/source` commands for verification.

### With Janus

Claims in Sol mode can be linked to Scribe citations for provenance.

### With Synthesis

Exported reports include Scribe citations in the bibliography section.

## Constraints

1. **Manual invocation** — Scribe does not auto-capture; user must explicitly track
2. **Session-scoped** — Citations do not persist across sessions (use Veritas for cross-session tracking)
3. **No verification of content** — Scribe verifies source existence, not accuracy

## Quality Checklist

- [ ] All substantive claims have citations
- [ ] Sources are verified where possible
- [ ] Annotations add useful context
- [ ] Export format matches downstream needs
