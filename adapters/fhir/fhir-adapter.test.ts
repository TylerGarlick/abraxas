/**
 * FHIR Adapter Unit Tests
 * 
 * Tests for FHIR R4 adapter parsing and normalization.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  FHIRAdapter,
  createFHIRAdapter,
  EHRSystem,
  EpicFHIRAdapter,
  CernerFHIRAdapter,
  MeditechFHIRAdapter,
  createEpicAdapter,
  createCernerAdapter,
  createMeditechAdapter,
} from "./fhir-adapter";

import {
  normalizePatient,
  normalizeClaim,
  normalizeCoverage,
  getCode,
  getDisplay,
} from "./fhir-normalizer";

// Mock FHIR Patient resource (Epic)
const mockEpicPatient = {
  resourceType: "Patient",
  id: "patient-123",
  identifier: [
    {
      system: "http://Epic.com/fhir/identifiers/mrn",
      value: "MRN123456",
      type: {
        coding: [
          {
            code: "MRN",
            display: "Medical Record Number",
          },
        ],
      },
    },
  ],
  name: [
    {
      use: "official",
      family: "Smith",
      given: ["John", "Michael"],
    },
  ],
  gender: "male",
  birthDate: "1980-05-15",
  telecom: [
    {
      system: "phone",
      value: "555-123-4567",
      use: "home",
    },
  ],
  address: [
    {
      use: "home",
      line: ["123 Main St"],
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
    },
  ],
};

// Mock FHIR Claim resource (Cerner)
const mockCernerClaim = {
  resourceType: "Claim",
  id: "claim-456",
  status: "active",
  type: {
    coding: [
      {
        code: "professional",
        display: "Professional",
      },
    ],
  },
  use: "claim",
  patient: {
    reference: "Patient/patient-123",
  },
  created: "2024-01-15",
  insurer: {
    reference: "Organization/insurer-789",
  },
  diagnosis: [
    {
      sequence: 1,
      diagnosisCodeableConcept: {
        coding: [
          {
            code: "E11.9",
            display: "Type 2 diabetes mellitus without complications",
          },
        ],
      },
      type: [
        {
          coding: [
            {
              code: "principal",
              display: "Principal Diagnosis",
            },
          ],
        },
      ],
    },
  ],
  procedure: [
    {
      sequence: 1,
      procedureCodeableConcept: {
        coding: [
          {
            code: "99213",
            display: "Office visit, established patient",
          },
        ],
      },
      date: "2024-01-15",
    },
  ],
  item: [
    {
      sequence: 1,
      service: {
        coding: [
          {
            code: "99213",
            display: "Office visit",
          },
        ],
      },
      quantity: {
        value: 1,
      },
      net: {
        value: 150.0,
        currency: "USD",
      },
    },
  ],
  total: {
    value: 150.0,
    currency: "USD",
  },
};

// Mock FHIR Coverage resource (Meditech)
const mockMeditechCoverage = {
  resourceType: "Coverage",
  id: "coverage-789",
  status: "active",
  type: {
    coding: [
      {
        code: "health",
        display: "Health Insurance",
      },
    ],
  },
  subscriber: {
    reference: "Patient/patient-123",
  },
  beneficiary: {
    reference: "Patient/patient-123",
  },
  payor: [
    {
      coding: [
        {
          code: "BCBS",
          display: "Blue Cross Blue Shield",
        },
      ],
    },
  ],
  class: [
    {
      type: {
        coding: [
          {
            code: "group",
            display: "Group",
          },
        ],
      },
      value: "GRP12345",
      name: "Employer Group Plan",
    },
    {
      type: {
        coding: [
          {
            code: "plan",
            display: "Plan",
          },
        ],
      },
      value: "PLAN67890",
      name: "PPO Plan",
    },
  ],
};

describe("FHIR Normalizer", () => {
  describe("getCode", () => {
    it("should extract code from CodeableConcept", () => {
      const codeable = {
        coding: [
          {
            code: "E11.9",
            display: "Type 2 diabetes",
          },
        ],
      };
      expect(getCode(codeable)).toBe("E11.9");
    });

    it("should fall back to text if no coding", () => {
      const codeable = {
        text: "Diabetes Type 2",
      };
      expect(getCode(codeable)).toBe("Diabetes Type 2");
    });

    it("should return undefined for empty object", () => {
      expect(getCode({})).toBeUndefined();
    });
  });

  describe("getDisplay", () => {
    it("should extract display from CodeableConcept", () => {
      const codeable = {
        coding: [
          {
            code: "E11.9",
            display: "Type 2 diabetes",
          },
        ],
      };
      expect(getDisplay(codeable)).toBe("Type 2 diabetes");
    });

    it("should fall back to text if no coding", () => {
      const codeable = {
        text: "Diabetes Type 2",
      };
      expect(getDisplay(codeable)).toBe("Diabetes Type 2");
    });
  });

  describe("normalizePatient", () => {
    it("should normalize Epic patient resource", () => {
      const result = normalizePatient(mockEpicPatient, EHRSystem.EPIC);
      expect(result.success).toBe(true);
      expect(result.resourceType).toBe("Patient");
      expect(result.data?.patientId).toBe("patient-123");
      expect(result.data?.ehrSystem).toBe(EHRSystem.EPIC);
      expect(result.data?.name?.family).toBe("Smith");
      expect(result.data?.name?.given).toEqual(["John", "Michael"]);
      expect(result.data?.gender).toBe("male");
      expect(result.data?.birthDate).toBe("1980-05-15");
    });

    it("should fail for non-Patient resource", () => {
      const claimResource = { resourceType: "Claim" };
      const result = normalizePatient(claimResource as any, EHRSystem.UNKNOWN);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining("Expected Patient resource")
      );
    });
  });

  describe("normalizeClaim", () => {
    it("should normalize Cerner claim resource", () => {
      const result = normalizeClaim(mockCernerClaim, EHRSystem.CERNER);
      expect(result.success).toBe(true);
      expect(result.resourceType).toBe("Claim");
      expect(result.data?.claimId).toBe("claim-456");
      expect(result.data?.status).toBe("active");
      expect(result.data?.claimType).toBe("professional");
      expect(result.data?.diagnoses.length).toBe(1);
      expect(result.data?.diagnoses[0].code).toBe("E11.9");
      expect(result.data?.procedures.length).toBe(1);
      expect(result.data?.lineItems.length).toBe(1);
      expect(result.data?.totalAmount?.value).toBe(150.0);
    });
  });

  describe("normalizeCoverage", () => {
    it("should normalize Meditech coverage resource", () => {
      const result = normalizeCoverage(mockMeditechCoverage, EHRSystem.MEDITECH);
      expect(result.success).toBe(true);
      expect(result.resourceType).toBe("Coverage");
      expect(result.data?.coverageId).toBe("coverage-789");
      expect(result.data?.status).toBe("active");
      expect(result.data?.coverageClasses.length).toBe(2);
      expect(result.data?.coverageClasses[0].value).toBe("GRP12345");
    });
  });
});

describe("EpicFHIRAdapter", () => {
  let adapter: EpicFHIRAdapter;

  beforeEach(() => {
    adapter = createEpicAdapter();
  });

  it("should detect Epic EHR system", () => {
    const system = adapter.detectEhrSystem(mockEpicPatient);
    expect(system).toBe(EHRSystem.EPIC);
  });

  it("should parse patient identifiers", () => {
    const identifiers = adapter.parseIdentifiers(mockEpicPatient);
    expect(identifiers.length).toBeGreaterThan(0);
    expect(identifiers[0].system).toContain("Epic");
  });

  it("should parse patient resource", () => {
    const result = adapter.parsePatient(mockEpicPatient);
    expect(result.success).toBe(true);
    expect(result.data?.patientId).toBe("patient-123");
  });
});

describe("CernerFHIRAdapter", () => {
  let adapter: CernerFHIRAdapter;

  beforeEach(() => {
    adapter = createCernerAdapter();
  });

  it("should parse claim resource", () => {
    const result = adapter.parseClaim(mockCernerClaim);
    expect(result.success).toBe(true);
    expect(result.data?.claimId).toBe("claim-456");
    expect(result.data?.diagnoses.length).toBe(1);
  });
});

describe("MeditechFHIRAdapter", () => {
  let adapter: MeditechFHIRAdapter;

  beforeEach(() => {
    adapter = createMeditechAdapter();
  });

  it("should parse coverage resource", () => {
    const result = adapter.parseCoverage(mockMeditechCoverage);
    expect(result.success).toBe(true);
    expect(result.data?.coverageId).toBe("coverage-789");
  });
});

describe("FHIRAdapter (Main)", () => {
  let adapter: FHIRAdapter;

  beforeEach(() => {
    adapter = createFHIRAdapter();
  });

  it("should auto-detect Epic EHR system", () => {
    const detected = adapter.detectEhrSystem(mockEpicPatient);
    expect(detected).toBe(EHRSystem.EPIC);
  });

  it("should parse Patient resource with auto-detection", () => {
    const result = adapter.parse(mockEpicPatient);
    expect(result.success).toBe(true);
    expect(result.data?.patientId).toBe("patient-123");
  });

  it("should parse Claim resource", () => {
    const result = adapter.parse(mockCernerClaim);
    expect(result.success).toBe(true);
    expect(result.data?.claimId).toBe("claim-456");
  });

  it("should parse Coverage resource", () => {
    const result = adapter.parse(mockMeditechCoverage);
    expect(result.success).toBe(true);
    expect(result.data?.coverageId).toBe("coverage-789");
  });

  it("should track statistics", () => {
    adapter.parse(mockEpicPatient);
    adapter.parse(mockCernerClaim);
    
    const stats = adapter.getStats();
    expect(stats.totalParsed).toBe(2);
    expect(stats.successfulParses).toBe(2);
    expect(stats.byResourceType.Patient).toBe(1);
    expect(stats.byResourceType.Claim).toBe(1);
  });

  it("should reset statistics", () => {
    adapter.parse(mockEpicPatient);
    adapter.resetStats();
    
    const stats = adapter.getStats();
    expect(stats.totalParsed).toBe(0);
    expect(stats.successfulParses).toBe(0);
  });

  it("should fail for unsupported resource type", () => {
    const observationResource = {
      resourceType: "Observation",
      id: "obs-123",
    };
    const result = adapter.parse(observationResource as any);
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining("Unsupported resource type")
    );
  });

  it("should parse batch of resources", () => {
    const resources = [mockEpicPatient, mockCernerClaim, mockMeditechCoverage];
    const results = adapter.parseBatch(resources);
    expect(results.length).toBe(3);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it("should force specific EHR system", () => {
    const forcedAdapter = createFHIRAdapter({
      forceSystem: EHRSystem.EPIC,
      autoDetect: false,
    });
    const result = forcedAdapter.parse(mockCernerClaim);
    expect(result.success).toBe(true);
    expect(result.ehrSystem).toBe(EHRSystem.EPIC);
  });
});

describe("EHR System Detection", () => {
  it("should detect Epic by identifier system", () => {
    const adapter = createFHIRAdapter();
    const epicPatient = {
      resourceType: "Patient",
      identifier: [
        {
          system: "http://Epic.com/fhir/identifiers/mrn",
          value: "12345",
        },
      ],
    };
    const detected = adapter.detectEhrSystem(epicPatient as any);
    expect(detected).toBe(EHRSystem.EPIC);
  });

  it("should detect Cerner by identifier system", () => {
    const adapter = createFHIRAdapter();
    const cernerPatient = {
      resourceType: "Patient",
      identifier: [
        {
          system: "http://cerner.com/fhir/identifiers/mrn",
          value: "12345",
        },
      ],
    };
    const detected = adapter.detectEhrSystem(cernerPatient as any);
    expect(detected).toBe(EHRSystem.CERNER);
  });

  it("should detect Meditech by identifier system", () => {
    const adapter = createFHIRAdapter();
    const meditechPatient = {
      resourceType: "Patient",
      identifier: [
        {
          system: "http://meditech.com/fhir/identifiers/mrn",
          value: "12345",
        },
      ],
    };
    const detected = adapter.detectEhrSystem(meditechPatient as any);
    expect(detected).toBe(EHRSystem.MEDITECH);
  });

  it("should return UNKNOWN for unrecognized system", () => {
    const adapter = createFHIRAdapter();
    const unknownPatient = {
      resourceType: "Patient",
      identifier: [
        {
          system: "http://unknown.com/fhir/mrn",
          value: "12345",
        },
      ],
    };
    const detected = adapter.detectEhrSystem(unknownPatient as any);
    expect(detected).toBe(EHRSystem.UNKNOWN);
  });
});
