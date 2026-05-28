"""
Ergon System - Tool-Use Verification

Abraxas v3 Phase 1: Safe tool execution with sandboxing,
output validation, failure detection, and graceful degradation.
"""

from .sandbox import ToolExecutionSandbox, ExecutionResult, ResourceLimits, SandboxStatus
from .validation import OutputValidationEngine, ValidationResult, ValidationStatus, SchemaDefinition
from .failure_detection import FailureDetectionEngine, FailureContext, FailureType, DegradationResult, DegradationStrategy, UnknownResult
from .api import ToolUseAPI, ToolRequest, ToolResponse, APIResponseStatus

__version__ = "3.0.0"
__all__ = [
    "ToolExecutionSandbox",
    "ExecutionResult",
    "ResourceLimits",
    "SandboxStatus",
    "OutputValidationEngine",
    "ValidationResult",
    "ValidationStatus",
    "SchemaDefinition",
    "FailureDetectionEngine",
    "FailureContext",
    "FailureType",
    "DegradationResult",
    "DegradationStrategy",
    "UnknownResult",
    "ToolUseAPI",
    "ToolRequest",
    "ToolResponse",
    "APIResponseStatus",
]
