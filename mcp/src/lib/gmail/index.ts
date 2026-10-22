export type Fetcher = typeof fetch;
function authHeaders(token: string) { if (!token) throw new Error("GMAIL_ACCESS_TOKEN is required"); return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }; }
async function request(token: string, path: string, init: RequestInit = {}, fetcher: Fetcher = fetch) {
  const response = await fetcher(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, { ...init, headers: { ...authHeaders(token), ...init.headers } });
  if (!response.ok) throw new Error(`Gmail API HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
export async function fetchEmails(token: string, count = 10, fetcher: Fetcher = fetch) {
  const listing = await request(token, `messages?maxResults=${Math.max(1, Math.min(100, count))}`, {}, fetcher) as { messages?: {id:string;threadId:string}[] };
  return Promise.all((listing.messages ?? []).map(async m => {
    const msg = await request(token, `messages/${encodeURIComponent(m.id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {}, fetcher) as {id:string;threadId:string;snippet?:string;payload?:{headers?:{name:string;value:string}[]}};
    const h = Object.fromEntries((msg.payload?.headers ?? []).map(x => [x.name.toLowerCase(), x.value]));
    return { id: msg.id, threadId: msg.threadId, from: h.from ?? "", subject: h.subject ?? "", date: h.date ?? "", snippet: msg.snippet ?? "" };
  }));
}
export async function readEmail(token: string, id: string, fetcher: Fetcher = fetch) {
  const msg = await request(token, `messages/${encodeURIComponent(id)}?format=full`, {}, fetcher) as {id:string;threadId:string;snippet?:string;payload?:{mimeType?:string;body?:{data?:string};parts?:Array<{mimeType?:string;body?:{data?:string}}>}};
  const payload = msg.payload; const body = payload?.body?.data ?? payload?.parts?.find(p => p.mimeType === "text/plain")?.body?.data;
  return { ...msg, body: body ? Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8") : "" };
}
export async function searchEmails(token: string, query: string, count = 10, fetcher: Fetcher = fetch) {
  const listing = await request(token, `messages?q=${encodeURIComponent(query)}&maxResults=${Math.max(1,Math.min(100,count))}`, {}, fetcher) as {messages?:{id:string}[]};
  return Promise.all((listing.messages ?? []).map(m => readEmail(token, m.id, fetcher)));
}
export async function markRead(token: string, id: string, fetcher: Fetcher = fetch) { await request(token, `messages/${encodeURIComponent(id)}/modify`, { method: "POST", body: JSON.stringify({ removeLabelIds: ["UNREAD"] }) }, fetcher); return { success: true, id }; }
export async function sendEmail(token: string, to: string, subject: string, body: string, fetcher: Fetcher = fetch) {
  const raw = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`).toString("base64url");
  return request(token, "messages/send", { method: "POST", body: JSON.stringify({ raw }) }, fetcher);
}
