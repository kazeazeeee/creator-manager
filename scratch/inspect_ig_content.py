import re

with open(r"C:\Users\ALIEN\Desktop\agent manager\scratch\ig.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's search for the username or title
title_match = re.findall(r'<title>[^<]*</title>', html)
print("Title matches:")
print(title_match)

# Let's search for "115"
matches_115 = []
for m in re.finditer(r'115', html):
    start = max(0, m.start() - 100)
    end = min(len(html), m.end() + 100)
    matches_115.append(html[start:end])

print(f"\nFound {len(matches_115)} matches for '115'. First 5 matches:")
for idx, match in enumerate(matches_115[:5]):
    print(f"Match {idx+1}: {match}\n")
