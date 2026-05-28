---
name: Image Generation
slug: image-gen
version: 1.0.0
description: Generate images using HuggingFace with Fal-AI provider. Supports portraits, concept art, illustrations, and photorealistic images. Reads HF_TOKEN from secrets manager. Triggers: "generate image", "create image", "make a picture", "draw", "image gen".
---

## Overview

Image generation skill using HuggingFace Pro with Fal-AI provider. Automatically reads the HF token from the secrets manager.

## Models by Use Case

| Use Case | Model | Notes |
|----------|-------|-------|
| Portraits, People | `black-forest-labs/FLUX.1-dev` | Best quality, natural skin tones |
| Concept Art | `stabilityai/stable-diffusion-3.5-large` | Environments, objects, scenes |
| Stylized/Illustration | `prompthero/openjourney-v4` | Midjourney-like aesthetic |
| Photorealistic | `black-forest-labs/FLUX.1-pro` | If available on your account |
| Fast Iteration | `THUDM/CogView-4` | Quick generation for testing |

## Usage

### Generate Image
```bash
python3 /root/.openclaw/workspace/skills/image-gen/generate.py "Your prompt here" --preset portrait
```

### Presets
- `portrait` — Best for people/portraits (1024x1280)
- `concept` — Concept art & environments (1024x1024)
- `illustration` — Stylized illustrations (1024x1024)
- `photo` — Photorealistic (1024x1024)
- `fast` — Quick iteration (1024x1024)

### With Options
```bash
python3 /root/.openclaw/workspace/skills/image-gen/generate.py "A cyberpunk cityscape" \
  --preset concept \
  --output /path/to/output.png \
  --count 4
```

### Batch Generation
```bash
python3 /root/.openclaw/workspace/skills/image-gen/generate.py --batch prompts.txt --output-dir ./images/
```

## Secrets Integration

The skill automatically reads `HF_TOKEN` from the secrets manager:
- Secret key: `huggingface-image-gen:hf_token`
- Location: `/root/.openclaw/workspace/secrets/secrets-store.json`
- Decryption happens automatically via the wrapper script

## Output

- **Format**: PNG (default)
- **Location**: `/tmp/generated-<timestamp>.png` or specified path
- **Metadata**: Prompt, model, settings saved in `.meta.json`
- **Return**: Absolute path to generated image

## Dependencies

- Python 3.8+
- `huggingface_hub` package
- `Pillow` (PIL)
- HuggingFace Pro account with Fal-AI provider

## Cost

- Pay-per-use via Fal-AI: ~$0.002-0.01 per image
- Billed through your HuggingFace Pro account
