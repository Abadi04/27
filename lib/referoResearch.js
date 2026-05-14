export const referoSources = [
  {
    id: "Telegram iOS chats",
    refero: "1cd24653-ba85-404a-8555-d26ddf563378 / dd252cb6-ad13-42e4-b0cb-a8a8ff00e227",
    pattern: "iOS top navigation, search field, avatar-led chat rows, unread badges, bottom tab bar.",
  },
  {
    id: "Vimeo web messages",
    refero: "22ea7710-007f-4114-9312-74af8ab65654",
    pattern: "Web message management page with tabs, filters, empty state, and right action sidebar.",
  },
  {
    id: "X web direct messages flow",
    refero: "Flow 927",
    pattern: "Three-column web shell, empty inbox CTA, new-message modal, chat detail, report/block controls.",
  },
  {
    id: "Missive web conversation",
    refero: "40823958-197f-4bbf-aa12-cfdf507a0c9d",
    pattern: "Dense desktop communication layout with left navigation, inbox list, and threaded detail pane.",
  },
  {
    id: "Mozi iOS connect/share",
    refero: "b83b0ba5-024a-418b-865e-e2759640ec00 / Flow 4145",
    pattern: "Single-column share screen with profile card, large QR code, invite-link button, and privacy note.",
  },
  {
    id: "Instagram iOS QR profile",
    refero: "fa1930c4-40d7-47a6-b576-2a9c2c247390",
    pattern: "QR card centered with paired share/copy actions below.",
  },
  {
    id: "Instagram web message controls",
    refero: "2e596d7f-90af-4ece-8a9b-7dd5ce677d49 / 73c529fe-5455-43f2-9ffe-18736bf839d9",
    pattern: "Three-column settings IA with radio controls for message request privacy.",
  },
  {
    id: "Telegram iOS notifications",
    refero: "aa1bb28a-7306-40ed-a819-2b1adb58f457",
    pattern: "Grouped settings rows on light gray canvas with icons, toggles, and uppercase section labels.",
  },
  {
    id: "Telegram iOS privacy",
    refero: "5a478b87-dea0-4a1a-affd-61b37ba752ab",
    pattern: "Privacy/security rows with right-aligned values, chevrons, and unknown-sender controls.",
  },
  {
    id: "Ivory iOS block/report",
    refero: "30846bc7-ec8f-4896-b3df-25dd4a8ed1f3",
    pattern: "Bottom-sheet style block/report form with avatar identity, toggles, and confirm action.",
  },
  {
    id: "GoFundMe web report modal",
    refero: "ae5aa835-599f-4bba-bba4-b944829151de",
    pattern: "Centered report dialog, dim backdrop, stacked dropdowns, subdued submit state.",
  },
  {
    id: "Square Messages Plus",
    refero: "ba4df9a6-c671-4368-9f51-a8753f796316 / 73423778-4000-41d7-ba17-f012a8a87596 / Flow 1946",
    pattern: "Two-column plan comparison, trial CTA, and simple success confirmation.",
  },
  {
    id: "TikTok iOS subscription",
    refero: "4ee573ad-b7ac-4232-ab0d-18b98dbc5502",
    pattern: "Bottom modal with selectable plan cards, agreement row, restore link, and bright purchase CTA.",
  },
  {
    id: "Substack and Hashnode auth",
    refero: "Flow 4511 / Flow 3913",
    pattern: "Email-first or magic-link authentication with check-your-inbox confirmation.",
  },
];

export const designRules = {
  desktop: "Use a fixed left rail, a 320-390px inbox/list pane, and a flexible detail pane for messaging work.",
  tablet: "Collapse the left rail into a compact icon rail and keep list/detail as two columns.",
  mobile: "Use iOS-style headers, single-column screens, large touch rows, and a bottom tab bar.",
  type: "System sans stack; 12-13px meta, 14-16px body, 18-22px screen titles, 32-44px landing headline.",
  color: "White and #F2F2F7/#F7F8FA surfaces, near-black text, #0A7AFF/#1D9BF0 actions, green success, pink premium/danger only when needed.",
  spacing: "8px base rhythm; 12-16px row gaps, 20-24px screen gutters, 44-52px touch targets.",
  states: "Empty states pair a bold title, gray explanatory copy, and one primary action; errors/reporting use focused modals or bottom sheets.",
};
