"""Tripod-lock stabilizer: pins every frame to one reference frame using
features on the static background (top part of frame), similarity transform.
usage: lockshot.py SRC OUT START_S REF_S [speed]   (60fps source, 1080x1920 out)"""
import cv2, numpy as np, subprocess, sys, json
src, out, start, ref_t = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
speed = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
W, H = 1350, 2400            # work size; final crop 1080x1920 (zoom 1.25)
OW, OH = 1080, 1920
MASK_Y = 0.48                # background region: top 48% of frame
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(start), "-i", src, "-map", "0:v:0",
    "-vf", f"scale={W}:{H}:flags=lanczos", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
    "-s", f"{OW}x{OH}", "-r", "60", "-i", "-", "-vf", f"setpts=PTS/{speed},fps=30,format=yuv420p",
    "-c:v", "libx264", "-crf", "16", "-preset", "medium", out], stdin=subprocess.PIPE)
fsz = W * H * 3
mask = np.zeros((H, W), np.uint8); mask[:int(H * MASK_Y)] = 255
small = 0.5
def gray(f): return cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), None, fx=small, fy=small)
ref_idx = round((ref_t - start) * 60)
frames_needed = []
# pass: buffer frames is too heavy; read reference first via separate decode
refdec = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(ref_t), "-i", src, "-map", "0:v:0", "-frames:v", "1",
    "-vf", f"scale={W}:{H}:flags=lanczos", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True).stdout
refg = gray(np.frombuffer(refdec, np.uint8).reshape(H, W, 3))
pts = cv2.goodFeaturesToTrack(refg, 800, 0.01, 8, mask=cv2.resize(mask, None, fx=small, fy=small))
prev_g, prev_M = refg, None
log = []
n = 0
while True:
    buf = dec.stdout.read(fsz)
    if len(buf) < fsz: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    g = gray(f)
    nxt, st, err = cv2.calcOpticalFlowPyrLK(refg, g, pts, None, winSize=(31, 31), maxLevel=4,
        criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 40, 0.01))
    back, st2, _ = cv2.calcOpticalFlowPyrLK(g, refg, nxt, None, winSize=(31, 31), maxLevel=4)
    good = (st[:, 0] == 1) & (st2[:, 0] == 1) & (np.linalg.norm((back - pts).reshape(-1, 2), axis=1) < 0.5)
    M, inl = cv2.estimateAffinePartial2D(nxt[good], pts[good], method=cv2.RANSAC, ransacReprojThreshold=1.0)
    if M is None: M = prev_M if prev_M is not None else np.array([[1, 0, 0], [0, 1, 0]], float)
    M = M.copy(); M[:, 2] /= small
    prev_M = M
    warped = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    x0, y0 = (W - OW) // 2, (H - OH) // 2
    crop = warped[y0:y0 + OH, x0:x0 + OW]
    # crop is 1080x1920 from 1350x2400 => 1.25x zoom, plenty of margin
    enc.stdin.write(np.ascontiguousarray(crop).tobytes())
    log.append([n, float(M[0, 2]), float(M[1, 2]), float(np.degrees(np.arctan2(M[1, 0], M[0, 0]))), int(good.sum()), int(inl.sum()) if inl is not None else 0])
    n += 1
enc.stdin.close(); enc.wait(); dec.wait()
json.dump(log, open(out + ".json", "w"))
a = np.array(log)
print("frames", n, "shift x range", a[:, 1].min().round(1), a[:, 1].max().round(1),
      "y range", a[:, 2].min().round(1), a[:, 2].max().round(1), "rot deg", a[:, 3].min().round(2), a[:, 3].max().round(2),
      "min inliers", a[:, 5].min())
