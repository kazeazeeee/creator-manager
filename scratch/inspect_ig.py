with open(r"C:\Users\ALIEN\Desktop\agent manager\scratch\ig.html", "r", encoding="utf-8") as f:
    html = f.read()

print(f"HTML Length: {len(html)}")
print("HTML Start (first 1000 chars):")
print(html[:1000])

import re
meta_tags = re.findall(r'<meta[^>]*>', html)
print("\nAll Meta Tags:")
for meta in meta_tags[:20]:
    print(meta)
