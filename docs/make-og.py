"""
Generate the Open Graph / Twitter share images.

Run from the project root: python3 docs/make-og.py

These are static PNGs rather than next/og `ImageResponse` route handlers on
purpose: the Nepali card needs Devanagari shaping, and shipping a Devanagari
webfont into an edge-rendered OG route costs far more than committing two
100 KB images that never change. Regenerate by re-running this script if the
brand colours or wording change.

Output: public/images/og-{en,ne}.png at 1200x630 (the size Facebook, LinkedIn,
WhatsApp and X all crop from).
"""

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
GREEN = (16, 100, 50)      # --color-primary-900, sampled from the logo
GREEN_DARK = (8, 52, 26)   # --color-primary-950
GOLD = (255, 185, 24)      # --color-accent
WHITE = (255, 255, 255)
MUTED = (200, 219, 206)

LATIN_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
DEVA_BOLD = "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf"
DEVA = "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf"

CARDS = {
    "en": {
        "bold": LATIN_BOLD,
        "regular": LATIN,
        "brand": "KawadiRabi",
        "headline": "Turn your scrap into cash",
        "sub": "Free pickup across Kathmandu Valley  ·  Cash on the spot",
        "pill": "Metal  ·  Paper  ·  Plastic  ·  Battery  ·  E-Waste",
    },
    # Noto Sans Devanagari has no U+00B7 (·), which renders as tofu. Use the
    # Devanagari danda-style separator the font does ship: a plain vertical bar.
    "ne": {
        "bold": DEVA_BOLD,
        "regular": DEVA,
        "brand": "कवाडीरबि",
        "headline": "आफ्नो कवाडीलाई नगदमा बदल्नुहोस्",
        "sub": "काठमाडौं उपत्यकाभर निःशुल्क पिकअप  |  तत्कालै नगद",
        "pill": "फलाम | कागज | प्लास्टिक | ब्याट्री | इ-वेस्ट",
    },
}


def vertical_gradient(size, top, bottom):
    """Cheap 1px-wide gradient stretched to full width."""
    w, h = size
    base = Image.new("RGB", (1, h))
    px = base.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        px[0, y] = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    return base.resize(size, Image.BILINEAR)


def fit(draw, text, font_path, max_width, start):
    """Largest font size at which `text` still fits `max_width`."""
    size = start
    while size > 16:
        font = ImageFont.truetype(font_path, size)
        if draw.textlength(text, font=font) <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(font_path, 16)


def build(locale, spec):
    img = vertical_gradient((W, H), GREEN, GREEN_DARK)
    draw = ImageDraw.Draw(img)

    # Gold accent rule down the left edge.
    draw.rectangle((0, 0, 12, H), fill=GOLD)

    # Logo mark, right side.
    mark = Image.open("public/logo-mark.png").convert("RGBA")
    mark = mark.resize((300, 300), Image.LANCZOS)
    img.paste(mark, (W - 360, (H - 300) // 2), mark)

    left = 70
    text_width = W - 360 - left - 40

    brand_font = ImageFont.truetype(spec["bold"], 42)
    draw.text((left, 86), spec["brand"], font=brand_font, fill=GOLD)

    head_font = fit(draw, spec["headline"], spec["bold"], text_width, 66)
    draw.text((left, 170), spec["headline"], font=head_font, fill=WHITE)

    sub_font = fit(draw, spec["sub"], spec["regular"], text_width, 27)
    draw.text((left, 300), spec["sub"], font=sub_font, fill=MUTED)

    # Pill strip along the bottom.
    pill_font = fit(draw, spec["pill"], spec["regular"], text_width, 24)
    pill_w = draw.textlength(spec["pill"], font=pill_font)
    pad_x, pad_y, top = 26, 14, 430
    box_h = pill_font.size + pad_y * 2
    # No fill: the image is RGB, so an RGBA "subtle white" would flatten to a
    # solid white box and swallow the white text inside it. Outline only, with
    # the gradient showing through.
    draw.rounded_rectangle(
        (left, top, left + pill_w + pad_x * 2, top + box_h),
        radius=box_h // 2,
        outline=GOLD,
        width=2,
    )
    draw.text((left + pad_x, top + pad_y - 2), spec["pill"], font=pill_font, fill=WHITE)

    out = f"public/images/og-{locale}.png"
    img.save(out, "PNG", optimize=True)
    print("wrote", out, img.size)


for locale, spec in CARDS.items():
    build(locale, spec)

print("done")
