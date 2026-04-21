"""
Aletheia Storage Layer - File I/O for resolutions.md

Handles reading, writing, and backing up the resolution index.
Maintains append-only invariant for ~/.janus/resolutions.md
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict
from pathlib import Path

JANUS_DIR = Path(os.environ.get("JANUS_DIR", os.path.expanduser("~/.janus")))
RESOLUTIONS_FILE = JANUS_DIR / "resolutions.md"
RESOLUTIONS_BACKUP = JANUS_DIR / "resolutions.md.bak"
INDEX_FILE = JANUS_DIR / ".aletheia-index"

SCHEMA_VERSION = "1.0"

@dataclass
class Resolution:
    """Single resolution record"""
    session_uuid: str
    claim_text: str
    label_type: str  # KNOWN | INFERRED | UNCERTAIN | UNKNOWN
    status: str  # confirmed | disconfirmed | superseded
    resolution_date: str  # ISO 8601
    resolution_note: str = ""
    actual_finding: str = ""  # Required for disconfirm
    superseded_by: str = ""  # Required for supersede
    created_at: str = ""  # Auto-set
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.utcnow().isoformat() + "Z"


def ensure_janus_dir():
    """Create ~/.janus/ and ~/.janus/sessions/ if they don't exist"""
    JANUS_DIR.mkdir(parents=True, exist_ok=True)
    (JANUS_DIR / "sessions").mkdir(exist_ok=True)


def create_header_if_needed() -> bool:
    """
    Create resolutions.md with schema header if it doesn't exist.
    Returns True if file was created, False if it already existed.
    """
    ensure_janus_dir()
    
    if RESOLUTIONS_FILE.exists():
        return False
    
    header = f"""# Janus Resolution Index

Auto-managed by Aletheia skill. Do not edit by hand.
Schema version: {SCHEMA_VERSION}
Last updated: {datetime.utcnow().isoformat()}Z

"""
    
    # Backup on first write (even though file doesn't exist, create empty backup marker)
    backup_on_first_write()
    
    RESOLUTIONS_FILE.write_text(header)
    return True


def backup_on_first_write():
    """Create backup copy if resolutions.md exists"""
    if RESOLUTIONS_FILE.exists() and not RESOLUTIONS_BACKUP.exists():
        RESOLUTIONS_BACKUP.write_text(RESOLUTIONS_FILE.read_text())


def load_resolutions() -> List[Resolution]:
    """
    Parse resolutions.md and return list of Resolution objects.
    Returns empty list if file doesn't exist.
    """
    if not RESOLUTIONS_FILE.exists():
        return []
    
    content = RESOLUTIONS_FILE.read_text()
    resolutions = []
    
    current_session = None
    current_label = None
    
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Session header
        if line.startswith('## Session '):
            current_session = line.replace('## Session ', '').strip()
            i += 1
            continue
        
        # Label section header
        if line.startswith('### [') and '] Resolutions' in line:
            label = line.strip().replace('### [', '').replace('] Resolutions', '')
            current_label = label
            i += 1
            continue
        
        # Claim item start
        if line.strip().startswith('- **') and current_session and current_label:
            topic = line.strip().replace('- **', '').replace('**', '')
            
            # Parse resolution details
            resolution_data = {
                'session_uuid': current_session,
                'label_type': current_label,
                'topic': topic
            }
            
            # Read next lines for details
            i += 1
            while i < len(lines) and not (lines[i].strip().startswith('- **') or lines[i].startswith('###') or lines[i].startswith('##')):
                detail_line = lines[i].strip()
                if detail_line.startswith('- Original claim:'):
                    resolution_data['claim_text'] = detail_line.replace('- Original claim:', '').strip().strip('"')
                elif detail_line.startswith('Status:'):
                    resolution_data['status'] = detail_line.replace('Status:', '').strip()
                elif detail_line.startswith('Resolution date:'):
                    resolution_data['resolution_date'] = detail_line.replace('Resolution date:', '').strip()
                elif detail_line.startswith('Resolution note:'):
                    resolution_data['resolution_note'] = detail_line.replace('Resolution note:', '').strip().strip('"')
                elif detail_line.startswith('Actual finding:'):
                    resolution_data['actual_finding'] = detail_line.replace('Actual finding:', '').strip().strip('"')
                elif detail_line.startswith('Superseded by:'):
                    resolution_data['superseded_by'] = detail_line.replace('Superseded by:', '').strip().strip('"')
                i += 1
            
            # Create Resolution object
            try:
                resolution = Resolution(
                    session_uuid=resolution_data.get('session_uuid', ''),
                    claim_text=resolution_data.get('claim_text', topic),
                    label_type=resolution_data.get('label_type', 'UNKNOWN'),
                    status=resolution_data.get('status', 'confirmed'),
                    resolution_date=resolution_data.get('resolution_date', datetime.utcnow().isoformat() + 'Z'),
                    resolution_note=resolution_data.get('resolution_note', ''),
                    actual_finding=resolution_data.get('actual_finding', ''),
                    superseded_by=resolution_data.get('superseded_by', '')
                )
                resolutions.append(resolution)
            except Exception as e:
                # Skip malformed entries
                print(f"Warning: Could not parse resolution: {e}")
            
            continue
        
        i += 1
    
    return resolutions


def save_resolution(resolution: Resolution):
    """
    Append a resolution to resolutions.md.
    Creates file with header if needed.
    """
    create_header_if_needed()
    
    content = RESOLUTIONS_FILE.read_text() if RESOLUTIONS_FILE.exists() else ""
    
    # Check if session section exists
    session_header = f"## Session {resolution.session_uuid}"
    
    if session_header not in content:
        # Add new session section
        label_section = f"""

{session_header}

**Session opened:** {resolution.resolution_date[:10]}
**Total resolutions:** 1

### [{resolution.label_type}] Resolutions

- **{resolution.claim_text[:50]}{"..." if len(resolution.claim_text) > 50 else ""}**
  - Original claim: "{resolution.claim_text}"
  - Status: {resolution.status}
  - Resolution date: {resolution.resolution_date}
"""
        if resolution.resolution_note:
            label_section += f'  - Resolution note: "{resolution.resolution_note}"\n'
        if resolution.actual_finding:
            label_section += f'  - Actual finding: "{resolution.actual_finding}"\n'
        if resolution.superseded_by:
            label_section += f'  - Superseded by: "{resolution.superseded_by}"\n'
        
        content = content.rstrip() + label_section
    else:
        # Add to existing session section
        # Find the session section and add to appropriate label subsection
        label_subsection = f"### [{resolution.label_type}] Resolutions"
        
        session_start = content.find(session_header)
        session_end = content.find('## Session ', session_start + 1)
        if session_end == -1:
            session_end = len(content)
        
        session_content = content[session_start:session_end]
        
        if label_subsection not in session_content:
            # Add new label subsection
            entry = f"""
{label_subsection}

- **{resolution.claim_text[:50]}{"..." if len(resolution.claim_text) > 50 else ""}**
  - Original claim: "{resolution.claim_text}"
  - Status: {resolution.status}
  - Resolution date: {resolution.resolution_date}
"""
            if resolution.resolution_note:
                entry += f'  - Resolution note: "{resolution.resolution_note}"\n'
            if resolution.actual_finding:
                entry += f'  - Actual finding: "{resolution.actual_finding}"\n'
            if resolution.superseded_by:
                entry += f'  - Superseded by: "{resolution.superseded_by}"\n'
            
            # Insert after session header block
            session_lines = session_content.split('\n')
            insert_idx = 3  # After header, session opened, total resolutions
            session_lines.insert(insert_idx, entry)
            session_content = '\n'.join(session_lines)
        else:
            # Add to existing label subsection
            entry = f"""
- **{resolution.claim_text[:50]}{"..." if len(resolution.claim_text) > 50 else ""}**
  - Original claim: "{resolution.claim_text}"
  - Status: {resolution.status}
  - Resolution date: {resolution.resolution_date}
"""
            if resolution.resolution_note:
                entry += f'  - Resolution note: "{resolution.resolution_note}"\n'
            if resolution.actual_finding:
                entry += f'  - Actual finding: "{resolution.actual_finding}"\n'
            if resolution.superseded_by:
                entry += f'  - Superseded by: "{resolution.superseded_by}"\n'
            
            # Find label subsection and add entry
            label_idx = session_content.find(label_subsection)
            label_end = session_content.find('### [', label_idx + 1)
            if label_end == -1:
                label_end = len(session_content)
            
            session_content = session_content[:label_end] + entry + session_content[label_end:]
        
        content = content[:session_start] + session_content + content[session_end:]
    
    # Update header timestamp
    content = content.replace(
        f"Last updated: {content.split('Last updated: ')[1].split('Z')[0]}Z",
        f"Last updated: {datetime.utcnow().isoformat()}Z",
        1
    )
    
    RESOLUTIONS_FILE.write_text(content)
    
    # Invalidate index cache
    if INDEX_FILE.exists():
        INDEX_FILE.unlink()


def check_existing_resolution(session_uuid: str, claim_text: str) -> Optional[Resolution]:
    """
    Check if a resolution already exists for this claim.
    Returns the existing resolution if found, None otherwise.
    """
    resolutions = load_resolutions()
    for res in resolutions:
        if res.session_uuid == session_uuid and res.claim_text == claim_text:
            return res
    return None


def get_resolutions_by_session(session_uuid: str) -> List[Resolution]:
    """Get all resolutions for a specific session"""
    resolutions = load_resolutions()
    return [r for r in resolutions if r.session_uuid == session_uuid]


def get_resolutions_by_label(label_type: str) -> List[Resolution]:
    """Get all resolutions for a specific label type"""
    resolutions = load_resolutions()
    return [r for r in resolutions if r.label_type == label_type]


def build_index():
    """
    Build performance index for fast lookups.
    Creates ~/.janus/.aletheia-index
    """
    resolutions = load_resolutions()
    index = {}
    
    for res in resolutions:
        key = f"{res.session_uuid}:{res.claim_text}"
        index[key] = {
            'label_type': res.label_type,
            'status': res.status,
            'resolution_date': res.resolution_date
        }
    
    INDEX_FILE.write_text(json.dumps(index, indent=2))


def load_index() -> Dict[str, Any]:
    """Load performance index if it exists"""
    if INDEX_FILE.exists():
        return json.loads(INDEX_FILE.read_text())
    return {}


def get_unresolved_claims(ledger_claims: List[Dict]) -> List[Dict]:
    """
    Given a list of claims from the ledger, return those without resolutions.
    
    Args:
        ledger_claims: List of dicts with keys: session_uuid, claim_text, label_type
    
    Returns:
        List of unresolved claims
    """
    resolutions = load_resolutions()
    resolved_keys = {(r.session_uuid, r.claim_text) for r in resolutions}
    
    unresolved = []
    for claim in ledger_claims:
        key = (claim.get('session_uuid'), claim.get('claim_text'))
        if key not in resolved_keys:
            unresolved.append(claim)
    
    return unresolved
