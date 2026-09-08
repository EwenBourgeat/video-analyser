"""Write the searched parameters back into src/tunables.ts as new defaults.

Parameters listed in KEEP_MEASURED are never overwritten: those were measured
directly off the source, and the MAE metric will happily shrink text below its
true size because less ink scores better when the position is slightly off. The
search is trusted for geometry it cannot cheat on, not for quantities I already
know.
"""
import json
import re

TUNED = "/Users/ewenbourgeat/Documents/video-analyser/ref/tuned.json"
SRC = "/Users/ewenbourgeat/Documents/video-analyser/repro/src/tunables.ts"

KEEP_MEASURED = {
    "cardW", "cardH",          # 645 x 397 read off f=440
    "cardNameSize", "cardRoleSize", "cardFootSize",
    "jTile",                   # 203-219 measured across the five tiles
}


def main():
    tuned = json.load(open(TUNED))
    s = open(SRC).read()
    applied, skipped = [], []
    for k, v in tuned.items():
        if k in KEEP_MEASURED:
            skipped.append(k)
            continue
        pat = re.compile(rf"(\b{k}:\s*)(-?[\d.]+)")
        if not pat.search(s):
            skipped.append(k + "(?)")
            continue
        s = pat.sub(lambda m: m.group(1) + str(v), s, count=1)
        applied.append(f"{k}={v}")
    open(SRC, "w").write(s)
    print("applique :", ", ".join(applied))
    print("conserve (mesure directe) :", ", ".join(skipped))


if __name__ == "__main__":
    main()
