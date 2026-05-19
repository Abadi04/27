/*
  27 — entry point
  Boot sequence + all DOM event wiring.
  Logic lives in /js/ modules.
*/

import { db } from "./js/db.js";
import { state } from "./js/state.js";
import { i18n } from "./js/i18n.js";
import {
  $, isLiveMode, handleAsyncError, setLoading,
  setButtonBusy, showToast, flashError,
} from "./js/utils.js";

import { setLanguage } from "./js/lang.js";
import { startOnboarding } from "./js/onboarding.js";
import { registerPwa } from "./js/pwa.js";

import {
  getOrCreateProfile, updateProfileCodeUI,
  copyProfileCode, copyProfileLink,
  toggleCodeVisibility, regenerateCode,
} from "./js/profile.js";

import {
  loadConversations, loadConversation, startConversationWithCode,
  deleteAllConversationsNow, blockActiveChat,
} from "./js/conversations.js";

import {
  sendMessage, startMessageTicker, handleComposerTyping,
  clearReplyDraft, cleanupExpiredMessages,
} from "./js/messages.js";

import {
  loadConversationRequests, subscribeToRequests,
  acceptConversationRequest, rejectConversationRequest,
} from "./js/requests.js";

import {
  showShareDrop, copyGeneratedShareLink,
  handleTemporaryEntryParams, submitTemporaryEntry,
} from "./js/temporary.js";

import { renderChats, getChat, moveExpiredChatsToBurned } from "./js/render.js";

import {
  openChat, closeChat, openSettings, closeSettings,
  openRouteFromHash, showHome,
} from "./js/routing.js";

import {
  saveSettings, setBurnMode, updatePrivacyModeUI,
  setHiddenMode, changePrivacyMode, toggleChatsHidden,
  setPanicMode, resetIdleLock, openQrModal, closeQrModal,
} from "./js/settings.js";

import {
  attachSwipeToMessages, openMessageActions, closeMessageActions,
  copyActiveMessage, replyToActiveMessage, burnActiveMessageNow,
  addReactionToActiveMessage,
} from "./js/gestures.js";

import {
  openMediaSheet, closeMediaSheet, sendGifMessage,
  startVoiceRecording, finishVoiceRecording,
} from "./js/media.js";

import { demoChats, appendDemoMessage } from "./js/demo.js";

// ============================================================
// Boot
// ============================================================
async function boot() {
  setLoading(i18n[state.currentLang].loadingChats, true);
  state.chats = demoChats.filter((c) => c.expiresAt > Date.now());

  setLanguage(state.currentLang);

  // Pre-fill input if ?code=NNNNNN was passed
  const sharedCode = new URLSearchParams(window.location.search).get("code");
  if (sharedCode && /^\d{6}$/.test(sharedCode)) $("codeInput").value = sharedCode;
  handleTemporaryEntryParams();

  // Demo mode (no Supabase keys)
  if (!db) {
    setLoading("", false);
    await loadConversationRequests();
    renderChats();
    startMessageTicker();
    registerPwa();
    showToast(i18n[state.currentLang].demoMode);
    return;
  }

  // Live mode
  try {
    state.currentProfile = await getOrCreateProfile();
    if (!state.currentProfile) throw new Error("getOrCreateProfile returned null");

    state.displayName = state.currentProfile.display_name || state.displayName;
    $("displayNameInput").value = state.displayName;

    // Force-show profile card immediately (guard against setLanguage hiding it before profile loads)
    const card = $("profileCodeCard");
    if (card && state.currentProfile.public_code && state.currentProfile.code_visible !== false) {
      card.hidden = false;
      card.removeAttribute("hidden");
      $("profileCodeValue").textContent = state.currentProfile.public_code;
    }
    updateProfileCodeUI();
    registerPwa();

    await loadConversations();
    subscribeToRequests();
    setLanguage(state.currentLang);

    await openRouteFromHash();
    startMessageTicker();
  } catch (error) {
    handleAsyncError(error, i18n[state.currentLang].errorChats);
    renderChats();
    // Still try to show card if profile was partially loaded
    updateProfileCodeUI();
  } finally {
    setLoading("", false);
  }
}

// ============================================================
// Event handlers
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
    const conversationId = await startConversationWithCode(code, openChat);
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
      }, () => { renderChats(); });
    }
    if (file && isLiveMode()) showToast(i18n[state.currentLang].mediaStorage);

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
// Wire up DOM events (all in one place)
// ============================================================
function wireEvents() {
  // Header
  $("langToggle").addEventListener("click", () => {
    setLanguage(state.currentLang === "ar" ? "en" : "ar");
  });
  $("settingsToggle").addEventListener("click", openSettings);

  // Settings
  $("backFromSettings").addEventListener("click", closeSettings);
  $("saveSettingsBtn").addEventListener("click", saveSettings);
  $("displayNameInput").addEventListener("input", () => {
    $("displayNameInput").dataset.edited = "true";
  });
  $("panicModeBtn").addEventListener("click", toggleChatsHidden);
  $("shareQrBtn").addEventListener("click", openQrModal);
  $("toggleCodeBtn").addEventListener("click",
    () => toggleCodeVisibility().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("regenerateCodeBtn").addEventListener("click",
    () => regenerateCode().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("deleteAllBtn").addEventListener("click",
    () => deleteAllConversationsNow().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("blockChatBtn").addEventListener("click",
    () => blockActiveChat().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));

  // Profile card
  $("copyCodeBtn").addEventListener("click", copyProfileCode);
  $("copyLinkBtn").addEventListener("click", copyProfileLink);
  $("profileQrBtn").addEventListener("click", openQrModal);

  // Share / entry cards
  $("createAskLinkBtn").addEventListener("click",
    () => showShareDrop("ask").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("createRoomLinkBtn").addEventListener("click",
    () => showShareDrop("room").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("copyShareLinkBtn").addEventListener("click", copyGeneratedShareLink);
  $("entrySendBtn").addEventListener("click",
    () => submitTemporaryEntry().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));

  // QR modal
  $("closeQrModal").addEventListener("click", closeQrModal);
  $("qrBackdrop").addEventListener("click", closeQrModal);
  $("copyQrCodeBtn").addEventListener("click", copyProfileCode);

  // Reply composer
  $("cancelReplyBtn").addEventListener("click", clearReplyDraft);

  // Composer toggles
  $("burnToggle").addEventListener("click", () => setBurnMode(state.privacyMode !== "10s_read"));
  $("hiddenToggle").addEventListener("click", () => setHiddenMode(!state.hiddenMode));
  $("attachBtn").addEventListener("click", openMediaSheet);
  $("privacyModeSelect").addEventListener("change", (event) => {
    changePrivacyMode(event.target.value).catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
  });

  // Panic mode dismiss (long-press notes)
  let panicTimer = null;
  $("fakeNotesArea").addEventListener("pointerdown", () => {
    panicTimer = window.setTimeout(() => setPanicMode(false), 1500);
  });
  $("fakeNotesArea").addEventListener("pointerup", () => window.clearTimeout(panicTimer));
  $("fakeNotesArea").addEventListener("pointerleave", () => window.clearTimeout(panicTimer));

  // Start chat
  $("startBtn").addEventListener("click", handleStartChat);
  $("codeInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleStartChat();
  });

  // Chat list (delegated)
  document.addEventListener("click", (event) => {
    const requestItem = event.target.closest(".request-item");
    if (requestItem) {
      const requestId = requestItem.dataset.requestId;
      if (event.target.closest(".accept-request")) {
        acceptConversationRequest(requestId, openChat)
          .catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
        return;
      }
      if (event.target.closest(".reject-request")) {
        rejectConversationRequest(requestId)
          .catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
        return;
      }
      if (event.target.closest(".reject-block-request")) {
        rejectConversationRequest(requestId, true)
          .catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
        return;
      }
    }
    const expiringStrip = event.target.closest(".expiring-strip");
    if (expiringStrip) { openChat(expiringStrip.dataset.chatId); return; }

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

  // Chat view
  $("backToChats").addEventListener("click",
    () => closeChat().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("messageForm").addEventListener("submit", handleSendMessage);
  $("messageInput").addEventListener("input", handleComposerTyping);
  $("mediaInput").addEventListener("change", () => {
    if ($("mediaInput").files?.length) $("messageForm").requestSubmit();
  });

  // Media sheet
  $("mediaSheetBackdrop").addEventListener("click", closeMediaSheet);
  $("pickMediaBtn").addEventListener("click", () => {
    closeMediaSheet();
    $("mediaInput").click();
  });
  document.querySelectorAll(".gif-choice").forEach((button) => {
    button.addEventListener("click",
      () => sendGifMessage(button.dataset.gif)
        .catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  });

  // Voice button (hold-to-record)
  $("voiceBtn").addEventListener("pointerdown", (event) => {
    event.preventDefault();
    startVoiceRecording();
  });
  $("voiceBtn").addEventListener("pointerup",
    () => finishVoiceRecording(false).catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("voiceBtn").addEventListener("pointerleave",
    () => finishVoiceRecording(true).catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("voiceBtn").addEventListener("pointercancel",
    () => finishVoiceRecording(true).catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));

  // Message actions sheet
  $("messageActionsBackdrop").addEventListener("click", closeMessageActions);
  $("replyActionBtn").addEventListener("click", replyToActiveMessage);
  $("copyMessageBtn").addEventListener("click",
    () => copyActiveMessage().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats)));
  $("burnMessageNowBtn").addEventListener("click", burnActiveMessageNow);
  $("messageActions").addEventListener("click", (event) => {
    const reaction = event.target.closest("[data-reaction]");
    if (!reaction) return;
    addReactionToActiveMessage(reaction.dataset.reaction);
  });

  // Idle lock + panic visibility
  ["pointerdown", "keydown", "touchstart"].forEach((name) => {
    document.addEventListener(name, resetIdleLock, { passive: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !$("chatView").hidden) setPanicMode(true);
  });
  window.addEventListener("blur", () => {
    if (!$("chatView").hidden) setPanicMode(true);
  });

  // Hash routing
  window.addEventListener("hashchange", () => {
    openRouteFromHash().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
  });

  // Observe message list mutations to attach swipe gestures
  const messagesList = $("messagesList");
  if (messagesList) {
    const observer = new MutationObserver(() => attachSwipeToMessages());
    observer.observe(messagesList, { childList: true });
  }
}

// ============================================================
// Periodic cleanup + expiry sweep
// ============================================================
function startBackgroundSweep() {
  window.setInterval(async () => {
    try {
      if (isLiveMode()) {
        await cleanupExpiredMessages();
        if (!$("chatView").hidden && state.activeConversationId) {
          await loadConversation(state.activeConversationId, () => {
            showHome();
            window.location.hash = "";
          });
        }
        await loadConversations();
        return;
      }
      const before = state.chats.length;
      moveExpiredChatsToBurned();
      renderChats();
      if (before !== state.chats.length) showToast(i18n[state.currentLang].expired);
    } catch (e) {
      console.warn(e);
    }
  }, 60000);
}

// ============================================================
// Go
// ============================================================
wireEvents();
startBackgroundSweep();
startOnboarding(() => boot());
