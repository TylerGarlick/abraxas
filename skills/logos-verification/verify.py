#!/usr/bin/env python3
"""
logos-verification/verify.py
Verification logic for the Logos verification layer skill
Integrates with Pheme (fact-checking) and Janus (epistemic labeling)
"""

import json
import os
import re
import hashlib
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Any
from enum import Enum

# Storage paths
HOME = os.path.expanduser("~")
LOGOS_DIR = os.path.join(HOME, ".logos")
CACHE_DIR = os.path.join(LOGOS_DIR, "cache")
HISTORY_FILE = os.path.join(LOGOS_DIR, "verifications.json")

# Ensure directories exist
os.makedirs(LOGOS_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)


class VerificationStatus(str, Enum):
    """Pheme verification statuses"""
    VERIFIED = "VERIFIED"
    CONTRADICTED = "CONTRADICTED"
    UNVERIFIABLE = "UNVERIFIABLE"
    PENDING = "PENDING"
    ERROR = "ERROR"


class JanusLabel(str, Enum):
    """Janus epistemic labels"""
    KNOWN = "KNOWN"
    INFERRED = "INFERRED"
    UNCERTAIN = "UNCERTAIN"
    UNKNOWN = "UNKNOWN"


class AtomType(str, Enum):
    """Atom classification types"""
    FACTUAL = "factual"
    INFERENTIAL = "inferential"
    VALUE = "value"
    UNKNOWN = "unknown"


@dataclass
class VerificationResult:
    """Result of Pheme verification"""
    status: VerificationStatus
    sources: List[str]
    confidence: float
    details: str


@dataclass
class JanusResult:
    """Result of Janus labeling"""
    label: JanusLabel
    reasoning: str
    confidence: float


@dataclass
class AtomVerification:
    """Complete verification result for an atom"""
    atom: str
    atom_type: AtomType
    verification: VerificationResult
    epistemic: JanusResult
    combined_label: str
    verification_label: str
    timestamp: int
    cached: bool = False

    def to_dict(self) -> Dict:
        return {
            "atom": self.atom,
            "atom_type": self.atom_type.value,
            "verification": {
                "status": self.verification.status.value,
                "sources": self.verification.sources,
                "confidence": self.verification.confidence,
                "details": self.verification.details
            },
            "epistemic": {
                "label": self.epistemic.label.value,
                "reasoning": self.epistemic.reasoning,
                "confidence": self.epistemic.confidence
            },
            "combined_label": self.combined_label,
            "verification_label": self.verification_label,
            "timestamp": self.timestamp,
            "cached": self.cached
        }


def get_cache_key(atom: str) -> str:
    """Generate cache key for an atom"""
    return hashlib.sha256(atom.encode()).hexdigest()[:16]


def get_cached(atom: str) -> Optional[Dict]:
    """Get cached verification result"""
    cache_key = get_cache_key(atom)
    cache_file = os.path.join(CACHE_DIR, f"{cache_key}.json")
    
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'r') as f:
                cached = json.load(f)
            # Check if cache is valid (24 hours)
            cache_age = datetime.now().timestamp() - cached.get('timestamp', 0)
            if cache_age < 86400:  # 24 hours
                return cached.get('result')
        except (json.JSONDecodeError, IOError):
            pass
    return None


def cache_result(atom: str, result: Dict) -> None:
    """Cache verification result"""
    cache_key = get_cache_key(atom)
    cache_file = os.path.join(CACHE_DIR, f"{cache_key}.json")
    
    with open(cache_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().timestamp(),
            "atom": atom,
            "result": result
        }, f, indent=2)


def classify_atom(atom: str) -> AtomType:
    """Classify an atom as factual, inferential, or value"""
    lower = atom.lower()
    
    # Factual patterns - includes common verbs that indicate factual claims
    factual_patterns = [
        r'\b(is|are|was|were|has|have|had|does|do|did)\b',
        r'\b(equal|equal to|greater|less|more than|less than)\b',
        r'\b(located|born|died|created|founded|established)\b',
        r'\b(orbits|revolves|rotates|moves|travels)\b',
        r'\d+(\.\d+)?\s*(million|billion|percent|%|degrees?|km|miles?|years?)'
    ]
    
    # Inferential patterns
    inferential_patterns = [
        r'\b(therefore|thus|hence|so|because|since|consequently)\b',
        r'\b(imply|suggest|indicate|mean|show)\b',
        r'\b(probably|likely|possibly|might|may)\b'
    ]
    
    # Value patterns
    value_patterns = [
        r'\b(good|bad|right|wrong|better|worse|best|worst)\b',
        r'\b(should|ought|must|need to)\b',
        r'\b(ethical|moral|fair|just|acceptable)\b'
    ]
    
    # Check in order: inferential (most specific), value, factual (most common)
    # This order matters because statements can contain multiple patterns
    for pattern in inferential_patterns:
        if re.search(pattern, lower):
            return AtomType.INFERENTIAL
    
    for pattern in value_patterns:
        if re.search(pattern, lower):
            return AtomType.VALUE
    
    for pattern in factual_patterns:
        if re.search(pattern, lower):
            return AtomType.FACTUAL
    
    # Default to factual if it looks like a statement
    if '.' in atom or ' is ' in atom or ' are ' in atom:
        return AtomType.FACTUAL
    
    # If still unknown but contains common sentence structure, treat as factual
    # Look for subject-verb patterns like "X causes Y", "X is Y", etc.
    # More lenient matching for any word + space + word with common verb endings
    if re.search(r'\b\w+\s+\w+', lower):
        return AtomType.FACTUAL
    
    return AtomType.UNKNOWN


def call_pheme_api(atom: str) -> VerificationResult:
    """
    Simulate Pheme fact-checking API call.
    In production, this would call the actual Pheme service.
    """
    lower = atom.lower()
    
    # Known verifiable facts (for simulation)
    verified_facts = [
        "the earth orbits the sun",
        "water boils at 100 degrees celsius",
        "paris is the capital of france",
        "humans need oxygen to survive"
    ]
    
    # Known contradicted facts
    contradicted_facts = [
        "the earth is flat",
        "the sun orbits the earth",
        "vaccines cause autism"
    ]
    
    for fact in verified_facts:
        if fact in lower:
            return VerificationResult(
                status=VerificationStatus.VERIFIED,
                sources=["wikipedia.org", "nasa.gov"],
                confidence=0.95,
                details="Confirmed by authoritative sources"
            )
    
    for fact in contradicted_facts:
        if fact in lower:
            return VerificationResult(
                status=VerificationStatus.CONTRADICTED,
                sources=["wikipedia.org", "scientific journals"],
                confidence=0.98,
                details="Contradicted by authoritative sources"
            )
    
    # Default to unverifiable
    return VerificationResult(
        status=VerificationStatus.UNVERIFIABLE,
        sources=[],
        confidence=0.0,
        details="No authoritative sources found for verification"
    )


def apply_janus_label(verification: VerificationResult, atom_type: AtomType) -> JanusResult:
    """Apply Janus epistemic label based on verification result"""
    
    if atom_type == AtomType.FACTUAL:
        if verification.status == VerificationStatus.VERIFIED:
            return JanusResult(
                label=JanusLabel.KNOWN,
                reasoning="Verified by authoritative sources",
                confidence=verification.confidence * 0.95
            )
        elif verification.status == VerificationStatus.CONTRADICTED:
            return JanusResult(
                label=JanusLabel.UNKNOWN,
                reasoning="Contradicted by authoritative sources",
                confidence=verification.confidence * 0.98
            )
        elif verification.status == VerificationStatus.UNVERIFIABLE:
            return JanusResult(
                label=JanusLabel.UNCERTAIN,
                reasoning="Could not verify against authoritative sources",
                confidence=0.3
            )
        else:
            return JanusResult(
                label=JanusLabel.UNCERTAIN,
                reasoning="Verification pending or error",
                confidence=0.1
            )
    
    if atom_type == AtomType.INFERENTIAL:
        return JanusResult(
            label=JanusLabel.INFERRED,
            reasoning="Derived through reasoning from other premises",
            confidence=0.5
        )
    
    if atom_type == AtomType.VALUE:
        return JanusResult(
            label=JanusLabel.UNCERTAIN,
            reasoning="Value judgment not amenable to factual verification",
            confidence=0.2
        )
    
    return JanusResult(
        label=JanusLabel.UNKNOWN,
        reasoning="Unable to determine epistemic status",
        confidence=0.0
    )


def verify_atom(atom: str, skip_cache: bool = False) -> AtomVerification:
    """Verify a single atom"""
    
    # Check cache
    if not skip_cache:
        cached = get_cached(atom)
        if cached:
            return AtomVerification(
                atom=atom,
                atom_type=AtomType(cached['atom_type']),
                verification=VerificationResult(
                    status=VerificationStatus(cached['verification']['status']),
                    sources=cached['verification']['sources'],
                    confidence=cached['verification']['confidence'],
                    details=cached['verification']['details']
                ),
                epistemic=JanusResult(
                    label=JanusLabel(cached['epistemic']['label']),
                    reasoning=cached['epistemic']['reasoning'],
                    confidence=cached['epistemic']['confidence']
                ),
                combined_label=cached['combined_label'],
                verification_label=cached['verification_label'],
                timestamp=cached['timestamp'],
                cached=True
            )
    
    # Classify atom type
    atom_type = classify_atom(atom)
    
    # Verify factual atoms with Pheme
    if atom_type == AtomType.FACTUAL:
        verification = call_pheme_api(atom)
    else:
        verification = VerificationResult(
            status=VerificationStatus.PENDING if atom_type == AtomType.INFERENTIAL else VerificationStatus.UNVERIFIABLE,
            sources=[],
            confidence=0.0,
            details="Not a factual claim - verification skipped"
        )
    
    # Apply Janus labels
    epistemic = apply_janus_label(verification, atom_type)
    
    # Build combined labels
    verification_label = f"[{verification.status.value}]" if verification.status != VerificationStatus.PENDING else ""
    combined_label = f"[{epistemic.label.value}] {verification_label}".strip()
    
    result = AtomVerification(
        atom=atom,
        atom_type=atom_type,
        verification=verification,
        epistemic=epistemic,
        combined_label=combined_label,
        verification_label=verification_label,
        timestamp=int(datetime.now().timestamp()),
        cached=False
    )
    
    # Cache result
    cache_result(atom, {
        "atom_type": atom_type.value,
        "verification": {
            "status": verification.status.value,
            "sources": verification.sources,
            "confidence": verification.confidence,
            "details": verification.details
        },
        "epistemic": {
            "label": epistemic.label.value,
            "reasoning": epistemic.reasoning,
            "confidence": epistemic.confidence
        },
        "combined_label": combined_label,
        "verification_label": verification_label,
        "timestamp": result.timestamp
    })
    
    # Save to history
    save_to_history(result)
    
    return result


def verify(atoms: List[str], skip_cache: bool = False) -> Dict:
    """Verify multiple atoms"""
    results = []
    
    for atom in atoms:
        result = verify_atom(atom, skip_cache)
        results.append(result.to_dict())
    
    return {
        "results": results,
        "summary": generate_summary(results)
    }


def verify_with_fallback(atoms: List[str]) -> Dict:
    """Verify atoms with fallback strategy"""
    results = []
    failed = []
    
    for atom in atoms:
        try:
            result = verify_atom(atom)
            results.append(result.to_dict())
        except Exception as e:
            results.append({
                "atom": atom,
                "error": str(e),
                "verification": {"status": "ERROR"},
                "epistemic": {"label": "UNKNOWN"},
                "combined_label": "[ERROR]",
                "verification_label": "[ERROR]"
            })
            failed.append(atom)
    
    return {
        "results": results,
        "summary": generate_summary(results),
        "fallback_applied": len(failed) > 0,
        "failed_atoms": failed
    }


def generate_summary(results: List[Dict]) -> Dict:
    """Generate summary of verification results"""
    counts = {
        "verified": 0,
        "contradicted": 0,
        "unverifiable": 0,
        "pending": 0,
        "errors": 0,
        "known": 0,
        "inferred": 0,
        "uncertain": 0,
        "unknown": 0
    }
    
    for result in results:
        v = result.get('verification', {}).get('status')
        e = result.get('epistemic', {}).get('label')
        
        if v == 'VERIFIED':
            counts['verified'] += 1
        elif v == 'CONTRADICTED':
            counts['contradicted'] += 1
        elif v == 'UNVERIFIABLE':
            counts['unverifiable'] += 1
        elif v == 'PENDING':
            counts['pending'] += 1
        elif v == 'ERROR':
            counts['errors'] += 1
        
        if e == 'KNOWN':
            counts['known'] += 1
        elif e == 'INFERRED':
            counts['inferred'] += 1
        elif e == 'UNCERTAIN':
            counts['uncertain'] += 1
        elif e == 'UNKNOWN':
            counts['unknown'] += 1
    
    return {
        "total": len(results),
        **counts,
        "breakdown": {
            "by_verification": {
                "verified": counts['verified'],
                "contradicted": counts['contradicted'],
                "unverifiable": counts['unverifiable'],
                "pending": counts['pending'],
                "errors": counts['errors']
            },
            "by_epistemic": {
                "known": counts['known'],
                "inferred": counts['inferred'],
                "uncertain": counts['uncertain'],
                "unknown": counts['unknown']
            }
        }
    }


def save_to_history(result: AtomVerification) -> None:
    """Save verification to history"""
    history = []
    
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
        except (json.JSONDecodeError, IOError):
            history = []
    
    history.insert(0, {
        **result.to_dict(),
        "saved_at": int(datetime.now().timestamp())
    })
    
    # Keep only last 1000
    history = history[:1000]
    
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)


def get_history(limit: int = 50) -> List[Dict]:
    """Get verification history"""
    if not os.path.exists(HISTORY_FILE):
        return []
    
    with open(HISTORY_FILE, 'r') as f:
        history = json.load(f)
    
    return history[:limit]


def clear_cache() -> Dict:
    """Clear verification cache"""
    if not os.path.exists(CACHE_DIR):
        return {"cleared": 0}
    
    cleared = 0
    for filename in os.listdir(CACHE_DIR):
        if filename.endswith('.json'):
            os.remove(os.path.join(CACHE_DIR, filename))
            cleared += 1
    
    return {"cleared": cleared}


if __name__ == "__main__":
    import sys
    
    # Quick test
    if len(sys.argv) > 1:
        atoms = sys.argv[1].split(",")
        result = verify(atoms)
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python verify.py <atom1>,<atom2>,...")