"""Round-2 measurements to correct the deviations found in iteration 1.

A. radar outer radius, every frame (my easeOutQuint fit was far too fast)
B. clock radius/centre, excluding the blue text band that contaminated round 1
C. final width of the beat-2 line (to set the font size)
D. screen x of the journey tiles (to calibrate the pan offset)
"""
import subprocess
import numpy as np

V = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
CROP = "crop=720:405:0:437"
SX, SY = 1920 / 720, 1080 / 405


def dec(n0, n1, w=720, h=405):
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", V, "-vf",
         f"{CROP},select='between(n\\,{n0}\\,{n1 - 1})'", "-vsync", "0",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True)
    b = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(b) // (w * h * 3)
    return np.arange(n0, n0 + n), b[: n * w * h * 3].reshape(n, h, w, 3).astype(int)


print("=== A. radar outer radius per frame (master px) ===")
idx, fr = dec(0, 60)
vals = []
for k, f in enumerate(idx):
    a = fr[k]
    ink = a.min(2) < 248
    cols = np.where(ink.sum(0) > 3)[0]
    r = (cols.max() - cols.min()) / 2 * SX if len(cols) > 2 else float('nan')
    vals.append(r)
print("RADAR_R = [")
for k in range(0, len(idx)):
    if k % 2 == 0:
        print(f"  [{idx[k]}, {vals[k]:.0f}],", end="")
        if k % 8 == 6:
            print()
print("\n]")

print("\n=== A2. radar dot count per frame ===")
for k in range(0, len(idx), 3):
    a = fr[k]
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    m = (b_ > r_ + 60) & (b_ > 170) & (r_ < 150)
    # crude blob count via row/col runs
    n = int(m.sum())
    print(f"  f={idx[k]:3d} bluepx={n:5d}")

print("\n=== B. clock radius / centre (text band excluded) ===")
idx, fr = dec(56, 175)
for k in range(0, len(idx), 4):
    a = fr[k].copy()
    a[: int(300 / SY), :, :] = 255          # blank the top text band
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    m = (b_ > r_ + 45) & (b_ > 150) & (r_ < 215)
    ys, xs = np.where(m)
    if len(xs) < 300:
        print(f"  f={idx[k]:3d}  (none)")
        continue
    x0, x1 = xs.min(), xs.max()
    cx = (x0 + x1) / 2 * SX
    rad = (x1 - x0) / 2 * SX
    y0 = ys.min()
    cy = (y0 + (x1 - x0) / 2) * SY
    print(f"  f={idx[k]:3d} t={idx[k]/30:6.3f}  cx={cx:7.1f} cy={cy:7.1f} r={rad:7.1f}")

print("\n=== C. beat-2 line: final ink extent in the top band ===")
idx, fr = dec(95, 108)
for k in range(0, len(idx), 4):
    a = fr[k]
    band = a[int(120 / SY):int(300 / SY), :, :]
    ink = band.min(2) < 170
    cols = np.where(ink.sum(0) > 0)[0]
    rows = np.where(ink.sum(1) > 0)[0]
    print(f"  f={idx[k]:3d} x {cols.min()*SX:6.0f}..{cols.max()*SX:6.0f} "
          f"(w={(cols.max()-cols.min())*SX:6.0f})  y {(rows.min()+int(120/SY))*SY:5.0f}"
          f"..{(rows.max()+int(120/SY))*SY:5.0f} (h={(rows.max()-rows.min())*SY:4.0f})")

print("\n=== D. journey tiles: screen x of the white icon tiles ===")
idx, fr = dec(236, 376)
for k in range(0, len(idx), 5):
    a = fr[k]
    mn = a.min(2)
    bright = mn > 232
    # tiles are compact bright blobs; collapse to column profile
    prof = bright.sum(0)
    cols = np.where(prof > 14)[0]
    if len(cols) == 0:
        print(f"  f={idx[k]:3d}  -")
        continue
    groups, start, prev = [], cols[0], cols[0]
    for c in cols[1:]:
        if c - prev > 8:
            groups.append((start, prev))
            start = c
        prev = c
    groups.append((start, prev))
    gs = [f"{(g[0]+g[1])/2*SX:.0f}(w{(g[1]-g[0])*SX:.0f})" for g in groups if g[1] - g[0] > 8]
    print(f"  f={idx[k]:3d} t={idx[k]/30:6.3f}  tiles@ {' '.join(gs)}")
