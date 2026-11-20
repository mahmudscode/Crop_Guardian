// Google Gemini (free tier) helpers. Model names are env-overridable; confirm current names in Google AI docs.
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const key = () => Deno.env.get("GEMINI_API_KEY")!;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post(url: string, body: unknown): Promise<Response> {
  // Free tier returns HTTP 429 when rate limited: retry twice with a pause.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key() },
      body: JSON.stringify(body),
    });
    if (res.status === 429 && attempt < 2) { await sleep(15_000); continue; }
    return res;
  }
}

export type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

export async function generate(parts: Part[], opts: { json?: boolean; maxTokens?: number } = {}): Promise<string> {
  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.1-flash-lite";
  const res = await post(`${BASE}/${model}:generateContent`, {
    contents: [{ role: "user", parts }],
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 4096,
      temperature: 0.2,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  });
  if (!res.ok) throw new Error(`gemini generate ${res.status}`);
  const j = await res.json();
  const text = j.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("gemini returned no text");
  return text;
}

export const EMBED_DIMS = 1024; // must equal vector(1024) in the migration

export async function embed(text: string, inputType: "query" | "document"): Promise<number[]> {
  const model = Deno.env.get("GEMINI_EMBED_MODEL") ?? "gemini-embedding-001";
  const res = await post(`${BASE}/${model}:embedContent`, {
    content: { parts: [{ text }] },
    taskType: inputType === "query" ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT",
    outputDimensionality: EMBED_DIMS,
  });
  if (!res.ok) throw new Error(`gemini embed ${res.status}`);
  const v: number[] = (await res.json()).embedding.values;
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1; // truncated dims are not unit length
  return v.map((x) => x / norm);
}
