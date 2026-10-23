import { describe, expect, test } from "bun:test";
import { synthesize, webFetch, webSearch } from "../src/lib/research/index.ts";
import { connectModule } from "./module-helpers.ts";
import { researchTools } from "../src/tools/research.ts";

const respond = (res: Response) => (async () => res) as unknown as typeof fetch;

describe("research logic", () => {
  test("webFetch extracts title, text and links", async () => {
    const out = await webFetch("https://x.test", true, respond(new Response('<title>T</title><p>Hello &amp; world</p><a href="/x">x</a>')));
    expect(out).toMatchObject({ title: "T", links: ["/x"] });
    expect(String((out as { content: string }).content)).toContain("Hello & world");
  });

  test("webFetch reports HTTP errors", async () => {
    const out = await webFetch("https://x.test", false, respond(new Response("no", { status: 404, statusText: "Not Found" })));
    expect(out).toEqual({ error: "HTTP 404: Not Found" });
  });

  test("webSearch uses Brave when a key is set", async () => {
    process.env.BRAVE_SEARCH_API_KEY = "k";
    try {
      const out = await webSearch("q", 1, respond(new Response(JSON.stringify({ web: { results: [{ title: "a" }, { title: "b" }] } }))));
      expect(out).toEqual({ results: [{ title: "a" }] });
    } finally { delete process.env.BRAVE_SEARCH_API_KEY; }
  });

  test("synthesize summarizes", () => {
    const r = synthesize("t", [{ type: "url", value: "u" }], [{ content: "One. Two." }], "brief");
    expect(r.findings[0]!.keyPoints).toEqual(["One", " Two"]);
  });
});

describe("research tools", () => {
  test("health check responds", async () => {
    const { call } = await connectModule(researchTools);
    const res = await call("research_engine_health_check", { verbose: true });
    expect(res.data.checks.server).toBe("ok");
  });
});
