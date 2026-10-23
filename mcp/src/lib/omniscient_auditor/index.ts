import { readFile } from "node:fs/promises";
export function decomposeText(contents: string) {
  return contents.split(/(?<=[.!?])\s+/).map((text) => text.trim()).filter((text) => text.length >= 10).map((text, index) => ({ id: `C-${String(index).padStart(3, "0")}`, text, line_approx: 0 }));
}
export async function decomposeDocument(path: string) {
  return decomposeText(await readFile(path, "utf8"));
}
export function generateHeatMap(results: Array<Record<string, unknown>>) {
  const header = "| Claim ID | Original Text | Epistemic Label | Soter Risk | CVP Status | Resolution Path |\n|:---|:---|:---|:---|:---|:---|";
  const rows = results.map((r) => {
    const text = String(r.text ?? "");
    return `| ${String(r.id ?? "") } | ${text.length > 80 ? `${text.slice(0, 80)}...` : text} | \`${String(r.label ?? "UNKNOWN")}\` | ${String(r.risk ?? "0")} | ${String(r.status ?? "Pending")} | ${String(r.path ?? "N/A")} |`;
  });
  return [header, ...rows].join("\n");
}
