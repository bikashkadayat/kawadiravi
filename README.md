# KTM Kawadi

Bilingual (English / नेपाली) lead-generation website for a Kathmandu Valley scrap-buying business.

The whole site optimises for exactly two conversions — **tap to call** and **tap to WhatsApp**. Everything else exists to build enough trust to trigger one of them.

**Live:** https://ktmkawadi.bikashkadayat.com.np

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build. **Also validates `data/rates.json`** |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Requires **Node 20.19+** (22 recommended — that is what CI uses).

---

## Changing the rates

**Edit `data/rates.json` and nothing else.** Every rate on the site — the homepage preview, the rates table, the category counts, the "items priced" figure — is derived from that one file.

```jsonc
{
  "id": "copper-wire",        // lowercase-kebab, must be unique
  "category": "metals",       // metals | paper | plastic | battery | ewaste
  "nameEn": "Copper Wire",
  "nameNe": "तामाको तार",
  "unit": "kg",               // kg | piece
  "minRate": 900,
  "maxRate": 1100,            // must be >= minRate
  "noteEn": "Rate varies with purity",    // optional
  "noteNe": "शुद्धता अनुसार दर फरक हुन्छ",  // optional
  "icon": "cable",            // see lib/icons.ts for valid names
  "featured": true            // shows on the homepage preview
}
```

Also update `"updatedAt"` at the top of the file — it is shown to customers as "Rates updated on …".

**The file is validated at build time.** A typo does not reach production; it fails the build with the exact path:

```
Invalid data/rates.json — the build was stopped so a broken rate cannot reach production:
  • items.7.maxRate: maxRate must be greater than or equal to minRate
  • items.12.id: Duplicate rate id "brass"
```

Adding a brand-new icon name means adding one line to `lib/icons.ts`; an unknown name falls back to a generic box rather than crashing.

---

## Changing contact details

**`lib/site-config.ts` is the single source of truth.** Phone, WhatsApp, email, address, opening hours, service areas and social links all live there, and every component reads from it.

```ts
phoneTel: '+9779823525098',   // used verbatim in tel: links
phoneDisplay: '9823525098',   // shown to humans, never used to build a link
whatsapp: '9779823525098',    // digits only, no '+' — what wa.me expects
```

Two deliberate exceptions:

- **`public/offline.html`** duplicates the phone number. It is static HTML served by the service worker with no network and no access to the config, so it cannot import anything. **Update it whenever the number changes.**
- The **prefilled WhatsApp message** is NOT translated. It lives only in `siteConfig.whatsappMessage` (`lib/site-config.ts`) and is Nepali on every page, English pages included — it is read by the shop, not by the visitor. `lib/whatsapp.ts` is the only place a `wa.me` URL is built.

### Social links

Socials are set to `'#'` by default, which means *not configured*. The footer **hides** them rather than rendering dead links. Put a real URL in `lib/site-config.ts` and the icon appears automatically.

WhatsApp is the exception — it is derived from the phone number, so it is always live.

---

## Adding or changing copy

All text lives in `messages/en.json` and `messages/ne.json`, which **must have identical key trees**. To check:

```bash
node -e "
const en=require('./messages/en.json'), ne=require('./messages/ne.json');
const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v!==null?flat(v,p+k+'.'):[p+k]);
const a=flat(en).sort(), b=flat(ne).sort();
console.log(a.length,'vs',b.length,'| drift:', [...a.filter(k=>!b.includes(k)),...b.filter(k=>!a.includes(k))].join(', ')||'none');
"
```

FAQ entries are the exception: they live in `lib/faqs.ts` as question/answer pairs, so a half-translated entry is a TypeScript error rather than a silent gap.

---

## Project structure

```
app/[locale]/         Pages: home, rates, services, about, contact
components/layout/    Header, Footer, AnnouncementBar, FloatingActions, toggles
components/home/      The eight homepage sections
components/rates/     Rates table, search/filter, sticky mobile CTA
components/shared/    SectionHeading, FaqAccordion, AnimatedSection, JsonLd, icons
lib/                  site-config, rates, whatsapp, schema, metadata, faqs, icons
messages/             en.json, ne.json
data/rates.json       ← the only file needed to change prices
i18n/, proxy.ts       Locale routing (Next 16 renamed `middleware` to `proxy`)
docs/                 ARCHITECTURE.md, image scripts, brand/ (logo originals)
```

### Two conventions worth knowing

**Almost everything is a server component.** The only client components are the header, mobile nav, the two toggles, the theme provider, the rates search, and the contact form. Pages ship no JavaScript of their own.

**Animations are CSS, never JavaScript.** Framer Motion server-renders its hidden start frame (`opacity: 0`) and only reveals content after hydration — which would leave the floating Call/WhatsApp buttons, and then the entire homepage, invisible on a slow or failed bundle. The scroll reveal is a CSS scroll-driven animation that moves position only (no opacity), so text is always at full contrast and content can never fail to appear.

---

## Regenerating images

```bash
python3 docs/extract-logo.py   # logo + favicon + PWA icon set, from docs/brand/icon.png
python3 docs/make-og.py        # Open Graph share cards (en + ne)
python3 docs/make-cover.py     # About-page cover banner, from docs/brand/cover.png
```

All three need Pillow (`pip install Pillow`) and run from the project root. The
brand originals live in `docs/brand/`, deliberately outside `public/` so the
multi-megabyte sources are not shipped to visitors. Re-run `extract-logo.py`
after replacing the logo, and `make-og.py` if the brand colours or tagline change.

---

## Deployment

```
git push origin main   →   live in ~2 minutes
```

That is the entire workflow. Pushing to `main` triggers `.github/workflows/deploy.yml`, which lints, typechecks, static-exports the site to `./out`, and publishes it to **GitHub Pages** at <https://ktmkawadi.bikashkadayat.com.np>.

You can also redeploy without a commit: **Actions → Deploy to GitHub Pages → Run workflow**.

### One-time setup — you MUST do this first

**GitHub → repo → Settings → Pages → Build and deployment → Source:**

> ### `GitHub Actions`

**Not** "Deploy from a branch". This is the whole reason Pages was previously
showing the README: with "Deploy from a branch" it serves the repository root,
where the only renderable file is `README.md`. Switching the source to GitHub
Actions makes Pages serve the artifact this workflow uploads instead.

Then under **Settings → Pages → Custom domain**, enter:

```
ktmkawadi.bikashkadayat.com.np
```

and tick **Enforce HTTPS** once the certificate is issued (can take a few minutes).

### DNS

The domain must now point at GitHub, not Vercel. In **Cloudflare DNS** for `bikashkadayat.com.np`, change the existing record:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `ktmkawadi` | `bikashkadayat.github.io` | **DNS only** (grey cloud) |

Proxy must stay **off** — Cloudflare's orange cloud in front of Pages breaks certificate issuance.

> `public/CNAME` is committed and copied into `out/` on every build. Without it, GitHub Pages drops the custom domain on each deploy and reverts to the `github.io` URL.

### Testing it end to end

1. Change something visible — a rate in `data/rates.json`, or the tagline in `messages/en.json`.
2. `git add -A && git commit -m "test deploy" && git push origin main`
3. Open the repo's **Actions** tab; the run appears within seconds.
4. When it goes green (~2 min), the run **Summary** shows the live URL and commit.
5. Hard-refresh <https://ktmkawadi.bikashkadayat.com.np> and confirm the change.

If two pushes land close together the older run is cancelled, so the newest commit always wins.

### What static export costs

GitHub Pages serves files, not a Node server. Three capabilities are unavailable and the code accounts for each:

| Lost | Consequence | Handled by |
|---|---|---|
| Middleware | No server-side `/` → `/en` redirect | `app/page.tsx` — a static redirect stub |
| Locale detection | Everyone lands on English regardless of `Accept-Language` | Header language toggle |
| Image Optimization | No AVIF/WebP conversion or resizing | `images.unoptimized: true`; assets are pre-sized |

Route handlers, ISR, `headers()` and `rewrites()` are also unavailable. If any of those are ever needed, the site has to move back to a hosted runtime.


### Environment variables

Every one is optional — the site builds and runs with none of them set.

Because this is a **static export**, `NEXT_PUBLIC_*` values are baked into the bundle at build time; there is no runtime environment to read them from. Set them as repository **Variables** (not secrets — these IDs ship in the client bundle regardless): **Settings → Secrets and variables → Actions → Variables → New repository variable**. The workflow passes them to the build step.

| Variable | Effect when unset |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Falls back to the production domain (the workflow sets it explicitly) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics not loaded at all |
| `NEXT_PUBLIC_CLARITY_ID` | Clarity not loaded at all |

With neither analytics ID set, the site ships **zero third-party JavaScript**.

---

## Before launch

- [ ] Replace `email` in `lib/site-config.ts` (still `info@ktmkawadi.bikashkadayat.com.np`)
- [ ] Add real social URLs in `lib/site-config.ts` (all still `'#'`, so hidden)
- [ ] **Replace the placeholder testimonials** in `lib/testimonials.ts` with real, permission-granted quotes. They currently say "Sample Customer" on purpose — publishing invented reviews misleads customers and risks a Google penalty
- [ ] Check `data/rates.json` prices are current, and set `updatedAt`
- [ ] Confirm the address and `geo` coordinates in `lib/site-config.ts`
- [ ] On a real phone: floating Call opens the dialer; floating WhatsApp opens WhatsApp with the message prefilled
- [ ] Submit `https://ktmkawadi.bikashkadayat.com.np/sitemap.xml` to Google Search Console
- [ ] Validate the JSON-LD in Google's Rich Results Test
- [ ] Install the PWA from Chrome mobile and confirm the offline page appears in airplane mode

---

## Tech

Next.js 16 (App Router, static export) · TypeScript · Tailwind CSS v4 · next-intl · Radix UI · Zod · GitHub Pages

Tailwind v4 is CSS-first: design tokens live in the `@theme` block in `app/globals.css`. **There is no `tailwind.config.ts`.**

Full design rationale, colour contrast calculations and component inventory: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
