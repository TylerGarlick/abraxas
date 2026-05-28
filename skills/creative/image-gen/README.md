# Image Generation Skill

## Quick Start

```bash
# Generate an image (automatically reads token from secrets)
MJ_MASTER_KEY="0FtgOuPNJTpXMaKseQqUwbInx9RQ402yGqIEsIdJbKs=" \
  python3 /root/.openclaw/workspace/skills/image-gen/generate.py "Your prompt" --preset portrait
```

## Presets

| Preset | Model | Size | Best For |
|--------|-------|------|----------|
| `portrait` | FLUX.1-dev | 1024x1280 | People, portraits |
| `concept` | SDXL 3.5 Large | 1024x1024 | Concept art, environments |
| `illustration` | OpenJourney v4 | 1024x1024 | Stylized art |
| `photo` | FLUX.1-pro | 1024x1024 | Photorealistic |
| `fast` | CogView-4 | 1024x1024 | Quick iteration |

## Examples

```bash
# Portrait
MJ_MASTER_KEY="..." python3 generate.py "Confident portrait, professional lighting" --preset portrait

# Concept art
MJ_MASTER_KEY="..." python3 generate.py "Cyberpunk cityscape at night, neon lights" --preset concept

# Multiple images
MJ_MASTER_KEY="..." python3 generate.py "Fantasy landscape" --preset illustration --count 4

# Save to project folder
MJ_MASTER_KEY="..." python3 generate.py "Character design" --preset portrait --project mygame
```

## Output

- Images saved to: `/tmp/generated-<timestamp>.png`
- Metadata saved to: `/tmp/generated-<timestamp>.meta.json`
- With `--project <name>`: `~/workspace/projects/<name>/images/`

## Cost

~$0.002-0.01 per image via HuggingFace Pro + Fal-AI
