import { FIVE_HOURS } from "./config.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import {
  $, escapeHtml, getInitials, hashHue,
  formatRemaining, formatTTL,
  getPrivacyConfig, getPrivacyLabel,
} from "./utils.js";
// FIX: import attachSwipeToMessages here to call after each render
import { attachSwipeToMessages } from "./gestures.js";

// ============================================================
// Helpers used by rendering
// ============================================================
export function getChat(chatId) {
  return [...state.chats, ...state.burnedChats, ...state.blockedChats]
    .find((c) => c.id === chatId);
}

export function getChatName(chat) {
  if (!chat) return "";
  return chat.names?.[state.currentLang] || chat.otherProfile?.display_name || chat.name || chat.id;
}

export function getMessages(chat) {
  if (!chat) return [];
  if (chat.messages?.[state.currentLang]) return chat.messages[state.currentLang];
  return chat.messages?.neutral || [];
}

export function getChatExpiryTime(chat) {
  if (!chat) return 0;
  const messages = getMessages(chat);
  const latest = messages.reduce((acc, m) => {
    if (!m.expiresAt) return acc;
    return Math.max(acc, new Date(m.expiresAt).getTime());
  }, 0);
  if (latest) return latest;
  if (chat.expiresAt) return chat.expiresAt;
  if (chat.lastMessageAt) return chat.lastMessageAt + FIVE_HOURS;
  return Date.now() + FIVE_HOURS;
}

export function moveExpiredChatsToBurned() {
  const now = Date.now();
  const expired = state.chats.filter((c) => getChatExpiryTime(c) <= now);
  if (!expired.length) return 0;
  state.burnedChats = [
    ...expired.map((c) => ({ ...c, burned: true, status: "expired" })),
    ...state.burnedChats,
  ].slice(0, 12);
  state.chats = state.chats.filter((c) => getChatExpiryTime(c) > now);
  return expired.length;
}

function isIncomingRequest(request) {
  return request.target_id === state.currentProfile?.id || request.target_id === "demo-self";
}

function getChatPreview(chat) {
  const messages = getMessages(chat);
  const last = messages[messages.length - 1];
  const t = i18n[state.currentLang];
  if (!last) return t.emptyChat;
  if (last.mediaUrl) return last.fileName || t.attach;
  return last.text || t.emptyChat;
}

function getChatPill(chat) {
  const t = i18n[state.currentLang];
  if (chat.burned) return t.burnedHeader;
  if (chat.status === "blocked") return t.block;
  return getPrivacyLabel(chat.privacyMode || "5h", i18n);
}

function getChatItemMeta(chat) {
  const t = i18n[state.currentLang];
  const preview = getChatPreview(chat);
  const remaining = getChatExpiryTime(chat) - Date.now();
  const expiry = remaining <= 0
    ? t.expiredStateTitle
    : t.expiresIn.replace("{time}", formatRemaining(remaining, t));
  return preview ? `${preview} · ${expiry}` : expiry;
}

function getMessageStatusLabel(message) {
  const t = i18n[state.currentLang];
  if (message.burnAfterRead && message.readAt) return t.burnAfterRead;
  if (message.status === "read" || message.readAt) return t.readStatus;
  if (message.status === "delivered") return t.deliveredStatus;
  return t.sentStatus;
}

function getMessageRemaining(message) {
  if (!message?.expiresAt) return FIVE_HOURS;
  return Math.max(0, new Date(message.expiresAt).getTime() - Date.now());
}

function getMessageTimerPercent(message) {
  const ttl = getPrivacyConfig(message?.privacyMode || (message?.burnAfterRead ? "10s_read" : "5h")).seconds;
  return Math.max(0, Math.min(100, (getMessageRemaining(message) / (ttl * 1000)) * 100));
}

// ============================================================
// Chat list
// ============================================================
export function renderChats() {
  const list = $("chatsList");
  const empty = $("emptyState");
  const t = i18n[state.currentLang];
  moveExpiredChatsToBurned();

  if (state.chatsHidden) {
    list.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = `
      <strong>${escapeHtml(t.hiddenChatsTitle)}</strong>
      <span id="emptyText">${escapeHtml(t.hiddenChatsBody)}</span>
    `;
    return;
  }

  if (!state.chats.length && !state.conversationRequests.length
      && !state.burnedChats.length && !state.blockedChats.length) {
    list.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = `
      <strong>${escapeHtml(t.noChatsTitle)}</strong>
      <span id="emptyText">${escapeHtml(t.noChatsBody)}</span>
    `;
    return;
  }

  empty.hidden = true;
  const incomingRequests = state.conversationRequests.filter(isIncomingRequest);
  const pendingRequests = state.conversationRequests.filter((r) => !isIncomingRequest(r));

  const requestsMarkup = incomingRequests.length ? `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(t.requestsHeader)}</div>
      ${incomingRequests.map(renderRequestItem).join("")}
    </div>` : "";

  const pendingMarkup = pendingRequests.length ? `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(t.pendingHeader)}</div>
      ${pendingRequests.map(renderRequestItem).join("")}
    </div>` : "";

  const expiring = state.chats.filter((c) => getChatExpiryTime(c) - Date.now() < 30 * 60 * 1000);
  const active = state.chats.filter((c) => !expiring.includes(c));

  const expiringStrip = expiring.length ? renderExpiringStrip(expiring) : "";
  const expiringGroup = expiring.length ? renderChatGroup(t.expiringHeader, expiring) : "";
  const activeGroup = active.length ? renderChatGroup(t.activeHeader, active) : "";
  const burnedGroup = state.burnedChats.length ? renderChatGroup(t.burnedHeader, state.burnedChats, true) : "";
  const blockedGroup = state.blockedChats.length ? renderChatGroup(t.blockedHeader, state.blockedChats, true) : "";

  list.innerHTML = `${requestsMarkup}${pendingMarkup}${expiringStrip}${expiringGroup}${activeGroup}${burnedGroup}${blockedGroup}`;
}

function renderChatGroup(title, items, disabled = false) {
  return `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(title)}</div>
      ${items.map((c) => renderChatItem(c, disabled)).join("")}
    </div>`;
}

function renderExpiringStrip(items) {
  const t = i18n[state.currentLang];
  const soonest = items.reduce((acc, c) => getChatExpiryTime(c) < getChatExpiryTime(acc) ? c : acc, items[0]);
  const remaining = Math.max(0, getChatExpiryTime(soonest) - Date.now());
  const template = items.length === 1 ? t.expiringStripOne : t.expiringStrip;
  const label = template
    .replace("{count}", items.length)
    .replace("{time}", formatRemaining(remaining, t));
  return `
    <button class="expiring-strip" type="button" data-chat-id="${escapeHtml(soonest.id)}">
      <span class="expiring-dot" aria-hidden="true"></span>
      <span>${escapeHtml(label)}</span>
    </button>`;
}

function getChatTimerProgress(chat) {
  if (chat.burned || chat.status === "blocked") return 0;
  const expiry = getChatExpiryTime(chat);
  const remaining = expiry - Date.now();
  if (remaining <= 0) return 0;
  const total = FIVE_HOURS;
  return Math.min(1, Math.max(0, remaining / total));
}

function renderTimerRing(progress, nearEnd) {
  const R = 22;
  const CX = 25;
  const CY = 25;
  const CIRC = 2 * Math.PI * R;
  const dashoffset = CIRC * (1 - progress);
  const strokeColor = nearEnd ? "#8B0000" : "hsl(220,55%,42%)";
  return `<svg width="50" height="50" viewBox="0 0 50 50"
      style="position:absolute;top:0;left:0;transform:rotate(-90deg)"
      aria-hidden="true">
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="none"
      stroke="#ffffff0a" stroke-width="1.5"/>
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="none"
      stroke="${strokeColor}" stroke-width="1.5"
      stroke-linecap="round"
      stroke-dasharray="${CIRC.toFixed(2)}"
      stroke-dashoffset="${dashoffset.toFixed(2)}"
      style="transition:stroke-dashoffset .6s ease,stroke .6s ease"/>
  </svg>`;
}

function renderChatItem(chat, disabled = false) {
  const t = i18n[state.currentLang];
  const name = getChatName(chat);
  const hue = hashHue(chat.otherProfile?.avatar_seed || name);
  const isExpired = chat.burned;
  const stateClass = isExpired ? "is-expired" : chat.status === "blocked" ? "is-blocked" : "";

  const preview = chat.burned
    ? t.expiredStateTitle
    : chat.status === "blocked"
      ? t.blockedStateTitle
      : getChatPreview(chat);

  const remaining = getChatExpiryTime(chat) - Date.now();
  const statusLabel = chat.burned || chat.status === "blocked"
    ? ""
    : remaining <= 0
      ? t.expiredStateTitle
      : t.expiresIn.replace("{time}", formatRemaining(remaining, t));

  const progress = getChatTimerProgress(chat);
  const nearEnd = !isExpired && progress < 0.2;

  return `
    <div class="chat-item ${disabled ? "state-only" : ""} ${stateClass} ${nearEnd ? "near-end" : ""}"
         role="button" tabindex="${isExpired ? -1 : 0}"
         data-chat-id="${escapeHtml(chat.id)}" aria-label="${escapeHtml(name)}">
      <div class="chat-avatar-ring">
        ${renderTimerRing(progress, nearEnd)}
        <div class="chat-avatar" style="--avatar-hue: ${hue}">${escapeHtml(getInitials(name))}</div>
      </div>
      <div class="chat-info">
        <div class="chat-name">${escapeHtml(name)}</div>
        ${preview ? `<div class="chat-meta">${escapeHtml(preview)}</div>` : ""}
        ${statusLabel ? `<div class="chat-status-label ${nearEnd ? "near-end" : ""}">${escapeHtml(statusLabel)}</div>` : ""}
      </div>
    </div>`;
}

function renderRequestItem(request) {
  const t = i18n[state.currentLang];
  const profile = isIncomingRequest(request) ? request.requester : request.target;
  const name = profile?.display_name || profile?.public_code || "27";
  const hue = hashHue(profile?.avatar_seed || name);
  const incoming = isIncomingRequest(request);

  return `
    <div class="request-item ${incoming ? "incoming-request" : "pending-request"}"
         data-request-id="${escapeHtml(request.id)}">
      <div class="chat-avatar" style="--avatar-hue: ${hue}">${escapeHtml(getInitials(name))}</div>
      <div class="chat-info">
        <div class="chat-name">${escapeHtml(incoming ? t.requestIncoming.replace("{name}", name) : t.requestSent)}</div>
        <div class="chat-meta">${escapeHtml(incoming ? profile?.public_code || "" : t.pendingState)}</div>
      </div>
      ${incoming ? `
        <div class="request-actions">
          <button class="mini-action accept-request" type="button">${escapeHtml(t.accept)}</button>
          <button class="mini-action reject-request" type="button">${escapeHtml(t.reject)}</button>
          <button class="mini-action danger reject-block-request" type="button">${escapeHtml(t.block)}</button>
        </div>` : ""}
    </div>`;
}

// ============================================================
// Messages
// ============================================================
function renderTypingIndicator() {
  return `
    <div class="typing-indicator" role="status" aria-live="polite">
      <span>${escapeHtml(i18n[state.currentLang].typing)}</span>
      <i></i><i></i><i></i>
    </div>`;
}

function renderMessageContent(message) {
  const text = escapeHtml(message.text || "");
  const t = i18n[state.currentLang];

  if (message.messageType === "voice") {
    return `
      <span class="voice-message">
        <span class="voice-play" aria-hidden="true"></span>
        <span class="voice-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        <span>${text || "0:03"}</span>
      </span>`;
  }
  if (message.messageType === "gif") {
    return `<span class="gif-message"><strong>${text}</strong><small>GIF</small></span>`;
  }
  if (message.hidden) {
    return `
      <span class="hidden-message" tabindex="0" role="button" aria-label="${escapeHtml(t.hiddenRevealHint)}">
        <span class="hidden-mask">${escapeHtml(t.hiddenRevealHint)}</span>
        <span class="hidden-content">${text}</span>
      </span>`;
  }
  if (message.mediaUrl && message.mediaType?.startsWith("image/")) {
    const caption = message.text ? `<span class="media-caption">${escapeHtml(message.text)}</span>` : "";
    return `<img class="message-media" src="${escapeHtml(message.mediaUrl)}" alt="${escapeHtml(message.fileName || "")}" />${caption}`;
  }
  if (message.mediaUrl && message.mediaType?.startsWith("video/")) {
    const caption = message.text ? `<span class="media-caption">${escapeHtml(message.text)}</span>` : "";
    return `<video class="message-media" src="${escapeHtml(message.mediaUrl)}" controls playsinline></video>${caption}`;
  }
  return `<span class="message-text">${text}</span>`;
}

export function renderMessages(chat, onRendered) {
  const t = i18n[state.currentLang];
  const messages = getMessages(chat);

  const body = messages.length ? messages.map((message) => {
    const remaining = getMessageRemaining(message);
    const percent = getMessageTimerPercent(message);
    const criticalClass = remaining < 600000 ? " critical" : "";
    const burnLabel = message.burnAfterRead
      ? `<span class="burn-label">${escapeHtml(t.burnAfterRead)}</span>` : "";
    const statusLabel = message.type === "outgoing"
      ? `<span class="message-status">${escapeHtml(getMessageStatusLabel(message))}</span>` : "";
    const replyQuote = message.replyToText
      ? `<span class="message-reply-quote">${escapeHtml(message.replyToText)}</span>` : "";
    const reaction = message.reaction
      ? `<span class="message-reaction">${escapeHtml(message.reaction)}</span>` : "";
    const ttlInfo = formatTTL(remaining, t);
    const ttlLabel = ttlInfo
      ? `<span class="message-ttl ${ttlInfo.cls}">${escapeHtml(ttlInfo.text)}</span>` : "";

    const blurClass = (message.burnAfterRead && message.type === "incoming" && !message.readAt) ? " blur-until-read" : "";
    const tapHint = blurClass ? (i18n[state.currentLang].tapToRead || "اضغط للقراءة") : "";
    return `
      <div class="message-shell ${message.type}" data-message-id="${escapeHtml(message.id || "")}">
        <div class="swipe-reply-cue" aria-hidden="true">↩</div>
        <div class="swipe-delete-cue" aria-hidden="true">🔥</div>
        <div class="message ${message.type}${blurClass}" data-tap-hint="${escapeHtml(tapHint)}" style="--swipe-x: 0px; --delete-opacity: 0;">
          ${replyQuote}
          ${renderMessageContent(message)}
          ${burnLabel}
          ${reaction}
          <span class="message-time">${escapeHtml(message.time || t.now)} ${ttlLabel} ${statusLabel}</span>
          <span class="message-timer${criticalClass}" style="--timer-width: ${percent}%"></span>
        </div>
      </div>`;
  }).join("") : `<div class="system-note">${escapeHtml(t.emptyChat)}</div>`;

  const list = $("messagesList");
  list.innerHTML = `<div class="system-note">${escapeHtml(t.systemNote)}</div>${body}${state.typing ? renderTypingIndicator() : ""}`;

  // FIX: attach swipe gestures to newly rendered message shells
  attachSwipeToMessages();

  requestAnimationFrame(() => { list.scrollTop = list.scrollHeight; });
  onRendered?.(chat);
}

export function renderConversationState(stateName) {
  const t = i18n[state.currentLang];
  const isBlocked = stateName === "blocked";
  $("chatViewStatus").textContent = isBlocked ? t.blockedStateTitle : t.expiredStateTitle;
  $("messageForm").hidden = true;
  const privBar = document.querySelector(".chat-privacy-bar");
  if (privBar) privBar.hidden = true;
  $("messagesList").innerHTML = `
    <div class="conversation-state ${isBlocked ? "blocked" : "expired"}">
      <div class="conversation-state-icon" aria-hidden="true">${isBlocked ? "!" : "27"}</div>
      <h3>${escapeHtml(isBlocked ? t.blockedStateTitle : t.expiredStateTitle)}</h3>
      <p>${escapeHtml(isBlocked ? t.blockedStateBody : t.expiredStateBody)}</p>
    </div>`;
}

export function updateChatCountdown(chat) {
  if ($("chatView").hidden || !chat) return;
  const t = i18n[state.currentLang];
  const remaining = getChatExpiryTime(chat) - Date.now();
  $("chatViewStatus").textContent = remaining <= 0
    ? t.expired
    : t.expiresIn.replace("{time}", formatRemaining(remaining, t));
}
