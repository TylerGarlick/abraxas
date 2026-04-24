# Story: mc-jyq — Claim Translation Layer

**Persona:** As a **Claims Developer**, I want **a layer that transforms raw FHIR claims into canonical format**, so that **the adjudication engine receives clean, consistent, unambiguous claims regardless of source EHR**.

**Task:** `mc-jyq`
**Phase:** explore
**Created:** 2026-04-01
**Updated:** 2026-04-01

---

## Context & Discovery (Explore)

*What we know:*
- Repo: abraxas
- Input: raw FHIR claims from Epic/Cerner/Meditech (via mc-0ee FHIR Adapter)
- Output: canonical format for adjudication engine
- Labels: claims, dev, translation

*Unknowns:*
- What is the canonical claim format the adjudication engine expects?
- US Core? A custom profile? HL7 FHIR R4 canonical resources?
- How to handle missing/required fields that differ between vendors?
- Claim line items — how are procedures and diagnoses translated?
- Coding systems: ICD-10, CPT, HCPCS, SNOMED — mapping strategy?
- Pharmacy claims (NCPDP) vs. medical claims — same pipeline or separate?

## Intent (As a / I want / So that)

- **As a:** Claims Developer
- **I want:** raw FHIR claims transformed into a canonical format the adjudication engine can process
- **So that:** the adjudication engine gets consistent, unambiguous claims regardless of which EHR the data originated from

## Gap Analysis

*What are we missing?*
- Canonical format schema — explicit definition needed
- Vendor-specific quirks — known differences between Epic/Cerner/Meditech FHIR
- Code mapping tables — ICD-10, CPT, HCPCS translation
- Graceful handling of unmappable data — reject? default? flag for review?
- Audit trail — should we track which EHR and original codes were received?
- Patient cost sharing, coverage, benefits — how much to translate upfront?

## Acceptance Criteria (Given / When / Then)

- **Given** a valid Epic FHIR Claim resource
- **When** it passes through the translation layer
- **Then** it produces a canonical claim with all required fields populated

- **Given** a valid Cerner FHIR Claim resource
- **When** it passes through the translation layer
- **Then** it produces a canonical claim equivalent to Epic's output

- **Given** a FHIR Claim with a code that cannot be mapped to canonical
- **When** it hits the translation layer
- **Then** it either flags the record for manual review or uses a best-effort mapping with a warning

- **Given** the adjudication engine receives a canonical claim
- **When** it processes it
- **Then** it finds all required fields in the expected format

## Spec (Plan)

*Detailed specification for another coding agent — coming in Plan phase.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*
