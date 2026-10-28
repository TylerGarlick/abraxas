import { expect, test, describe } from "bun:test";
import { detectNumericThreshold, DomainPriorityGate, PrecisionDecay, AcquisitionTrigger } from "./med_precision_prototype";

describe("MedPrecisionPrototype", () => {
  test("detectNumericThreshold extracts numbers", () => {
    const text = "Serum B12 <180 pg/mL and MMA >0.271 μmol/L with HOL <40 pg/mL";
    const res = detectNumericThreshold(text);
    expect(res.has).toBe(true);
    expect(res.count).toBeGreaterThanOrEqual(2);
  });

  test("detectNumericThreshold handles clean text", () => {
    const text = "No thresholds here.";
    const res = detectNumericThreshold(text);
    expect(res.has).toBe(false);
  });

  test("DomainPriorityGate rejects high density in general domain", () => {
    const gate = new DomainPriorityGate();
    expect(gate.check("general", 6, undefined)).toBe(false);
    expect(gate.check("medical", 6, undefined)).toBe(true);
  });

  test("PrecisionDecay lowers priority", () => {
    const pd = new PrecisionDecay();
    const p = pd.adjustPriority(100, 4, false);
    expect(p).toBeLessThan(100);
  });

  test("AcquisitionTrigger fires for precision no evidence", () => {
    const trigger = new AcquisitionTrigger();
    const t = trigger.shouldTrigger("MMA >0.271 μmol/L and <180 pg/mL", false);
    expect(t).toBe(true);
  });
});
