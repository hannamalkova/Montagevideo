"""AI upscale a clip with Real-ESRGAN (spandrel), output 1080x1920 at source fps.
usage: upscale.py IN OUT [model] [denoise_mix]"""
import sys, subprocess, numpy as np, torch, spandrel, time
src, out = sys.argv[1], sys.argv[2]
model_path = sys.argv[3] if len(sys.argv) > 3 else "models/esrgan/realesr-general-x4v3.pth"
torch.set_num_threads(4)
m = spandrel.ModelLoader().load_from_file(model_path).eval()
info = subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height,r_frame_rate","-of","csv=p=0",src],capture_output=True,text=True).stdout.strip().split(",")
w, h, fr = int(info[0]), int(info[1]), info[2]
# work at 540x960 input -> x4 = 2160x3840 -> down to 1080x1920 (cleaner than 720p x4)
iw, ih = 540, 960
dec = subprocess.Popen(["ffmpeg","-v","error","-i",src,"-vf",f"scale={iw}:{ih}:flags=area","-f","rawvideo","-pix_fmt","rgb24","-"],stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24","-s","1080x1920","-r",fr,"-i","-",
    "-c:v","libx264","-crf","14","-preset","medium","-pix_fmt","yuv420p",out],stdin=subprocess.PIPE)
n=0; t=time.time()
with torch.inference_mode():
    while True:
        b = dec.stdout.read(iw*ih*3)
        if len(b) < iw*ih*3: break
        x = torch.from_numpy(np.frombuffer(b,np.uint8).reshape(ih,iw,3).copy()).permute(2,0,1)[None].float()/255
        y = m(x)
        y = torch.nn.functional.interpolate(y, size=(1920,1080), mode="area")
        enc.stdin.write((y[0].clamp(0,1).permute(1,2,0).numpy()*255+0.5).astype(np.uint8).tobytes()); n+=1
enc.stdin.close(); enc.wait()
print(f"{out}: {n} frames, {time.time()-t:.0f}s")
