#!/bin/bash
# Posterior collection - views from behind, cheeky shots
# Focused on T's favorite angle

export HF_TOKEN="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"
SCRIPT="/home/ubuntu/.openclaw/workspace/skills/huggingface-image-gen/generate.py"
OUTPUT_DIR="/home/ubuntu/.openclaw/workspace/projects/mary-jane/portraits"

mkdir -p "$OUTPUT_DIR"

echo "=== Posterior Collection - Cheeky Views from Behind ==="

# 1. Bikini back - enhanced cheeky
echo "1. Bikini back cheeky..."
python3 "$SCRIPT" "Fit red-haired woman in bikini, view from behind, confident pose, beach sunset lighting, athletic curvy build with pronounced full cheeks, golden hour warm tones, playful cheeky vibe, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-bikini-back-cheeky-2026-04-10"

# 2. Black lace boudoir from behind
echo "2. Black lace rear view..."
python3 "$SCRIPT" "Gorgeous red-haired woman in black lace lingerie, view from behind, kneeling on bed, soft intimate bedroom lighting, curvy athletic build with full cheeks, confident seductive pose, highly detailed boudoir photography" \
  --preset portrait --output "$OUTPUT_DIR/mj-black-lace-rear-2026-04-10"

# 3. White lace from behind
echo "3. White lace rear view..."
python3 "$SCRIPT" "Beautiful red-haired woman in white lace lingerie, rear view, standing confident pose, soft romantic lighting, pronounced curves, elegant boudoir style, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-white-lace-rear-2026-04-10"

# 4. Emerald silk rear view
echo "4. Emerald silk from behind..."
python3 "$SCRIPT" "Red-haired woman in emerald green silk lingerie, view from behind, silk fabric draping, confident pose, warm candlelight bedroom setting, athletic curvy build with full cheeks, intimate vulnerable angle, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-emerald-silk-rear-2026-04-10"

# 5. Nude tones from behind
echo "5. Nude tones rear view..."
python3 "$SCRIPT" "Red-haired woman in nude-toned lingerie, rear view, natural intimate pose, soft warm lighting, confident sensual expression, skin tones harmonious, pronounced curves, highly detailed boudoir" \
  --preset portrait --output "$OUTPUT_DIR/mj-nude-tones-rear-2026-04-10"

# 6. Black bodysuit rear view
echo "6. Black bodysuit from behind..."
python3 "$SCRIPT" "Red-haired woman in black bodysuit, view from behind, form-fitting confident pose, dramatic chiaroscuro lighting, powerful sensual energy, athletic build with pronounced cheeks, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-black-bodysuit-rear-2026-04-10"

# 7. Teddy bodysuit rear view
echo "7. Teddy rear view..."
python3 "$SCRIPT" "Red-haired woman in elegant teddy bodysuit, rear view, sophisticated intimate style, soft dramatic lighting, confident pose, luxurious boudoir atmosphere, curvy build, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-teddy-rear-2026-04-10"

# 8. Leather outfit from behind
echo "8. Leather rear view..."
python3 "$SCRIPT" "Red-haired woman in leather outfit, view from behind, edgy confident pose, moody dramatic lighting, sensual strong energy, pronounced curves, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-leather-rear-2026-04-10"

# 9. One-piece swimsuit beach rear
echo "9. One-piece beach rear view..."
python3 "$SCRIPT" "Red-haired woman in stylish one-piece swimsuit, beach setting, rear view, confident pose, bright sunny lighting, athletic beautiful physique with full cheeks, playful summer vibe, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-onepiece-beach-rear-2026-04-10"

# 10. Champagne silk from behind
echo "10. Champagne silk rear view..."
python3 "$SCRIPT" "Beautiful red-haired woman in champagne gold silk lingerie, view from behind, flowing silk fabric, elegant seductive pose, warm golden hour lighting, pronounced curvy build, luxurious intimate vibe, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-champagne-silk-rear-2026-04-10"

# 11. Blush pink lace rear
echo "11. Blush pink rear view..."
python3 "$SCRIPT" "Stunning red-haired woman in blush pink lace lingerie, rear view, delicate feminine details, soft romantic pose, candlelight ambiance, vulnerable yet confident, pronounced curves, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-blush-pink-rear-2026-04-10"

# 12. Crimson red rear view
echo "12. Crimson rear view..."
python3 "$SCRIPT" "Red-haired woman in crimson red lingerie, view from behind, bold confident seductive pose, dramatic red and shadow lighting, passionate intimate atmosphere, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-crimson-rear-2026-04-10"

# 13. Garter set from behind
echo "13. Garter set rear view..."
python3 "$SCRIPT" "Gorgeous red-haired woman in vintage-inspired garter lingerie set, rear view, classic seductive pinup influence, confident pose, warm intimate lighting, elegant sensual atmosphere, pronounced curves, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-garter-rear-2026-04-10"

# 14. Mesh details rear view
echo "14. Mesh rear view..."
python3 "$SCRIPT" "Red-haired woman in lingerie with mesh details, view from behind, modern seductive style, confident alluring pose, moody atmospheric lighting, bold intimate expression, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-mesh-rear-2026-04-10"

# 15. Babydoll rear view
echo "15. Babydoll rear view..."
python3 "$SCRIPT" "Beautiful red-haired woman in delicate babydoll lingerie, rear view, soft feminine style, intimate vulnerable pose, warm bedroom lighting, sweet yet seductive, pronounced curves, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-babydoll-rear-2026-04-10"

# 16. Over shoulder look
echo "16. Over shoulder cheeky..."
python3 "$SCRIPT" "Red-haired woman looking back over shoulder, view from behind, confident seductive expression, intimate bedroom lighting, curvy athletic build, playful knowing gaze, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-over-shoulder-cheeky-2026-04-10"

# 17. Bent over confident
echo "17. Bent over confident..."
python3 "$SCRIPT" "Red-haired woman bent over slightly, view from behind, confident pose, dramatic lighting, athletic curvy build with pronounced cheeks, bold seductive energy, highly detailed boudoir photography" \
  --preset portrait --output "$OUTPUT_DIR/mj-bent-over-confident-2026-04-10"

# 18. Yoga pose rear
echo "18. Yoga pose rear view..."
python3 "$SCRIPT" "Fit red-haired woman in yoga attire, rear view, flexible athletic pose, downward dog position, natural lighting, mindful strong physique with toned curves, wellness lifestyle vibe, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-yoga-rear-2026-04-10"

echo "=== Posterior Collection Complete: 18 cheeky shots ==="
