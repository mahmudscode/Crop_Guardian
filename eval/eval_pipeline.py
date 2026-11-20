"""Send eval/<class>/*.jpg to the deployed diagnose function; write results_{TAG}.json. Usage: eval_pipeline.py <eval_dir> <env_file> [tag]"""
import base64, glob, json, os, sys, time, urllib.request

eval_dir, env_file = sys.argv[1], sys.argv[2]
TAG = sys.argv[3] if len(sys.argv) > 3 else "pipeline"   # output file: results_<TAG>.json
env = dict(l.strip().split("=", 1) for l in open(env_file) if "=" in l and not l.startswith("#"))
URL = "https://ysxsytcnqmblsbygtaaq.supabase.co/functions/v1/diagnose"
res = []
for p in sorted(glob.glob(f"{eval_dir}/*/*.jpg")):
    body = json.dumps({"image_base64": base64.b64encode(open(p, "rb").read()).decode(), "media_type": "image/jpeg"}).encode()
    out = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(URL, body, {"Content-Type": "application/json", "x-admin-key": env["ADMIN_KEY"]})
            t = time.time()
            out = json.loads(urllib.request.urlopen(req, timeout=120).read()); out["wall"] = round(time.time() - t, 1)
            break
        except urllib.error.HTTPError as e:
            out = json.loads(e.read() or b"{}"); out["wall"] = round(time.time() - t, 1)
            if e.code in (503, 429, 500): time.sleep(10); continue
            break
        except Exception as e:
            out = {"status": "client_error", "detail": str(e)[:80]}; time.sleep(10)
    o = out.get("observation") or {}
    rec = {"file": os.path.relpath(p, eval_dir), "true": p.split("/")[-2], "status": out.get("status"),
           "disease": out.get("disease_en"), "conf": out.get("confidence"), "secs": out.get("wall"),
           "cands": o.get("candidates"), "detail": out.get("detail"), "model": out.get("model")}
    res.append(rec); print(rec["file"].ljust(18), str(rec["status"]).ljust(15), str(rec["disease"]).ljust(22), rec["conf"], rec["secs"], flush=True)
    json.dump(res, open(f"{eval_dir}/results_{TAG}.json", "w"), indent=1)
    time.sleep(2)
