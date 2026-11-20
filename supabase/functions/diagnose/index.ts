// Crop Guardian pipeline: upload -> observe (vision) -> retrieve (pgvector) -> answer (Bangla, cards only).
// The photo is processed in memory only and never stored.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { embed, generateWithModel, GeminiBusyError, type Part } from "../_shared/gemini.ts";

// Evidence gate (replaces the model's self-reported confidence, which did not separate right from wrong answers):
// a disease is only offered if >= MIN_MATCHES features from its card are visibly present AND
// matches / (matches + not_seen) >= EVIDENCE_MIN_RATIO. The displayed confidence is that ratio, computed here.
const MIN_MATCHES = Number(Deno.env.get("MIN_MATCHES") ?? "2");
const EVIDENCE_MIN_RATIO = Number(Deno.env.get("EVIDENCE_MIN_RATIO") ?? "0.5");
const SIM_THRESHOLD = Number(Deno.env.get("SIM_THRESHOLD") ?? "0.3");   // tune on test set

// The vision step may only choose among diseases we hold a verified, embedded card for, and it is shown
// each card's source symptom text so it compares what it sees with the sources (not with its own memory).
const visionPrompt = (known: { disease_name_en: string; symptoms_en: string | null }[]) =>
  `You are a careful rice plant-health assistant. Look at the photo.
Describe only what you can see: lesion shape, colour, size, position.
The app supports ONLY these diseases. Each is followed by its source description:
${known.map((k) => `- ${k.disease_name_en}: ${k.symptoms_en ?? ""}`).join("\n")}

First decide an overall "assessment":
- "healthy": the leaves look healthy, with no clear lesions or damage.
- "listed": the visible symptoms clearly match one or more diseases in the list above.
- "other": there is damage or lesions, but they do not clearly match any listed disease (another disease, an insect, a nutrient problem, or damage you cannot identify).
- "unclear": the photo is too blurry, too far away or too limited to judge.
Be strict. Most photos will NOT clearly match a listed disease. Choose "listed" only if you can point to at least two specific features from that disease's description that are visible in THIS photo. Never guess.

For "listed", give up to 3 candidates, chosen ONLY from the names above. For each candidate give:
- "visible_matches": features from its description that you can actually see in this photo (short phrases),
- "not_seen": features from its description that you looked for and did NOT see (short phrases).
For any other assessment, give an empty candidates list.
symptoms: short English phrases for what you see. symptoms_bn: the same in simple Bangla.
Return ONLY JSON: {"is_rice": true|false, "photo_quality": "good|poor", "assessment": "healthy|listed|other|unclear", "symptoms": [...], "symptoms_bn": [...], "candidates": [{"name_en": "...", "visible_matches": [...], "not_seen": [...]}]}
If the photo is not a rice plant, set is_rice=false. Do not give treatment.`;

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

// `model` is included in every response so evaluation results record which Gemini model actually answered.
const baseJson = (body: unknown, status: number, model: string) =>
  new Response(JSON.stringify({ ...(body as object), model }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const RETRY_MSG_BN = "ছবিটি পরিষ্কার নয় বা ধান গাছের পাতা নয়। অনুগ্রহ করে আরেকটি পরিষ্কার ছবি তুলুন।";
const ERROR_MSG_BN = "কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
const BUSY_MSG_BN = "সার্ভার এখন ব্যস্ত। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
const LIMIT_MSG_BN = "অনেক বেশি অনুরোধ করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
const HEALTHY_MSG_BN = "ছবিতে রোগের স্পষ্ট লক্ষণ দেখা যাচ্ছে না। সন্দেহ থাকলে স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।";
const OFFICER_MSG_BN = "আমি নিশ্চিত নই। অনুগ্রহ করে আপনার স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const t0 = Date.now();
  let modelUsed = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.1-flash-lite"; // updated to the model that really answered
  const json = (body: unknown, status = 200) => baseJson(body, status, modelUsed);
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  // The ADMIN_KEY header skips the per-IP limit so the evaluation script can run its photo set.
  const isAdmin = !!Deno.env.get("ADMIN_KEY") && req.headers.get("x-admin-key") === Deno.env.get("ADMIN_KEY");
  if (!isAdmin && limited(ip)) return json({ status: "rate_limited", message_bn: LIMIT_MSG_BN }, 429);
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
    const vision = await generateWithModel(
      [{ inline_data: { mime_type: media_type, data: image_base64 } }, { text: visionPrompt(known) }] as Part[],
      { json: true },
    );
    modelUsed = vision.model;
    const raw = vision.text;
    const obs = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    const names = new Set(known.map((k) => k.disease_name_en.toLowerCase()));
    const strs = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);
    // confidence is computed from the evidence the model listed, not self-reported
    obs.candidates = (Array.isArray(obs.candidates) ? obs.candidates : [])
      .map((c: { name_en: string; visible_matches: unknown; not_seen: unknown }) => {
        const m = strs(c.visible_matches).length, n = strs(c.not_seen).length;
        return { name_en: String(c.name_en ?? ""), matches: m, not_seen: n, confidence: m >= MIN_MATCHES ? Math.round((m / (m + n)) * 100) / 100 : 0,
          visible_matches: strs(c.visible_matches), not_seen_list: strs(c.not_seen) };
      })
      .filter((c: { name_en: string }) => names.has(c.name_en.toLowerCase()));
    const top = [...obs.candidates].sort((a, b) => b.confidence - a.confidence || b.matches - a.matches)[0];
    const secs = () => (Date.now() - t0) / 1000;

    if (!obs.is_rice || obs.photo_quality === "poor" || obs.assessment === "unclear") {
      return json({ status: "retry_photo", message_bn: RETRY_MSG_BN, observation: obs, seconds: secs() });
    }
    if (obs.assessment === "healthy") {
      return json({ status: "healthy_like", message_bn: HEALTHY_MSG_BN, observation: obs, seconds: secs() });
    }
    // "other", or a "listed" claim without enough visible evidence: refer to the officer instead of guessing
    if (obs.assessment !== "listed" || !top || top.confidence < EVIDENCE_MIN_RATIO) {
      return json({ status: "low_confidence", message_bn: OFFICER_MSG_BN, observation: obs, seconds: secs() });
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
    const answer = await generateWithModel(
      [{ text: `${ANSWER_PROMPT}\n\n[likely disease]\n${top.name_en}\n\n[disease cards]\n${JSON.stringify(slim)}\n\n[symptom JSON]\n${JSON.stringify(obs)}` }],
      { json: true },
    );
    const raw2 = answer.text;
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
      disease_bn: chosen.disease_name_bn,
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
