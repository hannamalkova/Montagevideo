import sys, time, subprocess, numpy as np
from faster_whisper import WhisperModel
def load(p):
    raw=subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.int16).astype(np.float32)/32768
t=time.time()
m=WhisperModel("large-v3", device="cpu", compute_type="int8", download_root="models")
segs,info=m.transcribe(load(sys.argv[1]), language="uk", word_timestamps=True)
for s in segs: print(f"[{s.start:.2f}-{s.end:.2f}] {s.text}")
print("lang",info.language,"time",round(time.time()-t,1),"s")
