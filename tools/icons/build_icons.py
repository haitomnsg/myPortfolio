"""Project icons and app screens for the AI reel and the Software desktop.
usage: python -I build_icons.py <repo_root>

AI reel (Ai.tsx): each icon PNG in assets/ai/ becomes public/ai/<id>-icon.webp, the mark trimmed and
fitted into a 400 x 400 box (a wide wordmark gets 560 x 400) on the frame's white 1200 x 1000 card.
Pass ids after the root to rebuild only those (e.g. `recyclo`), so unchanged frames keep their bytes.

Software desktop (Software.tsx): each icon PNG in assets/software/ becomes a 512 px app tile with
transparent corners, public/software/<id>-icon.webp. An icon that is already a tile (a squircle or a
circle on white) is cut out of its white backdrop; a bare mark (a line drawing on white) is set on a
white squircle of the same corner radius, so the dock shows six tiles of one kind.

App screens: the old site's 2 x 2 dashboard sheets (currentWebsiteAssets/<id>Dashboard.png) are cut
into their four screens, public/software/<id>-1..4.webp, read left to right, top to bottom."""
import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

root = sys.argv[1]
only = set(sys.argv[2:])

# ---------------------------------------------------------------- shared


def ink_box(im, tol=24):
    """The box around everything that is not the white backdrop."""
    a = np.asarray(im.convert("RGB"), np.int16)
    ink = (255 - a).max(-1) > tol
    ys, xs = np.nonzero(ink)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def fit(w, h, bw, bh):
    s = min(bw / w, bh / h)
    return max(1, round(w * s)), max(1, round(h * s))


# ---------------------------------------------------------------- the AI reel's frames

AI = {"doclipi": "Doclipi", "jiffy": "Jiffy", "opencollab": "OpenCollab", "phulbari": "Phulbari", "recyclo": "Recyclo"}
for key, name in AI.items():
    if only and key not in only:
        continue
    src = Image.open(os.path.join(root, "assets/ai", name + ".png")).convert("RGB")
    box = ink_box(src)
    mark = src.crop(box)
    w, h = mark.size
    bw = 560 if w / h > 2 else 400
    mark = mark.resize(fit(w, h, bw, 400), Image.LANCZOS)
    card = Image.new("RGB", (1200, 1000), (255, 255, 255))
    card.paste(mark, ((1200 - mark.width) // 2, (1000 - mark.height) // 2))
    out = os.path.join(root, "public/ai", key + "-icon.webp")
    card.save(out, quality=88, method=6)
    print("ai", key, mark.size, "->", out)

# ---------------------------------------------------------------- the dock's tiles

TILE = 512
RADIUS = 0.225  # of the tile's side: the ArthaVidhi and RoboxCraft squircles measure 22-23%
# id: (source file, 'tile' if the icon is its own tile, else 'mark')
SOFTWARE = {
    "arthavidhi": ("Arthavidhi", "tile"),
    "resthat": ("RestHat", "mark"),
    "redsoil": ("RedSoil", "mark"),
    "wadaconnect": ("WadaConnect", "mark"),
    "roboxcraft": ("RoboXCraft", "tile"),
    "pharmear": ("Pharmear", "tile"),
}
os.makedirs(os.path.join(root, "public/software"), exist_ok=True)


def cutout(src):
    """The icon with its white backdrop taken away: the near-white region joined to the image's edge
    is flooded from the corners, so white inside the icon (a glyph, a pill) stays. The cut is made at
    full size and pulled in by a pixel, so the white fringe of the edge does not ride along."""
    a = np.asarray(src.convert("RGB"), np.int16)
    light = Image.fromarray(np.where((255 - a).max(-1) <= 20, 255, 0).astype(np.uint8)).copy()  # fromarray shares a read-only buffer the flood cannot write
    for xy in [(0, 0), (light.width - 1, 0), (0, light.height - 1), (light.width - 1, light.height - 1)]:
        if light.getpixel(xy) == 255:
            ImageDraw.floodfill(light, xy, 128)
    keep = Image.fromarray(np.where(np.asarray(light) == 128, 0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))
    out = src.convert("RGBA")
    out.putalpha(keep)
    return out


def squircle(size, ss=4):
    m = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size * ss - 1, size * ss - 1], radius=RADIUS * size * ss, fill=255)
    return m.resize((size, size), Image.LANCZOS)


for key, (name, kind) in SOFTWARE.items():
    if only and key not in only:
        continue
    src = Image.open(os.path.join(root, "assets/software", name + ".png")).convert("RGB")
    box = ink_box(src)
    if kind == "tile":
        icon = cutout(src).crop(box)
        icon = icon.resize(fit(*icon.size, TILE, TILE), Image.LANCZOS)
        tile = Image.new("RGBA", (TILE, TILE), (255, 255, 255, 0))
        tile.alpha_composite(icon, ((TILE - icon.width) // 2, (TILE - icon.height) // 2))
    else:
        # the mark sits in the middle 60% of a white squircle, by its longer side
        mark = src.crop(box)
        mark = mark.resize(fit(*mark.size, round(TILE * 0.6), round(TILE * 0.6)), Image.LANCZOS)
        plate = Image.new("RGB", (TILE, TILE), (255, 255, 255))
        plate.paste(mark, ((TILE - mark.width) // 2, (TILE - mark.height) // 2))
        tile = plate.convert("RGBA")
        tile.putalpha(squircle(TILE))
    out = os.path.join(root, "public/software", key + "-icon.webp")
    tile.save(out, quality=90, method=6)
    print("software", key, kind, "->", out)

# ---------------------------------------------------------------- the screens

SHEETS = {"arthavidhi": "arthavidhiDashboard", "resthat": "resthatDashboard", "redsoil": "redsoilDashboard"}
for key, name in SHEETS.items():
    if only and key not in only:
        continue
    sheet = Image.open(os.path.join(root, "currentWebsiteAssets", name + ".png")).convert("RGB")
    a = np.asarray(sheet, np.int16)
    bg = a[4, 4]
    on = np.abs(a - bg).max(-1) > 10
    H, W = on.shape
    n = 0
    for qy in (0, 1):
        for qx in (0, 1):
            y0, y1, x0, x1 = qy * H // 2, (qy + 1) * H // 2, qx * W // 2, (qx + 1) * W // 2
            q = on[y0:y1, x0:x1]
            # a screen is the rows and columns that are mostly not the sheet's grey
            rows = np.nonzero(q.mean(1) > 0.5)[0]
            cols = np.nonzero(q.mean(0) > 0.5)[0]
            shot = sheet.crop((x0 + cols.min(), y0 + rows.min(), x0 + cols.max() + 1, y0 + rows.max() + 1))
            n += 1
            shot = shot.resize((1600, round(1600 * shot.height / shot.width)), Image.LANCZOS)
            out = os.path.join(root, "public/software", f"{key}-{n}.webp")
            shot.save(out, quality=84, method=6)
            print("screen", key, n, shot.size, "->", out)
