"""
Unit Tests for Aletheia Main Module

Tests for aletheia.py - Command handlers
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'python'))

from aletheia import (
    confirm, disconfirm, supersede, status, calibration, queue, audit
)

import pytest


class TestConfirmCommand:
    """Tests for /aletheia confirm command"""
    
    def test_confirm_no_claims(self, tmp_path):
        """Test confirm with no claims in ledger"""
        import aletheia
        import resolver
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        result = confirm()
        
        assert "No unresolved claims found" in result or "Unresolved claims" in result
        
        aletheia.JANUS_DIR = original_janus
        aletheia.SESSIONS_DIR = original_janus / "sessions"
    
    def test_confirm_claim_not_found(self, tmp_path):
        """Test confirm with nonexistent claim"""
        import aletheia
        import resolver
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.LEDGER_FILE = tmp_path / ".janus" / "ledger.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        # Create empty ledger
        aletheia.LEDGER_FILE.write_text("# Ledger\n")
        
        result = confirm("Nonexistent claim")
        
        assert "Cannot find claim" in result or "Claim not found" in result
        
        aletheia.JANUS_DIR = original_janus
        aletheia.LEDGER_FILE = original_janus / "ledger.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"


class TestDisconfirmCommand:
    """Tests for /aletheia disconfirm command"""
    
    def test_disconfirm_requires_actual_finding(self, tmp_path):
        """Test disconfirm requires --actual-finding"""
        import aletheia
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        result = disconfirm("Test claim")
        
        assert "actual-finding is required" in result.lower()
        
        aletheia.JANUS_DIR = original_janus
        aletheia.SESSIONS_DIR = original_janus / "sessions"


class TestSupersedeCommand:
    """Tests for /aletheia supersede command"""
    
    def test_supersede_requires_superseded_by(self, tmp_path):
        """Test supersede requires --superseded-by"""
        import aletheia
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        result = supersede("Test claim")
        
        assert "superseded-by is required" in result.lower()
        
        aletheia.JANUS_DIR = original_janus
        aletheia.SESSIONS_DIR = original_janus / "sessions"


class TestStatusCommand:
    """Tests for /aletheia status command"""
    
    def test_status_empty_ledger(self, tmp_path):
        """Test status with no claims"""
        import aletheia
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        result = status()
        
        assert "EPISTEMIC DEBT" in result or "No labeled claims" in result
        
        aletheia.JANUS_DIR = original_janus
        aletheia.SESSIONS_DIR = original_janus / "sessions"


class TestCalibrationCommand:
    """Tests for /aletheia calibration command"""
    
    def test_calibration_empty(self, tmp_path):
        """Test calibration with no resolutions"""
        import aletheia
        import storage
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        result = calibration(period_days=90)
        
        assert "CALIBRATION LEDGER" in result
        
        aletheia.JANUS_DIR = original_janus
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"


class TestQueueCommand:
    """Tests for /aletheia queue command"""
    
    def test_queue_empty(self, tmp_path):
        """Test queue with no unresolved claims"""
        import aletheia
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        result = queue()
        
        assert "No unresolved claims" in result or "RESOLUTION QUEUE" in result
        
        aletheia.JANUS_DIR = original_janus
        aletheia.SESSIONS_DIR = original_janus / "sessions"
    
    def test_queue_with_label_filter(self, tmp_path):
        """Test queue with label filter"""
        import aletheia
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        result = queue(label_filter="[KNOWN]")
        
        # Should not error
        assert isinstance(result, str)
        
        aletheia.JANUS_DIR = original_janus
        aletheia.SESSIONS_DIR = original_janus / "sessions"


class TestAuditCommand:
    """Tests for /aletheia audit command"""
    
    def test_audit_healthy(self, tmp_path):
        """Test audit with healthy system"""
        import aletheia
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        result = audit()
        
        assert "AUDIT REPORT" in result
        assert "Status:" in result
        
        aletheia.JANUS_DIR = original_janus
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"
    
    def test_audit_with_fix_orphans(self, tmp_path):
        """Test audit with --fix-orphans"""
        import aletheia
        original_janus = aletheia.JANUS_DIR
        aletheia.JANUS_DIR = tmp_path / ".janus"
        aletheia.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        aletheia.SESSIONS_DIR = tmp_path / ".janus" / "sessions"
        aletheia.SESSIONS_DIR.mkdir(parents=True)
        
        result = audit(fix_orphans=True)
        
        assert "AUDIT REPORT" in result
        
        aletheia.JANUS_DIR = original_janus
        aletheia.RESOLUTIONS_FILE = original_janus / "resolutions.md"
        aletheia.SESSIONS_DIR = original_janus / "sessions"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
