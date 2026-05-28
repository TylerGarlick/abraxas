"""
Unit Tests for Aletheia Resolver

Tests for resolver.py - Claim matching, fuzzy search, label validation
"""

import os
import sys
import tempfile
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'python'))

from resolver import (
    validate_sol_label, find_claim_in_ledger, find_claim_in_sessions,
    find_claim, fuzzy_search, extract_claims_from_session,
    list_all_claims, check_resolution_exists,
    SOL_LABELS, DREAM_LABEL, JANUS_DIR, LEDGER_FILE, SESSIONS_DIR
)

import pytest


class TestLabelValidation:
    """Tests for Sol-mode label validation"""
    
    def test_validate_known_label(self):
        """Test [KNOWN] is valid Sol label"""
        is_valid, error = validate_sol_label("KNOWN")
        assert is_valid == True
        assert error == ""
    
    def test_validate_inferred_label(self):
        """Test [INFERRED] is valid Sol label"""
        is_valid, error = validate_sol_label("INFERRED")
        assert is_valid == True
        assert error == ""
    
    def test_validate_uncertain_label(self):
        """Test [UNCERTAIN] is valid Sol label"""
        is_valid, error = validate_sol_label("UNCERTAIN")
        assert is_valid == True
        assert error == ""
    
    def test_validate_unknown_label(self):
        """Test [UNKNOWN] is valid Sol label"""
        is_valid, error = validate_sol_label("UNKNOWN")
        assert is_valid == True
        assert error == ""
    
    def test_reject_dream_label(self):
        """Test [DREAM] is rejected"""
        is_valid, error = validate_sol_label("DREAM")
        assert is_valid == False
        assert "Cannot resolve [DREAM] material" in error
    
    def test_reject_unknown_label_type(self):
        """Test unknown label types are rejected"""
        is_valid, error = validate_sol_label("INVALID")
        assert is_valid == False
        assert "Unknown label type" in error
    
    def test_validate_with_brackets(self):
        """Test labels with brackets are handled"""
        is_valid, error = validate_sol_label("[KNOWN]")
        assert is_valid == True
    
    def test_validate_case_insensitive(self):
        """Test label validation is case-insensitive"""
        is_valid, error = validate_sol_label("known")
        assert is_valid == True


class TestClaimSearch:
    """Tests for claim search functionality"""
    
    def test_find_claim_in_nonexistent_ledger(self, tmp_path):
        """Test find_claim_in_ledger returns None for missing file"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        
        result = find_claim_in_ledger("[KNOWN] Test claim")
        
        assert result is None
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
    
    def test_find_claim_exact_match(self, tmp_path):
        """Test find_claim_in_ledger finds exact match"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        resolver.JANUS_DIR.mkdir(parents=True, exist_ok=True)
        
        content = """
# Janus Ledger

## Session: test-uuid-123

[KNOWN] Water boils at 100°C at sea level
[INFERRED] AI scaling will continue through 2027
"""
        resolver.LEDGER_FILE.write_text(content)
        
        result = find_claim_in_ledger("Water boils at 100°C")
        
        assert result is not None
        assert result['label_type'] == 'KNOWN'
        assert 'Water boils at 100°C' in result['claim_text']
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
    
    def test_find_claim_case_insensitive(self, tmp_path):
        """Test find_claim_in_ledger is case-insensitive"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        resolver.JANUS_DIR.mkdir(parents=True, exist_ok=True)
        
        content = """
# Janus Ledger
## Session: test-uuid

[KNOWN] Water boils at 100°C
"""
        resolver.LEDGER_FILE.write_text(content)
        
        result = find_claim_in_ledger("water boils")
        
        assert result is not None
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
    
    def test_find_claim_in_sessions(self, tmp_path):
        """Test find_claim_in_sessions searches session files"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        session_content = """
# Session Closure Report

## Labeled Claims

[INFERRED] Remote work will remain >30% of tech jobs
[UNCERTAIN] Market conditions may shift
"""
        session_file = resolver.SESSIONS_DIR / "test-uuid-456.md"
        session_file.write_text(session_content)
        
        result = find_claim_in_sessions("Remote work")
        
        assert result is not None
        assert result['session_uuid'] == 'test-uuid-456'
        assert result['label_type'] == 'INFERRED'
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
        resolver.SESSIONS_DIR = original_janus / "sessions"
    
    def test_find_claim_with_session_filter(self, tmp_path):
        """Test find_claim_in_sessions respects session filter"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        # Create two sessions
        session1 = resolver.SESSIONS_DIR / "uuid-1.md"
        session1.write_text("[KNOWN] Claim in session 1")
        
        session2 = resolver.SESSIONS_DIR / "uuid-2.md"
        session2.write_text("[KNOWN] Claim in session 2")
        
        # Search only session 1
        result = find_claim_in_sessions("Claim", session_uuid="uuid-1")
        
        assert result is not None
        assert result['session_uuid'] == 'uuid-1'
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
        resolver.SESSIONS_DIR = original_janus / "sessions"


class TestFuzzySearch:
    """Tests for fuzzy claim matching"""
    
    def test_fuzzy_search_no_matches(self, tmp_path):
        """Test fuzzy_search returns empty list with no matches"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        resolver.LEDGER_FILE.write_text("# Ledger\n\n[KNOWN] Water boils at 100°C")
        
        results = fuzzy_search("Completely unrelated topic xyz123")
        
        assert results == []
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
        resolver.SESSIONS_DIR = original_janus / "sessions"
    
    def test_fuzzy_search_finds_similar(self, tmp_path):
        """Test fuzzy_search finds similar claims"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        resolver.LEDGER_FILE.write_text("""
# Ledger
## Session: test-uuid

[KNOWN] Climate feedback loops accelerate warming
[INFERRED] Arctic ice will decline by 2030
""")
        
        # Search with typo/variation
        results = fuzzy_search("Climate feedback loop accelerates")
        
        assert len(results) > 0
        assert 'Climate feedback' in results[0]['claim_text']
        assert results[0]['similarity'] > 0.6
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
        resolver.SESSIONS_DIR = original_janus / "sessions"
    
    def test_fuzzy_search_respects_threshold(self, tmp_path):
        """Test fuzzy_search respects similarity threshold"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        resolver.LEDGER_FILE.write_text("""
# Ledger
## Session: test-uuid

[KNOWN] Water boils at 100°C
[INFERRED] AI scaling continues
""")
        
        # Very high threshold should return fewer results
        results_high = fuzzy_search("Water boils", threshold=0.9)
        results_low = fuzzy_search("Water boils", threshold=0.5)
        
        assert len(results_high) <= len(results_low)
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
        resolver.SESSIONS_DIR = original_janus / "sessions"
    
    def test_fuzzy_search_max_results(self, tmp_path):
        """Test fuzzy_search limits results"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        # Create many similar claims
        content = "# Ledger\n## Session: test-uuid\n\n"
        for i in range(20):
            content += f"[KNOWN] Test claim number {i}\n"
        
        resolver.LEDGER_FILE.write_text(content)
        
        results = fuzzy_search("Test claim", max_results=5)
        
        assert len(results) <= 5
        
        resolver.JANUS_DIR = original_janus
        resolver.LEDGER_FILE = original_janus / "ledger.md"
        resolver.SESSIONS_DIR = original_janus / "sessions"


class TestSessionExtraction:
    """Tests for extracting claims from sessions"""
    
    def test_extract_claims_from_session(self, tmp_path):
        """Test extract_claims_from_session parses all claims"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        session_content = """
# Session Closure Report

## Session Info
Session UUID: test-uuid-789

## Labeled Claims

[KNOWN] First known fact
[INFERRED] First inference
[UNCERTAIN] First uncertainty
[UNKNOWN] First unknown
[DREAM] Dream content (should be excluded from resolution)
"""
        session_file = resolver.SESSIONS_DIR / "test-uuid-789.md"
        session_file.write_text(session_content)
        
        claims = extract_claims_from_session("test-uuid-789")
        
        assert len(claims) == 5  # All labels including DREAM
        labels = [c['label_type'] for c in claims]
        assert 'KNOWN' in labels
        assert 'INFERRED' in labels
        assert 'UNCERTAIN' in labels
        assert 'UNKNOWN' in labels
        assert 'DREAM' in labels
        
        resolver.JANUS_DIR = original_janus
        resolver.SESSIONS_DIR = original_janus / "sessions"
    
    def test_extract_claims_from_nonexistent_session(self, tmp_path):
        """Test extract_claims_from_session returns empty for missing"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        claims = extract_claims_from_session("nonexistent-uuid")
        
        assert claims == []
        
        resolver.JANUS_DIR = original_janus
        resolver.SESSIONS_DIR = original_janus / "sessions"


class TestListAllClaims:
    """Tests for listing all claims"""
    
    def test_list_all_claims_empty(self, tmp_path):
        """Test list_all_claims with no sessions"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        claims = list_all_claims()
        
        assert claims == []
        
        resolver.JANUS_DIR = original_janus
        resolver.SESSIONS_DIR = original_janus / "sessions"
    
    def test_list_all_claims_sorted(self, tmp_path):
        """Test list_all_claims returns sorted results"""
        import resolver
        original_janus = resolver.JANUS_DIR
        resolver.JANUS_DIR = tmp_path / ".janus"
        resolver.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        resolver.SESSIONS_DIR.mkdir(parents=True)
        
        # Create sessions with different UUIDs (dates)
        session1 = resolver.SESSIONS_DIR / "2026-01-01-uuid.md"
        session1.write_text("[KNOWN] Old claim")
        
        session2 = resolver.SESSIONS_DIR / "2026-04-01-uuid.md"
        session2.write_text("[KNOWN] New claim")
        
        claims = list_all_claims()
        
        assert len(claims) == 2
        # Should be sorted by session UUID (oldest first)
        assert '2026-01-01' in claims[0]['session_uuid']
        assert '2026-04-01' in claims[1]['session_uuid']
        
        resolver.JANUS_DIR = original_janus
        resolver.SESSIONS_DIR = original_janus / "sessions"


class TestResolutionExists:
    """Tests for checking if resolution exists"""
    
    def test_check_resolution_exists_found(self, tmp_path):
        """Test check_resolution_exists finds existing"""
        import resolver
        from storage import Resolution
        
        # Mock resolutions
        mock_resolutions = [
            Resolution(
                session_uuid="test-uuid",
                claim_text="[KNOWN] Test claim",
                label_type="KNOWN",
                status="confirmed",
                resolution_date="2026-04-21T00:00:00Z"
            )
        ]
        
        exists = check_resolution_exists("test-uuid", "[KNOWN] Test claim", mock_resolutions)
        
        assert exists == True
    
    def test_check_resolution_exists_not_found(self, tmp_path):
        """Test check_resolution_exists returns False for missing"""
        import resolver
        from storage import Resolution
        
        mock_resolutions = [
            Resolution(
                session_uuid="test-uuid",
                claim_text="[KNOWN] Different claim",
                label_type="KNOWN",
                status="confirmed",
                resolution_date="2026-04-21T00:00:00Z"
            )
        ]
        
        exists = check_resolution_exists("test-uuid", "[KNOWN] Test claim", mock_resolutions)
        
        assert exists == False


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
