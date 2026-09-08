"""Difference heatmaps: where exactly does the reproduction diverge?

Produces, per requested frame, a 3-up sheet [source | mine | signed error] so a
misplaced element is immediately visible as a red/blue dipole (red = mine too
bright there, blue = mine too dark).

Usage: heat.py <mine.mp4> <outdir> f1 f2 ...
"""
import subprocess, io, sys, os
import numpy as np
from PIL import Image, ImageDraw

SRC = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
BAND = "crop=720:404:0:437"
PW, PH = 640, 360


def grab(video, n, crop=None):
    vf = f"select='eq(n\\,{n})'"
    vf = f"{crop},{vf}" if crop else vf
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", video, "-vf", vf, "-vsync", "0",
         "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True, check=True)
    if not p.stdout:
        return None
    return Image.open(io.BytesIO(p.stdout)).convert("RGB").resize((PW, PH), Image.LANCZOS)


def main():
    mine, outdir = sys.argv[1], sys.argv[2]
    frames = [int(x) for x in sys.argv[3:]]
    os.makedirs(outdir, exist_ok=True)

    per = 2
    for si in range(0, len(frames), per):
        group = frames[si:si + per]
        sheet = Image.new("RGB", (PW * 3 + 16, (PH + 24) * len(group)), "#111111")
        d = ImageDraw.Draw(sheet)
        for ri, n in enumerate(group):
            a = grab(SRC, n, BAND)
            b = grab(mine, n)
            y = ri * (PH + 24) + 24
            if a is None or b is None:
                continue
            A = np.asarray(a).astype(float)
            B = np.asarray(b).astype(float)
            err = (B - A).mean(axis=2)          # signed, +ve = mine brighter
            # red where mine is too bright, blue where too dark, on a grey base
            vis = np.zeros((PH, PW, 3), float) + 32
            k = np.clip(np.abs(err) / 90.0, 0, 1) * 223
            vis[..., 0] += np.where(err > 0, k, 0)
            vis[..., 2] += np.where(err < 0, k, 0)
            vis[..., 1] += k * 0.15
            sheet.paste(a, (0, y))
            sheet.paste(b, (PW + 8, y))
            sheet.paste(Image.fromarray(vis.astype(np.uint8)), (PW * 2 + 16, y))
            mae = np.abs(err).mean()
            d.text((6, y - 18), f"f={n}  SOURCE", fill="#ffffff")
            d.text((PW + 14, y - 18), "REPRODUCTION", fill="#7fd1ff")
            d.text((PW * 2 + 22, y - 18),
                   f"ERREUR  MAE={mae:.1f}/255   rouge=trop clair  bleu=trop sombre",
                   fill="#ffb0b0")
        path = os.path.join(outdir, f"heat_{si // per:02d}.png")
        sheet.save(path)
        print(path, group)


if __name__ == "__main__":
    main()
