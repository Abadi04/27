import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { MESSAGE_TTL_SECONDS } from "./config.js";
import {
  $, isLiveMode, isMissingRelationError, vibrate,
  showToast, handleAsyncError, getTemporaryShareLink, createMessageId,
} from "./utils.js";

// ============================================================
// Create + show share drop card
// ============================================================
export async function createTemporaryShareLink(type) {
  const link = getTemporaryShareLink(type);
  if (isLiveMode()) {
    const { error } = await db.from("temporary_links").insert({
      owner_id: state.currentProfile.id,
      token: link.token,
      link_type: type === "room" ? "room" : "ask",
      expires_at: new Date(Date.now() + MESSAGE_TTL_SECONDS * 1000).toISOString(),
    });
    if (error && !isMissingRelationError(error)) throw error;
  }
  return link.url;
}

export async function showShareDrop(type) {
  const t = i18n[state.currentLang];
  state.generatedShareLink = await createTemporaryShareLink(type);

  $("shareDrop").hidden = false;
  $("shareDropKicker").textContent = t.shareReady;
  $("shareDropTitle").textContent = type === "room" ? t.roomShareTitle : t.askShareTitle;
  $("shareDropDesc").textContent = type === "room" ? t.roomShareDesc : t.askShareDesc;
  $("shareLinkInput").value = state.generatedShareLink;
  $("copyShareLinkBtn").textContent = t.copy;

  showToast(t.linkCreated);
  vibrate(20);
}

export async function copyGeneratedShareLink() {
  const link = state.generatedShareLink || $("shareLinkInput")?.value;
  if (!link) return;
  try {
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(link); copied = true; }
      catch { copied = false; }
    }
    if (!copied) {
      const input = $("shareLinkInput");
      input.focus(); input.select();
      copied = document.execCommand("copy");
    }
    showToast(copied ? i18n[state.currentLang].copied : link);
  } catch (error) {
    handleAsyncError(error, link);
  }
}

// ============================================================
// Entry card (when someone opens an ?ask= / ?room= link)
// ============================================================
export function showEntryCard(type, token) {
  const t = i18n[state.currentLang];
  state.entryMode = type;

  $("entryCard").hidden = false;
  $("entryCard").dataset.token = token;
  $("entryCardKicker").textContent = type === "room" ? t.roomEntryKicker : t.anonymousEntryKicker;
  $("entryCardTitle").textContent = type === "room" ? t.roomEntryTitle : t.anonymousEntryTitle;
  $("entryCardDesc").textContent = type === "room" ? t.roomEntryDesc : t.anonymousEntryDesc;
  $("entryMessageInput").placeholder = type === "room" ? t.roomPlaceholder : t.anonymousPlaceholder;
  $("entrySendBtn").textContent = type === "room" ? t.roomSend : t.anonymousSend;
}

export function handleTemporaryEntryParams() {
  const params = new URLSearchParams(window.location.search);
  const ask = params.get("ask");
  const room = params.get("room");
  if (ask) showEntryCard("ask", ask);
  if (room) showEntryCard("room", room);
}

export async function submitTemporaryEntry() {
  const text = $("entryMessageInput").value.trim();
  if (!text) return;
  const token = $("entryCard").dataset.token || createMessageId(state.entryMode === "room" ? "ROOM" : "ASK");
  const entry = {
    id: createMessageId("entry"),
    token,
    mode: state.entryMode || "ask",
    text,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + MESSAGE_TTL_SECONDS * 1000).toISOString(),
  };

  if (isLiveMode()) {
    const { data: link, error: linkError } = await db
      .from("temporary_links").select("id, owner_id, link_type")
      .eq("token", token).maybeSingle();
    if (linkError && !isMissingRelationError(linkError)) throw linkError;

    if (link?.id && link.link_type === "ask") {
      const { error } = await db.from("anonymous_entries").insert({
        link_id: link.id,
        owner_id: link.owner_id,
        body: text,
        expires_at: entry.expiresAt,
      });
      if (!error) {
        $("entryMessageInput").value = "";
        showToast(i18n[state.currentLang].entryQueued);
        return;
      }
      console.warn(error);
    }
  }

  // Local fallback storage
  const key = "twentyseven_temporary_entries";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 24)));
  $("entryMessageInput").value = "";
  showToast(i18n[state.currentLang].entryQueued);
}
