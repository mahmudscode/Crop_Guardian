"""Generates video/VIDEO_MAP.md from timeline.json. Usage: make_map.py <timeline.json> <out.md>"""
import json, re, sys

TL = json.load(open(sys.argv[1]))
wc = lambda s: len(re.findall(r"[A-Za-z'’\-]+", s))
mmss = lambda t: f"{int(t // 60)}:{t % 60:04.1f}"

# ---- original narration (the user's script), placed in the scene where it belongs
ORIG = {
 "p1": "Imagine being a rice farmer in Bangladesh. Your crops are showing signs of disease. Every day you wait, the damage can become worse.",
 "p2": "But identifying the disease is not easy. Agricultural experts are not always available, and reliable information is often difficult to understand.",
 "p3": "This is not just a farming problem. It is a food security challenge affecting millions of farmers.",
 "p4": "What if every farmer could access agricultural guidance with just a smartphone?",
 "s1": "Introducing Crop Guardian, an AI-powered, Bangla-first rice disease detection and advisory platform. Our mission is simple: make agricultural knowledge accessible to every farmer.",
 "home": "Farmers simply upload a picture of an affected rice leaf. Crop Guardian analyzes the image, identifies potential diseases, retrieves relevant agricultural knowledge, and provides practical treatment and prevention recommendations in simple Bangla.",
 "s3": "Unlike a basic AI chatbot, our system connects AI-generated responses with a curated agricultural knowledge base.",
 "d1": "Let's see how Crop Guardian works. First, we open our web application. The interface is designed to be simple and accessible, even for farmers with limited technical experience. Now, let's upload a photograph of a rice leaf.",
 "d2": "Once the image is submitted, our AI-powered vision system analyzes the visible symptoms and identifies potential disease candidates. But we don't stop at image recognition. The system checks the observed symptoms against known disease characteristics. Next, our Retrieval-Augmented Generation system searches our agricultural knowledge base for relevant information.",
 "d3": "Based on the retrieved evidence, Crop Guardian generates a structured response. Farmers can understand the likely disease, recognize its symptoms, and learn recommended management and prevention practices in Bangla.",
 "d4": "(no line in the original script)",
 "d5": "Most importantly, when the image is unclear or evidence is insufficient, Crop Guardian avoids making an unsupported diagnosis and recommends consulting an agricultural expert. This is how we turn an image into actionable agricultural guidance.",
 "a1": "Behind Crop Guardian is a practical AI architecture. We use Google Gemini for multimodal image understanding and natural language generation. We use Gemini Embedding to transform agricultural knowledge into semantic vectors. Our Supabase PostgreSQL database with pgvector powers the RAG retrieval pipeline. The system retrieves the three most relevant disease knowledge cards before generating its response.",
 "a2": "Our knowledge base currently covers five rice diseases, using agricultural references including IRRI and the Pacific Pests, Pathogens and Weeds database.",
 "a3": "We combine multimodal AI, evidence-based verification, and responsible AI safeguards to reduce unsupported recommendations.",
 "i1": "Our vision is to make Crop Guardian a trusted digital agricultural assistant for farmers across Bangladesh and, eventually, other rice-growing communities worldwide. We aim to measure success through disease identification agreement with agricultural experts, response time, farmer usability, and successful access to reliable guidance.",
 "i2": "Our next steps include expanding the disease knowledge base, conducting larger expert-validated field evaluations, improving Bangla localization, and developing a mobile-first experience.",
 "i3": "We are not just building another AI chatbot. We are building a bridge between artificial intelligence and the farmers who feed our nation. This is Crop Guardian. From a simple leaf image to smarter agricultural decisions. Thank you.",
}
# ---- suggested time-safe narration (optional; same facts, fewer words)
SAFE = {
 "p1": ORIG["p1"],
 "p2": "But identifying the disease is not easy. Agricultural experts are not always available, and reliable information is hard to understand.",
 "p3": ORIG["p3"],
 "p4": "What if every farmer could get guidance with just a smartphone?",
 "s1": "Introducing Crop Guardian, a Bangla-first, AI-powered rice disease advisory platform. Our mission: knowledge for every farmer.",
 "home": "Farmers simply upload a picture of an affected rice leaf. Crop Guardian analyzes the image, identifies potential diseases, and explains treatment and prevention in simple Bangla.",
 "s3": "Unlike a basic AI chatbot, our system connects AI-generated responses with a curated agricultural knowledge base, and every answer cites its source.",
 "d1": "Let's see how it works. Our simple app opens, and we upload a leaf photo.",
 "d2": "Our vision system checks the visible symptoms against known disease characteristics. Then retrieval searches the knowledge base.",
 "d3": "Based on the retrieved evidence, Crop Guardian generates a structured response. Farmers learn the likely disease, its symptoms, and recommended management and prevention practices in Bangla.",
 "d4": "Farmers can also ask follow-up questions. Answers come only from the verified knowledge base, never from the model's memory.",
 "d5": "Most importantly, when the image is unclear or the evidence is insufficient, Crop Guardian avoids an unsupported diagnosis and recommends consulting an agricultural expert. This is how we turn an image into actionable guidance.",
 "a1": "Behind Crop Guardian: Google Gemini understands the image and writes the answer, Gemini Embedding turns knowledge into vectors, and Supabase with pgvector retrieves the three most relevant disease cards.",
 "a2": "Our knowledge base covers five rice diseases, from IRRI and the Pacific Pests, Pathogens and Weeds database.",
 "a3": "Evidence checks and responsible AI safeguards reduce unsupported recommendations. Photos are not stored.",
 "i1": "We will measure success through agreement with agricultural experts, response time, farmer usability, and access to reliable guidance.",
 "i2": "Next: a larger knowledge base, expert-validated field evaluations, better Bangla localization, and a mobile-first experience.",
 "i3": "Our vision: a trusted digital assistant for farmers across Bangladesh and beyond. A bridge between AI and the farmers who feed our nation. This is Crop Guardian. Thank you.",
}
# scenes in the demo are pieces d1,d2,d3,d4 and d5a/d5b/d5c merged into d5
groups = []
for p in TL:
    key = "d5" if p["piece"].startswith("d5") else p["piece"]
    if groups and groups[-1]["key"] == key:
        groups[-1]["end"] = p["end"]; groups[-1]["what"] += " / " + p["what"]
    else:
        groups.append({"key": key, "seg": p["segment"], "start": p["start"], "end": p["end"], "what": p["what"]})

SCENE = {  # what the viewer sees, in plain words
 "p1": "Slide: dim photo of a rice leaf with spots; text 'Your rice leaves show spots. Is it blast? Brown spot? Something else?'",
 "p2": "Slide: 'Experts are not always within reach': 1 officer per block of ~2,500-3,000 farm households (2011 data); information in English or long documents",
 "p3": "Slide: '~1% of Bangladesh's rice is damaged by blast alone' (BRRI, ~40 million tonnes grown a year)",
 "p4": "Slide: 'What if every farmer could get guidance with just a smartphone?'",
 "s1": "Title slide: Crop Guardian / ক্রপ গার্ডিয়ান, 'AI-powered, Bangla-first rice disease advisory platform'",
 "home": "REAL APP in a phone frame: the Bangla home screen with three large buttons; captions 'A simple interface in Bangla' and 'Photo in, guidance out'",
 "s3": "Slide: three steps (upload, AI compares with a verified cited knowledge base, Bangla guidance with source); note 'not a free-form chatbot'",
 "d1": "REAL APP: home screen, then a rice-leaf photo is uploaded and previewed; caption 'Open the web app' then 'Upload a photo of the affected leaf'",
 "d2": "REAL APP: diagnose button tapped, loading state ('SPED UP' badge: the real wait of about 24 s is shortened)",
 "d3": "REAL APP: the Bangla result appears: likely disease, what to do now, prevention, symptoms seen, source link; the page scrolls through it. Caption note: 'Example run on a public-dataset photo. Results vary, and accuracy is not yet validated.'",
 "d4": "REAL APP: tap the suggestion 'What should I do now?' in the chat; the answer appears ('SPED UP': real wait shortened). Caption: 'Ask follow-up questions'",
 "d5": "REAL APP: a deliberately blurred leaf photo is uploaded; the analysis runs (shortened); the app declines ('the photo is unclear, take another') and shows the agriculture-officer card",
 "a1": "Slide: architecture: Leaf photo, Gemini vision, Gemini Embedding, Supabase + pgvector (top 3 cards), Gemini answer; orange box 'Unclear photo... no diagnosis, ask the agriculture officer'",
 "a2": "Slide: five disease chips (Blast, Brown spot, Bacterial leaf blight, Sheath blight, Tungro); IRRI 2018 and Pacific Pests 2021; note 'cards are being verified by a person'",
 "a3": "Slide: Responsible AI: verified cited cards only; at least two visible symptoms; no doses beyond the source; photos not stored",
 "i1": "Slide: 'How we will measure success' (4 items) + honest note: early test on 42 public photos, median 4.8 s, expert validation still to do",
 "i2": "Slide: Next steps (4 items)",
 "i3": "Closing slide: 'Crop Guardian. From a simple leaf image to smarter agricultural decisions.' + live app and GitHub links",
}

L = []
L.append("""# Crop Guardian demo video: text map

A silent, screen-recorded video that follows your 180-second voice-over structure, and the text to read against it.

- **Video file:** `video/crop_guardian_demo_silent.mp4` (1280x720, 30 fps, 179.97 s, no audio). It is not committed to git (large file); it lives on your computer in the `video/` folder.
- **What is real:** every phone scene is the real app, recorded running on this computer against the live backend, not a mock-up. The slides use only facts that are sourced (see the footers on the slides) or measured by us.
- **What is shortened:** waiting time. The AI can take 10 to 60 seconds, so those waits are sped up and carry an orange **SPED UP** label (or the caption says so).
- **How to add your voice:** import the mp4 into any editor (for example CapCut, DaVinci Resolve, Kdenlive), record your voice (a free recorder such as Audacity works), and place each paragraph of the narration where the table below says. Export as mp4.

## Read this first: three honest points about what the video shows

1. **The diagnosis scene is a best case, and it is labelled.** On the demo photo (a blast-labelled leaf from a public dataset) the live app gave the correct "Blast" answer on 5 of 12 runs during this session (and on only 1 of the last 6 recording attempts in a row). Across all 12 disease photos we tried twice each, only 2 of 24 runs were correct. The video shows a real correct run with the caption "Results vary, and accuracy is not yet validated", and also shows a case where the app declines. Please keep that caption, or say something equivalent in the voice-over. Showing only the best run without saying so would mislead viewers and judges (the Congress guide counts misleading demos against you).
2. **Speed.** Median 4.8 s per photo in our 42-photo test, but 10 to 60 seconds on the day we recorded, because Google's free AI tier was busy. The video labels the shortened waits.
3. **The chat scene** is not in your original script. It shows the new follow-up chat; the map offers one optional sentence to cover it.

## Timeline: what is on screen, and when to say what

Timecodes are exact. The bold narration keeps your wording and ideas but is trimmed so each scene fits (see the pacing check below). Reading pace: 2.5 words per second (150 a minute) is comfortable; the Pace column shows each scene's rate. **Record the bold narration**; your original lines are shown for reference and for the pacing check below.
""")

cur = None
for g in groups:
    if g["seg"] != cur:
        cur = g["seg"]
        L.append(f"\n### {cur}\n")
        L.append("| Time | Scene | What the viewer sees | Narration to record (time-safe) | Pace | Your original lines for this scene |")
        L.append("|---|---|---|---|---|---|")
    dur = g["end"] - g["start"]
    o, sf = ORIG[g["key"]], SAFE[g["key"]]
    ow = wc(o) if not o.startswith("(") else 0
    rate = wc(sf) / dur
    pace = f"{wc(sf)} w / {dur:.0f} s = {rate:.1f} w/s" + (" (fast)" if rate > 2.7 else "")
    ofl = f" *({ow} w; needs {ow / 2.5:.0f} s{' - does not fit' if ow / 2.5 > dur + 0.5 else ''})*" if ow else ""
    L.append(f"| {mmss(g['start'])}-{mmss(g['end'])} | {g['key']} | {SCENE[g['key']]} | **{sf}** | {pace} | {o}{ofl} |")

# ---- pacing check by section
L.append("\n## Pacing check (your original script)\n")
L.append("| Section | Words | Time slot | Needs at 140 wpm | Needs at 160 wpm | Verdict |")
L.append("|---|---|---|---|---|---|")
secs = [("1 The problem (0:00-0:30)", ["p1", "p2", "p3", "p4"], 30), ("2 Our solution (0:30-1:00)", ["s1", "home", "s3"], 30),
        ("3 Live demonstration (1:00-2:00)", ["d1", "d2", "d3", "d5"], 60), ("4 Our AI approach (2:00-2:30)", ["a1", "a2", "a3"], 30), ("5 Impact and what's next (2:30-3:00)", ["i1", "i2", "i3"], 30)]
tot = 0
for name, keys, slot in secs:
    w = sum(wc(ORIG[k]) for k in keys); tot += w
    a, b = w / (140 / 60), w / (160 / 60)
    v = "fits" if b <= slot * 0.97 else ("tight" if a <= slot * 1.03 else "**too long**")
    L.append(f"| {name} | {w} | {slot} s | {a:.0f} s | {b:.0f} s | {v} |")
L.append(f"\nTotal: {tot} words in 180 s needs about {tot / 3:.0f} words a minute: fast. Sections 4 and 5 do not fit; the time-safe narration above trims them to fit (about {sum(wc(SAFE[k]) for k in ['a1','a2','a3','i1','i2','i3'])} words for the two sections instead of {sum(wc(ORIG[k]) for k in ['a1','a2','a3','i1','i2','i3'])}).\n")

L.append("""## Lines in the original script worth a second look (accuracy)

These are suggestions, not changes; the narration is yours.

| Original line | Concern | Suggested wording |
|---|---|---|
| "AI-powered, Bangla-first rice disease **detection**" | The app suggests a *likely* disease from a photo; it does not reliably detect diseases yet (see the honest points above) | "...rice disease **advisory** platform" |
| "identifies potential diseases" | Fine: it says *potential* | keep |
| "evidence-based verification" | True in the sense that a diagnosis needs at least two visible symptoms from the knowledge-base card | keep |
| "reduce unsupported recommendations" | Accurate (reduce, not eliminate) | keep |
| "We aim to measure success through disease identification agreement with agricultural experts..." | Accurate as an aim | add: "Expert validation is still to be done" (the slide already says it) |
| "Unlike a basic AI chatbot..." | The video also shows a follow-up chat; that chat is grounded in the same knowledge base | optional: "...and even the chat answers only from that knowledge base" |
| "millions of farmers" | General statement; the slide gives sourced figures instead | keep |

## Sources shown on the slides
- Leaf photo (slide p1 and the demo photo): Project-AgML `rice_disease_classification_bangladesh` dataset on Hugging Face, **CC BY 4.0** (credit is on the slide).
- Officer-to-household figure: MEAS / University of Illinois, *Report on the Status of ICT for Agricultural Extension in Bangladesh* (2015 post, January 2011 scoping mission data).
- Blast figure: BRRI, as quoted by The Business Standard, 28 January 2024.
- Architecture and safeguards: `docs/` in the repository. The 4.8 s figure: `docs/operations/evaluation.md`.

## Regenerating the video
The scripts are in `video/tools/` (see its README). Re-recording needs the app running locally (`cd app && npm run dev`), Google Chrome and ffmpeg. Because the live AI varies, the recorder retries until it captures a correct diagnosis, and will say if it cannot.
""")
open(sys.argv[2], "w").write("\n".join(L) + "\n")
print("map written;", len(L), "lines")
