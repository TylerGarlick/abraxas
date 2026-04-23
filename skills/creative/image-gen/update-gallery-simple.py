#!/usr/bin/env python3
"""Simple gallery README updater"""

from pathlib import Path
from datetime import datetime
import sys

PORTRAITS_DIR = Path('/root/.openclaw/workspace/projects/mary-jane/portraits')
README_FILE = PORTRAITS_DIR / 'README.md'

def scan_folder(folder):
    """Get PNG files sorted by date."""
    if not folder.exists():
        return []
    return sorted([f for f in folder.glob('*.png') if f.is_file()], 
                  key=lambda x: x.stat().st_mtime, reverse=True)

def img_row(images, base_path):
    """Create a table row with up to 3 images."""
    row = '<tr>\n'
    for img in images[:3]:
        name = img.stem.replace('generated-', '').replace('_', ' ').title()
        rel = f'./{base_path}/{img.name}'
        row += f'  <td align="center"><img src="{rel}" width="250" /><br/><b>{name}</b></td>\n'
    while len(images) < 3:
        row += '  <td></td>\n'
    row += '</tr>\n'
    return row

def main():
    readme = '# MJ Portrait Gallery 🔥\n\n'
    readme += '*Auto-generated collection of Mary Jane portraits*\n\n---\n\n'
    
    # Latest daily
    daily = scan_folder(PORTRAITS_DIR / 'daily')
    if daily:
        readme += f'## 📅 Latest Daily\n\n![Latest](./daily/{daily[0].name})\n\n---\n\n'
    
    # Sections
    sections = [
        ('portrait', '🤖 AI Portraits'),
        ('boudoir', '🔥 Boudoir'),
        ('concept', '🎨 Concept Art'),
    ]
    
    for folder_name, title in sections:
        images = scan_folder(PORTRAITS_DIR / folder_name)
        if not images:
            continue
        
        readme += f'## {title}\n\n<div align="center">\n<table>\n'
        rows = [images[i:i+3] for i in range(0, len(images), 3)]
        for row in rows:
            readme += img_row(row, folder_name)
        readme += '</table>\n</div>\n\n---\n\n'
    
    readme += f'*Updated: {datetime.now().strftime("%Y-%m-%d %H:%M")}*\n'
    
    README_FILE.write_text(readme)
    print(f'✅ Gallery updated with {sum(len(scan_folder(PORTRAITS_DIR / f)) for f in ["portrait","boudoir","concept"])} images', file=sys.stderr)

if __name__ == '__main__':
    main()
