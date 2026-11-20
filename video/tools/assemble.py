"""Assemble the 180 s silent video from slides + recorded clips. Usage: assemble.py <video_work_dir> <final_mp4>"""
import json, os, subprocess, sys

W = sys.argv[1]
FINAL = sys.argv[2]
SL, CL, PC = f"{W}/slides", f"{W}/clips", f"{W}/pieces"
os.makedirs(PC, exist_ok=True)
FONT = "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"
COMMON = ["-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30"]
NORM = "fps=30,scale=1280:720:flags=lanczos,setsar=1"

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-1500:]); sys.exit(1)

timeline, parts, t = [], [], 0.0

def add(name, seg, desc, dur):
    global t
    timeline.append({"piece": name, "segment": seg, "start": round(t, 2), "end": round(t + dur, 2), "what": desc})
    parts.append(f"{PC}/{name}.mp4")
    t += dur

def slide(name, seg, desc, dur):
    f = f"fade=t=in:st=0:d=0.3,fade=t=out:st={dur - 0.3}:d=0.3"
    run(["ffmpeg", "-loglevel", "error", "-y", "-loop", "1", "-framerate", "30", "-t", str(dur), "-i", f"{SL}/{name}.png", "-vf", f"{NORM},{f}", *COMMON, f"{PC}/{name}.mp4"])
    add(name, seg, desc, dur)

def clip(name, src, a, b, dur, seg, desc, pad=0.0, badge=False):
    src_len = b - a
    f = (dur - pad) / src_len                                  # <1 = sped up, >1 = slowed
    vf = f"setpts=PTS*{f:.5f},{NORM}"
    if pad: vf += f",tpad=stop_mode=clone:stop_duration={pad}"
    if badge: vf += f",drawtext=fontfile={FONT}:text='SPED UP':x=w-230:y=24:fontsize=22:fontcolor=white:box=1:boxcolor=0xf59e0b:boxborderw=10"
    run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(a), "-i", f"{CL}/{src}.mp4", "-t", str(src_len), "-vf", vf, "-t", str(dur), *COMMON, f"{PC}/{name}.mp4"])
    add(name, seg, desc + (f" (speed x{1/f:.2f})" if abs(f - 1) > 0.05 else ""), dur)

M = json.load(open(f"{CL}/main.json"))["marks"]
U = json.load(open(f"{CL}/unclear.json"))["marks"]

# ---- 0:00-0:30 The problem
S = "1 The problem (0:00-0:30)"
slide("p1", S, "Hook: leaf with spots, 'is it blast, brown spot, something else?'", 9)
slide("p2", S, "Experts are not always within reach (1 officer per block of ~2,500-3,000 households, 2011)", 8)
slide("p3", S, "~1% of Bangladesh's rice damaged by blast alone (BRRI)", 8)
slide("p4", S, "What if every farmer could get guidance with just a smartphone?", 5)
# ---- 0:30-1:00 The solution
S = "2 Our solution (0:30-1:00)"
slide("s1", S, "Title: Crop Guardian, Bangla-first rice disease advisory", 7)
clip("home", "home", 0.4, 11.96, 11, S, "Live app: simple Bangla interface, photo in, guidance out")
slide("s3", S, "How it works: upload, compare with verified knowledge base, Bangla guidance with source", 12)
# ---- 1:00-2:00 Live demo
S = "3 Live demonstration (1:00-2:00)"
clip("d1", "main", 0.0, M["upload_end"], 8.0, S, "Open the web app, upload a leaf photo")
clip("d2", "main", M["click"], M["result"], 8.0, S, "Tap diagnose: AI analyses the symptoms (wait shortened)")
clip("d3", "main", M["result"], M["scroll_end"], 15.0, S, "Result in Bangla: likely disease, what to do, prevention, symptoms seen, source")
clip("d4", "main", M["scroll_end"], M["chat_end"] - 0.05, 13.0, S, "Follow-up chat: one-tap question answered from the knowledge base (wait shortened)", badge=True)
clip("d5a", "unclear", 0.0, U["upload_end"], 3.5, S, "Blurred leaf photo uploaded")
clip("d5b", "unclear", U["upload_end"], U["result"], 5.6, S, "Diagnose: AI analyses (wait shortened)")
clip("d5c", "unclear", U["result"], U["end"] - 0.03, 6.9, S, "Unclear photo: no diagnosis, asks for another photo and points to the officer", pad=1.4)
# ---- 2:00-2:30 AI approach
S = "4 Our AI approach (2:00-2:30)"
slide("a1", S, "Architecture: photo, Gemini vision, Gemini Embedding, Supabase pgvector (top 3 cards), Gemini answer", 14)
slide("a2", S, "Knowledge base: five rice diseases; IRRI and Pacific Pests, Pathogens and Weeds", 8)
slide("a3", S, "Responsible AI safeguards", 8)
# ---- 2:30-3:00 Impact and what's next
S = "5 Impact and what's next (2:30-3:00)"
slide("i1", S, "How we will measure success (+ honest early-test note)", 9)
slide("i2", S, "Next steps", 9)
slide("i3", S, "Closing: From a simple leaf image to smarter agricultural decisions", 12)

with open(f"{PC}/list.txt", "w") as fh:
    for p in parts: fh.write(f"file '{p}'\n")
os.makedirs(os.path.dirname(FINAL), exist_ok=True)
run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{PC}/list.txt", "-c", "copy", "-movflags", "+faststart", FINAL])
json.dump(timeline, open(f"{W}/timeline.json", "w"), indent=1)
print("pieces:", len(parts), "| planned total:", round(t, 2), "s")
