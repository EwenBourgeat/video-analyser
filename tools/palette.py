"""Per-scene palette extraction from the 16:9 content band.

For each scene we sample a few frames, quantise to a coarse RGB grid, and report
the most frequent buckets plus the most saturated one (the brand blue).
"""
import subprocess, io, colorsys
import numpy as np
from PIL import Image

VIDEO = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
BAND_Y, BAND_H = 437, 405

SCENES = [
    ("01 radar",            0.2,  1.8),
    ("02 clock+text",       2.0,  3.5),
    ("03 browser",          3.8,  5.9),
    ("04 texte passe",      6.2,  7.7),
    ("05 parcours 5 etapes",8.0, 12.0),
    ("06 cartes visite",   12.3, 15.7),
    ("07 dossier bleu",    16.0, 18.1),
    ("08 logo scalead",    18.3, 21.2),
    ("09 domaines",        21.5, 23.1),
    ("10 enveloppes",      23.3, 24.2),
    ("11 agenda+curseur",  24.5, 25.7),
    ("13 stat cards",      26.0, 27.6),
    ("14 dashboard",       27.8, 31.1),
    ("15 gmail",           31.4, 33.9),
    ("16 mail ouvert",     34.1, 35.1),
    ("17 sequences+KPI",   35.3, 38.3),
    ("18 funnel avatars",  38.6, 43.4),
    ("19 visio",           43.7, 46.5),
    ("20 fiche contact",   46.7, 48.0),
    ("21 bulles chat",     48.2, 50.9),
    ("22 agenda plein",    51.1, 52.4),
    ("23 graphe 206",      52.6, 55.3),
    ("24 90 clients",      55.5, 56.5),
    ("25 10500 leads",     56.7, 58.5),
    ("26 garantie",        58.7, 59.6),
    ("27 CTA texte",       59.8, 63.9),
    ("28 logo final",      64.2, 67.4),
]


def frames(t0, t1, n=5):
    out = []
    for t in np.linspace(t0, t1, n):
        raw = subprocess.run(
            ["ffmpeg", "-v", "error", "-ss", f"{t:.4f}", "-i", VIDEO,
             "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
            capture_output=True, check=True).stdout
        a = np.asarray(Image.open(io.BytesIO(raw)).convert("RGB"))
        out.append(a[BAND_Y:BAND_Y + BAND_H, :, :])
    return np.concatenate([f.reshape(-1, 3) for f in out], axis=0)


def hexs(c):
    return "#%02X%02X%02X" % tuple(int(v) for v in c)


def sat(c):
    r, g, b = [v / 255 for v in c]
    return colorsys.rgb_to_hsv(r, g, b)[1]


for name, t0, t1 in SCENES:
    px = frames(t0, t1)
    q = ((px // 16) * 16 + 8).astype(np.int64)   # 16-level per channel
    keys = q[:, 0] * 65536 + q[:, 1] * 256 + q[:, 2]
    uniq, counts = np.unique(keys, return_counts=True)
    order = np.argsort(counts)[::-1]
    top = []
    for i in order[:6]:
        k = uniq[i]
        c = ((k >> 16) & 255, (k >> 8) & 255, k & 255)
        top.append((hexs(c), 100 * counts[i] / len(px)))
    # most saturated bucket holding at least 0.15% of pixels
    best, bs = None, 0
    for i in order[:400]:
        k = uniq[i]
        c = ((k >> 16) & 255, (k >> 8) & 255, k & 255)
        if counts[i] / len(px) < 0.0015:
            continue
        s = sat(c)
        if s > bs:
            bs, best = s, hexs(c)
    line = "  ".join(f"{h}({p:4.1f}%)" for h, p in top)
    print(f"{name:22s} {line}   | accent={best}")
