"""
E4: API Integration
Tool-use endpoints with verification middleware.
"""

import json
from typing import Dict, Any, Optional, List, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
from pathlib import Path

try:
    from .sandbox import ToolExecutionSandbox, ExecutionResult, ResourceLimits
    from .validation import OutputValidationEngine, ValidationResult, ValidationStatus
    from .failure_detection import FailureDetectionEngine, DegradationResult, UnknownResult
except ImportError:
    from sandbox import ToolExecutionSandbox, ExecutionResult, ResourceLimits
    from validation import OutputValidationEngine, ValidationResult, ValidationStatus
    from failure_detection import FailureDetectionEngine, DegradationResult, UnknownResult


class APIResponseStatus(Enum):
    SUCCESS = "success"
    ERROR = "error"
    UNKNOWN = "unknown"
    PARTIAL = "partial"


@dataclass
class ToolRequest:
    """Incoming tool execution request."""
    tool_name: str
    command: str
    arguments: Dict[str, Any]
    timeout_ms: int
    resource_limits: Optional[ResourceLimits]
    request_id: str
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tool_name": self.tool_name,
            "command": self.command,
            "arguments": self.arguments,
            "timeout_ms": self.timeout_ms,
            "resource_limits": str(self.resource_limits) if self.resource_limits else None,
            "request_id": self.request_id,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


@dataclass
class ToolResponse:
    """Outgoing tool execution response."""
    request_id: str
    status: APIResponseStatus
    data: Any
    verification_status: ValidationStatus
    execution_result: Optional[ExecutionResult]
    validation_result: Optional[ValidationResult]
    degradation_result: Optional[DegradationResult]
    processing_time_ms: float
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "request_id": self.request_id,
            "status": self.status.value,
            "data": self.data,
            "verification_status": self.verification_status.value,
            "execution_result": self.execution_result.to_dict() if self.execution_result else None,
            "validation_result": self.validation_result.to_dict() if self.validation_result else None,
            "degradation_result": self.degradation_result.to_dict() if self.degradation_result else None,
            "processing_time_ms": self.processing_time_ms,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


class ToolUseAPI:
    """
    REST API layer for tool execution with verification middleware.
    
    Provides:
    - Request/response handling
    - Verification middleware
    - Error handling
    - Rate limiting
    - Logging
    """

    def __init__(
        self,
        sandbox: Optional[ToolExecutionSandbox] = None,
        validator: Optional[OutputValidationEngine] = None,
        failure_detector: Optional[FailureDetectionEngine] = None
    ):
        self.sandbox = sandbox or ToolExecutionSandbox()
        self.validator = validator or OutputValidationEngine()
        self.failure_detector = failure_detector or FailureDetectionEngine()
        
        self.request_history: List[ToolResponse] = []
        self.tool_handlers: Dict[str, Callable] = {}
        self.rate_limit_config: Dict[str, int] = {}
        
        self._register_default_tools()

    def _register_default_tools(self) -> None:
        """Register default tool handlers."""
        # Register basic tools
        self.register_tool("echo", self._echo_handler)
        self.register_tool("read_file", self._read_file_handler)
        self.register_tool("write_file", self._write_file_handler)
        self.register_tool("exec_command", self._exec_handler)

    def register_tool(self, tool_name: str, handler: Callable) -> None:
        """Register a tool handler."""
        self.tool_handlers[tool_name] = handler

    def register_rate_limit(self, tool_name: str, requests_per_minute: int) -> None:
        """Register rate limit for a tool."""
        self.rate_limit_config[tool_name] = requests_per_minute

    async def execute_tool(self, request: ToolRequest) -> ToolResponse:
        """
        Execute a tool request through the verification pipeline.
        
        Pipeline:
        1. Execute in sandbox
        2. Validate output
        3. Handle failures with degradation
        4. Return verified response
        
        Args:
            request: Tool execution request
            
        Returns:
            ToolResponse with verified result
        """
        start_time = datetime.utcnow()
        
        try:
            # Step 1: Execute in sandbox
            execution_result = await self._execute_in_sandbox(request)
            
            # Step 2: Validate output
            validation_result = self._validate_output(request, execution_result)
            
            # Step 3: Determine response status
            if validation_result.status == ValidationStatus.VALID:
                status = APIResponseStatus.SUCCESS
                data = execution_result.stdout or execution_result.stderr
            elif validation_result.status == ValidationStatus.PARTIAL:
                status = APIResponseStatus.PARTIAL
                data = execution_result.stdout or execution_result.stderr
            else:
                # Step 4: Apply degradation
                degradation_result = self._handle_failure(request, execution_result)
                status = APIResponseStatus.UNKNOWN
                data = degradation_result.output if degradation_result else None
            
            # Calculate processing time
            end_time = datetime.utcnow()
            processing_time_ms = (end_time - start_time).total_seconds() * 1000
            
            response = ToolResponse(
                request_id=request.request_id,
                status=status,
                data=data,
                verification_status=validation_result.status,
                execution_result=execution_result if execution_result.exit_code is not None else None,
                validation_result=validation_result,
                degradation_result=None if status == APIResponseStatus.SUCCESS else degradation_result,
                processing_time_ms=processing_time_ms,
                timestamp=self._get_timestamp(),
                metadata={
                    "tool_name": request.tool_name,
                    "pipeline_version": "3.0.0",
                    "verification_passed": validation_result.status == ValidationStatus.VALID
                }
            )
            
            self.request_history.append(response)
            return response
            
        except Exception as e:
            # Handle unexpected errors
            end_time = datetime.utcnow()
            processing_time_ms = (end_time - start_time).total_seconds() * 1000
            
            failure_context = self.failure_detector.detect_failure(
                request.tool_name,
                e,
                request.arguments,
                retry_count=0
            )
            
            degradation_result = self.failure_detector.apply_degradation(failure_context)
            
            return ToolResponse(
                request_id=request.request_id,
                status=APIResponseStatus.ERROR,
                data=degradation_result.output,
                verification_status=ValidationStatus.INVALID,
                execution_result=None,
                validation_result=None,
                degradation_result=degradation_result,
                processing_time_ms=processing_time_ms,
                timestamp=self._get_timestamp(),
                metadata={"error": str(e), "error_type": type(e).__name__}
            )

    async def _execute_in_sandbox(self, request: ToolRequest) -> ExecutionResult:
        """Execute tool in sandboxed environment."""
        # Check if custom handler exists
        if request.tool_name in self.tool_handlers:
            handler = self.tool_handlers[request.tool_name]
            try:
                result = handler(**request.arguments)
                return ExecutionResult(
                    tool_name=request.tool_name,
                    status=result.get("status", "completed"),
                    stdout=result.get("output", ""),
                    stderr="",
                    exit_code=0 if result.get("success", True) else 1,
                    execution_time_ms=request.timeout_ms,
                    memory_used_mb=0.0,
                    timeout_occurred=False,
                    error_message=result.get("error")
                )
            except Exception as e:
                raise e
        
        # Execute via sandbox
        limits = request.resource_limits or ResourceLimits(
            max_cpu_time=request.timeout_ms / 1000.0,
            max_wall_time=request.timeout_ms / 1000.0 * 2
        )
        
        return await self.sandbox.execute_async(
            tool_name=request.tool_name,
            command=request.command,
            args=self._format_args(request.arguments),
            limits=limits
        )

    def _format_args(self, arguments: Dict[str, Any]) -> List[str]:
        """Format arguments as command-line args."""
        args = []
        for key, value in arguments.items():
            args.append(f"--{key}")
            args.append(str(value))
        return args

    def _validate_output(
        self,
        request: ToolRequest,
        execution_result: ExecutionResult
    ) -> ValidationResult:
        """Validate tool output against schema."""
        # Prepare output data
        output_data = {
            "success": execution_result.exit_code == 0,
            "data": execution_result.stdout,
            "error": execution_result.stderr,
            "metadata": {
                "exit_code": execution_result.exit_code,
                "execution_time_ms": execution_result.execution_time_ms,
                "memory_used_mb": execution_result.memory_used_mb
            }
        }
        
        # Validate against generic schema
        return self.validator.validate(
            tool_name=request.tool_name,
            output=output_data,
            schema_id="generic_tool_output"
        )

    def _handle_failure(
        self,
        request: ToolRequest,
        execution_result: ExecutionResult
    ) -> Optional[DegradationResult]:
        """Handle tool failure with degradation."""
        if execution_result.status.value in ["error", "timeout"]:
            # Create exception from execution result
            error_msg = execution_result.error_message or execution_result.stderr
            exception = Exception(error_msg)
            
            failure_context = self.failure_detector.detect_failure(
                request.tool_name,
                exception,
                request.arguments,
                retry_count=0
            )
            
            return self.failure_detector.apply_degradation(failure_context)
        
        return None

    def _echo_handler(self, **kwargs) -> Dict[str, Any]:
        """Echo tool handler."""
        message = kwargs.get("message", "")
        return {
            "success": True,
            "output": message,
            "status": "completed"
        }

    def _read_file_handler(self, **kwargs) -> Dict[str, Any]:
        """Read file tool handler."""
        path = kwargs.get("path", "")
        try:
            file_path = Path(path)
            if file_path.exists():
                content = file_path.read_text()
                return {
                    "success": True,
                    "output": content,
                    "status": "completed",
                    "metadata": {"size": len(content)}
                }
            else:
                return {
                    "success": False,
                    "output": "",
                    "error": f"File not found: {path}",
                    "status": "error"
                }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "status": "error"
            }

    def _write_file_handler(self, **kwargs) -> Dict[str, Any]:
        """Write file tool handler."""
        path = kwargs.get("path", "")
        content = kwargs.get("content", "")
        try:
            file_path = Path(path)
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(content)
            return {
                "success": True,
                "output": f"Wrote {len(content)} bytes to {path}",
                "status": "completed"
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "status": "error"
            }

    def _exec_handler(self, **kwargs) -> Dict[str, Any]:
        """Execute command tool handler."""
        command = kwargs.get("command", "")
        try:
            import subprocess
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            return {
                "success": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr,
                "status": "completed" if result.returncode == 0 else "error",
                "metadata": {"exit_code": result.returncode}
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "error": "Command timed out",
                "status": "timeout"
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "status": "error"
            }

    def get_request_history(self, limit: int = 10) -> List[ToolResponse]:
        """Get recent request history."""
        return self.request_history[-limit:]

    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        return datetime.utcnow().isoformat()


# Example usage
if __name__ == "__main__":
    import asyncio

    async def main():
        api = ToolUseAPI()
        
        request = ToolRequest(
            tool_name="echo",
            command="echo",
            arguments={"message": "Hello from API"},
            timeout_ms=5000,
            resource_limits=None,
            request_id="REQ-001",
            timestamp=api._get_timestamp()
        )
        
        response = await api.execute_tool(request)
        print(json.dumps(response.to_dict(), indent=2))

    asyncio.run(main())
