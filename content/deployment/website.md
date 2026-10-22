---
# Documentation Site Overview

This page describes the static‑site structure that hosts the Abraxas documentation (generated with MkDocs or a similar tool). All markdown files live under `docs/` and are rendered by the site generator.

## Site layout

| Path | Purpose |
|------|---------|
| `index.html` | Single Page Application |


## Required assets

All brand assets belong under `assets/`:

```
index.html
```

> **How to generate SVGs**:
> 1. Open a vector editor (Figma, Illustrator, or Inkscape).
> 2. Use the colour variables `#D9A66B` (Sol) and `#2B3A67` (Nox) on a `#1a1a1a` canvas.
> 3. Export as **SVG** with the exact filenames listed above.

## Contributing

1. **Add or update assets** – place new SVGs (or other static files) under `website/assets/`.
2. **Edit markdown** – changes belong in the appropriate `*.md` file.
3. **Preview locally** – run the static‑site generator (MkDocs example):

---
