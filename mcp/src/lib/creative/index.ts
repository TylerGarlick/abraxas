export type Fetcher = typeof fetch;
export async function generateHfImage(input: {prompt:string;model?:string;width?:number;height?:number}, token: string, fetcher: Fetcher = fetch) {
  if (!input.prompt.trim()) throw new Error("Prompt is required");
  if (!token) throw new Error("HF_TOKEN is required");
  const model = input.model ?? "black-forest-labs/FLUX.1-dev";
  const response = await fetcher(`https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ inputs: input.prompt, parameters: { width: input.width ?? 1024, height: input.height ?? 1024 } }) });
  if (!response.ok) throw new Error(`Image API HTTP ${response.status}`);
  return { model, mimeType: response.headers.get("content-type") ?? "image/png", imageBase64: Buffer.from(await response.arrayBuffer()).toString("base64") };
}
export async function generateCivitaiImage(input: {prompt:string;model?:string;width?:number;height?:number;steps?:number}, token: string, fetcher: Fetcher = fetch) {
  if (!input.prompt.trim()) throw new Error("Prompt is required");
  if (!token) throw new Error("CIVITAI_API_KEY is required");
  const response = await fetcher("https://orchestration.civitai.com/v1/consumer/jobs", { method: "POST", headers: { Authorization: token, "Content-Type": "application/json" }, body: JSON.stringify({ input: { model: input.model ?? "urn:air:sd1:checkpoint:civitai:4201@130072", params: { prompt: input.prompt, width: input.width ?? 512, height: input.height ?? 768, steps: input.steps ?? 30 } } }) });
  if (!response.ok) throw new Error(`Civitai API HTTP ${response.status}`);
  return response.json();
}
