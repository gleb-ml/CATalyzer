from PIL import Image
from pathlib import Path

# Скрипт лежит прямо в папке icons
SOURCE = Path("logo.png")

SIZES = [128, 48, 32, 16]

img = Image.open(SOURCE)

if img.mode not in ("RGBA", "LA"):
    img = img.convert("RGBA")

for size in SIZES:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    output = Path(f"icon{size}.png")
    resized.save(output, format="PNG")
    print(f"Создан: {output}")

print("Готово.")