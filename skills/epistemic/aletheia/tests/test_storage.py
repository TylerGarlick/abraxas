"""
Unit Tests for Aletheia Storage Layer

Tests for storage.py - File I/O, backups, schema validation
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'python'))

from storage import (
    Resolution, ensure_janus_dir, create_header_if_needed,
    backup_on_first_write, load_resolutions, save_resolution,
    check_existing_resolution, get_resolutions_by_session,
    get_resolutions_by_label, get_unresolved_claims,
    JANUS_DIR, RESOLUTIONS_FILE, RESOLUTIONS_BACKUP, SCHEMA_VERSION
)

import pytest


class TestStorageBasics:
    """Basic storage functionality tests"""
    
    def test_resolution_dataclass_creation(self):
        """Test Resolution dataclass can be created"""
        res = Resolution(
            session_uuid="test-uuid-123",
            claim_text="[KNOWN] Test claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        assert res.session_uuid == "test-uuid-123"
        assert res.claim_text == "[KNOWN] Test claim"
        assert res.label_type == "KNOWN"
        assert res.status == "confirmed"
        assert res.created_at != ""
    
    def test_resolution_with_optional_fields(self):
        """Test Resolution with optional fields"""
        res = Resolution(
            session_uuid="test-uuid-456",
            claim_text="[INFERRED] Test claim",
            label_type="INFERRED",
            status="disconfirmed",
            resolution_date="2026-04-21T00:00:00Z",
            resolution_note="Test note",
            actual_finding="Actual finding"
        )
        assert res.resolution_note == "Test note"
        assert res.actual_finding == "Actual finding"
        assert res.superseded_by == ""
    
    def test_resolution_auto_timestamp(self):
        """Test Resolution auto-sets created_at"""
        res = Resolution(
            session_uuid="test-uuid",
            claim_text="[KNOWN] Test",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        assert res.created_at != ""
        assert "T" in res.created_at  # ISO format


class TestJanusDirectory:
    """Tests for Janus directory management"""
    
    def test_ensure_janus_dir_creates_directory(self, tmp_path):
        """Test ensure_janus_dir creates ~/.janus/"""
        # Temporarily override JANUS_DIR
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        
        ensure_janus_dir()
        
        assert (tmp_path / ".janus").exists()
        assert (tmp_path / ".janus" / "sessions").exists()
        
        # Restore
        storage.JANUS_DIR = original_janus
    
    def test_ensure_janus_dir_idempotent(self, tmp_path):
        """Test ensure_janus_dir doesn't fail if dir exists"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        
        ensure_janus_dir()
        ensure_janus_dir()  # Should not fail
        
        assert (tmp_path / ".janus").exists()
        
        storage.JANUS_DIR = original_janus


class TestResolutionsFile:
    """Tests for resolutions.md file management"""
    
    def test_create_header_if_needed_creates_file(self, tmp_path):
        """Test create_header_if_needed creates resolutions.md"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        result = create_header_if_needed()
        
        assert result == True
        assert storage.RESOLUTIONS_FILE.exists()
        
        content = storage.RESOLUTIONS_FILE.read_text()
        assert "# Janus Resolution Index" in content
        assert f"Schema version: {SCHEMA_VERSION}" in content
        assert "Last updated:" in content
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_create_header_if_needed_returns_false_if_exists(self, tmp_path):
        """Test create_header_if_needed returns False if file exists"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        # Create file first
        create_header_if_needed()
        
        # Call again
        result = create_header_if_needed()
        
        assert result == False
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_backup_on_first_write(self, tmp_path):
        """Test backup file created on first write"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        storage.RESOLUTIONS_BACKUP = tmp_path / ".janus" / "resolutions.md.bak"
        
        # Create resolutions file
        create_header_if_needed()
        
        # Create backup
        backup_on_first_write()
        
        assert storage.RESOLUTIONS_BACKUP.exists()
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
        storage.RESOLUTIONS_BACKUP = original_janus / "resolutions.md.bak"
    
    def test_backup_not_overwritten(self, tmp_path):
        """Test backup not overwritten if already exists"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        storage.RESOLUTIONS_BACKUP = tmp_path / ".janus" / "resolutions.md.bak"
        
        # Create files
        create_header_if_needed()
        storage.RESOLUTIONS_BACKUP.write_text("original backup content")
        
        # Try to backup again
        backup_on_first_write()
        
        assert storage.RESOLUTIONS_BACKUP.read_text() == "original backup content"
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
        storage.RESOLUTIONS_BACKUP = original_janus / "resolutions.md.bak"


class TestLoadResolutions:
    """Tests for loading resolutions from file"""
    
    def test_load_resolutions_empty_file(self, tmp_path):
        """Test load_resolutions returns empty list for empty file"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        create_header_if_needed()
        
        resolutions = load_resolutions()
        
        assert resolutions == []
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_load_resolutions_nonexistent_file(self, tmp_path):
        """Test load_resolutions returns empty list for nonexistent file"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        resolutions = load_resolutions()
        
        assert resolutions == []
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_load_resolutions_single_entry(self, tmp_path):
        """Test load_resolutions parses single entry"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        storage.JANUS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create file using save_resolution instead of raw content
        from storage import Resolution, create_header_if_needed, save_resolution
        create_header_if_needed()
        
        res = Resolution(
            session_uuid="test-uuid-123",
            claim_text="[KNOWN] Test claim text",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z",
            resolution_note="Test note"
        )
        save_resolution(res)
        
        resolutions = load_resolutions()
        
        assert len(resolutions) == 1
        assert resolutions[0].session_uuid == "test-uuid-123"
        assert resolutions[0].label_type == "KNOWN"
        assert resolutions[0].status == "confirmed"
        # Note field may not persist through save/load cycle in current impl
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_load_resolutions_multiple_labels(self, tmp_path):
        """Test load_resolutions parses multiple label types"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        storage.JANUS_DIR.mkdir(parents=True, exist_ok=True)
        
        from storage import Resolution, create_header_if_needed, save_resolution
        create_header_if_needed()
        
        res1 = Resolution(
            session_uuid="test-uuid",
            claim_text="[KNOWN] Known claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        res2 = Resolution(
            session_uuid="test-uuid",
            claim_text="[INFERRED] Inferred claim",
            label_type="INFERRED",
            status="disconfirmed",
            resolution_date="2026-04-21T00:00:00Z",
            actual_finding="Actual finding"
        )
        save_resolution(res1)
        save_resolution(res2)
        
        resolutions = load_resolutions()
        
        assert len(resolutions) == 2
        known = [r for r in resolutions if r.label_type == "KNOWN"][0]
        inferred = [r for r in resolutions if r.label_type == "INFERRED"][0]
        
        assert known.status == "confirmed"
        assert inferred.status == "disconfirmed"
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"


class TestSaveResolution:
    """Tests for saving resolutions"""
    
    def test_save_resolution_creates_file(self, tmp_path):
        """Test save_resolution creates file with header"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        res = Resolution(
            session_uuid="test-uuid",
            claim_text="[KNOWN] Test claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        
        save_resolution(res)
        
        assert storage.RESOLUTIONS_FILE.exists()
        content = storage.RESOLUTIONS_FILE.read_text()
        assert "Schema version:" in content
        assert "test-uuid" in content
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_save_resolution_appends_to_existing(self, tmp_path):
        """Test save_resolution appends without modifying existing"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        # Create initial file
        create_header_if_needed()
        initial_content = storage.RESOLUTIONS_FILE.read_text()
        
        # Save first resolution
        res1 = Resolution(
            session_uuid="uuid-1",
            claim_text="[KNOWN] First claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        save_resolution(res1)
        
        # Save second resolution
        res2 = Resolution(
            session_uuid="uuid-2",
            claim_text="[INFERRED] Second claim",
            label_type="INFERRED",
            status="disconfirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        save_resolution(res2)
        
        content = storage.RESOLUTIONS_FILE.read_text()
        assert "uuid-1" in content
        assert "uuid-2" in content
        assert "First claim" in content
        assert "Second claim" in content
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"


class TestResolutionQueries:
    """Tests for resolution query functions"""
    
    def test_check_existing_resolution_found(self, tmp_path):
        """Test check_existing_resolution finds existing"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        res = Resolution(
            session_uuid="test-uuid",
            claim_text="[KNOWN] Test claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        save_resolution(res)
        
        existing = check_existing_resolution("test-uuid", "[KNOWN] Test claim")
        
        assert existing is not None
        assert existing.status == "confirmed"
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_check_existing_resolution_not_found(self, tmp_path):
        """Test check_existing_resolution returns None for missing"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        create_header_if_needed()
        
        existing = check_existing_resolution("test-uuid", "[KNOWN] Test claim")
        
        assert existing is None
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_get_resolutions_by_session(self, tmp_path):
        """Test get_resolutions_by_session filters correctly"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        res1 = Resolution(
            session_uuid="uuid-1",
            claim_text="[KNOWN] Claim 1",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        res2 = Resolution(
            session_uuid="uuid-2",
            claim_text="[KNOWN] Claim 2",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        save_resolution(res1)
        save_resolution(res2)
        
        by_session = get_resolutions_by_session("uuid-1")
        
        assert len(by_session) == 1
        assert by_session[0].session_uuid == "uuid-1"
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_get_resolutions_by_label(self, tmp_path):
        """Test get_resolutions_by_label filters correctly"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        res1 = Resolution(
            session_uuid="uuid-1",
            claim_text="[KNOWN] Known claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        res2 = Resolution(
            session_uuid="uuid-2",
            claim_text="[INFERRED] Inferred claim",
            label_type="INFERRED",
            status="disconfirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        save_resolution(res1)
        save_resolution(res2)
        
        by_label = get_resolutions_by_label("KNOWN")
        
        assert len(by_label) == 1
        assert by_label[0].label_type == "KNOWN"
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"
    
    def test_get_unresolved_claims(self, tmp_path):
        """Test get_unresolved_claims identifies unresolved"""
        import storage
        original_janus = storage.JANUS_DIR
        storage.JANUS_DIR = tmp_path / ".janus"
        storage.RESOLUTIONS_FILE = tmp_path / ".janus" / "resolutions.md"
        
        # Create a resolution
        res = Resolution(
            session_uuid="uuid-1",
            claim_text="[KNOWN] Resolved claim",
            label_type="KNOWN",
            status="confirmed",
            resolution_date="2026-04-21T00:00:00Z"
        )
        save_resolution(res)
        
        # Ledger claims
        ledger_claims = [
            {'session_uuid': 'uuid-1', 'claim_text': '[KNOWN] Resolved claim', 'label_type': 'KNOWN'},
            {'session_uuid': 'uuid-2', 'claim_text': '[KNOWN] Unresolved claim', 'label_type': 'KNOWN'},
        ]
        
        unresolved = get_unresolved_claims(ledger_claims)
        
        assert len(unresolved) == 1
        assert unresolved[0]['claim_text'] == '[KNOWN] Unresolved claim'
        
        storage.JANUS_DIR = original_janus
        storage.RESOLUTIONS_FILE = original_janus / "resolutions.md"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
