"""Derive the Intuitive AI JUZA overlay without altering approved foreground art."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Design/03_Design_Masters/Intuitive/ai_juza_frame.png"
DESIGN_OUTPUT = ROOT / "Design/03_Design_Masters/Intuitive/ai_juza_frame_transparent.png"
PUBLIC_OUTPUT = ROOT / "public/images/result-scenes/intuitive/overlays/ai_juza_frame_transparent.png"


def is_flat_black(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    darkest = min(red, green, blue)
    brightest = max(red, green, blue)
    return alpha > 0 and brightest <= 28 and brightest - darkest <= 14


def derive() -> tuple[int, int]:
    image = Image.open(SOURCE).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    selected = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if selected[index] or not is_flat_black(pixels[x, y]):
            return
        selected[index] = 1
        queue.append((x, y))

    # Exterior matte: only black connected to the image perimeter.
    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    # Right message bay: flood only the enclosed flat-black surface.
    enqueue(int(width * 0.78), int(height * 0.50))

    while queue:
        x, y = queue.popleft()
        if x > 0:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y > 0:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    output = image.copy()
    output_pixels = output.load()
    transparent_count = 0
    feathered_count = 0

    for y in range(height):
        for x in range(width):
            if not selected[y * width + x]:
                continue
            red, green, blue, alpha = output_pixels[x, y]
            value = max(red, green, blue)
            if value <= 4:
                new_alpha = 0
                transparent_count += 1
            else:
                new_alpha = round(alpha * ((value - 4) / 24) ** 1.2)
                feathered_count += 1
            output_pixels[x, y] = (red, green, blue, new_alpha)

    DESIGN_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    output.save(DESIGN_OUTPUT, optimize=True)
    output.save(PUBLIC_OUTPUT, optimize=True)
    return transparent_count, feathered_count


if __name__ == "__main__":
    transparent, feathered = derive()
    print(f"transparent pixels: {transparent}")
    print(f"feathered edge pixels: {feathered}")
    print(DESIGN_OUTPUT)
    print(PUBLIC_OUTPUT)
