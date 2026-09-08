"""Measure the letterbox / content region of the source TikTok video."""
import subprocess, sys, io
import numpy as np
from PIL import Image

VIDEO = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"


def grab(t):
    """Full-res RGB frame at time t (seconds)."""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(t), "-i", VIDEO,
         "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True, check=True).stdout
    return np.asarray(Image.open(io.BytesIO(raw)).convert("RGB"))


# sample several times spread over the clip; the content band is the union
# of rows that are ever non-black
times = [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65]
rowmax = None
colmax = None
for t in times:
    a = grab(t).astype(np.int16)
    rm = a.max(axis=(1, 2))          # per-row brightest pixel
    cm = a.max(axis=(0, 2))          # per-col brightest pixel
    rowmax = rm if rowmax is None else np.maximum(rowmax, rm)
    colmax = cm if colmax is None else np.maximum(colmax, cm)

THRESH = 24
rows = np.where(rowmax > THRESH)[0]
cols = np.where(colmax > THRESH)[0]
print(f"frame size: {len(rowmax)} rows x {len(colmax)} cols")
print(f"non-black rows: {rows.min()} .. {rows.max()}  (height {rows.max()-rows.min()+1})")
print(f"non-black cols: {cols.min()} .. {cols.max()}  (width  {cols.max()-cols.min()+1})")

# The TikTok comment sticker sits in the upper black area. Find the main
# contiguous band instead: the longest run of consecutive non-black rows.
mask = rowmax > THRESH
runs, start = [], None
for i, v in enumerate(mask):
    if v and start is None:
        start = i
    elif not v and start is not None:
        runs.append((start, i - 1))
        start = None
if start is not None:
    runs.append((start, len(mask) - 1))
runs.sort(key=lambda r: r[1] - r[0], reverse=True)
print("\ntop row-runs (start, end, len):")
for r in runs[:5]:
    print(f"  {r[0]:4d} .. {r[1]:4d}   len={r[1]-r[0]+1}")

y0, y1 = runs[0]
h = y1 - y0 + 1
print(f"\ncontent band: y {y0}..{y1}  height={h}  width=720")
print(f"aspect = 720/{h} = {720/h:.4f}   (16/9 = {16/9:.4f}, 1.85={1.85})")
