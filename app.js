/*
  27 Supabase integration

  ضع مفاتيح Supabase هنا:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY

  الدوال الرئيسية:
  - getOrCreateProfile(): ينشئ/يجلب ملف المستخدم وكوده public_code.
  - startConversationWithCode(code): يبحث عن مستخدم بالكود ويفتح/ينشئ محادثة.
  - loadConversation(conversationId): يجلب الرسائل ويفعل Realtime.
  - sendMessage(conversationId, content): يرسل رسالة تنتهي بعد 5 ساعات.

  مهم: فعّل Anonymous Sign-ins في Supabase Auth حتى يبقى التطبيق بدون تسجيل ظاهر للمستخدم.
*/

const SUPABASE_URL = "https://rndwafkuqavqabpywosa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHdhZmt1cWF2cWFicHl3b3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzkxOTEsImV4cCI6MjA5NDQ1NTE5MX0.tIrLqYHsK-qpvzlZBdPRRFNZZKhX445tE7xxsjZeceM";
const VAPID_PUBLIC_KEY = "";
const MESSAGE_TTL_SECONDS = 5 * 60 * 60;
const BURN_TTL_SECONDS = 10;
const FIVE_HOURS = 5 * 60 * 60 * 1000;
const PROFILE_STORAGE_KEY = "twentyseven_profile";
const ONBOARDING_STORAGE_KEY = "veil_seen";
const SWIPE_DELETE_THRESHOLD = 80;

const supabaseReady =
  typeof window.supabase !== "undefined" &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_") &&
  !SUPABASE_ANON_KEY.includes("PASTE_");

const db = supabaseReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const i18n = {
  ar: {
    headerStatus: "مشفّر · بدون تسجيل",
    headerStatusLive: "متصل · Supabase Realtime",
    langToggle: "العربية / English",
    heroTagline: "خاص. سريع. يختفي.",
    heroLine1: "محادثات سريعة، خصوصية عالية، وحذف تلقائي بعد ٥ ساعات.",
    heroLine2: "تواصل بدون تسجيل، بدون بريد إلكتروني، وبدون رقم جوال.",
    inputPlaceholder: "أدخل رقم المستخدم المراد التواصل معه",
    startBtn: "بدء المحادثة",
    profileCodeLabel: "رقمك",
    copyMyCode: "انسخ رقمي",
    copied: "تم النسخ",
    chatsHeader: "المحادثات النشطة",
    emptyText: "لا توجد محادثات حالية. ابدأ محادثة جديدة بإدخال رقم مستخدم.",
    footerText: "جميع المحادثات تُحذف تلقائيًا بعد ٥ ساعات من آخر رسالة.",
    footerTextWithCode: "رقمك: {code} · جميع المحادثات تُحذف تلقائيًا بعد ٥ ساعات.",
    back: "رجوع",
    settings: "الإعدادات",
    settingsSubtitle: "تحكم بتجربة 27 بدون حساب.",
    displayNameLabel: "اسم العرض",
    displayNameHint: "يُستخدم لتوليد الأفاتار فقط.",
    privacyLabel: "حذف تلقائي",
    privacyHint: "كل محادثة تُزال بعد 5 ساعات من آخر رسالة.",
    saveSettings: "حفظ",
    settingsSaved: "تم حفظ الإعدادات.",
    chatExpiry: "تنتهي بعد ٥ ساعات من آخر رسالة",
    messagePlaceholder: "اكتب رسالة مؤقتة...",
    send: "إرسال",
    attach: "إرسال صورة أو فيديو",
    systemNote: "هذه المحادثة مؤقتة ولا تحتاج تسجيل دخول.",
    loadingChats: "جارٍ تحميل المحادثات...",
    loadingConversation: "جارٍ تحميل المحادثة...",
    searchingCode: "جارٍ البحث...",
    sendingMessage: "جارٍ الإرسال...",
    errorChats: "تعذر تحميل المحادثات. حاول مرة أخرى.",
    invalidCode: "أدخل كودًا رقميًا صحيحًا.",
    codeNotFound: "الرقم غير موجود.",
    cannotChatSelf: "لا يمكنك بدء محادثة مع رقمك.",
    starting: "تم فتح المحادثة.",
    expired: "انتهت مدة هذه المحادثة، وتم حذف جميع الرسائل المرتبطة بها نهائيًا.",
    emptyChat: "لا توجد رسائل بعد. اكتب أول رسالة مؤقتة.",
    expiresIn: "ينتهي بعد {time}",
    lessThanMinute: "أقل من دقيقة",
    hoursUnit: "{count} ساعة",
    minutesUnit: "{count} دقيقة",
    realtimeConnecting: "جارٍ تفعيل الاتصال المباشر...",
    realtimeConnected: "الاتصال المباشر فعّال",
    mediaStorage: "رفع الوسائط يحتاج Storage لاحقًا. أُرسلت الرسالة النصية فقط.",
    hideMode: "وضع التخفي",
    shareQr: "شارك كـ QR",
    qrTitle: "شارك رقمك",
    copyNumber: "نسخ الرقم",
    close: "إغلاق",
    burnToggle: "رسالة تحترق",
    burnAfterRead: "تحترق بعد القراءة",
    typing: "يكتب الآن...",
    fakeNotesTitle: "Notes",
    now: "الآن",
    userPrefix: "مستخدم",
    demoMode: "وضع تجريبي: أضف مفاتيح Supabase ليصبح حقيقيًا."
  },
  en: {
    headerStatus: "Encrypted · No login",
    headerStatusLive: "Connected · Supabase Realtime",
    langToggle: "English / العربية",
    heroTagline: "خاص. سريع. يختفي.",
    heroLine1: "Fast chats, maximum privacy, auto-deleted after 5 hours.",
    heroLine2: "No sign-up, no email, no phone number.",
    inputPlaceholder: "Enter the user's code to start a chat",
    startBtn: "Start chat",
    profileCodeLabel: "Your code",
    copyMyCode: "Copy my code",
    copied: "Copied",
    chatsHeader: "Active chats",
    emptyText: "No active chats. Start a new one by entering a user code.",
    footerText: "All conversations are automatically deleted 5 hours after the last message.",
    footerTextWithCode: "Your code: {code} · All conversations auto-delete after 5 hours.",
    back: "Back",
    settings: "Settings",
    settingsSubtitle: "Control 27 without creating an account.",
    displayNameLabel: "Display name",
    displayNameHint: "Used only to generate your avatar.",
    privacyLabel: "Auto-delete",
    privacyHint: "Each chat is removed 5 hours after the last message.",
    saveSettings: "Save",
    settingsSaved: "Settings saved.",
    chatExpiry: "Expires 5 hours after the last message",
    messagePlaceholder: "Write an ephemeral message...",
    send: "Send",
    attach: "Send photo or video",
    systemNote: "This chat is temporary and requires no login.",
    loadingChats: "Loading active chats...",
    loadingConversation: "Loading conversation...",
    searchingCode: "Searching...",
    sendingMessage: "Sending...",
    errorChats: "Could not load chats. Try again.",
    invalidCode: "Enter a valid numeric code.",
    codeNotFound: "Code not found.",
    cannotChatSelf: "You cannot start a chat with your own code.",
    starting: "Chat opened.",
    expired: "This chat expired, and all linked messages were permanently deleted.",
    emptyChat: "No messages yet. Write the first ephemeral message.",
    expiresIn: "Expires in {time}",
    lessThanMinute: "less than a minute",
    hoursUnit: "{count}h",
    minutesUnit: "{count}m",
    realtimeConnecting: "Connecting realtime...",
    realtimeConnected: "Realtime connected",
    mediaStorage: "Media upload needs Storage later. Text sent only.",
    hideMode: "Hide Mode",
    shareQr: "Share as QR",
    qrTitle: "Share your number",
    copyNumber: "Copy Number",
    close: "Close",
    burnToggle: "Burn message",
    burnAfterRead: "Burns after reading",
    typing: "Typing...",
    fakeNotesTitle: "Notes",
    now: "Now",
    userPrefix: "User",
    demoMode: "Demo mode: add Supabase keys to make it real."
  }
};

const demoChats = [
  createDemoChat("sara", "سارة", "Sara", true, [
    { type: "incoming", text: "جاهز؟ الرسالة تختفي بعد خمس ساعات.", time: "قبل 2 د" },
    { type: "outgoing", text: "تمام، هذا بالضبط اللي أحتاجه.", time: "الآن" }
  ], [
    { type: "incoming", text: "Ready? This message disappears after five hours.", time: "2m ago" },
    { type: "outgoing", text: "Perfect, that is exactly what I need.", time: "Now" }
  ]),
  createDemoChat("khaled", "خالد", "Khaled", true, [
    { type: "incoming", text: "أرسل الرقم فقط وندخل مباشرة.", time: "قبل 8 د" }
  ], [
    { type: "incoming", text: "Send the code only and we jump straight in.", time: "8m ago" }
  ]),
  createDemoChat("noura", "نورة", "Noura", false, [
    { type: "incoming", text: "بدون تسجيل؟ ممتاز.", time: "قبل 45 د" }
  ], [
    { type: "incoming", text: "No login? Nice.", time: "45m ago" }
  ])
];

let currentLang = "ar";
let displayName = "زائر 27";
let currentProfile = null;
let chats = [];
let activeConversationId = "";
let activeSubscription = null;
let countdownTimer = null;
let messageTicker = null;
let burnMode = false;
let panicMode = false;
let typing = false;
let typingLastSentAt = 0;
let typingStopTimer = null;
let qrModalOpen = false;

const $ = (id) => document.getElementById(id);

function vibrate(pattern) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function getAppBasePath() {
  return window.location.pathname.endsWith("/")
    ? window.location.pathname
    : window.location.pathname.replace(/\/[^/]*$/, "/");
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

function createMessageId(prefix = "msg") {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDemoChat(id, arName, enName, online, arMessages, enMessages) {
  const lastMessageAt = Date.now() - Math.floor(Math.random() * 25 + 1) * 60 * 1000;
  const expiresAt = lastMessageAt + FIVE_HOURS;
  return {
    id,
    online,
    names: { ar: arName, en: enName },
    otherProfile: { id, display_name: arName, public_code: id, avatar_seed: arName },
    lastMessageAt,
    expiresAt,
    messages: {
      ar: arMessages.map((message, index) => normalizeMessage(message, `${id}-ar`, index, expiresAt)),
      en: enMessages.map((message, index) => normalizeMessage(message, `${id}-en`, index, expiresAt))
    }
  };
}

function normalizeMessage(message, chatId = "demo", index = 0, fallbackExpiresAt = Date.now() + FIVE_HOURS) {
  return {
    id: message.id || `${chatId}-${index}-${Math.abs(hashHue(message.text || ""))}`,
    burnAfterRead: Boolean(message.burnAfterRead),
    expiresAt: message.expiresAt || new Date(fallbackExpiresAt).toISOString(),
    createdAt: message.createdAt || new Date(fallbackExpiresAt - FIVE_HOURS).toISOString(),
    ...message
  };
}

function isLiveMode() {
  return Boolean(db && currentProfile);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function getInitials(name = "") {
  const clean = name.replace(/[^\p{L}\p{N}\s#]/gu, "").trim();
  if (!clean) return "27";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].replace("#", "").slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function hashHue(value = "") {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 360;
  }
  return hash;
}

function randomPublicCode() {
  return String(Math.floor(Math.random() * 900000) + 100000);
}

function handleAsyncError(error, fallbackMessage) {
  console.warn(error);
  flashError(fallbackMessage || i18n[currentLang].errorChats);
}

function setLoading(message, visible = true) {
  const loading = $("loadingState");
  loading.textContent = message || i18n[currentLang].loadingChats;
  loading.hidden = !visible;
}

function setButtonBusy(button, busy, label) {
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

function updateProfileCodeUI() {
  const card = $("profileCodeCard");
  if (!card) return;

  const hasCode = Boolean(currentProfile?.public_code);
  card.hidden = !hasCode;
  $("profileCodeLabel").textContent = i18n[currentLang].profileCodeLabel;
  $("copyCodeBtn").textContent = i18n[currentLang].copyMyCode;
  if (hasCode) $("profileCodeValue").textContent = currentProfile.public_code;
}

async function copyProfileCode() {
  if (!currentProfile?.public_code) return;
  const code = currentProfile.public_code;

  try {
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(code);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      const temp = document.createElement("textarea");
      temp.value = code;
      temp.setAttribute("readonly", "");
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      copied = document.execCommand("copy");
      temp.remove();
    }

    showToast(copied ? i18n[currentLang].copied : code);
  } catch (error) {
    handleAsyncError(error, i18n[currentLang].errorChats);
  }
}

async function getOrCreateProfile() {
  if (!db) return null;

  async function getCurrentAuthUser() {
    const { data: userData, error: userError } = await db.auth.getUser();
    if (userError) throw userError;
    if (!userData?.user) throw new Error("Anonymous auth user was not established.");
    return userData.user;
  }

  async function insertProfileForUser(authUser) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const publicCode = randomPublicCode();
      const profile = {
        id: authUser.id,
        public_code: publicCode,
        display_name: displayName,
        avatar_seed: displayName || publicCode
      };

      const { data, error } = await db.from("profiles").insert(profile).select("*").single();
      if (!error) return data;
      if (error.code !== "23505") throw error;
    }

    throw new Error("Could not generate a unique public_code.");
  }

  let { data: sessionData } = await db.auth.getSession();
  let user = sessionData?.session?.user;

  if (!user) {
    const { data, error } = await db.auth.signInAnonymously();
    if (error) throw error;
    if (data.session?.access_token && data.session?.refresh_token) {
      await db.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });
    }
  }

  user = await getCurrentAuthUser();

  const stored = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "null");
  if (stored?.id && stored.id !== user.id) {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } else if (stored?.id && stored?.public_code) {
    const { data } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) return data;
  }

  const { data: existing } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(existing));
    return existing;
  }

  try {
    const created = await insertProfileForUser(user);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(created));
    return created;
  } catch (error) {
    const message = `${error?.message || ""} ${error?.details || ""}`;
    const isRlsError = error?.code === "42501" || message.toLowerCase().includes("row-level security");

    if (!isRlsError) throw error;

    console.warn("profiles insert failed with row-level security", error);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    user = await getCurrentAuthUser();

    const created = await insertProfileForUser(user);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(created));
    return created;
  }
}

async function cleanupExpiredMessages(conversationId = "") {
  if (!isLiveMode()) return;

  const nowIso = new Date().toISOString();
  let query = db.from("messages").delete().lt("expires_at", nowIso);
  if (conversationId) query = query.eq("conversation_id", conversationId);

  const { error } = await query;
  if (error) throw error;
}

async function deleteConversationIfExpiredAndEmpty(chat) {
  if (!isLiveMode() || !chat?.id) return false;
  if (!chat.lastMessageAt || Date.now() - chat.lastMessageAt < FIVE_HOURS) return false;

  const { count, error } = await db
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", chat.id)
    .gt("expires_at", new Date().toISOString());

  if (error) throw error;
  if (count && count > 0) return false;

  const { error: deleteError } = await db
    .from("conversations")
    .delete()
    .eq("id", chat.id);

  if (deleteError) throw deleteError;
  chats = chats.filter((item) => item.id !== chat.id);
  return true;
}

async function loadConversations() {
  setLoading(i18n[currentLang].loadingChats, true);
  try {
    if (!isLiveMode()) {
      chats = demoChats.filter((chat) => chat.expiresAt > Date.now());
      renderChats();
      return chats;
    }

    await cleanupExpiredMessages();

    const { data, error } = await db
      .from("conversations")
      .select(`
        id,
        user_a_id,
        user_b_id,
        created_at,
        last_message_at,
        user_a:profiles!conversations_user_a_id_fkey(id, public_code, display_name, avatar_seed),
        user_b:profiles!conversations_user_b_id_fkey(id, public_code, display_name, avatar_seed)
      `)
      .or(`user_a_id.eq.${currentProfile.id},user_b_id.eq.${currentProfile.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) throw error;

    const realChats = (data || []).map((row) => {
      const otherProfile = row.user_a_id === currentProfile.id ? row.user_b : row.user_a;
      return {
        id: row.id,
        online: true,
        otherProfile,
        lastMessageAt: row.last_message_at ? new Date(row.last_message_at).getTime() : 0,
        messages: { neutral: [] }
      };
    });

    chats = realChats.length
      ? realChats
      : demoChats.filter((chat) => chat.expiresAt > Date.now()).map((chat) => ({ ...chat, placeholder: true }));

    renderChats();
    return chats;
  } finally {
    setLoading("", false);
  }
}

async function startConversationWithCode(code) {
  if (!/^\d{6}$/.test(code)) {
    flashError(i18n[currentLang].invalidCode);
    return null;
  }

  if (!isLiveMode()) {
    const chat = createDemoConversationFromCode(code);
    renderChats();
    openChat(chat.id);
    return chat.id;
  }

  const { data: target, error: targetError } = await db
    .from("profiles")
    .select("*")
    .eq("public_code", code)
    .maybeSingle();

  if (targetError) throw targetError;
  if (!target) {
    flashError(i18n[currentLang].codeNotFound);
    return null;
  }
  if (target.id === currentProfile.id) {
    flashError(i18n[currentLang].cannotChatSelf);
    return null;
  }

  const { data: existing, error: findError } = await db
    .from("conversations")
    .select("id")
    .or(`and(user_a_id.eq.${currentProfile.id},user_b_id.eq.${target.id}),and(user_a_id.eq.${target.id},user_b_id.eq.${currentProfile.id})`)
    .maybeSingle();

  if (findError) throw findError;
  if (existing?.id) {
    await loadConversations();
    openChat(existing.id);
    return existing.id;
  }

  const { data: created, error: createError } = await db
    .from("conversations")
    .insert({ user_a_id: currentProfile.id, user_b_id: target.id, last_message_at: new Date().toISOString() })
    .select("id")
    .single();

  if (createError) throw createError;
  await loadConversations();
  openChat(created.id);
  return created.id;
}

async function loadConversation(conversationId) {
  activeConversationId = conversationId;
  const chat = getChat(conversationId);
  setLoading(i18n[currentLang].loadingConversation, true);

  try {
    if (!isLiveMode() || chat?.placeholder) {
      renderMessages(chat);
      startChatCountdown(chat);
      return;
    }

    if (activeSubscription) {
      await db.removeChannel(activeSubscription);
      activeSubscription = null;
    }

    await cleanupExpiredMessages(conversationId);

    const { data, error } = await db
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    chat.messages = { neutral: (data || []).map(mapDbMessage) };
    const removed = await deleteConversationIfExpiredAndEmpty(chat);
    if (removed) {
      renderChats();
      showToast(i18n[currentLang].expired);
      showHome();
      window.location.hash = "";
      return;
    }

    renderMessages(chat);
    startChatCountdown(chat);

    activeSubscription = db
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const activeChat = getChat(conversationId);
          if (!activeChat) return;
          const nextMessage = mapDbMessage(payload.new);
          const messages = activeChat.messages.neutral || [];
          if (messages.some((message) => message.id === nextMessage.id)) return;
          activeChat.messages.neutral = [...messages, nextMessage];
          activeChat.lastMessageAt = new Date(payload.new.created_at).getTime();
          activeChat.expiresAt = new Date(payload.new.expires_at).getTime();
          if (nextMessage.type === "incoming") vibrate(15);
          renderMessages(activeChat);
          renderChats();
          updateChatCountdown(activeChat);
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.userId === currentProfile?.id) return;
        typing = true;
        renderMessages(getChat(conversationId));
      })
      .on("broadcast", { event: "stopped_typing" }, (payload) => {
        if (payload.payload?.userId === currentProfile?.id) return;
        typing = false;
        renderMessages(getChat(conversationId));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") showToast(i18n[currentLang].realtimeConnected);
      });
  } finally {
    setLoading("", false);
  }
}

async function sendMessage(conversationId, content, options = {}) {
  if (!content.trim()) return;
  const ttlMs = options.burnAfterRead ? BURN_TTL_SECONDS * 1000 : FIVE_HOURS;

  if (!isLiveMode()) {
    appendDemoMessage(conversationId, {
      type: "outgoing",
      text: content,
      time: i18n[currentLang].now,
      burnAfterRead: Boolean(options.burnAfterRead),
      expiresAt: new Date(Date.now() + ttlMs).toISOString()
    });
    vibrate(30);
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();
  const { error } = await db.from("messages").insert({
    conversation_id: conversationId,
    sender_id: currentProfile.id,
    content,
    expires_at: expiresAt,
    burn_after_read: Boolean(options.burnAfterRead)
  });

  if (error) throw error;
  vibrate(30);

  const { error: updateError } = await db
    .from("conversations")
    .update({ last_message_at: now.toISOString() })
    .eq("id", conversationId);
  if (updateError) throw updateError;
}

function mapDbMessage(row) {
  return {
    id: row.id,
    type: row.sender_id === currentProfile.id ? "outgoing" : "incoming",
    text: row.content,
    time: formatTime(row.created_at),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    burnAfterRead: Boolean(row.burn_after_read)
  };
}

function formatTime(value) {
  if (!value) return i18n[currentLang].now;
  return new Intl.DateTimeFormat(currentLang === "ar" ? "ar-SA" : "en", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatRemaining(ms) {
  const t = i18n[currentLang];
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

function getChatExpiryTime(chat) {
  if (!chat) return 0;
  const messages = getMessages(chat);
  const latestMessageExpiry = messages.reduce((latest, message) => {
    if (!message.expiresAt) return latest;
    return Math.max(latest, new Date(message.expiresAt).getTime());
  }, 0);

  if (latestMessageExpiry) return latestMessageExpiry;
  if (chat.expiresAt) return chat.expiresAt;
  if (chat.lastMessageAt) return chat.lastMessageAt + FIVE_HOURS;
  return Date.now() + FIVE_HOURS;
}

function updateChatCountdown(chat) {
  if ($("chatView").hidden || !chat) return;
  const remaining = getChatExpiryTime(chat) - Date.now();
  $("chatViewStatus").textContent = remaining <= 0
    ? i18n[currentLang].expired
    : i18n[currentLang].expiresIn.replace("{time}", formatRemaining(remaining));
}

function startChatCountdown(chat) {
  window.clearInterval(countdownTimer);
  updateChatCountdown(chat);
  countdownTimer = window.setInterval(() => updateChatCountdown(chat), 30000);
}

function stopChatCountdown() {
  window.clearInterval(countdownTimer);
  countdownTimer = null;
}

function createDemoConversationFromCode(code) {
  const id = `code-${code}`;
  const existing = getChat(id);
  if (existing) return existing;

  const name = currentLang === "ar" ? `${i18n.ar.userPrefix} ${code}` : `${i18n.en.userPrefix} ${code}`;
  const chat = {
    id,
    online: true,
    name,
    otherProfile: { id, display_name: name, public_code: code, avatar_seed: name },
    lastMessageAt: Date.now(),
    expiresAt: Date.now() + FIVE_HOURS,
    messages: { neutral: [] }
  };

  chats.unshift(chat);
  return chat;
}

function appendDemoMessage(conversationId, message) {
  const chat = getChat(conversationId);
  if (!chat) return;
  if (!chat.messages.neutral && !chat.messages[currentLang]) {
    chat.messages.neutral = [];
  }
  const targetMessages = chat.messages.neutral || chat.messages[currentLang];
  const expiresAt = message.expiresAt || new Date(Date.now() + FIVE_HOURS).toISOString();
  targetMessages.push({
    id: message.id || createMessageId("demo"),
    createdAt: new Date().toISOString(),
    ...message,
    expiresAt
  });
  chat.lastMessageAt = Date.now();
  chat.expiresAt = new Date(expiresAt).getTime();
  renderMessages(chat);
  renderChats();
  updateChatCountdown(chat);
}

function getChat(chatId) {
  return chats.find((chat) => chat.id === chatId);
}

function getChatName(chat) {
  if (!chat) return "";
  return chat.names?.[currentLang] || chat.otherProfile?.display_name || chat.name || chat.id;
}

function getMessages(chat) {
  if (!chat) return [];
  if (chat.messages?.[currentLang]) return chat.messages[currentLang];
  return chat.messages?.neutral || [];
}

function renderChats() {
  const list = $("chatsList");
  const empty = $("emptyState");

  if (!chats.length) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  list.innerHTML = chats.map((chat) => {
    const name = getChatName(chat);
    const hue = hashHue(chat.otherProfile?.avatar_seed || name);
    const statusClass = chat.online ? "online" : "offline";

    return `
      <div class="chat-item" role="button" tabindex="0" data-chat-id="${escapeHtml(chat.id)}" aria-label="${escapeHtml(name)}">
        <div class="chat-avatar" style="--avatar-hue: ${hue}">${escapeHtml(getInitials(name))}</div>
        <div class="chat-info">
          <div class="chat-name">${escapeHtml(name)}</div>
        </div>
        <div class="chat-status ${statusClass}" aria-hidden="true"></div>
      </div>
    `;
  }).join("");
}

function renderMessages(chat) {
  const t = i18n[currentLang];
  const messages = getMessages(chat);
  const body = messages.length
    ? messages.map((message) => {
      const remaining = getMessageRemaining(message);
      const percent = getMessageTimerPercent(message);
      const criticalClass = remaining < 600000 ? " critical" : "";
      const burnLabel = message.burnAfterRead
        ? `<span class="burn-label">${escapeHtml(t.burnAfterRead)}</span>`
        : "";
      return `
      <div class="message-shell ${message.type}" data-message-id="${escapeHtml(message.id || "")}">
        <div class="swipe-delete-cue" aria-hidden="true">🔥</div>
        <div class="message ${message.type}" style="--swipe-x: 0px; --delete-opacity: 0;">
          ${renderMessageContent(message)}
          ${burnLabel}
          <span class="message-time">${escapeHtml(message.time || t.now)}</span>
          <span class="message-timer${criticalClass}" style="--timer-width: ${percent}%"></span>
        </div>
      </div>
    `;
    }).join("")
    : `<div class="system-note">${t.emptyChat}</div>`;

  const list = $("messagesList");
  list.innerHTML = `<div class="system-note">${t.systemNote}</div>${body}${typing ? renderTypingIndicator() : ""}`;
  attachSwipeToMessages();
  updateMessageTimers();
  requestAnimationFrame(() => {
    list.scrollTop = list.scrollHeight;
  });
}

function renderMessageContent(message) {
  const text = escapeHtml(message.text || "");
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

function renderTypingIndicator() {
  return `
    <div class="typing-indicator" role="status" aria-live="polite">
      <span>${escapeHtml(i18n[currentLang].typing)}</span>
      <i></i><i></i><i></i>
    </div>
  `;
}

function broadcastTyping(eventName) {
  if (!activeSubscription || !currentProfile?.id) return;
  activeSubscription.send({
    type: "broadcast",
    event: eventName,
    payload: { userId: currentProfile.id }
  }).catch((error) => console.warn(error));
}

function handleComposerTyping() {
  const now = Date.now();
  if (now - typingLastSentAt > 2000) {
    typingLastSentAt = now;
    broadcastTyping("typing");
  }

  window.clearTimeout(typingStopTimer);
  typingStopTimer = window.setTimeout(() => {
    broadcastTyping("stopped_typing");
  }, 3000);
}

function getMessageRemaining(message) {
  if (!message?.expiresAt) return FIVE_HOURS;
  return Math.max(0, new Date(message.expiresAt).getTime() - Date.now());
}

function getMessageTimerPercent(message) {
  const ttl = message?.burnAfterRead ? BURN_TTL_SECONDS : MESSAGE_TTL_SECONDS;
  return Math.max(0, Math.min(100, (getMessageRemaining(message) / (ttl * 1000)) * 100));
}

function updateMessageTimers() {
  document.querySelectorAll(".message-shell[data-message-id]").forEach((shell) => {
    const message = findMessageById(shell.dataset.messageId);
    if (!message) return;
    const bar = shell.querySelector(".message-timer");
    if (!bar) return;
    const remaining = getMessageRemaining(message);
    bar.style.setProperty("--timer-width", `${getMessageTimerPercent(message)}%`);
    bar.classList.toggle("critical", remaining < 600000);
    if (remaining <= 0 && !message.expiring) expireMessage(message.id, { natural: true });
  });
}

function startMessageTicker() {
  window.clearInterval(messageTicker);
  messageTicker = window.setInterval(updateMessageTimers, 1000);
}

function findMessageById(messageId) {
  const chat = getChat(activeConversationId || $("chatView")?.dataset.activeChat);
  return getMessages(chat).find((message) => String(message.id) === String(messageId));
}

function removeMessageLocally(messageId) {
  const chat = getChat(activeConversationId || $("chatView")?.dataset.activeChat);
  if (!chat) return;
  Object.keys(chat.messages || {}).forEach((key) => {
    chat.messages[key] = (chat.messages[key] || []).filter((message) => String(message.id) !== String(messageId));
  });
  const remainingMessages = getMessages(chat);
  const latestExpiry = remainingMessages.reduce((latest, message) => {
    if (!message.expiresAt) return latest;
    return Math.max(latest, new Date(message.expiresAt).getTime());
  }, 0);
  chat.expiresAt = latestExpiry || Date.now();
}

async function expireMessage(messageId, options = {}) {
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
    const chat = getChat(activeConversationId || $("chatView")?.dataset.activeChat);
    if (chat) {
      renderMessages(chat);
      renderChats();
      updateChatCountdown(chat);
    }
  };

  if (!shell || prefersReducedMotion()) {
    await finish();
    return;
  }

  const text = shell.querySelector(".message-text");
  if (text && (options.natural || options.swipe)) {
    const words = (message.text || "").split(" ");
    text.innerHTML = words.map((word, index) => (
      `<span class="fade-word" style="animation-delay: ${index * 80}ms">${escapeHtml(word)}</span>`
    )).join(" ");
    window.setTimeout(finish, words.length * 80 + 220);
    return;
  }

  shell.classList.add("message-expiring");
  window.setTimeout(finish, 350);
}

function attachSwipeToMessages() {
  if (!("ontouchstart" in window)) return;
  document.querySelectorAll(".message-shell").forEach((shell) => {
    if (shell.dataset.swipeReady) return;
    shell.dataset.swipeReady = "true";
    let startX = 0;
    let deltaX = 0;
    const bubble = shell.querySelector(".message");

    shell.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
      deltaX = 0;
      bubble.classList.remove("swipe-returning");
    }, { passive: true });

    shell.addEventListener("touchmove", (event) => {
      deltaX = Math.min(0, event.touches[0].clientX - startX);
      const distance = Math.min(Math.abs(deltaX), SWIPE_DELETE_THRESHOLD);
      bubble.style.setProperty("--swipe-x", `${deltaX}px`);
      bubble.style.setProperty("--delete-opacity", String(distance / SWIPE_DELETE_THRESHOLD));
    }, { passive: true });

    shell.addEventListener("touchend", () => {
      if (Math.abs(deltaX) > SWIPE_DELETE_THRESHOLD) {
        shell.classList.add("message-expiring");
        expireMessage(shell.dataset.messageId, { swipe: true });
        return;
      }
      bubble.classList.add("swipe-returning");
      bubble.style.setProperty("--swipe-x", "0px");
      bubble.style.setProperty("--delete-opacity", "0");
    });
  });
}

async function openChat(chatId) {
  const chat = getChat(chatId);
  const t = i18n[currentLang];

  if (!chat) {
    showToast(t.expired);
    showHome();
    renderChats();
    window.location.hash = "";
    return;
  }

  $("heroSection").hidden = true;
  document.querySelector(".section-divider").hidden = true;
  $("chatsSection").hidden = true;
  $("settingsView").hidden = true;
  $("chatView").hidden = false;
  $("chatView").dataset.activeChat = chat.id;
  $("chatViewName").textContent = getChatName(chat);
  $("chatViewStatus").textContent = t.loadingConversation;
  window.location.hash = `#chat/${encodeURIComponent(chat.id)}`;

  try {
    await loadConversation(chat.id);
  } catch (error) {
    handleAsyncError(error, i18n[currentLang].errorChats);
  }
}

function showHome() {
  stopChatCountdown();
  $("heroSection").hidden = false;
  document.querySelector(".section-divider").hidden = false;
  $("chatsSection").hidden = false;
  $("chatView").hidden = true;
  $("settingsView").hidden = true;
}

function closeChat() {
  if (activeSubscription && db) {
    db.removeChannel(activeSubscription).catch(() => {});
    activeSubscription = null;
  }
  activeConversationId = "";
  showHome();
  window.location.hash = "";
}

function openSettings() {
  $("heroSection").hidden = true;
  document.querySelector(".section-divider").hidden = true;
  $("chatsSection").hidden = true;
  $("chatView").hidden = true;
  $("settingsView").hidden = false;
  window.location.hash = "#settings";
}

function closeSettings() {
  showHome();
  window.location.hash = "";
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function flashError(message) {
  $("errorState").textContent = message;
  $("errorState").hidden = false;
  window.clearTimeout(flashError.timer);
  flashError.timer = window.setTimeout(() => {
    $("errorState").hidden = true;
    $("errorState").textContent = i18n[currentLang].errorChats;
  }, 2400);
}

function setLanguage(lang) {
  currentLang = lang;
  const t = i18n[lang];
  const root = document.documentElement;

  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";

  $("headerStatus").textContent = isLiveMode() ? t.headerStatusLive : t.headerStatus;
  $("langToggle").textContent = t.langToggle;
  $("settingsToggle").textContent = t.settings;
  $("heroTagline").textContent = t.heroTagline;
  $("heroLine1").textContent = t.heroLine1;
  $("heroLine2").textContent = t.heroLine2;
  $("codeInput").placeholder = t.inputPlaceholder;
  $("startBtn").textContent = t.startBtn;
  $("chatsHeader").textContent = t.chatsHeader;
  $("emptyText").textContent = t.emptyText;
  $("footerText").textContent = currentProfile?.public_code
    ? t.footerTextWithCode.replace("{code}", currentProfile.public_code)
    : t.footerText;
  $("backToChats").textContent = t.back;
  $("backFromSettings").textContent = t.back;
  $("chatViewStatus").textContent = t.chatExpiry;
  $("messageInput").placeholder = t.messagePlaceholder;
  $("sendBtn").textContent = t.send;
  updateProfileCodeUI();
  $("attachBtn").title = t.attach;
  $("attachBtn").setAttribute("aria-label", t.attach);
  $("loadingState").textContent = t.loadingChats;
  $("errorState").textContent = t.errorChats;
  $("settingsTitle").textContent = t.settings;
  $("settingsSubtitle").textContent = t.settingsSubtitle;
  $("displayNameLabel").textContent = t.displayNameLabel;
  $("displayNameHint").textContent = t.displayNameHint;
  $("privacyLabel").textContent = t.privacyLabel;
  $("privacyHint").textContent = t.privacyHint;
  $("saveSettingsBtn").textContent = t.saveSettings;
  $("panicModeBtn").textContent = t.hideMode;
  $("shareQrBtn").textContent = t.shareQr;
  $("burnToggle").setAttribute("aria-label", t.burnToggle);
  $("burnToggle").title = t.burnToggle;
  $("qrModalTitle").textContent = t.qrTitle;
  $("copyQrCodeBtn").textContent = t.copyNumber;
  $("closeQrModal").setAttribute("aria-label", t.close);
  $("fakeNotesTitle").textContent = t.fakeNotesTitle;

  if (!$("displayNameInput").dataset.edited) {
    displayName = lang === "ar" ? "زائر 27" : "Guest 27";
    $("displayNameInput").value = currentProfile?.display_name || displayName;
  }

  renderChats();
  if (!$("chatView").hidden) {
    const active = $("chatView").dataset.activeChat;
    const chat = getChat(active);
    $("chatViewName").textContent = getChatName(chat);
    updateChatCountdown(chat);
    renderMessages(chat);
  }
}

async function handleStartChat() {
  const input = $("codeInput");
  const code = input.value.trim();

  if (!/^\d{6}$/.test(code)) {
    input.focus();
    input.style.borderColor = "rgba(244, 63, 94, 0.5)";
    flashError(i18n[currentLang].invalidCode);
    window.setTimeout(() => {
      input.style.borderColor = "";
    }, 1200);
    return;
  }

  try {
    setButtonBusy($("startBtn"), true, i18n[currentLang].searchingCode);
    const conversationId = await startConversationWithCode(code);
    if (conversationId) {
      input.value = "";
      showToast(i18n[currentLang].starting);
    }
  } catch (error) {
    handleAsyncError(error, i18n[currentLang].errorChats);
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
    setButtonBusy($("sendBtn"), true, i18n[currentLang].sendingMessage);
    if (file && !isLiveMode()) {
      appendDemoMessage(conversationId, {
        type: "outgoing",
        text,
        time: i18n[currentLang].now,
        mediaUrl: URL.createObjectURL(file),
        mediaType: file.type,
        fileName: file.name
      });
    }

    if (file && isLiveMode()) {
      showToast(i18n[currentLang].mediaStorage);
    }

    if (text) await sendMessage(conversationId, text, { burnAfterRead: burnMode });
    input.value = "";
    mediaInput.value = "";
    setBurnMode(false);
  } catch (error) {
    handleAsyncError(error, i18n[currentLang].errorChats);
  } finally {
    setButtonBusy($("sendBtn"), false);
  }
}

async function saveSettings() {
  displayName = $("displayNameInput").value.trim() || (currentLang === "ar" ? "زائر 27" : "Guest 27");
  $("displayNameInput").value = displayName;

  try {
    if (isLiveMode()) {
      const { data, error } = await db
        .from("profiles")
        .update({ display_name: displayName, avatar_seed: displayName })
        .eq("id", currentProfile.id)
        .select("*")
        .single();

      if (error) throw error;
      if (data) {
        currentProfile = data;
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
      }
    }

    showToast(i18n[currentLang].settingsSaved);
    renderChats();
  } catch (error) {
    handleAsyncError(error, i18n[currentLang].errorChats);
  }
}

function setBurnMode(enabled) {
  burnMode = enabled;
  $("burnToggle").classList.toggle("active", burnMode);
  $("messageInput").classList.toggle("burn-active", burnMode);
  $("burnToggle").setAttribute("aria-pressed", String(burnMode));
}

function setPanicMode(enabled) {
  panicMode = enabled;
  $("panicScreen").hidden = !panicMode;
  document.body.classList.toggle("panic-active", panicMode);
}

async function openQrModal() {
  const code = currentProfile?.public_code || $("profileCodeValue")?.textContent?.trim();
  if (!code || code === "------") return;
  qrModalOpen = true;
  $("qrCodeText").textContent = code;
  $("qrModal").hidden = false;

  try {
    const qrApi = window.QRCode;
    if (qrApi?.toDataURL) {
      $("qrImage").src = await qrApi.toDataURL(code, {
        margin: 2,
        width: 220,
        color: { dark: "#0A0A0F", light: "#FFFFFF" }
      });
    }
  } catch (error) {
    handleAsyncError(error, i18n[currentLang].errorChats);
  }
}

function closeQrModal() {
  qrModalOpen = false;
  $("qrModal").hidden = true;
}

async function registerPwa() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.warn(error);
    }
  }
  if (Notification.permission !== "granted") return;

  try {
    const registration = await navigator.serviceWorker.register(`${getAppBasePath()}sw.js`);
    if (VAPID_PUBLIC_KEY && currentProfile?.id && db && registration.pushManager) {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      await db.from("push_subscriptions").upsert({
        user_id: currentProfile.id,
        endpoint: subscription.endpoint,
        subscription: subscription.toJSON()
      }, { onConflict: "endpoint" });
    }
  } catch (error) {
    console.warn(error);
  }
}

function startOnboarding(onComplete) {
  const screen = $("onboardingScreen");
  const code = $("onboardingCode");

  if (localStorage.getItem(ONBOARDING_STORAGE_KEY) === "1" || prefersReducedMotion()) {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    onComplete();
    return;
  }

  const randomCode = randomPublicCode();
  screen.hidden = false;
  code.textContent = "";
  let step = 0;

  const typeNext = () => {
    if (step < randomCode.length) {
      code.textContent += randomCode[step];
      step += 1;
      window.setTimeout(typeNext, 120);
      return;
    }
    window.setTimeout(eraseNext, 800);
  };

  const eraseNext = () => {
    if (code.textContent.length) {
      code.textContent = code.textContent.slice(0, -1);
      window.setTimeout(eraseNext, 80);
      return;
    }
    screen.classList.add("done");
    window.setTimeout(() => {
      screen.hidden = true;
      screen.classList.remove("done");
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
      onComplete();
    }, 420);
  };

  typeNext();
}

async function boot() {
  setLoading(i18n[currentLang].loadingChats, true);
  chats = demoChats.filter((chat) => chat.expiresAt > Date.now());
  setLanguage(currentLang);

  if (!db) {
    setLoading("", false);
    renderChats();
    startMessageTicker();
    registerPwa();
    showToast(i18n[currentLang].demoMode);
    return;
  }

  try {
    currentProfile = await getOrCreateProfile();
    displayName = currentProfile.display_name || displayName;
    $("displayNameInput").value = displayName;
    updateProfileCodeUI();
    registerPwa();
    await loadConversations();
    setLanguage(currentLang);

    const route = window.location.hash.replace("#", "");
    if (route.startsWith("chat/")) await openChat(decodeURIComponent(route.slice(5)));
    if (route === "settings") openSettings();
    startMessageTicker();
  } catch (error) {
    handleAsyncError(error, i18n[currentLang].errorChats);
    renderChats();
  } finally {
    setLoading("", false);
  }
}

$("langToggle").addEventListener("click", () => {
  setLanguage(currentLang === "ar" ? "en" : "ar");
});

$("settingsToggle").addEventListener("click", openSettings);
$("backFromSettings").addEventListener("click", closeSettings);
$("saveSettingsBtn").addEventListener("click", saveSettings);
$("copyCodeBtn").addEventListener("click", copyProfileCode);
$("panicModeBtn").addEventListener("click", () => setPanicMode(true));
$("shareQrBtn").addEventListener("click", openQrModal);
$("closeQrModal").addEventListener("click", closeQrModal);
$("qrBackdrop").addEventListener("click", closeQrModal);
$("copyQrCodeBtn").addEventListener("click", copyProfileCode);
$("burnToggle").addEventListener("click", () => setBurnMode(!burnMode));
$("displayNameInput").addEventListener("input", () => {
  $("displayNameInput").dataset.edited = "true";
});

let panicPressTimer = null;
$("fakeNotesArea").addEventListener("pointerdown", () => {
  panicPressTimer = window.setTimeout(() => setPanicMode(false), 1500);
});
$("fakeNotesArea").addEventListener("pointerup", () => window.clearTimeout(panicPressTimer));
$("fakeNotesArea").addEventListener("pointerleave", () => window.clearTimeout(panicPressTimer));

$("startBtn").addEventListener("click", handleStartChat);
$("codeInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleStartChat();
});

document.addEventListener("click", (event) => {
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

$("backToChats").addEventListener("click", closeChat);
$("messageForm").addEventListener("submit", handleSendMessage);
$("messageInput").addEventListener("input", handleComposerTyping);
$("mediaInput").addEventListener("change", () => {
  if ($("mediaInput").files?.length) $("messageForm").requestSubmit();
});

window.setInterval(async () => {
  try {
    if (isLiveMode()) {
      await cleanupExpiredMessages();
      if (!$("chatView").hidden && activeConversationId) await loadConversation(activeConversationId);
      await loadConversations();
      return;
    }

    const before = chats.length;
    chats = chats.filter((chat) => !chat.expiresAt || chat.expiresAt > Date.now());
    renderChats();
    if (before !== chats.length) showToast(i18n[currentLang].expired);
  } catch (error) {
    console.warn(error);
  }
}, 60000);

startOnboarding(() => boot());
