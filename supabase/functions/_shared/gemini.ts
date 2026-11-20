// Google Gemini (free tier) helpers. Model names are env-overridable; confirm current names in Google AI docs.
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const key = () => Deno.env.get("GEMINI_API_KEY")!;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class GeminiBusyError extends Error {}

// Fail fast: 25 s timeout per call. With fallback models available a busy model is skipped immediately;
// otherwise one short retry on 429/503. A GeminiBusyError tells the caller to show "busy, try again".
async function post(url: string, body: unknown, retries = 1): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    let res: Response | null = null;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key() },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(25_000),
      });
    } catch {
      throw new GeminiBusyError("gemini timeout");
    }
    // 404 = the model name is closed or renamed for this account: skip it like a busy model
    if (res.status === 404) throw new GeminiBusyError("gemini model not found 404");
    if (res.status === 429 || res.status === 503) {
      if (attempt < retries) { await sleep(res.status === 429 ? 8_000 : 2_000); continue; }
      throw new GeminiBusyError(`gemini busy ${res.status}`);
    }
    return res;
  }
}

export type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

// Free-tier models are sometimes overloaded or out of quota for hours, so a list of fallbacks is tried in order.
// Different models can behave differently: the evaluation numbers in docs/operations/evaluation.md are for the primary only.
function modelChain(): string[] {
  const primary = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.1-flash-lite";
  const fallbacks = (Deno.env.get("GEMINI_FALLBACK_MODELS") ?? "gemini-3.5-flash-lite,gemini-flash-lite-latest")
    .split(",").map((m) => m.trim()).filter((m) => m && m !== primary);
  return [primary, ...fallbacks];
}

// Cool-down: a model that just failed (busy, quota, closed or timed out) is skipped for 2 minutes by this function instance,
// so one overloaded model does not add its 25 s timeout to every request. If every model is cooling down, all are tried.
const COOL_MS = 120_000;
const coolUntil = new Map<string, number>();

export async function generateWithModel(parts: Part[], opts: { json?: boolean; maxTokens?: number } = {}): Promise<{ text: string; model: string }> {
  const all = modelChain();
  const ready = all.filter((m) => (coolUntil.get(m) ?? 0) <= Date.now());
  const chain = ready.length ? ready : all;
  let lastBusy: GeminiBusyError | null = null;
  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    try {
      const res = await post(`${BASE}/${model}:generateContent`, {
        contents: [{ role: "user", parts }],
        generationConfig: {
          maxOutputTokens: opts.maxTokens ?? 4096,
          temperature: 0.2,
          ...(opts.json ? { responseMimeType: "application/json" } : {}),
        },
      }, i < chain.length - 1 ? 0 : 1);
      if (!res.ok) throw new Error(`gemini generate ${res.status}`);
      const j = await res.json();
      const text = j.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
      if (!text) throw new Error("gemini returned no text");
      return { text, model };
    } catch (e) {
      if (e instanceof GeminiBusyError) { lastBusy = e; coolUntil.set(model, Date.now() + COOL_MS); continue; }
      throw e;
    }
  }
  throw lastBusy ?? new GeminiBusyError("gemini busy");
}

export async function generate(parts: Part[], opts: { json?: boolean; maxTokens?: number } = {}): Promise<string> {
  return (await generateWithModel(parts, opts)).text;
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
