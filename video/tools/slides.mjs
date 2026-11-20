import puppeteer from "puppeteer-core";
import fs from "fs";

const OUT = process.argv[2];
const LEAF = process.argv[3]; // dataset photo (CC BY 4.0) used as a background for the hook slide
fs.mkdirSync(OUT, { recursive: true });

const css = `
*{box-sizing:border-box;margin:0}
body{width:1280px;height:720px;font-family:"DejaVu Sans","Noto Sans",sans-serif;color:#0f2e1a;background:linear-gradient(135deg,#f0fdf4,#dcfce7);position:relative;overflow:hidden}
.wrap{position:absolute;inset:0;padding:70px 90px;display:flex;flex-direction:column;justify-content:center}
.tag{font-size:22px;letter-spacing:2px;text-transform:uppercase;color:#15803d;font-weight:700;margin-bottom:22px}
h1{font-size:60px;line-height:1.15;color:#14532d;font-weight:800}
h2{font-size:46px;line-height:1.2;color:#14532d;font-weight:800}
p{font-size:30px;line-height:1.45;margin-top:22px;color:#1f3d2b}
.src{position:absolute;left:90px;right:90px;bottom:34px;font-size:18px;color:#4b6355;line-height:1.35}
.big{font-size:120px;font-weight:800;color:#15803d;line-height:1}
.cards{display:flex;gap:26px;margin-top:34px}
.card{flex:1;background:#fff;border:3px solid #15803d;border-radius:20px;padding:26px 24px;font-size:28px;line-height:1.35;box-shadow:0 8px 24px rgba(21,128,61,.12)}
.card b{display:block;font-size:44px;color:#15803d;margin-bottom:8px}
.flow{display:flex;align-items:center;gap:14px;margin-top:40px;flex-wrap:nowrap}
.box{background:#fff;border:3px solid #15803d;border-radius:16px;padding:18px 16px;font-size:23px;line-height:1.25;text-align:center;min-width:150px;flex:1}
.box small{display:block;font-size:17px;color:#476354;margin-top:6px}
.arrow{font-size:40px;color:#15803d}
.refuse{margin-top:26px;background:#fff7ed;border:3px solid #f59e0b;border-radius:16px;padding:16px 22px;font-size:25px;color:#7c2d12}
ul{margin-top:26px;padding-left:44px} li{font-size:33px;line-height:1.5;margin-bottom:10px}
.dark{background:#0f2e1a;color:#fff}.dark h1,.dark h2{color:#fff}.dark p{color:#d1fae5}.dark .tag{color:#86efac}.dark .src{color:#a7c4b2}
.leaf{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.42)}
.pill{display:inline-block;background:#dcfce7;border:2px solid #15803d;border-radius:999px;padding:6px 18px;font-size:24px;margin:6px 10px 6px 0;color:#14532d;font-weight:700}
.note{margin-top:30px;font-size:23px;background:#fff;border-left:8px solid #f59e0b;padding:14px 18px;color:#3b2f05}
`;
const page = (body, cls = "") => `<!doctype html><meta charset="utf-8"><style>${css}</style><body class="${cls}">${body}</body>`;

const slides = {
  // ---- 0:00-0:30 problem
  p1: page(`<div class="leaf" style="background-image:url('file://${LEAF}')"></div><div class="wrap"><div class="tag">The problem</div><h1>Your rice leaves show spots.<br/>Is it blast? Brown spot?<br/>Something else?</h1><p>Every day you wait, the damage can grow.</p></div><div class="src">Photo: public rice leaf dataset (Project-AgML rice_disease_classification_bangladesh, CC BY 4.0).</div>`, "dark"),
  p2: page(`<div class="wrap"><div class="tag">The problem</div><h2>Experts are not always within reach</h2><div class="cards"><div class="card"><b>1 officer</b>per block of roughly 2,500 to 3,000 farm households (2011 data)</div><div class="card"><b>English</b>or long documents: reliable information is hard to use</div></div></div><div class="src">Source: MEAS / University of Illinois, "Report on the Status of ICT for Agricultural Extension in Bangladesh" (2015 post, data from a January 2011 scoping mission).</div>`),
  p3: page(`<div class="wrap"><div class="tag">The problem</div><div class="big">~1%</div><h2 style="margin-top:14px">of Bangladesh's rice is damaged by blast alone</h2><p>About four crore (40 million) tonnes are grown each year, and in badly hit areas the damage can reach 100%. A food security challenge.</p></div><div class="src">Source: BRRI, as quoted by The Business Standard, 28 January 2024.</div>`),
  p4: page(`<div class="wrap" style="align-items:center;text-align:center"><div class="tag">What if</div><h1>every farmer could get<br/>agricultural guidance<br/>with just a smartphone?</h1></div>`, "dark"),
  // ---- 0:30-1:00 solution
  s1: page(`<div class="wrap" style="align-items:center;text-align:center"><div class="tag">Introducing</div><h1 style="font-size:86px">Crop Guardian</h1><h2 style="margin-top:12px;font-weight:600;font-size:40px;color:#166534">ক্রপ গার্ডিয়ান</h2><p style="margin-top:30px">An AI-powered, Bangla-first rice disease advisory platform</p></div>`),
  s3: page(`<div class="wrap"><div class="tag">How it works</div><h2>From a leaf photo to Bangla guidance</h2><div class="cards"><div class="card"><b>1</b>Upload a photo of the affected rice leaf</div><div class="card"><b>2</b>AI compares the symptoms with a verified, cited knowledge base</div><div class="card"><b>3</b>Likely disease, what to do, how to prevent it, with the source, in simple Bangla</div></div><div class="note">Not a free-form chatbot: every answer is tied to curated agricultural knowledge.</div></div>`),
  // ---- 2:00-2:30 AI approach
  a1: page(`<div class="wrap"><div class="tag">Our AI approach</div><h2>A practical, grounded architecture</h2><div class="flow"><div class="box">Leaf photo<small>phone, resized</small></div><div class="arrow">&rarr;</div><div class="box">Gemini vision<small>symptoms vs. verified cards</small></div><div class="arrow">&rarr;</div><div class="box">Gemini Embedding<small>symptoms to vectors</small></div><div class="arrow">&rarr;</div><div class="box">Supabase + pgvector<small>top 3 knowledge cards</small></div><div class="arrow">&rarr;</div><div class="box">Gemini answer<small>simple Bangla, one card only</small></div></div><div class="refuse">Unclear photo, healthy-looking leaf, or too little visible evidence: no diagnosis, ask the agriculture officer.</div></div>`),
  a2: page(`<div class="wrap"><div class="tag">Knowledge base</div><h2>Five rice diseases, cited sources</h2><div style="margin-top:28px"><span class="pill">Blast</span><span class="pill">Brown spot</span><span class="pill">Bacterial leaf blight</span><span class="pill">Sheath blight</span><span class="pill">Tungro</span></div><p>Built from IRRI "Rice Diseases" (2018) and the Pacific Pests, Pathogens and Weeds database (2021).</p><div class="note">Cards are being verified by a person against their sources before real use.</div></div>`),
  a3: page(`<div class="wrap"><div class="tag">Responsible AI</div><h2>Built to avoid unsupported advice</h2><ul><li>Only verified, cited cards can reach a farmer</li><li>A diagnosis needs at least two visible symptoms from the card</li><li>No doses or products beyond what the source states</li><li>Photos are not stored by us</li></ul></div>`),
  // ---- 2:30-3:00 impact
  i1: page(`<div class="wrap"><div class="tag">Impact</div><h2>How we will measure success</h2><ul><li>Agreement with agricultural experts</li><li>Response time</li><li>Farmer usability</li><li>Access to reliable guidance</li></ul><div class="note">Early test on 42 public photos: median 4.8 s per photo (slower when the free AI tier is busy). Expert validation of accuracy is still to be done.</div></div>`),
  i2: page(`<div class="wrap"><div class="tag">What's next</div><h2>Next steps</h2><ul><li>Expand the disease knowledge base</li><li>Larger expert-validated field evaluations</li><li>Improve Bangla localization</li><li>A mobile-first experience</li></ul></div>`),
  i3: page(`<div class="wrap" style="align-items:center;text-align:center"><h1 style="font-size:70px">Crop Guardian</h1><p style="font-size:38px;margin-top:26px;color:#d1fae5">From a simple leaf image to smarter agricultural decisions.</p><p style="font-size:26px;margin-top:46px;color:#86efac">crop-guardian-ten.vercel.app &nbsp;&middot;&nbsp; github.com/mahmudscode/Crop_Guardian</p></div>`, "dark"),
};

const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome-stable", headless: "new", args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files"] });
const pg = await browser.newPage();
await pg.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
for (const [name, html] of Object.entries(slides)) {
  fs.writeFileSync(`${OUT}/${name}.html`, html);
  await pg.goto(`file://${OUT}/${name}.html`, { waitUntil: "load" });
  await pg.screenshot({ path: `${OUT}/${name}.png` });
}
await browser.close();
console.log("slides:", Object.keys(slides).join(" "));
