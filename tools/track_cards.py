"""Track every business card of beat 6 individually.

The cards are bright rounded rectangles on a dark backdrop, so connected
components on a brightness threshold isolate them; minAreaRect then gives the
centre, size and Z rotation of each. Components are linked across frames by
nearest centroid so each card gets a continuous trajectory, which is baked into
a keyframe table per card.

This replaces the hand-guessed grid that made beat 6 the worst scene by far
(30.2% mean error against 2-7% everywhere else).
"""
import json
import numpy as np
import cv2
from lib import frames, SX, SY

F0, F1 = 374, 477


def detect(img):
    """Bright card rectangles in one panel frame -> list of (cx, cy, w, h, ang)."""
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    _, bw = cv2.threshold(g, 170, 255, cv2.THRESH_BINARY)
    bw = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, stats, cent = cv2.connectedComponentsWithStats(bw, 8)
    out = []
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if area < 1200:
            continue
        # a card is far wider than tall; reject merged blobs and slivers
        if w < 55 or h < 30:
            continue
        m = (lab == i).astype(np.uint8)
        cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        (rcx, rcy), (rw, rh), ang = cv2.minAreaRect(cnts[0])
        if rw < rh:
            rw, rh, ang = rh, rw, ang + 90
        if ang > 90:
            ang -= 180
        # the card aspect is ~1.63; reject anything far from it (merged pairs)
        if not (1.15 < rw / max(rh, 1) < 2.35):
            continue
        fill = area / max(rw * rh, 1)
        if fill < 0.72:
            continue
        out.append(dict(cx=rcx, cy=rcy, w=rw, h=rh, ang=ang, area=float(area)))
    return out


def main():
    idx, fr = frames(F0, F1)
    tracks = []           # each: {"pts": {frame: det}, "last": det}
    for k, f in enumerate(idx):
        dets = detect(fr[k])
        used = set()
        for t in tracks:
            if t["lastf"] < f - 3:
                continue
            best, bd = None, 1e9
            for j, d in enumerate(dets):
                if j in used:
                    continue
                dist = np.hypot(d["cx"] - t["last"]["cx"], d["cy"] - t["last"]["cy"])
                sz = abs(d["w"] - t["last"]["w"]) / max(t["last"]["w"], 1)
                if dist < 46 and sz < 0.3 and dist < bd:
                    best, bd = j, dist
            if best is not None:
                used.add(best)
                t["pts"][int(f)] = dets[best]
                t["last"] = dets[best]
                t["lastf"] = f
        for j, d in enumerate(dets):
            if j not in used:
                tracks.append({"pts": {int(f): d}, "last": d, "lastf": f, "first": int(f)})

    tracks = [t for t in tracks if len(t["pts"]) >= 8]
    tracks.sort(key=lambda t: t["first"])
    print(f"{len(tracks)} card tracks over f{F0}-{F1}\n")
    print(f"{'#':>2} {'first':>6} {'last':>5} {'n':>4}  {'w(master)':>10} {'ang':>6}   trajectory (master)")
    export = []
    for i, t in enumerate(tracks):
        fs = sorted(t["pts"])
        ws = np.mean([t["pts"][f]["w"] for f in fs]) * SX
        angs = np.median([t["pts"][f]["ang"] for f in fs])
        head = " ".join(
            f"f{f}:({t['pts'][f]['cx']*SX:.0f},{t['pts'][f]['cy']*SY:.0f})"
            for f in fs[:: max(1, len(fs) // 4)][:4])
        print(f"{i:2d} {fs[0]:6d} {fs[-1]:5d} {len(fs):4d}  {ws:10.0f} {angs:6.1f}   {head}")
        export.append({
            "first": fs[0], "last": fs[-1],
            "w": round(ws, 1), "h": round(np.mean([t["pts"][f]["h"] for f in fs]) * SY, 1),
            "ang": round(float(angs), 2),
            "kf": [[f, round(t["pts"][f]["cx"] * SX, 1), round(t["pts"][f]["cy"] * SY, 1),
                    round(t["pts"][f]["ang"], 2)] for f in fs],
        })
    json.dump(export, open("/Users/ewenbourgeat/Documents/video-analyser/ref/cards_tracks.json", "w"))
    print("\nwritten: ref/cards_tracks.json")


if __name__ == "__main__":
    main()
