// ============================================================
// arena.js — الساحة: anonymous public ephemeral feed
// Each message lives exactly 60 minutes then fades out.
// No likes, no replies — just words that fly and vanish.
// ============================================================
import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { $, showToast, isLiveMode } from "./utils.js";

// ── Internal state ──────────────────────────────────────────────
const arena = {
  messages: [],
  subscription: null,
  countdownTimer: null,
  lastSentAt: 0,
};

const RATE_LIMIT_MS = 3 * 60 * 1000; // 3 minutes between sends
const MAX_CHARS = 280;
const EXPIRE_MS = 60 * 60 * 1000; // 60 minutes

// ── Content filter ──────────────────────────────────────────────
const BLOCKED = [
  "fuck", "shit", "bitch", "cunt", "nigger", "faggot",
  "خرا", "كلب", "عاهر", "حمار", "شرموطة", "زبالة", "قحبة", "منيوك",
];

function isOffensive(text) {
  const lower = text.toLowerCase();
  return BLOCKED.some((w) => lower.includes(w));
}

// ── Escape HTML ─────────────────────────────────────────────────
function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Geometric avatar from anonymous_id ─────────────────────────
// Deterministic: same ID → same shape & color, always.
function shapeAvatar(anonId) {
  const seed = [...String(anonId)].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffffff, 0);
  const hue = seed % 360;
  const sat = 50 + (seed % 35);
  const lgt = 52 + (seed % 20);
  const color = `hsl(${hue},${sat}%,${lgt}%)`;
  const idx = seed % 5;
  const shapes = [
    `<circle cx="20" cy="20" r="14"/>`,
    `<polygon points="20,6 34,34 6,34"/>`,
    `<rect x="6" y="6" width="28" height="28" rx="5"/>`,
    `<polygon points="20,4 34,12 34,28 20,36 6,28 6,12"/>`,
    `<polygon points="20,5 32,13 28,30 12,30 8,13"/>`,
  ];
  return `<svg width="36" height="36" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="${color}">${shapes[idx]}</g>
  </svg>`;
}

// ── Countdown formatter ─────────────────────────────────────────
function countdown(expiresAt) {
  const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Badge ───────────────────────────────────────────────────────
export function updateArenaBadge() {
  const badge = $("arenaBadge");
  if (!badge) return;
  const count = arena.messages.filter(
    (m) => new Date(m.expires_at).getTime() > Date.now()
  ).length;
  badge.textContent = count;
  badge.hidden = count === 0;
}

// ── Render feed ─────────────────────────────────────────────────
export function renderArenaFeed() {
  const feed = $("arenaFeed");
  if (!feed) return;
  const t = i18n[state.currentLang];
  const now = Date.now();

  const live = arena.messages
    .filter((m) => new Date(m.expires_at).getTime() > now)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (!live.length) {
    feed.innerHTML = `<div class="arena-empty">
      <div class="arena-empty-icon" aria-hidden="true">⚡</div>
      <p>${esc(t.arenaEmpty)}</p>
    </div>`;
    return;
  }

  const myId = state.currentProfile?.id || "demo-self";

  feed.innerHTML = live.map((msg) => {
    const isMine = msg.anonymous_id === myId;
    const remaining = Math.max(0, new Date(msg.expires_at).getTime() - now);
    const urgentClass = remaining < 5 * 60 * 1000 ? " arena-msg--urgent" : "";
    const mineClass = isMine ? " arena-msg--mine" : "";
    return `
      <div class="arena-msg${urgentClass}${mineClass}"
           data-id="${esc(msg.id)}"
           data-expires="${esc(msg.expires_at)}">
        <div class="arena-avatar">${shapeAvatar(msg.anonymous_id)}</div>
        <div class="arena-bubble">
          <p class="arena-msg-text">${esc(msg.content)}</p>
          <span class="arena-msg-ttl" data-expires="${esc(msg.expires_at)}">
            ${countdown(msg.expires_at)}
          </span>
        </div>
        ${isMine ? `<button class="arena-delete-btn" data-id="${esc(msg.id)}" type="button" aria-label="${esc(t.arenaDelete)}">×</button>` : ""}
      </div>`;
  }).join("");

  feed.querySelectorAll(".arena-delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteArenaMessage(btn.dataset.id));
  });
}

// ── Countdown ticker ────────────────────────────────────────────
function startCountdownTicker() {
  if (arena.countdownTimer) clearInterval(arena.countdownTimer);
  arena.countdownTimer = setInterval(() => {
    const now = Date.now();
    // Update all visible countdowns
    document.querySelectorAll(".arena-msg-ttl[data-expires]").forEach((el) => {
      const ms = new Date(el.dataset.expires).getTime() - now;
      if (ms <= 0) {
        const msgEl = el.closest(".arena-msg");
        if (msgEl && !msgEl.classList.contains("arena-msg--fading")) {
          msgEl.classList.add("arena-msg--fading");
          setTimeout(() => {
            const id = msgEl.dataset.id;
            arena.messages = arena.messages.filter((m) => m.id !== id);
            renderArenaFeed();
            updateArenaBadge();
          }, 820);
        }
      } else {
        el.textContent = countdown(el.dataset.expires);
      }
    });
  }, 1000);
}

export function stopArenaCountdown() {
  if (arena.countdownTimer) {
    clearInterval(arena.countdownTimer);
    arena.countdownTimer = null;
  }
}

// ── Demo messages (shown in demo/offline mode) ──────────────────
function buildDemoMessages() {
  const now = Date.now();
  return [
    {
      id: "d1", anonymous_id: "seed-cafe42",
      content: "مرحباً بالجميع في الساحة! كل رسالة هنا تختفي خلال ساعة.",
      created_at: new Date(now - 8 * 60000).toISOString(),
      expires_at: new Date(now + 52 * 60000).toISOString(),
    },
    {
      id: "d2", anonymous_id: "seed-7b3f91",
      content: "Hello from the arena! Anonymous, temporary, real.",
      created_at: new Date(now - 18 * 60000).toISOString(),
      expires_at: new Date(now + 42 * 60000).toISOString(),
    },
    {
      id: "d3", anonymous_id: "seed-a1d55e",
      content: "لا هوية، لا تاريخ — فقط الكلمات وهي تتلاشى.",
      created_at: new Date(now - 35 * 60000).toISOString(),
      expires_at: new Date(now + 25 * 60000).toISOString(),
    },
    {
      id: "d4", anonymous_id: "seed-2c8e04",
      content: "أكتب ما تشاء. سيختفي قريباً كأنه لم يكن.",
      created_at: new Date(now - 50 * 60000).toISOString(),
      expires_at: new Date(now + 10 * 60000).toISOString(),
    },
  ];
}

// ── Load arena ──────────────────────────────────────────────────
export async function loadArena() {
  if (!isLiveMode()) {
    arena.messages = buildDemoMessages();
    renderArenaFeed();
    updateArenaBadge();
    startCountdownTicker();
    return;
  }

  try {
    const { data, error } = await db
      .from("arena_messages")
      .select("id, anonymous_id, content, created_at, expires_at")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    arena.messages = data || [];
  } catch {
    showToast(i18n[state.currentLang].arenaLoadError);
    arena.messages = [];
  }

  renderArenaFeed();
  updateArenaBadge();
  startCountdownTicker();
}

// ── Realtime subscription ───────────────────────────────────────
export function subscribeToArena() {
  if (!isLiveMode() || arena.subscription) return;

  arena.subscription = db
    .channel("arena-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "arena_messages" },
      (payload) => {
        const msg = payload.new;
        if (new Date(msg.expires_at).getTime() <= Date.now()) return;
        if (arena.messages.find((m) => m.id === msg.id)) return;
        arena.messages.push(msg);
        renderArenaFeed();
        updateArenaBadge();
      }
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "arena_messages" },
      (payload) => {
        arena.messages = arena.messages.filter((m) => m.id !== payload.old.id);
        renderArenaFeed();
        updateArenaBadge();
      }
    )
    .subscribe();
}

export function unsubscribeFromArena() {
  if (arena.subscription && db) {
    db.removeChannel(arena.subscription).catch(() => {});
    arena.subscription = null;
  }
  stopArenaCountdown();
}

// ── Send message ────────────────────────────────────────────────
export async function sendArenaMessage() {
  const input = $("arenaInput");
  const content = (input?.value || "").trim();
  const t = i18n[state.currentLang];

  if (!content) return;

  if (content.length > MAX_CHARS) {
    showToast(t.arenaTooLong);
    return;
  }
  if (isOffensive(content)) {
    showToast(t.arenaOffensive);
    return;
  }

  const now = Date.now();
  if (now - arena.lastSentAt < RATE_LIMIT_MS) {
    const waitMs = RATE_LIMIT_MS - (now - arena.lastSentAt);
    const waitMin = Math.ceil(waitMs / 60000);
    showToast(t.arenaRateLimit.replace("{m}", waitMin));
    return;
  }

  if (!isLiveMode()) {
    arena.messages.push({
      id: `local-${Date.now()}`,
      anonymous_id: "demo-self",
      content,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + EXPIRE_MS).toISOString(),
    });
    arena.lastSentAt = Date.now();
    if (input) input.value = "";
    updateCharCount();
    renderArenaFeed();
    updateArenaBadge();
    return;
  }

  const sendBtn = $("arenaSendBtn");
  if (sendBtn) { sendBtn.disabled = true; }

  try {
    const { error } = await db.from("arena_messages").insert({
      anonymous_id: state.currentProfile.id,
      content,
      expires_at: new Date(Date.now() + EXPIRE_MS).toISOString(),
    });

    if (error) throw error;

    arena.lastSentAt = Date.now();
    if (input) input.value = "";
    updateCharCount();
  } catch {
    showToast(t.arenaSendError);
  } finally {
    if (sendBtn) { sendBtn.disabled = false; }
  }
}

// ── Delete own message ──────────────────────────────────────────
async function deleteArenaMessage(msgId) {
  if (!isLiveMode()) {
    arena.messages = arena.messages.filter((m) => m.id !== msgId);
    renderArenaFeed();
    updateArenaBadge();
    return;
  }
  try {
    const { error } = await db
      .from("arena_messages")
      .delete()
      .eq("id", msgId)
      .eq("anonymous_id", state.currentProfile.id);
    if (error) throw error;
    arena.messages = arena.messages.filter((m) => m.id !== msgId);
    renderArenaFeed();
    updateArenaBadge();
  } catch {
    showToast(i18n[state.currentLang].arenaSendError);
  }
}

// ── Char counter ────────────────────────────────────────────────
function updateCharCount() {
  const input = $("arenaInput");
  const counter = $("arenaCharCount");
  if (!counter) return;
  const remaining = MAX_CHARS - (input?.value?.length || 0);
  counter.textContent = remaining;
  counter.style.color = remaining < 30 ? "rgba(244,63,94,0.9)" : "";
}

export function handleArenaInput() {
  updateCharCount();
}

// ── Update i18n strings inside arena view ───────────────────────
export function updateArenaLang() {
  const t = i18n[state.currentLang];
  const ph = $("arenaInput");
  if (ph) ph.placeholder = t.arenaPlaceholder;
  const btn = $("arenaSendBtn");
  if (btn) btn.textContent = t.arenaSend;
  const label = $("arenaNavLabel");
  if (label) label.textContent = t.arenaNav;
  const homeLabel = $("homeNavLabel");
  if (homeLabel) homeLabel.textContent = t.homeNav;
  renderArenaFeed(); // re-render with new lang
}
