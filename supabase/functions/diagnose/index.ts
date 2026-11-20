// Crop Guardian pipeline: upload -> observe (vision) -> retrieve (pgvector) -> answer (Bangla, cards only).
// The photo is processed in memory only and never stored.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { embed, generate, GeminiBusyError, type Part } from "../_shared/gemini.ts";

const CONF_THRESHOLD = Number(Deno.env.get("CONF_THRESHOLD") ?? "0.5"); // tune on test set
const SIM_THRESHOLD = Number(Deno.env.get("SIM_THRESHOLD") ?? "0.3");   // tune on test set

const NONE_NAME = "None of these";

// The vision step may only choose among diseases we hold a verified, embedded card for, and it is shown
// each card's source symptom text so it compares what it sees with the sources (not with its own memory).
const visionPrompt = (known: { disease_name_en: string; symptoms_en: string | null }[]) =>
  `You are a rice plant-health assistant. Look at the photo.
Describe only what you can see: lesion shape, colour, size, position.
The app supports ONLY these diseases. Each is followed by its source description:
${known.map((k) => `- ${k.disease_name_en}: ${k.symptoms_en ?? ""}`).join("\n")}
Rules:
- candidates: up to 3, chosen ONLY from the names above, each with a confidence from 0 to 1 for how well the VISIBLE symptoms match that description.
- If nothing fits, return one candidate named "${NONE_NAME}". When unsure use a confidence below 0.5. Do not guess.
- symptoms: short English phrases for what you see. symptoms_bn: the same in simple Bangla.
Return ONLY JSON: {"is_rice": true|false, "symptoms": [...], "symptoms_bn": [...], "candidates": [{"name_en": "...", "confidence": 0.0}], "photo_quality": "good|poor"}
If the photo is not a rice plant or is unclear, set is_rice=false or photo_quality="poor". Do not give treatment.`;

const ANSWER_PROMPT = `You write advice for a Bangladeshi rice farmer in simple Bangla.
Rules:
- Use ONLY facts stated in the disease cards. Do not add, infer or generalise.
- Copy product names exactly as the card writes them. Never add a dose or a product that the card does not contain.
- Keep every fact's meaning exactly. Do not change who or what a statement is about (for example, a statement about rice varieties tolerating flooding must not become a statement about tolerating the disease).
- The vision step's most likely disease is given as [likely disease]. Use that disease's card unless the symptom JSON clearly contradicts it. If no card fits, set disease_en to null.
- Return ONLY JSON: {"disease_en": "<disease_name_en of the chosen card, or null>", "diagnosis_bn": "<one short Bangla sentence saying the disease is LIKELY, e.g. \"ব্লাস্ট রোগ হওয়ার সম্ভাবনা আছে\"; never state it as certain>", "what_to_do_bn": ["<short Bangla step>", ...], "prevention_bn": ["<short Bangla step>", ...]}
- Each list item is ONE short sentence. Leave a list empty if the card has nothing for it. Do not write the source name; the app adds it. Do not write contact advice; the app adds it.`;

// Best-effort per-IP rate limit (in-memory, per function instance): protects free-tier quota.
const hits = new Map<string, number[]>();
const LIMIT = 10, WINDOW_MS = 10 * 60_000;
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

// Verified + embedded cards, cached for 5 minutes per function instance.
let knownCache: { at: number; rows: { disease_name_en: string; symptoms_en: string | null }[] } | null = null;
// deno-lint-ignore no-explicit-any
async function knownCards(db: any) {
  if (knownCache && Date.now() - knownCache.at < 300_000) return knownCache.rows;
  const { data, error } = await db.from("disease_cards").select("disease_name_en, symptoms_en")
    .eq("verified", true).not("embedding", "is", null);
  if (error) throw new Error(error.message);
  knownCache = { at: Date.now(), rows: data ?? [] };
  return knownCache.rows;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const RETRY_MSG_BN = "ছবিটি পরিষ্কার নয় বা ধান গাছের পাতা নয়। অনুগ্রহ করে আরেকটি পরিষ্কার ছবি তুলুন।";
const ERROR_MSG_BN = "কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
const BUSY_MSG_BN = "সার্ভার এখন ব্যস্ত। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
const LIMIT_MSG_BN = "অনেক বেশি অনুরোধ করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
const OFFICER_MSG_BN = "আমি নিশ্চিত নই। অনুগ্রহ করে আপনার স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const t0 = Date.now();
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return json({ status: "rate_limited", message_bn: LIMIT_MSG_BN }, 429);
  try {
    const { image_base64, media_type } = await req.json();
    if (!image_base64 || !["image/jpeg", "image/png", "image/webp"].includes(media_type)) {
      return json({ status: "bad_request", message_bn: RETRY_MSG_BN }, 400);
    }
    if (image_base64.length > 7_000_000) return json({ status: "too_large", message_bn: RETRY_MSG_BN }, 413);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const known = await knownCards(db);
    if (!known.length) return json({ status: "no_card", message_bn: OFFICER_MSG_BN, seconds: (Date.now() - t0) / 1000 });

    // 1. Observe (candidates limited to diseases we have verified cards for)
    const raw = await generate(
      [{ inline_data: { mime_type: media_type, data: image_base64 } }, { text: visionPrompt(known) }] as Part[],
      { json: true },
    );
    const obs = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    const names = new Set(known.map((k) => k.disease_name_en.toLowerCase()));
    obs.candidates = (Array.isArray(obs.candidates) ? obs.candidates : [])
      .map((c: { name_en: string; confidence: unknown }) => ({ name_en: String(c.name_en ?? ""), confidence: Number(c.confidence) || 0 }))
      .filter((c: { name_en: string }) => names.has(c.name_en.toLowerCase()));
    const top = [...obs.candidates].sort((a, b) => b.confidence - a.confidence)[0];

    if (!obs.is_rice || obs.photo_quality === "poor") {
      return json({ status: "retry_photo", message_bn: RETRY_MSG_BN, observation: obs, seconds: (Date.now() - t0) / 1000 });
    }
    // no candidate from our list ("None of these"), or too unsure: refer to the officer instead of guessing
    if (!top || top.confidence < CONF_THRESHOLD) {
      return json({ status: "low_confidence", message_bn: OFFICER_MSG_BN, observation: obs, seconds: (Date.now() - t0) / 1000 });
    }

    // 2. Retrieve
    const query = [...(obs.symptoms ?? []), ...obs.candidates.map((c: { name_en: string }) => c.name_en)].join("; ");
    const vec = await embed(query, "query");
    const { data: retrieved, error } = await db.rpc("match_disease_cards", {
      query_embedding: vec, match_count: 3, min_similarity: SIM_THRESHOLD,
    });
    if (error) throw new Error(error.message);
    const cards = [...(retrieved ?? [])];
    if (!cards.some((c: { disease_name_en: string }) => c.disease_name_en.toLowerCase() === top.name_en.toLowerCase())) {
      // make sure the card for the top candidate is always available to the answer step
      const { data: own } = await db.from("disease_cards").select("*").eq("verified", true).ilike("disease_name_en", top.name_en).limit(1);
      if (own?.length) cards.push(own[0]);
    }
    if (!cards.length) {
      return json({ status: "no_card", message_bn: OFFICER_MSG_BN, observation: obs, seconds: (Date.now() - t0) / 1000 });
    }

    // 3. Answer (grounded): the model must pick ONE card; only that card's source is shown.
    const slim = cards.map((c: Record<string, unknown>) => { const { embedding: _e, ...rest } = c; return rest; });
    const raw2 = await generate(
      [{ text: `${ANSWER_PROMPT}\n\n[likely disease]\n${top.name_en}\n\n[disease cards]\n${JSON.stringify(slim)}\n\n[symptom JSON]\n${JSON.stringify(obs)}` }],
      { json: true },
    );
    const ans = JSON.parse(raw2.slice(raw2.indexOf("{"), raw2.lastIndexOf("}") + 1));
    const chosen = cards.find((c: { disease_name_en: string }) => c.disease_name_en === ans.disease_en);
    const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);
    const doNow = list(ans.what_to_do_bn), prevent = list(ans.prevention_bn);
    if (!chosen || !ans.diagnosis_bn) {
      return json({ status: "no_card", message_bn: OFFICER_MSG_BN, observation: obs, seconds: (Date.now() - t0) / 1000 });
    }
    return json({
      status: "ok",
      sections: { diagnosis_bn: String(ans.diagnosis_bn), what_to_do_bn: doNow, prevention_bn: prevent },
      answer_bn: [ans.diagnosis_bn, ...doNow, ...prevent].join("\n"), // plain-text fallback
      confidence: top.confidence,
      top_candidate: top.name_en,
      disease_en: chosen.disease_name_en,
      sources: [{ name: chosen.source_name, url: chosen.source_url, page: chosen.source_page }],
      observation: obs,
      seconds: (Date.now() - t0) / 1000,
    });
  } catch (e) {
    if (e instanceof GeminiBusyError) {
      console.error(e.message);
      return json({ status: "busy", message_bn: BUSY_MSG_BN, detail: e.message }, 503);
    }
    console.error(e); // never log image data
    // detail carries only our own short error text (e.g. "gemini generate 503"), never image data
    return json({ status: "error", message_bn: ERROR_MSG_BN, detail: e instanceof Error ? e.message.slice(0, 120) : "unknown" }, 500);
  }
});
