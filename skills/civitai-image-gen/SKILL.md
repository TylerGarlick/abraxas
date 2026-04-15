# Civitai Image Generation Skill

Generate images using Civitai's Generator API with support for LoRA models, custom checkpoints, and advanced parameters.

## Features

- **Civitai Generator API** - Access thousands of community models
- **LoRA Support** - Use specific model identifiers for consistent looks
- **Secrets Integration** - API key stored encrypted via secrets manager
- **Auto-save** - Images saved to `/root/.openclaw/workspace/projects/mary-jane/portraits/boudoir/`
- **Metadata Tracking** - Full generation params saved alongside images
- **Batch Processing** - Generate multiple images or process prompt files

## Setup

### Prerequisites

1. **Civitai API Key** - Get from [civitai.com/user/account](https://civitai.com/user/account)

2. **Add to Secrets Manager**:
   ```bash
   cd /root/.openclaw/workspace/skills/secrets-manager
   node scripts/secrets-manager.js add civitai-image-gen civitai_api_key "your-api-key-here" "Civitai image generation API access"
   ```

3. **Install Dependencies**:
   ```bash
   pip install cryptography requests
   ```

## Usage

### Basic Generation

```bash
cd /root/.openclaw/workspace/skills/civitai-image-gen
MJ_MASTER_KEY="your-master-key" python3 generate.py "your prompt here"
```

### With Presets

```bash
# Portrait (photorealistic)
MJ_MASTER_KEY="..." python3 generate.py "elegant portrait, soft lighting" --preset portrait

# Boudoir (intimate photography)
MJ_MASTER_KEY="..." python3 generate.py "sensual boudoir, bedroom setting" --preset boudoir

# Anime style
MJ_MASTER_KEY="..." python3 generate.py "anime girl, detailed eyes" --preset anime

# Concept art
MJ_MASTER_KEY="..." python3 generate.py "cyberpunk cityscape, neon lights" --preset concept
```

### With LoRA Models

```bash
# Single LoRA
MJ_MASTER_KEY="..." python3 generate.py "portrait, korean aesthetic" \
  --lora "urn:air:sd1:lora:civitai:8109@10107" \
  --lora-strength 0.8

# Multiple LoRAs
MJ_MASTER_KEY="..." python3 generate.py "detailed character portrait" \
  --lora "urn:air:sd1:lora:civitai:8109@10107" \
  --lora "urn:air:sd1:lora:civitai:162141@182559" \
  --lora-strength 0.8 \
  --lora-strength 0.6
```

### Advanced Options

```bash
MJ_MASTER_KEY="..." python3 generate.py "your prompt" \
  --preset portrait \
  --width 512 \
  --height 768 \
  --steps 35 \
  --cfg 7 \
  --scheduler EulerA \
  --seed 12345 \
  --clip-skip 2 \
  --count 4 \
  --output /custom/output/path
```

### Batch Generation

Create a file with prompts (one per line):

```bash
# prompts.txt
elegant portrait, soft studio lighting
confident business woman, professional headshot
artistic nude, tasteful shadows
```

Run batch:

```bash
MJ_MASTER_KEY="..." python3 generate.py --batch prompts.txt --preset portrait --output ./batch-output/
```

## Available Presets

| Preset | Model | Size | Steps | Description |
|--------|-------|------|-------|-------------|
| `portrait` | ChilloutMix (SD1.5) | 512x768 | 30 | Photorealistic portraits |
| `boudoir` | ChilloutMix (SD1.5) | 512x768 | 35 | Intimate photography |
| `anime` | AOM2H+BasilMix | 512x768 | 28 | Anime illustrations |
| `concept` | SDXL | 1024x1024 | 30 | Concept art, environments |
| `fast` | ChilloutMix | 512x512 | 20 | Quick testing |

## Built-in LoRA Models

```python
LORA_MODELS = {
    "ulzzang": "urn:air:sd1:lora:civitai:8109@10107",      # Korean doll aesthetic
    "pureeros": "urn:air:sd1:textualinversion:civitai:4514@5119",  # Pure Eros Face
    "charturner": "urn:air:sd1:lora:civitai:3036@9857",   # Character turnaround
    "detailer": "urn:air:sd1:lora:civitai:162141@182559", # Detail enhancement
}
```

## Testing

Run the test suite:

```bash
cd /root/.openclaw/workspace/skills/civitai-image-gen
MJ_MASTER_KEY="your-master-key" python3 test-civitai.py
```

Tests verify:
- Secret retrieval from encrypted store
- API connectivity
- LoRA integration
- Output directory setup

## Output

Images are saved to:
```
/root/.openclaw/workspace/projects/mary-jane/portraits/boudoir/civitai-YYYYMMDD-HHMMSS.png
```

Each image includes a `.meta.json` file with:
- Full prompt and negative prompt
- Model URN
- Generation parameters (steps, CFG, scheduler, seed)
- LoRA/network configurations
- Timestamp and job ID

## API Reference

### `generate_civitai_image()`

```python
generate_civitai_image(
    prompt: str,                    # Required: text description
    preset: str = None,             # Optional: preset name
    model: str = None,              # Optional: model URN override
    width: int = None,              # Optional: image width
    height: int = None,             # Optional: image height
    steps: int = None,              # Optional: generation steps
    cfg_scale: float = None,        # Optional: CFG scale
    negative_prompt: str = None,    # Optional: negative prompt
    lora_ids: list = None,          # Optional: LoRA URNs
    lora_strengths: list = None,    # Optional: LoRA strengths
    output_dir: str = None,         # Optional: output directory
    count: int = 1,                 # Optional: number of images
    scheduler: str = "EulerA",      # Optional: scheduler algorithm
    seed: int = -1,                 # Optional: random seed (-1 = random)
    clip_skip: int = 2,             # Optional: CLIP skip
    wait_for_completion: bool = True,  # Optional: wait for job
    timeout_seconds: int = 300      # Optional: job timeout
) -> list  # List of generated file paths
```

## Troubleshooting

### "Secret not found"
- Ensure you added the secret: `node scripts/secrets-manager.js add civitai-image-gen civitai_api_key "key" "reason"`
- Check MJ_MASTER_KEY is set correctly

### "Job timed out"
- Increase timeout: `--timeout 600`
- Reduce steps for faster generation
- Check Civitai API status

### "API error 401"
- API key may be invalid or expired
- Regenerate key at civitai.com/user/account
- Re-add to secrets manager

### Blank/black images
- Try different model or LoRA combination
- Adjust prompt (be more specific)
- Increase steps or CFG scale

## License

MIT License - See Civitai terms for model-specific licenses.
