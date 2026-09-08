"""Shared, correctly-aligned decoding of the source 16:9 band.

The band is 405 rows tall in master terms but ffmpeg emits 404 for yuv420p, so
everything here decodes 404 and scales with SY = 1080/405. Getting this wrong
silently drifts one row per frame (see ANALYSE.md).
"""
import subprocess
import numpy as np

VIDEO = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
CROP = "crop=720:404:0:437"
PW, PH = 720, 404
SX, SY = 1920 / 720, 1080 / 405
FPS = 30


def frames(n0, n1, gray=False, scale=None):
    """Source frames [n0, n1) as uint8 arrays, correctly aligned."""
    w, h = (scale if scale else (PW, PH))
    vf = f"{CROP},select='between(n\\,{n0}\\,{n1 - 1})'"
    if scale:
        vf += f",scale={w}:{h}"
    pix = "gray" if gray else "rgb24"
    ch = 1 if gray else 3
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", VIDEO, "-vf", vf, "-vsync", "0",
         "-f", "rawvideo", "-pix_fmt", pix, "-"],
        capture_output=True, check=True)
    b = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(b) // (w * h * ch)
    shape = (n, h, w) if gray else (n, h, w, 3)
    return np.arange(n0, n0 + n), b[: n * w * h * ch].reshape(shape)


def rendered(path, n0, n1, gray=False, scale=None):
    """Frames from a rendered 1920x1080 file, resampled to the same grid."""
    w, h = (scale if scale else (PW, PH))
    vf = f"select='between(n\\,{n0}\\,{n1 - 1})',scale={w}:{h}"
    pix = "gray" if gray else "rgb24"
    ch = 1 if gray else 3
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-vsync", "0",
         "-f", "rawvideo", "-pix_fmt", pix, "-"],
        capture_output=True, check=True)
    b = np.frombuffer(p.stdout, dtype=np.uint8)
    n = len(b) // (w * h * ch)
    shape = (n, h, w) if gray else (n, h, w, 3)
    return np.arange(n0, n0 + n), b[: n * w * h * ch].reshape(shape)


def to_master(x=None, y=None):
    """Panel coords -> 1920x1080 master coords."""
    if x is not None and y is not None:
        return x * SX, y * SY
    return (x * SX) if x is not None else (y * SY)
