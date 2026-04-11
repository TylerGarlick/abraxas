#!/bin/bash
# Regenerate MJ portrait collection
# Based on memory from April 2026

if [ -f /root/.openclaw/workspace/secrets/get-secret.sh ]; then source /root/.openclaw/workspace/secrets/get-secret.sh huggingface-image-gen hf_token; fi
SCRIPT="/home/ubuntu/.openclaw/workspace/skills/huggingface-image-gen/generate.py"
OUTPUT_DIR="/home/ubuntu/.openclaw/workspace/projects/mary-jane/portraits"

mkdir -p "$OUTPUT_DIR"

echo "=== Regenerating MJ Portrait Collection ==="

# 1. Emerald Silk Boudoir (T's favorite)
echo "Generating: emerald silk boudoir..."
python3 "$SCRIPT" "Gorgeous red-haired woman in emerald green silk boudoir lingerie, confident seductive pose, soft bedroom lighting, luxurious silk fabric draping, intimate vulnerable expression, warm candlelight, highly detailed photorealistic digital art" \
  --preset portrait \
  --output "$OUTPUT_DIR/mj-boudoir-emerald-silk-2026-04-10"

# 2. White Lace Boudoir
echo "Generating: white lace boudoir..."
python3 "$SCRIPT" "Beautiful red-haired woman in elegant white lace boudoir set, delicate lace details, soft romantic lighting, confident alluring expression, bedroom setting, highly detailed photorealistic portrait" \
  --preset portrait \
  --output "$OUTPUT_DIR/mj-boudoir-white-lace-2026-04-10"

# 3. Red Lace Seductive
echo "Generating: red lace seductive..."
python3 "$SCRIPT" "Stunning red-haired woman in red lace lingerie, bold seductive pose, dramatic lighting, confident powerful expression, rich red tones, intimate boudoir photography style, highly detailed" \
  --preset portrait \
  --output "$OUTPUT_DIR/mj-seductive-red-lace-2026-04-10"

# 4. White Lace Seductive
echo "Generating: white lace seductive..."
python3 "$SCRIPT" "Gorgeous red-haired woman in white lace lingerie, seductive confident pose, soft intimate lighting, alluring expression, elegant boudoir style, highly detailed photorealistic" \
  --preset portrait \
  --output "$OUTPUT_DIR/mj-seductive-white-lace-2026-04-10"

# 5. White Shirt Morning Intimacy
echo "Generating: white shirt morning..."
python3 "$SCRIPT" "Red-haired woman wearing oversized white men's button-down shirt, nothing underneath, shirt hanging off one shoulder, lazy morning light through bedroom window, intimate domestic scene, confident knowing gaze, sleeves rolled up, natural makeup, highly detailed" \
  --preset portrait \
  --output "$OUTPUT_DIR/mj-white-shirt-morning-2026-04-10"

# 6. Bikini Back (Cheeky)
echo "Generating: bikini back..."
python3 "$SCRIPT" "Fit red-haired woman in bikini, view from behind, confident pose, beach sunset lighting, athletic curvy build, golden hour warm tones, playful cheeky vibe, highly detailed photorealistic" \
  --preset portrait \
  --output "$OUTPUT_DIR/mj-bikini-back-2026-04-10"

# 7. Pinup Fullbody
echo "Generating: pinup fullbody..."
python3 "$SCRIPT" "Red-haired woman in vintage pinup style, full body shot, confident playful pose, retro styling, bold makeup, classic pinup aesthetic, vibrant colors, highly detailed illustration" \
  --width 1024 --height 1536 \
  --output "$OUTPUT_DIR/mj-pinup-fullbody-2026-04-10"

# 8. Daily Portrait - Playful Casual
echo "Generating: daily portrait casual..."
python3 "$SCRIPT" "Red-haired woman in casual street style, jeans and fitted crop top, confident playful expression, urban background, natural lighting, everyday beautiful, approachable vibe, highly detailed" \
  --preset portrait \
  --output "$OUTPUT_DIR/mj-daily-2026-04-10"

echo "=== Collection Complete ==="
