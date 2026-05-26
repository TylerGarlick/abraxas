# Story: mc-0ee — Build FHIR Adapter

**Persona:** As an **Integration Developer**, I want **FHIR adapters that consume Epic, Cerner, and Meditech payloads**, so that **Abraxas can process healthcare data from any major EHR system uniformly**.

**Task:** `mc-0ee`
**Phase:** explore
**Created:** 2026-04-01
**Updated:** 2026-04-01

---

## Context & Discovery (Explore)

*What we know:*
- Repo: abraxas
- Target EHRs: Epic, Cerner, Meditech
- FHIR JSON payloads — standard FHIR R4 format expected
- Related: mc-jyq (Claim Translation Layer) consumes output from this adapter
- Labels: dev, ehr, fhir, integration

*Unknowns:*
- Which FHIR resources are used (Patient, Claim, ExplanationOfBenefit, etc.)?
- Auth mechanisms for each EHR (OAuth2? API keys? Smart on FHIR?)
- Whether Epic/Cerner/Meditech use standard FHIR or proprietary extensions
- Known FHIR implementation differences between vendors
- Test data availability — real or synthetic?

## Intent (As a / I want / So that)

- **As a:** Integration Developer
- **I want:** adapters to consume FHIR JSON payloads from Epic, Cerner, and Meditech
- **So that:** Abraxas has a unified interface regardless of which EHR the data came from

## Gap Analysis

*What are we missing?*
- Vendor-specific FHIR profile documentation
- Auth credential management (secrets manager integration needed?)
- Error handling for malformed FHIR — vendor quirks are common
- Whether to normalize to US Core or go straight to canonical format
- Testing strategy without real EHR sandboxes

## Acceptance Criteria (Given / When / Then)

- **Given** a valid Epic FHIR JSON payload
- **When** it is passed to the Epic adapter
- **Then** it returns a normalized canonical FHIR object

- **Given** a valid Cerner FHIR JSON payload
- **When** it is passed to the Cerner adapter
- **Then** it returns a normalized canonical FHIR object

- **Given** a valid Meditech FHIR JSON payload
- **When** it is passed to the Meditech adapter
- **Then** it returns a normalized canonical FHIR object

- **Given** an invalid or malformed FHIR payload from any vendor
- **When** it is passed to the corresponding adapter
- **Then** it throws a descriptive FHIRValidationError with vendor context

## Spec (Plan)

*Detailed specification for another coding agent — coming in Plan phase.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*
