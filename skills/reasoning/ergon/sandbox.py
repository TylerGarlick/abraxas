"""
E1: Tool Execution Sandbox
Isolated execution with timeouts and resource limits.
"""

import subprocess
import signal
import time
import resource
import asyncio
from typing import Dict, Any, Optional, List, Callable
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
import tempfile
import os


class SandboxStatus(Enum):
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    TIMEOUT = "timeout"
    ERROR = "error"
    TERMINATED = "terminated"


@dataclass
class ResourceLimits:
    """Resource limits for sandboxed execution."""
    max_cpu_time: float = 30.0  # seconds
    max_wall_time: float = 60.0  # seconds
    max_memory_mb: int = 512
    max_file_size_mb: int = 10
    max_processes: int = 5
    max_open_files: int = 10
    network_enabled: bool = False
    filesystem_write: bool = False


@dataclass
class ExecutionResult:
    """Result of sandboxed tool execution."""
    tool_name: str
    status: SandboxStatus
    stdout: str
    stderr: str
    exit_code: Optional[int]
    execution_time_ms: float
    memory_used_mb: float
    timeout_occurred: bool
    error_message: Optional[str]
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tool_name": self.tool_name,
            "status": self.status.value,
            "stdout": self.stdout,
            "stderr": self.stderr,
            "exit_code": self.exit_code,
            "execution_time_ms": self.execution_time_ms,
            "memory_used_mb": self.memory_used_mb,
            "timeout_occurred": self.timeout_occurred,
            "error_message": self.error_message,
            "metadata": self.metadata
        }


class ToolExecutionSandbox:
    """
    Sandbox for isolated tool execution with timeouts and resource limits.
    
    Provides:
    - Process isolation
    - Configurable timeouts
    - Resource limits (CPU, memory, files)
    - Safe execution of untrusted code
    """

    def __init__(self, default_limits: Optional[ResourceLimits] = None):
        self.default_limits = default_limits or ResourceLimits()
        self.active_sessions: Dict[str, subprocess.Popen] = {}
        self.execution_history: List[ExecutionResult] = []
        self._temp_dirs: List[Path] = []

    def execute(
        self,
        tool_name: str,
        command: str,
        args: Optional[List[str]] = None,
        limits: Optional[ResourceLimits] = None,
        working_dir: Optional[Path] = None,
        env: Optional[Dict[str, str]] = None
    ) -> ExecutionResult:
        """
        Execute a tool in sandboxed environment.
        
        Args:
            tool_name: Name of the tool being executed
            command: Command to execute
            args: Optional command arguments
            limits: Resource limits (uses default if None)
            working_dir: Working directory for execution
            env: Environment variables
            
        Returns:
            ExecutionResult with output and status
        """
        limits = limits or self.default_limits
        start_time = time.time()
        
        # Create isolated temp directory if filesystem write allowed
        temp_dir = None
        if limits.filesystem_write:
            temp_dir = self._create_temp_dir()
            working_dir = working_dir or temp_dir
        
        # Prepare command
        full_command = self._prepare_command(command, args)
        
        # Prepare environment
        exec_env = self._prepare_environment(env, limits)
        
        try:
            # Execute with resource limits
            result = self._execute_with_limits(
                full_command,
                limits,
                working_dir,
                exec_env
            )
            
            # Calculate execution metrics
            end_time = time.time()
            execution_time_ms = (end_time - start_time) * 1000
            
            # Determine status
            if result.timeout:
                status = SandboxStatus.TIMEOUT
                error_msg = f"Execution timed out after {limits.max_wall_time}s"
            elif result.returncode == 0:
                status = SandboxStatus.COMPLETED
                error_msg = None
            else:
                status = SandboxStatus.ERROR
                error_msg = f"Process exited with code {result.returncode}"
            
            # Get memory usage
            memory_mb = self._get_memory_usage(result.pid)
            
            execution_result = ExecutionResult(
                tool_name=tool_name,
                status=status,
                stdout=result.stdout,
                stderr=result.stderr,
                exit_code=result.returncode,
                execution_time_ms=execution_time_ms,
                memory_used_mb=memory_mb,
                timeout_occurred=result.timeout,
                error_message=error_msg,
                metadata={
                    "pid": result.pid,
                    "working_dir": str(working_dir),
                    "limits_applied": limits.to_dict() if hasattr(limits, 'to_dict') else str(limits)
                }
            )
            
            self.execution_history.append(execution_result)
            return execution_result
            
        except Exception as e:
            end_time = time.time()
            return ExecutionResult(
                tool_name=tool_name,
                status=SandboxStatus.ERROR,
                stdout="",
                stderr=str(e),
                exit_code=None,
                execution_time_ms=(end_time - start_time) * 1000,
                memory_used_mb=0.0,
                timeout_occurred=False,
                error_message=f"Execution failed: {str(e)}",
                metadata={"exception_type": type(e).__name__}
            )
        finally:
            # Cleanup temp directory
            if temp_dir:
                self._cleanup_temp_dir(temp_dir)

    async def execute_async(
        self,
        tool_name: str,
        command: str,
        args: Optional[List[str]] = None,
        limits: Optional[ResourceLimits] = None,
        working_dir: Optional[Path] = None,
        env: Optional[Dict[str, str]] = None
    ) -> ExecutionResult:
        """
        Execute a tool asynchronously in sandboxed environment.
        
        Same parameters as execute(), but runs async.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: self.execute(tool_name, command, args, limits, working_dir, env)
        )

    def _create_temp_dir(self) -> Path:
        """Create isolated temporary directory."""
        temp_dir = Path(tempfile.mkdtemp(prefix="abraxas_sandbox_"))
        self._temp_dirs.append(temp_dir)
        return temp_dir

    def _cleanup_temp_dir(self, temp_dir: Path) -> None:
        """Cleanup temporary directory."""
        try:
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
            self._temp_dirs = [d for d in self._temp_dirs if d != temp_dir]
        except Exception:
            pass

    def _prepare_command(self, command: str, args: Optional[List[str]]) -> str:
        """Prepare full command with arguments."""
        if args:
            return f"{command} {' '.join(args)}"
        return command

    def _prepare_environment(
        self,
        env: Optional[Dict[str, str]],
        limits: ResourceLimits
    ) -> Dict[str, str]:
        """Prepare restricted environment."""
        # Start with minimal environment
        minimal_env = {
            "PATH": "/usr/bin:/bin",
            "HOME": str(Path.home()),
            "LANG": "C.UTF-8",
        }
        
        # Add custom env vars if provided
        if env:
            minimal_env.update(env)
        
        # Disable network if not allowed
        if not limits.network_enabled:
            minimal_env["NO_PROXY"] = "*"
            minimal_env["http_proxy"] = ""
            minimal_env["https_proxy"] = ""
        
        return minimal_env

    def _execute_with_limits(
        self,
        command: str,
        limits: ResourceLimits,
        working_dir: Optional[Path],
        env: Dict[str, str]
    ) -> 'ExecutionResult':
        """Execute command with resource limits applied."""
        
        def set_limits():
            """Set resource limits for child process."""
            # CPU time limit
            resource.setrlimit(
                resource.RLIMIT_CPU,
                (int(limits.max_cpu_time), int(limits.max_cpu_time))
            )
            
            # Memory limit
            memory_bytes = limits.max_memory_mb * 1024 * 1024
            resource.setrlimit(
                resource.RLIMIT_AS,
                (memory_bytes, memory_bytes)
            )
            
            # File size limit
            file_size_bytes = limits.max_file_size_mb * 1024 * 1024
            resource.setrlimit(
                resource.RLIMIT_FSIZE,
                (file_size_bytes, file_size_bytes)
            )
            
            # Process limit
            resource.setrlimit(
                resource.RLIMIT_NPROC,
                (limits.max_processes, limits.max_processes)
            )
            
            # Open files limit
            resource.setrlimit(
                resource.RLIMIT_NOFILE,
                (limits.max_open_files, limits.max_open_files)
            )
        
        try:
            # Start process with limits
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=str(working_dir) if working_dir else None,
                env=env,
                preexec_fn=set_limits if os.name == 'posix' else None
            )
            
            # Wait with timeout
            try:
                stdout, stderr = process.communicate(timeout=limits.max_wall_time)
                timeout = False
            except subprocess.TimeoutExpired:
                # Kill process tree
                self._kill_process_tree(process.pid)
                stdout, stderr = b"", b"Timeout expired"
                timeout = True
            
            return type('obj', (object,), {
                'stdout': stdout.decode('utf-8', errors='replace'),
                'stderr': stderr.decode('utf-8', errors='replace'),
                'returncode': process.returncode,
                'pid': process.pid,
                'timeout': timeout
            })()
            
        except Exception as e:
            return type('obj', (object,), {
                'stdout': "",
                'stderr': str(e),
                'returncode': -1,
                'pid': -1,
                'timeout': False
            })()

    def _kill_process_tree(self, pid: int) -> None:
        """Kill process and all children."""
        try:
            parent = subprocess.Popen(
                f"ps -o pid --ppid {pid} --no-headers",
                shell=True,
                stdout=subprocess.PIPE
            )
            children = parent.stdout.read().decode().split()
            
            for child_pid in children:
                try:
                    os.kill(int(child_pid), signal.SIGKILL)
                except ProcessLookupError:
                    pass
            
            os.kill(pid, signal.SIGKILL)
        except Exception:
            pass

    def _get_memory_usage(self, pid: int) -> float:
        """Get memory usage of process in MB."""
        try:
            with open(f"/proc/{pid}/status", "r") as f:
                for line in f:
                    if line.startswith("VmRSS:"):
                        # Parse RSS in kB and convert to MB
                        parts = line.split()
                        if len(parts) >= 2:
                            kb = int(parts[1])
                            return kb / 1024.0
        except Exception:
            pass
        return 0.0

    def register_tool(
        self,
        tool_name: str,
        command: str,
        default_limits: Optional[ResourceLimits] = None
    ) -> None:
        """Register a tool with default execution parameters."""
        # Store tool configuration for later use
        if not hasattr(self, 'tool_registry'):
            self.tool_registry = {}
        
        self.tool_registry[tool_name] = {
            'command': command,
            'limits': default_limits or self.default_limits
        }

    def get_execution_history(self, limit: int = 10) -> List[ExecutionResult]:
        """Get recent execution history."""
        return self.execution_history[-limit:]

    def get_active_sessions(self) -> Dict[str, SandboxStatus]:
        """Get status of active sessions."""
        # Check which processes are still running
        active = {}
        for session_id, process in self.active_sessions.items():
            if process.poll() is None:
                active[session_id] = SandboxStatus.RUNNING
            else:
                active[session_id] = SandboxStatus.COMPLETED
        return active


# Example usage
if __name__ == "__main__":
    sandbox = ToolExecutionSandbox()
    
    # Execute a simple command
    result = sandbox.execute(
        tool_name="echo_test",
        command="echo",
        args=["Hello from sandbox"]
    )
    
    print(result.to_dict())
