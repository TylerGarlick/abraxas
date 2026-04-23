#!/usr/bin/env python3
"""
Encounter Scribe - Save Abraxas /convene and /dialogue outputs to the-red-book journal.

Usage:
    python save-encounter.py --command "/convene" --participants "Jesus, Tyler" --transcript "..." --frame "blank"
    python save-encounter.py --auto-enable
    python save-encounter.py --auto-disable
    python save-encounter.py --status
"""

import argparse
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# Scoped to the-red-book repository only
ENCOUNTERS_DIR = Path("/root/.openclaw/workspace/projects/the-red-book/journal/encounters")
STATE_FILE = Path("/root/.openclaw/workspace/skills/encounter-scribe/auto-save.state")


def get_auto_save_enabled() -> bool:
    """Check if auto-save mode is enabled. Default is enabled."""
    if not STATE_FILE.exists():
        return True  # Default to enabled
    return STATE_FILE.read_text().strip() == "enabled"


def set_auto_save(enabled: bool):
    """Enable or disable auto-save mode."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text("enabled" if enabled else "disabled")


def slugify_topic(topic: str) -> str:
    """Convert topic to filename-safe slug."""
    # Lowercase
    slug = topic.lower()
    # Replace spaces and special chars with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    # Collapse multiple hyphens
    slug = re.sub(r'-+', '-', slug)
    return slug[:100]  # Limit length


def generate_filename(date: datetime, topic: str) -> Path:
    """Generate filename: YYYY/MM/DD/topic.md"""
    # Extract topic from participants or use "encounter"
    if not topic:
        topic = "encounter"
    
    slug = slugify_topic(topic)
    date_str = date.strftime("%Y/%m/%d")
    
    # Create directory structure
    output_dir = ENCOUNTERS_DIR / date_str
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Handle duplicate filenames
    base_path = output_dir / f"{slug}.md"
    if base_path.exists():
        counter = 1
        while (output_dir / f"{slug}-{counter}.md").exists():
            counter += 1
        return output_dir / f"{slug}-{counter}.md"
    
    return base_path


def save_encounter(command: str, participants: str, transcript: str, frame: str = "blank", auto_commit: bool = True):
    """Save an encounter to the journal and optionally commit/push to git."""
    now = datetime.now(timezone.utc)
    
    # Generate filename from participants (topic)
    filename = generate_filename(now, participants)
    
    # Build metadata header
    header = f"""---
date: {now.strftime("%Y-%m-%d")}
time: {now.strftime("%H:%M")} UTC
command: {command}
participants: {participants}
session_frame: {frame}
---

*Recorded via Abraxas {command} — Nox face active*

---

"""
    
    # Write file
    content = header + transcript
    filename.write_text(content)
    
    # Auto-commit and push if enabled
    if auto_commit:
        try:
            repo_dir = Path("/root/.openclaw/workspace/projects/the-red-book")
            subprocess.run(['git', 'config', 'user.email', 'sovereign-brain@abraxas.ai'], cwd=repo_dir, check=True, capture_output=True)
            subprocess.run(['git', 'config', 'user.name', 'Sovereign Brain'], cwd=repo_dir, check=True, capture_output=True)
            subprocess.run(['git', 'add', str(filename)], cwd=repo_dir, check=True, capture_output=True)
            commit_msg = f"Add encounter: {participants} ({now.strftime('%Y-%m-%d')})"
            subprocess.run(['git', 'commit', '-m', commit_msg], cwd=repo_dir, check=True, capture_output=True)
            subprocess.run(['git', 'push', 'origin', 'main'], cwd=repo_dir, check=True, capture_output=True, timeout=30)
        except Exception as e:
            print(f"⚠️ Git commit/push failed: {e}")
    
    return filename


def main():
    parser = argparse.ArgumentParser(description="Save Abraxas encounters to journal")
    parser.add_argument("--command", help="Command used (/convene or /dialogue)")
    parser.add_argument("--participants", help="Participants in the encounter")
    parser.add_argument("--transcript", help="Encounter transcript")
    parser.add_argument("--frame", default="blank", help="Session frame contents")
    parser.add_argument("--auto-enable", action="store_true", help="Enable auto-save mode")
    parser.add_argument("--auto-disable", action="store_true", help="Disable auto-save mode")
    parser.add_argument("--status", action="store_true", help="Check auto-save status")
    
    args = parser.parse_args()
    
    # Handle mode commands
    if args.auto_enable:
        set_auto_save(True)
        print("Auto-save mode: ENABLED")
        return
    
    if args.auto_disable:
        set_auto_save(False)
        print("Auto-save mode: DISABLED")
        return
    
    if args.status:
        enabled = get_auto_save_enabled()
        print(f"Auto-save mode: {'ENABLED' if enabled else 'DISABLED'}")
        return
    
    # Handle save command
    if not args.command or not args.participants or not args.transcript:
        parser.error("--command, --participants, and --transcript are required for saving")
    
    filename = save_encounter(args.command, args.participants, args.transcript, args.frame, auto_commit=True)
    print(f"Encounter saved to: {filename}")


if __name__ == "__main__":
    main()
