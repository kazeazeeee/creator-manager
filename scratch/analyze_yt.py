import re

file_path = r"C:\Users\ALIEN\Desktop\agent manager\scratch\yt.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for patterns like "subscriberCountText" or count of subscribers
matches_sub = re.findall(r'"subscriberCountText":\s*\{[^}]*\}', content)
print("subscriberCountText matches:")
for m in matches_sub:
    print(m)

# Find around the word "subscriber"
print("\nMentions of subscriber:")
for m in re.finditer(r'subscriber', content, re.IGNORECASE):
    start = max(0, m.start() - 50)
    end = min(len(content), m.end() + 100)
    print(f"Index {m.start()}: {content[start:end]}")
