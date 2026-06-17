import re
import json

file_path = r"C:\Users\ALIEN\Desktop\agent manager\scratch\yt.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for "videoRenderer"
matches_vr = re.findall(r'"videoRenderer":\s*\{[^}]*\}', content)
print(f"videoRenderer matches count: {len(matches_vr)}")

# Let's search for "richItemRenderer"
matches_ri = re.findall(r'"richItemRenderer"', content)
print(f"richItemRenderer matches count: {len(matches_ri)}")

# Let's find any title, view count, published text
# YouTube videos inside ytInitialData are usually under:
# "title":{"runs":[{"text":"..."}]}
# "viewCountText":{"simpleText":"..."} or {"runs":[{"text":"..."}]}
# "publishedTimeText":{"simpleText":"..."}

# Let's search for video titles and links
# Links are in "videoId":"..."
video_ids = re.findall(r'"videoId"\s*:\s*"([^"]+)"', content)
print(f"\nFound {len(video_ids)} videoIds. First 10:")
print(video_ids[:10])
