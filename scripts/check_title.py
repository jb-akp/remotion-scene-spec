"""First-frame title check without watching the video.

The title layer is rendered alone on black (mask) and frame 0 is rendered
normally. From the mask we get the exact text pixels, then check, for each
crop the post may be cut to (9:16, 3:4, 1:1, centered):
  - every text pixel survives the crop
  - the text is big enough (cap height >= 3.5% of the crop height)
  - text vs. background contrast >= 4.5:1 (WCAG AA) on frame 0
"""
import sys

import numpy as np
from PIL import Image

mask_path, frame_path = sys.argv[1], sys.argv[2]
mask = np.asarray(Image.open(mask_path).convert("L")) > 128
frame = np.asarray(Image.open(frame_path).convert("RGB")).astype(float) / 255
H, W = mask.shape

ys, xs = np.nonzero(mask)
top, bottom, left, right = ys.min(), ys.max(), xs.min(), xs.max()

# Cap height: tallest run of text rows, i.e. the height of one line of letters.
rows = mask.any(axis=1)
runs, run = [], 0
for r in rows:
    run = run + 1 if r else 0
    runs.append(run)
line_h = max(runs)


def lum(rgb):
    c = np.where(rgb <= 0.03928, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


ring = np.zeros_like(mask)
ring[max(top - 40, 0):bottom + 40, max(left - 40, 0):right + 40] = True
ring &= ~mask
L_text = np.median(lum(frame[mask]))
L_bg = np.median(lum(frame[ring]))
contrast = (max(L_text, L_bg) + 0.05) / (min(L_text, L_bg) + 0.05)

ok_all = True
out = []
for name, ratio in (("9:16", 9 / 16), ("3:4", 3 / 4), ("1:1", 1.0)):
    ch = min(H, round(W / ratio))
    y0 = (H - ch) // 2
    inside = top >= y0 and bottom < y0 + ch
    size = line_h / ch
    ok = inside and size >= 0.035 and contrast >= 4.5
    ok_all &= ok
    out.append(f"{name} {'PASS' if ok else 'FAIL'} (inside={inside}, line={size:.1%} of crop)")

print(f"  title check: {'PASS' if ok_all else 'FAIL'}  contrast {contrast:.1f}:1  |  " + "  ".join(out))
sys.exit(0)
