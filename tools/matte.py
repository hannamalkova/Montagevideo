"""Person matte with Robust Video Matting (TorchScript). Writes:
  OUT_alpha.mp4  - grayscale alpha matte
  OUT_fg.webm    - foreground with alpha (VP9 yuva420p) for Remotion <OffthreadVideo transparent>
usage: matte.py IN.mp4 OUT_prefix [downsample_ratio]"""
import sys, subprocess, numpy as np, torch, time
src, out = sys.argv[1], sys.argv[2]
ratio = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
torch.set_num_threads(4)
model = torch.jit.load("models/rvm/rvm_resnet50_fp32.torchscript").eval()
info = subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height,r_frame_rate","-of","csv=p=0",src],capture_output=True,text=True).stdout.strip().split(",")
W, H, fr = int(info[0]), int(info[1]), info[2]
dec = subprocess.Popen(["ffmpeg","-v","error","-i",src,"-f","rawvideo","-pix_fmt","rgb24","-"],stdout=subprocess.PIPE)
ea = subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","gray","-s",f"{W}x{H}","-r",fr,"-i","-",
    "-c:v","libx264","-crf","12","-pix_fmt","yuv420p",out+"_alpha.mp4"],stdin=subprocess.PIPE)
ef = subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgba","-s",f"{W}x{H}","-r",fr,"-i","-",
    "-c:v","libvpx-vp9","-pix_fmt","yuva420p","-b:v","0","-crf","18","-row-mt","1","-deadline","good","-cpu-used","4",out+"_fg.webm"],stdin=subprocess.PIPE)
rec = [None]*4; n=0; t=time.time()
with torch.inference_mode():
    while True:
        b = dec.stdout.read(W*H*3)
        if len(b) < W*H*3: break
        rgb = np.frombuffer(b,np.uint8).reshape(H,W,3)
        x = torch.from_numpy(rgb.copy()).permute(2,0,1)[None].float()/255
        fgr, pha, *rec = model(x, *rec, ratio)
        a = (pha[0,0].clamp(0,1).numpy()*255+0.5).astype(np.uint8)
        ea.stdin.write(a.tobytes())
        ef.stdin.write(np.dstack([rgb,a]).tobytes()); n+=1
for p in (ea, ef): p.stdin.close(); p.wait()
print(f"{n} frames in {time.time()-t:.0f}s")
