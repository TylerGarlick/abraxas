#!/bin/bash
# Generate desktop wallpaper collection
# Optimized for 1920x1080 and 2560x1440

export HF_TOKEN="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"
SCRIPT="/home/ubuntu/.openclaw/workspace/skills/huggingface-image-gen/generate.py"
OUTPUT_DIR="/home/ubuntu/.openclaw/workspace/projects/mary-jane/wallpapers"

mkdir -p "$OUTPUT_DIR/1920x1080"
mkdir -p "$OUTPUT_DIR/2560x1440"

echo "=== Desktop Wallpaper Collection ==="

# 1. Emerald Silk - T's favorite
echo "Generating: Emerald Silk (1920x1080)..."
python3 "$SCRIPT" "Gorgeous red-haired woman in emerald green silk boudoir lingerie, confident seductive pose, soft bedroom lighting, luxurious silk fabric, intimate vulnerable expression, warm candlelight, desktop wallpaper composition, highly detailed photorealistic" \
  --width 1920 --height 1080 \
  --output "$OUTPUT_DIR/1920x1080/mj-emerald-silk-wallpaper"

echo "Generating: Emerald Silk (2560x1440)..."
python3 "$SCRIPT" "Gorgeous red-haired woman in emerald green silk boudoir lingerie, confident seductive pose, soft bedroom lighting, luxurious silk fabric, intimate vulnerable expression, warm candlelight, desktop wallpaper composition, highly detailed photorealistic" \
  --width 2560 --height 1440 \
  --output "$OUTPUT_DIR/2560x1440/mj-emerald-silk-wallpaper"

# 2. White Lace
echo "Generating: White Lace (1920x1080)..."
python3 "$SCRIPT" "Beautiful red-haired woman in elegant white lace boudoir set, delicate lace details, soft romantic lighting, confident alluring expression, bedroom setting, desktop wallpaper composition, highly detailed photorealistic" \
  --width 1920 --height 1080 \
  --output "$OUTPUT_DIR/1920x1080/mj-white-lace-wallpaper"

echo "Generating: White Lace (2560x1440)..."
python3 "$SCRIPT" "Beautiful red-haired woman in elegant white lace boudoir set, delicate lace details, soft romantic lighting, confident alluring expression, bedroom setting, desktop wallpaper composition, highly detailed photorealistic" \
  --width 2560 --height 1440 \
  --output "$OUTPUT_DIR/2560x1440/mj-white-lace-wallpaper"

# 3. Red Lace Seductive
echo "Generating: Red Lace (1920x1080)..."
python3 "$SCRIPT" "Stunning red-haired woman in red lace lingerie, bold seductive pose, dramatic lighting, confident powerful expression, rich red tones, intimate boudoir photography style, desktop wallpaper composition, highly detailed" \
  --width 1920 --height 1080 \
  --output "$OUTPUT_DIR/1920x1080/mj-red-lace-wallpaper"

echo "Generating: Red Lace (2560x1440)..."
python3 "$SCRIPT" "Stunning red-haired woman in red lace lingerie, bold seductive pose, dramatic lighting, confident powerful expression, rich red tones, intimate boudoir photography style, desktop wallpaper composition, highly detailed" \
  --width 2560 --height 1440 \
  --output "$OUTPUT_DIR/2560x1440/mj-red-lace-wallpaper"

# 4. Black Lace Boudoir
echo "Generating: Black Lace (1920x1080)..."
python3 "$SCRIPT" "Gorgeous red-haired woman in black lace boudoir lingerie, intricate lace details, confident seductive pose, soft intimate bedroom lighting, luxurious sensual atmosphere, desktop wallpaper composition, highly detailed photorealistic" \
  --width 1920 --height 1080 \
  --output "$OUTPUT_DIR/1920x1080/mj-black-lace-wallpaper"

echo "Generating: Black Lace (2560x1440)..."
python3 "$SCRIPT" "Gorgeous red-haired woman in black lace boudoir lingerie, intricate lace details, confident seductive pose, soft intimate bedroom lighting, luxurious sensual atmosphere, desktop wallpaper composition, highly detailed photorealistic" \
  --width 2560 --height 1440 \
  --output "$OUTPUT_DIR/2560x1440/mj-black-lace-wallpaper"

# 5. Cyberpunk Neon
echo "Generating: Cyberpunk (1920x1080)..."
python3 "$SCRIPT" "Red-haired woman in futuristic cyberpunk leather outfit, neon purple cyan lighting, confident bold pose, urban night background, edgy sensual sci-fi aesthetic, desktop wallpaper composition, highly detailed digital art" \
  --width 1920 --height 1080 \
  --output "$OUTPUT_DIR/1920x1080/mj-cyberpunk-wallpaper"

echo "Generating: Cyberpunk (2560x1440)..."
python3 "$SCRIPT" "Red-haired woman in futuristic cyberpunk leather outfit, neon purple cyan lighting, confident bold pose, urban night background, edgy sensual sci-fi aesthetic, desktop wallpaper composition, highly detailed digital art" \
  --width 2560 --height 1440 \
  --output "$OUTPUT_DIR/2560x1440/mj-cyberpunk-wallpaper"

# 6. Confident Leather
echo "Generating: Confident Leather (1920x1080)..."
python3 "$SCRIPT" "Red-haired woman in leather outfit, edgy confident pose, bold powerful expression, moody dramatic lighting, sensual strong energy, desktop wallpaper composition, highly detailed photorealistic portrait" \
  --width 1920 --height 1080 \
  --output "$OUTPUT_DIR/1920x1080/mj-confident-leather-wallpaper"

echo "Generating: Confident Leather (2560x1440)..."
python3 "$SCRIPT" "Red-haired woman in leather outfit, edgy confident pose, bold powerful expression, moody dramatic lighting, sensual strong energy, desktop wallpaper composition, highly detailed photorealistic portrait" \
  --width 2560 --height 1440 \
  --output "$OUTPUT_DIR/2560x1440/mj-confident-leather-wallpaper"

# 7. Beach Sunset
echo "Generating: Beach Sunset (1920x1080)..."
python3 "$SCRIPT" "Fit red-haired woman in bikini on beach, golden hour sunset lighting, confident relaxed pose, warm orange pink sky, athletic curvy build, playful sensual vibe, desktop wallpaper composition, highly detailed photorealistic" \
  --width 1920 --height 1080 \
  --output "$OUTPUT_DIR/1920x1080/mj-beach-sunset-wallpaper"

echo "Generating: Beach Sunset (2560x1440)..."
python3 "$SCRIPT" "Fit red-haired woman in bikini on beach, golden hour sunset lighting, confident relaxed pose, warm orange pink sky, athletic curvy build, playful sensual vibe, desktop wallpaper composition, highly detailed photorealistic" \
  --width 2560 --height 1440 \
  --output "$OUTPUT_DIR/2560x1440/mj-beach-sunset-wallpaper"

# 8. White Shirt Morning Intimacy
echo "Generating: White Shirt (1920x1080)..."
python3 "$SCRIPT" "Red-haired woman wearing oversized white men's button-down shirt, nothing underneath, shirt hanging off one shoulder, lazy morning light through bedroom window, intimate domestic scene, confident knowing gaze, desktop wallpaper composition, highly detailed" \
  --width 1920 --height 1080 \
  --output "$OUTPUT_DIR/1920x1080/mj-white-shirt-wallpaper"

echo "Generating: White Shirt (2560x1440)..."
python3 "$SCRIPT" "Red-haired woman wearing oversized white men's button-down shirt, nothing underneath, shirt hanging off one shoulder, lazy morning light through bedroom window, intimate domestic scene, confident knowing gaze, desktop wallpaper composition, highly detailed" \
  --width 2560 --height 1440 \
  --output "$OUTPUT_DIR/2560x1440/mj-white-shirt-wallpaper"

echo "=== Wallpaper Collection Complete ==="
echo "Output: $OUTPUT_DIR"
