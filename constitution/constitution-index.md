# constitution-index.md
## Abraxas Constitution Index

This directory contains modular constitution fragments. Load the one that matches your needs.

---

## Individual System Fragments

| File | Systems | Commands | Description |
|:---|:---|:---|:---|
| `constitution-universal.md` | Universal Constraints + Labels | — | Base layer: 5 rules + label definitions |
| `constitution-honest.md` | Universal + Honest | 9 | Plain-language anti-hallucination |
| `constitution-janus.md` | Universal + Janus | 14 | Sol/Nox faces, Threshold, Qualia Bridge |
| `constitution-oneironautics.md` | Universal + Janus + Oneironautics | 35 | Dream reception, alchemical practice |
| `constitution-agon.md` | Universal + Agon | 8 | Structured adversarial reasoning |
| `constitution-aletheia.md` | Universal + Aletheia | 7 | Epistemic calibration, ground-truth tracking |
| `constitution-mnemosyne.md` | Universal + Mnemosyne | 7 | Cross-session memory |

---

## Combination Fragments

| File | Systems | Commands | Description |
|:---|:---|:---|:---|
| `constitution-core.md` | Universal + Honest + Janus + Oneironautics | 58 | Core four systems |
| `constitution-all.md` | All six systems | 80 | Complete constitution |

---

## Quick Reference

### Minimal Setup
- Just anti-hallucination: `constitution-honest.md`
- Just epistemic labeling: `constitution-janus.md`

### Full Epistemic Stack
- Honest + Janus: `constitution-honest.md` + `constitution-janus.md`
- Or use: `constitution-core.md`

### Full Abraxas
- All six systems: `constitution-all.md`

---

## Loading

Load as system prompt or first user message. The AI will initialize with the specified systems active.

---

## Updates

When skill files change, run the constitution-keeper agent to update all fragments:

```bash
# The agent will update:
# - constitution-all.md (full version)
# - constitution-universal.md (base layer)
# - Each system-specific fragment
# - Each combination fragment
```

---

## File Structure

```
constitution/
├── constitution-index.md          # This file
├── constitution-all.md            # Full (all 6 systems)
├── constitution-universal.md     # Base layer only
├── constitution-honest.md       # Honest
├── constitution-janus.md         # Janus
├── constitution-oneironautics.md # Oneironautics
├── constitution-agon.md           # Agon
├── constitution-aletheia.md      # Aletheia
├── constitution-mnemosyne.md     # Mnemosyne
├── constitution-core.md           # Honest + Janus + Oneironautics
└── constitution-honest-janus.md  # (reference to core subset)
```
