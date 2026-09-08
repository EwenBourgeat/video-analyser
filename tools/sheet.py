"""Contact sheet of a render: N frames laid out in a grid with timestamps."""
import subprocess, io, sys, os
import numpy as np
from PIL import Image, ImageDraw

def grab(video, n, w, h):
    p = subprocess.run(["ffmpeg","-v","error","-i",video,"-vf",
        f"select='eq(n\\,{n})',scale={w}:{h}","-vsync","0","-frames:v","1",
        "-f","image2pipe","-vcodec","png","-"],capture_output=True,check=True)
    return Image.open(io.BytesIO(p.stdout)).convert("RGB") if p.stdout else None

def main():
    video, out, fps = sys.argv[1], sys.argv[2], float(sys.argv[3])
    frames = [int(x) for x in sys.argv[4:]]
    cols, w, h = 3, 560, 315
    rows = (len(frames)+cols-1)//cols
    sheet = Image.new("RGB",(cols*w+(cols+1)*8, rows*(h+24)+8),"#141414")
    d = ImageDraw.Draw(sheet)
    for i,n in enumerate(frames):
        im = grab(video,n,w,h)
        if im is None: continue
        x = 8+(i%cols)*(w+8); y = 8+(i//cols)*(h+24)+18
        sheet.paste(im,(x,y))
        d.text((x+2,y-16), f"f={n}  t={n/fps:.2f}s", fill="#ffffff")
    sheet.save(out); print(out, len(frames), "frames")

main()
