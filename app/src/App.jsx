import { useEffect, useRef, useState } from "react";
import { chat, diagnose, prepareImage, ImageReadError } from "./api.js";

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

const SUGGESTIONS = ["এই রোগের লক্ষণ কী?", "রোগটি কেন হয়?", "এখন আমি কী করব?", "কীভাবে প্রতিরোধ করব?"];

function Chat({ diseaseEn, diseaseBn }) {
  const [messages, setMessages] = useState([]); // {role, content, sources?, warn?}
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  const lastRef = useRef(null);

  // keep the START of the newest message in view (a long answer must be read from its first line)
  useEffect(() => {
    if (messages.length && logRef.current && lastRef.current) {
      logRef.current.scrollTo({ top: Math.max(0, lastRef.current.offsetTop - 8), behavior: "smooth" });
    }
  }, [messages]);

  const send = async (text) => {
    const q = text.trim();
    if (!q || busy) return;
    const history = messages.filter((m) => !m.warn).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    try {
      const r = await chat([...history, { role: "user", content: q }].slice(-8), diseaseEn);
      if (r.answer_bn) {
        setMessages((m) => [...m, { role: "assistant", content: r.answer_bn, sources: r.sources || [] }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: r.message_bn || "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।", warn: true }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "ইন্টারনেট সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", warn: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-4 rounded-xl bg-white p-4 shadow" aria-label="প্রশ্নোত্তর">
      <h2 className="text-lg font-bold text-green-800">
        {diseaseBn ? `${diseaseBn} সম্পর্কে প্রশ্ন করুন` : "ধানের রোগ সম্পর্কে প্রশ্ন করুন"}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((q) => (
          <button key={q} disabled={busy} onClick={() => send(q)}
            className="rounded-full border border-green-700 px-3 py-2 text-base text-green-800 disabled:opacity-50">
            {q}
          </button>
        ))}
      </div>

      {messages.length > 0 && (
        <div ref={logRef} className="relative mt-3 max-h-[28rem] space-y-3 overflow-y-auto" role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} ref={i === messages.length - 1 ? lastRef : null} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-lg leading-relaxed ${
                m.role === "user" ? "bg-green-700 text-white" : m.warn ? "border border-amber-500 bg-amber-50" : "bg-green-50 text-gray-900"}`}>
                {m.content}
                {m.sources?.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">
                    উৎস: {m.sources.map((s, j) => (
                      <span key={j}>{j > 0 && ", "}{s.url ? <a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.name}</a> : s.name}</span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          ))}
          {busy && <p className="text-gray-600">উত্তর খোঁজা হচ্ছে…</p>}
        </div>
      )}

      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={400} disabled={busy}
          placeholder="আপনার প্রশ্ন লিখুন…" aria-label="আপনার প্রশ্ন"
          className="min-w-0 flex-1 rounded-xl border-2 border-gray-300 px-3 py-3 text-lg focus:border-green-700 focus:outline-none" />
        <button type="submit" disabled={busy || !input.trim()} className="rounded-xl bg-green-700 px-5 py-3 text-lg font-semibold text-white disabled:opacity-50">
          পাঠান
        </button>
      </form>
      <p className="mt-3 text-xs text-gray-600">
        উত্তর শুধু যাচাই করা রোগ-তথ্য থেকে দেওয়া হয়। নিশ্চিত না হলে কৃষি কর্মকর্তার সাথে কথা বলুন। প্রশ্ন সংরক্ষণ করা হয় না।
      </p>
    </section>
  );
}

function Result({ r, onRetry }) {
  if (r.status === "ok") {
    const sec = r.sections;
    const symptoms = r.observation?.symptoms_bn;
    return (
      <>
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
      <Chat key={`${r.disease_en}-${r.seconds}`} diseaseEn={r.disease_en} diseaseBn={r.disease_bn} />
      </>
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
  const [showChat, setShowChat] = useState(false);

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

      {result?.status !== "ok" && (
        <div className="mt-4">
          <button onClick={() => setShowChat((v) => !v)}
            className="w-full rounded-xl border-2 border-green-700 bg-white py-3 text-lg font-semibold text-green-800">
            {showChat ? "প্রশ্নোত্তর বন্ধ করুন" : "রোগ সম্পর্কে প্রশ্ন করুন"}
          </button>
          {showChat && <Chat />}
        </div>
      )}

      <footer className="mt-8 text-center text-xs text-gray-600">
        ছবি সংরক্ষণ করা হয় না। এটি কেবল সহায়ক পরামর্শ; গুরুতর হলে কৃষি কর্মকর্তার পরামর্শ নিন।
      </footer>
    </div>
  );
}
