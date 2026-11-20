const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class ImageReadError extends Error {}

// Downscale to max 1024px and re-encode as JPEG q0.8 to save bandwidth. Returns base64 without prefix.
export async function prepareImage(file) {
  if (!file.type.startsWith("image/")) throw new ImageReadError("not an image");
  let bmp;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new ImageReadError("cannot decode image");
  }
  const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
  return dataUrl.split(",")[1];
}

export async function diagnose(imageBase64) {
  const res = await fetch(`${URL_BASE}/functions/v1/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ image_base64: imageBase64, media_type: "image/jpeg" }),
  });
  return res.json();
}

// Follow-up chat. `messages` = [{role: "user"|"assistant", content}], `diseaseEn` = the diagnosed disease (or null).
// Nothing is stored; the server answers only from verified disease cards.
export async function chat(messages, diseaseEn) {
  const res = await fetch(`${URL_BASE}/functions/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ messages, ...(diseaseEn ? { disease_en: diseaseEn } : {}) }),
  });
  return res.json();
}
