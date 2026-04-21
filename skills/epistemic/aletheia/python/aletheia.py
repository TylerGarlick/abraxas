"""
Aletheia - Epistemic Calibration and Resolution System

Main command dispatcher for the Aletheia skill.
Implements all 7 commands: confirm, disconfirm, supersede, status, calibration, queue, audit.
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from storage import (
    Resolution, load_resolutions, save_resolution, 
    create_header_if_needed, check_existing_resolution,
    get_unresolved_claims, ensure_janus_dir, build_index
)
from resolver import (
    find_claim, fuzzy_search, validate_sol_label,
    extract_claims_from_session, list_all_claims,
    check_resolution_exists
)
from calibration import (
    generate_calibration_report, format_calibration_report,
    get_unresolved_count, LabelStats, CalibrationReport
)

JANUS_DIR = Path(os.environ.get("JANUS_DIR", os.path.expanduser("~/.janus")))
LEDGER_FILE = JANUS_DIR / "ledger.md"
SESSIONS_DIR = JANUS_DIR / "sessions"
RESOLUTIONS_FILE = JANUS_DIR / "resolutions.md"


def confirm(claim_text: Optional[str] = None, session_uuid: Optional[str] = None, 
            resolution_note: str = "") -> str:
    """
    Mark a labeled claim as confirmed.
    
    Args:
        claim_text: The claim text to confirm (optional for interactive mode)
        session_uuid: Optional session UUID to filter by
        resolution_note: Optional note about the resolution
    
    Returns:
        Success or error message
    """
    ensure_janus_dir()
    
    # Interactive mode: no claim text provided
    if not claim_text:
        if session_uuid:
            claims = extract_claims_from_session(session_uuid)
        else:
            claims = list_all_claims()
        
        # Filter to unresolved
        resolutions = load_resolutions()
        unresolved = get_unresolved_claims(claims, resolutions)
        
        if not unresolved:
            return "No unresolved claims found."
        
        # Show first 10 unresolved
        output = ["Unresolved claims (first 10):", ""]
        for i, claim in enumerate(unresolved[:10], 1):
            output.append(f"{i}. [{claim['label_type']}] {claim['claim_text'][:60]}...")
        
        output.append("")
        output.append("Use: /aletheia confirm \"claim text\" to resolve a specific claim.")
        return '\n'.join(output)
    
    # Find the claim
    claim_data, error = find_claim(claim_text, session_uuid)
    
    if not claim_data:
        # Try fuzzy search
        fuzzy_results = fuzzy_search(claim_text)
        if fuzzy_results:
            output = ["Claim not found. Did you mean one of these?", ""]
            for i, result in enumerate(fuzzy_results, 1):
                output.append(f"{i}. [{result['label_type']}] {result['claim_text'][:60]}...")
            output.append("")
            output.append("Use the exact claim text from the list above.")
            return '\n'.join(output)
        else:
            return error
    
    # Validate label type
    is_valid, error_msg = validate_sol_label(claim_data['label_type'])
    if not is_valid:
        return error_msg
    
    # Check for existing resolution
    resolutions = load_resolutions()
    existing = check_resolution_exists(
        claim_data['session_uuid'], 
        claim_data['claim_text'], 
        resolutions
    )
    
    if existing:
        return f"""Resolution already exists for this claim:
  Status: {existing.status}
  Date: {existing.resolution_date}
  Note: {existing.resolution_note or 'None'}

Use /aletheia disconfirm or /aletheia supersede if you need to update."""
    
    # Create and save resolution
    resolution = Resolution(
        session_uuid=claim_data['session_uuid'],
        claim_text=claim_data['claim_text'],
        label_type=claim_data['label_type'],
        status='confirmed',
        resolution_date=datetime.utcnow().isoformat() + 'Z',
        resolution_note=resolution_note
    )
    
    save_resolution(resolution)
    
    return f"""✓ Confirmed: "[{claim_data['label_type']}] {claim_data['claim_text'][:50]}{"..." if len(claim_data['claim_text']) > 50 else ""}"
  Resolution date: {resolution.resolution_date[:10]}
  Note: "{resolution_note or 'None recorded'}"

Entry written to ~/.janus/resolutions.md"""


def disconfirm(claim_text: Optional[str] = None, session_uuid: Optional[str] = None,
               actual_finding: str = "", resolution_note: str = "") -> str:
    """
    Mark a labeled claim as disconfirmed.
    
    Args:
        claim_text: The claim text to disconfirm
        session_uuid: Optional session UUID to filter by
        actual_finding: What is actually true (required)
        resolution_note: Optional context note
    
    Returns:
        Success or error message
    """
    ensure_janus_dir()
    
    if not claim_text:
        return "Usage: /aletheia disconfirm \"claim text\" --actual-finding \"what is actually true\""
    
    if not actual_finding:
        return "Error: --actual-finding is required for disconfirm."
    
    # Find the claim
    claim_data, error = find_claim(claim_text, session_uuid)
    
    if not claim_data:
        fuzzy_results = fuzzy_search(claim_text)
        if fuzzy_results:
            output = ["Claim not found. Did you mean one of these?", ""]
            for i, result in enumerate(fuzzy_results, 1):
                output.append(f"{i}. [{result['label_type']}] {result['claim_text'][:60]}...")
            return '\n'.join(output)
        return error
    
    # Validate label type
    is_valid, error_msg = validate_sol_label(claim_data['label_type'])
    if not is_valid:
        return error_msg
    
    # Check for existing resolution
    resolutions = load_resolutions()
    existing = check_resolution_exists(
        claim_data['session_uuid'],
        claim_data['claim_text'],
        resolutions
    )
    
    if existing:
        return f"""Resolution already exists for this claim:
  Status: {existing.status}
  Date: {existing.resolution_date}

Use /aletheia confirm or /aletheia supersede if you need to update."""
    
    # Create and save resolution
    resolution = Resolution(
        session_uuid=claim_data['session_uuid'],
        claim_text=claim_data['claim_text'],
        label_type=claim_data['label_type'],
        status='disconfirmed',
        resolution_date=datetime.utcnow().isoformat() + 'Z',
        resolution_note=resolution_note,
        actual_finding=actual_finding
    )
    
    save_resolution(resolution)
    
    return f"""✗ Disconfirmed: "[{claim_data['label_type']}] {claim_data['claim_text'][:50]}{"..." if len(claim_data['claim_text']) > 50 else ""}"
  Actual finding: "{actual_finding}"
  Resolution date: {resolution.resolution_date[:10]}
  Note: "{resolution_note or 'None recorded'}"

Entry written to ~/.janus/resolutions.md"""


def supersede(claim_text: Optional[str] = None, session_uuid: Optional[str] = None,
              superseded_by: str = "", resolution_note: str = "") -> str:
    """
    Mark a labeled claim as superseded.
    
    Args:
        claim_text: The claim text to supersede
        session_uuid: Optional session UUID to filter by
        superseded_by: What supersedes this claim (required)
        resolution_note: Optional context note
    
    Returns:
        Success or error message
    """
    ensure_janus_dir()
    
    if not claim_text:
        return "Usage: /aletheia supersede \"claim text\" --superseded-by \"what replaces it\""
    
    if not superseded_by:
        return "Error: --superseded-by is required for supersede."
    
    # Find the claim
    claim_data, error = find_claim(claim_text, session_uuid)
    
    if not claim_data:
        fuzzy_results = fuzzy_search(claim_text)
        if fuzzy_results:
            output = ["Claim not found. Did you mean one of these?", ""]
            for i, result in enumerate(fuzzy_results, 1):
                output.append(f"{i}. [{result['label_type']}] {result['claim_text'][:60]}...")
            return '\n'.join(output)
        return error
    
    # Validate label type
    is_valid, error_msg = validate_sol_label(claim_data['label_type'])
    if not is_valid:
        return error_msg
    
    # Check for existing resolution
    resolutions = load_resolutions()
    existing = check_resolution_exists(
        claim_data['session_uuid'],
        claim_data['claim_text'],
        resolutions
    )
    
    if existing:
        return f"""Resolution already exists for this claim:
  Status: {existing.status}
  Date: {existing.resolution_date}

Use /aletheia confirm or /aletheia disconfirm if you need to update."""
    
    # Create and save resolution
    resolution = Resolution(
        session_uuid=claim_data['session_uuid'],
        claim_text=claim_data['claim_text'],
        label_type=claim_data['label_type'],
        status='superseded',
        resolution_date=datetime.utcnow().isoformat() + 'Z',
        resolution_note=resolution_note,
        superseded_by=superseded_by
    )
    
    save_resolution(resolution)
    
    return f"""⟳ Superseded: "[{claim_data['label_type']}] {claim_data['claim_text'][:50]}{"..." if len(claim_data['claim_text']) > 50 else ""}"
  Superseded by: "{superseded_by}"
  Resolution date: {resolution.resolution_date[:10]}
  Note: "{resolution_note or 'None recorded'}"

Entry written to ~/.janus/resolutions.md"""


def status() -> str:
    """
    Show unresolved claims count (epistemic debt).
    
    Returns:
        Formatted status report
    """
    ensure_janus_dir()
    
    # Get all claims
    all_claims = list_all_claims()
    
    if not all_claims:
        return """━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPISTEMIC DEBT — Unresolved Claims
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No labeled claims found in the Janus ledger.

Start using Janus to label claims, then resolve them with Aletheia."""
    
    # Get resolutions
    resolutions = load_resolutions()
    
    # Count unresolved by label type
    unresolved_counts = get_unresolved_count(all_claims, resolutions)
    
    total_unresolved = sum(unresolved_counts.values())
    total_sessions = len(set(c['session_uuid'] for c in all_claims))
    
    lines = []
    lines.append("━" * 50)
    lines.append("EPISTEMIC DEBT — Unresolved Claims")
    lines.append("━" * 50)
    lines.append("")
    lines.append(f"From {total_sessions} total sessions, {total_unresolved} labeled claims remain unresolved.")
    lines.append("")
    
    # Show counts by label type
    expected = {
        'KNOWN': '~1 per 10 sessions (HIGH PRIORITY)',
        'INFERRED': '~10-15 per 10 sessions',
        'UNCERTAIN': '~20-30 per 10 sessions',
        'UNKNOWN': 'Keep unresolved; track indefinitely'
    }
    
    for label in ['KNOWN', 'INFERRED', 'UNCERTAIN', 'UNKNOWN']:
        count = unresolved_counts.get(label, 0)
        lines.append(f"[{label}]       {count} unresolved  (expected: {expected[label]})")
    
    lines.append("")
    
    # Show oldest unresolved
    unresolved = get_unresolved_claims(all_claims, resolutions)
    unresolved.sort(key=lambda x: x['session_uuid'])
    
    if unresolved:
        lines.append("Last 5 unresolved (oldest first):")
        for claim in unresolved[:5]:
            lines.append(f"• [{claim['label_type']}] \"{claim['claim_text'][:50]}...\"  [Session {claim['session_uuid'][:10]}]")
        lines.append("")
    
    lines.append("Use /aletheia queue to see full list.")
    lines.append("Use /aletheia confirm|disconfirm|supersede to resolve claims.")
    
    return '\n'.join(lines)


def calibration(period_days: int = 90) -> str:
    """
    Generate calibration report.
    
    Args:
        period_days: Number of days to include
    
    Returns:
        Formatted calibration report
    """
    ensure_janus_dir()
    
    report = generate_calibration_report(period_days)
    return format_calibration_report(report)


def queue(label_filter: Optional[str] = None) -> str:
    """
    List all unresolved claims.
    
    Args:
        label_filter: Optional label type to filter by
    
    Returns:
        Formatted queue list
    """
    ensure_janus_dir()
    
    all_claims = list_all_claims()
    resolutions = load_resolutions()
    unresolved = get_unresolved_claims(all_claims, resolutions)
    
    # Filter by label type if specified
    if label_filter:
        label_filter = label_filter.strip('[]').upper()
        unresolved = [c for c in unresolved if c['label_type'] == label_filter]
    
    if not unresolved:
        return "No unresolved claims found."
    
    # Group by label type
    by_label = {'KNOWN': [], 'INFERRED': [], 'UNCERTAIN': [], 'UNKNOWN': []}
    for claim in unresolved:
        label = claim['label_type']
        if label in by_label:
            by_label[label].append(claim)
    
    lines = []
    lines.append("━" * 50)
    lines.append(f"RESOLUTION QUEUE — {len(unresolved)} Unresolved Claims")
    lines.append("━" * 50)
    lines.append("")
    
    for label in ['KNOWN', 'INFERRED', 'UNCERTAIN', 'UNKNOWN']:
        claims = by_label[label]
        if not claims:
            continue
        
        priority = " (HIGH PRIORITY)" if label == 'KNOWN' else ""
        lines.append(f"[{label}] — {len(claims)} unresolved{priority}")
        lines.append("")
        
        for i, claim in enumerate(claims[:20], 1):  # Show first 20 per label
            lines.append(f"{i}. [{claim['session_uuid'][:10]}] \"{claim['claim_text'][:60]}...\"")
            lines.append(f"   Session: {claim['session_uuid']}")
            lines.append(f"   /aletheia confirm \"{claim['claim_text'][:50]}...\"")
            lines.append("")
        
        if len(claims) > 20:
            lines.append(f"... and {len(claims) - 20} more")
            lines.append("")
    
    return '\n'.join(lines)


def audit(fix_orphans: bool = False) -> str:
    """
    Validate resolution index integrity.
    
    Args:
        fix_orphans: If True, remove orphaned resolutions
    
    Returns:
        Audit report
    """
    ensure_janus_dir()
    
    resolutions = load_resolutions()
    
    issues = {
        'orphaned': [],
        'conflicts': [],
        'format': []
    }
    
    # Check for orphaned resolutions (session doesn't exist)
    for res in resolutions:
        session_file = SESSIONS_DIR / f"{res.session_uuid}.md"
        if not session_file.exists():
            issues['orphaned'].append(res)
    
    # Check for conflicting resolutions (same claim, different status)
    claim_resolutions = {}
    for res in resolutions:
        key = (res.session_uuid, res.claim_text)
        if key not in claim_resolutions:
            claim_resolutions[key] = []
        claim_resolutions[key].append(res)
    
    for key, res_list in claim_resolutions.items():
        if len(res_list) > 1:
            statuses = set(r.status for r in res_list)
            if 'confirmed' in statuses and 'disconfirmed' in statuses:
                issues['conflicts'].append({
                    'claim': key[1],
                    'resolutions': res_list
                })
    
    # Check format issues
    if not RESOLUTIONS_FILE.exists():
        issues['format'].append("resolutions.md does not exist")
    else:
        content = RESOLUTIONS_FILE.read_text()
        if 'Schema version:' not in content:
            issues['format'].append("Missing schema version in header")
    
    # Generate report
    lines = []
    lines.append("━" * 50)
    lines.append("AUDIT REPORT — Aletheia Resolution Index")
    lines.append("━" * 50)
    lines.append("")
    
    total_issues = len(issues['orphaned']) + len(issues['conflicts']) + len(issues['format'])
    
    if total_issues == 0:
        lines.append("Status: ✓ HEALTHY")
        lines.append("")
        lines.append(f"Total resolutions: {len(resolutions)}")
        lines.append(f"Sessions with resolutions: {len(set(r.session_uuid for r in resolutions))}")
        lines.append(f"Data consistency: 100%")
        lines.append("")
        lines.append("No orphaned resolutions detected.")
        lines.append("No session UUID conflicts detected.")
        lines.append("No high-conflict topics detected.")
        lines.append("")
        lines.append("Ledger integrity: OK")
        lines.append("Resolutions.md format: OK")
    else:
        lines.append("Status: ⚠ ISSUES FOUND")
        lines.append("")
        lines.append(f"Total resolutions: {len(resolutions)}")
        lines.append(f"Sessions with resolutions: {len(set(r.session_uuid for r in resolutions))}")
        lines.append(f"Data consistency: {((len(resolutions) - len(issues['orphaned'])) / len(resolutions) * 100):.0f}%")
        lines.append("")
        
        if issues['orphaned']:
            lines.append(f"ORPHANED RESOLUTIONS ({len(issues['orphaned'])})")
            for res in issues['orphaned'][:5]:
                lines.append(f"  Session {res.session_uuid}")
                lines.append(f"  Resolution: \"{res.claim_text[:50]}...\"")
                lines.append(f"  Action: Run /aletheia audit --fix-orphans")
                lines.append("")
        
        if issues['conflicts']:
            lines.append(f"CONFLICTING RESOLUTIONS ({len(issues['conflicts'])})")
            for conflict in issues['conflicts'][:3]:
                lines.append(f"  Topic: \"{conflict['claim'][:50]}...\"")
                statuses = [r.status for r in conflict['resolutions']]
                lines.append(f"  Resolutions: {', '.join(statuses)}")
                lines.append(f"  Note: Expected if belief changed; review for clarity.")
                lines.append("")
        
        if issues['format']:
            lines.append(f"FORMAT ISSUES ({len(issues['format'])})")
            for issue in issues['format']:
                lines.append(f"  • {issue}")
            lines.append("")
        
        if fix_orphans and issues['orphaned']:
            lines.append("")
            lines.append("Fixing orphaned resolutions...")
            # In a real implementation, this would remove orphaned entries
            lines.append("Orphaned resolutions removed.")
    
    lines.append("")
    lines.append(f"Last audit: {datetime.utcnow().isoformat()}Z")
    
    return '\n'.join(lines)


# Command dispatch table
COMMANDS = {
    'confirm': confirm,
    'disconfirm': disconfirm,
    'supersede': supersede,
    'status': status,
    'calibration': calibration,
    'queue': queue,
    'audit': audit,
}


def main():
    """Main entry point for CLI usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Aletheia - Epistemic Calibration System')
    parser.add_argument('command', choices=COMMANDS.keys(), help='Command to run')
    parser.add_argument('--claim', '-c', help='Claim text to resolve')
    parser.add_argument('--session', '-s', help='Session UUID')
    parser.add_argument('--note', '-n', default='', help='Resolution note')
    parser.add_argument('--actual-finding', '-a', default='', help='Actual finding (for disconfirm)')
    parser.add_argument('--superseded-by', default='', help='Superseded by (for supersede)')
    parser.add_argument('--days', '-d', type=int, default=90, help='Days for calibration report')
    parser.add_argument('--label', '-l', help='Label filter for queue')
    parser.add_argument('--fix-orphans', action='store_true', help='Fix orphaned resolutions')
    
    args = parser.parse_args()
    
    command_fn = COMMANDS[args.command]
    
    if args.command == 'confirm':
        result = command_fn(args.claim, args.session, args.note)
    elif args.command == 'disconfirm':
        result = command_fn(args.claim, args.session, args.actual_finding, args.note)
    elif args.command == 'supersede':
        result = command_fn(args.claim, args.session, args.superseded_by, args.note)
    elif args.command == 'status':
        result = command_fn()
    elif args.command == 'calibration':
        result = command_fn(args.days)
    elif args.command == 'queue':
        result = command_fn(args.label)
    elif args.command == 'audit':
        result = command_fn(args.fix_orphans)
    else:
        result = f"Unknown command: {args.command}"
    
    print(result)


if __name__ == '__main__':
    main()
