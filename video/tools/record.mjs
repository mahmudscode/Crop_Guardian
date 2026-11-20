// Records the real app (running locally, talking to the live backend) inside the phone stage. Usage:
//   node record.mjs <outDir> <stage.html> <diseasePhoto> <blurredPhoto> [main|unclear|home ...]
import puppeteer from "puppeteer-core";
import fs from "fs";

const [OUT, STAGE, PHOTO, BLURRED, ...which] = process.argv.slice(2);
const todo = which.length ? which : ["main", "unclear", "home"];
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome-stable", headless: "new", args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files"] });

const OTHER = ["আমি নিশ্চিত নই", "সার্ভার এখন ব্যস্ত", "ছবিটি পরিষ্কার নয়", "রোগের স্পষ্ট লক্ষণ", "কিছু একটা সমস্যা", "ইন্টারনেট সংযোগে", "অনেক বেশি অনুরোধ"];
const text = (frame) => frame.evaluate(() => document.body.innerText);
const clickBtn = (frame, t) => frame.evaluate((t) => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().includes(t)); if (b) { b.click(); return true; } return false; }, t);
async function upload(frame, file) {
  const inputs = await frame.$$('input[type="file"]');
  for (const i of inputs) if (!(await i.evaluate((e) => e.hasAttribute("capture")))) { await i.uploadFile(file); return; }
  throw new Error("no gallery input");
}
async function waitResult(frame, ms = 110000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const t = await text(frame);
    if (t.includes("লক্ষণ মিল")) return { kind: "ok", text: t };
    if (OTHER.some((o) => t.includes(o))) return { kind: "other", text: t };
    await sleep(700);
  }
  return { kind: "timeout", text: "" };
}

async function record(name, fn) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(`file://${STAGE}`, { waitUntil: "load" });
  const frame = page.frames().find((f) => f.url().startsWith("http://localhost:5173"));
  await frame.waitForSelector("h1", { timeout: 20000 });
  await sleep(1500);
  const cap = (title, txt, note, sped) => page.evaluate((a, b, c, d) => window.setCaption(a, b, c, d), title, txt, note, sped);
  const file = `${OUT}/${name}.mp4`;
  const rec = await page.screencast({ path: file });
  const t0 = Date.now(), marks = {};
  const mark = (k) => (marks[k] = Math.round(((Date.now() - t0) / 1000) * 100) / 100);
  let ok = false, info = "";
  try { info = (await fn(page, frame, cap, mark)) || ""; ok = true; } catch (e) { info = String(e.message || e); }
  await rec.stop();
  mark("total");
  await page.close();
  return { ok, info, file, marks };
}

const save = (name, r) => fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify(r, null, 1));

if (todo.includes("home")) {
  const r = await record("home", async (page, frame, cap, mark) => {
    await cap("A simple interface in Bangla", "Large buttons and plain wording, designed for farmers with limited technical experience.");
    await sleep(5500); mark("a");
    await cap("Photo in, guidance out", "Take a photo or pick one from the gallery, then ask for a diagnosis.", "Photos are not stored by this project.");
    await sleep(6500); mark("b");
  });
  save("home", r); console.log("home:", r.ok, r.marks);
}

if (todo.includes("main")) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await record("main", async (page, frame, cap, mark) => {
      await cap("Open the web app", "Large, simple buttons in Bangla: designed for farmers with limited technical experience.");
      await sleep(4000); mark("home_end");
      await upload(frame, PHOTO);
      await cap("Upload a photo of the affected leaf", "From the camera or the gallery. The photo is resized on the phone and is not stored by us.");
      await sleep(4200); mark("upload_end");
      await cap("AI analyses the visible symptoms", "Gemini compares what it sees with the symptom descriptions in the verified knowledge base, then retrieves the matching cards.", "Waiting time is shortened in this video.", true);
      await clickBtn(frame, "রোগ নির্ণয় করুন"); mark("click");
      const res = await waitResult(frame);
      if (res.kind !== "ok") throw new Error("diagnosis was not a card-backed answer: " + res.kind);
      if (!res.text.includes("ব্লাস্ট")) throw new Error("diagnosed a different disease than the labelled one");
      mark("result");
      await cap("Likely disease, with sources", "Guidance in Bangla: what to do now, how to prevent it, the symptoms that were seen, and the source.", "Example run on a public-dataset photo. Results vary, and accuracy is not yet validated.", false);
      const y0 = await frame.evaluate(() => { const el = document.querySelector("span.rounded-full"); const y = el ? Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 14)) : 0; window.scrollTo({ top: y, behavior: "smooth" }); return y; });
      await sleep(3000); mark("result_hold_end");
      const total = await frame.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
      const steps = 24;
      for (let i = 1; i <= steps; i++) { await frame.evaluate((y) => window.scrollTo(0, y), Math.round(y0 + ((total - y0) * i) / steps)); await sleep(500); }
      mark("scroll_end");
      await cap("Ask follow-up questions", "Answers come only from the verified knowledge base, not from the model's memory.", "Example run; wording and speed vary.");
      await sleep(1200);
      if (!(await clickBtn(frame, "এখন আমি কী করব?"))) throw new Error("chat button not found");
      const t1 = Date.now();
      while (Date.now() - t1 < 70000) {
        const n = await frame.evaluate(() => document.querySelectorAll('[role="log"] > div[class*="flex"]').length);
        const busy = (await text(frame)).includes("উত্তর খোঁজা হচ্ছে");
        if (n >= 2 && !busy) break;
        await sleep(600);
      }
      const n2 = await frame.evaluate(() => document.querySelectorAll('[role="log"] > div[class*="flex"]').length);
      if (n2 < 2) throw new Error("chat gave no answer");
      await sleep(600);
      await frame.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await sleep(4200); mark("chat_end");
      return "ok";
    });
    save("main", r); console.log(`main attempt ${attempt}:`, r.ok, r.info, r.marks);
    if (r.ok) break;
    fs.renameSync(r.file, `${OUT}/main_failed_${attempt}.mp4`);
    await sleep(25000); // be gentle with the rate limit and the free AI tier
  }
}

if (todo.includes("unclear")) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const r = await record("unclear", async (page, frame, cap, mark) => {
      await cap("What if the photo is unclear?", "A deliberately blurred photo of a leaf.");
      await upload(frame, BLURRED);
      await sleep(3500); mark("upload_end");
      await cap("No unsupported diagnosis", "When the image is unclear or the evidence is too weak, the app declines and points to the agriculture officer.", "Waiting time is shortened in this video.", true);
      await clickBtn(frame, "রোগ নির্ণয় করুন"); mark("click");
      const res = await waitResult(frame);
      if (res.kind !== "other" || !res.text.includes("ছবিটি পরিষ্কার নয়")) throw new Error("did not get the clear 'send another photo' reply: " + res.kind);
      mark("result");
      await cap("No unsupported diagnosis", "When the image is unclear or the evidence is too weak, the app declines and points to the agriculture officer.", "", false);
      await frame.evaluate(() => { const el = document.querySelector(".border-amber-500"); if (el) window.scrollTo({ top: Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 20)), behavior: "smooth" }); });
      await sleep(5500); mark("end");
      return "ok";
    });
    save("unclear", r); console.log(`unclear attempt ${attempt}:`, r.ok, r.info, r.marks);
    if (r.ok) break;
    fs.renameSync(r.file, `${OUT}/unclear_failed_${attempt}.mp4`);
    await sleep(20000);
  }
}
await browser.close();
