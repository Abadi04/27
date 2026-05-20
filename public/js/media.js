import { state } from "./state.js";
import { i18n } from "./i18n.js";
import {
  $, vibrate, isLiveMode, isUuid, showToast,
  getPrivacyConfig,
} from "./utils.js";
import { sendMessage } from "./messages.js";
import { appendDemoMessage } from "./demo.js";
import { renderMessages, renderChats, updateChatCountdown } from "./render.js";

// ============================================================
// Media sheet open/close
// ============================================================
export function openMediaSheet() { $("mediaSheet").hidden = false; }
export function closeMediaSheet() { $("mediaSheet").hidden = true; }

// ============================================================
// Quick GIF send
// ============================================================
export async function sendGifMessage(gif) {
  const conversationId = $("chatView").dataset.activeChat;
  if (!conversationId) return;
  const text = `${gif} ${gif} ${gif}`;

  if (isLiveMode() && isUuid(conversationId)) {
    await sendMessage(conversationId, text, { privacyMode: state.privacyMode, messageType: "gif" });
    closeMediaSheet();
    showToast(i18n[state.currentLang].gifSent);
    return;
  }

  appendDemoMessage(conversationId, {
    type: "outgoing",
    text,
    time: i18n[state.currentLang].now,
    messageType: "gif",
    privacyMode: state.privacyMode,
    expiresAt: new Date(Date.now() + getPrivacyConfig(state.privacyMode).seconds * 1000).toISOString(),
  }, (c) => {
    renderMessages(c);
    renderChats();
    updateChatCountdown(c);
  });
  closeMediaSheet();
  showToast(i18n[state.currentLang].gifSent);
}

// ============================================================
// Voice recording (hold-to-record)
// ============================================================
export function startVoiceRecording() {
  if ($("chatView").hidden || state.voiceRecording) return;
  state.voiceRecording = { startedAt: Date.now() };
  $("voiceBtn").classList.add("recording");
  $("voiceBtn").textContent = "■";
  showToast(i18n[state.currentLang].voiceRecording);
  vibrate(15);
}

export async function finishVoiceRecording(cancel = false) {
  if (!state.voiceRecording) return;
  const startedAt = state.voiceRecording.startedAt;
  state.voiceRecording = null;
  $("voiceBtn").classList.remove("recording");
  $("voiceBtn").textContent = "●";
  if (cancel) return;

  const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  const conversationId = $("chatView").dataset.activeChat;
  const duration = `0:${String(seconds).padStart(2, "0")}`;

  if (isLiveMode() && isUuid(conversationId)) {
    await sendMessage(conversationId, duration, { privacyMode: state.privacyMode, messageType: "voice" });
    showToast(i18n[state.currentLang].voiceSent);
    return;
  }

  appendDemoMessage(conversationId, {
    type: "outgoing",
    text: duration,
    time: i18n[state.currentLang].now,
    messageType: "voice",
    privacyMode: state.privacyMode,
    expiresAt: new Date(Date.now() + getPrivacyConfig(state.privacyMode).seconds * 1000).toISOString(),
  }, (c) => {
    renderMessages(c);
    renderChats();
    updateChatCountdown(c);
  });
  showToast(i18n[state.currentLang].voiceSent);
}
