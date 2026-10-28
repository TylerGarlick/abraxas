import { z } from "zod";
import { defineTool, type ToolModule } from "../tools/helpers.ts";
import { runImport } from "../lib/import/importer.ts";

export const importTools: ToolModule = {
  name: "import",
  register(server, ctx) {
    defineTool(server, ctx, "import_create",
      "Import text, extract facts as claims, and persist an index for retrieval.",
      { text: z.string().optional().describe("Source text to import"), title: z.string().optional().describe("Source title"), sourcePath: z.string().optional().describe("Local file path to import"), sourceContent: z.string().optional().describe("Explicit source content"), synthesisPrompt: z.string().optional().describe("Optional prompt used to synthesize (stored in index)") },
      async ({ text, title, sourcePath, sourceContent, synthesisPrompt }) => {
        const { index, claims } = await runImport({ text, title, sourcePath, sourceContent, synthesisPrompt });
        const factsStore = ctx.store.collection("import/facts");
        for (const c of claims) await factsStore.upsert(c);
        const indexStore = ctx.store.collection("import/index");
        const id = `import_${title?.replace(/\s+/g, "_") || "untitled"}_${Date.now()}`;
        await indexStore.upsert({ ...index, _id: id });
        return { count: claims.length, title, synthesisPrompt, id };
      });
  },
};
