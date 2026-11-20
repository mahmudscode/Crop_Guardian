# Demo video tools

These scripts produced `video/crop_guardian_demo_silent.mp4` and `video/VIDEO_MAP.md`.

Needs: the web app running locally (`cd app && npm run dev`, port 5173), Google Chrome (`/usr/bin/google-chrome-stable`), ffmpeg with the `drawtext` filter, the DejaVu Sans Bold font, Node with `npm i puppeteer-core`, and Python 3. Paths are for Linux; change them at the top of each script for another system.

1. `node slides.mjs <work>/slides <leaf.jpg>` renders the 12 slides (the leaf photo is a public dataset photo, CC BY 4.0).
2. `node record.mjs <work>/clips <abs path to stage.html> <disease.jpg> <blurred.jpg> [home main unclear]` records the real app inside a phone frame. It retries until the live AI gives a correct diagnosis for the main run and a real "send another photo" reply for the blurred run, so it can take several minutes. The stage page animates a tiny element on purpose: without it the recorder skips frames while the screen is static and the video clock drifts from real time.
3. `python3 assemble.py <work> <out.mp4>` cuts the clips and slides into the 180 s timeline (edit the piece list to retime) and writes `timeline.json`.
4. `python3 make_map.py <work>/timeline.json video/VIDEO_MAP.md` regenerates the text map from the timeline.

Keep the on-screen honesty notes ("Results vary, and accuracy is not yet validated", the SPED UP labels). The diagnosis scene is a best case from a model that is often unsure.
