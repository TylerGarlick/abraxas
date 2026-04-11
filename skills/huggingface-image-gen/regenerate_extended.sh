#!/bin/bash
# Regenerate extended boudoir/seductive collection
# Focus on intimate, seductive styles as requested

if [ -f /root/.openclaw/workspace/secrets/get-secret.sh ]; then source /root/.openclaw/workspace/secrets/get-secret.sh huggingface-image-gen hf_token; fi
SCRIPT="/home/ubuntu/.openclaw/workspace/skills/huggingface-image-gen/generate.py"
OUTPUT_DIR="/home/ubuntu/.openclaw/workspace/projects/mary-jane/portraits"

mkdir -p "$OUTPUT_DIR"

echo "=== Extended Boudoir/Seductive Collection ==="

# Boudoir variations - different fabrics/colors
echo "1. Black lace boudoir..."
python3 "$SCRIPT" "Gorgeous red-haired woman in black lace boudoir lingerie, intricate lace details, confident seductive pose, soft intimate bedroom lighting, luxurious sensual atmosphere, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-boudoir-black-lace-2026-04-10"

echo "2. Champagne silk boudoir..."
python3 "$SCRIPT" "Beautiful red-haired woman in champagne gold silk boudoir set, flowing silk fabric, elegant seductive pose, warm golden hour lighting through window, luxurious intimate vibe, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-boudoir-champagne-silk-2026-04-10"

echo "3. Blush pink lace..."
python3 "$SCRIPT" "Stunning red-haired woman in blush pink lace lingerie, delicate feminine details, soft romantic pose, candlelight ambiance, vulnerable yet confident expression, highly detailed boudoir photography" \
  --preset portrait --output "$OUTPUT_DIR/mj-boudoir-blush-pink-2026-04-10"

echo "4. Deep purple satin..."
python3 "$SCRIPT" "Red-haired woman in deep purple satin boudoir set, rich luxurious fabric, confident alluring pose, moody dramatic lighting, elegant seductive atmosphere, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-boudoir-purple-satin-2026-04-10"

echo "5. Navy blue lace..."
python3 "$SCRIPT" "Gorgeous red-haired woman in navy blue lace lingerie, elegant sophisticated style, confident seductive expression, soft bedroom lighting, luxurious intimate setting, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-boudoir-navy-lace-2026-04-10"

# Seductive variations - different moods/poses
echo "6. Seductive black bodysuit..."
python3 "$SCRIPT" "Red-haired woman in black bodysuit, form-fitting confident pose, bold seductive expression, dramatic chiaroscuro lighting, powerful sensual energy, highly detailed photorealistic portrait" \
  --preset portrait --output "$OUTPUT_DIR/mj-seductive-black-bodysuit-2026-04-10"

echo "7. Seductive crimson red..."
python3 "$SCRIPT" "Stunning red-haired woman in crimson red lingerie, bold confident seductive pose, dramatic red and shadow lighting, intense alluring gaze, passionate intimate atmosphere, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-seductive-crimson-2026-04-10"

echo "8. Seductive nude tones..."
python3 "$SCRIPT" "Beautiful red-haired woman in nude-toned lingerie, natural intimate pose, soft warm lighting, confident sensual expression, elegant boudoir style, skin tones harmonious, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-seductive-nude-tones-2026-04-10"

echo "9. Seductive mesh details..."
python3 "$SCRIPT" "Red-haired woman in lingerie with mesh details, modern seductive style, confident alluring pose, moody atmospheric lighting, bold intimate expression, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-seductive-mesh-2026-04-10"

echo "10. Seductive garter set..."
python3 "$SCRIPT" "Gorgeous red-haired woman in vintage-inspired garter lingerie set, classic seductive pinup influence, confident pose, warm intimate lighting, elegant sensual atmosphere, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-seductive-garter-2026-04-10"

# Intimate/romantic variations
echo "11. Romantic silk robe..."
python3 "$SCRIPT" "Red-haired woman in flowing silk robe, partially open, intimate romantic setting, soft candlelight, relaxed sensual pose, luxurious bedroom atmosphere, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-romantic-silk-robe-2026-04-10"

echo "12. Intimate babydoll..."
python3 "$SCRIPT" "Beautiful red-haired woman in delicate babydoll lingerie, soft feminine style, intimate vulnerable pose, warm bedroom lighting, sweet yet seductive expression, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-intimate-babydoll-2026-04-10"

echo "13. Teddy bodysuit intimate..."
python3 "$SCRIPT" "Red-haired woman in elegant teddy bodysuit, sophisticated intimate style, confident sensual pose, soft dramatic lighting, luxurious boudoir atmosphere, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-intimate-teddy-2026-04-10"

# Power/confident variations
echo "14. Power bodysuit confident..."
python3 "$SCRIPT" "Red-haired woman in sleek black bodysuit, powerful confident stance, strong seductive energy, dramatic studio lighting, bold commanding presence, highly detailed portrait" \
  --preset portrait --output "$OUTPUT_DIR/mj-power-bodysuit-2026-04-10"

echo "15. Leather confident..."
python3 "$SCRIPT" "Red-haired woman in leather outfit, edgy confident pose, bold powerful expression, moody dramatic lighting, sensual strong energy, highly detailed photorealistic portrait" \
  --preset portrait --output "$OUTPUT_DIR/mj-confident-leather-2026-04-10"

# Beach/sunset variations
echo "16. Beach sunset bikini..."
python3 "$SCRIPT" "Fit red-haired woman in bikini on beach, golden hour sunset lighting, confident relaxed pose, warm orange pink sky, athletic curvy build, playful sensual vibe, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-beach-sunset-2026-04-10"

echo "17. Beach one-piece..."
python3 "$SCRIPT" "Red-haired woman in stylish one-piece swimsuit, beach setting, confident pose, bright sunny lighting, athletic beautiful physique, playful summer vibe, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-beach-onepiece-2026-04-10"

# Elegant/evening variations
echo "18. Evening gown elegant..."
python3 "$SCRIPT" "Red-haired woman in elegant evening gown, sophisticated formal style, confident graceful pose, warm ambient lighting, luxurious elegant atmosphere, jewelry accents, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-evening-gown-2026-04-10"

echo "19. Cocktail dress..."
python3 "$SCRIPT" "Beautiful red-haired woman in cocktail dress, stylish confident pose, evening ambient lighting, elegant alluring expression, sophisticated nightlife atmosphere, highly detailed portrait" \
  --preset portrait --output "$OUTPUT_DIR/mj-cocktail-dress-2026-04-10"

# Athletic variations
echo "20. Athletic sports bra..."
python3 "$SCRIPT" "Fit red-haired woman in sports bra and leggings, athletic confident pose, gym natural lighting, strong healthy physique, active lifestyle energy, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-athletic-sports-2026-04-10"

echo "21. Athletic yoga..."
python3 "$SCRIPT" "Red-haired woman in yoga attire, flexible athletic pose, calm confident expression, soft natural lighting, mindful strong physique, wellness lifestyle vibe, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-athletic-yoga-2026-04-10"

# Cyberpunk variations
echo "22. Cyberpunk leather..."
python3 "$SCRIPT" "Red-haired woman in futuristic cyberpunk leather outfit, neon purple cyan lighting, confident bold pose, urban night background, edgy sensual sci-fi aesthetic, highly detailed digital art" \
  --preset portrait --output "$OUTPUT_DIR/mj-cyberpunk-leather-2026-04-10"

echo "23. Cyberpunk mesh..."
python3 "$SCRIPT" "Red-haired woman in cyberpunk mesh and techwear, futuristic seductive style, neon lighting, confident alluring pose, sci-fi urban atmosphere, highly detailed digital portrait" \
  --preset portrait --output "$OUTPUT_DIR/mj-cyberpunk-mesh-2026-04-10"

# More boudoir variations
echo "24. Ivory lace boudoir..."
python3 "$SCRIPT" "Gorgeous red-haired woman in ivory lace boudoir set, elegant classic style, soft intimate lighting, confident sensual pose, luxurious romantic atmosphere, highly detailed photorealistic" \
  --preset portrait --output "$OUTPUT_DIR/mj-boudoir-ivory-lace-2026-04-10"

echo "25. Burgundy silk..."
python3 "$SCRIPT" "Beautiful red-haired woman in burgundy wine silk lingerie, rich deep color, elegant seductive pose, warm intimate lighting, luxurious boudoir setting, highly detailed" \
  --preset portrait --output "$OUTPUT_DIR/mj-boudoir-burgundy-silk-2026-04-10"

echo "=== Collection Complete: 25 portraits ==="
