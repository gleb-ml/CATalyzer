from pathlib import Path
from PIL import Image, ImageChops

BASE_DIR = Path(__file__).resolve().parent
SOURCE = BASE_DIR / "logo.png"

SIZES = [128, 48, 32, 16]

# Чем меньше число, тем агрессивнее убирается белый фон
DIFF_THRESHOLD = 8

# Насколько максимально заполнять холст
CANVAS_SIZE = 1024
MARGIN = 8  # можно поставить 0 или 4, если хочешь ещё крупнее

def find_content_bbox(img: Image.Image):
    rgba = img.convert("RGBA")
    white_bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    diff = ImageChops.difference(rgba, white_bg).convert("L")

    mask = diff.point(lambda p: 255 if p > DIFF_THRESHOLD else 0)
    return mask.getbbox()

def make_big_logo(img: Image.Image):
    bbox = find_content_bbox(img)
    if bbox is None:
        raise RuntimeError("Не удалось найти содержимое изображения.")

    cropped = img.crop(bbox).convert("RGBA")

    target = CANVAS_SIZE - MARGIN * 2
    ratio = min(target / cropped.width, target / cropped.height)

    new_w = max(1, int(cropped.width * ratio))
    new_h = max(1, int(cropped.height * ratio))

    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (255, 255, 255, 0))
    x = (CANVAS_SIZE - new_w) // 2
    y = (CANVAS_SIZE - new_h) // 2
    canvas.paste(resized, (x, y), resized)

    out_big = BASE_DIR / "logo_big.png"
    canvas.save(out_big, format="PNG")
    print(f"Создан: {out_big}")

    return canvas

def make_icons(source_img: Image.Image):
    for size in SIZES:
        icon = source_img.resize((size, size), Image.Resampling.LANCZOS)
        out_file = BASE_DIR / f"icon{size}.png"
        icon.save(out_file, format="PNG")
        print(f"Создан: {out_file}")

def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"Не найден файл: {SOURCE}")

    img = Image.open(SOURCE).convert("RGBA")

    big_logo = make_big_logo(img)
    make_icons(big_logo)

    print("Готово.")

if __name__ == "__main__":
    main()