#!/bin/bash
# Generate artistic sunset cheek shot
if [ -f /root/.openclaw/workspace/secrets/get-secret.sh ]; then source /root/.openclaw/workspace/secrets/get-secret.sh huggingface-image-gen hf_token; fi
python3 /home/ubuntu/.openclaw/workspace/skills/huggingface-image-gen/generate.py \
  "Artistic rear view of fit red-haired woman on beach at sunset, golden hour lighting, confident pose, one cheek visible in detailed focus, warm orange pink sky, athletic curvy build, tasteful artistic photography, highly detailed" \
  --preset portrait \
  --output /home/ubuntu/.openclaw/workspace/projects/mary-jane/portraits/mj-sunset-cheek-artistic-2026-04-10
