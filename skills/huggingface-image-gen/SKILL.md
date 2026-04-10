---
name: Hugging Face Image Generation
slug: huggingface-image-gen
version: 1.0.0
description: Generate images using Hugging Face's free Inference API with high-quality models like Stable Diffusion XL.
---

## Overview

This skill generates images from text prompts using Hugging Face's Inference API. Uses free, high-quality models with no API key required for basic usage (authenticated requests get higher rate limits).

## Models

**Default:** `stabilityai/stable-diffusion-xl-base-1.0`
- High quality, 1024x1024 native resolution
- Good for detailed prompts
- Free tier: ~100-200 requests/day

**Alternatives:**
- `runwayml/stable-diffusion-v1-5` — Faster, lower quality
- `stabilityai/stable-diffusion-2-1` — Good balance
- `prompthero/openjourney-v4` — Midjourney-style

## Usage

### Basic Generation
```bash
node /home/ubuntu/.openclaw/workspace/skills/huggingface-image-gen/generate.js "A red-haired woman with sharp features, confident expression, digital art"
```

### With Options
```bash
node generate.js "A cyberpunk cityscape at night" --model stabilityai/stable-diffusion-xl-base-1.0 --width 1024 --height 1024 --output /tmp/image.png
```

## API

### generate.js

```javascript
const { generateImage } = require('./generate.js');

await generateImage({
  prompt: "Your description here",
  model: "stabilityai/stable-diffusion-xl-base-1.0", // optional
  width: 1024,  // optional
  height: 1024, // optional
  output: "/path/to/output.png" // optional, defaults to /tmp/generated-<timestamp>.png
});
```

## Rate Limits

- **Anonymous:** ~100 requests/day
- **Authenticated (HF token):** ~1000 requests/day
- Add token to `.env` or pass as `HF_TOKEN` env var for higher limits

## Output

- PNG format
- Saved to specified path or `/tmp/generated-<timestamp>.png`
- Returns absolute path to generated image

## Dependencies

- Node.js 18+
- `node-fetch` (bundled)

No API key required for basic use, but recommended for production.
