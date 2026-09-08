"""Sample exact colors at specific (time, x, y) points of the 16:9 content region.

Coordinates are given in the 1920x1080 master space; they are mapped down to the
720x405 encoded band before sampling. A small median window kills JPEG noise.
"""
import subprocess, io, sys
import numpy as np
from PIL import Image

VIDEO = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
BAND_Y, BAND_H, BAND_W = 437, 405, 720
SX, SY = BAND_W / 1920, BAND_H / 1080

_cache = {}


def frame(t):
    if t not in _cache:
        raw = subprocess.run(
            ["ffmpeg", "-v", "error", "-ss", f"{t:.4f}", "-i", VIDEO,
             "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
            capture_output=True, check=True).stdout
        a = np.asarray(Image.open(io.BytesIO(raw)).convert("RGB"))
        _cache[t] = a[BAND_Y:BAND_Y + BAND_H, :, :]
    return _cache[t]


def hexat(t, X, Y, r=2):
    """Median color in a (2r+1)^2 window around master-space (X, Y)."""
    a = frame(t)
    x, y = int(round(X * SX)), int(round(Y * SY))
    x = max(r, min(BAND_W - 1 - r, x))
    y = max(r, min(BAND_H - 1 - r, y))
    patch = a[y - r:y + r + 1, x - r:x + r + 1].reshape(-1, 3)
    c = np.median(patch, axis=0).astype(int)
    return "#%02X%02X%02X" % tuple(c), tuple(int(v) for v in c)


SAMPLES = [
    # (label, t, X, Y)  -- X,Y in 1920x1080 master space
    ("S1 radar white bg",            0.60,   80,   80),
    ("S1 dot blue fill",             0.50, 1000,  470),
    ("S2 clock ring top",            2.60,  960,  330),
    ("S2 clock ring left",           2.60,  520,  700),
    ("S2 clock face",                2.60,  960,  640),
    ("S2 hand black",                2.60,  900,  880),
    ("S2 text blue 'tu'",            3.40,  270,  225),
    ("S2 text black 'de'",           3.40, 1120,  228),
    ("S3 dark bg top-left",          5.00,   60,   60),
    ("S3 dark bg bottom-mid",        5.00,  960, 1040),
    ("S3 browser titlebar",          4.60,  960,  120),
    ("S3 dot red",                   4.60,  392,  122),
    ("S4 text white",                7.30,  700,  545),
    ("S4 text blue 'passé'",         7.30, 1290,  545),
    ("S4 bg mid",                    7.30,  960,  200),
    ("S5 icon tile white",           9.50,  200,  590),
    ("S5 icon glyph blue",          10.90, 1120,  400),
    ("S5 label white",              10.00,  600,  620),
    ("S5 path stroke",               9.60,  620,  650),
    ("S6 card white",               14.20,  500,  480),
    ("S6 card name black",          14.20,  620,  455),
    ("S7 folder top",               16.60,  960,  700),
    ("S7 folder bottom",            16.60,  960, 1050),
    ("S7 text blue 'aucun'",        17.85, 1470,  553),
    ("S8 logo blue",                20.00,  935,  520),
    ("S8 white bg",                 20.00,   60,   60),
    ("S9 check blue",               22.60,  855,  400),
    ("S11 Rejoindre btn L",         25.00,  855,  545),
    ("S11 Rejoindre btn R",         25.00, 1180,  545),
    ("S13 stat card icon",          26.50,  170,  480),
    ("S17 KPI card icon",           36.50, 1460,  380),
    ("S23 graph blue fill",         54.00,  400,  980),
    ("S25 big number blue",         57.60,  480,  500),
    ("S28 CTA button",              66.00,  960,  845),
]

print(f"{'label':28s} {'t':>6}  {'hex':8s} rgb")
for label, t, X, Y in SAMPLES:
    h, rgb = hexat(t, X, Y)
    print(f"{label:28s} {t:6.2f}  {h:8s} {rgb}")
