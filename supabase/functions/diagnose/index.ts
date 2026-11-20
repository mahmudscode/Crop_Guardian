// Crop Guardian pipeline: upload -> observe (vision) -> retrieve (pgvector) -> answer (Bangla, cards only).
// The photo is processed in memory only and never stored.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { embed, generate, GeminiBusyError, type Part } from "../_shared/gemini.ts";

const CONF_THRESHOLD = Number(Deno.env.get("CONF_THRESHOLD") ?? "0.5"); // tune on test set
const SIM_THRESHOLD = Number(Deno.env.get("SIM_THRESHOLD") ?? "0.3");   // tune on test set

const VISION_PROMPT = `You are a rice plant-health assistant. Look at the leaf photo.
Describe only what you can see: lesion shape, colour, size, position.
Return ONLY JSON: {"is_rice": true|false, "symptoms": [...], "candidates": [{"name_en": "...", "confidence": 0-1}], "photo_quality": "good|poor"}
Give at most 3 candidates. If the photo is not a rice plant or is unclear, set is_rice=false or photo_quality="poor". Do not give treatment.`;

const ANSWER_PROMPT = `You write advice for a Bangladeshi rice farmer in simple Bangla.
Rules:
- Use ONLY facts stated in the disease cards. Do not add, infer or generalise.
- Copy product names exactly as the card writes them. Never add a dose or a product that the card does not contain.
- Keep every fact's meaning exactly. Do not change who or what a statement is about (for example, a statement about rice varieties tolerating flooding must not become a statement about tolerating the disease).
- Choose the ONE card that best matches the symptom JSON. If none matches, set disease_en to null.
- Return ONLY JSON: {"disease_en": "<disease_name_en of the chosen card, or null>", "answer_bn": "<Bangla text>"}
- answer_bn format: 1) likely disease 2) what to do now 3) how to prevent it. End with one sentence advising the farmer to contact the local agriculture officer if the problem is serious. Do not write the source name; the app adds it.`;

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

    // 1. Observe
    const raw = await generate(
      [{ inline_data: { mime_type: media_type, data: image_base64 } }, { text: VISION_PROMPT }] as Part[],
      { json: true },
    );
    const obs = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    const top = [...(obs.candidates ?? [])].sort((a, b) => b.confidence - a.confidence)[0];

    if (!obs.is_rice || obs.photo_quality === "poor") {
      return json({ status: "retry_photo", message_bn: RETRY_MSG_BN, observation: obs, seconds: (Date.now() - t0) / 1000 });
    }
    if (!top || top.confidence < CONF_THRESHOLD) {
      return json({ status: "low_confidence", message_bn: OFFICER_MSG_BN, observation: obs, seconds: (Date.now() - t0) / 1000 });
    }

    // 2. Retrieve
    const query = [...obs.symptoms, ...obs.candidates.map((c: { name_en: string }) => c.name_en)].join("; ");
    const vec = await embed(query, "query");
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: cards, error } = await db.rpc("match_disease_cards", {
      query_embedding: vec, match_count: 3, min_similarity: SIM_THRESHOLD,
    });
    if (error) throw new Error(error.message);
    if (!cards?.length) {
      return json({ status: "no_card", message_bn: OFFICER_MSG_BN, observation: obs, seconds: (Date.now() - t0) / 1000 });
    }

    // 3. Answer (grounded): the model must pick ONE card; only that card's source is shown.
    const raw2 = await generate(
      [{ text: `${ANSWER_PROMPT}\n\n[disease cards]\n${JSON.stringify(cards)}\n\n[symptom JSON]\n${JSON.stringify(obs)}` }],
      { json: true },
    );
    const ans = JSON.parse(raw2.slice(raw2.indexOf("{"), raw2.lastIndexOf("}") + 1));
    const chosen = cards.find((c: { disease_name_en: string }) => c.disease_name_en === ans.disease_en);
    if (!chosen || !ans.answer_bn) {
      return json({ status: "no_card", message_bn: OFFICER_MSG_BN, observation: obs, seconds: (Date.now() - t0) / 1000 });
    }
    return json({
      status: "ok",
      answer_bn: ans.answer_bn,
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
