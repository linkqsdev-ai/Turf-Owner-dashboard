import json
import urllib.request
import os

os.makedirs('stitch_html', exist_ok=True)

with open(r'C:\Users\acer\.gemini\antigravity\brain\87dcfcb5-850e-440a-9117-73df1cf8544c\.system_generated\steps\19\output.txt', 'r') as f:
    data = json.load(f)

for screen in data['screens']:
    title = screen['title'].replace(' ', '_').replace('&', 'and')
    url = screen['htmlCode']['downloadUrl']
    print(f"Downloading {title}...")
    urllib.request.urlretrieve(url, f"stitch_html/{title}.html")
print("Done.")
