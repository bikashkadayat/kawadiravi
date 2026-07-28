"""
Extract a usable circular logo mark from the supplied presentation mockup.

The source is a marketing render: two logo variants sitting on a dark gradient
with a glow, so there is no alpha channel to recover. The artwork itself is a
circle, so the reliable extraction is: find the artwork bounds, crop to a
square, and mask everything outside the inscribed circle. That yields a clean
circular badge whose own white disc is preserved, which reads correctly on both
light and dark backgrounds.
"""

from PIL import Image, ImageDraw, ImageFilter
import colorsys, os

# Run from the project root: python3 docs/extract-logo.py
# Point SRC at a better source file (transparent PNG / rasterised SVG) if one
# becomes available — the glow-cleanup step below then simply does nothing.
SRC = 'public/images/logo-source.png'
OUT = 'public'

src = Image.open(SRC).convert('RGB')
W, H = src.size

# Top variant only, and only left of the mark/wordmark gutter found at x≈590-610.
top = src.crop((0, 0, 600, H // 2))
px = top.load()
tw, th = top.size

minx, miny, maxx, maxy = tw, th, 0, 0
for y in range(th):
    for x in range(tw):
        r, g, b = px[x, y]
        _, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if s > 0.45 and v > 0.25:
            minx, miny = min(minx, x), min(miny, y)
            maxx, maxy = max(maxx, x), max(maxy, y)

print('mark artwork bbox:', minx, miny, maxx, maxy, '->', maxx - minx, 'x', maxy - miny)

cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
# Pad well past the saturated green: the artwork's white "sticker" outline sits
# outside the green ring and is invisible to the saturation test, so a tight
# crop clips the arrowheads.
side = round(max(maxx - minx, maxy - miny) * 1.20)
left, upper = round(cx - side / 2), round(cy - side / 2)
box = (left, upper, left + side, upper + side)  # exact square, no rounding drift
print('square crop:', box, '->', side)

mark = src.crop(box).convert('RGBA')

# The padded square reaches past the gutter at source x≈600 and catches the
# leading edge of the "K" from the wordmark. Blank that column range out.
GUTTER_X = 598
if box[2] > GUTTER_X:
    cut = GUTTER_X - box[0]
    ImageDraw.Draw(mark).rectangle(
        (cut, 0, side, side), fill=(255, 255, 255, 255)
    )

# The source glow is a grey-to-white gradient, which would survive as a dirty
# ring inside the circular mask. Snap near-neutral light pixels to pure white so
# the badge reads as a deliberate white disc rather than a bad cut-out.
mp = mark.load()
for y in range(side):
    for x in range(side):
        r, g, b, a = mp[x, y]
        _, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if s < 0.16 and v > 0.55:
            mp[x, y] = (255, 255, 255, a)

# Supersample the circular mask for a smooth, non-jagged edge.
SS = 8
S = mark.size[0]
mask = Image.new('L', (S * SS, S * SS), 0)
ImageDraw.Draw(mask).ellipse((0, 0, S * SS - 1, S * SS - 1), fill=255)
mask = mask.resize((S, S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.4))
mark.putalpha(mask)

os.makedirs(f'{OUT}/icons', exist_ok=True)


def save(img, path, size):
    img.resize((size, size), Image.LANCZOS).save(path, 'PNG', optimize=True)
    print('wrote', path, size)


# Primary mark, transparent outside the circle.
save(mark, f'{OUT}/logo-mark.png', 512)

# PWA / favicon set.
for s in (192, 256, 384, 512):
    save(mark, f'{OUT}/icons/icon-{s}.png', s)
save(mark, f'{OUT}/icons/apple-icon.png', 180)

# Maskable icon: full-bleed brand green, mark inside the 80% safe zone, so
# Android can crop it to a circle/squircle without clipping the artwork.
M = 512
maskable = Image.new('RGBA', (M, M), (16, 100, 50, 255))  # #106432
inner = round(M * 0.72)
maskable.paste(
    mark.resize((inner, inner), Image.LANCZOS),
    ((M - inner) // 2, (M - inner) // 2),
    mark.resize((inner, inner), Image.LANCZOS),
)
maskable.save(f'{OUT}/icons/icon-maskable-512.png', 'PNG', optimize=True)
print('wrote maskable')

# Keep the original upload for reference / future re-export.
src.save(f'{OUT}/images/logo-source.png', 'PNG', optimize=True)
print('done')
