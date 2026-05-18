# 27

Private, fast, ephemeral chat for the web.

## ✨ What's New - v2.0

The main interface has been completely redesigned with:

- **🎯 Clear Primary Action**: Purple gradient button that stands out
- **📐 Better Visual Hierarchy**: Organized from most to least important
- **✨ Elegant Design**: Improved spacing and smooth interactions
- **🎨 Preserved Identity**: Same dark, private aesthetic
- **📱 Enhanced Mobile**: Optimized responsive experience

[See detailed changes →](REDESIGN_NOTES.md) | [Design comparison →](DESIGN_COMPARISON.md)

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

## Features

- ✅ No sign-up, email, or phone number
- ✅ Users connect through a numeric public code
- ✅ Messages expire after 5 hours
- ✅ Anonymous temporary rooms and links
- ✅ End-to-end encryption ready
- ✅ Dark mode by default
- ✅ Fully responsive (mobile-first)
- ✅ PWA support

## Documentation

### For Developers
- [Quick Start Guide](QUICK_START.md) - Get started quickly
- [Complete Guide](COMPLETE_GUIDE.md) - Comprehensive documentation
- [Redesign Notes](REDESIGN_NOTES.md) - Technical details

### For Designers
- [Design Comparison](DESIGN_COMPARISON.md) - Before/after visual comparison
- [Summary](SUMMARY.md) - Overview of changes

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Supabase (Anonymous Auth + Realtime)
- **Hosting**: Static (GitHub Pages, Netlify, Vercel)

## Customization

### Colors

```css
:root {
  --accent-purple: #b48cff;
  --accent-purple-bright: #c49fff;
}
```

### Texts

```javascript
const i18n = {
  ar: {
    heroTagline: "خاص. سريع. يختفي.",
    // ...
  }
}
```

See [Complete Guide](COMPLETE_GUIDE.md) for more customization options.

## Optional Enhancements

Add these files for extra effects:

```html
<link rel="stylesheet" href="enhancements.css" />
<script src="enhancements.js"></script>
```

Features:
- ✨ Fade-in animations
- 💫 Pulse effects
- 🌟 Glow effects
- 🎯 Ripple effects
- ⌨️ Keyboard shortcuts

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- Supabase Anonymous Auth and Realtime are used by `public/app.js`
- All conversations auto-delete after 5 hours of inactivity
- No data is stored permanently
- Privacy-first design

## License

MIT

## Credits

Designed and developed with focus on privacy, simplicity, and elegance.

---

**v2.0** - Enhanced UI with improved clarity and organization ✨
