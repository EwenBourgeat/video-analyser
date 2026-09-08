"""Per-frame difference signal + scene cut detection on the 16:9 content region."""
import subprocess, io, json, sys
import numpy as np

VIDEO = "/Users/ewenbourgeat/Documents/video-analyser/ref/download/video.mp4"
CROP = "crop=720:405:0:437"          # the 16:9 content band
W, H = 180, 101                      # downscaled for the diff signal
FPS = 30

# Decode every frame of the content band as raw rgb24, small.
proc = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", VIDEO,
     "-vf", f"{CROP},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    capture_output=True, check=True)
buf = np.frombuffer(proc.stdout, dtype=np.uint8)
n = len(buf) // (W * H * 3)
frames = buf[: n * W * H * 3].reshape(n, H, W, 3).astype(np.int16)
print(f"decoded {n} frames ({n/FPS:.2f}s @ {FPS}fps)", file=sys.stderr)

diff = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2, 3))   # len n-1
mean = frames.mean(axis=(1, 2, 3))

out = {
    "n_frames": int(n),
    "fps": FPS,
    "diff": [round(float(d), 3) for d in diff],
    "mean_luma": [round(float(m), 2) for m in mean],
}
json.dump(out, open("/Users/ewenbourgeat/Documents/video-analyser/ref/signal.json", "w"))

# --- report cuts -----------------------------------------------------------
thr = 14.0
cuts = [i + 1 for i, d in enumerate(diff) if d > thr]
# collapse neighbours
grouped, prev = [], -10
for c in cuts:
    if c - prev > 2:
        grouped.append(c)
    prev = c

print(f"\n{'frame':>6} {'time':>7} {'diff':>7}   scene cuts (thr={thr})")
for c in grouped:
    print(f"{c:6d} {c/FPS:7.3f} {diff[c-1]:7.2f}")

print(f"\n--- top 40 diff spikes ---")
order = np.argsort(diff)[::-1][:40]
for i in sorted(order):
    print(f"frame {i+1:5d}  t={(i+1)/FPS:6.3f}  diff={diff[i]:7.2f}")

# --- static (held) stretches ----------------------------------------------
print(f"\n--- quiet stretches (diff < 0.6 for >= 8 frames) ---")
q, start = [], None
for i, d in enumerate(diff):
    if d < 0.6 and start is None:
        start = i
    elif d >= 0.6 and start is not None:
        if i - start >= 8:
            q.append((start, i))
        start = None
if start is not None and len(diff) - start >= 8:
    q.append((start, len(diff)))
for a, b in q:
    print(f"  frames {a+1:4d}-{b:4d}   t={a/FPS:6.3f}-{b/FPS:6.3f}  ({(b-a)/FPS:.2f}s)")
