import json, statistics, sys
d = sys.argv[1]
pipe = {r["file"]: r for r in json.load(open(f"{d}/results_pipeline.json"))}
clf = {r["file"]: r for r in json.load(open(f"{d}/results_classifier.json"))}
SUPPORTED = {"blast": "blast", "leaf blast": "blast", "brown spot": "brown spot", "bacterial leaf blight": "bacterial leaf blight",
             "bacterial blight": "bacterial leaf blight", "sheath blight": "sheath blight", "tungro": "tungro"}
CARD_CLASSES = {"blast", "tungro"}            # dataset classes that match a disease we hold a card for
NOCARD = {"insect", "leaf_scald", "leaffolder", "stripes"}   # no card: the right answer is "not sure"
def gem(f):
    r = pipe[f]; return SUPPORTED.get((r["disease"] or "").lower()) if r["status"] == "ok" else None
def cls(f, thr):
    r = clf[f]; return SUPPORTED.get(r["pred"].lower()) if r["conf"] >= thr else None
def combo(f, thr):
    g, c = gem(f), cls(f, thr); return g if g and g == c else None
def score(fn):
    out = {}
    for group, cond in (("disease_correct", lambda t: t in CARD_CLASSES), ("healthy_ok", lambda t: t == "healthy"), ("nocard_refused", lambda t: t in NOCARD)):
        fs = [f for f in pipe if cond(pipe[f]["true"])]
        if group == "disease_correct": ok = sum(fn(f) == pipe[f]["true"] for f in fs)
        else: ok = sum(fn(f) is None for f in fs)
        out[group] = f"{ok}/{len(fs)}"
    shown = [f for f in pipe if fn(f)]
    wrong_shown = [f for f in shown if not (pipe[f]["true"] in CARD_CLASSES and fn(f) == pipe[f]["true"])]
    out["answers_shown"] = len(shown); out["wrong_answers_shown"] = len(wrong_shown)
    return out
rows = [("Gemini pipeline (deployed)", gem), ("Classifier alone, any confidence", lambda f: cls(f, 0.0)),
        ("Classifier, conf >= 0.5", lambda f: cls(f, 0.5)), ("Classifier, conf >= 0.7", lambda f: cls(f, 0.7)),
        ("Combined: both agree (clf >= 0.0)", lambda f: combo(f, 0.0)), ("Combined: both agree (clf >= 0.3)", lambda f: combo(f, 0.3))]
print(f"{'method':38} {'blast+tungro right':>18} {'healthy not flagged':>20} {'no-card refused':>16} {'shown':>6} {'wrong shown':>12}")
for name, fn in rows:
    s = score(fn); print(f"{name:38} {s['disease_correct']:>18} {s['healthy_ok']:>20} {s['nocard_refused']:>16} {s['answers_shown']:>6} {s['wrong_answers_shown']:>12}")
secs = [r["secs"] for r in pipe.values() if r["secs"]]
print("\nGemini pipeline response time: median %.1fs, max %.1fs, n=%d" % (statistics.median(secs), max(secs), len(secs)))
print("statuses:", {s: sum(r['status'] == s for r in pipe.values()) for s in {r['status'] for r in pipe.values()}})
print("\nPer-class Gemini outputs:")
for t in ["blast", "tungro", "healthy", "insect", "leaf_scald", "leaffolder", "stripes"]:
    print(f"  {t:11}", [ (pipe[f]['disease'] or '-') + (f" {pipe[f]['conf']}" if pipe[f]['conf'] else '') for f in pipe if pipe[f]['true'] == t])
