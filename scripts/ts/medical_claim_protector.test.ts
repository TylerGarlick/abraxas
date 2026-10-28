import { expect, test, describe } from "bun:test";
import { ComplexityScorer, DomainFirewall } from "./medical_claim_protector";

describe("Medical Claim Protector", () => {
  const scorer = new ComplexityScorer();
  const firewall = new DomainFirewall();

  test("should detect high complexity in dense medical claims", () => {
    const text = "Heparin-induced thrombocytopenia (HIT) is an immune-mediated, prothrombotic anti-PF4/heparin disorder ICD-10-CM D75.82 characterized by platelet count fall greater than 50% and high thrombosis risk 5 to 10 days after heparin exposure. It is diagnosed by 4T score plus anti-PF4 ELISA sensitive and SRA highly specific. Treatment involves immediate cessation of ALL heparin and therapeutic non-heparin anticoagulation (argatroban, bivalirudin, fondaparinux/DOACs), with warfarin introduced only after platelet recovery.";
    const score = scorer.calculateComplexity(text);
    expect(score).toBeGreaterThan(0);
  });

  test("should not trigger complexity for simple text", () => {
     expect(scorer.calculateComplexity("HIT")).toBe(0);
  });

  test("should trip firewall for general domain + medical precision", () => {
     expect(firewall.checkDomain("general", "Patient had an SRA score positive")).toBe(true);
  });

  test("should pass firewall if domain matches medical", () => {
     expect(firewall.checkDomain("medical", "Treatment protocols are in place.")).toBe(false); // firewall is specific to general domain
  });
});
