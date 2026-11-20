// Admin-only: embeds all cards missing an embedding. Call with header x-admin-key = ADMIN_KEY secret.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { embed } from "../_shared/embed.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.headers.get("x-admin-key") !== Deno.env.get("ADMIN_KEY")) {
    return new Response("forbidden", { status: 403, headers: corsHeaders });
  }
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cards, error } = await db.from("disease_cards").select("*").is("embedding", null);
  if (error) return new Response(error.message, { status: 500, headers: corsHeaders });

  let done = 0;
  for (const c of cards ?? []) {
    const text = [c.disease_name_en, c.disease_name_bn, c.symptoms_en, c.symptoms_bn].filter(Boolean).join("\n");
    const vec = await embed(text, "document");
    const { error: e } = await db.from("disease_cards").update({ embedding: vec }).eq("id", c.id);
    if (e) return new Response(e.message, { status: 500, headers: corsHeaders });
    done++;
  }
  return new Response(JSON.stringify({ embedded: done }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
