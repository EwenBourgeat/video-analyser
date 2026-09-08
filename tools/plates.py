"""Extract the real background plate of every dark scene.

In every dark scene the content (white text, white tiles, blue folder, white
cards) is strictly brighter than the backdrop, so a low per-pixel percentile
across the scene recovers the backdrop exactly — including the blue radial glow
whose position and falloff I had only been approximating by hand.

Regions a large element covers for the whole scene are inpainted from the
surrounding plate, then everything is heavily blurred: the backdrop is a smooth
gradient, so this is lossless in practice and upscales to 1920x1080 cleanly.
"""
import os
import numpy as np
import cv2
from lib import frames

OUT = "/Users/ewenbourgeat/Documents/video-analyser/repro/public/plates"

SCENES = {
    # name: (f0, f1, percentile)
    "gap": (174, 181, 50),
    "pasttext": (181, 235, 8),
    "journey": (235, 376, 5),
    "cards": (376, 476, 5),
    "folder": (476, 545, 5),
}


def build(name, f0, f1, pct):
    _, fr = frames(f0, f1)
    stack = fr.astype(np.float32)
    plate = np.percentile(stack, pct, axis=0)

    # anything still much brighter than the frame-wide dark level is a region
    # that was covered for the whole scene: mask it and inpaint
    lum = plate.mean(axis=2)
    base = np.percentile(lum, 25)
    mask = (lum > base + 26).astype(np.uint8)
    if mask.any():
        k = np.ones((5, 5), np.uint8)
        mask = cv2.dilate(mask, k, iterations=2)
        plate = cv2.inpaint(plate.astype(np.uint8), mask, 12, cv2.INPAINT_TELEA).astype(np.float32)

    # the backdrop is a smooth gradient: blur away codec noise and inpaint seams
    plate = cv2.GaussianBlur(plate, (0, 0), 9)
    up = cv2.resize(plate, (1920, 1080), interpolation=cv2.INTER_CUBIC)
    up = np.clip(up, 0, 255).astype(np.uint8)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{name}.png")
    cv2.imwrite(path, up[..., ::-1])
    covered = 100 * mask.mean() if mask.any() else 0.0
    print(f"{name:10s} f{f0}-{f1}  p{pct}  inpainted={covered:5.1f}%  "
          f"luma {up.mean():6.1f}  -> {path}")
    return up


if __name__ == "__main__":
    plates = {n: build(n, *v) for n, v in SCENES.items()}
    print("\npairwise mean |difference| between plates (are they the same backdrop?)")
    names = list(plates)
    print("           " + "".join(f"{n:>10s}" for n in names))
    for a in names:
        row = "".join(f"{np.abs(plates[a].astype(float) - plates[b]).mean():10.1f}" for b in names)
        print(f"{a:10s} {row}")
