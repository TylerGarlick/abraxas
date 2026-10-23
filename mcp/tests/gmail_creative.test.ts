import { describe, expect, test } from "bun:test";
import { fetchEmails, markRead, readEmail, sendEmail } from "../src/lib/gmail/index.ts";
import { generateCivitaiImage, generateHfImage } from "../src/lib/creative/index.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("gmail", () => {
  test("fetches message summaries with bearer auth", async () => {
    const seen: string[] = [];
    const fetcher = (async (url: string, init: RequestInit) => {
      seen.push(`${url}|${(init.headers as Record<string, string>).Authorization}`);
      return String(url).includes("?maxResults")
        ? json({ messages: [{ id: "1", threadId: "t" }] })
        : json({ id: "1", threadId: "t", snippet: "hi", payload: { headers: [{ name: "Subject", value: "S" }, { name: "From", value: "a@b.c" }] } });
    }) as unknown as typeof fetch;
    const out = await fetchEmails("tok", 5, fetcher);
    expect(out[0]).toMatchObject({ id: "1", subject: "S", from: "a@b.c" });
    expect(seen.every(s => s.endsWith("Bearer tok"))).toBe(true);
  });

  test("reads body, marks read, sends raw message", async () => {
    const body = Buffer.from("hello").toString("base64url");
    const read = await readEmail("t", "1", (async () => json({ id: "1", threadId: "t", payload: { body: { data: body } } })) as unknown as typeof fetch);
    expect(read.body).toBe("hello");
    let sent = "";
    const fetcher = (async (_u: string, init: RequestInit) => { sent = String(init.body); return json({ id: "x" }); }) as unknown as typeof fetch;
    await markRead("t", "1", fetcher);
    expect(sent).toContain("UNREAD");
    await sendEmail("t", "a@b.c", "Subj", "Body", fetcher);
    expect(Buffer.from(JSON.parse(sent).raw, "base64url").toString()).toContain("Subject: Subj");
  });

  test("requires a token and surfaces API errors", async () => {
    await expect(fetchEmails("", 1)).rejects.toThrow("GMAIL_ACCESS_TOKEN");
    await expect(fetchEmails("t", 1, (async () => json({}, 401)) as unknown as typeof fetch)).rejects.toThrow("401");
  });
});

describe("image generation", () => {
  test("Hugging Face returns base64 image", async () => {
    const fetcher = (async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } })) as unknown as typeof fetch;
    const out = await generateHfImage({ prompt: "cat" }, "tok", fetcher);
    expect(out.imageBase64).toBe(Buffer.from([1, 2, 3]).toString("base64"));
    await expect(generateHfImage({ prompt: " " }, "tok", fetcher)).rejects.toThrow();
    await expect(generateHfImage({ prompt: "x" }, "", fetcher)).rejects.toThrow("HF_TOKEN");
  });

  test("Civitai posts a job", async () => {
    let body: any;
    const fetcher = (async (_u: string, init: RequestInit) => { body = JSON.parse(String(init.body)); return json({ token: "j" }); }) as unknown as typeof fetch;
    expect(await generateCivitaiImage({ prompt: "p", steps: 10 }, "k", fetcher)).toEqual({ token: "j" });
    expect(body.input.params.steps).toBe(10);
    await expect(generateCivitaiImage({ prompt: "p" }, "", fetcher)).rejects.toThrow("CIVITAI_API_KEY");
  });
});
