"""Side-by-side comparison: source (left) vs reproduction (right), same frame index.

Usage: compare.py <mine.mp4> <outdir> [f1 f2 f3 ...]
Both videos are sampled at the SAME source frame number, so any difference is a
real difference and not a timing offset introduced by the tool.
"""
import subprocess, io, sys, os
import numpy as np
from PIL import Image, ImageDraw

SRC = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
BAND = "crop=720:405:0:437"
PANEL_W, PANEL_H = 720, 405


def grab(video, n, crop=None):
    vf = f"select='eq(n\\,{n})'"
    if crop:
        vf = f"{crop},{vf}"
    else:
        vf = f"{vf},scale={PANEL_W}:{PANEL_H}"
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", video, "-vf", vf, "-vsync", "0",
         "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True, check=True)
    if not p.stdout:
        return None
    return Image.open(io.BytesIO(p.stdout)).convert("RGB").resize((PANEL_W, PANEL_H))


def main():
    mine = sys.argv[1]
    outdir = sys.argv[2]
    frames = [int(x) for x in sys.argv[3:]]
    os.makedirs(outdir, exist_ok=True)

    # 3 comparisons stacked per sheet keeps each image readable
    per_sheet = 3
    sheets = [frames[i:i + per_sheet] for i in range(0, len(frames), per_sheet)]
    for si, group in enumerate(sheets):
        rows = len(group)
        sheet = Image.new("RGB", (PANEL_W * 2 + 12, (PANEL_H + 26) * rows), "#1a1a1a")
        d = ImageDraw.Draw(sheet)
        for ri, n in enumerate(group):
            a = grab(SRC, n, BAND)
            b = grab(mine, n)
            y = ri * (PANEL_H + 26) + 26
            if a:
                sheet.paste(a, (0, y))
            if b:
                sheet.paste(b, (PANEL_W + 12, y))
            d.text((6, y - 20), f"f={n}  t={n/30:.3f}s      SOURCE", fill="#ffffff")
            d.text((PANEL_W + 18, y - 20), "REPRODUCTION", fill="#7fd1ff")
        path = os.path.join(outdir, f"cmp_{si:02d}.png")
        sheet.save(path)
        print(path, "frames:", group)


if __name__ == "__main__":
    main()
