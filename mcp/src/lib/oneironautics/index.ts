import type { Collection } from "../../storage/types.ts";
export const logDream = (col: Collection, dreamText: string, tags: string[] = []) => col.insert({ kind: "dream", summary: dreamText, tags, riskAssessment: "C-Sovereign" });
export const witnessSymbol = (col: Collection, symbol: string, valence: string, manifestation: string) => col.insert({ kind: "symbol", symbol, stage: "NIGREDO", intention: `Valence: ${valence} | Manifestation: ${manifestation}` });
export const updateShadow = (col: Collection, quality: string, insight: string) => col.insert({ kind: "shadow_entry", category: quality, content: insight, sessionId: "default-session" });
