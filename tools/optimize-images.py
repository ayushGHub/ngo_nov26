#!/usr/bin/env python3
"""Generate responsive WebP + JPEG derivatives for the LEAF site.

Source files live in assets/img/_raw/ and are never shipped.
Run:  python3 tools/optimize-images.py
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "img" / "_raw"
DST = ROOT / "assets" / "img"

# name -> (aspect W:H or None to keep, [widths], focal point 0-1 vertical)
SPECS = {
    "hero-listening":        ((16, 9), [960, 1440, 1920], 0.42),
    "hero-village":          ((16, 9), [960, 1440, 1920], 0.45),
    "hero-outreach":         ((16, 9), [960, 1440, 1920], 0.40),
    "hero-classroom":        ((16, 9), [960, 1440, 1920], 0.45),
    "grassroots":            ((4, 3),  [640, 960, 1280],  0.45),
    "cluster-map":           ((16, 10),[640, 960, 1280],  0.50),
    "foundations":           ((3, 4),  [520, 780, 1040],  0.42),
    "campaign-library":      ((16, 10),[480, 720, 960],   0.50),
    "campaign-kindergarten": ((16, 10),[480, 720, 960],   0.50),
    "campaign-computer":     ((16, 10),[480, 720, 960],   0.50),

    # --- inside the centre ---
    "smart-classroom":       ((4, 3),  [560, 840, 1120],  0.45),
    "group-photo":           ((21, 9), [960, 1440, 1920], 0.62),

    # --- gallery tiles (square crops keep the grid even) ---
    "computer-lab":          ((1, 1),  [420, 640, 860],   0.45),
    "exam-day":              ((1, 1),  [420, 640, 860],   0.45),
    "library-opening":       ((1, 1),  [420, 640, 860],   0.50),
    "library-ribbon":        ((1, 1),  [420, 640, 860],   0.42),
    "little-learner":        ((1, 1),  [420, 640, 860],   0.32),
    "assembly":              ((1, 1),  [420, 640, 860],   0.48),
    "playtime":              ((1, 1),  [420, 640, 860],   0.45),
    "carrom":                ((1, 1),  [420, 640, 860],   0.45),
    "village-sabha":         ((1, 1),  [420, 640, 860],   0.45),
    "nursery-blocks":        ((1, 1),  [420, 640, 860],   0.45),

    # --- gallery page only (g- prefix); nothing here repeats on the homepage
    "g-assembly-line":       ((1, 1),  [420, 640, 860],   0.45),
    "g-classroom-teacher":   ((1, 1),  [420, 640, 860],   0.45),
    "g-exam-writing":        ((1, 1),  [420, 640, 860],   0.45),
    "g-cricket":             ((1, 1),  [420, 640, 860],   0.45),
    "g-kg-blocks":           ((1, 1),  [420, 640, 860],   0.45),
    "g-kg-table":            ((1, 1),  [420, 640, 860],   0.45),
    "g-kg-letters":          ((1, 1),  [420, 640, 860],   0.45),
    "g-computer-station":    ((1, 1),  [420, 640, 860],   0.45),
    "g-smart-class":         ((1, 1),  [420, 640, 860],   0.45),
    "g-build-early":         ((1, 1),  [420, 640, 860],   0.50),
    "g-build-walls":         ((1, 1),  [420, 640, 860],   0.50),
    "g-signboard":           ((1, 1),  [420, 640, 860],   0.45),
    "g-village-elders":      ((1, 1),  [420, 640, 860],   0.45),
    "g-village-meeting":     ((1, 1),  [420, 640, 860],   0.45),
    "g-village-gathering":   ((1, 1),  [420, 640, 860],   0.45),
    "g-sabha":               ((1, 1),  [420, 640, 860],   0.45),
    "team-preeti":           ((1, 1),  [280, 420],        0.40),
    "team-ayush":            ((1, 1),  [280, 420],        0.40),
    "team-klaus":            ((1, 1),  [280, 420],        0.40),
    "team-neogi":            ((1, 1),  [280, 420],        0.40),
    "team-ajay":             ((1, 1),  [280, 420],        0.40),
    "team-mayank":           ((1, 1),  [280, 420],        0.40),
    "upi":                   (None,    [640, 960],        0.50),
}

def trim_letterbox(im, threshold=18):
    """Strip solid black bars baked into a source file.

    Phone screenshots and forwarded WhatsApp images often arrive padded to a
    square, horizontally (letterbox) or vertically (pillarbox). Left in place,
    a square crop keeps the bars.
    """
    g = im.convert("L")
    w, h = g.size

    # squash to a 1px column / row: each byte is that line's mean brightness
    rows = g.resize((1, h), Image.BOX).tobytes()
    cols = g.resize((w, 1), Image.BOX).tobytes()

    def bounds(vals, n):
        lo = 0
        while lo < n and vals[lo] < threshold:
            lo += 1
        hi = n
        while hi > lo and vals[hi - 1] < threshold:
            hi -= 1
        return lo, hi

    top, bot = bounds(rows, h)
    left, right = bounds(cols, w)
    if (top, bot, left, right) == (0, h, 0, w):
        return im, 0
    if bot <= top or right <= left:          # all-dark image; leave it alone
        return im, 0
    removed = (top + (h - bot)) + (left + (w - right))
    return im.crop((left, top, right, bot)), removed


def crop_to(im, aspect, focal):
    tw, th = aspect
    target = tw / th
    w, h = im.size
    cur = w / h
    if abs(cur - target) < 0.01:
        return im
    if cur > target:                      # too wide -> trim sides
        nw = int(round(h * target))
        left = (w - nw) // 2
        return im.crop((left, 0, left + nw, h))
    nh = int(round(w / target))            # too tall -> trim using focal point
    top = int(round((h - nh) * focal))
    top = max(0, min(top, h - nh))
    return im.crop((0, top, w, top + nh))

def main():
    total_in = total_out = 0
    for name, (aspect, widths, focal) in SPECS.items():
        src = next((p for p in RAW.glob(name + ".*")), None)
        if src is None:
            print(f"  !! missing source for {name}")
            continue
        total_in += src.stat().st_size
        im = ImageOps.exif_transpose(Image.open(src))
        has_alpha = im.mode in ("RGBA", "LA", "P") and "transparency" in im.info
        trimmed = 0
        if not has_alpha:
            im, trimmed = trim_letterbox(im)
        if aspect:
            im = crop_to(im, aspect, focal)
        im = im.convert("RGBA" if has_alpha else "RGB")
        # never upscale, but always emit at least one derivative: a source
        # smaller than every requested width still ships at its native size
        usable = [w for w in widths if w <= im.width] or [im.width]
        for w in usable:
            h = int(round(im.height * w / im.width))
            rs = im.resize((w, h), Image.LANCZOS)
            wp = DST / f"{name}-{w}.webp"
            rs.save(wp, "WEBP", quality=80, method=6)
            total_out += wp.stat().st_size
            # raster fallback
            if has_alpha:
                fb = DST / f"{name}-{w}.png"
                rs.save(fb, "PNG", optimize=True)
            else:
                fb = DST / f"{name}-{w}.jpg"
                rs.save(fb, "JPEG", quality=82, optimize=True, progressive=True)
            total_out += fb.stat().st_size
        note = f"  (trimmed {trimmed}px of letterbox)" if trimmed else ""
        print(f"  {name:24s} {im.width}x{im.height} -> {usable}{note}")
    print(f"\nsource {total_in/1e6:.1f} MB  ->  derivatives {total_out/1e6:.1f} MB")

if __name__ == "__main__":
    main()
