"""Monta docs/demo.gif a partir dos quadros gravados por scripts/gravar-gif.cjs. Requer Pillow."""
import json
import tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(tempfile.gettempdir()) / "quick-replies-gif"
OUT = ROOT / "docs" / "demo.gif"
WIDTH = 720
CROP = (0, 0, 900, 520)

if __name__ == "__main__":
    data = json.loads((SRC / "frames.json").read_text(encoding="utf-8"))
    frames, end = data["frames"], data["end"]
    # Capture runs as fast as it can; keep about 12 frames per second.
    kept, last = [], -1000
    for frame in frames:
        if frame["t"] - last >= 80:
            kept.append(frame); last = frame["t"]
    frames = kept
    images, durations = [], []
    for i, frame in enumerate(frames):
        nxt = frames[i + 1]["t"] if i + 1 < len(frames) else end
        duration = max(20, nxt - frame["t"])
        img = Image.open(frame["file"]).convert("RGB").crop(CROP)
        img = img.resize((WIDTH, round(img.height * WIDTH / img.width)), Image.LANCZOS)
        images.append(img.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE))
        durations.append(duration)
    durations[-1] += 1500  # hold the final state before looping
    images[0].save(OUT, save_all=True, append_images=images[1:], duration=durations, loop=0, optimize=True)
    print(f"{OUT} ({OUT.stat().st_size // 1024} KB, {len(images)} quadros)")
