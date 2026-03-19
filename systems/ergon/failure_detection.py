"""
E3: Failure Detection + Graceful Degradation
Handles tool failures and returns [UNKNOWN] when tools fail.
"""

import traceback
from typing import Dict, Any, Optional, List, Callable, Type
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import asyncio


class FailureType(Enum):
    TIMEOUT = "timeout"
    EXCEPTION = "exception"
    VALIDATION_ERROR = "validation_error"
    RESOURCE_EXHAUSTED = "resource_exhausted"
    NETWORK_ERROR = "network_error"
    PERMISSION_DENIED = "permission_denied"
    INVALID_INPUT = "invalid_input"
    UNKNOWN = "unknown"


class DegradationStrategy(Enum):
    RETURN_UNKNOWN = "return_unknown"
    USE_FALLBACK = "use_fallback"
    RETRY_WITH_BACKOFF = "retry_with_backoff"
    PARTIAL_RESULT = "partial_result"
    CACHE_HIT = "cache_hit"
    SKIP_OPTIONAL = "skip_optional"


@dataclass
class FailureContext:
    """Context information about a failure."""
    failure_type: FailureType
    tool_name: str
    error_message: str
    stack_trace: Optional[str]
    timestamp: str
    input_data: Any
    retry_count: int
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "failure_type": self.failure_type.value,
            "tool_name": self.tool_name,
            "error_message": self.error_message,
            "stack_trace": self.stack_trace,
            "timestamp": self.timestamp,
            "input_data": self.input_data,
            "retry_count": self.retry_count,
            "metadata": self.metadata
        }


@dataclass
class DegradationResult:
    """Result of graceful degradation."""
    tool_name: str
    original_status: str
    degradation_strategy: DegradationStrategy
    output: Any
    confidence: float
    fallback_used: bool
    fallback_source: Optional[str]
    warning_message: str
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tool_name": self.tool_name,
            "original_status": self.original_status,
            "degradation_strategy": self.degradation_strategy.value,
            "output": self.output,
            "confidence": self.confidence,
            "fallback_used": self.fallback_used,
            "fallback_source": self.fallback_source,
            "warning_message": self.warning_message,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


@dataclass
class UnknownResult:
    """Standardized [UNKNOWN] result for failed tools."""
    tool_name: str
    status: str = "UNKNOWN"
    confidence: float = 0.0
    reason: str = ""
    failure_context: Optional[FailureContext] = None
    suggestions: List[str] = field(default_factory=list)
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tool_name": self.tool_name,
            "status": self.status,
            "confidence": self.confidence,
            "reason": self.reason,
            "failure_context": self.failure_context.to_dict() if self.failure_context else None,
            "suggestions": self.suggestions,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


class FailureDetectionEngine:
    """
    Engine for detecting tool failures and applying graceful degradation.
    
    Provides:
    - Failure type classification
    - Automatic degradation strategies
    - Fallback management
    - Retry logic with backoff
    - [UNKNOWN] result generation
    """

    def __init__(self):
        self.failure_history: List[FailureContext] = []
        self.degradation_history: List[DegradationResult] = []
        self.fallback_registry: Dict[str, Callable] = {}
        self.retry_configs: Dict[str, Dict[str, Any]] = {}
        self._register_default_fallbacks()

    def _register_default_fallbacks(self) -> None:
        """Register default fallback handlers."""
        # Default fallback returns UNKNOWN
        self.register_fallback("default", lambda **kwargs: UnknownResult(
            tool_name=kwargs.get("tool_name", "unknown"),
            reason="Tool execution failed, using default fallback",
            timestamp=self._get_timestamp()
        ))

    def register_fallback(
        self,
        tool_name: str,
        fallback_handler: Callable
    ) -> None:
        """Register a fallback handler for a tool."""
        self.fallback_registry[tool_name] = fallback_handler

    def register_retry_config(
        self,
        tool_name: str,
        max_retries: int = 3,
        backoff_factor: float = 2.0,
        retry_on: Optional[List[FailureType]] = None
    ) -> None:
        """Register retry configuration for a tool."""
        self.retry_configs[tool_name] = {
            "max_retries": max_retries,
            "backoff_factor": backoff_factor,
            "retry_on": retry_on or [FailureType.TIMEOUT, FailureType.NETWORK_ERROR]
        }

    def detect_failure(
        self,
        tool_name: str,
        exception: Exception,
        input_data: Any,
        retry_count: int = 0
    ) -> FailureContext:
        """
        Detect and classify a tool failure.
        
        Args:
            tool_name: Name of the failed tool
            exception: The exception raised
            input_data: Original input data
            retry_count: Number of retries attempted
            
        Returns:
            FailureContext with classified failure
        """
        # Classify failure type
        failure_type = self._classify_failure(exception)
        
        # Get stack trace
        stack_trace = traceback.format_exc()
        
        # Generate error message
        error_message = str(exception) if exception else "Unknown error"
        
        context = FailureContext(
            failure_type=failure_type,
            tool_name=tool_name,
            error_message=error_message,
            stack_trace=stack_trace,
            timestamp=self._get_timestamp(),
            input_data=input_data,
            retry_count=retry_count,
            metadata={
                "exception_type": type(exception).__name__,
                "exception_args": exception.args if exception else ()
            }
        )
        
        self.failure_history.append(context)
        return context

    def _classify_failure(self, exception: Optional[Exception]) -> FailureType:
        """Classify exception into failure type."""
        if exception is None:
            return FailureType.UNKNOWN
        
        exception_type = type(exception).__name__
        exception_msg = str(exception).lower()
        
        # Timeout
        if "timeout" in exception_msg or isinstance(exception, asyncio.TimeoutError):
            return FailureType.TIMEOUT
        
        # Network errors
        if any(x in exception_msg for x in ["connection", "network", "socket", "dns"]):
            return FailureType.NETWORK_ERROR
        
        # Permission errors
        if "permission" in exception_msg or "access" in exception_msg:
            return FailureType.PERMISSION_DENIED
        
        # Validation errors
        if "validation" in exception_msg or "schema" in exception_msg:
            return FailureType.VALIDATION_ERROR
        
        # Resource exhaustion
        if "memory" in exception_msg or "resource" in exception_msg:
            return FailureType.RESOURCE_EXHAUSTED
        
        # Invalid input
        if "invalid" in exception_msg or "bad request" in exception_msg:
            return FailureType.INVALID_INPUT
        
        # Default
        return FailureType.EXCEPTION

    def apply_degradation(
        self,
        failure_context: FailureContext,
        strategy: Optional[DegradationStrategy] = None
    ) -> DegradationResult:
        """
        Apply graceful degradation strategy.
        
        Args:
            failure_context: Context of the failure
            strategy: Degradation strategy (auto-selected if None)
            
        Returns:
            DegradationResult with fallback output
        """
        # Auto-select strategy if not provided
        if strategy is None:
            strategy = self._select_strategy(failure_context)
        
        # Apply strategy
        if strategy == DegradationStrategy.RETURN_UNKNOWN:
            result = self._return_unknown(failure_context)
        elif strategy == DegradationStrategy.USE_FALLBACK:
            result = self._use_fallback(failure_context)
        elif strategy == DegradationStrategy.RETRY_WITH_BACKOFF:
            result = self._retry_with_backoff(failure_context)
        elif strategy == DegradationStrategy.PARTIAL_RESULT:
            result = self._partial_result(failure_context)
        elif strategy == DegradationStrategy.CACHE_HIT:
            result = self._cache_hit(failure_context)
        elif strategy == DegradationStrategy.SKIP_OPTIONAL:
            result = self._skip_optional(failure_context)
        else:
            result = self._return_unknown(failure_context)
        
        self.degradation_history.append(result)
        return result

    def _select_strategy(self, failure_context: FailureContext) -> DegradationStrategy:
        """Automatically select degradation strategy based on failure type."""
        failure_type = failure_context.failure_type
        tool_name = failure_context.tool_name
        
        # Check if retry is configured
        retry_config = self.retry_configs.get(tool_name, {})
        retry_on = retry_config.get("retry_on", [])
        
        if failure_type in retry_on and failure_context.retry_count < retry_config.get("max_retries", 3):
            return DegradationStrategy.RETRY_WITH_BACKOFF
        
        # Check if fallback is registered
        if tool_name in self.fallback_registry:
            return DegradationStrategy.USE_FALLBACK
        
        # Default to UNKNOWN for most failures
        return DegradationStrategy.RETURN_UNKNOWN

    def _return_unknown(self, failure_context: FailureContext) -> DegradationResult:
        """Return [UNKNOWN] result."""
        unknown_result = UnknownResult(
            tool_name=failure_context.tool_name,
            reason=f"Tool failed: {failure_context.error_message}",
            failure_context=failure_context,
            suggestions=self._generate_suggestions(failure_context),
            timestamp=self._get_timestamp()
        )
        
        return DegradationResult(
            tool_name=failure_context.tool_name,
            original_status="error",
            degradation_strategy=DegradationStrategy.RETURN_UNKNOWN,
            output=unknown_result.to_dict(),
            confidence=0.0,
            fallback_used=False,
            fallback_source=None,
            warning_message=f"[UNKNOWN] {failure_context.error_message}",
            timestamp=self._get_timestamp(),
            metadata={"failure_type": failure_context.failure_type.value}
        )

    def _use_fallback(self, failure_context: FailureContext) -> DegradationResult:
        """Use registered fallback handler."""
        tool_name = failure_context.tool_name
        fallback_handler = self.fallback_registry.get(tool_name)
        
        if fallback_handler:
            try:
                fallback_output = fallback_handler(
                    tool_name=tool_name,
                    error=failure_context.error_message,
                    input_data=failure_context.input_data
                )
                
                confidence = 0.5  # Fallback has moderate confidence
                
                return DegradationResult(
                    tool_name=tool_name,
                    original_status="error",
                    degradation_strategy=DegradationStrategy.USE_FALLBACK,
                    output=fallback_output,
                    confidence=confidence,
                    fallback_used=True,
                    fallback_source=tool_name,
                    warning_message=f"Using fallback for {tool_name}",
                    timestamp=self._get_timestamp(),
                    metadata={"failure_type": failure_context.failure_type.value}
                )
            except Exception as e:
                # Fallback failed, return UNKNOWN
                return self._return_unknown(failure_context)
        
        # No fallback registered
        return self._return_unknown(failure_context)

    def _retry_with_backoff(self, failure_context: FailureContext) -> DegradationResult:
        """Schedule retry with exponential backoff."""
        tool_name = failure_context.tool_name
        retry_config = self.retry_configs.get(tool_name, {})
        max_retries = retry_config.get("max_retries", 3)
        backoff_factor = retry_config.get("backoff_factor", 2.0)
        
        if failure_context.retry_count >= max_retries:
            return self._return_unknown(failure_context)
        
        # Calculate backoff delay
        delay = backoff_factor ** failure_context.retry_count
        
        return DegradationResult(
            tool_name=tool_name,
            original_status="retry_scheduled",
            degradation_strategy=DegradationStrategy.RETRY_WITH_BACKOFF,
            output={"retry": True, "delay_seconds": delay, "attempt": failure_context.retry_count + 1},
            confidence=0.3,
            fallback_used=False,
            fallback_source=None,
            warning_message=f"Retry scheduled in {delay}s (attempt {failure_context.retry_count + 1}/{max_retries})",
            timestamp=self._get_timestamp(),
            metadata={
                "failure_type": failure_context.failure_type.value,
                "next_attempt": failure_context.retry_count + 1
            }
        )

    def _partial_result(self, failure_context: FailureContext) -> DegradationResult:
        """Return partial result if available."""
        # Check if input data contains partial results
        if isinstance(failure_context.input_data, dict):
            partial = {
                k: v for k, v in failure_context.input_data.items()
                if not k.startswith("required_")
            }
            
            if partial:
                return DegradationResult(
                    tool_name=failure_context.tool_name,
                    original_status="partial",
                    degradation_strategy=DegradationStrategy.PARTIAL_RESULT,
                    output=partial,
                    confidence=0.4,
                    fallback_used=False,
                    fallback_source=None,
                    warning_message="Returning partial result",
                    timestamp=self._get_timestamp(),
                    metadata={"failure_type": failure_context.failure_type.value}
                )
        
        return self._return_unknown(failure_context)

    def _cache_hit(self, failure_context: FailureContext) -> DegradationResult:
        """Use cached result if available."""
        # Placeholder for cache integration
        return self._return_unknown(failure_context)

    def _skip_optional(self, failure_context: FailureContext) -> DegradationResult:
        """Skip optional tool execution."""
        return DegradationResult(
            tool_name=failure_context.tool_name,
            original_status="skipped",
            degradation_strategy=DegradationStrategy.SKIP_OPTIONAL,
            output=None,
            confidence=0.0,
            fallback_used=False,
            fallback_source=None,
            warning_message="Optional tool skipped due to failure",
            timestamp=self._get_timestamp(),
            metadata={"failure_type": failure_context.failure_type.value}
        )

    def _generate_suggestions(self, failure_context: FailureContext) -> List[str]:
        """Generate suggestions for recovering from failure."""
        suggestions = []
        
        if failure_context.failure_type == FailureType.TIMEOUT:
            suggestions.append("Increase timeout limit")
            suggestions.append("Check for infinite loops")
        elif failure_context.failure_type == FailureType.NETWORK_ERROR:
            suggestions.append("Check network connectivity")
            suggestions.append("Retry in a few moments")
        elif failure_context.failure_type == FailureType.PERMISSION_DENIED:
            suggestions.append("Check file/tool permissions")
            suggestions.append("Run with elevated privileges")
        elif failure_context.failure_type == FailureType.INVALID_INPUT:
            suggestions.append("Validate input format")
            suggestions.append("Check required fields")
        else:
            suggestions.append("Review error logs")
            suggestions.append("Try again with different parameters")
        
        return suggestions

    def get_failure_history(self, limit: int = 10) -> List[FailureContext]:
        """Get recent failure history."""
        return self.failure_history[-limit:]

    def get_degradation_history(self, limit: int = 10) -> List[DegradationResult]:
        """Get recent degradation history."""
        return self.degradation_history[-limit:]

    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        return datetime.utcnow().isoformat()


# Example usage
if __name__ == "__main__":
    engine = FailureDetectionEngine()
    
    # Simulate a timeout failure
    try:
        raise TimeoutError("Tool execution timed out")
    except Exception as e:
        context = engine.detect_failure("web_search", e, {"query": "test"})
        print("Failure detected:")
        print(context.to_dict())
        
        # Apply degradation
        result = engine.apply_degradation(context)
        print("\nDegradation applied:")
        print(result.to_dict())
