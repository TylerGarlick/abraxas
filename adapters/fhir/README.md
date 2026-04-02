# FHIR Adapter for Abraxas

FHIR R4 adapter module for parsing and normalizing EHR data from multiple providers (Epic, Cerner, Meditech).

## Overview

This adapter provides a unified interface for consuming FHIR R4 resources from different EHR systems. It automatically detects the EHR provider and applies provider-specific parsing logic to normalize the data into a canonical format.

## Features

- **Auto-detection** of EHR system (Epic, Cerner, Meditech)
- **Provider-specific adapters** with custom parsing logic
- **Canonical normalization** to FHIR R4 standard
- **Batch processing** support
- **Statistics tracking** for monitoring
- **Comprehensive test suite**

## Supported Resources

- `Patient` - Patient demographics and identifiers
- `Claim` - Healthcare claims with diagnoses, procedures, and line items
- `Coverage` - Insurance coverage information

## Usage

### Basic Usage

```typescript
import { FHIRAdapter, EHRSystem } from './adapters/fhir';

// Create adapter with auto-detection
const adapter = new FHIRAdapter();

// Parse a FHIR resource (auto-detects EHR system)
const result = adapter.parse(fhirResource);

if (result.success) {
  console.log(`Parsed ${result.resourceType} from ${result.ehrSystem}`);
  console.log(result.data);
} else {
  console.error('Parse failed:', result.errors);
}
```

### Force Specific EHR System

```typescript
const adapter = new FHIRAdapter({
  forceSystem: EHRSystem.EPIC,
  autoDetect: false,
  verbose: true,
});

const result = adapter.parse(fhirResource);
```

### Batch Processing

```typescript
const resources = [patient1, claim1, coverage1];
const results = adapter.parseBatch(resources);

for (const result of results) {
  if (result.success) {
    // Process normalized data
  }
}
```

### Provider-Specific Adapters

```typescript
import { createEpicAdapter } from './adapters/fhir';

const epicAdapter = createEpicAdapter();
const result = epicAdapter.parsePatient(epicPatientResource);
```

## Provider-Specific Handling

### Epic

- Detects Epic-specific identifier systems (`http://Epic.com/fhir/identifiers/*`)
- Handles CUDA extensions for billing
- Supports multiple MRN domains

### Cerner (Oracle Health)

- Detects Cerner identifier systems (`http://cerner.com/fhir/identifiers/*`)
- Handles Oracle Healthcare OIDs
- Parses nested bundle structures

### Meditech

- Detects Meditech identifier systems
- Handles BARBABANNER custom extensions
- Supports Meditech-specific identifier patterns

## Normalized Data Structures

### NormalizedPatient

```typescript
interface NormalizedPatient {
  patientId: string;
  identifiers: NormalizedIdentifier[];
  name?: NormalizedHumanName;
  gender?: string;
  birthDate?: string;
  addresses: NormalizedAddress[];
  contacts: NormalizedContact[];
  ehrSystem: string;
  rawResource: FhirResource;
}
```

### NormalizedClaim

```typescript
interface NormalizedClaim {
  claimId: string;
  status: string;
  claimType: string;
  claimUse: string;
  patientRef?: string;
  createdDate?: string;
  insurerRef?: string;
  diagnoses: NormalizedDiagnosis[];
  procedures: NormalizedProcedure[];
  lineItems: NormalizedLineItem[];
  totalAmount?: NormalizedMoney;
  ehrSystem: string;
  rawResource: FhirResource;
}
```

### NormalizedCoverage

```typescript
interface NormalizedCoverage {
  coverageId: string;
  status: string;
  coverageType?: string;
  subscriberRef?: string;
  beneficiaryRef?: string;
  payerName?: string;
  coverageClasses: NormalizedCoverageClass[];
  ehrSystem: string;
  rawResource: FhirResource;
}
```

## Testing

Run the test suite:

```bash
npm test -- adapters/fhir
```

Or with vitest:

```bash
vitest run adapters/fhir/fhir-adapter.test.ts
```

## Mock Data

Use the included mock payloads for testing:

```typescript
import mockPayloads from './adapters/fhir/mock-fhir-payloads.json';

const epicPatient = mockPayloads.patients.epic;
const cernerClaim = mockPayloads.claims.cerner;
```

## Statistics

Track parsing performance:

```typescript
const stats = adapter.getStats();
console.log(stats);
// {
//   totalParsed: 100,
//   successfulParses: 98,
//   failedParses: 2,
//   warningsCount: 5,
//   byResourceType: { Patient: 50, Claim: 30, Coverage: 20 },
//   byEhrSystem: { EPIC: 40, CERNER: 35, MEDITECH: 23, UNKNOWN: 2 }
// }
```

## File Structure

```
adapters/fhir/
├── index.ts                 # Module entry point
├── fhir-adapter.ts          # Main adapter class
├── fhir-normalizer.ts       # Canonical normalization utilities
├── fhir-adapter.test.ts     # Unit tests
├── mock-fhir-payloads.json  # Mock test data
├── README.md                # This file
└── providers/
    ├── epic.ts              # Epic-specific adapter
    ├── cerner.ts            # Cerner-specific adapter
    └── meditech.ts          # Meditech-specific adapter
```

## License

Same as Abraxas project license.
