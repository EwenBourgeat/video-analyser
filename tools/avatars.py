"""Cut the real avatar photographs out of the source frames.

The synthetic portraits were a significant error source in beat 6. The source
shows each avatar at ~47 px across, so lifting those pixels and upscaling them
reproduces exactly what the frame contains — a generated portrait never will.
"""
import os
import numpy as np
import cv2
from lib import frames

OUT = "/Users/ewenbourgeat/Documents/video-analyser/repro/public/avatars"
SX, SY = 1920 / 720, 1080 / 405

# (name, source frame, centre in master coords, radius in master)
PICKS = [
    ("laurent",       440, 487, 375, 66),
    ("romain",        440, 1398, 375, 66),
    ("lucas-martin",  440, 150, 780, 68),
    ("lucas-maycock", 440, 933, 780, 68),
    ("jules",         440, 1744, 780, 68),
    ("robin",         428, 675, 80, 62),
    
]


def main():
    os.makedirs(OUT, exist_ok=True)
    need = sorted({p[1] for p in PICKS})
    store = {}
    for f in need:
        _, fr = frames(f, f + 1)
        store[f] = fr[0]

    for name, f, mx, my, mr in PICKS:
        img = store[f]
        cx, cy, r = mx / SX, my / SY, mr / SX
        x0, y0 = int(round(cx - r)), int(round(cy - r))
        s = int(round(2 * r))
        x0 = max(0, min(img.shape[1] - s, x0))
        y0 = max(0, min(img.shape[0] - s, y0))
        crop = img[y0:y0 + s, x0:x0 + s]
        if crop.size == 0:
            print(f"{name:14s} SKIPPED (out of frame)")
            continue
        # upscale with Lanczos, then a light unsharp so it holds at 256 px
        big = cv2.resize(crop, (256, 256), interpolation=cv2.INTER_LANCZOS4)
        blur = cv2.GaussianBlur(big, (0, 0), 3)
        big = cv2.addWeighted(big, 1.45, blur, -0.45, 0)
        # circular alpha so it drops straight into a round frame
        a = np.zeros((256, 256), np.uint8)
        cv2.circle(a, (128, 128), 126, 255, -1)
        a = cv2.GaussianBlur(a, (0, 0), 1.2)
        rgba = np.dstack([np.clip(big, 0, 255).astype(np.uint8), a])
        cv2.imwrite(os.path.join(OUT, f"{name}.png"), rgba[..., [2, 1, 0, 3]])
        print(f"{name:14s} f{f} crop {s}x{s} px  moyenne RGB "
              f"{crop.reshape(-1,3).mean(0).round(0)}")


if __name__ == "__main__":
    main()
