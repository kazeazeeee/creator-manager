import re

file_path = r"C:\Users\ALIEN\Desktop\agent manager\scratch\ig.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

print("\nMentions of followers in Instagram HTML:")
for m in re.finditer(r'follower', content, re.IGNORECASE):
    start = max(0, m.start() - 100)
    end = min(len(content), m.end() + 100)
    print(f"Index {m.start()}: {content[start:end]}")
