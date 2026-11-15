"""Match the colour of several clips to a common look (Reinhard-style transfer in LAB).
Stats come from frames sampled across each clip; the target is the median of all clips.
Strength < 1 keeps each shot's character (only pulls outliers in).
usage: colormatch.py STRENGTH DIR clip1 clip2 ...   -> writes DIR/<clip>_cm.mp4"""
import sys, subprocess, numpy as np, cv2
k = float(sys.argv[1]); d = sys.argv[2]; clips = sys.argv[3:]
W, H = 1080, 1920
def frames(path, fps=None):
    vf = f"fps={fps}," if fps else ""
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", vf + "format=bgr24", "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(p, np.uint8).reshape(-1, H, W, 3)
def stats(fr):
    lab = np.concatenate([cv2.cvtColor(f[::4, ::4], cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32) for f in fr])
    return lab.mean(0), lab.std(0)
S = {c: stats(frames(f"{d}/{c}.mp4", fps=3)) for c in clips}
tm = np.median([S[c][0] for c in clips], 0); ts = np.median([S[c][1] for c in clips], 0)
print("target LAB mean", tm.round(1), "std", ts.round(1))
for c in clips:
    m, s = S[c]
    # per-channel gain/offset; L gets half strength so brightness stays close to the original
    kk = np.array([k * 0.5, k, k])
    gain = 1 + kk * (ts / np.maximum(s, 1e-3) - 1)
    gain = np.clip(gain, 0.85, 1.2)
    fr = frames(f"{d}/{c}.mp4")
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                            "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-pix_fmt", "yuv420p", f"{d}/{c}_cm.mp4"], stdin=subprocess.PIPE)
    for f in fr:
        lab = cv2.cvtColor(f, cv2.COLOR_BGR2LAB).astype(np.float32)
        lab = (lab - m) * gain + m + kk * (tm - m)
        enc.stdin.write(cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR).tobytes())
    enc.stdin.close(); enc.wait()
    print(f"{c:12s} mean {m.round(1)} -> shift {(kk*(tm-m)).round(1)}  gain {gain.round(2)}")
