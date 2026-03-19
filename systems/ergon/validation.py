"""
E2: Output Validation
Verifies tool outputs match expected schemas.
"""

import json
import re
from typing import Dict, Any, Optional, List, Union, Type
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import jsonschema
from jsonschema import validate, ValidationError, Draft7Validator


class ValidationStatus(Enum):
    VALID = "valid"
    INVALID = "invalid"
    PARTIAL = "partial"
    UNKNOWN = "unknown"


@dataclass
class SchemaDefinition:
    """JSON schema definition for tool output."""
    schema_id: str
    schema: Dict[str, Any]
    description: str
    version: str
    created_at: str
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ValidationResult:
    """Result of output validation."""
    tool_name: str
    status: ValidationStatus
    output_data: Any
    expected_schema: str
    errors: List[str]
    warnings: List[str]
    validated_fields: int
    total_fields: int
    confidence: float
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tool_name": self.tool_name,
            "status": self.status.value,
            "output_data": self.output_data,
            "expected_schema": self.expected_schema,
            "errors": self.errors,
            "warnings": self.warnings,
            "validated_fields": self.validated_fields,
            "total_fields": self.total_fields,
            "confidence": self.confidence,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


class OutputValidationEngine:
    """
    Engine for validating tool outputs against expected schemas.
    
    Provides:
    - JSON Schema validation
    - Type checking
    - Contract validation
    - Custom validators
    """

    def __init__(self):
        self.schema_registry: Dict[str, SchemaDefinition] = {}
        self.validation_history: List[ValidationResult] = []
        self._register_builtin_schemas()

    def _register_builtin_schemas(self) -> None:
        """Register builtin schemas for common tool types."""
        # Generic tool output schema
        self.register_schema(SchemaDefinition(
            schema_id="generic_tool_output",
            schema={
                "type": "object",
                "required": ["success", "data"],
                "properties": {
                    "success": {"type": "boolean"},
                    "data": {"type": ["object", "array", "string", "number", "boolean", "null"]},
                    "error": {"type": "string"},
                    "metadata": {"type": "object"}
                }
            },
            description="Generic tool output schema",
            version="1.0.0",
            created_at=self._get_timestamp()
        ))
        
        # API response schema
        self.register_schema(SchemaDefinition(
            schema_id="api_response",
            schema={
                "type": "object",
                "required": ["status", "data"],
                "properties": {
                    "status": {"type": "string", "enum": ["success", "error"]},
                    "data": {"type": "object"},
                    "message": {"type": "string"},
                    "code": {"type": "integer"}
                }
            },
            description="REST API response schema",
            version="1.0.0",
            created_at=self._get_timestamp()
        ))
        
        # File operation schema
        self.register_schema(SchemaDefinition(
            schema_id="file_operation",
            schema={
                "type": "object",
                "required": ["operation", "path"],
                "properties": {
                    "operation": {"type": "string", "enum": ["read", "write", "delete", "move"]},
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                    "size": {"type": "integer"},
                    "timestamp": {"type": "string"}
                }
            },
            description="File operation result schema",
            version="1.0.0",
            created_at=self._get_timestamp()
        ))

    def register_schema(self, schema_def: SchemaDefinition) -> None:
        """Register a new schema."""
        self.schema_registry[schema_def.schema_id] = schema_def

    def validate(
        self,
        tool_name: str,
        output: Any,
        schema_id: Optional[str] = None,
        custom_schema: Optional[Dict[str, Any]] = None
    ) -> ValidationResult:
        """
        Validate tool output against schema.
        
        Args:
            tool_name: Name of the tool
            output: Output data to validate
            schema_id: ID of registered schema to use
            custom_schema: Custom schema dict (overrides schema_id)
            
        Returns:
            ValidationResult with validation status
        """
        # Determine schema
        if custom_schema:
            schema = custom_schema
            schema_id = schema_id or "custom"
        elif schema_id and schema_id in self.schema_registry:
            schema = self.schema_registry[schema_id].schema
        else:
            # Use generic schema as fallback
            schema = self.schema_registry.get("generic_tool_output", SchemaDefinition(
                schema_id="generic",
                schema={},
                description="Fallback",
                version="1.0.0",
                created_at=self._get_timestamp()
            )).schema
            schema_id = "generic_tool_output"
        
        # Perform validation
        errors = []
        warnings = []
        
        try:
            validate(instance=output, schema=schema)
            status = ValidationStatus.VALID
            confidence = 1.0
        except ValidationError as e:
            errors.append(str(e.message))
            status = ValidationStatus.INVALID
            confidence = 0.0
            
            # Try partial validation
            partial_result = self._attempt_partial_validation(output, schema)
            if partial_result:
                status = ValidationStatus.PARTIAL
                confidence = partial_result['confidence']
                warnings.extend(partial_result['warnings'])
        
        # Count validated fields
        validated_count, total_count = self._count_fields(output, schema)
        
        # Add type-specific warnings
        type_warnings = self._check_type_constraints(output, schema)
        warnings.extend(type_warnings)
        
        result = ValidationResult(
            tool_name=tool_name,
            status=status,
            output_data=output,
            expected_schema=schema_id,
            errors=errors,
            warnings=warnings,
            validated_fields=validated_count,
            total_fields=total_count,
            confidence=confidence,
            timestamp=self._get_timestamp(),
            metadata={
                "schema_version": self.schema_registry.get(schema_id, SchemaDefinition("", {}, "", "", "")).version,
                "validator": "jsonschema",
                "num_errors": len(errors),
                "num_warnings": len(warnings)
            }
        )
        
        self.validation_history.append(result)
        return result

    def _attempt_partial_validation(
        self,
        output: Any,
        schema: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Attempt partial validation when full validation fails.
        
        Checks which parts of the output are valid.
        """
        if not isinstance(output, dict) or not isinstance(schema, dict):
            return None
        
        required_fields = schema.get("required", [])
        properties = schema.get("properties", {})
        
        valid_fields = 0
        total_fields = len(required_fields)
        warnings = []
        
        for field in required_fields:
            if field in output:
                valid_fields += 1
            else:
                warnings.append(f"Missing required field: {field}")
        
        confidence = valid_fields / max(1, total_fields)
        
        if confidence > 0.5:
            return {
                'confidence': confidence,
                'warnings': warnings
            }
        
        return None

    def _count_fields(self, output: Any, schema: Dict[str, Any]) -> tuple:
        """Count validated vs total fields."""
        if not isinstance(output, dict):
            return 0, 0
        
        properties = schema.get("properties", {})
        required = schema.get("required", [])
        
        total = len(set(required + list(properties.keys())))
        validated = sum(1 for field in properties if field in output)
        
        return validated, total

    def _check_type_constraints(
        self,
        output: Any,
        schema: Dict[str, Any]
    ) -> List[str]:
        """Check type constraints and return warnings."""
        warnings = []
        
        if not isinstance(output, dict):
            return warnings
        
        properties = schema.get("properties", {})
        
        for field_name, field_schema in properties.items():
            if field_name not in output:
                continue
            
            value = output[field_name]
            expected_type = field_schema.get("type")
            
            if expected_type == "string" and not isinstance(value, str):
                warnings.append(f"Field '{field_name}' expected string, got {type(value).__name__}")
            elif expected_type == "integer" and not isinstance(value, int):
                warnings.append(f"Field '{field_name}' expected integer, got {type(value).__name__}")
            elif expected_type == "number" and not isinstance(value, (int, float)):
                warnings.append(f"Field '{field_name}' expected number, got {type(value).__name__}")
            elif expected_type == "boolean" and not isinstance(value, bool):
                warnings.append(f"Field '{field_name}' expected boolean, got {type(value).__name__}")
            elif expected_type == "array" and not isinstance(value, list):
                warnings.append(f"Field '{field_name}' expected array, got {type(value).__name__}")
            elif expected_type == "object" and not isinstance(value, dict):
                warnings.append(f"Field '{field_name}' expected object, got {type(value).__name__}")
        
        return warnings

    def validate_type(
        self,
        value: Any,
        expected_type: str,
        field_name: str = "value"
    ) -> ValidationResult:
        """Validate a single value against expected type."""
        type_map = {
            "string": str,
            "integer": int,
            "number": (int, float),
            "boolean": bool,
            "array": list,
            "object": dict,
            "null": type(None)
        }
        
        expected_python_type = type_map.get(expected_type)
        
        if expected_python_type is None:
            return ValidationResult(
                tool_name="type_checker",
                status=ValidationStatus.UNKNOWN,
                output_data=value,
                expected_schema=expected_type,
                errors=[f"Unknown type: {expected_type}"],
                warnings=[],
                validated_fields=0,
                total_fields=1,
                confidence=0.0,
                timestamp=self._get_timestamp()
            )
        
        if isinstance(value, expected_python_type):
            status = ValidationStatus.VALID
            confidence = 1.0
            errors = []
        else:
            status = ValidationStatus.INVALID
            confidence = 0.0
            errors = [f"Expected {expected_type}, got {type(value).__name__}"]
        
        return ValidationResult(
            tool_name="type_checker",
            status=status,
            output_data=value,
            expected_schema=expected_type,
            errors=errors,
            warnings=[],
            validated_fields=1 if status == ValidationStatus.VALID else 0,
            total_fields=1,
            confidence=confidence,
            timestamp=self._get_timestamp(),
            metadata={"field_name": field_name}
        )

    def validate_contract(
        self,
        tool_name: str,
        preconditions: Dict[str, Any],
        postconditions: Dict[str, Any],
        actual_output: Any
    ) -> ValidationResult:
        """
        Validate contract (preconditions + postconditions).
        
        Design-by-contract approach for tool verification.
        """
        errors = []
        warnings = []
        
        # Check postconditions
        for field, expected in postconditions.items():
            if field not in actual_output:
                errors.append(f"Postcondition failed: missing field '{field}'")
            elif actual_output[field] != expected:
                errors.append(f"Postcondition failed: '{field}' expected {expected}, got {actual_output[field]}")
        
        if errors:
            status = ValidationStatus.INVALID
            confidence = 0.0
        else:
            status = ValidationStatus.VALID
            confidence = 1.0
        
        return ValidationResult(
            tool_name=tool_name,
            status=status,
            output_data=actual_output,
            expected_schema="contract",
            errors=errors,
            warnings=warnings,
            validated_fields=len(postconditions) - len(errors),
            total_fields=len(postconditions),
            confidence=confidence,
            timestamp=self._get_timestamp(),
            metadata={
                "preconditions": preconditions,
                "postconditions": postconditions
            }
        )

    def get_validation_history(self, limit: int = 10) -> List[ValidationResult]:
        """Get recent validation history."""
        return self.validation_history[-limit:]

    def get_schema(self, schema_id: str) -> Optional[SchemaDefinition]:
        """Get registered schema by ID."""
        return self.schema_registry.get(schema_id)

    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        return datetime.utcnow().isoformat()


# Example usage
if __name__ == "__main__":
    engine = OutputValidationEngine()
    
    # Valid output
    valid_output = {
        "success": True,
        "data": {"result": "test"},
        "metadata": {"version": "1.0"}
    }
    
    result = engine.validate("test_tool", valid_output, schema_id="generic_tool_output")
    print("Valid test:")
    print(result.to_dict())
    
    # Invalid output
    invalid_output = {
        "success": "not_a_boolean",
        "missing_data": True
    }
    
    result = engine.validate("test_tool", invalid_output, schema_id="generic_tool_output")
    print("\nInvalid test:")
    print(result.to_dict())
