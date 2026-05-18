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
const PRIVACY_MODES = {
  "10s_read": { seconds: 10, burnAfterRead: true },
  "5m": { seconds: 5 * 60, burnAfterRead: false },
  "1h": { seconds: 60 * 60, burnAfterRead: false },
  "5h": { seconds: MESSAGE_TTL_SECONDS, burnAfterRead: false },
  "close": { seconds: MESSAGE_TTL_SECONDS, burnAfterRead: false, closeDelete: true }
};
const PROFILE_STORAGE_KEY = "twentyseven_profile";
const ONBOARDING_STORAGE_KEY = "veil_seen";
const HIDE_CHATS_STORAGE_KEY = "twentyseven_hide_chats";
const SWIPE_DELETE_THRESHOLD = 80;
const SWIPE_REPLY_THRESHOLD = 56;
const DEMO_PROFILE_ID = "demo-self";

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
    heroLine1: "افتح قناة سرية خلال ثوانٍ: سؤال مجهول، غرفة مؤقتة، أو محادثة بكود.",
    heroLine2: "كل رابط له عمر قصير، وكل محادثة قابلة للاختفاء.",
    inputPlaceholder: "أدخل رقم المستخدم المراد التواصل معه",
    startBtn: "بدء المحادثة",
    askActionTitle: "Ask Me Anonymously",
    askActionHint: "رابط أسئلة مجهول ينتهي تلقائيًا",
    roomActionTitle: "Temporary Room",
    roomActionHint: "غرفة خاصة برابط مؤقت",
    shareReady: "جاهز للمشاركة",
    askShareTitle: "Ask Me Anonymously",
    roomShareTitle: "Temporary Room",
    askShareDesc: "انسخ الرابط وضعه في البايو أو أرسله لصديق. ينتهي تلقائيًا بعد ٥ ساعات.",
    roomShareDesc: "شارك هذا الرابط لغرفة خاصة تختفي بعد آخر نشاط.",
    copy: "نسخ",
    anonymousEntryKicker: "رابط أسئلة مجهول",
    roomEntryKicker: "غرفة مؤقتة",
    anonymousEntryTitle: "أرسل رسالة مجهولة",
    roomEntryTitle: "ادخل الغرفة المؤقتة",
    anonymousEntryDesc: "هذا الرابط مؤقت. اكتب رسالة قصيرة وسيتم فتح محادثة خاصة عند توفر الطرف الآخر.",
    roomEntryDesc: "الغرفة لا تحتاج حسابًا. أرسل أول رسالة وسيبدأ العدّاد.",
    anonymousPlaceholder: "اكتب شيئًا لا تريد أن يبقى طويلًا...",
    roomPlaceholder: "اكتب أول رسالة في الغرفة...",
    anonymousSend: "إرسال مجهول",
    roomSend: "دخول الغرفة",
    linkCreated: "تم إنشاء الرابط المؤقت.",
    entryQueued: "تم حفظ الرسالة محليًا كطلب مؤقت.",
    profileCodeLabel: "رقمك",
    copyMyCode: "انسخ رقمي",
    copyMyLink: "انسخ الرابط",
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
    requestSent: "تم إرسال طلب المحادثة.",
    requestExists: "يوجد طلب محادثة بانتظار الرد.",
    requestIncoming: "{name} يريد محادثتك",
    accept: "قبول",
    reject: "رفض",
    block: "حظر",
    blocked: "تم الحظر.",
    rejected: "تم الرفض.",
    accepted: "تم قبول الطلب.",
    requestsHeader: "طلبات جديدة",
    pendingHeader: "بانتظار الرد",
    expiringHeader: "قريبة من الانتهاء",
    expiringStripOne: "محادثة ستنتهي قريبًا · خلال {time}",
    expiringStrip: "{count} محادثات ستنتهي قريبًا · أقربها خلال {time}",
    activeHeader: "نشطة",
    burnedHeader: "منتهية",
    blockedHeader: "محظورة",
    pendingState: "بانتظار قبول الطرف الآخر.",
    expiredStateTitle: "انتهت المحادثة واختفت",
    expiredStateBody: "لا يمكن عرض الرسائل بعد انتهاء الوقت. يمكنك حذف الأثر من القائمة أو بدء طلب جديد.",
    blockedStateTitle: "هذه المحادثة محظورة",
    blockedStateBody: "لن تستقبل رسائل من هذا الرقم. يمكنك إدارة الحظر لاحقًا من إعدادات الخصوصية.",
    noChatsTitle: "لا توجد محادثات نشطة",
    noChatsBody: "ابدأ برقم مستخدم فقط. الطلبات والمحادثات القريبة من الانتهاء ستظهر هنا تلقائيًا.",
    privacyModeLabel: "وضع الاختفاء",
    privacy10s: "10 ثوانٍ بعد القراءة",
    privacy5m: "5 دقائق",
    privacy1h: "ساعة",
    privacy5h: "5 ساعات",
    privacyClose: "عند إغلاق المحادثة",
    sentStatus: "تم الإرسال",
    deliveredStatus: "تم الوصول",
    readStatus: "تمت القراءة",
    noAccount: "بدون حساب مرتبط",
    onlineNow: "متصل الآن",
    hideCode: "إخفاء رقمي",
    showCode: "إظهار رقمي",
    hideChats: "إخفاء الدردشات",
    hideChatsHint: "إخفاء كل المحادثات من القائمة الرئيسية.",
    hideCodeHint: "منع مشاركة الرقم والكود السريع.",
    hiddenChatsTitle: "الدردشات مخفية",
    hiddenChatsBody: "أوقف خيار إخفاء الدردشات من الإعدادات لعرض المحادثات مرة أخرى.",
    regenerateCode: "تجديد رقمي",
    codeRegenerated: "تم تجديد رقمك.",
    deleteAll: "مسح كل المحادثات الآن",
    deletedAll: "تم مسح المحادثات.",
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
    mediaSheetTitle: "إرسال سريع",
    pickMedia: "صورة أو فيديو",
    gifSent: "تم إرسال GIF مؤقت",
    voiceHold: "اضغط مطولًا للتسجيل",
    voiceRecording: "جارٍ التسجيل...",
    voiceSent: "تم إرسال صوتية مؤقتة",
    hiddenToggle: "رسالة مخفية",
    hiddenActive: "النص مخفي حتى اللمس",
    hiddenRevealHint: "المس باستمرار للكشف",
    hideMode: "إخفاء الدردشات",
    shareQr: "شارك كـ QR",
    qrTitle: "شارك رقمك",
    copyNumber: "نسخ الرقم",
    close: "إغلاق",
    burnToggle: "رسالة تحترق",
    burnAfterRead: "تحترق بعد القراءة",
    reply: "رد",
    replyTo: "رد على: {text}",
    cancelReply: "إلغاء الرد",
    copyMessage: "نسخ",
    copiedMessage: "تم نسخ الرسالة",
    burnNow: "إحراق الآن",
    messageActions: "إجراءات الرسالة",
    messageDeleted: "تم حذف الرسالة",
    reactionAdded: "تم إضافة التفاعل",
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
    heroLine1: "Open a secret channel in seconds: anonymous ask, temporary room, or code chat.",
    heroLine2: "Every link has a short life. Every conversation can disappear.",
    inputPlaceholder: "Enter the user's code to start a chat",
    startBtn: "Start chat",
    askActionTitle: "Ask Me Anonymously",
    askActionHint: "Anonymous question link that expires",
    roomActionTitle: "Temporary Room",
    roomActionHint: "Private room with a temporary link",
    shareReady: "Ready to share",
    askShareTitle: "Ask Me Anonymously",
    roomShareTitle: "Temporary Room",
    askShareDesc: "Copy the link into your bio or send it to a friend. It expires after 5 hours.",
    roomShareDesc: "Share this private room link. It disappears after the last activity.",
    copy: "Copy",
    anonymousEntryKicker: "Anonymous ask link",
    roomEntryKicker: "Temporary room",
    anonymousEntryTitle: "Send an anonymous message",
    roomEntryTitle: "Enter the temporary room",
    anonymousEntryDesc: "This link is temporary. Write a short message and a private chat can start when the other side is available.",
    roomEntryDesc: "No account needed. Send the first message and the timer starts.",
    anonymousPlaceholder: "Write something that should not stay for long...",
    roomPlaceholder: "Write the first room message...",
    anonymousSend: "Send anonymously",
    roomSend: "Enter room",
    linkCreated: "Temporary link created.",
    entryQueued: "Saved locally as a temporary request.",
    profileCodeLabel: "Your code",
    copyMyCode: "Copy my code",
    copyMyLink: "Copy link",
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
    requestSent: "Chat request sent.",
    requestExists: "A chat request is already waiting.",
    requestIncoming: "{name} wants to chat",
    accept: "Accept",
    reject: "Reject",
    block: "Block",
    blocked: "Blocked.",
    rejected: "Rejected.",
    accepted: "Request accepted.",
    requestsHeader: "New requests",
    pendingHeader: "Waiting",
    expiringHeader: "Expiring soon",
    expiringStripOne: "1 chat expires soon · in {time}",
    expiringStrip: "{count} chats expire soon · closest in {time}",
    activeHeader: "Active",
    burnedHeader: "Burned",
    blockedHeader: "Blocked",
    pendingState: "Waiting for the other person to accept.",
    expiredStateTitle: "This chat expired and disappeared",
    expiredStateBody: "Messages are no longer available after expiry. You can clear the trace or start a new request.",
    blockedStateTitle: "This chat is blocked",
    blockedStateBody: "You will not receive messages from this code. Blocked codes can be managed later from privacy settings.",
    noChatsTitle: "No active chats",
    noChatsBody: "Start with a user code only. Requests and chats close to expiry will organize themselves here.",
    privacyModeLabel: "Disappears",
    privacy10s: "10s after read",
    privacy5m: "5 minutes",
    privacy1h: "1 hour",
    privacy5h: "5 hours",
    privacyClose: "On close",
    sentStatus: "Sent",
    deliveredStatus: "Delivered",
    readStatus: "Read",
    noAccount: "No linked account",
    onlineNow: "Online now",
    hideCode: "Hide my code",
    showCode: "Show my code",
    hideChats: "Hide all chats",
    hideChatsHint: "Hide every conversation from the main list.",
    hideCodeHint: "Prevent sharing your number and quick code.",
    hiddenChatsTitle: "Chats are hidden",
    hiddenChatsBody: "Turn off Hide all chats in settings to show conversations again.",
    regenerateCode: "Regenerate code",
    codeRegenerated: "Your code was regenerated.",
    deleteAll: "Delete all chats now",
    deletedAll: "Chats deleted.",
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
    mediaSheetTitle: "Quick send",
    pickMedia: "Photo or video",
    gifSent: "Temporary GIF sent",
    voiceHold: "Hold to record",
    voiceRecording: "Recording...",
    voiceSent: "Temporary voice note sent",
    hiddenToggle: "Hidden message",
    hiddenActive: "Text is hidden until touch",
    hiddenRevealHint: "Hold to reveal",
    hideMode: "Hide all chats",
    shareQr: "Share as QR",
    qrTitle: "Share your number",
    copyNumber: "Copy Number",
    close: "Close",
    burnToggle: "Burn message",
    burnAfterRead: "Burns after reading",
    reply: "Reply",
    replyTo: "Replying to: {text}",
    cancelReply: "Cancel reply",
    copyMessage: "Copy",
    copiedMessage: "Message copied",
    burnNow: "Burn now",
    messageActions: "Message actions",
    messageDeleted: "Message deleted",
    reactionAdded: "Reaction added",
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

demoChats[2].lastMessageAt = Date.now() - (FIVE_HOURS - 18 * 60 * 1000);
demoChats[2].expiresAt = Date.now() + 18 * 60 * 1000;
Object.values(demoChats[2].messages).flat().forEach((message) => {
  message.expiresAt = new Date(demoChats[2].expiresAt).toISOString();
});

let currentLang = "ar";
let displayName = "زائر 27";
let currentProfile = null;
let chats = [];
let conversationRequests = [];
let burnedChats = [];
let blockedChats = [];
let activeConversationId = "";
let activeSubscription = null;
let requestsSubscription = null;
let countdownTimer = null;
let messageTicker = null;
let privacyMode = "5h";
let panicMode = false;
let chatsHidden = localStorage.getItem(HIDE_CHATS_STORAGE_KEY) === "1";
let typing = false;
let typingLastSentAt = 0;
let typingStopTimer = null;
let qrModalOpen = false;
let idleLockTimer = null;
let replyDraft = null;
let activeActionMessageId = "";
let hiddenMode = false;
let voiceRecording = null;
let entryMode = "";
let generatedShareLink = "";

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

function isUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

function getPrivacyConfig(mode = privacyMode) {
  return PRIVACY_MODES[mode] || PRIVACY_MODES["5h"];
}

function getPrivacyLabel(mode = privacyMode) {
  const t = i18n[currentLang];
  return ({
    "10s_read": t.privacy10s,
    "5m": t.privacy5m,
    "1h": t.privacy1h,
    "5h": t.privacy5h,
    "close": t.privacyClose
  })[mode] || t.privacy5h;
}

function getShareLink() {
  const code = currentProfile?.public_code || $("profileCodeValue")?.textContent?.trim() || "";
  const base = `${window.location.origin}${getAppBasePath()}`;
  return code ? `${base}?code=${encodeURIComponent(code)}` : base;
}

function createShareToken(prefix) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${random}-${Date.now().toString(36).toUpperCase()}`;
}

function getTemporaryShareLink(type) {
  const base = `${window.location.origin}${getAppBasePath()}`;
  const param = type === "room" ? "room" : "ask";
  const token = createShareToken(type === "room" ? "ROOM" : "ASK");
  return { token, url: `${base}?${param}=${encodeURIComponent(token)}` };
}

async function createTemporaryShareLink(type) {
  const link = getTemporaryShareLink(type);
  if (isLiveMode()) {
    const { error } = await db.from("temporary_links").insert({
      owner_id: currentProfile.id,
      token: link.token,
      link_type: type === "room" ? "room" : "ask",
      expires_at: new Date(Date.now() + MESSAGE_TTL_SECONDS * 1000).toISOString()
    });
    if (error && !isMissingRelationError(error)) throw error;
  }
  return link.url;
}

async function showShareDrop(type) {
  const t = i18n[currentLang];
  generatedShareLink = await createTemporaryShareLink(type);
  $("shareDrop").hidden = false;
  $("shareDropKicker").textContent = t.shareReady;
  $("shareDropTitle").textContent = type === "room" ? t.roomShareTitle : t.askShareTitle;
  $("shareDropDesc").textContent = type === "room" ? t.roomShareDesc : t.askShareDesc;
  $("shareLinkInput").value = generatedShareLink;
  $("copyShareLinkBtn").textContent = t.copy;
  showToast(t.linkCreated);
  vibrate(20);
}

async function copyGeneratedShareLink() {
  const link = generatedShareLink || $("shareLinkInput")?.value;
  if (!link) return;
  try {
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(link);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      const input = $("shareLinkInput");
      input.focus();
      input.select();
      copied = document.execCommand("copy");
    }

    showToast(copied ? i18n[currentLang].copied : link);
  } catch (error) {
    handleAsyncError(error, link);
  }
}

function showEntryCard(type, token) {
  const t = i18n[currentLang];
  entryMode = type;
  $("entryCard").hidden = false;
  $("entryCard").dataset.token = token;
  $("entryCardKicker").textContent = type === "room" ? t.roomEntryKicker : t.anonymousEntryKicker;
  $("entryCardTitle").textContent = type === "room" ? t.roomEntryTitle : t.anonymousEntryTitle;
  $("entryCardDesc").textContent = type === "room" ? t.roomEntryDesc : t.anonymousEntryDesc;
  $("entryMessageInput").placeholder = type === "room" ? t.roomPlaceholder : t.anonymousPlaceholder;
  $("entrySendBtn").textContent = type === "room" ? t.roomSend : t.anonymousSend;
}

function handleTemporaryEntryParams() {
  const params = new URLSearchParams(window.location.search);
  const askToken = params.get("ask");
  const roomToken = params.get("room");
  if (askToken) showEntryCard("ask", askToken);
  if (roomToken) showEntryCard("room", roomToken);
}

async function submitTemporaryEntry() {
  const text = $("entryMessageInput").value.trim();
  if (!text) return;
  const token = $("entryCard").dataset.token || createShareToken(entryMode === "room" ? "ROOM" : "ASK");
  const entry = {
    id: createMessageId("entry"),
    token,
    mode: entryMode || "ask",
    text,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + MESSAGE_TTL_SECONDS * 1000).toISOString()
  };

  if (isLiveMode()) {
    const { data: link, error: linkError } = await db
      .from("temporary_links")
      .select("id, owner_id, link_type")
      .eq("token", token)
      .maybeSingle();
    if (linkError && !isMissingRelationError(linkError)) throw linkError;
    if (link?.id && link.link_type === "ask") {
      const { error } = await db.from("anonymous_entries").insert({
        link_id: link.id,
        owner_id: link.owner_id,
        body: text,
        expires_at: entry.expiresAt
      });
      if (!error) {
        $("entryMessageInput").value = "";
        showToast(i18n[currentLang].entryQueued);
        return;
      }
      console.warn(error);
    }
  }

  const key = "twentyseven_temporary_entries";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 24)));
  $("entryMessageInput").value = "";
  showToast(i18n[currentLang].entryQueued);
}

function handleAsyncError(error, fallbackMessage) {
  console.warn(error);
  flashError(fallbackMessage || i18n[currentLang].errorChats);
}

function isMissingRelationError(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42P01", "42703", "PGRST200", "PGRST204"].includes(error?.code)
    || message.includes("does not exist")
    || message.includes("schema cache")
    || message.includes("could not find")
    || message.includes("relationship");
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
  $("copyLinkBtn").textContent = i18n[currentLang].copyMyLink;
  $("profileQrBtn").setAttribute("aria-label", i18n[currentLang].shareQr);
  $("profileQrBtn").title = i18n[currentLang].shareQr;
  if (hasCode) $("profileCodeValue").textContent = currentProfile.code_visible === false ? "••••••" : currentProfile.public_code;
}

async function copyProfileCode() {
  if (!currentProfile?.public_code || currentProfile.code_visible === false) return;
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

async function copyProfileLink() {
  if (!currentProfile?.public_code || currentProfile.code_visible === false) return;
  const link = getShareLink();
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(link);
    showToast(i18n[currentLang].copied);
  } catch (error) {
    handleAsyncError(error, link);
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
        code_visible: true,
        display_name: displayName,
        avatar_seed: displayName || publicCode
      };

      let { data, error } = await db.from("profiles").insert(profile).select("*").single();
      if (error && isMissingRelationError(error)) {
        const fallbackProfile = { ...profile };
        delete fallbackProfile.code_visible;
        const fallback = await db.from("profiles").insert(fallbackProfile).select("*").single();
        data = fallback.data;
        error = fallback.error;
      }
      if (!error) return { code_visible: true, ...data };
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

  if (error) {
    if (isMissingRelationError(error)) {
      return false;
    }
    throw error;
  }
  if (count && count > 0) return false;

  const { error: deleteError } = await db
    .from("conversations")
    .delete()
    .eq("id", chat.id);

  if (deleteError) throw deleteError;
  chats = chats.filter((item) => item.id !== chat.id);
  return true;
}

async function loadConversationRequests() {
  if (!isLiveMode()) {
    conversationRequests = [
      {
        id: "demo-request-incoming",
        requester_id: "demo-rakan",
        target_id: DEMO_PROFILE_ID,
        status: "pending",
        created_at: new Date().toISOString(),
        requester: { id: "demo-rakan", public_code: "482913", display_name: currentLang === "ar" ? "راكان" : "Rakan", avatar_seed: "Rakan" },
        target: { id: DEMO_PROFILE_ID, public_code: "270027", display_name: "27", avatar_seed: "27" }
      },
      {
        id: "demo-request-outgoing",
        requester_id: DEMO_PROFILE_ID,
        target_id: "demo-lina",
        status: "pending",
        created_at: new Date().toISOString(),
        requester: { id: DEMO_PROFILE_ID, public_code: "270027", display_name: "27", avatar_seed: "27" },
        target: { id: "demo-lina", public_code: "918204", display_name: currentLang === "ar" ? "لينا" : "Lina", avatar_seed: "Lina" }
      }
    ];
    return [];
  }

  const { data, error } = await db
    .from("conversation_requests")
    .select(`
      id,
      requester_id,
      target_id,
      status,
      created_at,
      requester:profiles!conversation_requests_requester_id_fkey(id, public_code, display_name, avatar_seed),
      target:profiles!conversation_requests_target_id_fkey(id, public_code, display_name, avatar_seed)
    `)
    .or(`requester_id.eq.${currentProfile.id},target_id.eq.${currentProfile.id}`)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error)) {
      conversationRequests = [];
      return [];
    }
    throw error;
  }
  conversationRequests = data || [];
  return conversationRequests;
}

function isIncomingRequest(request) {
  if (!isLiveMode()) return request.target_id === DEMO_PROFILE_ID;
  return request.target_id === currentProfile?.id;
}

async function loadConversations() {
  setLoading(i18n[currentLang].loadingChats, true);
  try {
    if (!isLiveMode()) {
      chats = demoChats.filter((chat) => chat.expiresAt > Date.now());
      moveExpiredChatsToBurned();
      renderChats();
      return chats;
    }

    await cleanupExpiredMessages();

    let { data, error } = await db
      .from("conversations")
      .select(`
        id,
        user_a_id,
        user_b_id,
        created_at,
        last_message_at,
        privacy_mode,
        status,
        user_a:profiles!conversations_user_a_id_fkey(id, public_code, display_name, avatar_seed),
        user_b:profiles!conversations_user_b_id_fkey(id, public_code, display_name, avatar_seed)
      `)
      .or(`user_a_id.eq.${currentProfile.id},user_b_id.eq.${currentProfile.id}`)
      .in("status", ["active", "blocked"])
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error && isMissingRelationError(error)) {
      const fallback = await db
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
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;

    const mappedChats = (data || []).map((row) => {
      const otherProfile = row.user_a_id === currentProfile.id ? row.user_b : row.user_a;
      return {
        id: row.id,
        online: true,
        otherProfile,
        lastMessageAt: row.last_message_at ? new Date(row.last_message_at).getTime() : 0,
        privacyMode: row.privacy_mode || "5h",
        status: row.status || "active",
        messages: { neutral: [] }
      };
    });

    chats = mappedChats
      .filter((chat) => chat.status !== "blocked")
      .map((chat) => {
        const existing = getChat(chat.id);
        if (!existing) return chat;
        return {
          ...existing,
          ...chat,
          burned: false,
          messages: existing.messages || chat.messages,
          expiresAt: existing.expiresAt && existing.expiresAt > Date.now() ? existing.expiresAt : chat.expiresAt
        };
      });
    blockedChats = mappedChats.filter((chat) => chat.status === "blocked");
    burnedChats = burnedChats.slice(0, 12);
    await loadConversationRequests();

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

  let { data: target, error: targetError } = await db
    .from("profiles")
    .select("*")
    .eq("public_code", code)
    .eq("code_visible", true)
    .maybeSingle();

  if (targetError && isMissingRelationError(targetError)) {
    const fallback = await db
      .from("profiles")
      .select("*")
      .eq("public_code", code)
      .maybeSingle();
    target = fallback.data;
    targetError = fallback.error;
  }

  if (targetError) throw targetError;
  if (!target) {
    flashError(i18n[currentLang].codeNotFound);
    return null;
  }
  if (target.id === currentProfile.id) {
    flashError(i18n[currentLang].cannotChatSelf);
    return null;
  }

  const { data: blocked, error: blockError } = await db
    .from("blocked_profiles")
    .select("blocker_id")
    .or(`and(blocker_id.eq.${currentProfile.id},blocked_id.eq.${target.id}),and(blocker_id.eq.${target.id},blocked_id.eq.${currentProfile.id})`)
    .maybeSingle();

  if (blockError && !isMissingRelationError(blockError)) throw blockError;
  if (blocked) {
    flashError(i18n[currentLang].blocked);
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

  const { data: existingRequest, error: requestFindError } = await db
    .from("conversation_requests")
    .select("id, status")
    .or(`and(requester_id.eq.${currentProfile.id},target_id.eq.${target.id}),and(requester_id.eq.${target.id},target_id.eq.${currentProfile.id})`)
    .eq("status", "pending")
    .maybeSingle();

  if (requestFindError && !isMissingRelationError(requestFindError)) throw requestFindError;
  if (existingRequest) {
    showToast(i18n[currentLang].requestExists);
    return null;
  }

  const { error: createError } = await db
    .from("conversation_requests")
    .insert({ requester_id: currentProfile.id, target_id: target.id, status: "pending" });

  if (createError) {
    if (isMissingRelationError(createError)) {
      const directId = await createConversationDirectly(target.id);
      if (directId) {
        await loadConversations();
        openChat(directId);
        return directId;
      }
      flashError(i18n[currentLang].errorChats);
      return null;
    }
    throw createError;
  }
  await loadConversationRequests();
  renderChats();
  showToast(i18n[currentLang].requestSent);
  return null;
}

async function createConversationDirectly(targetId, mode = privacyMode) {
  const now = new Date().toISOString();
  let { data, error } = await db
    .from("conversations")
    .insert({
      user_a_id: currentProfile.id,
      user_b_id: targetId,
      privacy_mode: mode,
      last_message_at: now,
      status: "active"
    })
    .select("id")
    .single();

  if (error && isMissingRelationError(error)) {
    const fallback = await db
      .from("conversations")
      .insert({
        user_a_id: currentProfile.id,
        user_b_id: targetId,
        last_message_at: now
      })
      .select("id")
      .single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;
  return data?.id || null;
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
    await markIncomingMessagesRead(chat);
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
      .channel(`messages:${conversationId}:${Date.now()}`)
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

async function markIncomingMessagesRead(chat) {
  if (!isLiveMode() || !chat?.id || !isUuid(chat.id)) return;
  const unreadIncoming = getMessages(chat).filter((message) => (
    message.type === "incoming" && !message.readAt && isUuid(message.id)
  ));
  if (!unreadIncoming.length) return;

  const readAt = new Date().toISOString();
  const ids = unreadIncoming.map((message) => message.id);
  const { error } = await db
    .from("messages")
    .update({ read_at: readAt })
    .in("id", ids);

  if (error) {
    console.warn(error);
    return;
  }

  unreadIncoming.forEach((message) => {
    message.readAt = readAt;
  });
}

async function sendMessage(conversationId, content, options = {}) {
  if (!content.trim()) return;
  const mode = options.privacyMode || privacyMode;
  const config = getPrivacyConfig(mode);
  const ttlMs = config.seconds * 1000;
  const chat = getChat(conversationId);

  if (!isLiveMode() || chat?.placeholder || !isUuid(conversationId)) {
    appendDemoMessage(conversationId, {
      type: "outgoing",
      text: content,
      time: i18n[currentLang].now,
      privacyMode: mode,
      replyToId: options.replyTo?.id,
      replyToText: options.replyTo?.text,
      messageType: options.messageType || (options.hidden ? "hidden_text" : "text"),
      hidden: Boolean(options.hidden),
      burnAfterRead: Boolean(config.burnAfterRead),
      expiresAt: new Date(Date.now() + ttlMs).toISOString()
    });
    vibrate(30);
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();
  let { data: insertedMessage, error } = await db.from("messages").insert({
    conversation_id: conversationId,
    sender_id: currentProfile.id,
    content,
    message_type: options.messageType || (options.hidden ? "hidden_text" : "text"),
    expires_at: expiresAt,
    privacy_mode: mode,
    burn_after_read: Boolean(config.burnAfterRead)
  }).select("*").single();

  if (error && isMissingRelationError(error)) {
    let fallback = await db.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentProfile.id,
      content,
      expires_at: expiresAt
    }).select("*").single();
    if (fallback.error && isMissingRelationError(fallback.error)) {
      fallback = await db.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentProfile.id,
        content
      }).select("*").single();
    }
    insertedMessage = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;
  vibrate(30);

  if (chat && insertedMessage) {
    const nextMessage = mapDbMessage(insertedMessage);
    const messages = chat.messages.neutral || [];
    if (!messages.some((message) => message.id === nextMessage.id)) {
      chat.messages.neutral = [...messages, nextMessage];
      chat.lastMessageAt = new Date(nextMessage.createdAt || now).getTime();
      chat.expiresAt = nextMessage.expiresAt ? new Date(nextMessage.expiresAt).getTime() : now.getTime() + ttlMs;
      renderMessages(chat);
      renderChats();
      updateChatCountdown(chat);
    }
  }

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
    messageType: row.message_type || "text",
    hidden: row.message_type === "hidden_text",
    time: formatTime(row.created_at),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    privacyMode: row.privacy_mode || "5h",
    burnAfterRead: Boolean(row.burn_after_read),
    readAt: row.read_at,
    status: row.sender_id === currentProfile.id
      ? (row.read_at ? "read" : "sent")
      : ""
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

function moveExpiredChatsToBurned() {
  const now = Date.now();
  const expired = chats.filter((chat) => getChatExpiryTime(chat) <= now);
  if (!expired.length) return 0;

  burnedChats = [
    ...expired.map((chat) => ({ ...chat, burned: true, status: "expired" })),
    ...burnedChats
  ].slice(0, 12);
  chats = chats.filter((chat) => getChatExpiryTime(chat) > now);
  return expired.length;
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
  return [...chats, ...burnedChats, ...blockedChats].find((chat) => chat.id === chatId);
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
  const t = i18n[currentLang];
  moveExpiredChatsToBurned();

  if (chatsHidden) {
    list.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = `
      <strong>${escapeHtml(t.hiddenChatsTitle)}</strong>
      <span id="emptyText">${escapeHtml(t.hiddenChatsBody)}</span>
    `;
    return;
  }

  if (!chats.length && !conversationRequests.length && !burnedChats.length && !blockedChats.length) {
    list.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = `
      <strong>${escapeHtml(t.noChatsTitle)}</strong>
      <span id="emptyText">${escapeHtml(t.noChatsBody)}</span>
    `;
    return;
  }

  empty.hidden = true;
  const incomingRequests = conversationRequests.filter(isIncomingRequest);
  const pendingRequests = conversationRequests.filter((request) => !isIncomingRequest(request));
  const requestsMarkup = incomingRequests.length ? `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(t.requestsHeader)}</div>
      ${incomingRequests.map(renderRequestItem).join("")}
    </div>
  ` : "";
  const pendingMarkup = pendingRequests.length ? `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(t.pendingHeader)}</div>
      ${pendingRequests.map(renderRequestItem).join("")}
    </div>
  ` : "";

  const expiring = chats.filter((chat) => getChatExpiryTime(chat) - Date.now() < 30 * 60 * 1000);
  const active = chats.filter((chat) => !expiring.includes(chat));
  const expiringStrip = expiring.length ? renderExpiringStrip(expiring) : "";
  const expiringMarkup = expiring.length ? renderChatGroup(t.expiringHeader, expiring) : "";
  const activeMarkup = active.length ? renderChatGroup(t.activeHeader, active) : "";
  const burnedMarkup = burnedChats.length ? renderChatGroup(t.burnedHeader, burnedChats, true) : "";
  const blockedMarkup = blockedChats.length ? renderChatGroup(t.blockedHeader, blockedChats, true) : "";

  list.innerHTML = `${requestsMarkup}${pendingMarkup}${expiringStrip}${expiringMarkup}${activeMarkup}${burnedMarkup}${blockedMarkup}`;
}

function renderChatGroup(title, items, disabled = false) {
  return `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(title)}</div>
      ${items.map((chat) => renderChatItem(chat, disabled)).join("")}
    </div>
  `;
}

function renderExpiringStrip(items) {
  const soonest = items.reduce((target, chat) => (
    getChatExpiryTime(chat) < getChatExpiryTime(target) ? chat : target
  ), items[0]);
  const remaining = Math.max(0, getChatExpiryTime(soonest) - Date.now());
  const template = items.length === 1 ? i18n[currentLang].expiringStripOne : i18n[currentLang].expiringStrip;
  const label = template
    .replace("{count}", items.length)
    .replace("{time}", formatRemaining(remaining));

  return `
    <button class="expiring-strip" type="button" data-chat-id="${escapeHtml(soonest.id)}">
      <span class="expiring-dot" aria-hidden="true"></span>
      <span>${escapeHtml(label)}</span>
    </button>
  `;
}

function renderChatItem(chat, disabled = false) {
    const name = getChatName(chat);
    const hue = hashHue(chat.otherProfile?.avatar_seed || name);
    const statusClass = chat.online ? "online" : "offline";
    const stateClass = chat.burned ? "is-expired" : chat.status === "blocked" ? "is-blocked" : "";
    const meta = chat.burned
      ? i18n[currentLang].expiredStateTitle
      : chat.status === "blocked"
        ? i18n[currentLang].blockedStateTitle
        : getChatItemMeta(chat);

    return `
      <div class="chat-item ${disabled ? "state-only" : ""} ${stateClass}" role="button" tabindex="0" data-chat-id="${escapeHtml(chat.id)}" aria-label="${escapeHtml(name)}">
        <div class="chat-avatar" style="--avatar-hue: ${hue}">${escapeHtml(getInitials(name))}</div>
        <div class="chat-info">
          <div class="chat-name">${escapeHtml(name)}</div>
          <div class="chat-meta">${escapeHtml(meta)}</div>
        </div>
        <div class="chat-pill">${escapeHtml(getChatPill(chat))}</div>
        <div class="chat-status ${statusClass}" aria-hidden="true"></div>
      </div>
    `;
}

function getChatItemMeta(chat) {
  const preview = getChatPreview(chat);
  const remaining = getChatExpiryTime(chat) - Date.now();
  const expiry = remaining <= 0
    ? i18n[currentLang].expiredStateTitle
    : i18n[currentLang].expiresIn.replace("{time}", formatRemaining(remaining));
  return preview ? `${preview} · ${expiry}` : expiry;
}

function getChatPreview(chat) {
  const messages = getMessages(chat);
  const last = messages[messages.length - 1];
  if (!last) return i18n[currentLang].emptyChat;
  if (last.mediaUrl) return last.fileName || i18n[currentLang].attach;
  return last.text || i18n[currentLang].emptyChat;
}

function getChatPill(chat) {
  if (chat.burned) return i18n[currentLang].burnedHeader;
  if (chat.status === "blocked") return i18n[currentLang].block;
  return getPrivacyLabel(chat.privacyMode || "5h");
}

function renderRequestItem(request) {
  const profile = isIncomingRequest(request) ? request.requester : request.target;
  const name = profile?.display_name || profile?.public_code || "27";
  const hue = hashHue(profile?.avatar_seed || name);
  const incoming = isIncomingRequest(request);
  return `
    <div class="request-item ${incoming ? "incoming-request" : "pending-request"}" data-request-id="${escapeHtml(request.id)}">
      <div class="chat-avatar" style="--avatar-hue: ${hue}">${escapeHtml(getInitials(name))}</div>
      <div class="chat-info">
        <div class="chat-name">${escapeHtml(incoming ? i18n[currentLang].requestIncoming.replace("{name}", name) : i18n[currentLang].requestSent)}</div>
        <div class="chat-meta">${escapeHtml(incoming ? profile?.public_code || "" : i18n[currentLang].pendingState)}</div>
      </div>
      ${incoming ? `
        <div class="request-actions">
        <button class="mini-action accept-request" type="button">${escapeHtml(i18n[currentLang].accept)}</button>
        <button class="mini-action reject-request" type="button">${escapeHtml(i18n[currentLang].reject)}</button>
        <button class="mini-action danger reject-block-request" type="button">${escapeHtml(i18n[currentLang].block)}</button>
        </div>
      ` : ""}
    </div>
  `;
}

async function acceptConversationRequest(requestId) {
  const request = conversationRequests.find((item) => item.id === requestId);
  if (!request || !isIncomingRequest(request)) return;

  if (!isLiveMode()) {
    const profile = request.requester;
    const code = profile?.public_code || "482913";
    const chat = createDemoConversationFromCode(code);
    chat.name = profile?.display_name || chat.name;
    chat.otherProfile = profile || chat.otherProfile;
    conversationRequests = conversationRequests.filter((item) => item.id !== requestId);
    renderChats();
    showToast(i18n[currentLang].accepted);
    openChat(chat.id);
    return;
  }

  let { data: created, error: createError } = await db
    .from("conversations")
    .insert({
      user_a_id: request.requester_id,
      user_b_id: request.target_id,
      privacy_mode: privacyMode,
      last_message_at: new Date().toISOString(),
      status: "active"
    })
    .select("id")
    .single();

  if (createError && isMissingRelationError(createError)) {
    const fallback = await db
      .from("conversations")
      .insert({
        user_a_id: request.requester_id,
        user_b_id: request.target_id,
        last_message_at: new Date().toISOString()
      })
      .select("id")
      .single();
    created = fallback.data;
    createError = fallback.error;
  }

  if (createError) throw createError;

  const { error: updateError } = await db
    .from("conversation_requests")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError && !isMissingRelationError(updateError)) throw updateError;
  await loadConversations();
  showToast(i18n[currentLang].accepted);
  if (created?.id) openChat(created.id);
}

async function rejectConversationRequest(requestId, block = false) {
  const request = conversationRequests.find((item) => item.id === requestId);
  if (!request || !isIncomingRequest(request)) return;

  if (!isLiveMode()) {
    conversationRequests = conversationRequests.filter((item) => item.id !== requestId);
    if (block) {
      const profile = request.requester;
      blockedChats.unshift({
        id: `blocked-${request.requester_id}`,
        online: false,
        status: "blocked",
        otherProfile: profile,
        name: profile?.display_name || profile?.public_code || "27",
        lastMessageAt: Date.now(),
        expiresAt: Date.now(),
        messages: { neutral: [] }
      });
    }
    renderChats();
    showToast(block ? i18n[currentLang].blocked : i18n[currentLang].rejected);
    return;
  }

  if (block) {
    const { error: blockError } = await db
      .from("blocked_profiles")
      .upsert({ blocker_id: currentProfile.id, blocked_id: request.requester_id });
    if (blockError && !isMissingRelationError(blockError)) throw blockError;
  }

  const { error } = await db
    .from("conversation_requests")
    .update({ status: block ? "blocked" : "rejected", responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error && !isMissingRelationError(error)) throw error;
  await loadConversationRequests();
  renderChats();
  showToast(block ? i18n[currentLang].blocked : i18n[currentLang].rejected);
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
      const statusLabel = message.type === "outgoing"
        ? `<span class="message-status">${escapeHtml(getMessageStatusLabel(message))}</span>`
        : "";
      const replyQuote = message.replyToText
        ? `<span class="message-reply-quote">${escapeHtml(message.replyToText)}</span>`
        : "";
      const reaction = message.reaction
        ? `<span class="message-reaction">${escapeHtml(message.reaction)}</span>`
        : "";
      return `
      <div class="message-shell ${message.type}" data-message-id="${escapeHtml(message.id || "")}">
        <div class="swipe-reply-cue" aria-hidden="true">↩</div>
        <div class="swipe-delete-cue" aria-hidden="true">🔥</div>
        <div class="message ${message.type}" style="--swipe-x: 0px; --delete-opacity: 0;">
          ${replyQuote}
          ${renderMessageContent(message)}
          ${burnLabel}
          ${reaction}
          <span class="message-time">${escapeHtml(message.time || t.now)} ${statusLabel}</span>
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

function getMessageStatusLabel(message) {
  const t = i18n[currentLang];
  if (message.burnAfterRead && message.readAt) return t.burnAfterRead;
  if (message.status === "read" || message.readAt) return t.readStatus;
  if (message.status === "delivered") return t.deliveredStatus;
  return t.sentStatus;
}

function getMessageSummary(message) {
  const text = message?.text || message?.fileName || "";
  return text.length > 72 ? `${text.slice(0, 72)}…` : text;
}

function renderMessageContent(message) {
  const text = escapeHtml(message.text || "");
  if (message.messageType === "voice") {
    return `
      <span class="voice-message">
        <span class="voice-play" aria-hidden="true"></span>
        <span class="voice-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        <span>${text || "0:03"}</span>
      </span>
    `;
  }

  if (message.messageType === "gif") {
    return `<span class="gif-message"><strong>${text}</strong><small>GIF</small></span>`;
  }

  if (message.hidden) {
    return `
      <span class="hidden-message" tabindex="0" role="button" aria-label="${escapeHtml(i18n[currentLang].hiddenRevealHint)}">
        <span class="hidden-mask">${escapeHtml(i18n[currentLang].hiddenRevealHint)}</span>
        <span class="hidden-content">${text}</span>
      </span>
    `;
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
  const ttl = getPrivacyConfig(message?.privacyMode || (message?.burnAfterRead ? "10s_read" : "5h")).seconds;
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

function setReplyDraft(message) {
  if (!message) return;
  replyDraft = {
    id: message.id,
    text: getMessageSummary(message)
  };
  updateReplyComposer();
  $("messageInput").focus();
}

function clearReplyDraft() {
  replyDraft = null;
  updateReplyComposer();
}

function updateReplyComposer() {
  const composer = $("replyComposer");
  const text = $("replyComposerText");
  const t = i18n[currentLang];
  if (!replyDraft) {
    composer.hidden = true;
    text.textContent = "";
    return;
  }
  composer.hidden = false;
  text.textContent = t.replyTo.replace("{text}", replyDraft.text || "");
  $("cancelReplyBtn").setAttribute("aria-label", t.cancelReply);
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
      if (replyDraft?.id === messageId) clearReplyDraft();
      renderMessages(chat);
      renderChats();
      updateChatCountdown(chat);
    }
    showToast(i18n[currentLang].messageDeleted);
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
  document.querySelectorAll(".message-shell").forEach((shell) => {
    if (shell.dataset.swipeReady) return;
    shell.dataset.swipeReady = "true";
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let longPressTimer = null;
    let longPressMoved = false;
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
      const rawDeltaX = event.touches[0].clientX - startX;
      const rawDeltaY = event.touches[0].clientY - startY;
      if (Math.abs(rawDeltaX) > 8 || Math.abs(rawDeltaY) > 8) {
        longPressMoved = true;
        window.clearTimeout(longPressTimer);
      }
      deltaX = Math.max(-SWIPE_DELETE_THRESHOLD, Math.min(SWIPE_DELETE_THRESHOLD, rawDeltaX));
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

function openMessageActions(messageId) {
  const message = findMessageById(messageId);
  if (!message) return;
  activeActionMessageId = messageId;
  $("messageActions").hidden = false;
  $("messageActionsTitle").textContent = i18n[currentLang].messageActions;
  $("replyActionBtn").textContent = i18n[currentLang].reply;
  $("copyMessageBtn").textContent = i18n[currentLang].copyMessage;
  $("burnMessageNowBtn").textContent = i18n[currentLang].burnNow;
  vibrate(10);
}

function closeMessageActions() {
  activeActionMessageId = "";
  $("messageActions").hidden = true;
}

function getActiveActionMessage() {
  return activeActionMessageId ? findMessageById(activeActionMessageId) : null;
}

async function copyActiveMessage() {
  const message = getActiveActionMessage();
  if (!message?.text) return;
  await navigator.clipboard?.writeText(message.text);
  closeMessageActions();
  showToast(i18n[currentLang].copiedMessage);
}

function replyToActiveMessage() {
  const message = getActiveActionMessage();
  if (message) setReplyDraft(message);
  closeMessageActions();
}

function burnActiveMessageNow() {
  const message = getActiveActionMessage();
  closeMessageActions();
  if (message) expireMessage(message.id, { swipe: true });
}

function addReactionToActiveMessage(reaction) {
  const message = getActiveActionMessage();
  if (!message) return;
  message.reaction = reaction;
  closeMessageActions();
  renderMessages(getChat(activeConversationId || $("chatView")?.dataset.activeChat));
  showToast(i18n[currentLang].reactionAdded);
}

function openMediaSheet() {
  $("mediaSheet").hidden = false;
}

function closeMediaSheet() {
  $("mediaSheet").hidden = true;
}

async function sendGifMessage(gif) {
  const conversationId = $("chatView").dataset.activeChat;
  if (!conversationId) return;
  const text = `${gif} ${gif} ${gif}`;
  if (isLiveMode() && isUuid(conversationId)) {
    await sendMessage(conversationId, text, { privacyMode, messageType: "gif" });
    closeMediaSheet();
    showToast(i18n[currentLang].gifSent);
    return;
  }
  appendDemoMessage(conversationId, {
    type: "outgoing",
    text,
    time: i18n[currentLang].now,
    messageType: "gif",
    privacyMode,
    expiresAt: new Date(Date.now() + getPrivacyConfig(privacyMode).seconds * 1000).toISOString()
  });
  closeMediaSheet();
  showToast(i18n[currentLang].gifSent);
}

function startVoiceRecording() {
  if ($("chatView").hidden || voiceRecording) return;
  voiceRecording = { startedAt: Date.now() };
  $("voiceBtn").classList.add("recording");
  $("voiceBtn").textContent = "■";
  showToast(i18n[currentLang].voiceRecording);
  vibrate(15);
}

async function finishVoiceRecording(cancel = false) {
  if (!voiceRecording) return;
  const startedAt = voiceRecording.startedAt;
  voiceRecording = null;
  $("voiceBtn").classList.remove("recording");
  $("voiceBtn").textContent = "●";
  if (cancel) return;

  const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  const conversationId = $("chatView").dataset.activeChat;
  const duration = `0:${String(seconds).padStart(2, "0")}`;
  if (isLiveMode() && isUuid(conversationId)) {
    await sendMessage(conversationId, duration, { privacyMode, messageType: "voice" });
    showToast(i18n[currentLang].voiceSent);
    return;
  }
  appendDemoMessage(conversationId, {
    type: "outgoing",
    text: duration,
    time: i18n[currentLang].now,
    messageType: "voice",
    privacyMode,
    expiresAt: new Date(Date.now() + getPrivacyConfig(privacyMode).seconds * 1000).toISOString()
  });
  showToast(i18n[currentLang].voiceSent);
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
  $("messageForm").hidden = false;
  document.querySelector(".chat-privacy-bar").hidden = false;
  privacyMode = chat.privacyMode || "5h";
  $("privacyModeSelect").value = privacyMode;
  window.location.hash = `#chat/${encodeURIComponent(chat.id)}`;

  if (chat.burned || chat.status === "expired") {
    renderConversationState("expired");
    return;
  }

  if (chat.status === "blocked") {
    renderConversationState("blocked");
    return;
  }

  try {
    await loadConversation(chat.id);
  } catch (error) {
    handleAsyncError(error, i18n[currentLang].errorChats);
  }
}

function renderConversationState(state) {
  const t = i18n[currentLang];
  const isBlocked = state === "blocked";
  $("chatViewStatus").textContent = isBlocked ? t.blockedStateTitle : t.expiredStateTitle;
  $("messageForm").hidden = true;
  document.querySelector(".chat-privacy-bar").hidden = true;
  $("messagesList").innerHTML = `
    <div class="conversation-state ${isBlocked ? "blocked" : "expired"}">
      <div class="conversation-state-icon" aria-hidden="true">${isBlocked ? "!" : "27"}</div>
      <h3>${escapeHtml(isBlocked ? t.blockedStateTitle : t.expiredStateTitle)}</h3>
      <p>${escapeHtml(isBlocked ? t.blockedStateBody : t.expiredStateBody)}</p>
    </div>
  `;
}

function showHome() {
  stopChatCountdown();
  $("heroSection").hidden = false;
  document.querySelector(".section-divider").hidden = false;
  $("chatsSection").hidden = false;
  $("chatView").hidden = true;
  $("settingsView").hidden = true;
}

async function closeChat() {
  const chat = getChat(activeConversationId);
  if (chat?.privacyMode === "close" && chats.some((item) => item.id === chat.id)) {
    if (isLiveMode() && isUuid(chat.id)) {
      await db.from("messages").delete().eq("conversation_id", chat.id);
    } else {
      chat.messages = { neutral: [] };
    }
    chat.burned = true;
    burnedChats.unshift({ ...chat, burned: true });
    chats = chats.filter((item) => item.id !== chat.id);
  }
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
  $("askActionTitle").textContent = t.askActionTitle;
  $("askActionHint").textContent = t.askActionHint;
  $("roomActionTitle").textContent = t.roomActionTitle;
  $("roomActionHint").textContent = t.roomActionHint;
  $("copyShareLinkBtn").textContent = t.copy;
  if (!$("shareDrop").hidden) {
    $("shareDropKicker").textContent = t.shareReady;
  }
  if (!$("entryCard").hidden) {
    showEntryCard(entryMode || "ask", $("entryCard").dataset.token || "");
  }
  $("chatsHeader").textContent = t.chatsHeader;
  if ($("emptyText")) $("emptyText").textContent = t.emptyText;
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
  $("hideChatsLabel").textContent = t.hideChats;
  $("hideChatsHint").textContent = t.hideChatsHint;
  $("shareQrBtn").textContent = t.shareQr;
  $("codeVisibilityLabel").textContent = currentProfile?.code_visible === false ? t.showCode : t.hideCode;
  $("codeVisibilityHint").textContent = t.hideCodeHint;
  $("regenerateCodeBtn").textContent = t.regenerateCode;
  $("deleteAllBtn").textContent = t.deleteAll;
  $("blockChatBtn").textContent = t.block;
  $("copyLinkBtn").textContent = t.copyMyLink;
  $("privacyModeLabel").textContent = t.privacyModeLabel;
  $("privacyModeSelect").options[0].textContent = t.privacy10s;
  $("privacyModeSelect").options[1].textContent = t.privacy5m;
  $("privacyModeSelect").options[2].textContent = t.privacy1h;
  $("privacyModeSelect").options[3].textContent = t.privacy5h;
  $("privacyModeSelect").options[4].textContent = t.privacyClose;
  $("burnToggle").setAttribute("aria-label", t.burnToggle);
  $("burnToggle").title = t.burnToggle;
  $("hiddenToggle").setAttribute("aria-label", t.hiddenToggle);
  $("hiddenToggle").title = t.hiddenToggle;
  $("voiceBtn").setAttribute("aria-label", t.voiceHold);
  $("voiceBtn").title = t.voiceHold;
  $("mediaSheetTitle").textContent = t.mediaSheetTitle;
  $("pickMediaBtn").textContent = t.pickMedia;
  $("qrModalTitle").textContent = t.qrTitle;
  $("copyQrCodeBtn").textContent = t.copyNumber;
  $("closeQrModal").setAttribute("aria-label", t.close);
  $("fakeNotesTitle").textContent = t.fakeNotesTitle;
  $("cancelReplyBtn").setAttribute("aria-label", t.cancelReply);
  $("messageActionsTitle").textContent = t.messageActions;
  $("replyActionBtn").textContent = t.reply;
  $("copyMessageBtn").textContent = t.copyMessage;
  $("burnMessageNowBtn").textContent = t.burnNow;
  updateSettingsToggles();
  updateReplyComposer();

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
    updatePrivacyModeUI();
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

    if (text) await sendMessage(conversationId, text, { privacyMode, replyTo: replyDraft, hidden: hiddenMode });
    input.value = "";
    mediaInput.value = "";
    clearReplyDraft();
    setHiddenMode(false);
    if (privacyMode === "10s_read") setBurnMode(false);
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
  privacyMode = enabled ? "10s_read" : ($("privacyModeSelect").value === "10s_read" ? "5h" : $("privacyModeSelect").value);
  $("privacyModeSelect").value = privacyMode;
  updatePrivacyModeUI();
}

function updatePrivacyModeUI() {
  const isBurn = privacyMode === "10s_read";
  $("burnToggle").classList.toggle("active", isBurn);
  $("messageInput").classList.toggle("burn-active", isBurn);
  $("burnToggle").setAttribute("aria-pressed", String(isBurn));
  $("privacyModeLabel").textContent = i18n[currentLang].privacyModeLabel;
}

function updateSettingsToggles() {
  const hideChatsButton = $("panicModeBtn");
  hideChatsButton.classList.toggle("is-on", chatsHidden);
  hideChatsButton.setAttribute("aria-checked", String(chatsHidden));

  const hideCodeActive = currentProfile?.code_visible === false;
  const codeButton = $("toggleCodeBtn");
  codeButton.classList.toggle("is-on", hideCodeActive);
  codeButton.setAttribute("aria-checked", String(hideCodeActive));
}

function toggleChatsHidden() {
  chatsHidden = !chatsHidden;
  localStorage.setItem(HIDE_CHATS_STORAGE_KEY, chatsHidden ? "1" : "0");
  updateSettingsToggles();
  renderChats();
}

function setHiddenMode(enabled) {
  hiddenMode = enabled;
  $("hiddenToggle").classList.toggle("active", hiddenMode);
  $("messageInput").classList.toggle("hidden-active", hiddenMode);
  $("hiddenToggle").setAttribute("aria-pressed", String(hiddenMode));
  if (enabled) showToast(i18n[currentLang].hiddenActive);
}

async function changePrivacyMode(mode) {
  privacyMode = mode;
  updatePrivacyModeUI();
  const chat = getChat($("chatView").dataset.activeChat);
  if (chat) chat.privacyMode = mode;
  if (isLiveMode() && chat?.id && isUuid(chat.id)) {
    const { error } = await db.from("conversations").update({ privacy_mode: mode }).eq("id", chat.id);
    if (error) console.warn(error);
  }
}

function setPanicMode(enabled) {
  panicMode = enabled;
  $("panicScreen").hidden = !panicMode;
  document.body.classList.toggle("panic-active", panicMode);
}

function resetIdleLock() {
  window.clearTimeout(idleLockTimer);
  idleLockTimer = window.setTimeout(() => {
    if (!$("chatView").hidden) setPanicMode(true);
  }, 60000);
}

async function openQrModal() {
  if (currentProfile?.code_visible === false) return;
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

async function openRouteFromHash() {
  const route = window.location.hash.replace("#", "");
  if (route.startsWith("chat/")) {
    const chatId = decodeURIComponent(route.slice(5));
    if (!getChat(chatId) && demoChats.some((chat) => chat.id === chatId)) {
      chats.unshift(demoChats.find((chat) => chat.id === chatId));
      renderChats();
    }
    await openChat(chatId);
    return;
  }
  if (route === "settings") openSettings();
}

function closeQrModal() {
  qrModalOpen = false;
  $("qrModal").hidden = true;
}

function subscribeToRequests() {
  if (!isLiveMode() || requestsSubscription) return;
  requestsSubscription = db
    .channel(`requests:${currentProfile.id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "conversation_requests" },
      async () => {
        await loadConversationRequests();
        renderChats();
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        db.removeChannel(requestsSubscription).catch(() => {});
        requestsSubscription = null;
      }
    });
}

async function toggleCodeVisibility() {
  if (!isLiveMode() || !currentProfile) return;
  const nextVisible = currentProfile.code_visible === false;
  currentProfile = { ...currentProfile, code_visible: nextVisible };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
  updateProfileCodeUI();
  updateSettingsToggles();
  const { data, error } = await db
    .from("profiles")
    .update({ code_visible: nextVisible })
    .eq("id", currentProfile.id)
    .select("*")
    .single();
  if (error && !isMissingRelationError(error)) throw error;
  currentProfile = error ? currentProfile : data;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
  updateProfileCodeUI();
  updateSettingsToggles();
  setLanguage(currentLang);
}

async function regenerateCode() {
  if (!isLiveMode() || !currentProfile) return;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const publicCode = randomPublicCode();
    const { data, error } = await db
      .from("profiles")
      .update({ public_code: publicCode, code_visible: true })
      .eq("id", currentProfile.id)
      .select("*")
      .single();
    if (!error || isMissingRelationError(error)) {
      if (error) {
        const fallback = await db
          .from("profiles")
          .update({ public_code: publicCode })
          .eq("id", currentProfile.id)
          .select("*")
          .single();
        if (fallback.error) {
          if (fallback.error.code !== "23505") throw fallback.error;
          continue;
        }
        currentProfile = { ...fallback.data, code_visible: true };
      } else {
        currentProfile = data;
      }
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
      updateProfileCodeUI();
      updateSettingsToggles();
      setLanguage(currentLang);
      showToast(i18n[currentLang].codeRegenerated);
      return;
    }
    if (error.code !== "23505") throw error;
  }
}

async function deleteAllConversationsNow() {
  if (!isLiveMode() || !currentProfile) {
    chats = [];
    renderChats();
    showHome();
    return;
  }
  const { error } = await db
    .from("conversations")
    .delete()
    .or(`user_a_id.eq.${currentProfile.id},user_b_id.eq.${currentProfile.id}`);
  if (error) throw error;
  chats = [];
  burnedChats = [];
  blockedChats = [];
  renderChats();
  showHome();
  showToast(i18n[currentLang].deletedAll);
}

async function blockActiveChat() {
  const chat = getChat($("chatView").dataset.activeChat);
  const otherId = chat?.otherProfile?.id;
  if (!otherId || !isLiveMode()) return;
  const { error } = await db
    .from("blocked_profiles")
    .upsert({ blocker_id: currentProfile.id, blocked_id: otherId });
  if (error) throw error;
  await db.from("conversations").update({ status: "blocked" }).eq("id", chat.id);
  chats = chats.filter((item) => item.id !== chat.id);
  blockedChats.unshift({ ...chat, status: "blocked", online: false });
  await closeChat();
  renderChats();
  showToast(i18n[currentLang].blocked);
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
  const sharedCode = new URLSearchParams(window.location.search).get("code");
  if (sharedCode && /^\d{6}$/.test(sharedCode)) $("codeInput").value = sharedCode;
  handleTemporaryEntryParams();

  if (!db) {
    setLoading("", false);
    await loadConversationRequests();
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
    subscribeToRequests();
    setLanguage(currentLang);

    await openRouteFromHash();
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
$("copyLinkBtn").addEventListener("click", copyProfileLink);
$("createAskLinkBtn").addEventListener("click", () => showShareDrop("ask").catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("createRoomLinkBtn").addEventListener("click", () => showShareDrop("room").catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("copyShareLinkBtn").addEventListener("click", copyGeneratedShareLink);
$("entrySendBtn").addEventListener("click", () => submitTemporaryEntry().catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("profileQrBtn").addEventListener("click", openQrModal);
$("panicModeBtn").addEventListener("click", toggleChatsHidden);
$("shareQrBtn").addEventListener("click", openQrModal);
$("toggleCodeBtn").addEventListener("click", () => toggleCodeVisibility().catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("regenerateCodeBtn").addEventListener("click", () => regenerateCode().catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("deleteAllBtn").addEventListener("click", () => deleteAllConversationsNow().catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("blockChatBtn").addEventListener("click", () => blockActiveChat().catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("closeQrModal").addEventListener("click", closeQrModal);
$("qrBackdrop").addEventListener("click", closeQrModal);
$("copyQrCodeBtn").addEventListener("click", copyProfileCode);
$("cancelReplyBtn").addEventListener("click", clearReplyDraft);
$("burnToggle").addEventListener("click", () => setBurnMode(privacyMode !== "10s_read"));
$("hiddenToggle").addEventListener("click", () => setHiddenMode(!hiddenMode));
$("attachBtn").addEventListener("click", openMediaSheet);
$("privacyModeSelect").addEventListener("change", (event) => {
  changePrivacyMode(event.target.value).catch((error) => handleAsyncError(error, i18n[currentLang].errorChats));
});
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
  const requestItem = event.target.closest(".request-item");
  if (requestItem) {
    const requestId = requestItem.dataset.requestId;
    if (event.target.closest(".accept-request")) {
      acceptConversationRequest(requestId).catch((error) => handleAsyncError(error, i18n[currentLang].errorChats));
      return;
    }
    if (event.target.closest(".reject-request")) {
      rejectConversationRequest(requestId).catch((error) => handleAsyncError(error, i18n[currentLang].errorChats));
      return;
    }
    if (event.target.closest(".reject-block-request")) {
      rejectConversationRequest(requestId, true).catch((error) => handleAsyncError(error, i18n[currentLang].errorChats));
      return;
    }
  }

  const expiringStrip = event.target.closest(".expiring-strip");
  if (expiringStrip) {
    openChat(expiringStrip.dataset.chatId);
    return;
  }

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

$("backToChats").addEventListener("click", () => closeChat().catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("messageForm").addEventListener("submit", handleSendMessage);
$("messageInput").addEventListener("input", handleComposerTyping);
$("mediaInput").addEventListener("change", () => {
  if ($("mediaInput").files?.length) $("messageForm").requestSubmit();
});
$("mediaSheetBackdrop").addEventListener("click", closeMediaSheet);
$("pickMediaBtn").addEventListener("click", () => {
  closeMediaSheet();
  $("mediaInput").click();
});
document.querySelectorAll(".gif-choice").forEach((button) => {
  button.addEventListener("click", () => sendGifMessage(button.dataset.gif).catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
});
$("voiceBtn").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  startVoiceRecording();
});
$("voiceBtn").addEventListener("pointerup", () => finishVoiceRecording(false).catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("voiceBtn").addEventListener("pointerleave", () => finishVoiceRecording(true).catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("voiceBtn").addEventListener("pointercancel", () => finishVoiceRecording(true).catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("messageActionsBackdrop").addEventListener("click", closeMessageActions);
$("replyActionBtn").addEventListener("click", replyToActiveMessage);
$("copyMessageBtn").addEventListener("click", () => copyActiveMessage().catch((error) => handleAsyncError(error, i18n[currentLang].errorChats)));
$("burnMessageNowBtn").addEventListener("click", burnActiveMessageNow);
$("messageActions").addEventListener("click", (event) => {
  const reactionButton = event.target.closest("[data-reaction]");
  if (!reactionButton) return;
  addReactionToActiveMessage(reactionButton.dataset.reaction);
});

["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
  document.addEventListener(eventName, resetIdleLock, { passive: true });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && !$("chatView").hidden) setPanicMode(true);
});

window.addEventListener("blur", () => {
  if (!$("chatView").hidden) setPanicMode(true);
});

window.addEventListener("hashchange", () => {
  openRouteFromHash().catch((error) => handleAsyncError(error, i18n[currentLang].errorChats));
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
    moveExpiredChatsToBurned();
    renderChats();
    if (before !== chats.length) showToast(i18n[currentLang].expired);
  } catch (error) {
    console.warn(error);
  }
}, 60000);

startOnboarding(() => boot());
