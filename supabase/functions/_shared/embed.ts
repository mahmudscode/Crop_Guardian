// Voyage multilingual embeddings. Confirm current model name in Voyage docs; override via VOYAGE_MODEL.
export async function embed(text: string, inputType: "query" | "document"): Promise<number[]> {
  // Voyage accounts without a payment method are limited to 3 requests/minute (HTTP 429): retry with a pause.
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await call(text, inputType);
    if (res.status === 429 && attempt < 2) {
      await new Promise((r) => setTimeout(r, 21_000));
      continue;
    }
    if (!res.ok) throw new Error(`embedding failed: ${res.status}`);
    const json = await res.json();
    return json.data[0].embedding;
  }
  throw new Error("embedding failed: rate limited");
}

function call(text: string, inputType: "query" | "document"): Promise<Response> {
  return fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("VOYAGE_API_KEY")}`,
    },
    body: JSON.stringify({
      model: Deno.env.get("VOYAGE_MODEL") ?? "voyage-multilingual-2",
      input: [text],
      input_type: inputType,
    }),
  });
}
