"""Hero v2 assets from the ChatGPT studio portrait (docs/HERO_ASSET_PROMPT.md, "Hero v2b").
usage: python -I build_hero_v2.py <ashish-hero-v2b.png> <out_dir>
       python -I build_hero_v2.py <focusNew.png> <out_dir> --still unfocus.webp [dy]

--still keys one more photo of the same shoot (same canvas, same backdrop) and writes only that file:
the Unfocus still (docs/UNFOCUS_PROMPT.md), whose sideways motion trail becomes soft transparency.
dy moves the still down that many px first, to register its face with the portrait's (focusNew.png: 2).

portrait.webp     the photo cut out of its flat blue backdrop, full size (AF box, footer)
silhouette.webp   the same canvas at a third of the size (first paint, and the blurred canvas source)
hero-v2.json      canvas size and the AF box's resting place, in shares of the canvas

The backdrop is one flat colour, so the matte is a colour key, with the backdrop's blue taken back
out of the semi-transparent edge pixels (otherwise the hair gets a pale halo on the ink footer).
Nothing is painted in: the v2b photo already has both arms inside the frame and runs to the waist."""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
still = sys.argv[4] if len(sys.argv) > 4 and sys.argv[3] == "--still" else None
dy = int(sys.argv[5]) if still and len(sys.argv) > 5 else 0
os.makedirs(out, exist_ok=True)

C = np.asarray(Image.open(src).convert("RGB"), np.float32)
H, W, _ = C.shape  # 1536 x 1024
if dy:  # the top rows are backdrop, so the gap is filled by repeating the first row
    C = np.concatenate([np.repeat(C[:1], dy, 0), C[:-dy]]) if dy > 0 else np.concatenate([C[-dy:], np.repeat(C[-1:], -dy, 0)])

border = np.concatenate([C[:60].reshape(-1, 3), C[:700, :40].reshape(-1, 3), C[:700, -40:].reshape(-1, 3)])
B = border.mean(0)
d = np.sqrt(((C - B) ** 2).sum(-1))


def blur(x, r):
    return np.asarray(Image.fromarray(np.clip(x, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)), np.float32)


# Solid core, then unmix the edge band against the local foreground colour (spread out from the
# core), so a half-covered hair strand gets half alpha and its own dark colour, not the blue.
core = Image.fromarray(np.where(d > 70, 255, 0).astype(np.uint8)).filter(ImageFilter.MinFilter(5))
core = np.asarray(core, np.float32) / 255
k = blur(core * 255, 7)[..., None]
Fg = np.stack([blur(C[..., i] * core, 7) for i in range(3)], -1) / np.maximum(k, 1) * 255
Fg = np.where(k > 4, Fg, np.array([24, 22, 24], np.float32))  # far from any core: hair
v = Fg - B
a = np.clip(((C - B) * v).sum(-1) / np.maximum((v * v).sum(-1), 1), 0, 1)
a = np.where(d < 14, 0, a)
a = np.maximum(a, core)

# backdrop-coloured pixels the outside can't reach are the right lens over the backdrop: glass
bgmask = Image.fromarray(np.where(d < 40, 255, 0).astype(np.uint8)).copy()  # fromarray is read-only; floodfill would no-op
for seed in [(0, 0), (W - 1, 0), (0, H // 2), (W - 1, H // 2), (0, H - 1), (W - 1, H - 1)]:
    if bgmask.getpixel(seed) == 255:
        ImageDraw.floodfill(bgmask, seed, 128)
holes = np.asarray(bgmask) == 255
a[holes] = 0.07

# take the backdrop back out of edge pixels; what tint survives there is noise, so drain it
ae = np.maximum(a, 0.08)[..., None]
F = np.clip((C - (1 - ae) * B) / ae, 0, 255)
edge = ((a < 0.97) & (core < 0.5))[..., None]
F = np.where(edge, F * 0.4 + F.mean(-1, keepdims=True) * 0.6, F)
F = np.where(holes[..., None], 236, F)  # the lens reads as a faint sheen on any ground


def save(rgb, alpha, name, size=None):
    rgba = np.dstack([np.clip(rgb, 0, 255), np.clip(alpha * 255, 0, 255)]).astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(os.path.join(out, name), "WEBP", quality=88, method=6)
    return im.size


if still:
    # A motion trail is the dark hoodie and hair smeared over the backdrop: every trail pixel lies on the
    # line from the backdrop to that dark, so its alpha is how far along it sits, and its colour is the dark.
    # (The colour key above calls half-blue trail pixels solid and leaves a pale halo.) Lit fabric sits a
    # little short of the dark, so alpha reaches 1 at FULL of the way. Skin is off that line: kept solid.
    D = np.array([20, 24, 32], np.float32)
    FULL = 0.78
    v = D - B
    t = np.clip(((C - B) * v).sum(-1) / (v * v).sum(), 0, 1)
    sa = np.clip(t / FULL, 0, 1)
    skin = Image.fromarray(np.where(C[..., 0] > C[..., 2] + 12, 255, 0).astype(np.uint8)).filter(ImageFilter.MinFilter(3))
    skin = np.asarray(skin, np.float32) / 255
    sa = np.where(d < 14, 0, np.maximum(sa, skin))
    sa[holes] = 0.07
    ae = np.maximum(sa, 0.08)[..., None]
    Fs = np.clip((C - (1 - ae) * B) / ae, 0, 255)
    trail = ((sa < 0.995) & (skin < 0.5) & ~holes)[..., None]
    Fs = np.where(trail, np.minimum(Fs, D + 30), Fs)  # what survives the unmix there is backdrop: keep it dark
    Fs = np.where(holes[..., None], 236, Fs)
    print(still, save(Fs, sa, still))
    sys.exit()

save(F, a, "portrait.webp")
small = save(F, a, "silhouette.webp", (W // 3, H // 3))

# the AF box at rest: brow to mouth, just inside the ear to the glasses' far rim (source px)
face = {"x0": 403, "y0": 329, "x1": 715, "y1": 531}
meta = {
    "canvas": [W, H],
    "small": list(small),
    "face": {k: round(v / (W if k[0] == "x" else H), 4) for k, v in face.items()},
    "backdrop": [round(v) for v in B],
    "holes": int(holes.sum()),
}
json.dump(meta, open(os.path.join(out, "hero-v2.json"), "w"), indent=2)
print(json.dumps(meta))
