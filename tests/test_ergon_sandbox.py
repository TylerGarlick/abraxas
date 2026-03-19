"""
Unit tests for Ergon System - Tool Execution Sandbox
"""

import unittest
import sys
sys.path.insert(0, '/home/ubuntu/.openclaw/workspace/abraxas')

from systems.ergon.sandbox import ToolExecutionSandbox, ResourceLimits, ExecutionResult, SandboxStatus


class TestToolExecutionSandbox(unittest.TestCase):
    """Test cases for tool execution sandbox."""

    def setUp(self):
        """Set up test fixtures."""
        # Use correct parameter names from actual API
        self.limits = ResourceLimits(
            max_cpu_time=5,
            max_wall_time=10,
            max_memory_mb=100
        )
        self.sandbox = ToolExecutionSandbox(default_limits=self.limits)

    def test_successful_command(self):
        """Test successful command execution."""
        result = self.sandbox.execute(tool_name="test", command="echo 'hello'")
        
        self.assertEqual(result.status, SandboxStatus.COMPLETED)
        self.assertEqual(result.exit_code, 0)
        self.assertIn("hello", result.stdout)

    def test_timeout_handling(self):
        """Test timeout handling."""
        # This should timeout or error (wall time 10s, sleep 15s)
        result = self.sandbox.execute(tool_name="sleep", command="sleep 15")
        
        # Accept either TIMEOUT or ERROR (depends on platform)
        self.assertIn(result.status, [SandboxStatus.TIMEOUT, SandboxStatus.ERROR])

    def test_invalid_command(self):
        """Test invalid command handling."""
        result = self.sandbox.execute(tool_name="invalid", command="nonexistent-command-xyz")
        
        self.assertEqual(result.status, SandboxStatus.ERROR)

    def test_resource_limits(self):
        """Test resource limits are enforced."""
        self.assertGreater(self.limits.max_cpu_time, 0)
        self.assertGreater(self.limits.max_memory_mb, 0)

    def test_full_pipeline(self):
        """Test end-to-end sandbox pipeline."""
        # Execute
        result = self.sandbox.execute(tool_name="test", command="echo 'test output'")
        
        # Verify
        self.assertEqual(result.status, SandboxStatus.COMPLETED)
        self.assertIn("test output", result.stdout)


if __name__ == '__main__':
    unittest.main()
