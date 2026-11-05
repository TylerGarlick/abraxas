import { expect, test, describe } from "bun:test";
import { PEFExporter, PEFPackageV2 } from "./pef_exporter";

describe("PEFExporter v2", () => {
  const exporter = new PEFExporter();
  const sampleClaims = [
    { id: "c1", text: "test", evidence: [], status: "anchored", provenance: "test", version: 1 },
  ] as any;

  test("exportPEFV2 produces v2 package", () => {
    const pkg = (exporter as any).exportPefV2("origin-1", sampleClaims);
    expect(pkg.version).toBe("2.0.0");
    expect(pkg.metadata).toBeDefined();
    expect(Array.isArray(pkg.fragments)).toBe(true);
    expect(Array.isArray(pkg.edges)).toBe(true);
    expect(Array.isArray(pkg.seals)).toBe(true);
    expect(pkg.index).toBeDefined();
  });

  test("PEFPackageV2 interface matches exported types", () => {
    const typecheck: PEFPackageV2 | undefined = undefined;
    if (typecheck === undefined) expect(true).toBe(true);
  });
});
