"""
Build the favicon / PWA icon set from the supplied brand icon.

Run from the project root: python3 docs/extract-logo.py

The source (`docs/brand/icon.png`) is the official KTM Kawadi icon as
delivered: green artwork flattened onto an opaque white sheet, with no
alpha channel to recover. Brand originals live under docs/brand/ rather than
public/ on purpose — they are build inputs, and public/ is copied verbatim into
the GitHub Pages deploy, so a 1 MB source PNG in there is a megabyte of dead
weight in every deploy. The artwork is NOT a filled disc — the recycling
arrows leave the corners empty — so the old "mask to an inscribed circle"
treatment would clip the arrowheads. Instead the white *background* is keyed
out by flood-filling inward from the border, which leaves the white strokes
inside the truck and the stupa intact because they are not reachable from the
edge.

Output is a transparent square mark that reads on both the light and the dark
theme, plus the opaque variants the platforms insist on (Apple home screen,
Android maskable).
"""

from collections import deque
import os

from PIL import Image, ImageDraw, ImageFilter

SRC = 'docs/brand/icon.png'
OUT = 'public'

# Flood-fill sentinel: a colour that cannot occur in the green/white artwork,
# so "was this pixel reached from the border?" stays an exact test afterwards.
SENTINEL = (255, 0, 255)
# How far a pixel may drift from the seed white and still count as background.
# The sheet is #FDFDFD-#FFFFFF, and the softest artwork edges land near 50%
# grey-green, so anything under ~70 keys the sheet without eating the edges.
FLOOD_THRESH = 60
# Darkest channel value inside the green artwork. Used to turn a background
# pixel's whiteness back into the coverage fraction it was blended with, which
# is what gives the cut-out an anti-aliased edge instead of a jagged one.
INK_MIN = 6

src = Image.open(SRC).convert('RGB')
W, H = src.size
print(f'source: {SRC} {W}x{H}')

# ── 1. Key out the white sheet ─────────────────────────────────────────────
flooded = src.copy()
seeds = (
    [(x, 0) for x in range(0, W, 8)]
    + [(x, H - 1) for x in range(0, W, 8)]
    + [(0, y) for y in range(0, H, 8)]
    + [(W - 1, y) for y in range(0, H, 8)]
)
for seed in seeds:
    if flooded.getpixel(seed) != SENTINEL:
        ImageDraw.floodfill(flooded, seed, SENTINEL, thresh=FLOOD_THRESH)

fp = flooded.load()
sp = src.load()
alpha = Image.new('L', (W, H), 255)
ap = alpha.load()
span = 255 - INK_MIN
for y in range(H):
    for x in range(W):
        if fp[x, y] != SENTINEL:
            continue  # interior pixel — artwork or an enclosed white stroke
        r, g, b = sp[x, y]
        # Coverage of the ink that was composited over white at this pixel.
        a = round((255 - min(r, g, b)) * 255 / span)
        ap[x, y] = 0 if a < 12 else min(a, 255)

mark = src.convert('RGBA')
mark.putalpha(alpha)

# ── 2. Trim to the artwork and centre it in a square ───────────────────────
bbox = mark.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
print('artwork bbox:', bbox, '->', bbox[2] - bbox[0], 'x', bbox[3] - bbox[1])
art = mark.crop(bbox)

# 4% breathing room, so the arrowheads never touch a rounded-icon crop edge.
side = round(max(art.size) * 1.04)
square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
square.paste(art, ((side - art.width) // 2, (side - art.height) // 2), art)
# A whisper of blur only on the alpha, to soften what the flood fill quantised.
square.putalpha(square.getchannel('A').filter(ImageFilter.GaussianBlur(0.3)))
print('square mark:', side)

os.makedirs(f'{OUT}/icons', exist_ok=True)


def resized(size):
    return square.resize((size, size), Image.LANCZOS)


def compress(img):
    """Palette-quantise before writing.

    The artwork is flat vector-style colour — perhaps a dozen real inks plus
    anti-aliasing — so a 128-entry palette is visually lossless at any size the
    site renders, and takes the 512px mark from 187 KB to 26 KB. That matters
    here specifically: this mark is the homepage LCP image, and the audience is
    on mobile data.
    """
    return img.quantize(colors=128, method=Image.Quantize.FASTOCTREE)


def save(path, size):
    compress(resized(size)).save(path, 'PNG', optimize=True)
    print('wrote', path, size)


def on_white(size, radius_ratio=0.0, pad=0.86):
    """Opaque variant: the mark on a white plate, for surfaces that composite
    the icon over an unknown colour (Apple home screen, Android maskable)."""
    plate = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    if radius_ratio:
        mask = Image.new('L', (size * 4, size * 4), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            (0, 0, size * 4 - 1, size * 4 - 1),
            radius=round(size * 4 * radius_ratio),
            fill=255,
        )
        plate.putalpha(mask.resize((size, size), Image.LANCZOS))
    inner = round(size * pad)
    art = resized(inner)
    plate.paste(art, ((size - inner) // 2, (size - inner) // 2), art)
    return plate


# Primary mark: used in the header, the hero and the About page.
save(f'{OUT}/logo-mark.png', 512)

# PWA icon set.
for s in (192, 256, 384, 512):
    save(f'{OUT}/icons/icon-{s}.png', s)

# Apple home screen: iOS composites onto black if the icon has alpha, and the
# dark green artwork would vanish, so this one is deliberately opaque white.
for path in (f'{OUT}/icons/apple-icon.png', 'app/apple-icon.png'):
    compress(on_white(180)).save(path, 'PNG', optimize=True)
    print('wrote', path, 180)

# Next.js app-directory favicon convention.
save('app/icon.png', 512)

# Legacy /favicon.ico for feed readers, older browsers and search consoles that
# still request it by path. Capped at 64px: an ICO stores every size as a full
# uncompressed bitmap, so adding 128/256 tripled the file for sizes nothing
# actually requests — app/icon.png already covers the large end.
on_white(64).save('app/favicon.ico', 'ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print('wrote app/favicon.ico')

# Maskable icon: full-bleed white plate with the mark inside the 80% safe zone,
# so Android can crop it to a circle or a squircle without clipping the arrows.
# White rather than brand green — the artwork is itself dark green, and green on
# green loses the whole silhouette at launcher size.
compress(on_white(512, pad=0.74)).save(
    f'{OUT}/icons/icon-maskable-512.png', 'PNG', optimize=True
)
print('wrote maskable')

print('done')
