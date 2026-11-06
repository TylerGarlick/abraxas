import { describe, expect, test } from "bun:test";
import { connect, makeContext } from "./helpers.ts";
import { saveSession, restoreSession, listSessions, archiveSession } from "../src/lib/mnemosyne/index.ts";

describe("mnemosyne session store", () => {
  test("saves and restores with hash verification", async () => {
    const ctx = makeContext();
    const saved = await saveSession(ctx.store, {
      name: "alpha",
      description: "test session",
      transcript: { turns: [{ turn: 1, timestamp: new Date().toISOString(), role: "user", content: "hello" }] },
      tags: ["alpha"],
    });
    expect(saved.status).toBe("active");
    const restored = await restoreSession(ctx.store, saved.session_id);
    expect(restored.name).toBe("alpha");
    expect(restored.turn_count).toBe(1);
    const listed = await listSessions(ctx.store, { tag: "alpha" });
    expect(listed.length).toBe(1);
    const archived = await archiveSession(ctx.store, saved.session_id, "done");
    expect(archived.status).toBe("archived");
  });

  test("rejects conflicting create and detects corruption", async () => {
    const ctx = makeContext();
    const saved = await saveSession(ctx.store, { name: "beta" });
    await expect(saveSession(ctx.store, { session_id: saved.session_id, name: "beta" })).rejects.toThrow();
    await saveSession(ctx.store, { session_id: saved.session_id, name: "beta", mode: "replace", description: "updated" });
    const restored = await restoreSession(ctx.store, saved.session_id);
    expect(restored.description).toBe("updated");
  });
});

describe("mnemosyne tools", () => {
  test("round-trips through MCP", async () => {
    const { call } = await connect();
    const saved = await call("mnemosyne_session_save", { name: "tool-session", transcript_json: JSON.stringify({ turns: [] }) });
    expect(saved.isError).toBe(false);
    const id = (saved.data as { session_id: string }).session_id;
    const restored = await call("mnemosyne_session_restore", { session_id: id });
    expect(restored.isError).toBe(false);
    const listed = await call("mnemosyne_session_list", {});
    expect(Array.isArray(listed.data)).toBe(true);
    const verified = await call("mnemosyne_session_verify", { session_id: id });
    expect((verified.data as { valid: boolean }).valid).toBe(true);
  });
});