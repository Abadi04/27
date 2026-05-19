import { PRIVACY_MODES, FIVE_HOURS } from "./config.js";
import { state } from "./state.js";
import { db } from "./db.js";

// ============================================================
// DOM helpers
// ============================================================
export const $ = (id) => document.getElementById(id);

export function setLoading(message, visible = true) {
  const el = $("loadingState");
  if (!el) return;
  el.textContent = message || "";
  el.hidden = !visible;
}

export function setButtonBusy(button, busy, label) {
  if (!button) return;
  if (busy) {
    button.dataset.idleText = button.textContent;
    button.textContent = label || button.textContent;
    button.disabled = true;
    return;
  }
  button.disabled = false;
  if (button.dataset.idleText) button.textContent = button.dataset.idleText;
  delete button.dataset.idleText;
}

let toastTimer = null;
export function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

let errorTimer = null;
export function flashError(message) {
  const el = $("errorState");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(errorTimer);
  errorTimer = window.setTimeout(() => { el.hidden = true; }, 2400);
}

export function handleAsyncError(error, fallbackMessage = "حدث خطأ ما.") {
  console.warn(error);
  flashError(fallbackMessage);
}

// ============================================================
// Environment / capabilities
// ============================================================
export function vibrate(pattern) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

export function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

export function getAppBasePath() {
  return window.location.pathname.endsWith("/")
    ? window.location.pathname
    : window.location.pathname.replace(/\/[^/]*$/, "/");
}

export function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// ============================================================
// Strings / formatting
// ============================================================
export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[c]));
}

export function getInitials(name = "") {
  const clean = name.replace(/[^\p{L}\p{N}\s#]/gu, "").trim();
  if (!clean) return "27";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].replace("#", "").slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function hashHue(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 360;
  return hash;
}

export function randomPublicCode() {
  return String(Math.floor(Math.random() * 900000) + 100000);
}

export function createMessageId(prefix = "msg") {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createShareToken(prefix) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${random}-${Date.now().toString(36).toUpperCase()}`;
}

export function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(state.currentLang === "ar" ? "ar-SA" : "en", {
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

export function formatRemaining(ms, t) {
  if (ms <= 60000) return t.lessThanMinute;
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${t.hoursUnit.replace("{count}", hours)} ${t.minutesUnit.replace("{count}", minutes)}`;
  }
  if (hours > 0) return t.hoursUnit.replace("{count}", hours);
  return t.minutesUnit.replace("{count}", minutes);
}

export function formatTTL(ms, t) {
  if (ms <= 0) return null;
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (mins < 1) return { text: t.ttlSeconds || "< 1m", cls: "ttl-critical" };
  if (mins < 30) return { text: `${mins}m`, cls: "ttl-warning" };
  if (hrs < 1)   return { text: `${mins}m`, cls: "" };
  const remMins = mins % 60;
  return { text: remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`, cls: "" };
}

// ============================================================
// App-specific helpers
// ============================================================
export function isUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isLiveMode() {
  return Boolean(db && state.currentProfile);
}

export function isMissingRelationError(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42P01", "42703", "PGRST200", "PGRST204"].includes(error?.code)
    || message.includes("does not exist")
    || message.includes("schema cache")
    || message.includes("could not find")
    || message.includes("relationship");
}

export function getPrivacyConfig(mode = state.privacyMode) {
  return PRIVACY_MODES[mode] || PRIVACY_MODES["5h"];
}

export function getPrivacyLabel(mode, i18n) {
  const t = i18n[state.currentLang];
  return ({
    "10s_read": t.privacy10s,
    "5m":       t.privacy5m,
    "1h":       t.privacy1h,
    "5h":       t.privacy5h,
    "close":    t.privacyClose,
  })[mode] || t.privacy5h;
}

export function getShareLink() {
  const code = state.currentProfile?.public_code || $("profileCodeValue")?.textContent?.trim() || "";
  const base = `${window.location.origin}${getAppBasePath()}`;
  return code ? `${base}?code=${encodeURIComponent(code)}` : base;
}

export function getTemporaryShareLink(type) {
  const base = `${window.location.origin}${getAppBasePath()}`;
  const param = type === "room" ? "room" : "ask";
  const token = createShareToken(type === "room" ? "ROOM" : "ASK");
  return { token, url: `${base}?${param}=${encodeURIComponent(token)}` };
}
