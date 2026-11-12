import cv2, numpy as np, sys
cap=cv2.VideoCapture(sys.argv[1]); ymax=float(sys.argv[2]); ref=None; r=[]
while True:
    ok,f=cap.read()
    if not ok: break
    g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY)
    if ref is None:
        ref=g; m=np.zeros_like(g); m[:int(g.shape[0]*ymax)]=255
        p=cv2.goodFeaturesToTrack(g,500,0.01,8,mask=m)
    n,st,_=cv2.calcOpticalFlowPyrLK(ref,g,p,None,winSize=(31,31),maxLevel=4)
    d=(n-p).reshape(-1,2)[st[:,0]==1]; r.append(np.median(d,0))
r=np.array(r); j=np.linalg.norm(np.diff(r,axis=0),axis=1)
print(f"drift from first frame px: max {np.linalg.norm(r,axis=1).max():.2f}; frame-to-frame jitter px: mean {j.mean():.2f} p95 {np.percentile(j,95):.2f} max {j.max():.2f}")
