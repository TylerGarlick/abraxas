import { describe, expect, test } from "bun:test";
import { COLLECTIONS } from "../src/storage/index.ts";
import { maskSecrets, setConfigValue, getValue, getConfig } from "../src/lib/config/index.ts";
import { connectModule } from "./module-helpers.ts";
import { configTools } from "../src/tools/config.ts";
import { hermesTools } from "../src/tools/hermes.ts";
import { oneironauticsTools } from "../src/tools/oneironautics.ts";
import { phemeTools } from "../src/tools/pheme.ts";
import { prometheusTools } from "../src/tools/prometheus.ts";
import { makeContext } from "./helpers.ts";

describe("config registry", () => {
  test("nests dotted paths and masks secrets", async () => {
    const col = makeContext().store.collection(COLLECTIONS.config);
    await setConfigValue(col, "Soter.RiskThreshold", 3);
    await setConfigValue(col, "Soter.apiKey", "abc");
    await setConfigValue(col, "Soter.RiskThreshold", 4);
    expect(await getValue(col, "Soter.RiskThreshold")).toBe(4);
    expect(await getConfig(col)).toEqual({ Soter: { RiskThreshold: 4, apiKey: "abc" } });
    expect(maskSecrets(await getConfig(col))).toEqual({ Soter: { RiskThreshold: 4, apiKey: "********" } });
    await expect(getValue(col, "No.Such")).rejects.toThrow();
  });

  test("tools", async () => {
    const { call } = await connectModule(configTools);
    await call("config_set", { path: "Ethos.token", value: "s" });
    expect((await call("config_get_section", { section: "Ethos" })).data.token).toBe("********");
    expect((await call("config_get", { path: "Ethos.token" })).data.value).toBe("s");
    expect((await call("config_get_all")).data.version).toBe("1.0.0");
    expect((await call("config_reload")).data.count).toBe(1);
  });
});

describe("hermes", () => {
  test("weighted consensus from stored positions", async () => {
    const { call } = await connectModule(hermesTools);
    await call("add_agent_position", { agent_id: "a", claim: "c1", weight: 0.9 });
    await call("add_agent_position", { agent_id: "b", claim: "c1", weight: 0.7 });
    const res = await call("compute_consensus", { claim_id: "c1" });
    expect(res.data).toMatchObject({ positions: 2, consensus: "Strong" });
    expect((await call("compute_consensus", { claim_id: "none" })).data.consensus).toBe("Weak");
    expect((await call("weight_record", { agent_id: "a", accuracy: 0.8 })).data.new_accuracy).toBe(0.8);
  });
});

describe("oneironautics", () => {
  test("logs dreams, symbols and shadow entries", async () => {
    const { ctx, call } = await connectModule(oneironauticsTools);
    await call("log_dream", { dream_text: "flying", tags: ["air"] });
    await call("witness_symbol", { symbol: "owl", valence: "positive", manifestation: "night" });
    await call("update_shadow_ledger", { quality: "pride", insight: "noted" });
    expect(await ctx.store.collection("oneironautics/records").count()).toBe(3);
  });
});

describe("pheme", () => {
  test("verifies claims and updates trust without duplicates", async () => {
    const { ctx, call } = await connectModule(phemeTools);
    expect((await call("verify_claim", { claim: "c", sources: ["s"] })).data.status).toBe("VERIFIED");
    expect((await call("verify_claim", { claim: "c", sources: [] })).data.status).toBe("UNVERIFIABLE");
    await call("update_source_trust", { source: "s", weight: 0.5, reason: "a" });
    await call("update_source_trust", { source: "s", weight: 0.8, reason: "b" });
    expect(await ctx.store.collection("epistemic/pheme").count({ kind: "source_trust" })).toBe(1);
  });
});

describe("prometheus", () => {
  test("persists preferences and signals", async () => {
    const { call } = await connectModule(prometheusTools);
    await call("set_preference", { key: "detail", value: "concise", weight: 0.9 });
    await call("set_preference", { key: "detail", value: "verbose" });
    await call("record_signal", { signal_type: "reject", payload: "long" });
    const profile = (await call("get_profile", { user_id: "default" })).data.profile;
    expect(profile.preferences.detail).toEqual({ value: "verbose", weight: 1 });
    expect(profile.signals).toHaveLength(1);
  });
});
