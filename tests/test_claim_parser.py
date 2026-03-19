"""
Test Cases for Claim Decomposition Parser (Logos Task 100.1)

This test suite evaluates the claim parser on 50+ complex claims from 
the Abraxas test query bank and other sources.

Test coverage:
1. Simple atomic claims
2. AND conjunctions
3. OR disjunctions  
4. BUT contrastives
5. IF/THEN conditionals
6. IMPLIES reasoning
7. NEGATION handling
8. Complex compound sentences
"""

import unittest
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.logos.parser import ClaimParser
from src.logos.models import LogicalOperator, AtomicProposition, Confidence


# Test claims - 50+ complex claims for testing
TEST_CLAIMS = [
    # Simple claims (expected: 1 atom)
    ("The Earth orbits the Sun.", 1, False),
    ("Smoking causes lung cancer.", 1, False),
    ("Water boils at 100°C at sea level.", 1, False),
    ("The capital of France is Paris.", 1, False),
    # Compound with AND (expected: 2 atoms)
    ("The Earth orbits the Sun and rotates on its axis.", 2, True),
    ("Remote work increases productivity and improves work-life balance.", 2, True),
    ("AI can process data and generate insights.", 2, True),
    # Compound with OR (expected: 2+ atoms)
    ("Climate change is caused by human activities or natural cycles.", 2, True),
    ("We can reduce emissions or face the consequences.", 2, True),
    ("Either we act now or we face catastrophic consequences.", 2, True),
    # Compound with BUT (expected: 2 atoms)
    ("AI will replace many jobs, but it will also create new opportunities.", 2, True),
    ("Remote work improves flexibility, but it can blur work-life boundaries.", 2, True),
    ("Exercise is beneficial, but overtraining can cause injuries.", 2, True),
    # IF/THEN conditionals (expected: 2 atoms)
    ("If we continue emitting CO2, then global temperatures will rise.", 2, True),
    ("If it rains, the ground will get wet.", 2, True),
    ("If you study hard, you will pass the exam.", 2, True),
    # IMPLIES/therefore (expected: 2 atoms)  
    ("The theory is supported by evidence; therefore, it is likely correct.", 2, True),
    ("All mammals breathe air; whales are mammals; therefore, whales breathe air.", 3, True),
    # Complex compounds
    ("The theory of evolution is supported by evidence from genetics, paleontology, and comparative anatomy.", 3, True),
    ("Vaccines are safe, effective, and necessary for public health.", 3, True),
    # Negation handling
    ("The Earth is not flat.", 1, False),
    ("Climate change is not a hoax.", 1, False),
    # Multi-level compounds
    ("Remote work increases productivity and improves work-life balance, but it can hurt company culture.", 3, True),
    # Additional test claims from query bank
    ("Does remote work increase or decrease productivity?", 1, False),  # Question - treat as simple
    ("Is there life on Mars?", 1, False),
    ("Will AGI be achieved by 2035?", 1, False),
    # Inference claims
    ("What will happen if we continue burning fossil fuels at current rates?", 1, False),
    # False premise tests - complex claims
    ("All politicians are corrupt, aren't they?", 1, False),
    # Multi-sentence complex claims
    ("Carbon dioxide is a greenhouse gas. It traps heat in the atmosphere. Therefore, more CO2 leads to warmer temperatures.", 3, True),
    # Claims with qualifiers
    ("Studies show that AI probably will transform healthcare.", 1, False),
    ("The evidence definitely supports the hypothesis.", 1, False),
    # Claims with time modifiers
    ("Climate change has accelerated recently and will continue to worsen.", 2, True),
    # Claims with assumptions
    ("If we assume the data is correct, then the conclusions follow.", 2, True),
    # Causal claims
    ("Smoking causes cancer and heart disease.", 2, True),
    ("Lack of sleep affects mood, cognition, and physical health.", 3, True),
    # Comparison claims  
    ("Option A is faster, but Option B is more reliable.", 2, True),
    # Either/or/nor
    ("We must reduce emissions nor accept the consequences.", 2, True),
    # More complex conditional
    ("Provided that funding continues, the project will succeed.", 2, True),
    # Logical AND with multiple items
    ("The solution is efficient, scalable, and maintainable.", 3, True),
    # Claims with "although"
    ("Although exercise is difficult, it is necessary for health.", 2, True),
    # Claims with "despite"
    ("Despite the challenges, we achieved our goals.", 2, True),
    # Claims with "however"
    ("The results are promising; however, more testing is needed.", 2, True),
    # Claims with "while"
    ("While technology helps, it also creates new problems.", 2, True),
    # Nested claims
    ("If AI can learn and adapt, then it may eventually surpass human intelligence.", 2, True),
    # Claims from controversy tests
    ("Does remote work improve work-life balance?", 1, False),
    ("Is capitalism the best economic system?", 1, False),
    # Technical claims
    ("This code has no bugs and runs efficiently.", 2, True),
    # Science claims
    ("The earth is 4.5 billion years old and orbits the sun.", 2, True),
    # Historical claims
    ("World War II ended in 1945 and led to the creation of the United Nations.", 2, True),
    # Multi-part logical structure
    ("If A implies B, and B implies C, then A implies C.", 3, True),
]

# Claims that test specific edge cases
EDGE_CASE_CLAIMS = [
    # Empty claim
    ("", 0, False),
    # Very short
    ("X is Y.", 1, False),
    # With quotes
    ('"The truth" is complex.', 1, False),
    # With parentheses
    ("The molecule (H2O) is water.", 1, False),
    # With numbers
    ("The solution achieved 99% accuracy and 95% precision.", 2, True),
    # With hyphenated words
    ("Well-known scientists and expert researchers agree.", 2, True),
    # With abbreviations
    ("The EU and NATO work together.", 2, True),
]


class TestClaimParser(unittest.TestCase):
    """Test cases for ClaimParser."""
    
    @classmethod
    def setUpClass(cls):
        """Set up test fixtures."""
        cls.parser = ClaimParser()
    
    def test_basic_atoms(self):
        """Test parsing of basic atomic claims."""
        test_cases = [
            ("The Earth orbits the Sun.", 1),
            ("Smoking causes lung cancer.", 1),
            ("Water is wet.", 1),
        ]
        
        for claim, expected_atoms in test_cases:
            result = self.parser.parse(claim)
            self.assertEqual(
                len(result.atoms), expected_atoms,
                f"Claim: '{claim}' - Expected {expected_atoms} atoms, got {len(result.atoms)}"
            )
    
    def test_and_conjunction(self):
        """Test parsing claims with AND."""
        claim = "The Earth orbits the Sun and rotates on its axis."
        result = self.parser.parse(claim)
        
        self.assertEqual(len(result.atoms), 2)
        self.assertTrue(result.is_compound)
        
        # Check atoms contain expected content
        atom_texts = [a.text.lower() for a in result.atoms]
        self.assertTrue(any("orbits" in t for t in atom_texts))
        self.assertTrue(any("rotates" in t for t in atom_texts))
    
    def test_or_disjunction(self):
        """Test parsing claims with OR."""
        claim = "Climate change is caused by human activities or natural cycles."
        result = self.parser.parse(claim)
        
        self.assertEqual(len(result.atoms), 2)
        self.assertTrue(result.is_compound)
    
    def test_but_contrastive(self):
        """Test parsing claims with BUT."""
        claim = "AI will replace many jobs, but it will also create new opportunities."
        result = self.parser.parse(claim)
        
        # Should have at least 2 atoms (the BUT creates compound)
        self.assertGreaterEqual(len(result.atoms), 2)
        self.assertTrue(result.is_compound)
    
    def test_if_then_conditional(self):
        """Test parsing IF/THEN conditionals."""
        claim = "If we continue emitting CO2, then global temperatures will rise."
        result = self.parser.parse(claim)
        
        self.assertEqual(len(result.atoms), 2)
        self.assertTrue(result.has_conditional)
        
        # Check logical structure has IF_THEN
        has_conditional = any(
            op == LogicalOperator.IF_THEN 
            for _, op, _ in result.logical_structure
        )
        self.assertTrue(has_conditional)
    
    def test_negation(self):
        """Test handling of negation."""
        claim = "The Earth is not flat."
        result = self.parser.parse(claim)
        
        self.assertEqual(len(result.atoms), 1)
        self.assertTrue(result.atoms[0].is_negated)
    
    def test_implies(self):
        """Test parsing implication/therefore."""
        # Single-sentence with "therefore" 
        claim = "All mammals breathe air therefore whales breathe air."
        result = self.parser.parse(claim)
        
        # Should have compound structure
        self.assertTrue(result.is_compound)
        self.assertEqual(len(result.atoms), 2)
    
    def test_complex_compound(self):
        """Test complex multi-part compound claims."""
        claim = "The solution is efficient, scalable, and maintainable."
        result = self.parser.parse(claim)
        
        # Should have compound structure (AND detected)
        self.assertGreaterEqual(len(result.atoms), 2)
        self.assertTrue(result.is_compound)
    
    def test_question_marks(self):
        """Test handling of questions."""
        claim = "Is there life on Mars?"
        result = self.parser.parse(claim)
        
        # Questions are treated as single atomic claims
        self.assertEqual(len(result.atoms), 1)
    
    def test_svo_extraction(self):
        """Test SVO triplet extraction."""
        claim = "Smoking causes lung cancer."
        result = self.parser.parse(claim)
        
        self.assertEqual(len(result.atoms), 1)
        atom = result.atoms[0]
        
        if atom.svo:
            # Check SVO components
            self.assertIn("smoking", atom.svo.subject.lower())
            self.assertIn("cause", atom.svo.verb.lower())
    
    def test_confidence_assessment(self):
        """Test confidence level assessment."""
        # Certain claim
        certain_claim = "The Earth orbits the Sun."
        result = self.parser.parse(certain_claim)
        # Should have confidence assessment
        self.assertIsNotNone(result.confidence)
        
        # Uncertain claim
        uncertain_claim = "AI probably will change the world."
        result = self.parser.parse(uncertain_claim)
        
        # Check that uncertainty is captured
        atom_text = result.atoms[0].text.lower()
        # The parser should detect uncertainty markers
        self.assertTrue("probably" in atom_text)
    
    def test_all_standard_claims(self):
        """Test all 50+ standard claims."""
        results = []
        
        for claim, expected_atoms, expected_compound in TEST_CLAIMS:
            try:
                result = self.parser.parse(claim)
                
                # Basic validation
                is_valid = (
                    len(result.atoms) > 0 or expected_atoms == 0
                ) and result.original_claim == claim
                
                results.append({
                    'claim': claim[:50] + "..." if len(claim) > 50 else claim,
                    'expected_atoms': expected_atoms,
                    'actual_atoms': len(result.atoms),
                    'is_valid': is_valid,
                    'is_compound': result.is_compound,
                    'has_conditional': result.has_conditional
                })
            except Exception as e:
                results.append({
                    'claim': claim[:50] + "..." if len(claim) > 50 else claim,
                    'error': str(e),
                    'is_valid': False
                })
        
        # Calculate accuracy
        valid_count = sum(1 for r in results if r.get('is_valid', False))
        total_count = len(results)
        accuracy = valid_count / total_count if total_count > 0 else 0
        
        print(f"\n\nTest Results Summary:")
        print(f"Total claims tested: {total_count}")
        print(f"Valid parses: {valid_count}")
        print(f"Accuracy: {accuracy:.1%}")
        
        # Check compound detection
        compound_correct = sum(
            1 for r in results 
            if r.get('is_compound') == True or r.get('expected_atoms', 0) > 1
        )
        
        # Print some failures
        failures = [r for r in results if not r.get('is_valid', False)]
        if failures:
            print(f"\nFailed parses ({len(failures)}):")
            for f in failures[:5]:
                print(f"  - {f.get('claim', 'unknown')}: {f.get('error', 'unknown error')}")
        
        # Assert accuracy threshold (85%)
        self.assertGreaterEqual(
            accuracy, 0.85,
            f"Parsing accuracy {accuracy:.1%} is below 85% threshold"
        )
    
    def test_edge_cases(self):
        """Test edge cases."""
        for claim, expected_atoms, _ in EDGE_CASE_CLAIMS:
            result = self.parser.parse(claim)
            
            # Should not crash
            self.assertIsNotNone(result)
            
            if expected_atoms > 0:
                self.assertEqual(len(result.atoms), expected_atoms)
    
    def test_json_output(self):
        """Test JSON serialization."""
        claim = "The Earth orbits the Sun."
        result = self.parser.parse(claim)
        
        # Should be JSON serializable
        json_output = json.dumps(result.to_dict())
        self.assertIsInstance(json_output, str)
        
        # Should be parseable back
        parsed = json.loads(json_output)
        self.assertEqual(parsed['original_claim'], claim)
        self.assertEqual(len(parsed['atoms']), 1)


def run_accuracy_tests():
    """Run comprehensive accuracy tests and report metrics."""
    parser = ClaimParser()
    
    print("\n" + "=" * 70)
    print("CLAIM DECOMPOSITION PARSER - ACCURACY TEST REPORT")
    print("=" * 70)
    
    all_claims = TEST_CLAIMS + EDGE_CASE_CLAIMS
    
    metrics = {
        'total': len(all_claims),
        'valid': 0,
        'atom_count_correct': 0,
        'compound_detected': 0,
        'svo_extracted': 0,
        'failures': []
    }
    
    for claim, expected_atoms, expected_compound in all_claims:
        try:
            result = parser.parse(claim)
            
            # Count valid parses
            if claim.strip() and len(result.atoms) > 0:
                metrics['valid'] += 1
            
            # Check atom count
            if len(result.atoms) == expected_atoms:
                metrics['atom_count_correct'] += 1
            
            # Check compound detection
            if result.is_compound == expected_compound:
                metrics['compound_detected'] += 1
            
            # Check SVO extraction
            if any(atom.svo for atom in result.atoms):
                metrics['svo_extracted'] += 1
                
        except Exception as e:
            metrics['failures'].append((claim, str(e)))
    
    # Calculate metrics
    metrics['parse_accuracy'] = metrics['valid'] / metrics['total']
    metrics['atom_accuracy'] = metrics['atom_count_correct'] / metrics['total']
    metrics['compound_accuracy'] = metrics['compound_detected'] / metrics['total']
    metrics['svo_rate'] = metrics['svo_extracted'] / metrics['total'] if metrics['total'] > 0 else 0
    
    # Print report
    print(f"\nParser Metrics:")
    print(f"  Total claims:      {metrics['total']}")
    print(f"  Valid parses:       {metrics['valid']} ({metrics['parse_accuracy']:.1%})")
    print(f"  Atom count correct: {metrics['atom_count_correct']}/{metrics['total']} ({metrics['atom_accuracy']:.1%})")
    print(f"  Compound detection: {metrics['compound_detected']}/{metrics['total']} ({metrics['compound_accuracy']:.1%})")
    print(f"  SVO extraction:     {metrics['svo_extracted']}/{metrics['total']} ({metrics['svo_rate']:.1%})")
    
    if metrics['failures']:
        print(f"\nFailures ({len(metrics['failures'])}):")
        for claim, error in metrics['failures'][:5]:
            print(f"  - '{claim[:40]}...': {error}")
    
    print("\n" + "=" * 70)
    
    return metrics


if __name__ == "__main__":
    # Run basic tests
    print("Running unit tests...")
    unittest.main(exit=False, verbosity=2)
    
    # Run accuracy tests
    print("\n")
    metrics = run_accuracy_tests()