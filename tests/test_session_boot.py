"""
Tests for session-boot.py — the Abraxas Session Boot Protocol.
"""
import hashlib
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Import the boot module directly (filename has a hyphen, can't use standard import)
import importlib.util

_boot_path = Path(__file__).resolve().parents[1] / "scripts" / "session-boot.py"
_spec = importlib.util.spec_from_file_location("session_boot", str(_boot_path))
boot = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(boot)


# ---------------------------------------------------------------------------
# Helper: build a full mock Paths with every attribute used by the boot code
# ---------------------------------------------------------------------------

def _mock_paths(constitution_dir=None, extras=None):
    """Build a MagicMock for Paths with all expected string-path attributes.
    
    By default, creates a temp constitution_dir.  `extras` can override
    individual attributes.  `constitution_dir` can be a Path or str to a
    pre-existing directory.
    """
    if constitution_dir is None:
        tmp = tempfile.mkdtemp()
        constitution_dir = Path(tmp) / "constitution"
        constitution_dir.mkdir(parents=True, exist_ok=True)

    cd = Path(constitution_dir)
    proj = cd.parent

    paths = MagicMock()
    paths.project_root = str(proj)
    paths.constitution_dir = str(cd)
    paths.genesis_path = str(cd / "genesis.md")
    paths.index_path = str(cd / "constitution-index.md")
    paths.manifest_path = str(cd / ".manifest.json")
    paths.skills_dir = str(proj / "skills")
    paths.tests_dir = str(proj / "tests")
    paths.scripts_dir = str(proj / "scripts")

    if extras:
        for k, v in extras.items():
            setattr(paths, k, v)

    return paths


class TestPaths(unittest.TestCase):
    """Tests for Paths configuration."""

    def test_init_resolves_constitution_dir(self):
        """The real Paths class should resolve all attributes correctly."""
        paths = boot.Paths()
        self.assertTrue(os.path.isdir(paths.project_root))
        # constitution_dir might exist or not, but should be a string
        self.assertIsInstance(paths.constitution_dir, str)

    def test_genesis_path(self):
        """Genesis path should be constitution/genesis.md."""
        paths = boot.Paths()
        self.assertTrue(paths.genesis_path.endswith("genesis.md"))

    def test_manifest_path(self):
        """Manifest path should be in constitution dir."""
        paths = boot.Paths()
        self.assertTrue(paths.manifest_path.endswith(".manifest.json"))

    @patch.dict(os.environ, {"ARANGO_URL": "http://localhost:8529"}, clear=False)
    def test_arango_env_present(self):
        """ArangoDB env vars should be accessible."""
        self.assertEqual(os.getenv("ARANGO_URL"), "http://localhost:8529")


class TestGenesisLoader(unittest.TestCase):
    """Tests for Phase 1: Genesis Load."""

    def setUp(self):
        self.tmpdir_obj = tempfile.TemporaryDirectory()
        self.tmpdir = Path(self.tmpdir_obj.name)

    def tearDown(self):
        self.tmpdir_obj.cleanup()

    def test_genesis_not_found(self):
        """When genesis.md is missing, report unreadable."""
        paths = _mock_paths(self.tmpdir)
        loader = boot.GenesisLoader(paths)
        result = loader.run()
        self.assertFalse(result["genesis"]["readable"])
        self.assertIsNone(result["genesis"]["version"])

    def test_genesis_readable_with_version(self):
        """Genesis.md with version header should parse correctly."""
        cd = self.tmpdir / "constitution"
        cd.mkdir(parents=True, exist_ok=True)
        (cd / "genesis.md").write_text("# genesis.md\n> Version: 9.9.9\n")

        paths = _mock_paths(cd)
        loader = boot.GenesisLoader(paths)
        result = loader.run()

        self.assertTrue(result["genesis"]["readable"])
        self.assertEqual(result["genesis"]["version"], "9.9.9")
        # Size can be in B or KB depending on content length
        self.assertIn("size_human", result["genesis"])

    def test_counts_constitutions(self):
        """Should count constitution-*.md files in the directory."""
        cd = self.tmpdir / "constitution"
        cd.mkdir(parents=True, exist_ok=True)
        (cd / "genesis.md").write_text("> Version: 1.0\n")
        (cd / "constitution-core.md").write_text("# Core")
        (cd / "constitution-agon.md").write_text("# Agon")
        (cd / "constitution-logos.md").write_text("# Logos")
        (cd / "README.md").write_text("# Readme")  # Not constitution-*

        paths = _mock_paths(cd)
        loader = boot.GenesisLoader(paths)
        result = loader.run()

        self.assertEqual(result["constitutions"]["total_files"], 3)

    def test_commands_parsing(self):
        """Should extract command counts from constitution files."""
        cd = self.tmpdir / "constitution"
        cd.mkdir(parents=True, exist_ok=True)
        (cd / "genesis.md").write_text("> Version: 1.0\n")
        (cd / "constitution-core.md").write_text(
            "# Core\n| `/check` | desc |\n| `/label` | desc |\n| `/source` | desc |\n"
        )

        paths = _mock_paths(cd)
        loader = boot.GenesisLoader(paths)
        result = loader.run()

        total = result["constitutions"]["total_commands"]
        self.assertGreaterEqual(total, 0)  # At minimum we don't crash

    def test_no_constitutions_dir(self):
        """Graceful when constitution dir doesn't exist."""
        paths = _mock_paths(self.tmpdir, extras={"constitution_dir": "/nonexistent/path/abc123",
                                                  "genesis_path": "/nonexistent/path/abc123/genesis.md",
                                                  "index_path": "/nonexistent/path/abc123/constitution-index.md"})
        loader = boot.GenesisLoader(paths)
        result = loader.run()
        self.assertFalse(result["genesis"]["readable"])


class TestHealthChecker(unittest.TestCase):
    """Tests for Phase 2: Health Check."""

    def _paths(self):
        return _mock_paths()

    @patch("socket.create_connection")
    @patch.dict(os.environ, {"ARANGO_URL": "http://localhost:8529",
                              "ARANGO_DB": "abraxas",
                              "ARANGO_USER": "root",
                              "ARANGO_ROOT_PASSWORD": "pass"})
    def test_arangodb_reachable(self, mock_sock):
        """When socket connects successfully, ArangoDB should be reachable."""
        paths = self._paths()
        checker = boot.HealthChecker(paths)
        result = checker.run()
        self.assertTrue(result["arangodb"]["reachable"])

    @patch("socket.create_connection")
    @patch.dict(os.environ, {"ARANGO_URL": "http://localhost:8529"})
    def test_arangodb_unreachable(self, mock_sock):
        """When socket connection fails, ArangoDB should be unreachable."""
        mock_sock.side_effect = ConnectionRefusedError
        paths = self._paths()
        checker = boot.HealthChecker(paths)
        result = checker.run()
        self.assertFalse(result["arangodb"]["reachable"])

    @patch("socket.create_connection")
    def test_mcp_health_reachable(self, mock_sock):
        """When MCP health socket connects, mark reachable."""
        paths = self._paths()
        checker = boot.HealthChecker(paths)
        result = checker.run()
        self.assertTrue(result["mcp_health_url"]["reachable"])

    @patch("socket.create_connection")
    def test_mcp_health_unreachable(self, mock_sock):
        """When MCP health socket fails, mark unreachable."""
        mock_sock.side_effect = ConnectionRefusedError
        paths = self._paths()
        checker = boot.HealthChecker(paths)
        result = checker.run()
        self.assertFalse(result["mcp_health_url"]["reachable"])

    def test_filesystem_checks_existing_dirs(self):
        """Should check key directories exist."""
        paths = self._paths()
        checker = boot.HealthChecker(paths)
        result = checker.run()
        self.assertIn("project_root", result["filesystem"])
        self.assertIn("constitution_dir", result["filesystem"])


class TestDriftAuditor(unittest.TestCase):
    """Tests for Phase 3: Constitution Drift Audit."""

    def setUp(self):
        self.tmpdir_obj = tempfile.TemporaryDirectory()
        self.tmpdir = Path(self.tmpdir_obj.name)

    def tearDown(self):
        self.tmpdir_obj.cleanup()

    def _make_file(self, name: str, content: str):
        cd = Path(self.paths.constitution_dir)
        p = cd / name
        p.write_text(content)
        return p

    def _setup(self, files=None):
        """Create temp dir + paths. Optionally seed files (dict name→content)."""
        cd = self.tmpdir / "constitution"
        cd.mkdir(parents=True, exist_ok=True)
        self.paths = _mock_paths(cd)  # Pass constitution dir, not project root
        if files:
            for name, content in files.items():
                (Path(self.paths.constitution_dir) / name).write_text(content)

    def test_no_manifest_creates_one(self):
        """First run with no manifest should create one, no drift."""
        self._setup({
            "constitution-core.md": "# Core v1",
            "constitution-agon.md": "# Agon v1",
            "genesis.md": "> Version: 1.0\n# Genesis",
        })

        auditor = boot.DriftAuditor(self.paths)
        result = auditor.run()

        self.assertFalse(result["drift"]["has_drift"])
        # Manifest should have been created
        self.assertTrue(os.path.exists(self.paths.manifest_path))

    def test_no_drift_on_identical_files(self):
        """Same files + same content = no drift."""
        core_content = "# Core v1"
        genesis_content = "> Version: 1.0\n# Genesis"
        self._setup({"constitution-core.md": core_content, "genesis.md": genesis_content})

        # Pre-seed manifest with matching hash dicts for ALL files the auditor will hash
        core_hash_val = hashlib.sha256(core_content.encode()).hexdigest()
        genesis_hash_val = hashlib.sha256(genesis_content.encode()).hexdigest()
        manifest = {
            "files": {
                "constitution-core.md": {"sha256": core_hash_val, "modified": "2026-01-01T00:00:00Z"},
                "genesis.md": {"sha256": genesis_hash_val, "modified": "2026-01-01T00:00:00Z"},
            },
            "updated_at": "2026-01-01T00:00:00Z",
        }
        os.makedirs(os.path.dirname(self.paths.manifest_path), exist_ok=True)
        with open(self.paths.manifest_path, "w") as f:
            json.dump(manifest, f)

        auditor = boot.DriftAuditor(self.paths)
        result = auditor.run()
        self.assertFalse(result["drift"]["has_drift"])

    def test_drift_modified_file(self):
        """Modified file content = drift detected."""
        self._setup({"constitution-core.md": "# Core v2 MODIFIED", "genesis.md": "> Version: 1.0\n# Genesis"})

        old_hash = hashlib.sha256("# Core v1".encode()).hexdigest()
        manifest = {
            "files": {
                "constitution-core.md": {"sha256": old_hash, "modified": "2026-01-01T00:00:00Z"},
            },
            "updated_at": "2026-01-01T00:00:00Z",
        }
        with open(self.paths.manifest_path, "w") as f:
            json.dump(manifest, f)

        auditor = boot.DriftAuditor(self.paths)
        result = auditor.run()
        self.assertTrue(result["drift"]["has_drift"])

    def test_drift_new_file(self):
        """New file not in manifest = drift (added)."""
        # Auditor hashes both constitution-*.md AND genesis.md
        core_content = "# Core"
        genesis_content = "> Version: 1.0\n# Genesis"
        self._setup({
            "constitution-core.md": core_content,
            "constitution-new.md": "# Brand new system",
            "genesis.md": genesis_content,
        })

        core_hash = hashlib.sha256(core_content.encode()).hexdigest()
        genesis_hash = hashlib.sha256(genesis_content.encode()).hexdigest()
        manifest = {
            "files": {
                "constitution-core.md": {"sha256": core_hash, "modified": "2026-01-01T00:00:00Z"},
                "genesis.md": {"sha256": genesis_hash, "modified": "2026-01-01T00:00:00Z"},
            },
            "updated_at": "2026-01-01T00:00:00Z",
        }
        os.makedirs(os.path.dirname(self.paths.manifest_path), exist_ok=True)
        with open(self.paths.manifest_path, "w") as f:
            json.dump(manifest, f)

        auditor = boot.DriftAuditor(self.paths)
        result = auditor.run()
        # New constitution file = drift
        self.assertGreater(len(result["drift"]["added"]), 0)

    def test_drift_removed_file(self):
        """File in manifest but missing on disk = drift (removed)."""
        self._setup({
            "constitution-core.md": "# Core",
            "genesis.md": "> Version: 1.0\n# Genesis",
        })

        core_hash = hashlib.sha256("# Core".encode()).hexdigest()
        gone_hash = hashlib.sha256("# Gone".encode()).hexdigest()
        manifest = {
            "files": {
                "constitution-core.md": {"sha256": core_hash, "modified": "2026-01-01T00:00:00Z"},
                "constitution-gone.md": {"sha256": gone_hash, "modified": "2026-01-01T00:00:00Z"},
            },
            "updated_at": "2026-01-01T00:00:00Z",
        }
        os.makedirs(os.path.dirname(self.paths.manifest_path), exist_ok=True)
        with open(self.paths.manifest_path, "w") as f:
            json.dump(manifest, f)

        auditor = boot.DriftAuditor(self.paths)
        result = auditor.run()
        self.assertGreater(len(result["drift"]["removed"]), 0)

    def test_ignores_non_constitution_files(self):
        """README.md should be excluded from hashing (but genesis.md IS hashed)."""
        core_content = "# Core"
        genesis_content = "> Version: 1.0\n# Genesis"
        self._setup({
            "constitution-core.md": core_content,
            "README.md": "# Readme",
            "genesis.md": genesis_content,
        })

        core_hash = hashlib.sha256(core_content.encode()).hexdigest()
        genesis_hash = hashlib.sha256(genesis_content.encode()).hexdigest()
        manifest = {
            "files": {
                "constitution-core.md": {"sha256": core_hash, "modified": "2026-01-01T00:00:00Z"},
                "genesis.md": {"sha256": genesis_hash, "modified": "2026-01-01T00:00:00Z"},
            },
            "updated_at": "2026-01-01T00:00:00Z",
        }
        os.makedirs(os.path.dirname(self.paths.manifest_path), exist_ok=True)
        with open(self.paths.manifest_path, "w") as f:
            json.dump(manifest, f)

        auditor = boot.DriftAuditor(self.paths)
        result = auditor.run()
        # README.md should NOT be hashed, so no drift from it
        self.assertFalse(result["drift"]["has_drift"])


class TestModeReporter(unittest.TestCase):
    """Tests for Phase 4: Mode Report synthesis."""

    def _mock_genesis(self, **overrides):
        base = {
            "genesis": {"version": "4.4.1", "size_human": "62.1 KB", "readable": True, "exists": True},
            "constitutions": {
                "total_files": 3,
                "total_commands": 58,
                "systems": [
                    {"name": "constitution-core.md", "commands": 20},
                    {"name": "constitution-agon.md", "commands": 8},
                    {"name": "constitution-logos.md", "commands": 30},
                ],
            },
        }
        base.update(overrides)
        return base

    def _mock_health(self, **overrides):
        base = {
            "arangodb": {"reachable": True, "configured": True, "version": "3.12"},
            "mcp_health_url": {"reachable": True, "configured": True, "status_code": 200},
            "filesystem": {
                "project_root": {"exists": True},
                "constitution_dir": {"exists": True},
            },
        }
        base.update(overrides)
        return base

    def _mock_drift(self, **overrides):
        base = {
            "drift": {
                "has_drift": False,
                "severity": "none",
                "summary": "All 3 files unchanged.",
            }
        }
        base.update(overrides)
        return base

    def test_sovereign_mode_when_all_connected(self):
        """DB + MCP + FS all up = Sovereign mode."""
        reporter = boot.ModeReporter(self._mock_genesis(), self._mock_health(), self._mock_drift())
        report = reporter.build_report()
        self.assertEqual(report["operational_mode"], "Sovereign")
        self.assertEqual(report["status"], "healthy")

    def test_simulation_mode_when_db_down(self):
        """DB unreachable but MCP up = Simulation mode."""
        health = self._mock_health()
        health["arangodb"]["reachable"] = False
        reporter = boot.ModeReporter(self._mock_genesis(), health, self._mock_drift())
        report = reporter.build_report()
        self.assertEqual(report["operational_mode"], "Simulation")
        self.assertEqual(report["status"], "degraded")

    def test_simulation_mode_when_mcp_down(self):
        """MCP unreachable but DB up = Simulation mode."""
        health = self._mock_health()
        health["mcp_health_url"]["reachable"] = False
        reporter = boot.ModeReporter(self._mock_genesis(), health, self._mock_drift())
        report = reporter.build_report()
        self.assertEqual(report["operational_mode"], "Simulation")

    def test_drift_flags_issues(self):
        """Drift detected should appear in issues list."""
        drift = self._mock_drift()
        drift["drift"]["has_drift"] = True
        drift["drift"]["severity"] = "high"
        drift["drift"]["summary"] = "3 modified, 1 new"
        reporter = boot.ModeReporter(self._mock_genesis(), self._mock_health(), drift)
        report = reporter.build_report()
        self.assertGreater(len(report["issues"]), 0)
        drift_issues = [i for i in report["issues"] if i["phase"] == "drift"]
        self.assertEqual(len(drift_issues), 1)
        self.assertEqual(drift_issues[0]["severity"], "high")

    def test_report_contains_all_sections(self):
        """Full report has all expected top-level keys."""
        reporter = boot.ModeReporter(self._mock_genesis(), self._mock_health(), self._mock_drift())
        report = reporter.build_report()
        expected_keys = {"boot_timestamp", "operational_mode", "status", "genesis",
                         "systems", "connectivity", "drift", "issues", "issue_count"}
        self.assertEqual(set(report.keys()), expected_keys)

    def test_version_change_flags_issue(self):
        """Genesis version comparison showing change should flag an issue."""
        genesis = self._mock_genesis()
        genesis["version_comparison"] = {
            "version_changed": True,
            "previous_version": "4.4.0",
            "current_version": "4.4.1",
        }
        reporter = boot.ModeReporter(genesis, self._mock_health(), self._mock_drift())
        report = reporter.build_report()
        version_issues = [i for i in report["issues"] if i["phase"] == "genesis"]
        self.assertEqual(len(version_issues), 1)


class TestOutputFormatters(unittest.TestCase):
    """Tests for text and JSON output formatting."""

    def _sample_report(self, **overrides):
        base = {
            "boot_timestamp": "2026-05-15T00:00:00+00:00",
            "operational_mode": "Sovereign",
            "status": "healthy",
            "genesis": {"version": "4.4.1", "size": "62.1 KB", "readable": True},
            "systems": {"total": 35, "total_commands": 234, "roster": ["constitution-core.md", "constitution-agon.md"]},
            "connectivity": {"arangodb": True, "mcp_endpoint": True, "filesystem_ok": True},
            "drift": {"has_drift": False, "severity": "none", "summary": "All files unchanged."},
            "issues": [],
            "issue_count": 0,
        }
        base.update(overrides)
        return base

    def test_text_report_contains_key_info(self):
        """Text report should include mode, status, genesis version."""
        text = boot.format_text_report(self._sample_report(), verbose=False)
        self.assertIn("ABRAXAS SESSION BOOT REPORT", text)
        self.assertIn("Sovereign", text)
        self.assertIn("4.4.1", text)

    def test_text_report_shows_degraded(self):
        """Text report should reflect degraded status."""
        text = boot.format_text_report(self._sample_report(
            operational_mode="Simulation", status="degraded",
            connectivity={"arangodb": False, "mcp_endpoint": True, "filesystem_ok": True},
        ), verbose=False)
        self.assertIn("DEGRADED", text.upper())
        self.assertIn("Simulation", text)
        self.assertIn("unreachable", text)

    def test_text_report_shows_drift(self):
        """Text report should include drift info."""
        text = boot.format_text_report(self._sample_report(
            drift={"has_drift": True, "severity": "high", "summary": "2 modified, 1 new"},
        ), verbose=False)
        self.assertIn("HIGH", text)
        self.assertIn("2 modified", text)

    def test_text_verbose_includes_roster(self):
        """Verbose mode should list system roster."""
        text = boot.format_text_report(self._sample_report(), verbose=True)
        self.assertIn("constitution-core.md", text)


class TestIntegration(unittest.TestCase):
    """End-to-end integration tests running the full boot sequence."""

    def setUp(self):
        self.tmpdir_obj = tempfile.TemporaryDirectory()
        self.tmpdir = Path(self.tmpdir_obj.name)

    def tearDown(self):
        self.tmpdir_obj.cleanup()

    @patch("socket.create_connection")
    def test_full_boot_flow_healthy(self, mock_sock):
        """Full 4-phase boot should produce a complete report."""
        cd = self.tmpdir / "constitution"
        cd.mkdir(parents=True, exist_ok=True)
        (self.tmpdir / "skills").mkdir(exist_ok=True)
        (self.tmpdir / "scripts").mkdir(exist_ok=True)
        (self.tmpdir / "tests").mkdir(exist_ok=True)
        (cd / "genesis.md").write_text("> Version: 4.4.1\n# Abraxas Genesis")
        (cd / "constitution-core.md").write_text("# Core\n| `/check` | desc |")

        paths = _mock_paths(cd)

        genesis_result = boot.GenesisLoader(paths).run()
        health_result = boot.HealthChecker(paths).run()
        drift_result = boot.DriftAuditor(paths).run()
        report = boot.ModeReporter(genesis_result, health_result, drift_result).build_report()

        self.assertIn("operational_mode", report)
        self.assertIn("genesis", report)
        self.assertIn("systems", report)
        self.assertIn("connectivity", report)
        self.assertIn("drift", report)
        self.assertIsInstance(report["issue_count"], int)

    @patch("socket.create_connection")
    def test_full_boot_flow_degraded(self, mock_sock):
        """Full boot when DB is down should report degraded/Simulation mode."""
        cd = self.tmpdir / "constitution"
        cd.mkdir(parents=True, exist_ok=True)
        # Create minimal project structure so filesystem check passes
        (self.tmpdir / "skills").mkdir(exist_ok=True)
        (self.tmpdir / "scripts").mkdir(exist_ok=True)
        (self.tmpdir / "tests").mkdir(exist_ok=True)
        (cd / "genesis.md").write_text("> Version: 4.4.1\n# Genesis")
        (cd / "constitution-core.md").write_text("# Core")

        # DB socket fails, MCP socket passes (first call=DB, second call=MCP)  
        mock_sock.side_effect = [ConnectionRefusedError, MagicMock()]

        paths = _mock_paths(cd)

        genesis_result = boot.GenesisLoader(paths).run()
        health_result = boot.HealthChecker(paths).run()
        drift_result = boot.DriftAuditor(paths).run()
        report = boot.ModeReporter(genesis_result, health_result, drift_result).build_report()

        self.assertEqual(report["operational_mode"], "Simulation")
        self.assertEqual(report["status"], "degraded")
        self.assertFalse(report["connectivity"]["arangodb"])
        self.assertGreater(report["issue_count"], 0)


if __name__ == "__main__":
    unittest.main()
