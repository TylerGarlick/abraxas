"""
Data models for Claim Decomposition Parser.

Defines the core data structures used throughout the Logos parser.
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Optional, List


class LogicalOperator(Enum):
    """Represents logical operators in compound claims."""
    AND = "AND"           # Conjunction
    OR = "OR"             # Disjunction
    BUT = "BUT"           # Contrastive conjunction
    NOT = "NOT"           # Negation
    IMPLIES = "IMPLIES"   # Conditional
    IF_THEN = "IF_THEN"   # Implication
    NONE = "NONE"         # Single atomic claim


class Confidence(Enum):
    """Confidence levels for propositions based on Janus labeling."""
    KNOWN = "[KNOWN]"           # High confidence, verified fact
    INFERRED = "[INFERRED]"     # Derived from other premises
    UNCERTAIN = "[UNCERTAIN]"  # Ambiguous or partial evidence
    UNKNOWN = "[UNKNOWN]"       # No evidence or unfalsifiable


@dataclass
class SubjectVerbObject:
    """Subject-Verb-Object triplet representation."""
    subject: str
    verb: str
    object: str
    modifiers: List[str] = field(default_factory=list)
    qualifiers: List[str] = field(default_factory=list)
    
    def to_string(self) -> str:
        """Convert SVO triplet to string representation."""
        parts = [self.subject, self.verb, self.object]
        if self.modifiers:
            parts.append(f"({', '.join(self.modifiers)})")
        if self.qualifiers:
            parts.append(f"[{', '.join(self.qualifiers)}]")
        return " | ".join(parts)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "subject": self.subject,
            "verb": self.verb,
            "object": self.object,
            "modifiers": self.modifiers,
            "qualifiers": self.qualifiers
        }


@dataclass 
class AtomicProposition:
    """
    Represents an atomic (indivisible) proposition.
    
    This is the smallest unit of verification - each atomic proposition
    can be verified independently.
    """
    id: str                           # Unique identifier (e.g., "atom-1")
    text: str                         # Original text of the proposition
    svo: Optional[SubjectVerbObject] = None  # SVO structure if extractable
    logical_form: str = ""            # Logical form representation
    is_negated: bool = False          # Whether proposition is negated
    confidence: Confidence = Confidence.UNKNOWN
    
    def __str__(self) -> str:
        neg = "NOT " if self.is_negated else ""
        svo_str = f" ({self.svo.to_string()})" if self.svo else ""
        return f"{self.id}: {neg}{self.text}{svo_str}"
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "text": self.text,
            "svo": self.svo.to_dict() if self.svo else None,
            "logical_form": self.logical_form,
            "is_negated": self.is_negated,
            "confidence": self.confidence.value
        }


@dataclass
class ClaimStructure:
    """
    The complete structured representation of a decomposed claim.
    
    Contains all atomic propositions and the logical structure connecting them.
    """
    original_claim: str                      # Original input claim
    atoms: List[AtomicProposition] = field(default_factory=list)
    logical_structure: List[tuple] = field(default_factory=list)  # [(atom_id, operator, atom_id), ...]
    is_compound: bool = False                # Whether claim has multiple atoms
    has_conditional: bool = False            # Whether contains IF/THEN
    confidence: Confidence = Confidence.UNKNOWN
    
    def get_atom_by_id(self, atom_id: str) -> Optional[AtomicProposition]:
        """Find an atom by its ID."""
        for atom in self.atoms:
            if atom.id == atom_id:
                return atom
        return None
    
    def get_all_texts(self) -> List[str]:
        """Get all atomic proposition texts."""
        return [atom.text for atom in self.atoms]
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "original_claim": self.original_claim,
            "atoms": [atom.to_dict() for atom in self.atoms],
            "logical_structure": [
                {"left": str(l), "operator": op.value, "right": str(r)}
                for l, op, r in self.logical_structure
            ],
            "is_compound": self.is_compound,
            "has_conditional": self.has_conditional,
            "confidence": self.confidence.value
        }