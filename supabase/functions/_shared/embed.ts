// Voyage multilingual embeddings. Confirm current model name in Voyage docs; override via VOYAGE_MODEL.
export async function embed(text: string, inputType: "query" | "document"): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
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
  if (!res.ok) throw new Error(`embedding failed: ${res.status}`);
  const json = await res.json();
  return json.data[0].embedding;
}
