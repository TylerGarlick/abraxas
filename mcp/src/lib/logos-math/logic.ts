import type { Collection } from "../../storage/index.ts";
export function scoreConfidence(status: string, hasDerivation = false) {
  const levels: Record<string, number> = { verified: 0.95, pass: 0.9, partial: 0.65, unverified: 0.4, fail: 0.1 };
  const confidence = levels[status.toLowerCase()] ?? 0.5;
  return { confidence: hasDerivation ? Math.min(1, confidence + 0.05) : confidence, status, hasDerivation };
}
export function verifyMath(expression: string, derivation = "") {
  const hasDerivation = /\b(=|therefore|because|substitute|differentiate|integrate)\b/.test(derivation);
  const result = { pass: Boolean(derivation.trim()), reasoning: derivation.trim() ? "A derivation was provided; verify each step independently." : "No derivation provided; mathematical claims require a derivation.", hasDerivation };
  return { ...result, confidence: scoreConfidence(result.pass ? "pass" : "unverified", hasDerivation).confidence, expression };
}
export function crosscheck(expression: string, answer: number) {
  const simple = expression.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*([+*/-])\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!simple) return { supported: false, checked: false, reason: "Only basic binary arithmetic is evaluated automatically." };
  const a = Number(simple[1]), b = Number(simple[3]);
  const expected = simple[2] === "+" ? a + b : simple[2] === "-" ? a - b : simple[2] === "*" ? a * b : a / b;
  return { supported: true, checked: true, expected, answer, matches: Number.isFinite(expected) && Math.abs(expected - answer) < 1e-9 };
}

export function verifyMathClaim(claim: string) {
  const text = claim.trim().toLowerCase();
  if (!text) return { pass: false, reasoning: "Empty or invalid claim" };
  const hasMath = /[\d+\-*/=<>∫∑∏∂∇√πθφψωαβγδελμσρτζηικνξυχζ]|[a-z]\^|→|∞/.test(text);
  const assertionOnly = ["it is known that", "clearly", "obviously", "we know", "everyone knows", "trivially", "it is easy to see"].some(x => text.includes(x));
  const indicators = ["because", "therefore", "thus", "hence", "proven", "proved", "proof", "by induction", "by contradiction", "by construction", "using", "applying", "assume", "suppose", "then ", "implies", "yields", "substitute", "simplify", "factor", "differentiate", "integrate", "derive", "expand", "reduce", "transform", "which gives", "which means", "it follows", "step", "working", "chain rule", "product rule", "by definition", "from the formula"];
  const matched = indicators.filter(x => text.includes(x));
  if (!hasMath) return { pass: false, reasoning: "No mathematical content detected in claim" };
  if (assertionOnly && !matched.length) return { pass: false, reasoning: "Assertion-only language without a derivation", derivationType: null };
  if (!matched.length) return { pass: false, reasoning: "Mathematical claim stated without derivation or reasoning", derivationType: null };
  const derivationType = text.includes("induction") ? "induction" : text.includes("contradiction") ? "contradiction" : text.includes("construction") ? "construction" : /derivative|differentiate|integral/.test(text) ? "calculus" : /algebra|equation|substitute/.test(text) ? "algebraic" : text.includes("theorem") ? "theorem-based" : "general";
  return { pass: true, reasoning: `Derivation present: ${matched.slice(0, 3).join(", ")}`, derivationType };
}

function tokenizeArithmetic(expression: string): string[] {
  const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/^]/g) ?? [];
  if (tokens.join("") !== expression.replace(/\s+/g, "")) throw new Error("Expression contains unsupported syntax");
  return tokens;
}
export function evaluateArithmetic(expression: string): number {
  const tokens = tokenizeArithmetic(expression); let index = 0;
  const primary = (): number => { const token = tokens[index++]; if (token === "(") { const value = sum(); if (tokens[index++] !== ")") throw new Error("Unmatched parenthesis"); return value; } if (token === "+") return primary(); if (token === "-") return -primary(); const value = Number(token); if (!Number.isFinite(value)) throw new Error("Expected a number"); return value; };
  const power = (): number => { const value = primary(); if (tokens[index] === "^") { index++; return value ** power(); } return value; };
  const product = (): number => { let value = power(); while (tokens[index] === "*" || tokens[index] === "/") { const op = tokens[index++]!; const rhs = power(); if (op === "/" && rhs === 0) throw new Error("Division by zero"); value = op === "*" ? value * rhs : value / rhs; } return value; };
  const sum = (): number => { let value = product(); while (tokens[index] === "+" || tokens[index] === "-") { const op = tokens[index++]!; const rhs = product(); value = op === "+" ? value + rhs : value - rhs; } return value; };
  if (!tokens.length) throw new Error("Expression must not be empty"); const value = sum(); if (index !== tokens.length) throw new Error("Unexpected token"); return value;
}
export function verifyArithmetic(expression: string, claimedResult?: number) {
  const split = expression.split("=");
  if (split.length === 2) { const left = evaluateArithmetic(split[0]!); const right = evaluateArithmetic(split[1]!); const match = Math.abs(left - right) <= 1e-10; return { status: match ? "VERIFIED" : "CONFLICT", expression, computed: left, claimed: right, confidence: match ? 1 : 0.2, message: match ? "Equation is valid" : `Equation is invalid: ${left} ≠ ${right}` }; }
  const computed = evaluateArithmetic(expression); if (claimedResult === undefined) return { status: "VERIFIED", expression, computed, confidence: 1, message: "Expression evaluated successfully" };
  const match = Math.abs(computed - claimedResult) <= 1e-10; return { status: match ? "VERIFIED" : "CONFLICT", expression, computed, claimed: claimedResult, confidence: match ? 1 : 0.2, message: match ? "Claim matches computation" : `Claim (${claimedResult}) does not match computation (${computed})` };
}
export async function logMathOperation(type: "verify" | "confidence" | "crosscheck", claim: string, result: unknown, logs: Collection) {
  const entry = { _id: `lm-${crypto.randomUUID()}`, kind: "math_log", type, claim, result, timestamp: new Date().toISOString() };
  return logs.insert(entry);
}
