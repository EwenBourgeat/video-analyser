"""Coordinate-descent search of the scene tunables against the source.

Renders a short frame range with `--props`, scores it against the aligned
source, and walks each parameter to its minimum. A 20-frame render takes ~3 s
with the bundle cached, so a few hundred evaluations is minutes, not hours —
far more reliable than my eyeballing side-by-side panels.
"""
import json
import os
import subprocess
import sys
import numpy as np
from lib import frames, rendered

REPO = "/Users/ewenbourgeat/Documents/video-analyser/repro"
OUT = os.path.join(REPO, "out", "_opt.mp4")

# scene -> (frame range to score, parameters to search with their step ladders)
SPECS = {
    "clock": ((66, 172), {
        "clkA": [0.5, 0.9, 1.3, 1.8, 2.4, 3.2], "clkB": [0.0, 0.15, 0.35, 0.7, 1.15],
        "clkSec": [1.4, 2.0, 2.6, 3.4], "clkSlices": [3, 5, 7, 11],
    }),
    "cards": ((380, 472), {
        "cardW": [600, 622, 645, 668, 690], "cardH": [386, 397, 408, 420, 432],
        "cardR": [8, 12, 16, 22, 30], "cardShadow": [0.05, 0.12, 0.2, 0.3],
        "cardAvatar": [118, 126, 134, 142, 152], "cardAvatarY": [0.20, 0.23, 0.257, 0.29],
        "cardNameSize": [29, 32, 35, 38, 41], "cardNameY": [0.40, 0.43, 0.46, 0.49],
        "cardRoleSize": [20, 23, 26, 29], "cardFootSize": [18, 20, 22, 25],
        "cardDX": [-18, -9, 0, 9, 18], "cardDY": [-20, -10, 0, 10, 20],
    }),
    "journey": ((240, 372), {
        "jTile": [180, 196, 212, 228, 244], "jTileR": [30, 40, 52, 64],
        "jGlow": [15, 30, 50, 70, 95], "jLabel": [56, 62, 68, 74, 80],
        "jLabelDX": [-70, -35, 0, 35, 70], "jLabelDY": [-70, -35, 0, 35, 70],
        "jGhost": [200, 250, 300, 360], "jGhostOp": [0.015, 0.03, 0.05, 0.08],
        "jStroke": [3, 4, 5, 6, 8],
    }),
    "logo": ((548, 588), {
        "logoMark": [190, 225, 260, 300, 340], "logoCX": [880, 920, 960, 1000],
        "logoCY": [455, 500, 545, 590, 640],
        "logoH1": [440, 500, 560, 630, 710], "logoH2": [130, 175, 220, 270, 330],
        "logoH3": [60, 90, 125, 165, 210],
        "logoWord": [50, 58, 66, 74, 82], "logoWordY": [680, 730, 780, 830, 880],
    }),
    "domains": ((594, 627), {
        "domHubX": [1230, 1300, 1375, 1450], "domHubY": [460, 500, 540, 580],
        "domMark": [170, 200, 230, 260, 295], "domH1": [400, 470, 540, 600, 670],
        "domPillX": [-30, 0, 30, 60, 95], "domPillW": [700, 760, 820, 880],
        "domPillH": [88, 100, 112, 124], "domPillGap": [4, 10, 18, 26],
        "domFont": [28, 32, 36, 40, 44], "domTick": [48, 58, 68, 78, 88],
    }),
    "agenda": ((666, 746), {
        "agDX": [-429, -354, -279, -204, -129], "agDY": [-107, -62, -17, 28, 73],
        "agZoom": [0.82, 0.9, 1.0, 1.1, 1.2], "agFont": [50, 58, 66, 74],
        "agTime": [76, 86, 96, 106], "agRowH": [140, 160, 182, 205],
        "agRadius": [12, 20, 30, 42],
    }),
    "folder": ((480, 542), {
        "foDX": [-50, -20, 10, 40, 70], "foDY": [-60, -30, 0, 30, 60],
        "foFront": [220, 260, 310, 370, 430], "foTab": [46, 57, 68, 80, 94],
        "foText": [155, 185, 215, 250, 290],
    }),
    "envelopes": ((633, 660), {
        "envHubX": [420, 470, 518, 570, 620], "envScale": [1.0, 1.15, 1.35, 1.55],
        "envSpread": [0.7, 0.85, 1.0, 1.2],
        "envDX": [-200, -100, 0, 100, 200], "envDY": [40, 120, 200, 280, 360],
    }),
    "radar": ((4, 62), {
        "radarDiscA": [0.15, 0.3, 0.45, 0.6, 0.75], "radarDiscB": [0.15, 0.3, 0.45, 0.6, 0.75],
        "radarRingOp": [0.05, 0.12, 0.2, 0.3, 0.42],
        "radarDotR": [6, 8, 10, 12, 15], "radarDotWhite": [12, 16, 20, 24, 28],
        "radarSweepOp": [0.15, 0.4, 0.7, 1.0],
    }),
}


def render(props, a, b):
    subprocess.run(
        ["npx", "remotion", "render", "src/index.ts", "Scalead", OUT,
         f"--frames={2*a}-{2*b - 1}", "--props", json.dumps(props), "--log=error"],
        cwd=REPO, check=True, capture_output=True)


def score(props, a, b, src):
    render(props, a, b)
        # the render is 60 fps; take every other frame to line it up with the source
    _, m2 = rendered(OUT, 0, 2 * (b - a), gray=True, scale=(360, 202))
    m = m2[::2]
    n = min(len(src), len(m))
    return float(np.abs(src[:n].astype(np.float32) - m[:n].astype(np.float32)).mean())


def main():
    which = sys.argv[1:] or list(SPECS)
    best_all = {}
    if os.path.exists("/Users/ewenbourgeat/Documents/video-analyser/ref/tuned.json"):
        best_all = json.load(open("/Users/ewenbourgeat/Documents/video-analyser/ref/tuned.json"))
    for name in which:
        (a, b), grid = SPECS[name]
        _, src = frames(a, b, gray=True, scale=(360, 202))
        props = dict(best_all)
        base = score(props, a, b, src)
        print(f"\n=== {name}  f{a}-{b}  depart {base:.3f} ===")
        cur = base
        for rounds in range(2):
            improved = False
            for k, vals in grid.items():
                trials = []
                for v in vals:
                    p = dict(props)
                    p[k] = v
                    e = score(p, a, b, src)
                    trials.append((e, v))
                e, v = min(trials)
                if e < cur - 1e-4:
                    print(f"  {k:14s} -> {v:<8} {cur:.3f} -> {e:.3f}")
                    props[k] = v
                    cur = e
                    improved = True
            if not improved:
                break
        print(f"  {name}: {base:.3f} -> {cur:.3f}  ({100*(base-cur)/base:.1f}% mieux)")
        best_all.update(props)
        json.dump(best_all, open("/Users/ewenbourgeat/Documents/video-analyser/ref/tuned.json", "w"), indent=1)
    print("\nparametres retenus:")
    print(json.dumps(best_all, indent=1))


if __name__ == "__main__":
    main()
