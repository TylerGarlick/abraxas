import type { Store } from "../../storage/types.ts";

const sessions = (store: Store) => store.collection("plan/sessions");
export async function startClaritySession(store: Store, query: string) {
  const doc = await sessions(store).insert({ query, status: "active", start: new Date().toISOString() });
  return { success: true, action: "start_clarity_session", session_id: doc._id };
}
export async function extractUnknowns(store: Store, sessionId: string) {
  if (!await sessions(store).get(sessionId)) return { success: false, error: "Session not found" };
  return { success: true, session_id: sessionId, unknowns: ["Goal", "Success Criterion"], questions: ["What does success look like for this task?"] };
}
export async function exportMap(store: Store, sessionId: string) {
  if (!await sessions(store).get(sessionId)) return { success: false, error: "Session not found" };
  return { success: true, session_id: sessionId, map: "Actionable specifications generated." };
}
