#!/usr/bin/env python3
"""
Sort and organize portraits folder
- Moves images from portrait/ to appropriate subfolders
- Deletes blank/black images
- Organizes by content type
"""

import sys
from pathlib import Path
from PIL import Image

PORTRAITS_DIR = Path('/root/.openclaw/workspace/projects/mary-jane/portraits')

def is_blank_image(img_path: Path) -> bool:
    """Check if image is blank/black."""
    try:
        # Check file size first
        if img_path.stat().st_size < 10 * 1024:  # < 10KB
            return True
        
        img = Image.open(img_path)
        gray = img.convert('L')
        pixels = list(gray.getdata())
        avg_brightness = sum(pixels) / len(pixels) / 255.0
        
        if avg_brightness < 0.02:
            return True
        
        return False
    except:
        return True

def categorize_image(img_path: Path) -> str:
    """Categorize image based on filename and content."""
    name = img_path.stem.lower()
    
    # Check filename for keywords
    if 'boudoir' in name or 'lace' in name or 'lingerie' in name or 'seductive' in name:
        return 'boudoir'
    elif 'cyberpunk' in name or 'neon' in name or 'city' in name:
        return 'concept'
    elif 'daily' in name or 'mj-daily' in name:
        return 'daily'
    elif 'illustration' in name or 'art' in name:
        return 'illustration'
    elif 'beach' in name or 'photo' in name or 'sunset' in name:
        return 'photo'
    else:
        # Default to portrait for general portraits
        return 'portrait'

def main():
    print("📸 Scanning portraits folder...", file=sys.stderr)
    
    # Track stats
    moved = 0
    deleted = 0
    errors = 0
    
    # Process portrait/ folder - move everything out
    portrait_folder = PORTRAITS_DIR / 'portrait'
    if portrait_folder.exists():
        print(f"\n📂 Processing portrait/ folder...", file=sys.stderr)
        
        for img_file in portrait_folder.glob('*.png'):
            if not img_file.is_file():
                continue
            
            # Check if blank
            if is_blank_image(img_file):
                print(f"  🗑️  Deleting blank: {img_file.name}", file=sys.stderr)
                img_file.unlink()
                deleted += 1
                continue
            
            # Categorize
            category = categorize_image(img_file)
            target_folder = PORTRAITS_DIR / category
            
            # Create folder if needed
            target_folder.mkdir(parents=True, exist_ok=True)
            
            # Move file
            target_path = target_folder / img_file.name
            print(f"  📦 Moving {img_file.name} → {category}/", file=sys.stderr)
            
            try:
                img_file.rename(target_path)
                moved += 1
            except Exception as e:
                print(f"  ❌ Error moving {img_file.name}: {e}", file=sys.stderr)
                errors += 1
        
        # Remove empty portrait folder
        try:
            portrait_folder.rmdir()
            print(f"  ✅ Removed empty portrait/ folder", file=sys.stderr)
        except:
            pass
    
    # Scan all other folders for blank images
    print(f"\n🔍 Scanning all folders for blank images...", file=sys.stderr)
    
    for subfolder in PORTRAITS_DIR.iterdir():
        if not subfolder.is_dir():
            continue
        
        for img_file in subfolder.glob('*.png'):
            if is_blank_image(img_file):
                print(f"  🗑️  Deleting blank: {subfolder.name}/{img_file.name}", file=sys.stderr)
                img_file.unlink()
                deleted += 1
    
    # Summary
    print(f"\n✅ Done!", file=sys.stderr)
    print(f"   📦 Moved: {moved} images", file=sys.stderr)
    print(f"   🗑️  Deleted: {deleted} blank images", file=sys.stderr)
    if errors:
        print(f"   ⚠️  Errors: {errors}", file=sys.stderr)

if __name__ == '__main__':
    main()
