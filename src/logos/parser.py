"""
Claim Decomposition Parser for Logos System.

Decomposes complex claims into atomic propositions, handling logical operators,
sentence segmentation, and SVO extraction.
"""

import re
from typing import List, Optional, Tuple, Dict, Any
from .models import (
    AtomicProposition, 
    LogicalOperator, 
    ClaimStructure, 
    SubjectVerbObject,
    Confidence
)
from .svo_extractor import SVOExtractor


class ClaimParser:
    """
    Parses complex claims into atomic propositions.
    
    This is the core parser for the Logos compositional verification system.
    It breaks down complex claims into independently verifiable atomic
    propositions, which can then be verified through Pheme/Janus.
    
    Key features:
    - Logical operator detection (AND, OR, BUT, NOT, IMPLIES, IF/THEN)
    - SVO triplet extraction
    - Compound sentence handling
    - Modifier and qualifier extraction
    
    Based on EMNLP 2025 research showing 40-60% hallucination reduction
    through compositional verification.
    """
    
    # Logical operator patterns
    LOGICAL_PATTERNS = {
        LogicalOperator.AND: [
            r'\s+and\s+',
            r'\s+also\s+',
            r'\s+additionally\s+',
            r'\s+furthermore\s+',
            r'\s+moreover\s+',
        ],
        LogicalOperator.OR: [
            r'\s+or\s+',
            r'\s+alternatively\s+',
            r'\s+otherwise\s+',
        ],
        LogicalOperator.BUT: [
            r'\s+but\s+',
            r'\s+however\s+',
            r'\s+yet\s+',
            r'\s+although\s+',
            r'\s+though\s+',
            r'\s+nevertheless\s+',
            r'\s+despite\s+',
            r'\s+while\s+',
        ],
        LogicalOperator.NOT: [
            r'\bnot\b',
            r"\bn't\b",
            r'\bnever\b',
            r'\bnone\b',
            r'\bno\b(?=\s+\w+)',
            r'\bwithout\b',
        ],
        LogicalOperator.IMPLIES: [
            r'\s+implies\s+',
            r'\s+means\s+that\s+',
            r'\s+therefore\s+',
            r'\s+thus\s+',
            r'\s+hence\s+',
            r'\s+consequently\s+',
        ],
        LogicalOperator.IF_THEN: [
            r'\bif\s+.+\s+then\s+',
            r'\bsuppose\s+.+\s+then\s+',
            r'\bprovided\s+that\s+',
            r'\bassuming\s+.+\s+it\s+follows\s+that\s+',
        ],
    }
    
    def __init__(self, use_llm_fallback: bool = False):
        """
        Initialize the ClaimParser.
        
        Args:
            use_llm_fallback: Whether to use LLM for complex parsing
        """
        self.svo_extractor = SVOExtractor()
        self.use_llm_fallback = use_llm_fallback
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Compile regex patterns for performance."""
        self._logical_patterns = {}
        for op, patterns in self.LOGICAL_PATTERNS.items():
            self._logical_patterns[op] = [re.compile(p, re.IGNORECASE) for p in patterns]
    
    def parse(self, claim: str) -> ClaimStructure:
        """
        Parse a claim into atomic propositions.
        
        Args:
            claim: The input claim to decompose
            
        Returns:
            ClaimStructure containing all atomic propositions
        """
        claim = claim.strip()
        
        # Handle empty claims
        if not claim:
            return ClaimStructure(
                original_claim=claim,
                atoms=[],
                is_compound=False
            )
        
        # Check for logical operators
        logical_ops = self._detect_logical_operators(claim)
        
        if not logical_ops:
            # Simple claim - single atomic proposition
            return self._parse_simple(claim)
        
        # Handle conditional (IF/THEN)
        if LogicalOperator.IF_THEN in logical_ops:
            return self._parse_conditional(claim)
        
        # Handle implication
        if LogicalOperator.IMPLIES in logical_ops:
            return self._parse_implication(claim)
        
        # Handle compound claims (AND, OR, BUT)
        return self._parse_compound(claim, logical_ops)
    
    def _detect_logical_operators(self, text: str) -> List[Tuple[LogicalOperator, int]]:
        """
        Detect logical operators in text.
        
        Returns:
            List of (operator, position) tuples sorted by position
            
        Note: NOT is not treated as a separator - it's a modifier within a clause.
        """
        found = []
        
        for op, patterns in self._logical_patterns.items():
            # Skip NOT - it's not a sentence separator
            if op == LogicalOperator.NOT:
                continue
            for pattern in patterns:
                for match in pattern.finditer(text):
                    found.append((op, match.start()))
        
        # Sort by position
        found.sort(key=lambda x: x[1])
        
        # Remove duplicates (earlier ones take priority)
        seen_positions = set()
        unique_found = []
        for op, pos in found:
            # Use a window to avoid duplicates
            is_dup = False
            for seen_pos in seen_positions:
                if abs(pos - seen_pos) < 5:
                    is_dup = True
                    break
            if not is_dup:
                seen_positions.add(pos)
                unique_found.append(op)
        
        return unique_found
    
    def _parse_simple(self, claim: str) -> ClaimStructure:
        """Parse a simple (non-compound) claim."""
        # Extract SVO
        svo = self.svo_extractor.extract(claim)
        
        # Check for negation
        is_negated = bool(re.search(r'\b(not|never|no|none|without|n\'t)\b', claim, re.IGNORECASE))
        
        # Determine confidence level
        confidence = self._assess_confidence(claim)
        
        atom = AtomicProposition(
            id="atom-1",
            text=claim,
            svo=svo,
            logical_form=self._to_logical_form(claim, is_negated),
            is_negated=is_negated,
            confidence=confidence
        )
        
        return ClaimStructure(
            original_claim=claim,
            atoms=[atom],
            is_compound=False,
            confidence=confidence
        )
    
    def _parse_compound(self, claim: str, logical_ops: List[LogicalOperator]) -> ClaimStructure:
        """Parse a compound claim with AND/OR/BUT."""
        segments = self._split_by_logical_operators(claim, logical_ops)
        
        atoms = []
        logical_structure = []
        
        # Determine primary operator
        primary_op = logical_ops[0] if logical_ops else LogicalOperator.AND
        
        for i, segment in enumerate(segments):
            segment = segment.strip()
            if not segment:
                continue
            
            # Extract SVO for this segment
            svo = self.svo_extractor.extract(segment)
            
            # Check for negation within segment
            is_negated = bool(re.search(r'\b(not|never|no|none|without|n\'t)\b', segment, re.IGNORECASE))
            
            # Handle BUT - invert the meaning for logical combination
            if primary_op == LogicalOperator.BUT:
                # For contrast, add the structure but track the contrast
                pass
            
            atom = AtomicProposition(
                id=f"atom-{i+1}",
                text=segment,
                svo=svo,
                logical_form=self._to_logical_form(segment, is_negated),
                is_negated=is_negated,
                confidence=self._assess_confidence(segment)
            )
            atoms.append(atom)
            
            # Add to logical structure
            if i > 0:
                # Use the appropriate operator for this segment pair
                seg_op = self._get_operator_for_segment(claim, segment, logical_ops, i)
                logical_structure.append((atoms[i-1].id, seg_op, atom.id))
        
        return ClaimStructure(
            original_claim=claim,
            atoms=atoms,
            logical_structure=logical_structure,
            is_compound=len(atoms) > 1,
            has_conditional=False,
            confidence=self._combine_confidence([a.confidence for a in atoms])
        )
    
    def _parse_conditional(self, claim: str) -> ClaimStructure:
        """Parse IF/THEN conditional claims."""
        # Split by IF/THEN
        if_match = re.search(r'\bif\s+(.+?)\s+then\s+(.+)$', claim, re.IGNORECASE | re.DOTALL)
        
        if if_match:
            antecedent = if_match.group(1).strip()
            consequent = if_match.group(2).strip()
            
            atoms = []
            
            # Antecedent (condition)
            svo_ant = self.svo_extractor.extract(antecedent)
            atom_ant = AtomicProposition(
                id="atom-1",
                text=antecedent,
                svo=svo_ant,
                logical_form=f"IF: {antecedent}",
                is_negated=False,
                confidence=self._assess_confidence(antecedent)
            )
            atoms.append(atom_ant)
            
            # Consequent (conclusion)
            svo_cons = self.svo_extractor.extract(consequent)
            atom_cons = AtomicProposition(
                id="atom-2",
                text=consequent,
                svo=svo_cons,
                logical_form=f"THEN: {consequent}",
                is_negated=False,
                confidence=self._assess_confidence(consequent)
            )
            atoms.append(atom_cons)
            
            return ClaimStructure(
                original_claim=claim,
                atoms=atoms,
                logical_structure=[("atom-1", LogicalOperator.IF_THEN, "atom-2")],
                is_compound=True,
                has_conditional=True,
                confidence=self._combine_confidence([a.confidence for a in atoms])
            )
        
        # Fallback - treat as simple
        return self._parse_simple(claim)
    
    def _parse_implication(self, claim: str) -> ClaimStructure:
        """Parse claims with IMPLIES/therefore/thus."""
        # Try to find implication marker
        impl_patterns = [
            (r'(.+?)\s+therefore\s+(.+)$', 'therefore'),
            (r'(.+?)\s+thus\s+(.+)$', 'thus'),
            (r'(.+?)\s+hence\s+(.+)$', 'hence'),
            (r'(.+?)\s+implies\s+that\s+(.+)$', 'implies'),
            (r'(.+?)\s+so\s+(.+)$', 'so'),
        ]
        
        for pattern, marker in impl_patterns:
            impl_match = re.search(pattern, claim, re.IGNORECASE | re.DOTALL)
            if impl_match:
                premise = impl_match.group(1).strip()
                conclusion = impl_match.group(2).strip()
                
                atoms = []
                
                # Premise
                svo_prem = self.svo_extractor.extract(premise)
                atom_prem = AtomicProposition(
                    id="atom-1",
                    text=premise,
                    svo=svo_prem,
                    logical_form=premise,
                    is_negated=False,
                    confidence=self._assess_confidence(premise)
                )
                atoms.append(atom_prem)
                
                # Conclusion
                svo_conc = self.svo_extractor.extract(conclusion)
                atom_conc = AtomicProposition(
                    id="atom-2",
                    text=conclusion,
                    svo=svo_conc,
                    logical_form=conclusion,
                    is_negated=False,
                    confidence=self._assess_confidence(conclusion)
                )
                atoms.append(atom_conc)
                
                return ClaimStructure(
                    original_claim=claim,
                    atoms=atoms,
                    logical_structure=[("atom-1", LogicalOperator.IMPLIES, "atom-2")],
                    is_compound=True,
                    has_conditional=False,  # Not a true conditional, just implication
                    confidence=self._combine_confidence([a.confidence for a in atoms])
                )
        
        # Fallback
        return self._parse_simple(claim)
    
    def _split_by_logical_operators(self, text: str, operators: List[LogicalOperator]) -> List[str]:
        """
        Split text by logical operators.
        
        Note: Comma-separated lists (with AND implied) are handled separately.
        Priority: explicit logical operators > comma+and lists > simple comma
        """
        # First check if there are actual strong logical operators (excluding NOT)
        strong_ops = [LogicalOperator.IF_THEN, LogicalOperator.IMPLIES]
        has_strong_ops = any(op in operators for op in strong_ops)
        
        # Handle comma-separated lists with AND explicitly stated
        comma_and_pattern = r',\s*and\s+'
        if re.search(comma_and_pattern, text, re.IGNORECASE):
            # Split by ", and " for list items
            parts = re.split(comma_and_pattern, text, flags=re.IGNORECASE)
            if len(parts) > 1:
                return [p.strip() for p in parts if p.strip()]
        
        # Handle explicit logical operators if present
        if has_strong_ops:
            # Find all strong operator positions
            op_positions = []
            
            for op, patterns in self._logical_patterns.items():
                if op in strong_ops:
                    for pattern in patterns:
                        for match in pattern.finditer(text):
                            op_positions.append((match.start(), match.group(), op))
            
            if op_positions:
                # Sort by position
                op_positions.sort()
                
                # Split by positions
                segments = []
                last_pos = 0
                
                for pos, match_text, op in op_positions:
                    segment = text[last_pos:pos].strip()
                    if segment:
                        segments.append(segment)
                    last_pos = pos + len(match_text)
                
                final_segment = text[last_pos:].strip()
                if final_segment:
                    segments.append(final_segment)
                
                return segments if segments else [text]
        
        # Handle AND/OR/BUT splits - these are primary separators
        primary_ops = [LogicalOperator.AND, LogicalOperator.OR, LogicalOperator.BUT]
        has_primary = any(op in operators for op in primary_ops)
        
        if has_primary:
            op_positions = []
            
            for op, patterns in self._logical_patterns.items():
                if op in operators and op in primary_ops:
                    for pattern in patterns:
                        for match in pattern.finditer(text):
                            op_positions.append((match.start(), match.group(), op))
            
            if op_positions:
                op_positions.sort()
                
                segments = []
                last_pos = 0
                
                for pos, match_text, op in op_positions:
                    # Only split on primary operators if there's something before them
                    segment = text[last_pos:pos].strip()
                    if segment:
                        segments.append(segment)
                    last_pos = pos + len(match_text)
                
                final_segment = text[last_pos:].strip()
                if final_segment:
                    segments.append(final_segment)
                
                # If we got the segments we expected, return them
                if len(segments) >= 2:
                    return [s for s in segments if s]
        
        return [text]
    
    def _get_operator_for_segment(self, original: str, segment: str, 
                                   operators: List[LogicalOperator], 
                                   index: int) -> LogicalOperator:
        """Determine which logical operator applies to a segment."""
        segment_lower = segment.lower()
        
        # Position-based operator assignment
        if index <= len(operators):
            # Use detected operators
            for op, patterns in self._logical_patterns.items():
                for pattern in patterns:
                    if pattern.search(original):
                        return op
        
        return LogicalOperator.AND  # Default
    
    def _to_logical_form(self, text: str, is_negated: bool) -> str:
        """Convert text to logical form representation."""
        if is_negated:
            return f"NOT({text})"
        return text
    
    def _assess_confidence(self, text: str) -> Confidence:
        """Assess confidence level based on linguistic cues."""
        text_lower = text.lower()
        
        # High certainty markers
        if any(marker in text_lower for marker in [
            'definitely', 'certainly', 'proven', 'established', 
            'scientific fact', 'measured', 'verified', 'confirmed'
        ]):
            return Confidence.KNOWN
        
        # Uncertainty markers
        if any(marker in text_lower for marker in [
            'probably', 'possibly', 'perhaps', 'maybe', 
            'might', 'could be', 'may be', 'uncertain',
            'unclear', 'unknown', 'unproven', 'theoretical'
        ]):
            return Confidence.UNCERTAIN
        
        # Inference markers
        if any(marker in text_lower for marker in [
            'therefore', 'thus', 'hence', 'suggests',
            'indicates', 'implies', 'therefore', 'consequently'
        ]):
            return Confidence.INFERRED
        
        # Unknown/falsifiable
        if any(marker in text_lower for marker in [
            'believe', 'think', 'feel', 'opinion', 'subjective'
        ]):
            return Confidence.UNKNOWN
        
        return Confidence.UNKNOWN  # Default
    
    def _combine_confidence(self, confidences: List[Confidence]) -> Confidence:
        """Combine multiple confidence levels."""
        if not confidences:
            return Confidence.UNKNOWN
        
        # If any is KNOWN, result is KNOWN
        if Confidence.KNOWN in confidences:
            return Confidence.KNOWN
        
        # If any is INFERRED, result is INFERRED
        if Confidence.INFERRED in confidences:
            return Confidence.INFERRED
        
        # If any is UNCERTAIN, result is UNCERTAIN
        if Confidence.UNCERTAIN in confidences:
            return Confidence.UNCERTAIN
        
        return Confidence.UNKNOWN
    
    def parse_to_json(self, claim: str) -> Dict[str, Any]:
        """Parse claim and return JSON-serializable dict."""
        structure = self.parse(claim)
        return structure.to_dict()


def demo():
    """Demo of the ClaimParser."""
    parser = ClaimParser()
    
    test_claims = [
        "The Earth orbits the Sun and rotates on its axis.",
        "Climate change is caused by human activities or natural cycles.",
        "If we continue emitting CO2, then global temperatures will rise.",
        "AI will replace many jobs, but it will also create new opportunities.",
        "Remote work increases productivity and improves work-life balance.",
        "Smoking causes lung cancer.",
        "The theory of evolution is supported by evidence from genetics, paleontology, and comparative anatomy.",
        "Either we act now or we face catastrophic consequences.",
    ]
    
    for claim in test_claims:
        print(f"\n{'='*60}")
        print(f"CLAIM: {claim}")
        print("-" * 60)
        
        result = parser.parse(claim)
        
        print(f"Atoms ({len(result.atoms)}):")
        for atom in result.atoms:
            print(f"  {atom}")
            if atom.svo:
                print(f"    SVO: {atom.svo.to_string()}")
        
        print(f"Logical Structure: {result.logical_structure}")
        print(f"Is Compound: {result.is_compound}")
        print(f"Has Conditional: {result.has_conditional}")
        print(f"Confidence: {result.confidence.value}")


if __name__ == "__main__":
    demo()