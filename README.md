# 27

Private, fast, ephemeral chat for the web.

## Live Preview

GitHub Pages:

```text
https://Abadi04.github.io/27/
```

## Local Preview

The production-ready static app is in `public/`.

```bash
cd public
python3 -m http.server 4188
```

Then open:

```text
http://localhost:4188/
```

## Notes

- No sign-up, email, or phone number.
- Users connect through a numeric public code.
- Messages expire after 5 hours.
- Supabase Anonymous Auth and Realtime are used by `public/app.js`.
