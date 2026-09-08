"""Trace the white connector curve of beat 5 and rebuild it in world space.

For each frame, scan every column for the thin bright stroke and take its centre.
Adding the known camera displacement turns each sample into a world coordinate;
averaging over 140 frames gives a curve far more accurate than the hand-placed
Bezier I had been using.
"""
import numpy as np
import cv2
from lib import frames, SX, SY

F0, F1 = 236, 376

# measured camera displacement of beat 5 (trapezoidal profile, Journey.tsx)
PAN = [[236,-14],[240,0],[244,27],[248,66],[252,114],[256,174],[260,243],[264,321],
       [268,406],[272,498],[276,596],[280,700],[284,808],[288,919],[292,1033],
       [296,1149],[300,1266],[304,1384],[308,1500],[312,1603],[316,1706],[320,1817],
       [324,1923],[328,2024],[332,2121],[336,2211],[340,2292],[344,2367],[348,2432],
       [352,2488],[356,2533],[360,2568],[364,2589],[368,2600],[376,2610]]


def cam(f):
    xs = [p[0] for p in PAN]
    ys = [p[1] for p in PAN]
    return float(np.interp(f, xs, ys))


def main():
    idx, fr = frames(F0, F1)
    samples = {}
    for k, f in enumerate(idx):
        g = cv2.cvtColor(fr[k], cv2.COLOR_RGB2GRAY).astype(np.float32)
        # the connector is a thin bright ridge; the tiles are big bright blobs, so
        # only accept columns whose bright run is a few pixels tall
        for x in range(0, g.shape[1], 2):
            col = g[:, x]
            bright = np.where(col > 150)[0]
            if len(bright) == 0 or len(bright) > 14:
                continue
            # reject if the run touches the very top/bottom (labels, tiles)
            runs = np.split(bright, np.where(np.diff(bright) > 1)[0] + 1)
            runs = [r for r in runs if 1 <= len(r) <= 7]
            if len(runs) != 1:
                continue
            y = runs[0].mean()
            wx = x * SX + cam(f)
            samples.setdefault(int(wx // 20) * 20, []).append(y * SY)

    keys = sorted(samples)
    print(f"{len(keys)} points de courbe en coordonnees monde\n")
    print("courbe (x monde, y monde, n echantillons, ecart-type):")
    pts = []
    for kx in keys:
        v = samples[kx]
        if len(v) < 3:
            continue
        med = float(np.median(v))
        sd = float(np.std(v))
        if sd > 40:
            continue
        pts.append((kx, med, len(v), sd))
    for p in pts[::6]:
        print(f"  x={p[0]:6d}  y={p[1]:7.1f}  n={p[2]:3d}  sd={p[3]:5.1f}")
    print("\nPATH_PTS (echantillonne tous les 60 px monde) :")
    out = [p for p in pts if p[0] % 60 == 0]
    print("[" + "".join(f"[{p[0]},{p[1]:.0f}]," for p in out) + "]")


if __name__ == "__main__":
    main()
