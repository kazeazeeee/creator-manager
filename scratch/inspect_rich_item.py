import re
import json

file_path = r"C:\Users\ALIEN\Desktop\agent manager\scratch\yt.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find "richItemRenderer" and get the JSON block around it
idx = content.find('"richItemRenderer"')
if idx != -1:
    # Print 2000 chars from here
    print(content[idx:idx+2500])
