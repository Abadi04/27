# 27app — Design & Implementation Decisions

Reference for maintaining visual and technical consistency across sessions.

---

## Visual Identity

- **Theme**: Dark luxurious, near-black background `#060810` with subtle dark blue tint
- **Primary accent**: Dark blue (`#131a28` home-accent, `#1a2a42` gradients) — no purple, no pink, no neon
- **Text hierarchy**: `#eaeef3` primary, `rgba(220,230,245,0.55)` secondary, `rgba(200,215,235,0.3)` muted
- **Luxury = restraint**: Spacing, calm, proportions, hierarchy. No glow blobs, no landing-page conversion patterns
- **Tagline**: "خاص. سريع. يختفي." — white, prominent, clean

## Typography

- **Font stack**: SF Pro Display, system fallbacks
- **Weights**: 600 (labels), 700 (headings), 800 (logo only) — no non-standard weights
- **Logo**: System font, weight 800, `-0.03em` tracking — no cursive, no rotation

## Colors — Do NOT Use

| Forbidden | Reason |
|-----------|--------|
| Purple/violet | Contradicts dark-blue identity |
| Pink/magenta | Too playful |
| Neon anything | Breaks luxury feel |
| Bright glows | Cheap look on dark backgrounds |

## CSS Variables (`:root`)

```
--bg-primary: #060810
--bg-card: rgba(255,255,255,0.035)
--bg-card-hover: rgba(255,255,255,0.06)
--bg-input: rgba(255,255,255,0.05)
--border-subtle: rgba(255,255,255,0.07)
--border-focus: rgba(90,130,200,0.45)
--text-primary: #eaeef3
--text-secondary: rgba(220,230,245,0.55)
--text-muted: rgba(200,215,235,0.3)
--home-accent: #131a28
--radius-md: 14px
--radius-full: 999px
--transition-fast: 0.18s ease
--transition-med: 0.3s ease
```

## Component Decisions

- **Primary buttons** (`#startBtn`, `#entrySendBtn`, `#saveSettingsBtn`): `linear-gradient(135deg, #1a2a42, #121c2e)`
- **Avatars**: Desaturated (35% saturation, 30% secondary hue) — elegant, not childish
- **Chat items**: 16px radius, 20px padding, `--transition-med`
- **Empty state**: SVG chat icon via `::before`, solid border, 18px radius, background fill
- **Border-radius**: Normalized to `var(--radius-md)` (14px) throughout

## Animations

- **Principle**: Calm, slow breathing — never urgent or flashy
- **Status dot pulse**: 3s ease-in-out
- **Status breathe**: 4s
- **Timer pulse critical**: 2.5s
- **TTL dot**: 2s
- All transitions: `0.18s` (fast) or `0.3s` (med) — no jarring jumps

## iPhone / iOS

- `viewport-fit=cover` in meta
- `env(safe-area-inset-*)` on: header, main-content, message-form, footer, bottom sheets
- All touch targets: min 44px height
- `touch-action: manipulation` on all interactive elements
- `-webkit-tap-highlight-color: transparent`

## RTL / i18n

- Arabic (`lang="ar" dir="rtl"`) is primary
- English supported via `i18n` object in `app.js` with `currentLang` toggle
- `text-align: start/end` (not left/right)
- All elements use `id` attributes for i18n text injection

## TTL / Timer System

- `formatTTL(ms)` in `app.js` returns `{ text, cls }`
- Classes: `.message-ttl` (default), `.ttl-warning` (amber, <30min), `.ttl-critical` (red, <1min)
- Timer shown inline in message timestamp

## Architecture

- Vanilla JS SPA — no framework
- Supabase backend (PostgreSQL + Realtime)
- Pure CSS with custom properties — no preprocessor
- Hash-based routing + URL params for temp links
- PWA: `manifest.json` + service worker

## Cache Busting

- CSS/JS links use `?v=` query param in `index.html`
- **Must update** the version string after every deploy that changes CSS or JS
- Current: `?v=hotfix-1`

## Pitfalls Learned

1. **Never rebase with `-X theirs`** on this repo — remote may have old variable names that break the theme
2. **`--bg-base` does not exist** — always use `--bg-primary`
3. **Duplicate CSS selectors** cause edit failures — grep before adding new rules
4. **Non-standard font-weights** (650, 680, etc.) don't render on most devices — stick to 600/700/800
