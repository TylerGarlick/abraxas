import { expect, test } from "bun:test";
import { connect, makeContext } from "./helpers.ts";

test("soter tools happy paths", async () => {
  const { call } = await connect();
  expect((await call("soter_verify_claim", { claim: "x" })).isError).toBe(false);
  expect((await call("run_soter_query", { query_type: "assess", input_text: "x" })).isError).toBe(false);
  expect((await call("run_soter_query", { query_type: "concentration_risk", input_text: "x", options: { attention_weights: { heads: [{ sink: 0.2 }], sinks: ["sink"] } } })).isError).toBe(false);
  expect((await call("run_soter_query", { query_type: "detect_patterns", input_text: "x" })).isError).toBe(false);
  expect((await call("run_soter_query", { query_type: "list_patterns", input_text: "x" })).isError).toBe(false);
  expect((await call("run_soter_query", { query_type: "sycophancy", input_text: "ok", options: { user_premise: "prem" } })).isError).toBe(false);
  expect((await call("check_constitution_adherence", { response: "x" })).isError).toBe(false);
  expect((await call("soter_assess", { query: "x", attention_weights: { heads: [{ sink: 0.2 }], sinks: ["sink"] } })).isError).toBe(false);
  expect((await call("soter_rupture", { reason: "r" })).isError).toBe(false);
  expect((await call("soter_calibrate", { anchor: "a" })).isError).toBe(false);
  expect((await call("soter_trigger", { reason: "r" })).isError).toBe(false);
  expect((await call("soter_monitor_chaos", { text: "x" })).isError).toBe(false);
});

test("sovereign engine tools happy paths", async () => {
  const { call } = await connect();
  expect((await call("calculate_sovereign_weight", { risk_scores: [1, 2], target_index: 0 })).isError).toBe(false);
  expect((await call("compute_integrated_confidence", { arch_conf: 1, rlcr_score: 0, alpha: 0.5 })).isError).toBe(false);
  expect((await call("calculate_rlcr", { history: [true, true] })).isError).toBe(false);
  expect((await call("verify_consensus", { answers: ["a", "a"] })).isError).toBe(false);
  expect((await call("get_epistemic_label", { confidence: 0.9 })).isError).toBe(false);
});

test("sovereign core tools happy paths", async () => {
  const { call } = await connect();
  expect((await call("sovereign_patcher", { patch_id: "p" })).isError).toBe(false);
  expect((await call("config_management", { action: "set", key: "mode", value: "sol" })).isError).toBe(false);
  expect((await call("config_management", { action: "get", key: "mode" })).isError).toBe(false);
  expect((await call("config_management", { action: "list" })).isError).toBe(false);
  expect((await call("system_state_audit", { check_type: "full", verbose: true })).isError).toBe(false);
  expect((await call("sovereign_core_health_check", { detailed: true })).isError).toBe(false);
});

test("sovereign anchor tools happy paths", async () => {
  const { call } = await connect();
  const r = await call("anchor_truth", { content: "axiom" });
  expect(r.isError).toBe(false);
  const id = (r.data as { _id?: string } | null)?._id ?? (r.data as string);
  expect((await call("verify_anchor", { key: String(id) })).isError).toBe(false);
});

test("stochasmos tools happy paths", async () => {
  const { call } = await connect();
  expect((await call("stochasmos_pressure_point", { discourse_id: "d", truths: ["claim"] })).isError).toBe(false);
  const seed = await call("stochasmos_seed", { pressure_point_id: "p", target: "claim" });
  expect(seed.isError).toBe(false);
  expect((await call("stochasmos_assess_risk", { seed_id: "s", seed_content: "threat" })).isError).toBe(false);
});

test("synesis tools happy paths", async () => {
  const { call, ctx } = await connect();
  const claims = ctx.store.collection("epistemic/claims");
  await claims.insert({ _id: "t1", claim: "claim" });
  expect((await call("synesis_map", { truth_ids_json: JSON.stringify(["t1"]) })).isError).toBe(false);
  const th = await call("synesis_theorize", { domain: "d", candidate_truths_json: JSON.stringify(["t1"]) });
  expect(th.isError).toBe(false);
  const id = (th.data as { id?: string } | null)?.id ?? "x";
  expect((await call("synesis_validate", { theory_id: String(id), grounding_ids_json: JSON.stringify(["t1"]) })).isError).toBe(false);
});

test("status tools happy paths", async () => {
  const { call } = await connect();
  expect((await call("get_system_status", {})).isError).toBe(false);
  expect((await call("list_active_agents", {})).isError).toBe(false);
});

test("sieve tools happy paths", async () => {
  const { call } = await connect();
  expect((await call("analyze_signal", { raw_input: "urgent news" })).isError).toBe(false);
  expect((await call("curate_stream", { signals_json: JSON.stringify(["ordinary", "urgent emergency"]) })).isError).toBe(false);
});