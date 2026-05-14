# Refero Research And UX Plan

## Refero Results

1. Telegram iOS Chats, `1cd24653-ba85-404a-8555-d26ddf563378` and `dd252cb6-ad13-42e4-b0cb-a8a8ff00e227`: iOS header with left edit action, centered title, right compose icons, search bar, avatar rows, unread badges, bottom tab bar.
2. Vimeo web Messages, `22ea7710-007f-4114-9312-74af8ab65654`: web inbox with top search/actions, message tabs, filters, empty state, and a right action sidebar.
3. X web Direct Messages, Flow `927`: three-column desktop shell, conversation list, message detail, new-message modal, conversation settings, block/report/delete actions.
4. Missive web conversation, `40823958-197f-4bbf-aa12-cfdf507a0c9d`: dense communication workspace with left navigation, inbox list, right detail pane, reply composer, attachments/actions.
5. Mozi iOS share link, `b83b0ba5-024a-418b-865e-e2759640ec00`, Flow `4145`: profile card, centered QR, invite-link button, explanatory privacy text.
6. Instagram iOS QR profile, `fa1930c4-40d7-47a6-b576-2a9c2c247390`: QR card with paired share/copy actions and simple top close/scanner controls.
7. Instagram web message controls, `2e596d7f-90af-4ece-8a9b-7dd5ce677d49` and `73c529fe-5455-43f2-9ffe-18736bf839d9`: three-column settings IA with message request radio groups.
8. Telegram iOS Notifications, `aa1bb28a-7306-40ed-a819-2b1adb58f457`: light gray settings canvas, white grouped cards, icons, toggles, uppercase section labels.
9. Telegram iOS Privacy, `5a478b87-dea0-4a1a-affd-61b37ba752ab`: privacy rows with right-aligned values, chevrons, and unknown-sender controls.
10. Ivory iOS Block/Report, `30846bc7-ec8f-4896-b3df-25dd4a8ed1f3`: bottom-sheet style safety form with avatar identity, block/report toggles, and confirm action.
11. GoFundMe web Report, `ae5aa835-599f-4bba-bba4-b944829151de`: centered report modal over dim backdrop with stacked form controls and subdued submit flow.
12. X web Report DM, `ee27d0f4-4f29-4b04-93b0-cfa3e0a4ddb6`: report issue modal with two high-level categories and learn-more support.
13. Square Messages Plus, `ba4df9a6-c671-4368-9f51-a8753f796316`, `73423778-4000-41d7-ba17-f012a8a87596`, Flow `1946`: two-column plan comparison, trial CTA, success confirmation.
14. TikTok iOS subscription, `4ee573ad-b7ac-4232-ab0d-18b98dbc5502`: bottom modal with selectable plan cards, agreement row, restore link, bright purchase CTA.
15. Substack iOS email confirmation, Flow `4511`, and Hashnode web magic-link auth, Flow `3913`: email-first auth, check-your-inbox confirmation, dashboard landing.

## Extracted Rules

- Desktop layout: fixed left navigation rail, 320-390px inbox/list pane, flexible detail pane. Use this for inbox, settings, and message detail.
- Tablet layout: compact left rail plus list/detail columns; keep the same hierarchy and avoid desktop-only controls.
- Mobile layout: iOS top header, single-column screens, large rows, bottom tab bar, modals/bottom sheets for safety and subscription.
- Typography: system sans; 12-13px metadata, 14-16px rows/body, 18-22px screen titles, 32-44px landing headline.
- Color: white content surfaces, #F2F2F7 and #F7F8FA app canvas, near-black primary text, #0A7AFF/#1D9BF0 primary action, green success, pink only for premium/danger emphasis.
- Spacing: 8px base rhythm, 12-16px row gaps, 20-24px gutters, 44-52px touch targets.
- Empty/error states: centered or pane-local empty states with one action; report/block errors in focused modal or iOS-style sheet.

## UX Plan

- Landing: product-first page with profile-link preview and inbox preview, based on Hashnode auth entry plus Mozi/Telegram product surfaces.
- Signup/login: centered email/password form plus one-time-code confirmation, based on Substack, Hashnode, Teal, Instagram, and Omio auth patterns.
- Main inbox: web three-column layout and iOS bottom-tab translation, based on X, Missive, Vimeo, and Telegram.
- Message details: sender-anonymous header, message body, reply composer, safety notice, report action, based on X and Missive.
- Profile/share page: profile card, QR, invite link, share/copy actions, privacy note, based on Mozi and Instagram QR.
- Notifications: grouped settings cards with toggles, based on Telegram notifications.
- Settings: three-column web settings IA with radio controls, privacy rows, block/report entry, and billing upgrade, based on Instagram and Telegram.
- Block/report: centered web modal and mobile-sheet structure with predefined categories and optional context, based on GoFundMe, X, and Ivory.
- Paywall: plan selection modal with trial CTA and restore link, based on Square and TikTok.
