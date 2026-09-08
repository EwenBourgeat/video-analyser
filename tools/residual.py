"""Per-frame residual camera solve.

For each frame of a scene, find the (dx, dy) that best aligns my render onto the
source by direct search, then emit it as a keyframe table. Whatever remains of
the camera model — an easing I fitted slightly wrong, a drift I approximated —
is absorbed exactly, frame by frame.

Usage: residual.py <mine.mp4> <scene>
"""
import sys
import numpy as np
from lib import frames, rendered

SCENES = {
    "cards": (374, 477), "journey": (236, 376), "agenda": (663, 750),
    "browser": (109, 175), "folder": (476, 545), "domains": (591, 630),
    "envelopes": (630, 663), "radar": (0, 66), "logo": (545, 591),
    "pasttext": (181, 235), "clock": (52, 109),
}
GW, GH = 360, 202
MX, MY = 1920 / GW, 1080 / GH


def shift1(a, dx, dy):
    out = np.roll(np.roll(a, dy, axis=0), dx, axis=1)
    return out


def main():
    path, name = sys.argv[1], sys.argv[2]
    a, b = SCENES[name]
    _, s = frames(a, b, gray=True, scale=(GW, GH))
    _, m = rendered(path, a, b, gray=True, scale=(GW, GH))
    n = min(len(s), len(m))
    rng = 12
    rows = []
    for k in range(n):
        S = s[k].astype(np.float32)
        M = m[k].astype(np.float32)
        best, bd = 1e18, (0, 0)
        for dy in range(-rng, rng + 1):
            for dx in range(-rng, rng + 1):
                e = np.abs(S - shift1(M, dx, dy)).mean()
                if e < best:
                    best, bd = e, (dx, dy)
        rows.append((a + k, bd[0] * MX, bd[1] * MY, best,
                     float(np.abs(S - M).mean())))
    base = np.mean([r[4] for r in rows])
    opt = np.mean([r[3] for r in rows])
    print(f"{name}: {base:.2f} -> {opt:.2f} apres recalage par image "
          f"({100*(base-opt)/base:.1f}% de l'erreur etait un simple decalage)")
    print(f"  dx median {np.median([r[1] for r in rows]):+.0f}  "
          f"dy median {np.median([r[2] for r in rows]):+.0f}")
    print("\nRESIDUAL table [frame, dx, dy] (master px), lisse sur 3 images :")
    dxs = np.convolve([r[1] for r in rows], np.ones(3) / 3, mode="same")
    dys = np.convolve([r[2] for r in rows], np.ones(3) / 3, mode="same")
    out = "".join(f"[{rows[i][0]},{dxs[i]:.0f},{dys[i]:.0f}],"
                  for i in range(0, len(rows), 2))
    print("[" + out + "]")


if __name__ == "__main__":
    main()
