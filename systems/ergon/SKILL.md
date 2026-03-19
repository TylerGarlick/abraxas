# Ergon System - Tool-Use Verification

## Overview

The Ergon system provides tool-use verification through sandboxed execution, output validation, failure detection, and graceful degradation. Ensures tools produce verified, schema-compliant results or return [UNKNOWN] on failure.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Ergon System                             │
├──────────────────────────────────────────────────────────────┤
│  E1: Sandbox  →  E2: Validation  →  E3: Failure Detection    │
│                         ↓                                      │
│                   E4: API Integration                        │
└──────────────────────────────────────────────────────────────┘
```

## Components

### E1: Tool Execution Sandbox (`sandbox.py`)

**Purpose:** Isolated execution with timeouts and resource limits

**Features:**
- Process isolation (RLIMIT_CPU, RLIMIT_AS, RLIMIT_NPROC)
- Configurable timeouts (CPU time, wall time)
- Memory limits (default 512MB)
- File size limits (default 10MB)
- Network isolation (optional)
- Filesystem write control

**Resource Limits:**
```python
ResourceLimits(
    max_cpu_time=30.0,      # seconds
    max_wall_time=60.0,     # seconds
    max_memory_mb=512,
    max_file_size_mb=10,
    max_processes=5,
    max_open_files=10,
    network_enabled=False,
    filesystem_write=False
)
```

**Usage:**
```python
from ergon.sandbox import ToolExecutionSandbox

sandbox = ToolExecutionSandbox()
result = sandbox.execute(
    tool_name="my_tool",
    command="python script.py",
    limits=ResourceLimits(max_cpu_time=10.0)
)
print(result.status)  # COMPLETED, TIMEOUT, ERROR
```

### E2: Output Validation (`validation.py`)

**Purpose:** Verify tool outputs match expected schemas

**Features:**
- JSON Schema validation
- Type checking
- Contract validation (preconditions/postconditions)
- Partial validation fallback
- Warning generation

**Built-in Schemas:**
- `generic_tool_output` - Standard success/data/error format
- `api_response` - REST API responses
- `file_operation` - File operation results

**Usage:**
```python
from ergon.validation import OutputValidationEngine

validator = OutputValidationEngine()
result = validator.validate(
    tool_name="my_tool",
    output={"success": True, "data": {...}},
    schema_id="generic_tool_output"
)
print(result.status)  # VALID, INVALID, PARTIAL
```

### E3: Failure Detection (`failure_detection.py`)

**Purpose:** Detect failures and apply graceful degradation

**Failure Types:**
- TIMEOUT - Execution timeout
- EXCEPTION - Runtime exception
- VALIDATION_ERROR - Schema validation failed
- RESOURCE_EXHAUSTED - Memory/CPU limits hit
- NETWORK_ERROR - Connection failures
- PERMISSION_DENIED - Access denied
- INVALID_INPUT - Bad parameters

**Degradation Strategies:**
- RETURN_UNKNOWN - Standard [UNKNOWN] response
- USE_FALLBACK - Registered fallback handler
- RETRY_WITH_BACKOFF - Exponential backoff retry
- PARTIAL_RESULT - Return partial data
- CACHE_HIT - Use cached result
- SKIP_OPTIONAL - Skip non-critical tools

**Usage:**
```python
from ergon.failure_detection import FailureDetectionEngine

detector = FailureDetectionEngine()

# Detect failure
context = detector.detect_failure("tool_name", exception, input_data)

# Apply degradation
result = detector.apply_degradation(context)
print(result.degradation_strategy)  # RETURN_UNKNOWN, USE_FALLBACK, etc.
```

### E4: API Integration (`api.py`)

**Purpose:** Tool-use endpoints with verification middleware

**Features:**
- Request/response handling
- Verification pipeline (sandbox → validate → degrade)
- Rate limiting
- Processing metrics
- Tool handler registry

**API Response Format:**
```json
{
  "request_id": "REQ-001",
  "status": "success|error|unknown|partial",
  "data": {...},
  "verification_status": "valid|invalid|partial",
  "processing_time_ms": 123.45,
  "metadata": {...}
}
```

**Usage:**
```python
from ergon.api import ToolUseAPI, ToolRequest

api = ToolUseAPI()
request = ToolRequest(
    tool_name="echo",
    command="echo",
    arguments={"message": "test"},
    timeout_ms=5000,
    request_id="REQ-001"
)
response = await api.execute_tool(request)
```

## Default Tools

Registered by default:
- `echo` - Echo messages
- `read_file` - Read file contents
- `write_file` - Write file contents
- `exec_command` - Execute shell commands

## Failure Response Format

When tools fail, Ergon returns standardized [UNKNOWN]:

```json
{
  "tool_name": "web_search",
  "status": "UNKNOWN",
  "confidence": 0.0,
  "reason": "Tool execution timed out",
  "suggestions": ["Increase timeout limit", "Check for infinite loops"],
  "timestamp": "2026-03-19T17:00:00"
}
```

## Integration with Logos

Ergon provides tool verification for Logos L2:

```python
# Logos uses Ergon for source verification
from logos.verification import CrossSourceVerificationEngine
from ergon.sandbox import ToolExecutionSandbox

verification_engine = CrossSourceVerificationEngine()
# Internally uses Ergon sandbox for safe tool execution
```

## Installation

```bash
# Ensure dependencies
pip install jsonschema
```

## Testing

```bash
cd /abraxas/systems/ergon
python -m pytest tests/ -v
```

## Example Pipeline

```python
from ergon.api import ToolUseAPI, ToolRequest

async def execute_verified_tool(tool_name: str, **kwargs):
    api = ToolUseAPI()
    request = ToolRequest(
        tool_name=tool_name,
        command=tool_name,
        arguments=kwargs,
        timeout_ms=10000,
        request_id=f"REQ-{tool_name}"
    )
    
    response = await api.execute_tool(request)
    
    if response.status == "success":
        return response.data
    else:
        return {"status": "UNKNOWN", "reason": response.metadata.get("error")}
```

## Version

3.0.0 - Abraxas v3 Phase 1
