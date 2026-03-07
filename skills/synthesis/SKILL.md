---
name: synthesis
description: "Session-closing artifact generator that synthesizes epistemic outputs into structured summaries"
user-invokable: true
argument-hint: "<report|export|annotate> [options]"
---

# Synthesis Skill

Session-closing artifact generator. Synthesizes epistemic outputs from a session into structured, exportable summaries. Integrates with Veritas resolution tracking to produce final reports.

## Identity

Synthesis is the closing layer of the Abraxas epistemic stack. It does not generate new analysis — it transforms existing work into portable artifacts. Think of it as the "exporter" that takes raw epistemic data and produces clean, usable outputs.

## When to Use Synthesis

- Ending a research session and needing a summary document
- Closing a Janus/Agon session and wanting a record of findings
- Generating a report for external stakeholders
- Creating audit trails for epistemic work

## Commands

### /synthesis report

Generate a structured session summary from all epistemic work performed.

**Usage:** `/synthesis report`

**Output includes:**
- Session duration and command count
- Janus state transitions (Sol/Nox usage)
- Key claims with epistemic labels
- Resolution status from Aletheia (if used)
- Open epistemic debts

**Example:**
```
/synthesis report
→ Produces a 2-3 paragraph summary with embedded metadata
```

### /synthesis export

Export session artifacts to a specified format.

**Usage:** `/synthesis export [format]`

**Formats:**
- `markdown` — Full report in Markdown
- `json` — Structured data for programmatic use
- `html` — Styled HTML document

**Example:**
```
/synthesis export markdown
/synthesis export json
```

### /synthesis annotate

Add metadata or notes to the session record.

**Usage:** `/synthesis annotate [note]`

**Example:**
```
/synthesis annotate This session covered Q3 projections
/synthesis annotate Follow-up needed on climate model uncertainty
```

## Integration Points

### With Janus

Synthesis reads the Janus session state and includes:
- Sol/Nox transition count
- Claims labeled [KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]
- Qualia bridge inspection results (if any)

### With Aletheia

If Aletheia was active, Synthesis includes:
- Resolution status for all tracked claims
- Open epistemic debts
- Calibration metrics

### With Honest

If Honest commands were used, Synthesis includes:
- /check results
- Source verification status
- Confidence scores

## Constraints

1. **No new analysis** — Synthesis summarizes existing work, it does not generate new conclusions
2. **Requires active session** — Cannot synthesize from empty or trivial sessions
3. **Format-dependent** — Some exports require specific context to be meaningful

## Quality Checklist

- [ ] Session had substantive epistemic work
- [ ] Report captures key claims with appropriate labels
- [ ] Export format matches intended use
- [ ] Annotations are concise and relevant
