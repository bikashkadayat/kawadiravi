# KTM Kawadi — Architecture & Design Specification

**Project:** KTM Kawadi ♻️ — scrap & recycling pickup service
**Owner:** Bikash Kadayat
**Domain:** `ktmkawadi.bikashkadayat.com.np`
**Reference (inspiration only, not copied):** thulokawadi.com
**Document status:** M0 deliverable — planning only, no application code exists yet.

---

## 1. Product thesis

This is **not** a content site. It is a lead-capture funnel with exactly two conversion events:

1. `tel:` tap → phone rings
2. `wa.me` tap → WhatsApp chat opens with a prefilled message

Every other page and section exists only to raise the probability of one of those two taps. That thesis drives three concrete architectural consequences:

- **Floating Call + WhatsApp buttons are fixed and always visible** on every page, every viewport, at `z-50`. They are never scrolled away from, never hidden behind a menu.
- **The rates table is the trust engine.** A visitor comparing scrap buyers wants a number before they call. Publishing real ranges is what earns the tap, so rates must be trivially editable by a non-developer.
- **Speed is a conversion feature, not a vanity metric.** The audience is on mid-tier Android over Nepali mobile data. A 4-second load loses the lead to a competitor. Hence static generation, self-hosted fonts, and zero client-side data fetching on first paint.

### Design differentiation vs. the reference site

The brief asks for "significantly more modern" than thulokawadi.com. Concretely, that means:

| Dimension | Typical Nepali scrap site | KTM Kawadi |
|---|---|---|
| Rendering | Client-rendered WordPress + plugins | Static pre-rendered Next.js, no CMS runtime |
| Rates | Image screenshot of a price list | Structured JSON → searchable, filterable, indexable table |
| Language | English-only, or a broken translate widget | First-class EN/NE with separate indexable URLs |
| Contact | A form that emails an inbox nobody checks | Direct-to-WhatsApp, where the owner already is |
| Motion | None, or jQuery carousels | Framer Motion, reduced-motion respected |

---

## 2. Project root

The site is built **directly in `/home/dell/Desktop/Kawadiravi`** (the working directory), not in a nested subfolder.

> Note: the directory is spelled `Kawadiravi`, the npm package is `ktm-kawadi`, the domain is `ktmkawadi.bikashkadayat.com.np`, and the display brand is `KTM Kawadi`. Only the **folder name** still reads `Kawadiravi` — it is cosmetic, never appears in a URL or in the deployed output, and renaming it would break the local git checkout path.

### 2.1 Folder tree

```
Kawadiravi/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # Locale shell: fonts, NextIntl + theme providers,
│   │   │                           #   AnnouncementBar, Header, Footer, FloatingActions
│   │   ├── page.tsx                # Home
│   │   ├── rates/page.tsx          # Live scrap rates
│   │   ├── services/page.tsx       # Services + pickup process + FAQ
│   │   ├── about/page.tsx          # Brand story, mission, values
│   │   ├── contact/page.tsx        # Call/WhatsApp/lead form/hours/map
│   │   └── not-found.tsx           # Localized 404
│   ├── layout.tsx                  # Root passthrough; <html>/<body> live in [locale]
│   ├── not-found.tsx               # Global 404 for paths outside any locale;
│   │                               #   supplies its own <html>/<body>
│   ├── globals.css                 # Tailwind v4 @theme tokens + dark mode + base styles
│   ├── sitemap.ts                  # Generated; emits both locales
│   ├── robots.ts                   # Generated
│   ├── manifest.ts                 # PWA manifest (typed, generated)
│   └── icon.tsx / opengraph-image.tsx   # Generated favicon + OG image
│
├── components/
│   ├── layout/
│   │   ├── AnnouncementBar.tsx     # Top strip: free pickup + phone + WhatsApp
│   │   ├── Header.tsx              # Logo, nav, "View Rates" + Call CTA
│   │   ├── MobileNav.tsx           # Hamburger → shadcn Sheet drawer
│   │   ├── Footer.tsx              # 4 link columns + social icons + copyright
│   │   ├── FloatingActions.tsx     # ★ Fixed WhatsApp + Call buttons, bottom-right
│   │   ├── LocaleToggle.tsx        # EN ⇄ NE, preserves current path
│   │   └── ThemeToggle.tsx         # Light/dark/system via next-themes
│   │
│   ├── home/
│   │   ├── Hero.tsx                # Headline, subtext, dual CTA, trust badges
│   │   ├── RatesPreview.tsx        # Cards for rates.json items where featured=true
│   │   ├── WhatWeBuy.tsx           # Category grid (13 scrap types)
│   │   ├── HowItWorks.tsx          # Book → Visit → Weigh → Get Paid
│   │   ├── WhyChooseUs.tsx         # Six differentiator cards
│   │   ├── CoverageArea.tsx        # Valley municipalities served
│   │   ├── Testimonials.tsx        # Sample social proof
│   │   └── CtaBand.tsx             # Full-width closing Call + WhatsApp band
│   │
│   ├── rates/
│   │   ├── RatesTable.tsx          # Category-grouped table (server component)
│   │   ├── RatesFilter.tsx         # Search box + category pills (client)
│   │   └── RateRow.tsx             # One item: icon, bilingual name, range, note
│   │
│   ├── shared/
│   │   ├── CallButton.tsx          # ★ Single source of every tel: link
│   │   ├── WhatsAppButton.tsx      # ★ Single source of every wa.me link
│   │   ├── SectionHeading.tsx      # Eyebrow + title + subtitle, consistent rhythm
│   │   ├── TrustBadge.tsx          # Icon + label pill
│   │   ├── FaqAccordion.tsx        # Wraps shadcn Accordion + FAQPage JSON-LD
│   │   ├── AnimatedSection.tsx     # Scroll-reveal wrapper, reduced-motion aware
│   │   └── JsonLd.tsx              # Renders a schema object into a <script> tag
│   │
│   └── ui/                         # shadcn/ui primitives (generated, lightly edited)
│       └── button · card · accordion · input · select · sheet · badge · separator
│
├── lib/
│   ├── site-config.ts              # ★ SINGLE SOURCE OF TRUTH: phone, whatsapp, email,
│   │                               #   socials, domain, hours, coverage
│   ├── rates.ts                    # Zod-validated loader + grouping/filter helpers
│   ├── schema.ts                   # JSON-LD builders (LocalBusiness, FAQPage, Breadcrumb)
│   ├── whatsapp.ts                 # buildWhatsAppUrl() — prefilled-message composer
│   └── utils.ts                    # cn() (clsx + tailwind-merge), from shadcn
│
├── i18n/
│   ├── routing.ts                  # locales ['en','ne'], defaultLocale 'en', Link/redirect
│   └── request.ts                  # next-intl per-request message loading
│
├── messages/
│   ├── en.json                     # All English copy
│   └── ne.json                     # All Nepali copy (same key tree)
│
├── data/
│   └── rates.json                  # ★ The ONLY file the owner edits to change prices
│
├── types/
│   └── index.ts                    # Rate, RateCategory, SiteConfig, Testimonial, FaqItem…
│
├── public/
│   ├── logo.svg · logo-mark.svg
│   ├── icons/                      # PWA icons: 192, 256, 384, 512, maskable
│   └── images/                     # Hero art, category illustrations, OG fallback
│
├── docs/ARCHITECTURE.md            # ← this file
├── .github/workflows/deploy.yml    # CI: lint → typecheck → build → deploy
├── proxy.ts                        # next-intl locale detection & routing
│                                   #   (Next 16 renamed the `middleware` file
│                                   #    convention to `proxy`)
├── next.config.ts
├── tsconfig.json
├── .env.example
└── README.md
```

★ = files where a change ripples site-wide. Treat them as the contract surface.

---

## 3. Dependencies

### 3.1 Runtime

| Package | Why it is here |
|---|---|
| `next` (**16.2.12**, App Router) | Static generation + per-route metadata + image optimization in one framework. The brief said 15; `create-next-app@latest` now installs 16, which is the current stable and uses the same App Router. Pinning back to 15 is a one-line change if preferred. |
| `react` / `react-dom` (19.2) | Peer of Next 16 |
| `next-intl` | Locale-prefixed routing, server-component message access, `hreflang` support. Chosen over `react-i18next` because it works in RSC without forcing pages to `"use client"` |
| ~~`framer-motion`~~ | **Currently unused — a candidate for removal.** It server-renders the hidden start frame of any animation, which would leave content invisible until hydration; both `FloatingActions` and `AnimatedSection` therefore use CSS instead. Still installed in case a later milestone needs genuinely interactive motion (drag, gesture, layout animation) that CSS cannot express |
| `lucide-react` | Tree-shaken SVG icons; the `icon` field in `rates.json` maps directly to its names |
| `zod` | Validates `rates.json` at build time so a typo fails the build instead of shipping a broken row |
| `next-themes` | Dark mode without a flash of wrong theme on first paint |
| `clsx` + `tailwind-merge` | Conditional classes without duplicate-utility conflicts (`cn()` helper) |
| `class-variance-authority` | Typed button/card variants; required by shadcn/ui |
| `@radix-ui/react-*` | Accessible unstyled primitives under shadcn (accordion, dialog/sheet, select) — keyboard nav and ARIA for free |

### 3.2 Dev

| Package | Why |
|---|---|
| `typescript`, `@types/*` | Type safety across the rates data model |
| `tailwindcss` v4 + `@tailwindcss/postcss` | Styling; CSS-first token config |
| `eslint` + `eslint-config-next` | Lint gate in CI. Next 16 removed `next lint` and the `eslint` key from `next.config.ts`, so linting is a standalone `npm run lint` step that CI runs *before* `npm run build` |
| `prettier` + `prettier-plugin-tailwindcss` | Deterministic class ordering, no diff noise |

**Deliberately excluded:** no CMS, no database, no state library, no analytics SDK bundle (GA and Clarity load via `next/script` behind env vars), no icon font, no jQuery-era carousel. Every kilobyte shipped has to earn a phone call.

### 3.3 Tailwind v4 note

`create-next-app` now installs Tailwind **v4**, which is CSS-first: tokens are declared in an `@theme` block inside `globals.css` and there is **no `tailwind.config.ts`**. The tokens in §4 are unchanged in value — only their location differs from the original brief. Flagged here so it is not a surprise in M1.

---

## 4. Design system

### 4.1 Color

The palette is **sampled directly from the supplied logo**, not invented: the wordmark green measures `#106432` and the gold `#FFB918`. Those two values anchor the ramps below, so the site and the logo are the same brand rather than two near-misses.

| Token | Value | Role |
|---|---|---|
| `--color-primary-50` | `#EDFCF3` | Tinted section backgrounds |
| `--color-primary-100` | `#D6F7E3` | Badge fills |
| `--color-primary-200` | `#ADEDC8` | Hover tints |
| `--color-primary-300` | `#79DDA4` | Dark-mode headings |
| `--color-primary-400` | `#45C97E` | Decorative accents |
| `--color-primary-500` | `#22B25C` | Interactive green |
| `--color-primary-600` | `#1A9A4E` | Focus ring |
| `--color-primary-700` | `#178544` | Mid surfaces |
| `--color-primary-800` | `#14743B` | Primary button |
| **`--color-primary-900`** | **`#106432`** | **Brand green — sampled from the logo** |
| `--color-primary-950` | `#08341A` | Dark-mode page background |
| **`--color-accent`** | **`#FFB918`** | **Call button, high-intent CTAs only — from the logo** |
| `--color-accent-hover` | `#E5A30D` | Accent hover |
| `--color-accent-soft` | `#FFF6E0` | Accent-tinted background |
| **`--color-whatsapp`** | **`#25D366`** | **WhatsApp control only — never decorative** |
| `--color-whatsapp-hover` | `#1DA851` | WhatsApp hover |

Neutrals use a warm gray ramp (`--color-neutral-50` `#FAFAF9` → `--color-neutral-950` `#0C0A09`) rather than a cold blue-gray, so the green reads organic instead of clinical. Semantic aliases: `success` → `primary-600`, `warning` → `#F79009`, `destructive` → `#D92D20`, `info` → `#0BA5EC`.

**Color discipline rules — these matter more than the values:**

1. **Gold means "call".** If a gold button doesn't dial the phone, it's a bug.
2. **`#25D366` means "WhatsApp".** Never used as a generic green.
3. Everything else is green or neutral. This is what makes the two CTAs pop on a busy page.

**Contrast computed against the final values (WCAG AA needs 4.5:1 for body text):**

| Pair | Ratio | Verdict |
|---|---|---|
| White on `primary-800` `#14743B` | 5.85:1 | ✓ — this is why the primary button is 800, not 700 |
| White on `primary-700` `#178544` | 4.69:1 | ✓ but tight; reserved for large text only |
| White on `primary-900` `#106432` | 7.26:1 | ✓ AAA — footer, hero overlays |
| `neutral-950` on `accent` `#FFB918` | 11.5:1 | ✓ AAA |
| White on `accent` `#FFB918` | 1.72:1 | ✗ — **gold buttons must take dark text** |
| `neutral-950` on `whatsapp` `#25D366` | 9.96:1 | ✓ AAA |
| White on `whatsapp` `#25D366` | 1.98:1 | ✗ — **WhatsApp buttons must take dark text** |

The two failing rows are the trap almost every scrap-site clone falls into: white-on-gold and white-on-WhatsApp-green look fine to a designer on a bright monitor and are unreadable in sunlight on a phone. Both CTAs therefore use `neutral-950` text.

### 4.2 Dark mode

Class-based (`next-themes`, `.dark` on `<html>`), with tokens redefined under `.dark` rather than duplicated per component. Page background flips to `primary-950`, surfaces to `neutral-900`. Accent and WhatsApp colors are **not** dimmed in dark mode — the CTAs must stay the loudest thing on the screen in both themes.

### 4.3 Typography

- **Latin:** Inter, self-hosted via `next/font/google` → zero external request, zero layout shift
- **Devanagari:** Noto Sans Devanagari, same mechanism; applied by a `lang="ne"` selector so Nepali text gets correct matra rendering
- Both loaded with `display: 'swap'` and subset to the ranges actually used

| Step | Size / line-height | Use |
|---|---|---|
| `display` | 3.5rem / 1.1, weight 800, tracking −0.02em | Hero headline (desktop) |
| `h1` | 2.5rem / 1.15, 700 | Page titles |
| `h2` | 2rem / 1.2, 700 | Section headings |
| `h3` | 1.5rem / 1.3, 600 | Card titles |
| `h4` | 1.25rem / 1.4, 600 | Sub-headings |
| `body-lg` | 1.125rem / 1.7, 400 | Hero subtext, intros |
| `body` | 1rem / 1.65, 400 | Default |
| `body-sm` | 0.875rem / 1.6, 400 | Notes, captions |
| `caption` | 0.75rem / 1.5, 500, tracking 0.04em, uppercase | Eyebrows, labels |

Devanagari renders visually smaller at equal `font-size`, so `lang="ne"` gets a **+5% size bump** and slightly looser line-height. Fluid clamping (`clamp()`) on `display` and `h1` keeps the hero from wrapping badly on a 360px screen.

### 4.4 Spacing, radius, elevation

- Spacing on the 4px rhythm; section vertical padding `py-16` mobile → `py-24` desktop
- Container: `max-w-7xl`, `px-4` mobile / `px-6` tablet / `px-8` desktop
- Radius: `--radius-sm` 0.5rem · **`--radius` 0.75rem** (default) · `--radius-lg` 1rem · `--radius-xl` 1.5rem · `--radius-full` 9999px (pills, floating buttons)
- Shadows: `sm` for resting cards, `md` for hover lift, `lg` for the sheet/drawer, and a custom `--shadow-float` (`0 8px 24px rgb(0 0 0 / 0.18)`) for the floating action buttons so they read as above the page

### 4.4b Logo assets

The owner supplied a **presentation mockup** — two logo variants rendered on a dark gradient with a glow — rather than a source file, so there was no alpha channel to recover. The artwork is circular, which made a reliable extraction possible: locate the artwork bounds by colour saturation, crop to a square, snap the near-neutral glow to pure white, and mask everything outside the inscribed circle. The result is a clean circular badge whose own white disc is preserved, so it reads correctly on light *and* dark backgrounds.

| File | Size | Use |
|---|---|---|
| `public/logo-mark.png` | 512² | Header mark, hero |
| `public/icons/icon-{192,256,384,512}.png` | as named | PWA icon set |
| `public/icons/icon-maskable-512.png` | 512² | Android adaptive — brand-green bleed, mark at 72% safe zone |
| `public/icons/apple-icon.png` · `app/apple-icon.png` | 180² | iOS home screen |
| `app/icon.png` | 512² | Favicon (Next derives the sizes) |
| `public/images/logo-source.png` | 1536×1024 | The original upload, kept for re-export |

**The wordmark is rendered as live HTML text**, not shipped as an image: "Kawadi" in `primary-900` + "Rabi" in `accent`, mirroring the logo's own two-tone treatment. That keeps it crisp at every size, recolourable in dark mode, selectable and indexable — and avoids shipping a 2 MB gradient PNG to a bandwidth-constrained audience.

> If a true source logo exists (SVG, or PNG with transparency), dropping it in and re-exporting will beat any extraction from a mockup. Logged in §14.

### 4.5 Button variants

| Variant | Fill | Text | Used for |
|---|---|---|---|
| `primary` | `primary-800` | white | Main navigation actions ("View Rates") |
| `call` | `accent` | `neutral-950` | **Every `tel:` link, no exceptions** |
| `whatsapp` | `whatsapp` | `neutral-950` | **Every `wa.me` link, no exceptions** |
| `outline` | transparent, `primary-700` border | `primary-700` | Secondary actions |
| `ghost` | transparent | inherit | Nav items, icon buttons |
| `link` | none | `primary-700`, underline on hover | Inline text links |

Sizes `sm` (36px) · `default` (44px) · `lg` (52px) · `icon` (44×44). **No interactive target is under 44×44px** — that is the iOS/Android minimum, and this audience is ~90% mobile.

### 4.6 Motion

`AnimatedSection` applies a single house transition: fade + 24px rise, driven by a **CSS scroll-driven animation** (`animation-timeline: view()`), not JavaScript. Buttons scale on hover/press via CSS transforms. Floating actions get a delayed CSS keyframe entrance so they don't compete with the hero.

**Why CSS and not Framer Motion.** A motion component server-renders its hidden start frame (`opacity: 0`) and only reveals content once the bundle hydrates. For a lead-generation site on constrained mobile networks that is the wrong failure mode: a slow or broken bundle would leave the homepage blank and the two conversion buttons invisible. With the CSS approach, the default state of every element is *visible* and the animation is pure enhancement — so no-JS, an unsupported browser, and `prefers-reduced-motion` all converge on readable content.

Reduced motion is handled by wrapping the animation in `@media (prefers-reduced-motion: no-preference)`, plus the global reduced-motion block in `globals.css`. Because the rule lives in one stylesheet rather than in each component, no component can forget it.

---

## 5. Component inventory

### Layout
| Component | Purpose | Type |
|---|---|---|
| `AnnouncementBar` | Free-pickup message + tappable phone + WhatsApp; dismissible | Client |
| `Header` | Sticky; logo, nav, "View Rates" + Call CTA; condenses on scroll | Client |
| `MobileNav` | Hamburger → full-height Sheet with nav, locale, theme, both CTAs | Client |
| `Footer` | 4 columns (Company/Services/Coverage/Contact), social row, copyright | Server |
| **`FloatingActions`** | **Fixed bottom-right WhatsApp + Call; the site's core feature. Ships NO JS — CSS entrance + CSS hover, so the only two conversions on the site are usable the moment HTML paints, even if the bundle never loads** | **Server** |
| `LocaleToggle` | EN ⇄ NE preserving the current pathname | Client |
| `ThemeToggle` | Light / dark / system | Client |

### Home
| Component | Purpose |
|---|---|
| `Hero` | Headline, subtext, dual CTA, 4 trust badges |
| `RatesPreview` | Top `featured` items from `rates.json` → "See All Rates" |
| `WhatWeBuy` | 13-category responsive grid |
| `HowItWorks` | 4 numbered steps with a connecting line |
| `WhyChooseUs` | 6 differentiator cards |
| `CoverageArea` | Municipality chips + "not listed? call us" |
| `Testimonials` | 3 sample cards (name, area, quote, rating) |
| `CtaBand` | Full-width green closing band with both CTAs |

### Rates
| Component | Purpose |
|---|---|
| `RatesTable` | Category-grouped rendering of all items (server) |
| `RatesFilter` | Debounced search across EN+NE names + category pills (client) |
| `RateRow` | Icon, bilingual name, min–max range, unit, note |

### Shared
| Component | Purpose |
|---|---|
| **`CallButton`** | **The only place `tel:` is constructed** |
| **`WhatsAppButton`** | **The only place `wa.me` is constructed** |
| `SectionHeading` | Eyebrow + title + subtitle at consistent rhythm |
| `TrustBadge` | Icon + short label pill |
| `FaqAccordion` | Accessible accordion + emits `FAQPage` JSON-LD |
| `AnimatedSection` | Scroll-reveal wrapper. **Server component** — adds a `.reveal` class and nothing else; the animation is CSS scroll-driven, so it ships no JS and degrades to plain visible content |
| `JsonLd` | Serializes a schema object into a `<script type="application/ld+json">` |

Centralizing `tel:` and `wa.me` construction in two components is the single most important structural decision here: when Bikash changes his number, exactly one file (`lib/site-config.ts`) changes, and there is no chance of a stale number surviving in a forgotten corner of the site.

---

## 6. Page & section map

**Home `/[locale]`** — Hero → Rates preview → What We Buy → How It Works → Why Choose Us → Coverage → Testimonials → CTA band

**Rates `/[locale]/rates`** — Page header + "last updated" → search/filter → category-grouped table (Metals, Paper, Plastic, Battery, E-Waste) → disclaimer ("indicative; call for today's exact rate") → sticky mobile CTA bar

**Services `/[locale]/services`** — Header → service cards per scrap type → pickup process → what we *don't* accept (sets expectations, saves wasted calls) → FAQ (10+) → CTA

**About `/[locale]/about`** — Header → brand story → mission (clean Nepal, fair rates) → values → coverage → why trust us → CTA

**Contact `/[locale]/contact`** — Header → Call + WhatsApp cards → lead form → business hours → coverage/map → `LocalBusiness` JSON-LD

Nav order is `Home · Rates · Services · About · Contact`, with **Rates second** because it is the highest-intent page and the main reason a comparison shopper is here at all.

---

## 7. Data model — `data/rates.json`

```jsonc
{
  "updatedAt": "2026-07-27",     // ISO date, surfaced as "Rates updated: …"
  "currency": "NPR",
  "items": [
    {
      "id": "copper-wire",       // unique, kebab-case; used as React key + filter anchor
      "category": "metals",      // metals | paper | plastic | battery | ewaste
      "nameEn": "Copper Wire",
      "nameNe": "तामाको तार",
      "unit": "kg",              // kg | piece
      "minRate": 900,            // NPR, integer
      "maxRate": 1100,           // NPR, integer, must be >= minRate
      "noteEn": "Rate varies with purity",   // optional
      "noteNe": "शुद्धता अनुसार दर फरक हुन्छ", // optional
      "icon": "cable",           // any lucide-react icon name
      "featured": true           // optional; true → appears on the homepage preview
    }
  ]
}
```

### Validation

`lib/rates.ts` parses this through a Zod schema **at build time**:

```
RateItemSchema  → id, category enum, names non-empty, unit enum,
                  rates positive ints, maxRate >= minRate, icon non-empty
RatesFileSchema → updatedAt ISO date, currency, items min length 1
```

A malformed edit therefore fails `npm run build` with a precise path (`items[7].maxRate`), and CI blocks the deploy. It can never reach production as a broken table row. This is the entire reason Zod is a dependency.

### Editing contract

Changing a price = edit `minRate`/`maxRate` in `data/rates.json`, bump `updatedAt`, push. No other file is touched. Adding an item = append an object with a fresh `id`. Removing = delete the object. `lib/rates.ts` derives categories, ordering, and the homepage preview automatically.

Seed content for M1: ~30 items — Metals (iron, steel, copper wire, copper heavy, brass, aluminium, tin, lead), Paper (newspaper, cardboard, books, office paper), Plastic (PET bottles, hard plastic, pipe), Battery (car, inverter, dry cell), E-Waste (laptop, desktop, mobile, monitor, printer, AC, fridge, washing machine, motor, cable, circuit board).

---

## 8. Internationalization

- Locales `['en', 'ne']`, default `en`; `/` → `/en`
- `proxy.ts` (next-intl) detects locale and rewrites; `localePrefix: 'always'` so both languages always have their own canonical URL. Next 16 renamed this file convention from `middleware` to `proxy`; the contract (default export + `config.matcher`) is unchanged, and the handler still imports from `next-intl/middleware`
- All copy lives in `messages/en.json` and `messages/ne.json` under an identical key tree; a missing Nepali key surfaces as a build-time warning
- `<html lang>` is set per locale, which drives font selection and helps screen readers pick the right voice
- Every page emits `hreflang` alternates for `en`, `ne`, and `x-default`
- Rate item names come from `rates.json` (`nameEn`/`nameNe`), **not** from message files — data stays with data

Why locale-prefixed rather than a client toggle: a Nepali-language query like "काठमाडौं कवाडी रेट" can only rank if there is a distinct, crawlable, Nepali URL to rank. A client-side toggle gives Google one page in one language and throws away half the organic reach.

---

## 9. SEO plan

**Per-page metadata** via the App Router `generateMetadata` API: localized title/description, canonical, `hreflang` alternates, OG (`type`, `locale`, `url`, `siteName`, 1200×630 image), Twitter `summary_large_image`.

**Structured data** (`lib/schema.ts` → `JsonLd`):
- `LocalBusiness` — sitewide: name, phone, email, `areaServed` (the Valley municipalities), `openingHoursSpecification`, `sameAs` (socials), `priceRange`
- `FAQPage` — on Services, generated from the same array that renders the accordion, so the two can't drift
- `BreadcrumbList` — on all inner pages
- `WebSite` — on Home

**Generated files:** `app/sitemap.ts` emits every route × every locale with `alternates.languages`; `app/robots.ts` allows all and points to the sitemap.

**Target keywords:** *kawadi Kathmandu, scrap buyer Nepal, scrap rate today Nepal, kabadi wala near me, e-waste recycling Kathmandu*, plus Nepali equivalents (*कवाडी, स्क्र्याप रेट, फोहोर किन्ने*).

**On-page discipline:** exactly one `<h1>` per page, descriptive `alt` on every image, semantic landmarks (`header`/`nav`/`main`/`footer`), and no text baked into images — the rates table is real HTML precisely so it is indexable.

---

## 10. PWA plan

- `app/manifest.ts` — name "KTM Kawadi — Scrap Pickup & Best Rates", short name "KTM Kawadi", `display: standalone`, `theme_color` `#0F5132`, `background_color` `#FFFFFF`, `start_url: /en`
- Icons at 192/256/384/512 plus a maskable 512 (Android adaptive) and an Apple touch icon
- Offline fallback page telling the user the phone number still works without data — the most useful possible offline state for this business
- Service worker kept minimal: precache the shell + last-viewed rates; **never** cache-first the rates page, so a stale price is never shown as current
- Installability verified via Lighthouse's PWA audit in M6

---

## 11. Performance & accessibility targets

**Budget:** LCP < 2.0s (4G), CLS < 0.05, INP < 200ms, initial JS < 120KB gzipped, Lighthouse mobile ≥ 95 on all four categories.

**How:** all pages statically generated; server components by default with `"use client"` only on the seven genuinely interactive components; `next/image` with explicit dimensions and AVIF/WebP; hero image `priority`, everything else lazy; self-hosted subset fonts; Framer Motion imported only in client components so it stays out of the server bundle; analytics via `next/script` with `strategy="afterInteractive"`, behind env vars, absent entirely in dev.

**Accessibility (WCAG 2.1 AA):** `aria-label` on every icon-only control (both floating buttons especially), visible focus rings meeting 3:1, full keyboard operation of nav/sheet/accordion/filter, focus trap + Escape in the mobile sheet, `prefers-reduced-motion` honored globally, all body text ≥ 4.5:1 in both themes, form inputs with real `<label>`s and inline errors tied via `aria-describedby`.

---

## 12. CI/CD plan

`.github/workflows/deploy.yml`, triggered on push to `main` and on PRs:

1. Checkout → setup Node 20 with npm cache
2. `npm ci`
3. `npm run lint`
4. `npx tsc --noEmit`
5. `npm run build` ← this is where the Zod rates validation runs, so a bad price edit fails here
6. Deploy to Vercel (`amondnet/vercel-action` or the Vercel CLI) — production on `main`, preview on PRs

**Required GitHub secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

**Env vars** (`.env.example`, all optional and app-degrades-gracefully without them): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_FORMSPREE_ID`.

### DNS — Cloudflare

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `ktmkawadi` | `cname.vercel-dns.com` | **DNS only (grey cloud)** |

Proxy must stay **off**: orange-cloud proxying in front of Vercel breaks certificate issuance and double-caches the CDN. Then in Vercel → Project → Settings → Domains, add `ktmkawadi.bikashkadayat.com.np` and wait for verification. Result: `https://ktmkawadi.bikashkadayat.com.np`.

### Git policy

Claude does not run `git commit`, `git push`, or any history-modifying command in this project, and adds no `Co-Authored-By` trailer anywhere. All pushes are performed manually by the owner.

---

## 13. Cost

| Layer | Service | Cost |
|---|---|---|
| Framework / hosting | Next.js on Vercel Hobby | Free |
| CI | GitHub Actions (public repo) | Free |
| DNS | Cloudflare | Free |
| Forms | WhatsApp deep link (Formspree optional) | Free |
| Analytics | GA4 + Microsoft Clarity | Free |
| Fonts / icons | Self-hosted Inter + Noto, lucide-react | Free |
| **Total** | | **NPR 0/month** (excluding the domain) |

---

## 14. Open items for later milestones

1. **Real contact details** — the phone and WhatsApp numbers are real (`+9779823525098` / `9779823525098`). Still placeholder: `info@ktmkawadi.bikashkadayat.com.np` and the `#` socials. One file: `lib/site-config.ts`. Socials still set to `#` are hidden by the Footer rather than rendered as dead links. Note `public/offline.html` duplicates the number by necessity — it is static HTML served by the service worker with no access to the config.
2. **Real rate values** — seed data in M1 is realistic but illustrative and must be replaced before launch.
2b. **`framer-motion` is installed but unused** — no imports anywhere. Safe to remove (`npm uninstall framer-motion`); kept only in case a later feature needs genuinely interactive motion that CSS cannot express. See §15.
3. **Logo source file** — the current assets are extracted from a presentation mockup (§4.4b). A real SVG or transparent PNG would produce a sharper mark, especially at 192px and below. The extraction script lives at `docs/extract-logo.py` and can be re-pointed at a better source.
4. **Testimonials** — sample data, clearly placeholder; must be replaced with genuine reviews before going live, since fabricated testimonials on a live business site are a real credibility and legal risk.
5. **Default locale** — currently `en`. If Nepali should be the landing language, it is a one-line change in `i18n/routing.ts`.

---

## 15. What actually got built (M1–M6)

This section records where the implementation **diverged from the plan above**, and why. Where the two disagree, this section is correct.

### Platform

| Planned | Built | Why |
|---|---|---|
| Next.js 15 | **Next.js 16.2.12** | `create-next-app@latest` now installs 16. Same App Router; pinning back is a one-line change |
| `middleware.ts` | **`proxy.ts`** | Next 16 renamed the file convention. Same contract (default export + `config.matcher`); handler still imports from `next-intl/middleware` |
| `eslint` key in `next.config.ts` | *removed* | Next 16 dropped it along with `next lint`. Linting is a standalone `npm run lint` that CI runs **before** `npm run build` |
| Formspree fallback | *not built* | The contact form composes a `wa.me` link and hands off. No backend, no third-party service, no stored personal data — the fallback would have been dead config |
| `framer-motion` for animation | *installed but unused* | See "Animation" below |

### Animation — the most consequential decision

**No JavaScript animation anywhere.** Framer Motion server-renders its hidden start frame (`opacity: 0`) and only reveals content once the bundle hydrates.

This was caught in M2 by screenshotting the built page: the floating Call/WhatsApp buttons — the site's only two conversions — shipped as `style="opacity:0"` and were invisible until hydration. On a lead-generation site aimed at constrained mobile networks that is the worst possible component to make JS-dependent. The same pattern applied to `AnimatedSection` would have blanked the entire homepage.

Both now use CSS:

- `FloatingActions` — CSS keyframe entrance, CSS hover. Ships **zero JS**.
- `AnimatedSection` — CSS scroll-driven animation (`animation-timeline: view()`), a **server component** that adds one class.

`.reveal` animates **transform only, never opacity**. An earlier version faded 0 → 1, which left body text at partial opacity for its whole scroll-entry range; composited against the background that measured as low as **2.8:1** and Lighthouse correctly failed it. Animating position alone keeps every string at full contrast and removes the last way content could fail to appear.

The rule: **never server-render `opacity: 0` for real content.** Every failure mode — no JS, unsupported browser, reduced motion — must land on *visible*.

### Additions not in the original plan

| File | Purpose |
|---|---|
| `app/not-found.tsx` | Global 404 for paths outside any locale. Supplies its own `<html>`/`<body>` because the root layout deliberately does not |
| `lib/metadata.ts` | `buildPageMetadata()`. Next inherits the parent `openGraph` wholesale, so setting only `title` on a child page left every inner page previewing as the **homepage** when shared on WhatsApp |
| `lib/icons.ts` | Explicit kebab-case → lucide map, so an unknown icon name is a build error, not a blank space |
| `lib/faqs.ts` | Q&A pairs in TS, not the message files — a half-translated entry becomes a type error |
| `components/shared/JsonLd.tsx` | Escapes `<` so a string containing `</script>` cannot break out |
| `public/sw.js`, `public/offline.html` | Offline fallback only. **No caching of pages** — a stale cached rate is worse than no page |
| `docs/make-og.py` | Generates the two OG cards. Static PNGs, because the Nepali card needs Devanagari shaping |

### Accessibility decisions

- Gold and WhatsApp-green buttons carry **near-black** text (11.5:1 / 9.96:1). White would be 1.72:1 and 1.98:1 — both fail badly.
- Active-nav highlight uses `primary-900` in dark mode, **not** `primary-950`: the latter *is* the dark background, so the highlight was invisible.
- Accessible names **contain** their visible text (WCAG 2.5.3). "Call Now — KTM Kawadi", not "Call KTM Kawadi now", so speech input matching the visible "Call Now" works.
- Star ratings use visually-hidden text, not `aria-label` — which is prohibited on a generic `<p>`.
- `/rates` renders a mobile sticky CTA and suppresses the floating buttons there via `body:has([data-sticky-cta])`, so a 390px screen shows **one** set of conversion buttons, not two overlapping.

### Verified

Build, typecheck and lint clean with **zero warnings**. 10 routes prerendered. Message files at parity (204 keys each).

Lighthouse: desktop **100 / 100 / 100**, mobile **97 / 100 / 100** (perf / a11y / best-practices). SEO shows 92 only because `canonical` points at the production domain while testing on localhost.

Mobile LCP went 3.6s → 2.6s by setting `preload: false` on Noto Sans Devanagari: next/font was preloading a **121 KB** Devanagari file on English pages that never render it.

Checked by driving a real browser, not by reading source: rates search/filter (including Nepali "तामा" matching on the English page), FAQ accordion single-open behaviour, contact form message composition, mobile-nav focus trap and Escape-restores-focus, service worker registration, offline fallback **with the server genuinely stopped**, and a keyboard-only pass (skip link first, every stop with a visible focus ring, all widgets operable).

Editing one `minRate` in `data/rates.json` was confirmed to update `/en/rates`, `/ne/rates` and both homepages with no other edit; deliberately corrupting the file was confirmed to fail the build with exact paths.

---

*M0–M6 complete.*
