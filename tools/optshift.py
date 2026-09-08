"""Find each scene's optimal residual translation by direct search.

Phase correlation locks onto the wrong peak on periodic structures (a wall of
identical cards) and on large flat shapes (the folder). Shifting the rendered
frames numerically and scoring every candidate is unambiguous, and needs no
re-render: the search runs on frames already decoded.
"""
import sys
import numpy as np
from lib import frames, rendered

SCENES = [("radar", 4, 62), ("horloge", 70, 106), ("navigateur", 112, 170),
          ("texte", 184, 232), ("parcours", 240, 372), ("cartes", 380, 472),
          ("dossier", 480, 542), ("logo", 548, 588), ("domaines", 594, 627),
          ("enveloppes", 633, 660), ("agenda", 666, 746), ("simple", 753, 770)]

SX, SY = 1920 / 720, 1080 / 405


def shift(a, dx, dy):
    """Shift a stack by integer panel pixels, edge-padded."""
    out = np.roll(a, dy, axis=1)
    out = np.roll(out, dx, axis=2)
    if dy > 0:
        out[:, :dy] = out[:, dy:dy + 1]
    elif dy < 0:
        out[:, dy:] = out[:, dy - 1:dy]
    if dx > 0:
        out[:, :, :dx] = out[:, :, dx:dx + 1]
    elif dx < 0:
        out[:, :, dx:] = out[:, :, dx - 1:dx]
    return out


def main(path, rng=14):
    print(f"{'scene':12s} {'actuel':>8} {'meilleur':>9} {'dx':>6} {'dy':>6}   (master px)")
    for nm, a, b in SCENES:
        _, s = frames(a, b, gray=True, scale=(360, 202))
        _, m = rendered(path, a, b, gray=True, scale=(360, 202))
        n = min(len(s), len(m))
        S = s[:n].astype(np.float32)
        M = m[:n].astype(np.float32)
        base = np.abs(S - M).mean()
        best, bdx, bdy = base, 0, 0
        for dy in range(-rng, rng + 1, 2):
            for dx in range(-rng, rng + 1, 2):
                e = np.abs(S - shift(M, dx, dy)).mean()
                if e < best:
                    best, bdx, bdy = e, dx, dy
        # 360x202 grid -> master is 1920/360 = 5.333x
        print(f"{nm:12s} {base:8.2f} {best:9.2f} {bdx*1920/360:+6.0f} "
              f"{bdy*1080/202:+6.0f}")


if __name__ == "__main__":
    main(sys.argv[1])
