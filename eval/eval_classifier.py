"""Run the classifier over eval/<class>/*.jpg; write results_classifier.json. Usage: eval_classifier.py <model_dir> <eval_dir>"""
import json, sys, glob, os
import torch, timm
from PIL import Image
from safetensors.torch import load_file

model_dir, eval_dir = sys.argv[1], sys.argv[2]
cfg = json.load(open(f"{model_dir}/config.json")); labels = cfg["label_names"]
model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=len(labels))
model.load_state_dict(load_file(f"{model_dir}/model.safetensors")); model.eval()
pc = cfg["pretrained_cfg"]
tf = timm.data.create_transform(input_size=tuple(pc["input_size"]), interpolation=pc["interpolation"], mean=tuple(pc["mean"]), std=tuple(pc["std"]), crop_pct=pc["crop_pct"], crop_mode=pc.get("crop_mode", "center"))
res = []
for p in sorted(glob.glob(f"{eval_dir}/*/*.jpg")):
    with torch.no_grad():
        pr = model(tf(Image.open(p).convert("RGB")).unsqueeze(0)).softmax(-1)[0]
    top = pr.topk(3)
    res.append({"file": os.path.relpath(p, eval_dir), "true": p.split("/")[-2],
                "pred": labels[int(top.indices[0])], "conf": round(float(top.values[0]), 3),
                "top3": [(labels[int(i)], round(float(v), 3)) for v, i in zip(top.values, top.indices)]})
json.dump(res, open(f"{eval_dir}/results_classifier.json", "w"), indent=1)
for r in res: print(r["file"].ljust(18), r["pred"].ljust(18), r["conf"])
