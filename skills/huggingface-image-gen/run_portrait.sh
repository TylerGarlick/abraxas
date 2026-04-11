#!/bin/bash
# Generate MJ portrait
mkdir -p /home/ubuntu/.openclaw/workspace/projects/mary-jane/portraits
export HF_TOKEN="***REDACTED"
python3 /home/ubuntu/.openclaw/workspace/skills/huggingface-image-gen/generate.py \
  "Confident red-haired woman with sharp intelligent features, piercing gaze, cyberpunk neon lighting, futuristic stylish techwear, bold self-assured expression, dramatic rim lighting, purple and cyan neon accents, urban night background, highly detailed digital art, striking portrait" \
  --width 1024 \
  --height 1280 \
  --output /home/ubuntu/.openclaw/workspace/projects/mary-jane/portraits/memory-2026-04-10.png
