import type { Collection } from "../../storage/types.ts";
export async function profile(col: Collection, userId: string) {
  const [preferences, signals] = await Promise.all([col.find({ kind: "preference", user_id: userId }), col.find({ kind: "signal", user_id: userId }, { sort: { createdAt: -1 }, limit: 100 })]);
  return { success: true, user_id: userId, profile: { preferences: Object.fromEntries(preferences.map(p => [p.key as string, { value: p.value, weight: p.weight }])), signals: signals.map(s => ({ timestamp: s.createdAt, type: s.signal_type, payload: s.payload })) } };
}
export async function setPreference(col: Collection, key: string, value: string, weight: number) {
  const userId = "default"; const old = (await col.find({ kind: "preference", user_id: userId, key }, { limit: 1 }))[0];
  if (old) await col.update(old._id, { value, weight }); else await col.insert({ kind: "preference", user_id: userId, key, value, weight });
  return { success: true, action: "set_preference", key, value };
}
export async function recordSignal(col: Collection, signalType: string, payload: string) {
  const row = await col.insert({ kind: "signal", user_id: "default", signal_type: signalType, payload });
  return { success: true, action: "record_signal", signal_type: signalType, timestamp: row.createdAt };
}
