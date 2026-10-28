import { describe, test, expect } from "bun:test";
import { runImport } from "../src/lib/import/importer.ts";

describe("import importer", () => {
  test("extracts facts from text", async () => {
    const text = "Abraxas ensures truth. This tool scans text. Facts get derived.";
    const { index, claims } = await runImport({ text, title: "Demo" });
    expect(index.facts.length).toBeGreaterThanOrEqual(2);
    expect(claims.length).toBe(index.facts.length);
    expect(claims[0]._id).toBe("fact_1");
  });

  test("handles empty-ish text", async () => {
    const { index, claims } = await runImport({ text: "", title: "Empty" });
    expect(index.facts.length).toBe(0);
    expect(claims.length).toBe(0);
  });

  test("preserves synthesis prompt", async () => {
    const { index } = await runImport({ text: "One sentence fact is here for scanning use.", title: "S", synthesisPrompt: "Synthesize facts." });
    expect(index.synthesisPrompt).toBe("Synthesize facts.");
  });

  test("facts have keywords", async () => {
    const { index } = await runImport({ text: "Important terminological claims get extracted and stored.", title: "K" });
    expect(index.facts[0]?.keywords.length).toBeGreaterThan(0);
  });

  test("imports from a file path", async () => {
    const fs = await import("node:fs/promises");

    const p = `/tmp/test-import-${Date.now()}.txt`;
    await fs.writeFile(p, "Claim A fact one is sufficiently long for extraction. Claim B fact two handles another long statement.");
    const { index } = await runImport({ sourcePath: p, title: "F" });
    await fs.unlink(p).catch(() => {});
    expect(index.facts.length).toBeGreaterThanOrEqual(2);
  });

});
