import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { FIVE_HOURS } from "./config.js";
import {
  $, escapeHtml, formatTime, vibrate, isUuid, isLiveMode,
  isMissingRelationError, prefersReducedMotion, getPrivacyConfig,
  showToast,
} from "./utils.js";
import {
  getChat, getMessages, renderMessages, renderChats,
  updateChatCountdown,
} from "./render.js";
import { appendDemoMessage } from "./demo.js";

// ============================================================
// DB → UI mapping
// ============================================================
export function mapDbMessage(row) {
  return {
    id: row.id,
    type: row.sender_id === state.currentProfile.id ? "outgoing" : "incoming",
    text: row.content,
    messageType: row.message_type || "text",
    hidden: row.message_type === "hidden_text",
    time: formatTime(row.created_at),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    privacyMode: row.privacy_mode || "5h",
    burnAfterRead: Boolean(row.burn_after_read),
    readAt: row.read_at,
    status: row.sender_id === state.currentProfile.id
      ? (row.read_at ? "read" : "sent")
      : "",
  };
}

// ============================================================
// Cleanup / expiry on server
// ============================================================
export async function cleanupExpiredMessages(conversationId = "") {
  if (!isLiveMode()) return;
  const nowIso = new Date().toISOString();
  let query = db.from("messages").delete().lt("expires_at", nowIso);
  if (conversationId) query = query.eq("conversation_id", conversationId);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteConversationIfExpiredAndEmpty(chat) {
  if (!isLiveMode() || !chat?.id) return false;
  if (!chat.lastMessageAt || Date.now() - chat.lastMessageAt < FIVE_HOURS) return false;

  const { count, error } = await db
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", chat.id)
    .gt("expires_at", new Date().toISOString());

  if (error) {
    if (isMissingRelationError(error)) return false;
    throw error;
  }
  if (count && count > 0) return false;

  const { error: deleteError } = await db
    .from("conversations").delete().eq("id", chat.id);
  if (deleteError) throw deleteError;

  state.chats = state.chats.filter((c) => c.id !== chat.id);
  return true;
}

// ============================================================
// Sending
// ============================================================
export async function sendMessage(conversationId, content, options = {}) {
  if (!content.trim()) return;
  const mode = options.privacyMode || state.privacyMode;
  const config = getPrivacyConfig(mode);
  const ttlMs = config.seconds * 1000;
  const chat = getChat(conversationId);

  // Demo / placeholder path
  if (!isLiveMode() || chat?.placeholder || !isUuid(conversationId)) {
    appendDemoMessage(conversationId, {
      type: "outgoing",
      text: content,
      time: i18n[state.currentLang].now,
      privacyMode: mode,
      replyToId: options.replyTo?.id,
      replyToText: options.replyTo?.text,
      messageType: options.messageType || (options.hidden ? "hidden_text" : "text"),
      hidden: Boolean(options.hidden),
      burnAfterRead: Boolean(config.burnAfterRead),
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    }, (c) => {
      renderMessages(c);
      renderChats();
      updateChatCountdown(c);
    });
    vibrate(30);
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  let { data: inserted, error } = await db.from("messages").insert({
    conversation_id: conversationId,
    sender_id: state.currentProfile.id,
    content,
    message_type: options.messageType || (options.hidden ? "hidden_text" : "text"),
    expires_at: expiresAt,
    privacy_mode: mode,
    burn_after_read: Boolean(config.burnAfterRead),
  }).select("*").single();

  // Graceful fallback for older schemas
  if (error && isMissingRelationError(error)) {
    let fb = await db.from("messages").insert({
      conversation_id: conversationId,
      sender_id: state.currentProfile.id,
      content,
      expires_at: expiresAt,
    }).select("*").single();
    if (fb.error && isMissingRelationError(fb.error)) {
      fb = await db.from("messages").insert({
        conversation_id: conversationId,
        sender_id: state.currentProfile.id,
        content,
      }).select("*").single();
    }
    inserted = fb.data; error = fb.error;
  }
  if (error) throw error;
  vibrate(30);

  if (chat && inserted) {
    const next = mapDbMessage(inserted);
    const messages = chat.messages.neutral || [];
    if (!messages.some((m) => m.id === next.id)) {
      chat.messages.neutral = [...messages, next];
      chat.lastMessageAt = new Date(next.createdAt || now).getTime();
      chat.expiresAt = next.expiresAt ? new Date(next.expiresAt).getTime() : now.getTime() + ttlMs;
      renderMessages(chat);
      renderChats();
      updateChatCountdown(chat);
    }
  }

  const { error: touchError } = await db
    .from("conversations")
    .update({ last_message_at: now.toISOString() })
    .eq("id", conversationId);
  if (touchError) throw touchError;
}

export async function markIncomingMessagesRead(chat) {
  if (!isLiveMode() || !chat?.id || !isUuid(chat.id)) return;
  const unread = getMessages(chat).filter(
    (m) => m.type === "incoming" && !m.readAt && isUuid(m.id)
  );
  if (!unread.length) return;

  const readAt = new Date().toISOString();
  const ids = unread.map((m) => m.id);
  const { error } = await db.from("messages").update({ read_at: readAt }).in("id", ids);
  if (error) { console.warn(error); return; }
  unread.forEach((m) => { m.readAt = readAt; });
}

// ============================================================
// Per-message expiry (swipe / burn-now / natural)
// ============================================================
export function findMessageById(messageId) {
  const chat = getChat(state.activeConversationId || $("chatView")?.dataset.activeChat);
  return getMessages(chat).find((m) => String(m.id) === String(messageId));
}

function removeMessageLocally(messageId) {
  const chat = getChat(state.activeConversationId || $("chatView")?.dataset.activeChat);
  if (!chat) return;
  Object.keys(chat.messages || {}).forEach((key) => {
    chat.messages[key] = (chat.messages[key] || []).filter((m) => String(m.id) !== String(messageId));
  });
  const remaining = getMessages(chat);
  const latest = remaining.reduce((acc, m) => {
    if (!m.expiresAt) return acc;
    return Math.max(acc, new Date(m.expiresAt).getTime());
  }, 0);
  chat.expiresAt = latest || Date.now();
}

export async function expireMessage(messageId, options = {}) {
  const message = findMessageById(messageId);
  if (!message || message.expiring) return;
  message.expiring = true;
  vibrate([20, 30, 20]);

  const shell = document.querySelector(`.message-shell[data-message-id="${CSS.escape(String(messageId))}"]`);

  const finish = async () => {
    removeMessageLocally(messageId);
    if (isLiveMode() && messageId) {
      const { error } = await db.from("messages").delete().eq("id", messageId);
      if (error) console.warn(error);
    }
    const chat = getChat(state.activeConversationId || $("chatView")?.dataset.activeChat);
    if (chat) {
      if (state.replyDraft?.id === messageId) clearReplyDraft();
      renderMessages(chat);
      renderChats();
      updateChatCountdown(chat);
    }
    showToast(i18n[state.currentLang].messageDeleted);
  };

  if (!shell || prefersReducedMotion()) { await finish(); return; }

  const text = shell.querySelector(".message-text");
  if (text && (options.natural || options.swipe)) {
    const words = (message.text || "").split(" ");
    text.innerHTML = words.map((w, i) =>
      `<span class="fade-word" style="animation-delay: ${i * 80}ms">${escapeHtml(w)}</span>`
    ).join(" ");
    window.setTimeout(finish, words.length * 80 + 220);
    return;
  }

  shell.classList.add("message-expiring");
  window.setTimeout(finish, 350);
}

// ============================================================
// Timers (per-message bars + chat countdown)
// ============================================================
function updateMessageTimers() {
  document.querySelectorAll(".message-shell[data-message-id]").forEach((shell) => {
    const message = findMessageById(shell.dataset.messageId);
    if (!message) return;
    const bar = shell.querySelector(".message-timer");
    if (!bar) return;
    const remaining = message.expiresAt
      ? Math.max(0, new Date(message.expiresAt).getTime() - Date.now())
      : FIVE_HOURS;
    const ttl = getPrivacyConfig(message?.privacyMode || (message?.burnAfterRead ? "10s_read" : "5h")).seconds;
    const percent = Math.max(0, Math.min(100, (remaining / (ttl * 1000)) * 100));
    bar.style.setProperty("--timer-width", `${percent}%`);
    bar.classList.toggle("critical", remaining < 600000);
    if (remaining <= 0 && !message.expiring) expireMessage(message.id, { natural: true });
  });
}

export function startMessageTicker() {
  window.clearInterval(state.messageTicker);
  state.messageTicker = window.setInterval(updateMessageTimers, 1000);
}

export function startChatCountdown(chat) {
  window.clearInterval(state.countdownTimer);
  updateChatCountdown(chat);
  state.countdownTimer = window.setInterval(() => updateChatCountdown(chat), 30000);
}

export function stopChatCountdown() {
  window.clearInterval(state.countdownTimer);
  state.countdownTimer = null;
}

// ============================================================
// Typing indicator (realtime broadcast)
// ============================================================
function broadcastTyping(eventName) {
  if (!state.activeSubscription || !state.currentProfile?.id) return;
  state.activeSubscription.send({
    type: "broadcast",
    event: eventName,
    payload: { userId: state.currentProfile.id },
  }).catch((e) => console.warn(e));
}

export function handleComposerTyping() {
  const now = Date.now();
  if (now - state.typingLastSentAt > 2000) {
    state.typingLastSentAt = now;
    broadcastTyping("typing");
  }
  window.clearTimeout(state.typingStopTimer);
  state.typingStopTimer = window.setTimeout(() => broadcastTyping("stopped_typing"), 3000);
}

// ============================================================
// Reply draft
// ============================================================
function getMessageSummary(message) {
  const text = message?.text || message?.fileName || "";
  return text.length > 72 ? `${text.slice(0, 72)}…` : text;
}

export function setReplyDraft(message) {
  if (!message) return;
  state.replyDraft = { id: message.id, text: getMessageSummary(message) };
  updateReplyComposer();
  $("messageInput").focus();
}

export function clearReplyDraft() {
  state.replyDraft = null;
  updateReplyComposer();
}

export function updateReplyComposer() {
  const composer = $("replyComposer");
  const text = $("replyComposerText");
  const t = i18n[state.currentLang];
  if (!state.replyDraft) {
    composer.hidden = true;
    text.textContent = "";
    return;
  }
  composer.hidden = false;
  text.textContent = t.replyTo.replace("{text}", state.replyDraft.text || "");
  $("cancelReplyBtn").setAttribute("aria-label", t.cancelReply);
}
