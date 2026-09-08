"""Numeric motion tracking, to recover real easing curves instead of guessing.

Track A : the browser-window white card (scene 3) -> bounding box per frame.
Track B : the radar rings (scene 1)              -> outer radius per frame.
Track C : horizontal camera pan (scene 5)        -> phase-correlation shift.
"""
import subprocess, sys
import numpy as np

VIDEO = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
CROP = "crop=720:405:0:437"
FPS = 30


def decode(t0, t1, w=360, h=203):
    """All frames in [t0,t1) as float arrays, plus their frame indices."""
    n0, n1 = int(round(t0 * FPS)), int(round(t1 * FPS))
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", VIDEO, "-vf",
         f"{CROP},scale={w}:{h},select='between(n\\,{n0}\\,{n1 - 1})'",
         "-vsync", "0", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        capture_output=True, check=True)
    buf = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(buf) // (w * h)
    return np.arange(n0, n0 + n), buf[: n * w * h].reshape(n, h, w).astype(float)


def report(name, idx, vals, unit=""):
    print(f"\n--- {name} ---")
    v0, v1 = vals[0], vals[-1]
    span = v1 - v0
    print(f"  t={idx[0]/FPS:.3f}s -> {idx[-1]/FPS:.3f}s   {v0:.1f} -> {v1:.1f}{unit}")
    if abs(span) < 1e-6:
        return
    print(f"  {'t':>7} {'f':>5} {'value':>9} {'progress':>9}")
    for k in range(0, len(idx), max(1, len(idx) // 14)):
        p = (vals[k] - v0) / span
        print(f"  {idx[k]/FPS:7.3f} {idx[k]:5d} {vals[k]:9.2f} {p:9.3f}")
    # fit against standard eases on normalised progress
    tt = (idx - idx[0]) / (idx[-1] - idx[0])
    pp = (vals - v0) / span
    cands = {
        "linear":        tt,
        "easeOutQuad":   1 - (1 - tt) ** 2,
        "easeOutCubic":  1 - (1 - tt) ** 3,
        "easeOutQuart":  1 - (1 - tt) ** 4,
        "easeOutQuint":  1 - (1 - tt) ** 5,
        "easeOutExpo":   np.where(tt >= 1, 1, 1 - 2 ** (-10 * tt)),
        "easeInOutCubic": np.where(tt < .5, 4 * tt ** 3, 1 - (-2 * tt + 2) ** 3 / 2),
        "easeInOutQuad": np.where(tt < .5, 2 * tt ** 2, 1 - (-2 * tt + 2) ** 2 / 2),
        "easeInCubic":   tt ** 3,
    }
    best = sorted(((np.sqrt(np.mean((pp - c) ** 2)), k) for k, c in cands.items()))
    print("  best fit: " + ", ".join(f"{k}(rms={e:.4f})" for e, k in best[:3]))


# ---------------------------------------------------------------- Track A
idx, fr = decode(3.70, 6.00)
tops, lefts, widths = [], [], []
for f in fr:
    bright = f > 200                      # the white page area of the browser
    cols = np.where(bright.sum(axis=0) > 8)[0]
    rows = np.where(bright.sum(axis=1) > 8)[0]
    if len(cols) < 2 or len(rows) < 2:
        widths.append(np.nan); tops.append(np.nan); lefts.append(np.nan); continue
    lefts.append(cols.min()); widths.append(cols.max() - cols.min())
    tops.append(rows.min())
w = np.array(widths, float)
ok = ~np.isnan(w)
report("A. browser card width (scene 3 zoom-out)", idx[ok], w[ok], " px/360")

# ---------------------------------------------------------------- Track B
idx, fr = decode(0.05, 1.85)
radii = []
for f in fr:
    ink = f < 246                         # anything not pure white
    cols = np.where(ink.sum(axis=0) > 3)[0]
    radii.append((cols.max() - cols.min()) / 2 if len(cols) > 2 else np.nan)
r = np.array(radii, float)
ok = ~np.isnan(r)
report("B. radar outer radius (scene 1)", idx[ok], r[ok], " px/360")

# ---------------------------------------------------------------- Track C
idx, fr = decode(8.10, 12.00)
shift = [0.0]
for a, b in zip(fr[:-1], fr[1:]):
    A = np.fft.rfft2(a - a.mean()); B = np.fft.rfft2(b - b.mean())
    R = A * np.conj(B)
    R /= np.abs(R) + 1e-9
    c = np.fft.irfft2(R)
    dy, dx = np.unravel_index(np.argmax(c), c.shape)
    if dx > c.shape[1] // 2:
        dx -= c.shape[1]
    shift.append(shift[-1] + dx)
report("C. cumulative horizontal pan (scene 5)", idx, np.array(shift, float), " px/360")
