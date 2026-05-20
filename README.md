# 27

Private, fast, ephemeral chat for the web.

## Overview

27 is a privacy-first chat app: no sign-up, no email, no phone number. People
connect through a numeric public code, and messages auto-delete after a set
time-to-live (up to 5 hours).

> **Privacy note:** Messages are protected by Supabase Row Level Security and
> are auto-deleted after their TTL, but they are **not** end-to-end encrypted —
> they are stored in plaintext in the database and are readable by the project
> operator. Do not advertise this app as "encrypted." End-to-end encryption is
> tracked as a future enhancement (see Roadmap).

## Live Preview

GitHub Pages: `https://abadi04.github.io/27/`

## Local Preview

The production-ready static app is in `public/`.

```bash
npm run serve   # serves public/ at http://localhost:4188/
```

## Build

`public/app.js` is a bundle generated from `public/js/` via esbuild. After
editing anything under `public/js/`, regenerate the bundle and bump the cache
version string in `index.html` (`app.js?v=...`):

```bash
npm install        # first time only
npm run build      # bundles js/app-entry.js -> app.js
```

## Features

- ✅ No sign-up, email, or phone number
- ✅ Connect through a numeric public code
- ✅ Messages expire (TTL up to 5 hours); burn-after-read mode
- ✅ Anonymous temporary rooms and links
- ✅ Dark theme by default
- ✅ Fully responsive (mobile-first), RTL/Arabic primary + English
- ✅ PWA with offline app-shell caching

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no framework)
- **Backend**: Supabase (Anonymous Auth + Realtime + Postgres RLS)
- **Hosting**: Static (GitHub Pages, Netlify, Vercel)

## Design

Visual identity, colour tokens, and component decisions live in
[DESIGN-DECISIONS.md](DESIGN-DECISIONS.md). Keep that file as the single source
of truth and update it alongside any CSS change.

## Database

Apply `supabase-schema.sql` in the Supabase SQL editor. Row Level Security is
enabled on every table; the `profiles` select policy is scoped to your own
profile, discoverable (code-visible) profiles, and existing conversation
partners only.

## Roadmap

- [ ] True end-to-end encryption (client-side `crypto.subtle`, key exchange)
- [ ] Move the Supabase project credentials out of source where feasible
- [ ] Automate `app.js` bundling in CI instead of committing the artifact

## Browser Support

Chrome/Edge 90+, Firefox 88+, Safari 14+, and mobile browsers (iOS Safari,
Chrome Mobile).

## License

MIT
