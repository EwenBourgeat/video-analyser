"""Residual alignment: how far is each scene systematically off?

Phase-correlates my render against the source frame by frame. A consistent
non-zero offset means the whole scene is translated — the cheapest possible
error to fix, and invisible when eyeballing side-by-side panels.
"""
import sys
import numpy as np
import cv2
from lib import frames, rendered, SX, SY

SCENES = [("1 radar", 4, 62), ("2 horloge", 70, 106), ("3 navigateur", 112, 170),
          ("4 texte passe", 184, 232), ("5 parcours", 240, 372), ("6 cartes", 380, 472),
          ("7 dossier", 480, 542), ("8 logo", 548, 588), ("9 domaines", 594, 627),
          ("10 enveloppes", 633, 660), ("11 agenda", 666, 746), ("11b simple", 753, 770)]


def main(path):
    print(f"{'scene':16s} {'dx median':>10} {'dy median':>10} {'|err| median':>13}")
    for nm, a, b in SCENES:
        _, s = frames(a, b, gray=True)
        _, m = rendered(path, a, b, gray=True)
        n = min(len(s), len(m))
        win = cv2.createHanningWindow((s.shape[2], s.shape[1]), cv2.CV_32F)
        dxs, dys, errs = [], [], []
        for k in range(n):
            A = s[k].astype(np.float32)
            B = m[k].astype(np.float32)
            (dx, dy), r = cv2.phaseCorrelate(A * win, B * win)
            if r > 0.25:
                dxs.append(dx * SX)
                dys.append(dy * SY)
            errs.append(np.abs(A - B).mean())
        if dxs:
            print(f"{nm:16s} {np.median(dxs):+10.1f} {np.median(dys):+10.1f} "
                  f"{np.median(errs):13.1f}")
        else:
            print(f"{nm:16s} {'--':>10} {'--':>10} {np.median(errs):13.1f}")


if __name__ == "__main__":
    main(sys.argv[1])
