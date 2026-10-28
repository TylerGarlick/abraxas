import { expect, test, describe } from "bun:test";
import { LexicalPolicyAnalyzer } from "./policy_lexical_analyzer";

describe("LexicalPolicyAnalyzer", () => {
  const analyzer = new LexicalPolicyAnalyzer();

  test("should flag 'proper' in hygiene claim", () => {
    expect(analyzer.hasLexicalAlert("Proper hygiene reduces spread")).toBe(true);
    expect(analyzer.scanClaim("Proper hygiene reduces spread")).toContain("proper");
  });

  test("should not flag specific claim without vague terms", () => {
    expect(analyzer.hasLexicalAlert("Viruses spread via airborne droplets.")).toBe(false);
  });
});
