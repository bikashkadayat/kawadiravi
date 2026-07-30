"""
Re-export the brand cover banner for the web.

Run from the project root: python3 docs/make-cover.py

The delivered file (docs/brand/cover.png) is a 1983x793 photographic banner at
1.9 MB. `images.unoptimized` is forced on by the static export — there is no
optimizer endpoint on GitHub Pages — so whatever lands in public/ is byte for
byte what a visitor on mobile data downloads. WebP at 1600px wide is ~100 KB
and indistinguishable at the size the About page renders it.
"""

from PIL import Image

SRC = 'docs/brand/cover.png'
OUT = 'public/images/cover.webp'
WIDTH = 1600

src = Image.open(SRC).convert('RGB')
out = src.resize((WIDTH, round(src.height * WIDTH / src.width)), Image.LANCZOS)
out.save(OUT, 'WEBP', quality=82, method=6)
print('wrote', OUT, out.size)
