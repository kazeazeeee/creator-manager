import re

file_path = r"C:\Users\ALIEN\Desktop\agent manager\scratch\yt.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for Kb3sy0oEVB8
idx = content.find('Kb3sy0oEVB8')
if idx != -1:
    print(content[idx-100:idx+500])
else:
    print("Not found")
