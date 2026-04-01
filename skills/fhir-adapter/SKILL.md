# FHIR Adapter Skill

FHIR R4 adapter for Epic, Cerner, and Meditech EHR systems.

## Supported Resources

- **Patient** - Patient demographics, identifiers, addresses, contacts
- **Claim** - Insurance claims with diagnoses, procedures, line items
- **Coverage** - Insurance coverage with classes and payor info

## EHR-Specific Handling

### Epic
- MRN extension detection via `http://Epic.com/fhir/identifiers/mrn`
- CUDA billing extensions
- Multi-domain MRN support

### Cerner (Oracle Health)
- Oracle profile detection via `http://oracle.com/fhir/`
- FHIROracleIdentifier extension handling
- Member class type parsing

### Meditech
- BARBABANNER identifier extension
- Meditech-specific identifier systems
- Proprietary extension detection

## Usage

```python
from skills.fhir_adapter import FHIRAdapter

adapter = FHIRAdapter()

# Auto-detect EHR and parse
result = adapter.parse(fhir_resource)

# Explicit EHR system
result = adapter.parse_with(fhir_resource, EHRSystem.EPIC)

# Direct adapter access
patient, warnings = adapter.epic.parse_patient(resource)
```

## Testing

```bash
# Unit tests
python -m pytest tests/fhir/test_patient_mapping.py -v
python -m pytest tests/fhir/test_claim_mapping.py -v
python -m pytest tests/fhir/test_coverage_mapping.py -v

# Integration tests (requires mock server)
python -m pytest tests/fhir/test_integration.py -v
```

## CLI Commands

The adapter supports these operations via the skill interface:

- `parse <json>` - Parse FHIR resource with auto-detection
- `detect <json>` - Detect EHR system from resource
- `validate <json>` - Validate FHIR resource structure
