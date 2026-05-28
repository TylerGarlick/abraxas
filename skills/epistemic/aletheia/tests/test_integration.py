"""
Integration Tests for Aletheia System

End-to-end tests for complete workflows
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'python'))

from storage import Resolution, create_header_if_needed, load_resolutions, save_resolution
from resolver import find_claim, fuzzy_search, extract_claims_from_session
from calibration import generate_calibration_report, format_calibration_report
from aletheia import confirm, disconfirm, supersede, status, calibration, queue, audit

import pytest


class TestConfirmWorkflow:
    """Integration tests for confirm workflow"""
    
    def test_full_confirm_workflow(self, tmp_path):
        """End-to-end: claim → confirm → resolution in file"""
        import aletheia
        import storage
        import resolver
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create ledger with claim
        aletheia.LEDGER_FILE.write_text("""
# Janus Ledger

## Session: test-uuid-123

[KNOWN] Water boils at 100°C at sea level
""")
        
        # Create session file
        session_file = aletheia.SESSIONS_DIR / "test-uuid-123.md"
        session_file.write_text("""
# Session Closure Report

[KNOWN] Water boils at 100°C at sea level
""")
        
        # Confirm the claim
        result = confirm("[KNOWN] Water boils at 100°C at sea level")
        
        assert "✓ Confirmed" in result
        assert aletheia.RESOLUTIONS_FILE.exists()
        
        # Verify resolution was saved
        resolutions = load_resolutions()
        assert len(resolutions) == 1
        assert resolutions[0].status == "confirmed"
        assert "Water boils" in resolutions[0].claim_text
        
        aletheia.JANUS_DIR = original_janus
        aletheia.LEDGER_FILE = original_janus / "ledger.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_confirm_existing_resolution(self, tmp_path):
        """Test confirming a claim that's already resolved"""
        import aletheia
        import storage
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create resolution
        create_header_if_needed()
        res = Resolution(
            session_uuid="test-uuid",
            claim_text="[KNOWN] Test claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        save_resolution(res)
        
        # Try to confirm again
        result = confirm("[KNOWN] Test claim")
        
        assert "Resolution already exists" in result
        
        aletheia.JANUS_DIR = original_janus
        aletheia.LEDGER_FILE = original_janus / "ledger.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"


class TestCalibrationReportGeneration:
    """Integration tests for calibration reports"""
    
    def test_calibration_report_with_data(self, tmp_path):
        """Generate report with 100+ resolutions"""
        import aletheia
        import storage
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create many resolutions
        create_header_if_needed()
        
        for i in range(50):
            res = Resolution(
                session_uuid=f"uuid-{i}",
                claim_text=f"[KNOWN] Claim {i}",
                label_type="KNOWN",
                status="confirmed" if i < 45 else "disconfirmed",
                resolution_date="2026-04-21T00:00:00Z"
            )
            save_resolution(res)
        
        for i in range(30):
            res = Resolution(
                session_uuid=f"uuid-{i+50}",
                claim_text=f"[INFERRED] Claim {i+50}",
                label_type="INFERRED",
                status="confirmed" if i < 22 else "disconfirmed",
                resolution_date="2026-04-21T00:00:00Z"
            )
            save_resolution(res)
        
        # Generate report
        result = calibration(period_days=90)
        
        assert "CALIBRATION LEDGER" in result
        assert "[KNOWN]" in result
        assert "[INFERRED]" in result
        assert "90%" in result or "confirmed" in result.lower()
        
        aletheia.JANUS_DIR = original_janus
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"


class TestAuditWorkflow:
    """Integration tests for audit workflow"""
    
    def test_audit_detects_orphans(self, tmp_path):
        """Create orphaned resolution, verify audit detects it"""
        import aletheia
        import storage
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create resolution referencing nonexistent session
        create_header_if_needed()
        res = Resolution(
            session_uuid="deleted-uuid",
            claim_text="[KNOWN] Orphaned claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        save_resolution(res)
        
        # Run audit
        result = audit()
        
        assert "AUDIT REPORT" in result
        assert "ORPHANED" in result or "orphan" in result.lower()
        
        aletheia.JANUS_DIR = original_janus
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"


class TestEdgeCases:
    """Integration tests for edge cases"""
    
    def test_empty_ledger(self, tmp_path):
        """Test all commands with empty ledger"""
        import aletheia
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create empty files
        aletheia.LEDGER_FILE.write_text("# Ledger\n")
        
        # Test status
        result = status()
        assert isinstance(result, str)
        
        # Test queue
        result = queue()
        assert isinstance(result, str)
        
        # Test calibration
        result = calibration()
        assert isinstance(result, str)
        
        # Test audit
        result = audit()
        assert isinstance(result, str)
        
        aletheia.JANUS_DIR = original_janus
        aletheia.LEDGER_FILE = original_janus / "ledger.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_corrupted_resolutions_file(self, tmp_path):
        """Test handling of corrupted resolutions file"""
        import aletheia
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create corrupted file
        aletheia.RESOLUTIONS_FILE.write_text("This is not valid markdown or JSON")
        
        # Should not crash
        result = audit()
        assert isinstance(result, str)
        
        aletheia.JANUS_DIR = original_janus
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"
    
    def test_missing_janus_directory(self, tmp_path):
        """Test handling when ~/.janus doesn't exist"""
        import aletheia
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".nonexistent"
        
        # Should create directory
        result = status()
        
        assert (tmp_path / ".nonexistent").exists()
        
        aletheia.JANUS_DIR = original_janus


class TestDisconfirmWorkflow:
    """Integration tests for disconfirm workflow"""
    
    def test_full_disconfirm_workflow(self, tmp_path):
        """End-to-end: claim → disconfirm → resolution with actual finding"""
        import aletheia
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create ledger with claim
        aletheia.LEDGER_FILE.write_text("""
# Janus Ledger
## Session: test-uuid-456

[INFERRED] Quantum computers will break RSA by 2030
""")
        
        # Create session file
        session_file = aletheia.SESSIONS_DIR / "test-uuid-456.md"
        session_file.write_text("""
# Session Closure Report

[INFERRED] Quantum computers will break RSA by 2030
""")
        
        # Disconfirm the claim
        result = disconfirm(
            "[INFERRED] Quantum computers will break RSA by 2030",
            actual_finding="Current quantum computers cannot threaten RSA; timeline pushed to 2050+"
        )
        
        assert "✗ Disconfirmed" in result
        assert "Actual finding" in result
        assert aletheia.RESOLUTIONS_FILE.exists()
        
        # Verify resolution was saved
        resolutions = load_resolutions()
        assert len(resolutions) == 1
        assert resolutions[0].status == "disconfirmed"
        assert "quantum" in resolutions[0].actual_finding.lower()
        
        aletheia.JANUS_DIR = original_janus
        aletheia.LEDGER_FILE = original_janus / "ledger.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"


class TestSupersedeWorkflow:
    """Integration tests for supersede workflow"""
    
    def test_full_supersede_workflow(self, tmp_path):
        """End-to-end: claim → supersede → resolution with superseded by"""
        import aletheia
        
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create ledger with claim
        aletheia.LEDGER_FILE.write_text("""
# Janus Ledger
## Session: test-uuid-789

[INFERRED] Best text editor for Python: VS Code
""")
        
        # Create session file
        session_file = aletheia.SESSIONS_DIR / "test-uuid-789.md"
        session_file.write_text("""
# Session Closure Report

[INFERRED] Best text editor for Python: VS Code
""")
        
        # Supersede the claim
        result = supersede(
            "[INFERRED] Best text editor for Python: VS Code",
            superseded_by="Best text editor for Python: Neovim (as of 2026)"
        )
        
        assert "⟳ Superseded" in result
        assert "Superseded by" in result
        assert aletheia.RESOLUTIONS_FILE.exists()
        
        # Verify resolution was saved
        resolutions = load_resolutions()
        assert len(resolutions) == 1
        assert resolutions[0].status == "superseded"
        assert "Neovim" in resolutions[0].superseded_by
        
        aletheia.JANUS_DIR = original_janus
        aletheia.LEDGER_FILE = original_janus / "ledger.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
