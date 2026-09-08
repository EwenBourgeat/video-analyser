"""Score a render against the source: global and per scene."""
import sys, numpy as np
sys.path.insert(0, "/Users/ewenbourgeat/Documents/video-analyser/tools")
from lib import frames, rendered

SCENES = [("1 radar",0,66),("2 horloge",66,109),("3 navigateur",109,175),
          ("4 texte passe",181,235),("5 parcours",235,376),("6 cartes",376,476),
          ("7 dossier",476,545),("8 logo",545,591),("9 domaines",591,630),
          ("10 enveloppes",630,663),("11 agenda",663,750),("11b simple",750,773)]
FLOOR = {"1 radar":0.88,"2 horloge":0.73,"3 navigateur":0.99,"4 texte passe":1.25,
         "5 parcours":1.99,"6 cartes":3.01,"7 dossier":0.71,"8 logo":0.19,
         "9 domaines":1.48,"10 enveloppes":0.32,"11 agenda":2.45,"11b simple":0.26}

def score(path, verbose=True):
    _, src = frames(0, 776, scale=(240, 135))
    _, mine = rendered(path, 0, 776, scale=(240, 135))
    n = min(len(src), len(mine))
    d = np.abs(src[:n].astype(np.float32) - mine[:n].astype(np.float32)).mean(axis=(1, 2, 3))
    if verbose:
        print(f"{'scene':16s} {'ecart':>7} {'plancher':>9} {'marge':>7}")
        for nm, a, b in SCENES:
            m = d[a:b].mean()
            print(f"{nm:16s} {m:7.2f} {FLOOR[nm]:9.2f} {m - FLOOR[nm]:7.2f}")
        print(f"\nGLOBAL {d.mean():6.2f}/255 = {100*d.mean()/255:5.2f}%"
              f"   (plancher 1.50 = 0.59%)")
    return d

if __name__ == "__main__":
    score(sys.argv[1])
