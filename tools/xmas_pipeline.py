"""Download -> detect people + sharpness -> cut good clips -> delete source, one video at a time.
usage: xmas_pipeline.py NAME=DRIVE_ID ...   (outputs to output/xmas/, log to work/xmas/)"""
import sys, os, json, subprocess, numpy as np, torch, torchvision, cv2, time
torch.set_num_threads(4)
os.makedirs("output/xmas", exist_ok=True); os.makedirs("work/xmas", exist_ok=True); os.makedirs("source/xmas", exist_ok=True)
m = torchvision.models.detection.fasterrcnn_mobilenet_v3_large_fpn(weights="DEFAULT").eval()
W, H = 360, 640
GAP, MIN, MAXLEN, PAD = 1.5, 2.0, 15.0, 0.2

def probe(p):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation:format=duration",
                        "-of", "json", p], capture_output=True, text=True).stdout
    return json.loads(o)

def ok(b):
    x0, y0, x1, y1 = b; M = 12
    edges = (x0 <= M) + (y0 <= M) + (x1 >= W - M) + (y1 >= H - M)
    return edges < 3 and (y1 - y0) / H >= 0.06 and (x1 - x0) * (y1 - y0) / (W * H) <= 0.8

for arg in sys.argv[1:]:
    name, fid = arg.split("=")
    src = f"source/xmas/{name}.MOV"; t0 = time.time()
    if not os.path.exists(src):
        subprocess.run(["curl", "-sSL", "-o", src, f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t"], check=True)
    info = probe(src); dur = float(info["format"]["duration"])
    # keyframes only (fast for 4K HEVC), resampled to a 1 fps grid
    raw = subprocess.run(["ffmpeg", "-v", "error", "-skip_frame", "nokey", "-i", src, "-vf", f"fps=1,scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    samples = []
    with torch.inference_mode():
        for i, x in enumerate(fr):
            r = m([torch.from_numpy(x.copy()).permute(2, 0, 1).float() / 255])[0]
            k = (r["labels"] == 1) & (r["scores"] > 0.6)
            boxes = [b for b in r["boxes"][k].tolist() if ok(b)]
            sharp = cv2.Laplacian(cv2.cvtColor(x, cv2.COLOR_RGB2GRAY), cv2.CV_64F).var()
            samples.append({"t": i, "n": len(boxes), "sharp": round(float(sharp), 1), "luma": round(float(x.mean()), 1)})
    sh = np.array([s["sharp"] for s in samples]); thr = max(np.median(sh) * 0.35, 15)
    flags = [s["n"] > 0 and s["sharp"] >= thr and s["luma"] > 25 for s in samples]
    segs = []; start = None
    for i, f in enumerate(flags + [False]):
        if f and start is None: start = i
        if not f and start is not None: segs.append([start, i - 1]); start = None
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] - 1 <= GAP: merged[-1][1] = s[1]
        else: merged.append(s)
    clips = []
    for a, b in merged:
        t_a = max(0, a - PAD); t_b = min(dur, b + 1 + PAD)
        if t_b - t_a < MIN: continue
        n = int(np.ceil((t_b - t_a) / MAXLEN)); L = (t_b - t_a) / n
        for j in range(n): clips.append((round(t_a + j * L, 2), round(t_a + (j + 1) * L, 2)))
    json.dump({"samples": samples, "clips": clips, "dur": dur}, open(f"work/xmas/{name}.json", "w"))
    for k, (a, b) in enumerate(clips, 1):
        fn = f"output/xmas/{name}_{k:02d}_{int(a//60)}m{int(a%60):02d}s-{int(b//60)}m{int(b%60):02d}s.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-to", str(b), "-i", src, "-map", "0:v:0", "-map", "0:a:0?",
                        "-vf", "scale='if(gt(ih,iw),1080,1920)':'if(gt(ih,iw),1920,1080)':flags=lanczos,fps=30,format=yuv420p",
                        "-c:v", "libx264", "-crf", "19", "-preset", "fast", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", fn], check=True)
    kept = sum(b - a for a, b in clips)
    print(f"{name}: {dur:.0f}s, kept {kept:.0f}s in {len(clips)} clips, {time.time()-t0:.0f}s", flush=True)
    os.remove(src)
