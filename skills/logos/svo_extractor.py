"""
SVO (Subject-Verb-Object) Extraction Module.

Extracts subject-verb-object triplets from sentences using pattern matching
and linguistic heuristics. Designed to work without heavy NLP dependencies.
"""

import re
from typing import List, Optional, Tuple
from .models import SubjectVerbObject


class SVOExtractor:
    """
    Extracts Subject-Verb-Object triplets from English sentences.
    
    Uses pattern-based extraction with support for:
    - Passive voice
    - Modal verbs
    - Compound subjects/objects
    - Modifiers and qualifiers
    """
    
    # Common verbs that form good SVO structures
    LINKING_VERBS = {'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'}
    MODAL_VERBS = {'can', 'could', 'may', 'might', 'will', 'would', 'shall', 'should', 'must'}
    
    # Patterns for finding subjects and objects
    SUBJ_PATTERNS = [
        r'^(?:(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their)\s+)?'
        r'(?:(?:well\-known|famous|popular|important|big|large|small|new|old|young|recent|early)\s+)?'
        r'(?:[\w\-\']+(?:\s+[\w\-\']+)*?)\s+(?:person|people|team|company|government|scientist|researcher|theory|claim|argument|evidence|fact|data|result|study|experiment|observation)',
        r'^(?:the|a|an|this|that|these|those|my|your|his|her|its|our|their)\s+[\w\-\']+(?:\s+[\w\-\']+)*',
        r'^[\w\-\']+(?:\s+[\w\-\']+)*?(?=\s+(?:is|are|was|were|will|would|can|could|may|might|has|have|had|does|do|did|will|would|shall|should|must))',
    ]
    
    def __init__(self):
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Compile regex patterns for performance."""
        self._subj_patterns = [re.compile(p, re.IGNORECASE) for p in self.SUBJ_PATTERNS]
        
        # Verb patterns
        self._verb_pattern = re.compile(
            r'\b(is|are|was|were|be|been|being|have|has|had|do|does|did|'
            r'will|would|shall|should|can|could|may|might|must|'
            r'seem|appear|become|get|remain|keep|turn|prove|show|indicate|suggest|'
            r'claim|argue|believe|think|know|understand|mean|represent|'
            r'use|apply|require|involve|include|contain|lead|cause|result|'
            r'affect|influence|impact|change|increase|decrease|improve|reduce|'
            r'create|build|make|develop|produce|design|implement|establish|'
            r'discover|find|observe|measure|test|verify|confirm|establish|demonstrate|'
            r'state|declare|assert|claim|propose|hypothesize|suggest|believe|'
            r'require|depend|relate|connect|associate|compare|differ|from|with|in|on|at|to|for|of)\b',
            re.IGNORECASE
        )
        
        # Passive voice pattern
        self._passive_pattern = re.compile(
            r'\b(is|are|was|were|be|been|being)\s+(?:not\s+)?(\w+ed)\b',
            re.IGNORECASE
        )
    
    def extract(self, sentence: str) -> Optional[SubjectVerbObject]:
        """
        Extract SVO triplet from a sentence.
        
        Args:
            sentence: Input sentence to extract from
            
        Returns:
            SubjectVerbObject if extraction successful, None otherwise
        """
        sentence = sentence.strip()
        if not sentence:
            return None
            
        # Handle simple "X is Y" patterns
        simple_result = self._extract_simple_copular(sentence)
        if simple_result:
            return simple_result
        
        # Extract verb
        verb = self._extract_verb(sentence)
        if not verb:
            return None
            
        # Extract subject (before verb)
        subject = self._extract_subject(sentence, verb)
        if not subject:
            # Try to extract from the beginning
            subject = self._extract_subject_fallback(sentence)
            
        # Extract object (after verb)
        obj = self._extract_object(sentence, verb)
        
        if subject and obj:
            return SubjectVerbObject(
                subject=subject.strip(),
                verb=verb.strip(),
                object=obj.strip(),
                modifiers=self._extract_modifiers(sentence),
                qualifiers=self._extract_qualifiers(sentence)
            )
        
        return None
    
    def _extract_simple_copular(self, sentence: str) -> Optional[SubjectVerbObject]:
        """Handle simple copular sentences like 'X is Y'."""
        # X is Y pattern
        copular_match = re.match(
            r'^(.+?)\s+(is|are|was|were)\s+(.+?)$',
            sentence,
            re.IGNORECASE
        )
        if copular_match:
            subject, copula, complement = copular_match.groups()
            # Check it's not a question
            if '?' not in sentence:
                return SubjectVerbObject(
                    subject=subject.strip(),
                    verb=f"is/are ({copula})",
                    object=complement.strip(),
                    modifiers=[],
                    qualifiers=[]
                )
        return None
    
    def _extract_verb(self, sentence: str) -> Optional[str]:
        """Extract the main verb from a sentence."""
        # Look for the first significant verb
        verbs = self._verb_pattern.findall(sentence)
        if verbs:
            return verbs[0]
        return None
    
    def _extract_subject(self, sentence: str, verb: str) -> Optional[str]:
        """Extract subject (before verb)."""
        # Find position of verb
        verb_pos = sentence.lower().find(verb.lower())
        if verb_pos == -1:
            return None
            
        # Get text before verb
        before_verb = sentence[:verb_pos].strip()
        
        # Find the last noun phrase before verb (usually the subject)
        # Remove common starting words
        before_verb = re.sub(r'^(?:that|which|who|whom|whether|if)\s+', '', before_verb, flags=re.IGNORECASE)
        
        if before_verb:
            # Take the last significant phrase
            parts = before_verb.split(',')
            subject = parts[-1].strip()
            
            # Clean up
            subject = re.sub(r'^(?:the|a|an|this|that|these|those)\s+', '', subject, flags=re.IGNORECASE)
            
            if subject and len(subject) > 1:
                return subject
                
        return before_verb if before_verb else None
    
    def _extract_subject_fallback(self, sentence: str) -> Optional[str]:
        """Fallback method to extract subject."""
        # Remove common starting phrases
        cleaned = re.sub(
            r'^(?:I|we|you|they|he|she|it|the|a|an|this|that|these|those|my|your|his|her|its|our|their)\s+',
            '',
            sentence,
            flags=re.IGNORECASE
        )
        
        # Get first few words as subject
        words = cleaned.split()
        if len(words) >= 2:
            return ' '.join(words[:2])
        elif words:
            return words[0]
        return None
    
    def _extract_object(self, sentence: str, verb: str) -> Optional[str]:
        """Extract object (after verb)."""
        # Find position of verb
        verb_pos = sentence.lower().find(verb.lower())
        if verb_pos == -1:
            return None
            
        # Get text after verb
        after_verb = sentence[verb_pos + len(verb):].strip()
        
        if not after_verb:
            return None
            
        # Remove common suffixes
        after_verb = re.sub(r'^[,\s]+', '', after_verb)
        
        # Handle conjunction - take first part
        for conj in [' and ', ' but ', ' or ', ' so ', ' yet ', ' because ', ' although ', ' though ', ' while ']:
            if conj in after_verb.lower():
                parts = after_verb.lower().split(conj)
                after_verb = parts[0]
                break
        
        # Remove trailing punctuation
        after_verb = re.sub(r'[.,;:!?]+$', '', after_verb)
        
        if after_verb and len(after_verb) > 1:
            return after_verb
            
        return after_verb
    
    def _extract_modifiers(self, sentence: str) -> List[str]:
        """Extract adverbial modifiers."""
        modifiers = []
        
        # Time modifiers
        time_patterns = [
            r'\b(always|often|usually|sometimes|rarely|never)\b',
            r'\b(yesterday|today|tomorrow|last\s+\w+|next\s+\w+)\b',
            r'\b(in\s+\d+|in\s+the\s+\w+|during\s+the|at\s+the)\b',
        ]
        
        for pattern in time_patterns:
            matches = re.findall(pattern, sentence, re.IGNORECASE)
            modifiers.extend(matches)
        
        return list(set(modifiers))
    
    def _extract_qualifiers(self, sentence: str) -> List[str]:
        """Extract qualifiers like epistemic markers."""
        qualifiers = []
        
        # Confidence/uncertainty markers
        qual_patterns = [
            r'\b(probably|possibly|perhaps|maybe|definitely|certainly|likely|unlikely)\b',
            r'\b(I\s+think|I\s+believe|I\s+know|I\s+assume)\b',
            r'\b(according\s+to|studies\s+show|research\s+indicates|evidence\s+suggests)\b',
        ]
        
        for pattern in qual_patterns:
            matches = re.findall(pattern, sentence, re.IGNORECASE)
            qualifiers.extend(matches)
            
        return list(set(qualifiers))
    
    def extract_batch(self, sentences: List[str]) -> List[Optional[SubjectVerbObject]]:
        """
        Extract SVO triplets from multiple sentences.
        
        Args:
            sentences: List of sentences to extract from
            
        Returns:
            List of SubjectVerbObject (or None if extraction failed)
        """
        return [self.extract(s) for s in sentences]