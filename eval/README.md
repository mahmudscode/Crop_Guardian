# Evaluation scripts

Re-runnable comparison of the deployed Gemini pipeline and a pretrained classifier on a small photo set.

1. `fetch_eval.py <out_dir>` samples ~6 photos per class from `Project-AgML/rice_disease_classification_bangladesh` (CC BY 4.0) through the Hugging Face datasets-server API. Photos are NOT committed.
2. `eval_pipeline.py <eval_dir> <env_file>` sends each photo to the deployed `diagnose` function (uses `ADMIN_KEY` from the env file to skip the per-IP rate limit).
3. `eval_classifier.py <model_dir> <eval_dir>` runs `Huyt/rice-leaf-disease-efficientnet-b0` (Apache-2.0; needs torch, timm, safetensors, pillow).
4. `score.py <eval_dir>` scores both on one rubric and a "both must agree" combination.

Run Python with `-I` and keep downloaded data in its own folder. Saved results from 2026-11-20 are the `results_*.json` files here. See `docs/operations/evaluation.md` for what they do and do not show.
