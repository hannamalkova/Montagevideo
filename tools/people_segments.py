"""Find time ranges where people are in frame (torchvision Faster R-CNN, COCO 'person').
usage: people_segments.py VIDEO [fps=4] -> prints JSON list of per-sample detections"""
import sys, json, subprocess, numpy as np, torch, torchvision
torch.set_num_threads(4)
src = sys.argv[1]; fps = float(sys.argv[2]) if len(sys.argv) > 2 else 4
W, H = 360, 640
m = torchvision.models.detection.fasterrcnn_mobilenet_v3_large_fpn(weights="DEFAULT").eval()
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-vf", f"fps={fps},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
out = []; i = 0
with torch.inference_mode():
    while True:
        b = dec.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        x = torch.from_numpy(np.frombuffer(b, np.uint8).reshape(H, W, 3).copy()).permute(2, 0, 1).float() / 255
        r = m([x])[0]
        keep = (r["labels"] == 1) & (r["scores"] > 0.55)
        boxes = r["boxes"][keep].tolist(); scores = r["scores"][keep].tolist()
        out.append({"t": round(i / fps, 3), "n": len(boxes),
                    "boxes": [[round(v) for v in bb] + [round(s, 2)] for bb, s in zip(boxes, scores)]})
        i += 1
json.dump(out, sys.stdout)
