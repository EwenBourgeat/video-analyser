"""Measure how jerky a rendered file actually is.

Estimates global motion frame to frame by phase correlation, converts it to
px/second so 30 and 60 fps files are comparable, and reports the jerk — the
frame-to-frame change in velocity. That is what the eye reads as a hitch.

Usage: smoothness.py <file.mp4> <fps> [label]
"""
import subprocess
import sys
import numpy as np
import cv2

SCENES_SRC = {
    "parcours": (240, 372), "cartes": (376, 474), "agenda": (666, 748),
    "navigateur": (112, 172), "dossier": (478, 543), "domaines": (593, 628),
}


def load(path, a, b, w=320, h=180):
    vf = f"select='between(n\\,{a}\\,{b - 1})',scale={w}:{h}"
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-vsync", "0",
         "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        capture_output=True, check=True)
    buf = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(buf) // (w * h)
    return buf[: n * w * h].reshape(n, h, w).astype(np.float32)


def main():
    path, fps = sys.argv[1], float(sys.argv[2])
    label = sys.argv[3] if len(sys.argv) > 3 else path
    k = fps / 30.0
    print(f"\n=== {label}  ({fps:.0f} fps) ===")
    print(f"{'scene':12s} {'vitesse max':>12} {'a-coup moyen':>14} {'a-coup max':>12}")
    allj = []
    for nm, (sa, sb) in SCENES_SRC.items():
        a, b = int(sa * k), int(sb * k)
        g = load(path, a, b)
        win = cv2.createHanningWindow((g.shape[2], g.shape[1]), cv2.CV_32F)
        v = []
        for i in range(1, len(g)):
            (dx, dy), _ = cv2.phaseCorrelate(g[i - 1] * win, g[i] * win)
            v.append(np.hypot(dx, dy) * (1920 / 320) * fps)   # px per second
        v = np.array(v)
        jerk = np.abs(np.diff(v)) / fps                        # px/s per frame
        allj.append(jerk)
        print(f"{nm:12s} {v.max():11.0f}p/s {jerk.mean():13.1f} {jerk.max():11.1f}")
    j = np.concatenate(allj)
    print(f"{'TOTAL':12s} {'':12s} {j.mean():13.1f} {j.max():11.1f}")


if __name__ == "__main__":
    main()
