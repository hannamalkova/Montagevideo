"""Turn people_segments.py detections into clip ranges and export them.
usage: cut_people.py NAME [--export]   (reads work/cuts/NAME.json, source/NAME.MOV)"""
import json, sys, subprocess, os
name = sys.argv[1]; export = "--export" in sys.argv
W, H = 360, 640
GAP = 0.75      # fill gaps up to this (person briefly leaves / detector blink)
MIN = 1.5       # drop clips shorter than this
PAD = 0.15
d = json.load(open(f"work/cuts/{name}.json"))
step = d[1]["t"] - d[0]["t"]
def ok(b):
    x0, y0, x1, y1, s = b
    M = 12; edges = (x0 <= M) + (y0 <= M) + (x1 >= W - M) + (y1 >= H - M)
    h = (y1 - y0) / H
    area = (x1 - x0) * (y1 - y0) / (W * H)
    # not a lens-covering close-up (coat in the lens), not a speck in the distance
    return edges < 3 and h >= 0.05 and area <= 0.8
flags = [any(ok(b) for b in x["boxes"]) for x in d]
segs = []; start = None
for i, f in enumerate(flags + [False]):
    if f and start is None: start = i
    if not f and start is not None: segs.append([start, i - 1]); start = None
merged = []
for s in segs:
    if merged and (s[0] - merged[-1][1] - 1) * step <= GAP: merged[-1][1] = s[1]
    else: merged.append(s)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"source/{name}.MOV"], capture_output=True, text=True).stdout)
clips = []
for a, b in merged:
    t0 = max(0, d[a]["t"] - PAD); t1 = min(dur, d[b]["t"] + step + PAD)
    if t1 - t0 >= MIN: clips.append((round(t0, 2), round(t1, 2), max(d[i]["n"] for i in range(a, b + 1))))
os.makedirs("output/clips", exist_ok=True)
for k, (t0, t1, n) in enumerate(clips, 1):
    fn = f"output/clips/{name}_{k:02d}_{int(t0//60)}m{int(t0%60):02d}s-{int(t1//60)}m{int(t1%60):02d}s.mp4"
    print(f"{name} #{k:02d} {t0:7.2f}-{t1:7.2f}s ({t1-t0:5.1f}s) max people {n} -> {fn}")
    if export:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t0), "-to", str(t1), "-i", f"source/{name}.MOV",
            "-map", "0:v:0", "-map", "0:a:0", "-vf", "scale=1080:1920:flags=lanczos,format=yuv420p",
            "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", fn], check=True)
print(f"{name}: {len(clips)} clips, {sum(c[1]-c[0] for c in clips):.1f}s of {dur:.1f}s kept")
