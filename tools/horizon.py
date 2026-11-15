"""Measure the horizon tilt of clips (sea/sky line) and optionally write levelled copies.
Angle = length-weighted median of near-horizontal Hough lines in the middle band of the frame,
averaged over a few frames. Rotation is done with a zoom just big enough to hide the corners.
usage: horizon.py DIR [--apply] clip1 clip2 ...   (writes DIR/<clip>_lv.mp4)"""
import sys, subprocess, numpy as np, cv2, math
d = sys.argv[1]; apply = "--apply" in sys.argv; clips = [c for c in sys.argv[2:] if c != "--apply"]
W, H = 1080, 1920
def frames(path, fps=None):
    vf = (f"fps={fps}," if fps else "") + "format=bgr24"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
def angle(f):
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    g = cv2.GaussianBlur(g, (5, 5), 0)
    e = cv2.Canny(g, 30, 90)
    e[:int(H * 0.30)] = 0; e[int(H * 0.50):] = 0      # sea horizon band in these shots (sand lines lie lower)
    ls = cv2.HoughLinesP(e, 1, np.pi / 720, 80, minLineLength=W * 0.2, maxLineGap=40)
    if ls is None: return None, 0
    a, w = [], []
    for x0, y0, x1, y1 in ls.reshape(-1, 4):
        ang = math.degrees(math.atan2(y1 - y0, x1 - x0))
        if abs(ang) < 8: a.append(ang); w.append(math.hypot(x1 - x0, y1 - y0))
    if not w: return None, 0
    o = np.argsort(a); a = np.array(a)[o]; w = np.array(w)[o]; c = np.cumsum(w)
    return float(a[np.searchsorted(c, c[-1] / 2)]), float(c[-1])
for c in clips:
    fr = frames(f"{d}/{c}.mp4", fps=4)
    res = [angle(f) for f in fr]
    good = [(a, w) for a, w in res if a is not None]
    if not good: print(f"{c:14s} no horizon found"); continue
    ang = float(np.average([a for a, _ in good], weights=[w for _, w in good]))
    print(f"{c:14s} tilt {ang:+.2f} deg  (from {len(good)}/{len(res)} frames)")
    if apply and abs(ang) > 0.3:
        t = math.radians(abs(ang)); z = math.cos(t) + (H / W) * math.sin(t)
        M = cv2.getRotationMatrix2D((W / 2, H / 2), ang, z)
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                                "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-pix_fmt", "yuv420p", f"{d}/{c}_lv.mp4"], stdin=subprocess.PIPE)
        for f in frames(f"{d}/{c}.mp4"):
            enc.stdin.write(cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).tobytes())
        enc.stdin.close(); enc.wait(); print(f"   -> levelled, zoom {z:.3f}")
    elif apply:
        subprocess.run(["cp", f"{d}/{c}.mp4", f"{d}/{c}_lv.mp4"])
