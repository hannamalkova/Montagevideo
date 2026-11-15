"""Rotate clips by a given tilt (degrees, as measured by horizon.py) with the minimal covering zoom.
usage: level_apply.py DIR clip=angle ...   -> DIR/<clip>_lv.mp4 (angle 0 just copies)"""
import sys, subprocess, numpy as np, cv2, math, shutil
d = sys.argv[1]; W, H = 1080, 1920
for arg in sys.argv[2:]:
    c, a = arg.split("="); a = float(a)
    if abs(a) < 0.3: shutil.copy(f"{d}/{c}.mp4", f"{d}/{c}_lv.mp4"); print(c, "unchanged"); continue
    t = math.radians(abs(a)); z = math.cos(t) + (H / W) * math.sin(t)
    M = cv2.getRotationMatrix2D((W / 2, H / 2), a, z)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{d}/{c}.mp4", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                            "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-pix_fmt", "yuv420p", f"{d}/{c}_lv.mp4"], stdin=subprocess.PIPE)
    for f in fr: enc.stdin.write(cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).tobytes())
    enc.stdin.close(); enc.wait(); print(f"{c} rotated {a:+.2f} deg, zoom {z:.3f}")
