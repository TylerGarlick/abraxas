"""
Aletheia Resolver - Claim matching and validation logic

Handles finding claims in the Janus ledger, fuzzy search,
label validation, and duplicate detection.
"""

import os
import re
from difflib import SequenceMatcher
from pathlib import Path
from typing import Optional, List, Dict, Tuple, Any

JANUS_DIR = Path(os.environ.get("JANUS_DIR", os.path.expanduser("~/.janus")))
LEDGER_FILE = JANUS_DIR / "ledger.md"
SESSIONS_DIR = JANUS_DIR / "sessions"

SOL_LABELS = {'KNOWN', 'INFERRED', 'UNCERTAIN', 'UNKNOWN'}
DREAM_LABEL = 'DREAM'


def validate_sol_label(label: str) -> Tuple[bool, str]:
    """
    Validate that a label is a Sol-mode label (not DREAM).
    
    Returns:
        (is_valid, error_message)
    """
    label = label.strip('[]').upper()
    
    if label == DREAM_LABEL:
        return False, """Cannot resolve [DREAM] material.

The claim you selected is labeled [DREAM] (symbolic/creative), not a Sol epistemic claim.
Symbolic material is tracked through the Individuation Ledger in Abraxas Oneironautics.

Use:
  /chronicle ledger       to track symbolic integration
  /pattern query          to find recurring themes
  /integrate synthesis    to synthesize symbols

If you bridged this material into Sol mode via /bridge, use the Sol output instead."""
    
    if label not in SOL_LABELS:
        return False, f"Unknown label type: [{label}]. Must be one of: [KNOWN], [INFERRED], [UNCERTAIN], [UNKNOWN]"
    
    return True, ""


def find_claim_in_ledger(claim_text: str) -> Optional[Dict[str, Any]]:
    """
    Search ledger.md for an exact claim match.
    
    Returns:
        Dict with session_uuid, label_type, claim_text, context or None if not found
    """
    if not LEDGER_FILE.exists():
        return None
    
    content = LEDGER_FILE.read_text()
    
    # Try exact match (case-insensitive)
    claim_lower = claim_text.lower()
    
    # Look for claim in ledger format
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if claim_lower in line.lower():
            # Extract context
            context_start = max(0, i - 3)
            context_end = min(len(lines), i + 5)
            context = '\n'.join(lines[context_start:context_end])
            
            # Try to extract session UUID from context
            session_match = re.search(r'Session:\s*([a-f0-9-]{36})', context, re.IGNORECASE)
            session_uuid = session_match.group(1) if session_match else None
            
            # Extract label type
            label_match = re.search(r'\[(KNOWN|INFERRED|UNCERTAIN|UNKNOWN|DREAM)\]', line, re.IGNORECASE)
            label_type = label_match.group(1).upper() if label_match else 'UNKNOWN'
            
            return {
                'session_uuid': session_uuid,
                'label_type': label_type,
                'claim_text': line.strip(),
                'context': context,
                'source': 'ledger.md'
            }
    
    return None


def find_claim_in_sessions(claim_text: str, session_uuid: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Search session files for a claim match.
    
    Args:
        claim_text: The claim text to search for
        session_uuid: Optional session UUID to filter by
    
    Returns:
        Dict with session_uuid, label_type, claim_text, context or None if not found
    """
    if not SESSIONS_DIR.exists():
        return None
    
    claim_lower = claim_text.lower()
    
    # Get list of session files
    session_files = list(SESSIONS_DIR.glob('*.md'))
    
    if session_uuid:
        # Filter to specific session
        session_files = [f for f in session_files if session_uuid in f.name]
    
    for session_file in session_files:
        content = session_file.read_text()
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if claim_lower in line.lower():
                # Extract label type
                label_match = re.search(r'\[(KNOWN|INFERRED|UNCERTAIN|UNKNOWN|DREAM)\]', line, re.IGNORECASE)
                label_type = label_match.group(1).upper() if label_match else 'UNKNOWN'
                
                # Extract session UUID from filename
                file_uuid = session_file.stem
                
                # Extract context
                context_start = max(0, i - 3)
                context_end = min(len(lines), i + 5)
                context = '\n'.join(lines[context_start:context_end])
                
                return {
                    'session_uuid': file_uuid,
                    'label_type': label_type,
                    'claim_text': line.strip(),
                    'context': context,
                    'source': f'sessions/{session_file.name}'
                }
    
    return None


def find_claim(claim_text: str, session_uuid: Optional[str] = None) -> Tuple[Optional[Dict[str, Any]], str]:
    """
    Search for a claim in the Janus ledger (ledger.md + sessions/).
    
    Args:
        claim_text: The claim text to search for
        session_uuid: Optional session UUID to filter by
    
    Returns:
        (claim_dict, error_message)
        If found: (claim_dict, "")
        If not found: (None, "error message")
    """
    # If session UUID provided, search that session first
    if session_uuid:
        result = find_claim_in_sessions(claim_text, session_uuid)
        if result:
            return result, ""
    
    # Search ledger.md
    result = find_claim_in_ledger(claim_text)
    if result:
        return result, ""
    
    # Search all sessions
    result = find_claim_in_sessions(claim_text)
    if result:
        return result, ""
    
    return None, f"""Cannot find claim in ledger:
"{claim_text}"

Possible reasons:
1. Claim text does not match exactly (check spacing, punctuation)
2. Claim was never labeled in the ledger (not from a Janus session)
3. Ledger has been modified or corrupted

Options:
1. Run /aletheia queue to find similar claims
2. Try /aletheia confirm session:{{uuid}} to browse this session's claims
3. Paste the exact claim text from the ledger

If you believe the ledger is corrupted, run /aletheia audit."""


def fuzzy_search(claim_text: str, threshold: float = 0.6, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Fuzzy search for claims similar to the given text.
    
    Args:
        claim_text: The claim text to search for
        threshold: Minimum similarity score (0.0 to 1.0)
        max_results: Maximum number of results to return
    
    Returns:
        List of matching claims with similarity scores
    """
    all_claims = []
    
    # Collect claims from ledger.md
    if LEDGER_FILE.exists():
        content = LEDGER_FILE.read_text()
        lines = content.split('\n')
        for line in lines:
            if '[' in line and ']' in line:
                all_claims.append({
                    'claim_text': line.strip(),
                    'source': 'ledger.md'
                })
    
    # Collect claims from sessions
    if SESSIONS_DIR.exists():
        for session_file in SESSIONS_DIR.glob('*.md'):
            content = session_file.read_text()
            lines = content.split('\n')
            for line in lines:
                if '[' in line and ']' in line:
                    all_claims.append({
                        'claim_text': line.strip(),
                        'source': f'sessions/{session_file.name}'
                    })
    
    # Calculate similarity scores
    results = []
    claim_lower = claim_text.lower()
    
    for claim in all_claims:
        claim_candidate = claim['claim_text'].lower()
        
        # Quick filter: must share some words
        words_claim = set(claim_lower.split())
        words_candidate = set(claim_candidate.split())
        
        if not words_claim.intersection(words_candidate):
            continue
        
        # Calculate similarity
        similarity = SequenceMatcher(None, claim_lower, claim_candidate).ratio()
        
        if similarity >= threshold:
            # Extract label type
            label_match = re.search(r'\[(KNOWN|INFERRED|UNCERTAIN|UNKNOWN|DREAM)\]', claim['claim_text'], re.IGNORECASE)
            label_type = label_match.group(1).upper() if label_match else 'UNKNOWN'
            
            results.append({
                'claim_text': claim['claim_text'],
                'label_type': label_type,
                'similarity': similarity,
                'source': claim['source']
            })
    
    # Sort by similarity and return top results
    results.sort(key=lambda x: x['similarity'], reverse=True)
    return results[:max_results]


def extract_claims_from_session(session_uuid: str) -> List[Dict[str, Any]]:
    """
    Extract all labeled claims from a session file.
    
    Args:
        session_uuid: The session UUID
    
    Returns:
        List of claims with label_type, claim_text, context
    """
    session_file = SESSIONS_DIR / f"{session_uuid}.md"
    
    if not session_file.exists():
        return []
    
    content = session_file.read_text()
    claims = []
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        label_match = re.search(r'\[(KNOWN|INFERRED|UNCERTAIN|UNKNOWN|DREAM)\]', line, re.IGNORECASE)
        if label_match:
            label_type = label_match.group(1).upper()
            
            # Extract context
            context_start = max(0, i - 2)
            context_end = min(len(lines), i + 3)
            context = '\n'.join(lines[context_start:context_end])
            
            claims.append({
                'session_uuid': session_uuid,
                'label_type': label_type,
                'claim_text': line.strip(),
                'context': context
            })
    
    return claims


def list_all_claims() -> List[Dict[str, Any]]:
    """
    List all labeled claims from the entire Janus ledger.
    
    Returns:
        List of claims with session_uuid, label_type, claim_text
    """
    all_claims = []
    
    # Get claims from all sessions
    if SESSIONS_DIR.exists():
        for session_file in SESSIONS_DIR.glob('*.md'):
            session_uuid = session_file.stem
            claims = extract_claims_from_session(session_uuid)
            all_claims.extend(claims)
    
    # Sort by session date (oldest first)
    all_claims.sort(key=lambda x: x['session_uuid'])
    
    return all_claims


def check_resolution_exists(session_uuid: str, claim_text: str, resolutions: List[Any]) -> bool:
    """
    Check if a resolution already exists for this claim.
    
    Args:
        session_uuid: The session UUID
        claim_text: The claim text
        resolutions: List of Resolution objects from storage
    
    Returns:
        True if resolution exists, False otherwise
    """
    for res in resolutions:
        if res.session_uuid == session_uuid and res.claim_text == claim_text:
            return True
    return False
