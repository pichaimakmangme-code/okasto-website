# Make PDF crops + preview from the large PNG
import json, sys, os
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
here = os.path.dirname(os.path.abspath(__file__)); big, preview = sys.argv[1], sys.argv[2]
im = Image.open(big).convert("RGB"); W, H = im.size; s = W / 3840
bx = json.load(open(os.path.join(here, "boxes.json")))
os.makedirs(os.path.join(here, "crops"), exist_ok=True)
def save(img, name, maxw=3000):
    if img.width > maxw: img = img.resize((maxw, round(img.height * maxw / img.width)), Image.LANCZOS)
    img.save(os.path.join(here, "crops", name), optimize=True)
save(im, "full.png", 3400)
top = min(v[1] for v in bx.values()) - 70; bot = max(v[3] for v in bx.values()) + 30
for name, a, b in [("crop-a.png", "core", "book"), ("crop-b.png", "seo", "sup"), ("crop-c.png", "trust", "back")]:
    save(im.crop((int((bx[a][0] - 30) * s), int(top * s), int((bx[b][2] + 30) * s), int(bot * s))), name, 2600)
pv = im.resize((1600, round(H * 1600 / W)), Image.LANCZOS); pv.save(preview, optimize=True)
print("crops ok", im.size, pv.size)
