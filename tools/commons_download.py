"""Polite Commons downloader: honours Retry-After fully, one file at a time."""
import json, time, urllib.request, urllib.error, sys
UA={"User-Agent":"video-montage-script/1.0 (personal editing project)"}
c=json.load(open("work/commons/candidates.json"))
names={"Baby African bush elephant resting":"elephant","Female panda and cub":"panda","Western lowland gorillas (mom and baby)":"gorilla",
 "Mountain Zebras (Equus zebra zebra) mare and foal":"zebra","Drink From Mom Wildebeest":"wildebeest"}
time.sleep(int(sys.argv[1]) if len(sys.argv)>1 else 0)
for k,n in names.items():
    u=c[k]["url"].split("?")[0]; ext=u.rsplit(".",1)[1]; dst=f"work/commons/{n}.{ext}"
    for i in range(3):
        try:
            data=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=600).read()
            open(dst,"wb").write(data); print(n,round(len(data)/1e6,1),"MB",flush=True); break
        except urllib.error.HTTPError as e:
            if e.code!=429: print(n,"HTTP",e.code,flush=True); break
            w=int(e.headers.get("Retry-After") or 600)+30; print(n,"429, waiting",w,"s",flush=True); time.sleep(w)
    else: print(n,"gave up",flush=True)
    time.sleep(20)
