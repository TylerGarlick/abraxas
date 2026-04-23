#!/usr/bin/env python3
"""
Journal Scribe - Save journal entries to the-red-book repository.

Usage:
    python save-journal.py --title "Entry Title" --content "..." --date "2026-04-12"
"""

import argparse
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# Scoped to the-red-book repository only
JOURNALS_DIR = Path("/root/.openclaw/workspace/projects/the-red-book/journals")
REPO_DIR = Path("/root/.openclaw/workspace/projects/the-red-book")


def slugify_title(title: str) -> str:
    """Convert title to filename-safe slug."""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    slug = re.sub(r'-+', '-', slug)
    return slug[:100]


def save_journal_entry(
    title: str,
    content: str,
    date: str = None,
    time: str = None,
    location: str = None,
    people: str = None,
    mood: str = None,
    auto_commit: bool = True
) -> Path:
    """Save a journal entry and optionally commit/push to git."""
    
    # Use current date/time if not provided
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    if not time:
        time = datetime.now().strftime("%H:%M")
    
    # Parse date for folder structure
    dt = datetime.strptime(date, "%Y-%m-%d")
    year_month = dt.strftime("%Y/%m")
    
    # Create directory structure
    output_dir = JOURNALS_DIR / year_month
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename
    slug = slugify_title(title)
    filename = output_dir / f"{slug}.md"
    
    # Handle duplicates
    if filename.exists():
        counter = 1
        while (output_dir / f"{slug}-{counter}.md").exists():
            counter += 1
        filename = output_dir / f"{slug}-{counter}.md"
    
    # Build metadata header
    header_parts = [
        "---",
        f"date: {date}",
        f"time: {time} MST",
    ]
    
    if location:
        header_parts.append(f"location: {location}")
    if people:
        header_parts.append(f'people: ["{people.replace(", ", '", "')}"]')
    if mood:
        header_parts.append(f"mood: {mood}")
    
    header_parts.append("---")
    
    header = "\n".join(header_parts) + "\n\n"
    
    # Build full content
    full_content = f"""{header}# {title}

*{date} — {time}*

---

{content}

---

*Journal entry saved via journal-scribe skill*
"""
    
    # Write file
    filename.write_text(full_content)
    
    # Auto-commit and push if enabled
    if auto_commit:
        try:
            subprocess.run(['git', 'config', 'user.email', 'tyler@tylergarlick.com'], cwd=REPO_DIR, check=True, capture_output=True)
            subprocess.run(['git', 'config', 'user.name', 'Tyler Garlick'], cwd=REPO_DIR, check=True, capture_output=True)
            subprocess.run(['git', 'add', str(filename)], cwd=REPO_DIR, check=True, capture_output=True)
            commit_msg = f"Add journal entry: {title} ({date})"
            subprocess.run(['git', 'commit', '-m', commit_msg], cwd=REPO_DIR, check=True, capture_output=True)
            subprocess.run(['git', 'push', 'origin', 'main'], cwd=REPO_DIR, check=True, capture_output=True, timeout=30)
        except Exception as e:
            print(f"⚠️ Git commit/push failed: {e}")
    
    return filename


def main():
    parser = argparse.ArgumentParser(description="Save journal entries to the-red-book repository")
    parser.add_argument("--title", required=True, help="Entry title (used for filename)")
    parser.add_argument("--content", required=True, help="Journal entry text")
    parser.add_argument("--date", help="Date in YYYY-MM-DD format (default: today)")
    parser.add_argument("--time", help="Time in HH:MM format (default: current time)")
    parser.add_argument("--location", help="Where this happened (optional)")
    parser.add_argument("--people", help="Comma-separated list of people (optional)")
    parser.add_argument("--mood", help="Emotional tone (optional)")
    parser.add_argument("--no-commit", action="store_true", help="Save file only, don't commit/push")
    parser.add_argument("--status", action="store_true", help="Check skill status")
    
    args = parser.parse_args()
    
    if args.status:
        print(f"Journal Scribe skill is ready")
        print(f"Target directory: {JOURNALS_DIR}")
        return
    
    # Save entry
    filename = save_journal_entry(
        title=args.title,
        content=args.content,
        date=args.date,
        time=args.time,
        location=args.location,
        people=args.people,
        mood=args.mood,
        auto_commit=not args.no_commit
    )
    
    print(f"Journal saved to: {filename}")
    if not args.no_commit:
        print("Committed and pushed to origin/main")


if __name__ == "__main__":
    main()
