export interface Signal { content: string; source?: string; metadata?: Record<string, unknown> }
export function analyzeSignal(rawInput: string) {
  const content = rawInput.trim(); const words = content.split(/\s+/).filter(Boolean);
  const urgency = /\b(urgent|immediately|breaking|emergency|deadline)\b/i.test(content) ? 0.8 : 0.2;
  const novelty = new Set(words.map((w) => w.toLowerCase())).size / Math.max(1, words.length);
  return { content, urgency, novelty, valence: Math.min(1, urgency * 0.6 + novelty * 0.4), accepted: content.length > 0 };
}
export function curateStream(signals: string[]) { return signals.map(analyzeSignal).sort((a, b) => b.valence - a.valence); }
export function stripNoise(content: string) { return content.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim(); }
