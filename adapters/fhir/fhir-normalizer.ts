/**
 * FHIR R4 Normalizer
 * 
 * Canonical FHIR R4 normalization utilities for EHR data.
 * Converts provider-specific FHIR variants into canonical R4 format.
 */

export interface FhirResource {
  resourceType: string;
  id?: string;
  meta?: {
    profile?: string[];
    lastUpdated?: string;
  };
  [key: string]: unknown;
}

export interface NormalizedPatient {
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

export interface NormalizedClaim {
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

export interface NormalizedCoverage {
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

export interface NormalizedIdentifier {
  system?: string;
  value?: string;
  typeCode?: string;
  typeDisplay?: string;
}

export interface NormalizedHumanName {
  use?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface NormalizedAddress {
  use?: string;
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface NormalizedContact {
  system?: string;
  value?: string;
  use?: string;
}

export interface NormalizedDiagnosis {
  sequence: number;
  code?: string;
  display?: string;
  typeCode?: string;
  useCode?: string;
}

export interface NormalizedProcedure {
  sequence: number;
  code?: string;
  display?: string;
  date?: string;
  outcome?: Record<string, unknown>;
}

export interface NormalizedLineItem {
  sequence: number;
  serviceCode?: string;
  serviceDisplay?: string;
  quantity?: number;
  unitPrice?: number;
  factor?: number;
  netAmount?: number;
  diagnosisLinks?: Array<{ diagnosisSequence: number[] }>;
}

export interface NormalizedMoney {
  value?: number;
  currency?: string;
}

export interface NormalizedCoverageClass {
  typeCode?: string;
  typeDisplay?: string;
  value?: string;
  name?: string;
}

export interface ParseWarnings {
  warnings: string[];
  errors: string[];
}

export interface ParseResult<T> {
  success: boolean;
  resourceType: string;
  data?: T;
  ehrSystem: string;
  warnings?: string[];
  errors?: string[];
}

/**
 * Extract code from FHIR CodeableConcept
 */
export function getCode(codeable: Record<string, unknown>): string | undefined {
  const coding = (codeable.coding as Array<Record<string, unknown>>) || [];
  if (coding.length > 0) {
    return coding[0].code as string;
  }
  return codeable.text as string;
}

/**
 * Extract display from FHIR CodeableConcept
 */
export function getDisplay(codeable: Record<string, unknown>): string | undefined {
  const coding = (codeable.coding as Array<Record<string, unknown>>) || [];
  if (coding.length > 0) {
    return coding[0].display as string;
  }
  return codeable.text as string;
}

/**
 * Extract reference string from FHIR reference
 */
export function getReference(refDict: Record<string, unknown>): string | undefined {
  return refDict.reference as string;
}

/**
 * Parse FHIR HumanName
 */
export function parseHumanName(nameDict: Record<string, unknown>): NormalizedHumanName | undefined {
  if (!nameDict || Object.keys(nameDict).length === 0) {
    return undefined;
  }
  return {
    use: nameDict.use as string,
    family: nameDict.family as string,
    given: (nameDict.given as string[]) || [],
    prefix: (nameDict.prefix as string[]) || [],
    suffix: (nameDict.suffix as string[]) || [],
  };
}

/**
 * Parse FHIR Address
 */
export function parseAddress(addrDict: Record<string, unknown>): NormalizedAddress {
  return {
    use: addrDict.use as string,
    line: (addrDict.line as string[]) || [],
    city: addrDict.city as string,
    state: addrDict.state as string,
    postalCode: addrDict.postalCode as string,
    country: addrDict.country as string,
  };
}

/**
 * Parse FHIR Contact (telecom)
 */
export function parseContact(telecom: Record<string, unknown>): NormalizedContact {
  return {
    system: telecom.system as string,
    value: telecom.value as string,
    use: telecom.use as string,
  };
}

/**
 * Normalize a FHIR Patient resource
 */
export function normalizePatient(
  resource: FhirResource,
  ehrSystem: string
): ParseResult<NormalizedPatient> {
  const warnings: string[] = [];

  if (resource.resourceType !== "Patient") {
    return {
      success: false,
      resourceType: resource.resourceType,
      ehrSystem,
      errors: [`Expected Patient resource, got ${resource.resourceType}`],
    };
  }

  const names = (resource.name as Array<Record<string, unknown>>) || [];
  const name = parseHumanName(names[0] || {});

  const addresses: NormalizedAddress[] = [];
  for (const addrDict of (resource.address as Array<Record<string, unknown>>) || []) {
    addresses.push(parseAddress(addrDict));
  }

  const contacts: NormalizedContact[] = [];
  for (const telecom of (resource.telecom as Array<Record<string, unknown>>) || []) {
    contacts.push(parseContact(telecom));
  }

  const identifiers: NormalizedIdentifier[] = [];
  for (const identifier of (resource.identifier as Array<Record<string, unknown>>) || []) {
    const typeDict = (identifier.type as Record<string, unknown>) || {};
    const coding = (typeDict.coding as Array<Record<string, unknown>>) || [];
    identifiers.push({
      system: identifier.system as string,
      value: identifier.value as string,
      typeCode: coding[0]?.code as string,
      typeDisplay: coding[0]?.display as string,
    });
  }

  const patient: NormalizedPatient = {
    patientId: resource.id || "",
    identifiers,
    name,
    gender: resource.gender as string,
    birthDate: resource.birthDate as string,
    addresses,
    contacts,
    ehrSystem,
    rawResource: resource,
  };

  return {
    success: true,
    resourceType: "Patient",
    data: patient,
    ehrSystem,
    warnings,
  };
}

/**
 * Normalize a FHIR Claim resource
 */
export function normalizeClaim(
  resource: FhirResource,
  ehrSystem: string
): ParseResult<NormalizedClaim> {
  const warnings: string[] = [];

  if (resource.resourceType !== "Claim") {
    return {
      success: false,
      resourceType: resource.resourceType,
      ehrSystem,
      errors: [`Expected Claim resource, got ${resource.resourceType}`],
    };
  }

  const status = (resource.status as string) || "unknown";
  const typeCoding = ((resource.type as Record<string, unknown>)?.coding as Array<Record<string, unknown>>) || [];
  const claimType = typeCoding[0]?.code as string || "unknown";
  const claimUse = (resource.use as string) || "";

  // Parse diagnoses
  const diagnoses: NormalizedDiagnosis[] = [];
  const diagnosisArray = (resource.diagnosis as Array<Record<string, unknown>>) || [];
  for (let idx = 0; idx < diagnosisArray.length; idx++) {
    const diag = diagnosisArray[idx];
    const diagCodeable = (diag.diagnosisCodeableConcept as Record<string, unknown>) || {};
    const typeArray = (diag.type as Array<Record<string, unknown>>) || [];
    diagnoses.push({
      sequence: idx + 1,
      code: getCode(diagCodeable),
      display: getDisplay(diagCodeable),
      typeCode: getCode(typeArray[0] || {}),
      useCode: getCode((diag.use as Record<string, unknown>) || {}),
    });
  }

  // Parse procedures
  const procedures: NormalizedProcedure[] = [];
  const procArray = (resource.procedure as Array<Record<string, unknown>>) || [];
  for (let idx = 0; idx < procArray.length; idx++) {
    const proc = procArray[idx];
    const procCodeable = (proc.procedureCodeableConcept as Record<string, unknown>) || {};
    procedures.push({
      sequence: idx + 1,
      code: getCode(procCodeable),
      display: getDisplay(procCodeable),
      date: proc.date as string,
      outcome: proc.outcome as Record<string, unknown>,
    });
  }

  // Parse line items
  const lineItems: NormalizedLineItem[] = [];
  const itemArray = (resource.item as Array<Record<string, unknown>>) || [];
  for (let idx = 0; idx < itemArray.length; idx++) {
    const item = itemArray[idx];
    const service = (item.service as Record<string, unknown>) || {};
    const quantity = (item.quantity as Record<string, unknown>) || {};
    const net = (item.net as Record<string, unknown>) || {};
    lineItems.push({
      sequence: idx + 1,
      serviceCode: getCode(service),
      serviceDisplay: getDisplay(service),
      quantity: quantity.value as number,
      unitPrice: (quantity.unitPrice as Record<string, unknown>)?.value as number,
      factor: item.factor as number,
      netAmount: net.value as number,
      diagnosisLinks: (item.diagnosisLink as Array<{ diagnosisSequence: number[] }>) || [],
    });
  }

  // Parse total amount
  const totalDict = (resource.total as Record<string, unknown>) || {};
  const totalAmount: NormalizedMoney | undefined = totalDict.value !== undefined
    ? {
        value: totalDict.value as number,
        currency: totalDict.currency as string,
      }
    : undefined;

  const claim: NormalizedClaim = {
    claimId: resource.id || "",
    status,
    claimType,
    claimUse,
    patientRef: getReference((resource.patient as Record<string, unknown>) || {}),
    createdDate: resource.created as string,
    insurerRef: getReference((resource.insurer as Record<string, unknown>) || {}),
    diagnoses,
    procedures,
    lineItems,
    totalAmount,
    ehrSystem,
    rawResource: resource,
  };

  return {
    success: true,
    resourceType: "Claim",
    data: claim,
    ehrSystem,
    warnings,
  };
}

/**
 * Normalize a FHIR Coverage resource
 */
export function normalizeCoverage(
  resource: FhirResource,
  ehrSystem: string
): ParseResult<NormalizedCoverage> {
  const warnings: string[] = [];

  if (resource.resourceType !== "Coverage") {
    return {
      success: false,
      resourceType: resource.resourceType,
      ehrSystem,
      errors: [`Expected Coverage resource, got ${resource.resourceType}`],
    };
  }

  const status = (resource.status as string) || "unknown";
  const coverageType = getDisplay((resource.type as Record<string, unknown>) || {});
  const subscriberRef = getReference((resource.subscriber as Record<string, unknown>) || {});
  const beneficiaryRef = getReference((resource.beneficiary as Record<string, unknown>) || {});

  // Parse payer
  const payorArray = (resource.payor as Array<Record<string, unknown>>) || [];
  const payerName = getDisplay(payorArray[0] || {});

  // Parse coverage classes
  const coverageClasses: NormalizedCoverageClass[] = [];
  const classArray = (resource.class as Array<Record<string, unknown>>) || [];
  for (const costClass of classArray) {
    const typeDict = (costClass.type as Record<string, unknown>) || {};
    const typeCoding = (typeDict.coding as Array<Record<string, unknown>>) || [];
    coverageClasses.push({
      typeCode: typeCoding[0]?.code as string,
      typeDisplay: getDisplay(typeDict),
      value: costClass.value as string,
      name: costClass.name as string,
    });
  }

  const coverage: NormalizedCoverage = {
    coverageId: resource.id || "",
    status,
    coverageType,
    subscriberRef,
    beneficiaryRef,
    payerName,
    coverageClasses,
    ehrSystem,
    rawResource: resource,
  };

  return {
    success: true,
    resourceType: "Coverage",
    data: coverage,
    ehrSystem,
    warnings,
  };
}
