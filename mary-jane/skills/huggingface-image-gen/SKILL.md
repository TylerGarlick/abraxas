---
name: Hugging Face Image Generation
slug: huggingface-image-gen
version: 3.0.0
description: General-purpose image generation using Hugging Face Pro with Fal-AI provider. Supports FLUX.1-dev, SDXL, and other models. Use for portraits, concepts, illustrations, and any visual projects.
---

## Overview

General-purpose image generation skill using Hugging Face Pro with Fal-AI provider. Supports multiple models for different use cases:

- **Portraits & People**: FLUX.1-dev (best quality, natural results)
- **Concept Art & Illustrations**: SDXL, Midjourney-style models
- **Fast Iteration**: CogView-4, Turbo models
- **Specialized Aesthetics**: Model-specific presets

The skill is prompt-agnostic—you control the output through your prompts. Use it for portraits, concept art, product visualization, illustrations, or any visual project.

## Requirements

- **Hugging Face Pro account** (required for Fal-AI provider access)
- **HF_TOKEN** environment variable set with your HF API token
- Python 3.8+
- `huggingface_hub` package (`pip install huggingface_hub`)

## Models

### Recommended by Use Case

| Use Case | Model | Notes |
|----------|-------|-------|
| Portraits, People | `black-forest-labs/FLUX.1-dev` | Best quality, natural skin tones, detailed |
| Concept Art | `stabilityai/stable-diffusion-3.5-large` | Great for environments, objects |
| Stylized/Illustration | `prompthero/openjourney-v4` | Midjourney-like aesthetic |
| Fast Iteration | `THUDM/CogView-4` | Quick generation for testing |
| Photorealistic | `FLUX.1-pro` | If available on your account |

### Model Presets

Add `--preset portrait|concept|illustration|photo` to auto-select optimal model and settings.

## Usage

### Basic Generation
```bash
python3 /home/ubuntu/.openclaw/workspace/skills/huggingface-image-gen/generate.py "A red-haired woman with sharp features, confident expression, digital art"
```

### With Model Preset
```bash
python3 generate.py "Confident portrait, bold pose" --preset portrait
python3 generate.py "Cyberpunk cityscape" --preset concept
python3 generate.py "Watercolor illustration" --preset illustration
```

### With Full Options
```bash
python3 generate.py "A cyberpunk cityscape at night" \
  --model black-forest-labs/FLUX.1-dev \
  --width 1024 --height 1024 \
  --output /path/to/output.png \
  --steps 50 \
  --guidance 7.5
```

### Batch Generation
```bash
python3 generate.py --batch prompts.txt --output-dir ./generated/
```

### With Custom Token
```bash
python3 generate.py "Portrait" --token hf_xxx
```

## API

### generate.py

```python
from generate import generate_image

await generate_image({
    "prompt": "Your description here",
    "model": "black-forest-labs/FLUX.1-dev",  # optional
    "provider": "fal-ai",  # optional
    "width": 1024,  # optional
    "height": 1024,  # optional
    "output": "/path/to/output.png"  # optional
})
```

## Rate Limits & Pricing

- **Fal-AI provider**: Pay-per-use (~$0.002-0.01 per image)
- Billed through your HF Pro account
- No monthly limits — pay only for what you generate

## Output

- **Format**: PNG (default), configurable to JPG
- **Location**: Specified path or `/tmp/generated-<timestamp>.png`
- **Metadata**: Prompt, model, and settings embedded in PNG EXIF
- **Return**: Absolute path to generated image (for scripting)

### Output Organization

Use `--project <name>` to auto-organize:
```
workspace/projects/<name>/images/generated-<timestamp>.png
```

For MJ Daily Portrait specifically:
```
workspace/projects/mary-jane/portraits/daily/<date>.png
```

## Dependencies

- Python 3.8+
- `huggingface_hub` package
- HF Pro account with Fal-AI provider enabled

## Notes

- **HF Pro Required**: Free API is deprecated; Pro + Fal-AI is current standard
- **Content Policy**: Fal-AI is more permissive than standard HF API, but still has limits
- **Prompt Engineering**: Quality depends heavily on prompt detail—be specific about lighting, pose, style, mood
- **Rate Limits**: Pay-per-use (~$0.002-0.01/image); no hard limits but monitor costs
- **Validation**: Use `--validate` to check image quality before saving (detects all-black, corrupted outputs)

### Prompt Tips

- **Specificity wins**: "confident pose, three-quarter view, soft studio lighting" > "portrait"
- **Style modifiers**: Add "digital art", "photorealistic", "oil painting", etc.
- **Negative prompts**: Use `--negative` to exclude unwanted elements
- **Iterate**: Generate multiple variants with `--count N`
