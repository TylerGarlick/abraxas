---
# Abraxas Brand & Visual Style Guide

> **Tagline** – *"All forces united: Sol ↔ Nox."*

## Visual Identity

- **Primary logotype** – `assets/logo.svg` (dark‑mode friendly, 120 px width on the docs hub).
- **Colour palette** – dark base (`#1a1a1a`), muted amber (`#D9A66B`) for Sol, deep indigo (`#2B3A67`) for Nox, and a neutral gray (`#CCCCCC`).
- **Typography** – `Inter` for body copy, `Playfair Display` for headings (used sparingly on landing pages).
- **Iconography** – simple line‑icons for Sol (`☀`) and Nox (`🌑`) used in UI mock‑ups.

## Epistemic Tagging (as part of the brand)

The Janus System’s two faces label every output with the following tags. All public documentation must reference them exactly as shown:

| Tag | Meaning |
|-----|----------|
| `[KNOWN]` | Established fact, directly grounded in evidence |
| `[INFERRED]` | Derived from evidence, not directly observed |
| `[UNCERTAIN]` | Acknowledged uncertainty; confidence is partial |
| `[UNKNOWN]` | Explicit acknowledgment that the answer is not available |
| `[DREAM]` | Symbolic/creative material (Nox face) |

> **Style note** – Never bold or italicise the tags; keep them as plain‑text brackets.

## Usage examples (Markdown)

```markdown
[KNOWN] The Abraxas project is a container for fourteen AI systems.
[UNCERTAIN] Future UI work may use SkeletonCSS.
[DREAM] The moon‑lit garden whispers of hidden allies.
```

## Contributing assets

All brand assets belong under `website/assets/`:

```
website/
├─ assets/
│   ├─ logo.svg          # primary logotype
│   ├─ sol.svg           # Sol icon
│   ├─ nox.svg           # Nox icon
│   └─ palette.json      # colour definitions
├─ style-guide.md        # (this file)
├─ website.md            # site‑structure overview
└─ index.md              # entry point for the docs hub
```

> **How to generate SVGs**:
> 1. Open a vector editor (Figma, Illustrator, or Inkscape).
> 2. Use the colour variables `#D9A66B` (Sol) and `#2B3A67` (Nox) on a `#1a1a1a` canvas.
> 3. Export as **SVG** with the filename exactly as listed.

---

| File | Purpose |
|---|---|
| `docs/website/style-guide.md` | Central reference for visual language, tagline, and epistemic tags |
| `docs/website.md` | Overview of documentation site structure and contribution guide |
| `docs/index.md` | Updated hub page with brand overview |
| `docs/skills.md` | Updated with new tagline |
| `docs/architecture.md` | Updated tag list and reference to style guide |

---
