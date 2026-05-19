import { FIVE_HOURS } from "./config.js";
import { state } from "./state.js";
import { hashHue, createMessageId } from "./utils.js";
import { i18n } from "./i18n.js";

export function normalizeMessage(message, chatId = "demo", index = 0, fallbackExpiresAt = Date.now() + FIVE_HOURS) {
  return {
    id: message.id || `${chatId}-${index}-${Math.abs(hashHue(message.text || ""))}`,
    burnAfterRead: Boolean(message.burnAfterRead),
    expiresAt: message.expiresAt || new Date(fallbackExpiresAt).toISOString(),
    createdAt: message.createdAt || new Date(fallbackExpiresAt - FIVE_HOURS).toISOString(),
    ...message,
  };
}

export function createDemoChat(id, arName, enName, online, arMessages, enMessages) {
  const lastMessageAt = Date.now() - Math.floor(Math.random() * 25 + 1) * 60 * 1000;
  const expiresAt = lastMessageAt + FIVE_HOURS;
  return {
    id,
    online,
    names: { ar: arName, en: enName },
    otherProfile: { id, display_name: arName, public_code: id, avatar_seed: arName },
    lastMessageAt,
    expiresAt,
    messages: {
      ar: arMessages.map((m, i) => normalizeMessage(m, `${id}-ar`, i, expiresAt)),
      en: enMessages.map((m, i) => normalizeMessage(m, `${id}-en`, i, expiresAt)),
    },
  };
}

export const demoChats = [
  createDemoChat("sara", "سارة", "Sara", true, [
    { type: "incoming", text: "جاهز؟ الرسالة تختفي بعد خمس ساعات.", time: "قبل 2 د" },
    { type: "outgoing", text: "تمام، هذا بالضبط اللي أحتاجه.", time: "الآن" },
  ], [
    { type: "incoming", text: "Ready? This message disappears after five hours.", time: "2m ago" },
    { type: "outgoing", text: "Perfect, that is exactly what I need.", time: "Now" },
  ]),
  createDemoChat("khaled", "خالد", "Khaled", true, [
    { type: "incoming", text: "أرسل الرقم فقط وندخل مباشرة.", time: "قبل 8 د" },
  ], [
    { type: "incoming", text: "Send the code only and we jump straight in.", time: "8m ago" },
  ]),
  createDemoChat("noura", "نورة", "Noura", false, [
    { type: "incoming", text: "بدون تسجيل؟ ممتاز.", time: "قبل 45 د" },
  ], [
    { type: "incoming", text: "No login? Nice.", time: "45m ago" },
  ]),
];

// Set the third chat to be near expiry
demoChats[2].lastMessageAt = Date.now() - (FIVE_HOURS - 18 * 60 * 1000);
demoChats[2].expiresAt = Date.now() + 18 * 60 * 1000;
Object.values(demoChats[2].messages).flat().forEach((msg) => {
  msg.expiresAt = new Date(demoChats[2].expiresAt).toISOString();
});

export function createDemoConversationFromCode(code) {
  const id = `code-${code}`;
  const existing = state.chats.find((c) => c.id === id);
  if (existing) return existing;

  const name = state.currentLang === "ar"
    ? `${i18n.ar.userPrefix} ${code}`
    : `${i18n.en.userPrefix} ${code}`;

  const chat = {
    id,
    online: true,
    name,
    otherProfile: { id, display_name: name, public_code: code, avatar_seed: name },
    lastMessageAt: Date.now(),
    expiresAt: Date.now() + FIVE_HOURS,
    messages: { neutral: [] },
  };

  state.chats.unshift(chat);
  return chat;
}

export function appendDemoMessage(conversationId, message, onChange) {
  const chat = [...state.chats, ...state.burnedChats, ...state.blockedChats]
    .find((c) => c.id === conversationId);
  if (!chat) return;

  if (!chat.messages.neutral && !chat.messages[state.currentLang]) {
    chat.messages.neutral = [];
  }
  const target = chat.messages.neutral || chat.messages[state.currentLang];
  const expiresAt = message.expiresAt || new Date(Date.now() + FIVE_HOURS).toISOString();

  target.push({
    id: message.id || createMessageId("demo"),
    createdAt: new Date().toISOString(),
    ...message,
    expiresAt,
  });
  chat.lastMessageAt = Date.now();
  chat.expiresAt = new Date(expiresAt).getTime();

  onChange?.(chat);
}
