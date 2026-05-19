import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { HIDE_CHATS_STORAGE_KEY, PROFILE_STORAGE_KEY } from "./config.js";
import {
  $, isLiveMode, isUuid, showToast, handleAsyncError,
} from "./utils.js";
import { getChat, renderChats } from "./render.js";

// ============================================================
// Display name + profile save
// ============================================================
export async function saveSettings() {
  state.displayName = $("displayNameInput").value.trim()
    || (state.currentLang === "ar" ? "زائر 27" : "Guest 27");
  $("displayNameInput").value = state.displayName;

  try {
    if (isLiveMode()) {
      const { data, error } = await db
        .from("profiles")
        .update({ display_name: state.displayName, avatar_seed: state.displayName })
        .eq("id", state.currentProfile.id)
        .select("*").single();
      if (error) throw error;
      if (data) {
        state.currentProfile = data;
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
      }
    }
    showToast(i18n[state.currentLang].settingsSaved);
    renderChats();
  } catch (error) {
    handleAsyncError(error, i18n[state.currentLang].errorChats);
  }
}

// ============================================================
// Privacy mode (burn / disappearing)
// ============================================================
export function setBurnMode(enabled) {
  state.privacyMode = enabled
    ? "10s_read"
    : ($("privacyModeSelect").value === "10s_read" ? "5h" : $("privacyModeSelect").value);
  $("privacyModeSelect").value = state.privacyMode;
  updatePrivacyModeUI();
}

export function updatePrivacyModeUI() {
  const isBurn = state.privacyMode === "10s_read";
  $("burnToggle").classList.toggle("active", isBurn);
  $("messageInput").classList.toggle("burn-active", isBurn);
  $("burnToggle").setAttribute("aria-pressed", String(isBurn));
  $("privacyModeLabel").textContent = i18n[state.currentLang].privacyModeLabel;
}

export async function changePrivacyMode(mode) {
  state.privacyMode = mode;
  updatePrivacyModeUI();
  const chat = getChat($("chatView").dataset.activeChat);
  if (chat) chat.privacyMode = mode;
  if (isLiveMode() && chat?.id && isUuid(chat.id)) {
    const { error } = await db.from("conversations").update({ privacy_mode: mode }).eq("id", chat.id);
    if (error) console.warn(error);
  }
}

// ============================================================
// Hidden message mode
// ============================================================
export function setHiddenMode(enabled) {
  state.hiddenMode = enabled;
  $("hiddenToggle").classList.toggle("active", state.hiddenMode);
  $("messageInput").classList.toggle("hidden-active", state.hiddenMode);
  $("hiddenToggle").setAttribute("aria-pressed", String(state.hiddenMode));
  if (enabled) showToast(i18n[state.currentLang].hiddenActive);
}

// ============================================================
// Settings toggles UI sync
// ============================================================
export function updateSettingsToggles() {
  const hideChatsBtn = $("panicModeBtn");
  hideChatsBtn.classList.toggle("is-on", state.chatsHidden);
  hideChatsBtn.setAttribute("aria-checked", String(state.chatsHidden));

  const hideCodeActive = state.currentProfile?.code_visible === false;
  const codeBtn = $("toggleCodeBtn");
  codeBtn.classList.toggle("is-on", hideCodeActive);
  codeBtn.setAttribute("aria-checked", String(hideCodeActive));
}

export function toggleChatsHidden() {
  state.chatsHidden = !state.chatsHidden;
  localStorage.setItem(HIDE_CHATS_STORAGE_KEY, state.chatsHidden ? "1" : "0");
  updateSettingsToggles();
  renderChats();
}

// ============================================================
// Panic mode (fake notes) + idle lock
// ============================================================
export function setPanicMode(enabled) {
  state.panicMode = enabled;
  $("panicScreen").hidden = !state.panicMode;
  document.body.classList.toggle("panic-active", state.panicMode);
}

export function resetIdleLock() {
  window.clearTimeout(state.idleLockTimer);
  state.idleLockTimer = window.setTimeout(() => {
    if (!$("chatView").hidden) setPanicMode(true);
  }, 60000);
}

// ============================================================
// QR modal
// ============================================================
export async function openQrModal() {
  if (state.currentProfile?.code_visible === false) return;
  const code = state.currentProfile?.public_code || $("profileCodeValue")?.textContent?.trim();
  if (!code || code === "------") return;

  state.qrModalOpen = true;
  $("qrCodeText").textContent = code;
  $("qrModal").hidden = false;

  try {
    const qrApi = window.QRCode;
    if (qrApi?.toDataURL) {
      $("qrImage").src = await qrApi.toDataURL(code, {
        margin: 2,
        width: 220,
        color: { dark: "#0A0A0F", light: "#FFFFFF" },
      });
    }
  } catch (error) {
    handleAsyncError(error, i18n[state.currentLang].errorChats);
  }
}

export function closeQrModal() {
  state.qrModalOpen = false;
  $("qrModal").hidden = true;
}
