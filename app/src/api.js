const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Downscale to max 1024px and re-encode as JPEG q0.8 to save bandwidth. Returns base64 without prefix.
export async function prepareImage(file) {
  const bmp = await createImageBitmap(file);
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
