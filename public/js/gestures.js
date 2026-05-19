import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { SWIPE_DELETE_THRESHOLD, SWIPE_REPLY_THRESHOLD } from "./config.js";
import { $, vibrate, showToast } from "./utils.js";
import { getChat, renderMessages } from "./render.js";
import {
  findMessageById, setReplyDraft, expireMessage,
} from "./messages.js";

// ============================================================
// Swipe-to-reply / swipe-to-delete on bubbles
// ============================================================
export function attachSwipeToMessages() {
  document.querySelectorAll(".message-shell").forEach((shell) => {
    if (shell.dataset.swipeReady) return;
    shell.dataset.swipeReady = "true";

    let startX = 0, startY = 0, deltaX = 0;
    let longPressTimer = null, longPressMoved = false;
    const bubble = shell.querySelector(".message");
    const replyDirection = document.documentElement.dir === "rtl" ? -1 : 1;
    const deleteDirection = -replyDirection;

    shell.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      deltaX = 0;
      longPressMoved = false;
      window.clearTimeout(longPressTimer);
      longPressTimer = window.setTimeout(() => {
        if (!longPressMoved) openMessageActions(shell.dataset.messageId);
      }, 520);
      bubble.classList.remove("swipe-returning");
    }, { passive: true });

    shell.addEventListener("touchmove", (event) => {
      const rawX = event.touches[0].clientX - startX;
      const rawY = event.touches[0].clientY - startY;
      if (Math.abs(rawX) > 8 || Math.abs(rawY) > 8) {
        longPressMoved = true;
        window.clearTimeout(longPressTimer);
      }
      deltaX = Math.max(-SWIPE_DELETE_THRESHOLD, Math.min(SWIPE_DELETE_THRESHOLD, rawX));
      const distance = Math.min(Math.abs(deltaX), SWIPE_DELETE_THRESHOLD);
      bubble.style.setProperty("--swipe-x", `${deltaX}px`);
      const isReply = Math.sign(deltaX) === replyDirection;
      const isDelete = Math.sign(deltaX) === deleteDirection;
      bubble.style.setProperty("--reply-opacity", String(isReply ? distance / SWIPE_REPLY_THRESHOLD : 0));
      bubble.style.setProperty("--delete-opacity", String(isDelete ? distance / SWIPE_DELETE_THRESHOLD : 0));
    }, { passive: true });

    shell.addEventListener("touchend", () => {
      window.clearTimeout(longPressTimer);
      if (Math.sign(deltaX) === replyDirection && Math.abs(deltaX) > SWIPE_REPLY_THRESHOLD) {
        setReplyDraft(findMessageById(shell.dataset.messageId));
        resetMessageSwipe(bubble);
        return;
      }
      if (Math.sign(deltaX) === deleteDirection && Math.abs(deltaX) > SWIPE_DELETE_THRESHOLD) {
        shell.classList.add("message-expiring");
        expireMessage(shell.dataset.messageId, { swipe: true });
        return;
      }
      resetMessageSwipe(bubble);
    });

    shell.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      openMessageActions(shell.dataset.messageId);
    });
  });
}

function resetMessageSwipe(bubble) {
  bubble.classList.add("swipe-returning");
  bubble.style.setProperty("--swipe-x", "0px");
  bubble.style.setProperty("--delete-opacity", "0");
  bubble.style.setProperty("--reply-opacity", "0");
}

// ============================================================
// Action sheet
// ============================================================
export function openMessageActions(messageId) {
  const message = findMessageById(messageId);
  if (!message) return;
  state.activeActionMessageId = messageId;
  const t = i18n[state.currentLang];

  $("messageActions").hidden = false;
  $("messageActionsTitle").textContent = t.messageActions;
  $("replyActionBtn").textContent = t.reply;
  $("copyMessageBtn").textContent = t.copyMessage;
  $("burnMessageNowBtn").textContent = t.burnNow;
  vibrate(10);
}

export function closeMessageActions() {
  state.activeActionMessageId = "";
  $("messageActions").hidden = true;
}

function getActiveActionMessage() {
  return state.activeActionMessageId ? findMessageById(state.activeActionMessageId) : null;
}

export async function copyActiveMessage() {
  const message = getActiveActionMessage();
  if (!message?.text) return;
  await navigator.clipboard?.writeText(message.text);
  closeMessageActions();
  showToast(i18n[state.currentLang].copiedMessage);
}

export function replyToActiveMessage() {
  const message = getActiveActionMessage();
  if (message) setReplyDraft(message);
  closeMessageActions();
}

export function burnActiveMessageNow() {
  const message = getActiveActionMessage();
  closeMessageActions();
  if (message) expireMessage(message.id, { swipe: true });
}

export function addReactionToActiveMessage(reaction) {
  const message = getActiveActionMessage();
  if (!message) return;
  message.reaction = reaction;
  closeMessageActions();
  renderMessages(getChat(state.activeConversationId || $("chatView")?.dataset.activeChat));
  showToast(i18n[state.currentLang].reactionAdded);
}
