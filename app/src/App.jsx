import { useRef, useState } from "react";
import { diagnose, prepareImage, ImageReadError } from "./api.js";

const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

function ConfidenceBadge({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "bg-green-600" : "bg-amber-500";
  return (
    <span className={`${color} text-white rounded-full px-3 py-1 text-sm font-semibold`}>
      লক্ষণ মিল: {toBn(pct)}%
    </span>
  );
}

function OfficerCard() {
  return (
    <div className="mt-4 rounded-xl border border-green-700 bg-white p-4">
      <p className="font-semibold text-green-800">স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন</p>
      <p className="text-sm text-gray-600">কৃষি সম্প্রসারণ অধিদপ্তর (DAE) — আপনার উপজেলা কৃষি অফিস</p>
    </div>
  );
}

function Steps({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="mt-4">
      <p className="text-lg font-bold text-green-800">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-6 text-lg leading-relaxed">
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}

function Result({ r, onRetry }) {
  if (r.status === "ok") {
    const sec = r.sections;
    const symptoms = r.observation?.symptoms_bn;
    return (
      <div className="mt-4 rounded-xl bg-white p-4 shadow">
        <ConfidenceBadge value={r.confidence} />
        {sec ? (
          <>
            <p className="mt-3 text-xl font-bold leading-relaxed">{sec.diagnosis_bn}</p>
            <Steps title="এখন যা করবেন" items={sec.what_to_do_bn} />
            <Steps title="প্রতিরোধের উপায়" items={sec.prevention_bn} />
          </>
        ) : (
          <div className="mt-3 whitespace-pre-wrap text-lg leading-relaxed">{r.answer_bn}</div>
        )}
        {symptoms?.length > 0 && <Steps title="যে লক্ষণ দেখা গেছে" items={symptoms} />}
        <div className="mt-4">
          <p className="font-semibold">উৎস:</p>
          <ul className="list-disc pl-6 text-gray-700">
            {r.sources.map((s, i) => (
              <li key={i}>{s.url ? <a className="underline text-green-700" href={s.url} target="_blank" rel="noreferrer">{s.name}</a> : s.name}</li>
            ))}
          </ul>
        </div>
        <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-gray-700">
          সমস্যা গুরুতর হলে বা নিশ্চিত না হলে স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।
        </p>
        <p className="mt-3 text-xs text-gray-500">সময়: {toBn(r.seconds.toFixed(1))} সেকেন্ড</p>
      </div>
    );
  }
  return (
    <div className="mt-4">
      <div className="rounded-xl border border-amber-500 bg-amber-50 p-4 text-lg">{r.message_bn}</div>
      <button onClick={onRetry} className="mt-3 w-full rounded-xl bg-green-700 py-4 text-lg font-semibold text-white">
        আরেকটি ছবি তুলুন
      </button>
      <OfficerCard />
    </div>
  );
}

export default function App() {
  const camera = useRef(null);
  const gallery = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pick = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
  };
  const reset = () => { setFile(null); setPreview(null); setResult(null); };

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const img = await prepareImage(file);
      try {
        setResult(await diagnose(img));
      } catch {
        setResult({ status: "error", message_bn: "ইন্টারনেট সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" });
      }
    } catch (e) {
      setResult({
        status: "error",
        message_bn: e instanceof ImageReadError
          ? "ছবিটি পড়া যায়নি। অনুগ্রহ করে অন্য একটি ছবি বেছে নিন।"
          : "কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-8">
      <header className="py-5 text-center">
        <h1 className="text-3xl font-bold text-green-800">ক্রপ গার্ডিয়ান</h1>
        <p className="mt-1 text-gray-700">ধানের পাতার ছবি তুলুন, রোগের সমাধান জানুন</p>
      </header>

      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.target.files[0])} />
      <input ref={gallery} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />

      {preview && <img src={preview} alt="নির্বাচিত ছবি" className="w-full rounded-xl object-cover shadow" />}

      <div className="mt-4 grid gap-3">
        <button onClick={() => camera.current.click()} className="rounded-xl bg-green-700 py-4 text-xl font-semibold text-white">
          ছবি তুলুন
        </button>
        <button onClick={() => gallery.current.click()} className="rounded-xl border-2 border-green-700 py-3 text-lg font-semibold text-green-800">
          গ্যালারি থেকে নিন
        </button>
        {file && (
          <button disabled={loading} onClick={run} className="rounded-xl bg-amber-500 py-4 text-xl font-bold text-white disabled:opacity-60">
            {loading ? "বিশ্লেষণ করা হচ্ছে… অনুগ্রহ করে অপেক্ষা করুন" : "রোগ নির্ণয় করুন"}
          </button>
        )}
      </div>

      {result && <Result r={result} onRetry={reset} />}

      <footer className="mt-8 text-center text-xs text-gray-600">
        ছবি সংরক্ষণ করা হয় না। এটি কেবল সহায়ক পরামর্শ; গুরুতর হলে কৃষি কর্মকর্তার পরামর্শ নিন।
      </footer>
    </div>
  );
}
