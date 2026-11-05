import { expect, test, describe } from "bun:test";
import { PEFExporter } from "./pef_exporter";

describe("PEF index (RED)", () => {
  const exporter = new PEFExporter();
  const claims = [{ id: "c1", text: "test", evidence: [], status: "anchored", provenance: "test", version: 1 }] as any;
  const v2 = exporter.exportPefV2("origin-1", claims);

  test("buildIndex returns a manifest with entries", () => {
    const manifest = (exporter as any).buildIndex([v2]);
    expect(Array.isArray(manifest.entries)).toBe(true);
    expect(manifest.entries.length).toBe(1);
    const e = manifest.entries[0];
    expect(e.id).toBeDefined();
    expect(e.hash).toBeDefined();
    expect(e.title).toBeDefined();
    expect(e.created_at).toBeDefined();
    expect(e.claim_id).toBeDefined();
    expect(e.fragment_count).toBeDefined();
    expect(Array.isArray(e.links)).toBe(true);
  });
});
