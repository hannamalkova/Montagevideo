import json, sys, time, urllib.request, urllib.parse, urllib.error
UA = {"User-Agent": "video-montage-script/1.0 (personal editing project)"}
def q(params):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    for i in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            wait = int(e.headers.get("Retry-After") or 10 * (i + 1)); print(f"  (429, waiting {wait}s)"); time.sleep(wait)
    return {}
for term in sys.argv[1:]:
    time.sleep(12)
    r = q({"action":"query","format":"json","generator":"search","gsrnamespace":6,"gsrlimit":15,
           "gsrsearch": f"{term} filetype:video","prop":"imageinfo",
           "iiprop":"url|size|extmetadata","iiextmetadatafilter":"LicenseShortName|Artist"})
    pages = sorted((r.get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    print(f"== {term}: {len(pages)}")
    for p in pages:
        ii = p["imageinfo"][0]; md = ii.get("extmetadata", {})
        print(f"  {p['title'][5:][:70]:70s} {ii.get('width')}x{ii.get('height')} {ii.get('duration',0) if 'duration' in ii else ''} {md.get('LicenseShortName',{}).get('value','')}")
