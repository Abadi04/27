// ============================================================
// app-entry.js — Entry point for esbuild bundling
// Imports all modules and wires up boot sequence + event listeners
// ============================================================

import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { demoChats } from "./demo.js";
import {
  $, setLoading, setButtonBusy, showToast, flashError,
  handleAsyncError, isLiveMode,
} from "./utils.js";
import { setLanguage } from "./lang.js";
import {
  getOrCreateProfile, updateProfileCodeUI, copyProfileCode,
  copyProfileLink, toggleCodeVisibility, regenerateCode,
} from "./profile.js";
import {
  loadConversations, loadConversation,
  startConversationWithCode, deleteAllConversationsNow, blockActiveChat,
} from "./conversations.js";
import {
  loadConversationRequests, acceptConversationRequest,
  rejectConversationRequest, subscribeToRequests,
} from "./requests.js";
import {
  sendMessage, cleanupExpiredMessages, clearReplyDraft,
  startMessageTicker, handleComposerTyping,
} from "./messages.js";
import { appendDemoMessage } from "./demo.js";
import { renderChats, moveExpiredChatsToBurned } from "./render.js";
import {
  openChat, closeChat, openSettings, closeSettings,
  openRouteFromHash,
} from "./routing.js";
import {
  saveSettings, setBurnMode, setHiddenMode, changePrivacyMode,
  toggleChatsHidden, setPanicMode, resetIdleLock,
  openQrModal, closeQrModal,
} from "./settings.js";
import {
  showShareDrop, closeShareDrop, copyGeneratedShareLink, submitTemporaryEntry,
  handleTemporaryEntryParams,
} from "./temporary.js";
import {
  closeMessageActions, replyToActiveMessage,
  copyActiveMessage, burnActiveMessageNow, addReactionToActiveMessage,
} from "./gestures.js";
import {
  openMediaSheet, closeMediaSheet, sendGifMessage,
  startVoiceRecording, finishVoiceRecording,
} from "./media.js";
import { registerPwa } from "./pwa.js";
import { startOnboarding } from "./onboarding.js";
import { showSplash } from "./splash.js";
import {
  loadArena, subscribeToArena,
  sendArenaMessage, handleArenaInput,
} from "./arena.js";
import { openArena, closeArena } from "./routing.js";

// ============================================================
// UI Handler: Start chat from code input
// ============================================================
async function handleStartChat() {
  const input = $("codeInput");
  const code = input.value.trim();

  if (!/^\d{6}$/.test(code)) {
    input.focus();
    input.style.borderColor = "rgba(244, 63, 94, 0.5)";
    flashError(i18n[state.currentLang].invalidCode);
    window.setTimeout(() => { input.style.borderColor = ""; }, 1200);
    return;
  }

  try {
    setButtonBusy($("startBtn"), true, i18n[state.currentLang].searchingCode);
    const conversationId = await startConversationWithCode(code);
    if (conversationId) {
      input.value = "";
      showToast(i18n[state.currentLang].starting);
    }
  } catch (error) {
    handleAsyncError(error, i18n[state.currentLang].errorChats);
  } finally {
    setButtonBusy($("startBtn"), false);
  }
}

// ============================================================
// UI Handler: Send message
// ============================================================
async function handleSendMessage(event) {
  event.preventDefault();
  const input = $("messageInput");
  const mediaInput = $("mediaInput");
  const text = input.value.trim();
  const file = mediaInput.files?.[0];
  const conversationId = $("chatView").dataset.activeChat;

  if (!text && !file) return;

  try {
    setButtonBusy($("sendBtn"), true, i18n[state.currentLang].sendingMessage);

    if (file && !isLiveMode()) {
      appendDemoMessage(conversationId, {
        type: "outgoing",
        text,
        time: i18n[state.currentLang].now,
        mediaUrl: URL.createObjectURL(file),
        mediaType: file.type,
        fileName: file.name,
      });
    }

    if (file && isLiveMode()) {
      showToast(i18n[state.currentLang].mediaStorage);
    }

    if (text) {
      await sendMessage(conversationId, text, {
        privacyMode: state.privacyMode,
        replyTo: state.replyDraft,
        hidden: state.hiddenMode,
      });
    }

    input.value = "";
    mediaInput.value = "";
    clearReplyDraft();
    setHiddenMode(false);
    if (state.privacyMode === "10s_read") setBurnMode(false);
  } catch (error) {
    handleAsyncError(error, i18n[state.currentLang].errorChats);
  } finally {
    setButtonBusy($("sendBtn"), false);
  }
}

// ============================================================
// Boot sequence
// ============================================================
async function boot() {
  // ── Step 1: show content immediately — never leave user on a blank skeleton ──
  state.chats = demoChats.filter((chat) => chat.expiresAt > Date.now());
  setLanguage(state.currentLang);
  setLoading("", false);   // hide skeleton right away
  renderChats();           // show demo chats while we attempt live connection
  startMessageTicker();

  const sharedCode = new URLSearchParams(window.location.search).get("code");
  if (sharedCode && /^\d{6}$/.test(sharedCode)) {
    $("codeInput").value = sharedCode;
  }
  handleTemporaryEntryParams();

  // ── Step 2: no Supabase configured → stay in demo mode ──
  if (!db) {
    await loadConversationRequests();
    renderChats();
    loadArena();
    registerPwa();
    showToast(i18n[state.currentLang].demoMode);
    return;
  }

  // ── Step 3: try live connection with 8s timeout ──
  const BOOT_TIMEOUT_MS = 8000;
  try {
    const profilePromise = getOrCreateProfile();
    const timeoutPromise = new Promise((_, reject) =>
      window.setTimeout(() => reject(new Error("boot_timeout")), BOOT_TIMEOUT_MS)
    );

    state.currentProfile = await Promise.race([profilePromise, timeoutPromise]);
    state.displayName = state.currentProfile.display_name || state.displayName;
    $("displayNameInput").value = state.displayName;
    updateProfileCodeUI();
    registerPwa();
    await loadConversations();
    subscribeToRequests();
    subscribeToArena();
    loadArena(); // load arena in background — non-blocking
    setLanguage(state.currentLang);
    await openRouteFromHash();
  } catch (error) {
    if (error.message === "boot_timeout") {
      showToast(i18n[state.currentLang].demoMode);
      console.warn("boot: Supabase timeout — running in demo mode");
    } else {
      handleAsyncError(error, i18n[state.currentLang].errorChats);
    }
    loadArena();
    renderChats();
  }
}

// ============================================================
// Event Listeners — Settings & Profile
// ============================================================
$("langToggle").addEventListener("click", () => {
  setLanguage(state.currentLang === "ar" ? "en" : "ar");
});
$("settingsToggle").addEventListener("click", openSettings);
$("backFromSettings").addEventListener("click", closeSettings);
$("saveSettingsBtn").addEventListener("click", saveSettings);
$("copyCodeBtn").addEventListener("click", copyProfileCode);
$("copyLinkBtn").addEventListener("click", copyProfileLink);
$("toggleCodeBtn").addEventListener("click", () =>
  toggleCodeVisibility().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
);
$("regenerateCodeBtn").addEventListener("click", () =>
  regenerateCode().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
);
$("deleteAllBtn").addEventListener("click", () =>
  deleteAllConversationsNow().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
);

// ============================================================
// Event Listeners — Temporary links / Share
// ============================================================
$("createAskLinkBtn").addEventListener("click", () =>
  showShareDrop("ask").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
);
$("createRoomLinkBtn").addEventListener("click", () =>
  showShareDrop("room").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
);
$("copyShareLinkBtn").addEventListener("click", copyGeneratedShareLink);
$("entrySendBtn").addEventListener("click", () =>
  submitTemporaryEntry().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
);

// ============================================================
// Event Listeners — QR Modal
// ============================================================
$("profileQrBtn").addEventListener("click", openQrModal);
$("shareQrBtn").addEventListener("click", openQrModal);
$("closeQrModal").addEventListener("click", closeQrModal);
$("qrBackdrop").addEventListener("click", closeQrModal);
$("copyQrCodeBtn").addEventListener("click", copyProfileCode);

// ============================================================
// Event Listeners — Privacy / Panic
// ============================================================
$("panicModeBtn").addEventListener("click", toggleChatsHidden);
$("burnToggle").addEventListener("click", () =>
  setBurnMode(state.privacyMode !== "10s_read")
);
$("hiddenToggle").addEventListener("click", () =>
  setHiddenMode(!state.hiddenMode)
);
$("privacyModeSelect").addEventListener("change", (event) =>
  changePrivacyMode(event.target.value).catch((e) =>
    handleAsyncError(e, i18n[state.currentLang].errorChats)
  )
);

// Fake notes area — long press exits panic mode
let panicPressTimer = null;
$("fakeNotesArea").addEventListener("pointerdown", () => {
  panicPressTimer = window.setTimeout(() => setPanicMode(false), 1500);
});
$("fakeNotesArea").addEventListener("pointerup", () =>
  window.clearTimeout(panicPressTimer)
);
$("fakeNotesArea").addEventListener("pointerleave", () =>
  window.clearTimeout(panicPressTimer)
);

// ============================================================
// Event Listeners — Chat list
// ============================================================
$("startBtn").addEventListener("click", handleStartChat);
$("codeInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleStartChat();
});

document.addEventListener("click", (event) => {
  const requestItem = event.target.closest(".request-item");
  if (requestItem) {
    const requestId = requestItem.dataset.requestId;
    if (event.target.closest(".accept-request")) {
      acceptConversationRequest(requestId).catch((e) =>
        handleAsyncError(e, i18n[state.currentLang].errorChats)
      );
      return;
    }
    if (event.target.closest(".reject-request")) {
      rejectConversationRequest(requestId).catch((e) =>
        handleAsyncError(e, i18n[state.currentLang].errorChats)
      );
      return;
    }
    if (event.target.closest(".reject-block-request")) {
      rejectConversationRequest(requestId, true).catch((e) =>
        handleAsyncError(e, i18n[state.currentLang].errorChats)
      );
      return;
    }
  }

  const expiringStrip = event.target.closest(".expiring-strip");
  if (expiringStrip) {
    openChat(expiringStrip.dataset.chatId);
    return;
  }

  const item = event.target.closest(".chat-item");
  if (!item) return;
  openChat(item.dataset.chatId);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const item = event.target.closest(".chat-item");
  if (!item) return;
  event.preventDefault();
  item.click();
});

// ============================================================
// Event Listeners — Active chat / Messages
// ============================================================
$("backToChats").addEventListener("click", () =>
  closeChat().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
);
$("blockChatBtn").addEventListener("click", () =>
  blockActiveChat().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
);
$("messageForm").addEventListener("submit", handleSendMessage);
$("messageInput").addEventListener("input", handleComposerTyping);
$("mediaInput").addEventListener("change", () => {
  if ($("mediaInput").files?.length) $("messageForm").requestSubmit();
});

// ============================================================
// Event Listeners — Media sheet
// ============================================================
$("attachBtn").addEventListener("click", openMediaSheet);
$("mediaSheetBackdrop").addEventListener("click", closeMediaSheet);
$("pickMediaBtn").addEventListener("click", () => {
  closeMediaSheet();
  $("mediaInput").click();
});
document.querySelectorAll(".gif-choice").forEach((button) => {
  button.addEventListener("click", () =>
    sendGifMessage(button.dataset.gif).catch((e) =>
      handleAsyncError(e, i18n[state.currentLang].errorChats)
    )
  );
});

// ============================================================
// Event Listeners — Voice recording
// ============================================================
$("voiceBtn").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  startVoiceRecording();
});
$("voiceBtn").addEventListener("pointerup", () =>
  finishVoiceRecording(false).catch((e) =>
    handleAsyncError(e, i18n[state.currentLang].errorChats)
  )
);
$("voiceBtn").addEventListener("pointerleave", () =>
  finishVoiceRecording(true).catch((e) =>
    handleAsyncError(e, i18n[state.currentLang].errorChats)
  )
);
$("voiceBtn").addEventListener("pointercancel", () =>
  finishVoiceRecording(true).catch((e) =>
    handleAsyncError(e, i18n[state.currentLang].errorChats)
  )
);

// ============================================================
// Event Listeners — Message actions (swipe panel)
// ============================================================
$("messageActionsBackdrop").addEventListener("click", closeMessageActions);
$("replyActionBtn").addEventListener("click", replyToActiveMessage);
$("copyMessageBtn").addEventListener("click", () =>
  copyActiveMessage().catch((e) =>
    handleAsyncError(e, i18n[state.currentLang].errorChats)
  )
);
$("burnMessageNowBtn").addEventListener("click", burnActiveMessageNow);
$("messageActions").addEventListener("click", (event) => {
  const reactionButton = event.target.closest("[data-reaction]");
  if (!reactionButton) return;
  addReactionToActiveMessage(reactionButton.dataset.reaction);
});
$("cancelReplyBtn").addEventListener("click", clearReplyDraft);
$("displayNameInput").addEventListener("input", () => {
  $("displayNameInput").dataset.edited = "true";
});

// ============================================================
// Event Listeners — Idle lock / Panic triggers
// ============================================================
["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
  document.addEventListener(eventName, resetIdleLock, { passive: true });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && !$("chatView").hidden) setPanicMode(true);
});

// Note: window.blur removed — too aggressive (fires on any tab switch, address bar click)
// visibilitychange below is the correct trigger for panic mode

// ============================================================
// Arena tab navigation
// ============================================================
$("tabArena").addEventListener("click", async () => {
  openArena();
  // Load arena if not already loaded (handles case where badge is 0)
  await loadArena().catch(() => {});
});

$("tabHome").addEventListener("click", () => {
  closeArena();
});

// Arena send
$("arenaSendBtn").addEventListener("click", () =>
  sendArenaMessage().catch((e) => handleAsyncError(e, i18n[state.currentLang].arenaSendError))
);

$("arenaInput").addEventListener("input", handleArenaInput);
$("arenaInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendArenaMessage().catch((e) => handleAsyncError(e, i18n[state.currentLang].arenaSendError));
  }
});

// ============================================================
// Hash routing
// ============================================================
window.addEventListener("hashchange", () => {
  openRouteFromHash().catch((e) =>
    handleAsyncError(e, i18n[state.currentLang].errorChats)
  );
});

// ============================================================
// Periodic refresh (every 60s)
// ============================================================
window.setInterval(async () => {
  try {
    if (isLiveMode()) {
      await cleanupExpiredMessages();
      if (!$("chatView").hidden && state.activeConversationId) {
        await loadConversation(state.activeConversationId);
      }
      await loadConversations();
      return;
    }

    const before = state.chats.length;
    moveExpiredChatsToBurned();
    renderChats();
    if (before !== state.chats.length) {
      showToast(i18n[state.currentLang].expired);
    }
  } catch (error) {
    console.warn(error);
  }
}, 60000);

// ============================================================
// Attach onboarding → boot (swipe gestures now attached inside renderMessages)
// ============================================================
// Entry chain: Splash → Onboarding → Boot
showSplash(() => startOnboarding(() => boot()));

// ============================================================
// FAB: Floating Action Button
// ============================================================
function updateFabVisibility() {
  const fab = $("fabBtn");
  if (!fab) return;
  const inChat = $("chatView") && !$("chatView").hidden;
  const inSettings = $("settingsView") && !$("settingsView").hidden;
  const inArena = $("arenaView") && !$("arenaView").hidden;
  fab.hidden = inChat || inSettings || inArena;
}

// We observe chatView/settingsView visibility changes via MutationObserver
const _fabObserver = new MutationObserver(updateFabVisibility);
function _attachFabObserver() {
  const chatView = $("chatView");
  const settingsView = $("settingsView");
  const arenaView = $("arenaView");
  if (chatView) _fabObserver.observe(chatView, { attributes: true, attributeFilter: ["hidden"] });
  if (settingsView) _fabObserver.observe(settingsView, { attributes: true, attributeFilter: ["hidden"] });
  if (arenaView) _fabObserver.observe(arenaView, { attributes: true, attributeFilter: ["hidden"] });
}
// Script loads at end of <body> so DOM is already ready — DOMContentLoaded may have already fired
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _attachFabObserver);
} else {
  _attachFabObserver();
}
updateFabVisibility(); // sync initial state

function openFabSheet() {
  $("fabSheet").hidden = false;
  $("fabBtn").classList.add("open");
  $("fabBtn").setAttribute("aria-expanded", "true");
}
function closeFabSheet() {
  $("fabSheet").hidden = true;
  $("fabBtn").classList.remove("open");
  $("fabBtn").setAttribute("aria-expanded", "false");
}
function openCodeModal() {
  closeFabSheet();
  $("codeModal").hidden = false;
  setTimeout(() => $("codeModalInput").focus(), 50);
}
function closeCodeModal() {
  $("codeModal").hidden = true;
  $("codeModalInput").value = "";
}

$("fabBtn").addEventListener("click", () => {
  if ($("fabSheet").hidden) openFabSheet();
  else closeFabSheet();
});
$("fabSheetBackdrop").addEventListener("click", closeFabSheet);
$("codeModalBackdrop").addEventListener("click", closeCodeModal);

$("fabStartChat").addEventListener("click", openCodeModal);
$("fabCreateRoom").addEventListener("click", () => {
  closeFabSheet();
  showShareDrop("room").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
});
$("fabCreateAsk").addEventListener("click", () => {
  closeFabSheet();
  showShareDrop("ask").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
});

// Code modal: start chat
async function handleCodeModalStart() {
  const input = $("codeModalInput");
  const code = input.value.trim();
  if (!/^\d{6}$/.test(code)) {
    input.style.borderColor = "rgba(244,63,94,.5)";
    flashError(i18n[state.currentLang].invalidCode);
    setTimeout(() => { input.style.borderColor = ""; }, 1200);
    return;
  }
  try {
    setButtonBusy($("codeModalStartBtn"), true, i18n[state.currentLang].searchingCode);
    const id = await startConversationWithCode(code);
    if (id) { closeCodeModal(); showToast(i18n[state.currentLang].starting); }
  } catch (e) {
    handleAsyncError(e, i18n[state.currentLang].errorChats);
  } finally {
    setButtonBusy($("codeModalStartBtn"), false);
  }
}
$("codeModalStartBtn").addEventListener("click", handleCodeModalStart);
$("codeModalInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleCodeModalStart();
  if (e.key === "Escape") closeCodeModal();
});

// Header chip/QR shortcuts
$("headerCodeChip").addEventListener("click", copyProfileCode);
$("headerQrBtn").addEventListener("click", openQrModal);

// ShareDrop / EntryCard backdrop close
$("shareDropBackdrop").addEventListener("click", closeShareDrop);

// ============================================================
// BurnAfterRead: tap to unblur
// ============================================================
$("messagesList").addEventListener("click", (e) => {
  const msg = e.target.closest(".message.blur-until-read");
  if (!msg) return;
  msg.classList.remove("blur-until-read");
  msg.classList.add("blur-reading");
  showToast(i18n[state.currentLang].tapToRead || "سيتم حذف الرسالة خلال 10 ثوانٍ");
  if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
});

// Screenshot / visibility detection during burn-read
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    const hasBurnMsg = $("messagesList")?.querySelector(".burn-label");
    if (hasBurnMsg && !$("chatView").hidden) {
      showToast("⚠️ تحذير: تم اكتشاف مغادرة التطبيق");
    }
  }
});

// ============================================================
// Pull-to-refresh (listens on window since scroll is on body/main)
// ============================================================
(function initPullToRefresh() {
  const indicator = $("ptrIndicator");
  if (!indicator) return;

  let startY = 0;
  let pulling = false;
  let refreshing = false;
  const THRESHOLD = 80;

  function isHomeVisible() {
    return $("chatView")?.hidden !== false && $("settingsView")?.hidden !== false;
  }

  document.addEventListener("touchstart", (e) => {
    if (!isHomeVisible()) return;
    if (window.scrollY <= 1) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!pulling || refreshing) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 20) indicator.classList.add("ptr-visible");
  }, { passive: true });

  document.addEventListener("touchend", async (e) => {
    if (!pulling) return;
    pulling = false;
    const dy = e.changedTouches[0].clientY - startY;
    if (dy >= THRESHOLD && !refreshing) {
      refreshing = true;
      indicator.classList.add("ptr-refreshing");
      indicator.querySelector(".ptr-arrow").textContent = "↻";
      if (navigator.vibrate) navigator.vibrate(15);
      try { await loadConversations(); } catch {}
      indicator.querySelector(".ptr-arrow").textContent = "↓";
      indicator.classList.remove("ptr-refreshing");
      refreshing = false;
    }
    indicator.classList.remove("ptr-visible");
  }, { passive: true });
})();
