"""Fix a hazy/'dirty lens' shot: denoise (nlmeans), dehaze-ish local contrast (CLAHE on L),
gentle unsharp. usage: clarify.py IN OUT [clahe_clip=1.6] [blend=0.75]"""
import sys, subprocess, numpy as np, cv2
src, out = sys.argv[1], sys.argv[2]
clip = float(sys.argv[3]) if len(sys.argv) > 3 else 1.6
blend = float(sys.argv[4]) if len(sys.argv) > 4 else 0.75
W, H = 1080, 1920
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vf", "nlmeans=s=2.2:p=7:r=13,format=bgr24", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
cl = cv2.createCLAHE(clipLimit=clip, tileGridSize=(6, 10))
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                        "-vf", "unsharp=7:7:0.6:5:5:0.0,format=yuv420p", "-c:v", "libx264", "-crf", "15", "-preset", "fast", out], stdin=subprocess.PIPE)
for f in fr:
    lab = cv2.cvtColor(f, cv2.COLOR_BGR2LAB)
    L = lab[..., 0]
    lab[..., 0] = cv2.addWeighted(cl.apply(L), blend, L, 1 - blend, 0)
    enc.stdin.write(cv2.cvtColor(lab, cv2.COLOR_LAB2BGR).tobytes())
enc.stdin.close(); enc.wait(); print("ok", len(fr), "frames")
