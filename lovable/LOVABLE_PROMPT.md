# Lovable prompt (paste into Lovable)

Before pasting: create a Supabase project, connect it in Lovable (Supabase integration), and deploy the `diagnose` Edge Function from this repo (see [docs/SETUP.md](../docs/SETUP.md)).

```
Build a mobile-first, Bangla-first single-page web app called "Crop Guardian" (ক্রপ গার্ডিয়ান) for Bangladeshi rice farmers on basic smartphones and weak connections.

One screen, one job: the farmer takes or picks a photo of a rice leaf and gets a Bangla diagnosis.

UI (all strings in Bangla, large text, high contrast, big touch targets, green agricultural theme):
- Header with app name and a one-line Bangla tagline: "ধানের পাতার ছবি তুলুন, রোগের সমাধান জানুন"
- A large primary button "ছবি তুলুন" that opens the camera (input type=file accept="image/*" capture="environment"), and a secondary button "গ্যালারি থেকে নিন".
- Show an image preview. Before upload, downscale the image client-side to max 1024px on the long edge and re-encode as JPEG quality 0.8 to save bandwidth.
- A button "রোগ নির্ণয় করুন". While waiting show a friendly Bangla loading state.
- Call the Supabase Edge Function `diagnose` with POST JSON {image_base64 (no data: prefix), media_type: "image/jpeg"} using supabase.functions.invoke. Do not store the photo anywhere (no storage bucket, no database writes of the image).
- Render the response by `status`:
  - "ok": a result card showing `answer_bn` (preserve line breaks), a confidence badge (percentage from `confidence`; green >= 70%, amber 50-69%), a "উৎস" (source) section listing `sources` names (link if url present), and the observed symptoms from `observation.symptoms`.
  - "retry_photo", "low_confidence", "no_card", "error", "bad_request", "too_large": show `message_bn` in a warning card plus a button "আরেকটি ছবি তুলুন" and a card "স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন" (Department of Agricultural Extension, hotline placeholder text).
- Show `seconds` in small text ("সময়: X সেকেন্ড").
- Footer notice in Bangla: "ছবি সংরক্ষণ করা হয় না। এটি কেবল সহায়ক পরামর্শ; গুরুতর হলে কৃষি কর্মকর্তার পরামর্শ নিন।"
- Handle offline/network errors with a Bangla message.

Constraints: no login, no accounts, no analytics that capture images. Keep it simple: a single page, no extra features. Use React + Tailwind + the connected Supabase client.
```

## After Lovable generates the app
- Check the Edge Function call uses the project's Supabase client and the `diagnose` function name.
- Test on a phone-width viewport.
- Push the Lovable project to GitHub in a separate repo or sync into this repo's `app/` folder.
