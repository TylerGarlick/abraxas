import { expect, test, describe } from "bun:test";
import { PEFExporter } from "./pef_exporter";

describe("PEFExporter markdown export (RED)", () => {
  const exporter = new PEFExporter();
  const sampleClaims = [{ id: "c1", text: "test", evidence: [], status: "anchored", provenance: "test", version: 1 }] as any;

  test("exportPEFMarkdown produces markdown with version front-matter", () => {
    const pkg = exporter.exportPefV2("origin-1", sampleClaims);
    const md = (exporter as any).exportPEFMarkdown(pkg);
    expect(md).toContain("# PEF Dossier");
    expect(md).toContain("version: 2.0.0");
    expect(md).toContain("## Fragments");
    expect(md).toContain("## Claims");
  });
});
