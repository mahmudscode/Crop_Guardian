"""Sample photos per class from Project-AgML/rice_disease_classification_bangladesh (CC BY 4.0) via the datasets-server API."""
import json, os, sys, time, urllib.parse, urllib.request

OUT = sys.argv[1]
DS = "Project-AgML/rice_disease_classification_bangladesh"
CLASSES = {0: "healthy", 1: "insect", 2: "leaf_scald", 4: "blast", 5: "leaffolder", 6: "stripes", 7: "tungro"}
OFFSETS = [0, 40, 90]          # spread across the class, 2 images each
UA = {"User-Agent": "CropGuardianEval/0.1"}

def get(url, tries=8):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except Exception as e:
            time.sleep(6)
    raise RuntimeError(f"failed: {url[:90]}")

manifest = []
for label, name in CLASSES.items():
    os.makedirs(f"{OUT}/{name}", exist_ok=True)
    n = 0
    for off in OFFSETS:
        q = urllib.parse.urlencode({"dataset": DS, "config": "raw", "split": "train", "where": f'"label"={label}', "offset": off, "length": 2})
        for attempt in range(10):
            j = json.loads(get(f"https://datasets-server.huggingface.co/filter?{q}"))
            if j.get("rows"):
                break
            time.sleep(8)  # index still loading
        for r in j.get("rows", []):
            n += 1
            path = f"{OUT}/{name}/{n:02d}.jpg"
            open(path, "wb").write(get(r["row"]["image"]["src"]))
            manifest.append({"file": f"{name}/{n:02d}.jpg", "true_class": name, "row": r["row_idx"]})
    print(name, n, flush=True)
json.dump(manifest, open(f"{OUT}/manifest.json", "w"), indent=1)
