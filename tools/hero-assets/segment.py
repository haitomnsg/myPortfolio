"""Person matte for the portrait using MediaPipe's multiclass selfie segmenter.
usage: python -I segment.py <model.tflite> <portrait.png> <out_dir>
Writes mask_raw.png (person prob, 0-255) and preview.png (mask over photo)."""
import sys, os
import numpy as np
from PIL import Image
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

model, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)

rgba = Image.open(src).convert("RGBA")
rgb = Image.new("RGB", rgba.size, (0, 0, 0))
rgb.paste(rgba, mask=rgba.split()[3])
arr = np.asarray(rgb)

opts = vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=model),
    output_confidence_masks=True,
    output_category_mask=False,
)
with vision.ImageSegmenter.create_from_options(opts) as seg:
    res = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=arr))

# categories: 0 background, 1 hair, 2 body-skin, 3 face-skin, 4 clothes, 5 others(accessories)
bg = np.squeeze(res.confidence_masks[0].numpy_view())
person = np.clip(1.0 - bg, 0, 1)
Image.fromarray((person * 255).astype(np.uint8)).save(os.path.join(out, "mask_raw.png"))

tint = arr.astype(np.float32) * 0.5
tint[..., 0] += person * 120
Image.fromarray(np.clip(tint, 0, 255).astype(np.uint8)).save(os.path.join(out, "preview.png"))
print("ok", arr.shape, float(person.mean()))
