"""Hero assets for "In Focus".
usage: python -I build_hero_assets.py <portrait.png> <mask_raw.png> <out_dir>

silhouette.webp   the person as a dark warm shape with a little photo tone left in (blurred on the page)
portrait.webp     the B/W photo cut out with the same matte, warm duotone (shown inside the loupe)
Both share one canvas so the loupe lines up with the silhouette exactly. The circle crop cut his
shoulders, so the torso is extended below the crop with a polygon."""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, mask_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)

photo = Image.open(src).convert("RGBA")
W, H = photo.size  # 740 x 744
lum = np.asarray(photo.convert("L"), dtype=np.float32) / 255.0
raw = np.asarray(Image.open(mask_path).convert("L"), dtype=np.float32) / 255.0

# keep the matte inside the circle crop (the corners outside it are noise)
yy, xx = np.mgrid[0:H, 0:W]
cx, cy, r = W / 2, H / 2, min(W, H) / 2 - 6
inside = ((xx - cx) ** 2 + (yy - cy) ** 2) <= r ** 2
m = np.where(inside, raw, 0.0)
m = np.clip((m - 0.35) / 0.3, 0, 1)  # firm the edge
m = m * m * (3 - 2 * m)

# canvas: photo placed with room for the extended torso
PADX, PADB = 280, 520
CW, CH = W + 2 * PADX, H + PADB
matte = Image.new("L", (CW, CH), 0)
matte.paste(Image.fromarray((m * 255).astype(np.uint8)), (PADX, 0))

# torso below the circle crop: from where the matte meets the circle edge, sloping out to the bottom
torso = Image.new("L", (CW, CH), 0)
d = ImageDraw.Draw(torso)
d.polygon(
    [
        # left: hood → rounded near shoulder → straight down
        (PADX + 40, 455), (PADX - 60, 530), (PADX - 170, 620), (PADX - 235, 740), (PADX - 260, 900),
        (PADX - 265, CH),
        # right: far shoulder, smaller (he is turned to his left)
        (PADX + 900, CH), (PADX + 895, 940), (PADX + 850, 810), (PADX + 760, 720), (PADX + 640, 655),
        (PADX + 470, 560), (PADX + 200, 520),
    ],
    fill=255,
)
torso = torso.filter(ImageFilter.GaussianBlur(6))
alpha = np.maximum(np.asarray(matte, np.float32), np.asarray(torso, np.float32)) / 255.0

# photo luminance on the same canvas; the extended torso reads as the black hoodie
L = np.full((CH, CW), 0.06, np.float32)
L[0:H, PADX:PADX + W] = np.where(inside, lum, 0.06)

def save(rgb, a, name):
    rgba = np.dstack([np.clip(rgb, 0, 255), np.clip(a * 255, 0, 255)]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(os.path.join(out, name), "WEBP", quality=88, method=6)

ink = np.array([22, 19, 15], np.float32)      # --ink #16130F
lift = np.array([92, 82, 70], np.float32)     # warm grey the face and collar lift toward
t = (L ** 1.5)[..., None] * 0.55
save(ink * (1 - t) + lift * t, alpha, "silhouette.webp")

paper = np.array([246, 244, 236], np.float32)  # --paper #F6F4EC
shadow = np.array([18, 16, 13], np.float32)
g = (L ** 0.95)[..., None]
save(shadow * (1 - g) + paper * g, alpha, "portrait.webp")

print("canvas", CW, CH, "photo offset", PADX, 0)
