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
  $("heroSection").hidden = false;
  $("arenaView").hidden = true;
  const divider = document.querySelector(".section-divider");
  if (divider) divider.hidden = true;
  $("chatsSection").hidden = false;
  $("chatView").hidden = true;
  $("settingsView").hidden = true;
  $("tabHome")?.setAttribute("aria-selected", "true");
  $("tabHome")?.classList.add("tab-btn--active");
  $("tabArena")?.setAttribute("aria-selected", "false");
  $("tabArena")?.classList.remove("tab-btn--active");
  $("tabBar")?.classList.remove("tab-bar--hidden");
  const fab = $("fabBtn");
  if (fab) fab.hidden = false;
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
  $("arenaView").hidden = true;
  $("chatView").hidden = false;
  $("tabBar")?.classList.add("tab-bar--hidden");
  $("fabBtn").hidden = true;
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
  $("chatsSection").hidden = true;
  $("chatView").hidden = true;
  $("arenaView").hidden = true;
  const settingsDivider = document.querySelector(".section-divider");
  if (settingsDivider) settingsDivider.hidden = true;
  $("settingsView").hidden = false;
  $("tabBar")?.classList.add("tab-bar--hidden");
  $("fabBtn").hidden = true;
  window.location.hash = "#settings";
}

export function closeSettings() {
  showHome();
  window.location.hash = "";
}

// ============================================================
// Arena
// ============================================================
export function openArena() {
  stopChatCountdown();
  $("heroSection").hidden = true;
  $("chatsSection").hidden = true;
  $("chatView").hidden = true;
  $("settingsView").hidden = true;
  $("arenaView").hidden = false;
  // Update tab active state
  $("tabHome")?.setAttribute("aria-selected", "false");
  $("tabHome")?.classList.remove("tab-btn--active");
  $("tabArena")?.setAttribute("aria-selected", "true");
  $("tabArena")?.classList.add("tab-btn--active");
  $("tabBar")?.classList.remove("tab-bar--hidden");
  $("fabBtn").hidden = true;
  window.location.hash = "#arena";
}

export function closeArena() {
  $("arenaView").hidden = true;
  $("tabArena")?.setAttribute("aria-selected", "false");
  $("tabArena")?.classList.remove("tab-btn--active");
  $("tabHome")?.setAttribute("aria-selected", "true");
  $("tabHome")?.classList.add("tab-btn--active");
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
  if (route === "settings") { openSettings(); return; }
  if (route === "arena") { openArena(); return; }
}
