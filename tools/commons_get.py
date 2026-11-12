import json, sys, time, urllib.request, urllib.parse, urllib.error
UA = {"User-Agent": "video-montage-script/1.0 (personal editing project)"}
def get(url):
    for i in range(6):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            w=int(e.headers.get("Retry-After") or 15*(i+1)); print(" 429 wait",w,flush=True); time.sleep(w)
out = {}
for phrase in sys.argv[1:]:
    time.sleep(8)
    r = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action":"query","format":"json",
        "generator":"search","gsrnamespace":6,"gsrlimit":1,"gsrsearch":f'intitle:"{phrase}"',"prop":"imageinfo",
        "iiprop":"url|size|extmetadata","iiextmetadatafilter":"LicenseShortName|Artist"})))
    for p in (r.get("query") or {}).get("pages", {}).values():
        ii = p["imageinfo"][0]; md = ii["extmetadata"]
        out[phrase] = {"title": p["title"], "url": ii["url"], "page": ii["descriptionurl"], "w": ii["width"], "h": ii["height"],
            "dur": ii.get("duration"), "bytes": ii["size"], "license": md.get("LicenseShortName",{}).get("value"),
            "artist": md.get("Artist",{}).get("value")}
        print(phrase, "->", p["title"], ii["width"], ii["height"], round(ii["size"]/1e6,1), "MB", flush=True)
json.dump(out, open("work/commons/candidates.json","w"), ensure_ascii=False, indent=1)
