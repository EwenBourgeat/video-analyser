"""Re-measurement after finding the decode bug.

ffmpeg's crop=720:405 on yuv420p actually emits 404 rows. Batch decodes that
assumed 405 drifted one row per frame, which silently corrupted every vertical
measurement (and invented a "vertical camera pan" in the journey scene that does
not exist). Horizontal measurements were unaffected.

Everything here decodes at 720x404 and is therefore aligned.
"""
import subprocess
import numpy as np

V = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
Wp, Hp = 720, 404
SX, SY = 1920 / 720, 1080 / 405   # the band is 405 rows tall in master terms


def dec(n0, n1):
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", V, "-vf",
         f"crop=720:404:0:437,select='between(n\\,{n0}\\,{n1 - 1})'", "-vsync", "0",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True)
    b = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(b) // (Wp * Hp * 3)
    assert n == n1 - n0, f"frame count mismatch: {n} vs {n1 - n0}"
    return np.arange(n0, n0 + n), b[: n * Wp * Hp * 3].reshape(n, Hp, Wp, 3).astype(int)


print("=== clock centre/radius, text band masked (beats 2-3) ===")
idx, fr = dec(56, 175)
for k in range(0, len(idx), 4):
    a = fr[k].copy()
    a[: int(300 / SY), :, :] = 255
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    m = (b_ > r_ + 45) & (b_ > 150) & (r_ < 215)
    ys, xs = np.where(m)
    if len(xs) < 300:
        print(f"  f={idx[k]:3d}  (none)")
        continue
    x0, x1 = xs.min(), xs.max()
    rad = (x1 - x0) / 2
    print(f"  f={idx[k]:3d} cx={(x0 + x1) / 2 * SX:7.1f} "
          f"cy={(ys.min() + rad) * SY:7.1f} r={rad * SX:7.1f}")

print("\n=== browser page rect ===")
idx, fr = dec(109, 175)
for k in range(0, len(idx), 3):
    a = fr[k]
    page = a.min(2) > 225
    rows = np.where(page.sum(1) > 20)[0]
    cols = np.where(page.sum(0) > 20)[0]
    if len(rows) < 2:
        print(f"  f={idx[k]:3d} none")
        continue
    print(f"  f={idx[k]:3d} y {rows.min()*SY:6.0f}..{rows.max()*SY:6.0f}  "
          f"x {cols.min()*SX:6.0f}..{cols.max()*SX:6.0f}  w={(cols.max()-cols.min())*SX:6.0f}")

print("\n=== journey tiles: blue glyph centroids ===")
idx, fr = dec(236, 376)
for k in range(0, len(idx), 4):
    a = fr[k]
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    m = (b_ > r_ + 70) & (b_ > 170) & (r_ < 140)
    cols = np.where(m.sum(0) > 0)[0]
    if len(cols) == 0:
        print(f"  f={idx[k]:3d} -")
        continue
    runs, s, p = [], cols[0], cols[0]
    for c in cols[1:]:
        if c - p > 6:
            runs.append((s, p))
            s = c
        p = c
    runs.append((s, p))
    out = []
    for c0, c1 in runs:
        sub = m[:, c0:c1 + 1]
        if sub.sum() < 120:
            continue
        ys, xs = np.where(sub)
        out.append(f"({(c0 + xs.mean()) * SX:.0f},{ys.mean() * SY:.0f})w{(c1 - c0) * SX:.0f}")
    print(f"  f={idx[k]:3d} {' '.join(out) if out else '-'}")

print("\n=== folder top edge ===")
idx, fr = dec(476, 546)
for k in range(0, len(idx), 4):
    a = fr[k]
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    m = (b_ > r_ + 40) & (b_ > 150) & (g_ > 90)
    cols = np.where(m.sum(0) > 2)[0]
    if len(cols) < 2:
        print(f"  f={idx[k]:3d} -")
        continue
    x0, x1 = cols.min(), cols.max()

    def topat(fx):
        c = int(x0 + (x1 - x0) * fx)
        col = np.where(m[:, c])[0]
        return col.min() * SY if len(col) else float('nan')

    print(f"  f={idx[k]:3d} x {x0*SX:6.0f}..{x1*SX:6.0f} w={(x1-x0)*SX:6.0f}  "
          f"top20={topat(.2):6.0f} top50={topat(.5):6.0f}")
