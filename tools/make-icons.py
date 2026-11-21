#!/usr/bin/env python3
"""Build favicons, app icons, the shipped logo and the social share card.

Reads assets/img/_raw/logo.png and assets/img/_raw/hero-listening.jpg.
Run after replacing either:  python3 tools/make-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "img" / "_raw"
DST = ROOT / "assets" / "img"

NAVY = (18, 68, 141)
CREAM = (255, 199, 92)
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
REG = "/System/Library/Fonts/Supplemental/Arial.ttf"


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def main():
    logo = Image.open(RAW / "logo.png").convert("RGBA")

    # shipped logo, transparency preserved
    for w in (96, 192, 384):
        r = logo.resize((w, w), Image.LANCZOS)
        r.save(DST / f"logo-{w}.png", optimize=True)
        r.save(DST / f"logo-{w}.webp", "WEBP", quality=90, method=6)

    # icons: the seal is a navy ring on transparency, so flatten onto white
    def flat(sz):
        bg = Image.new("RGBA", (sz, sz), (255, 255, 255, 255))
        bg.alpha_composite(logo.resize((sz, sz), Image.LANCZOS))
        return bg.convert("RGB")

    flat(180).save(ROOT / "apple-touch-icon.png", optimize=True)
    flat(192).save(DST / "icon-192.png", optimize=True)
    flat(512).save(DST / "icon-512.png", optimize=True)
    flat(64).save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    # --- Open Graph / Twitter share card, 1200x630 ---
    W, H = 1200, 630
    base = ImageOps.exif_transpose(Image.open(RAW / "hero-listening.jpg")).convert("RGB")
    s = max(W / base.width, H / base.height)
    base = base.resize((int(base.width * s + 1), int(base.height * s + 1)), Image.LANCZOS)
    x = (base.width - W) // 2
    y = int((base.height - H) * 0.35)
    og = base.crop((x, y, x + W, y + H))

    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(scrim)
    for row in range(H):
        d.line([(0, row), (W, row)], fill=NAVY + (min(int(46 + 200 * (row / H) ** 1.5), 234),))
    og = Image.alpha_composite(og.convert("RGBA"), scrim).convert("RGB")

    d = ImageDraw.Draw(og)
    D, x0, y0 = 124, 64, 50
    d.ellipse([x0 - 7, y0 - 7, x0 + D + 7, y0 + D + 7], fill=(255, 255, 255))
    seal = logo.resize((D, D), Image.LANCZOS)
    og.paste(seal, (x0, y0), seal)
    d.text((x0 + D + 34, y0 + 16), "LEAF", font=font(BOLD, 48), fill=(255, 255, 255))
    d.text((x0 + D + 36, y0 + 72), "Let's Educate All Foundation", font=font(REG, 25), fill=(216, 230, 248))
    d.text((64, 428), "Inspiring Change,", font=font(BOLD, 62), fill=(255, 255, 255))
    d.text((64, 496), "One Village at a Time", font=font(BOLD, 62), fill=CREAM)
    d.text((66, 580), "Rural education in Sasaram, Bihar  ·  letseducateall.org",
           font=font(REG, 24), fill=(208, 224, 246))
    og.save(DST / "og-cover.jpg", "JPEG", quality=86, optimize=True, progressive=True)

    print("logo-96/192/384, favicon.ico, apple-touch-icon.png, icon-192/512, og-cover.jpg")


if __name__ == "__main__":
    main()
