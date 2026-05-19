import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { $, isLiveMode, isUuid, showToast } from "./utils.js";
import {
  getChat, getChatName, renderChats, renderConversationState,
} from "./render.js";
import { loadConversation } from "./conversations.js";
import {
  stopChatCountdown,
} from "./messages.js";
import { handleAsyncError } from "./utils.js";
import { demoChats } from "./demo.js";
import { updatePrivacyModeUI } from "./settings.js";

// ============================================================
// Home (chat list)
// ============================================================
export function showHome() {
  stopChatCountdown();
  // heroSection stays hidden — FAB handles new chats
  const divider = document.querySelector(".section-divider");
  if (divider) divider.hidden = true;
  $("chatsSection").hidden = false;
  $("chatView").hidden = true;
  $("settingsView").hidden = true;
}

// ============================================================
// Open conversation
// ============================================================
export async function openChat(chatId) {
  const chat = getChat(chatId);
  const t = i18n[state.currentLang];

  if (!chat) {
    showToast(t.expired);
    showHome();
    renderChats();
    window.location.hash = "";
    return;
  }

  $("heroSection").hidden = true;
  const chatDivider = document.querySelector(".section-divider");
  if (chatDivider) chatDivider.hidden = true;
  $("chatsSection").hidden = true;
  $("settingsView").hidden = true;
  $("chatView").hidden = false;
  $("chatView").dataset.activeChat = chat.id;
  $("chatViewName").textContent = getChatName(chat);
  $("chatViewStatus").textContent = t.loadingConversation;
  $("messageForm").hidden = false;
  const privacyBar = document.querySelector(".chat-privacy-bar");
  if (privacyBar) privacyBar.hidden = false;

  state.privacyMode = chat.privacyMode || "5h";
  $("privacyModeSelect").value = state.privacyMode;
  updatePrivacyModeUI();
  window.location.hash = `#chat/${encodeURIComponent(chat.id)}`;

  if (chat.burned || chat.status === "expired") {
    renderConversationState("expired");
    return;
  }
  if (chat.status === "blocked") {
    renderConversationState("blocked");
    return;
  }

  try {
    await loadConversation(chat.id, () => {
      showHome();
      window.location.hash = "";
    });
  } catch (error) {
    handleAsyncError(error, t.errorChats);
  }
}

// ============================================================
// Close conversation
// ============================================================
export async function closeChat() {
  const chat = getChat(state.activeConversationId);

  if (chat?.privacyMode === "close" && state.chats.some((c) => c.id === chat.id)) {
    if (isLiveMode() && isUuid(chat.id)) {
      await db.from("messages").delete().eq("conversation_id", chat.id);
    } else {
      chat.messages = { neutral: [] };
    }
    chat.burned = true;
    state.burnedChats.unshift({ ...chat, burned: true });
    state.chats = state.chats.filter((c) => c.id !== chat.id);
  }

  if (state.activeSubscription && db) {
    db.removeChannel(state.activeSubscription).catch(() => {});
    state.activeSubscription = null;
  }

  state.activeConversationId = "";
  showHome();
  window.location.hash = "";
}

// ============================================================
// Settings
// ============================================================
export function openSettings() {
  $("heroSection").hidden = true;
  const settingsDivider = document.querySelector(".section-divider");
  if (settingsDivider) settingsDivider.hidden = true;
  $("settingsView").hidden = false;
  window.location.hash = "#settings";
}

export function closeSettings() {
  showHome();
  window.location.hash = "";
}

// ============================================================
// Hash routing
// ============================================================
export async function openRouteFromHash() {
  const route = window.location.hash.replace("#", "");
  if (route.startsWith("chat/")) {
    const chatId = decodeURIComponent(route.slice(5));
    if (!getChat(chatId) && demoChats.some((c) => c.id === chatId)) {
      state.chats.unshift(demoChats.find((c) => c.id === chatId));
      renderChats();
    }
    await openChat(chatId);
    return;
  }
  if (route === "settings") openSettings();
}
