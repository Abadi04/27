"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  Clock3,
  Home,
  Hourglass,
  Languages,
  Lock,
  MessageCircle,
  Send,
  Settings,
  Shield,
  TimerReset,
  Volume2,
  VolumeX,
  Wifi,
  X,
} from "lucide-react";

const MESSAGE_TTL_SECONDS = 5 * 60 * 60;
const ACCESS_CODE_TTL_SECONDS = 60 * 60;

const aliasWords = {
  left: ["Velvet", "Cipher", "Ghost", "Nova", "Obsidian", "Echo", "Midnight"],
  right: ["Signal", "Drift", "Orbit", "Whisper", "Key", "Pulse", "Comet"],
};

const seededMessages = [
  {
    id: 1,
    from: "them",
    alias: "Cipher Signal",
    text: "Access code accepted. Veil is now sealed for this private session.",
    textAr: "تم قبول كود الدخول. Veil مغلقة الآن لهذه الجلسة الخاصة.",
    createdAt: Date.now() - 155000,
    timer: MESSAGE_TTL_SECONDS,
    status: "read",
  },
  {
    id: 2,
    from: "me",
    alias: "Velvet Orbit",
    text: "Every message is private by default and automatically deletes after 5 hours.",
    textAr: "كل رسالة خاصة افتراضياً وتُحذف تلقائياً بعد 5 ساعات.",
    createdAt: Date.now() - 72000,
    timer: MESSAGE_TTL_SECONDS,
    status: "read",
  },
  {
    id: 3,
    from: "them",
    alias: "Cipher Signal",
    text: "The hourly code keeps room access temporary. Share it only with the person you trust.",
    textAr: "الكود المتجدد كل ساعة يجعل دخول الغرفة مؤقتاً. شاركه فقط مع من تثق به.",
    createdAt: Date.now() - 18000,
    timer: MESSAGE_TTL_SECONDS,
    status: "delivered",
  },
];

const translations = {
  en: {
    accessCode: "Access code",
    accessCodeAccepted: "Access code saved. Room access rotates hourly.",
    accessCodeHint: "Use this rotating numeric code to enter Veil. It refreshes every hour.",
    accessCodePlaceholder: "6-digit code",
    accessCodeRefreshesIn: "Code refreshes in",
    active: "Active",
    anonymousSession: "anonymous session",
    automaticDeletion: "Automatic deletion",
    automaticDeletionDescription: "Every message is deleted after exactly 5 hours.",
    cipherJoined: "Veil access code is active",
    confidentiality: "Confidentiality",
    confidentialityDescription: "Sealed message bubbles, anonymous aliases, and expiry metadata keep the room focused on secrecy.",
    controls: "Controls",
    codeShort: "Code",
    deliveryReceipts: "Delivery receipts",
    deliveryReceiptsDescription: "Show sent, delivered, and read states inline.",
    ephemeralVault: "Ephemeral vault",
    firstSecretHint: "Share the hourly numeric code, then send private messages that delete after 5 hours.",
    fixedDeletion: "Deletes after 5h",
    joinedAnonymously: "joined anonymously",
    language: "Language",
    messageExpired: "Message deleted after 5 hours",
    noSecrets: "No secrets yet",
    openAccessCode: "Open access code controls",
    privacyNote: "No permanent invite. Just a rotating number.",
    privateDivider: "Sealed conversation · every message deletes after 5h",
    protectedByCode: "Protected by hourly code:",
    protectedRoom: "Protected access",
    read: "Read",
    refreshesInShort: "Refreshes in",
    reconnectProtection: "Reconnect protection",
    reconnectProtectionDescription: "Exponential backoff utility is ready for realtime transport.",
    room: "Room",
    roomExpiresIn: "Room expires in",
    roomExpiryCountdown: "Room expiry countdown",
    roomExpiryDescription: "Messages self-delete after 5 hours. The numeric access code refreshes every hour.",
    roomKey: "Room access code",
    saveRoomKey: "Save access code",
    secretMessage: "Secret message",
    secretRoom: "Veil",
    secretSent: "Secret sent.",
    secretSentBurn: "Secret sent. It will delete after 5 hours.",
    settings: "Settings",
    soundEffects: "Sound effects",
    soundsOff: "Turn sounds off",
    soundsOn: "Turn sounds on",
    statusActiveSecrets: "private messages",
    timerPrototypeNote: "All room messages use a fixed 5-hour deletion window.",
    vault: "Vault",
    vaultEmpty: "Vault is clean",
    vaultEmptyHint: "Only active Veil messages appear here. Expired secrets are removed from this view.",
    vaultSealed: "sealed",
    vaultSubtitle: "Temporary private messages currently inside Veil.",
    vaultTitle: "Veil vault",
    writeSecret: "Write a secret...",
    on: "On",
    off: "Off",
  },
  ar: {
    accessCode: "كود الدخول",
    accessCodeAccepted: "تم حفظ كود الدخول. يتجدد دخول الغرفة كل ساعة.",
    accessCodeHint: "استخدم هذا الكود الرقمي المتجدد للدخول إلى Veil. يتغير كل ساعة.",
    accessCodePlaceholder: "كود من 6 أرقام",
    accessCodeRefreshesIn: "يتجدد الكود خلال",
    active: "نشطة",
    anonymousSession: "جلسة مجهولة",
    automaticDeletion: "حذف تلقائي",
    automaticDeletionDescription: "كل رسالة تُحذف بعد 5 ساعات بالضبط.",
    cipherJoined: "كود دخول Veil نشط",
    confidentiality: "السرية",
    confidentialityDescription: "فقاعات محكمة، هويات مجهولة، ووقت انتهاء واضح لتعزيز الخصوصية.",
    controls: "التحكم",
    codeShort: "Code",
    deliveryReceipts: "حالات التسليم",
    deliveryReceiptsDescription: "عرض مرسلة، تم التسليم، ومقروءة داخل الرسالة.",
    ephemeralVault: "خزنة مؤقتة",
    firstSecretHint: "شارك الكود الرقمي المتجدد كل ساعة، ثم أرسل رسائل خاصة تُحذف بعد 5 ساعات.",
    fixedDeletion: "تُحذف بعد 5 ساعات",
    joinedAnonymously: "انضم بهوية مجهولة",
    language: "اللغة",
    messageExpired: "حُذفت الرسالة بعد 5 ساعات",
    noSecrets: "لا توجد أسرار بعد",
    openAccessCode: "فتح إعدادات كود الدخول",
    privacyNote: "لا دعوة دائمة. فقط رقم متجدد.",
    privateDivider: "محادثة محكمة · كل رسالة تُحذف بعد 5 ساعات",
    protectedByCode: "محمية بالكود المتجدد:",
    protectedRoom: "دخول محمي",
    read: "مقروءة",
    refreshesInShort: "يتجدد خلال",
    reconnectProtection: "حماية إعادة الاتصال",
    reconnectProtectionDescription: "أداة الرجوع التدريجي جاهزة للاتصال اللحظي.",
    room: "الغرفة",
    roomExpiresIn: "تنتهي الغرفة خلال",
    roomExpiryCountdown: "عدّاد انتهاء الغرفة",
    roomExpiryDescription: "الرسائل تُحذف ذاتياً بعد 5 ساعات، وكود الدخول الرقمي يتجدد كل ساعة.",
    roomKey: "كود دخول الغرفة",
    saveRoomKey: "حفظ كود الدخول",
    secretMessage: "رسالة سرية",
    secretRoom: "Veil",
    secretSent: "تم إرسال السر.",
    secretSentBurn: "تم إرسال السر. سيُحذف بعد 5 ساعات.",
    settings: "الإعدادات",
    soundEffects: "المؤثرات الصوتية",
    soundsOff: "إيقاف الأصوات",
    soundsOn: "تشغيل الأصوات",
    statusActiveSecrets: "رسائل خاصة",
    timerPrototypeNote: "كل رسائل الغرفة تستخدم مدة حذف ثابتة قدرها 5 ساعات.",
    vault: "الخزنة",
    vaultEmpty: "الخزنة نظيفة",
    vaultEmptyHint: "تظهر هنا رسائل Veil النشطة فقط. الأسرار المنتهية تُزال من هذا العرض.",
    vaultSealed: "محكمة",
    vaultSubtitle: "الرسائل الخاصة المؤقتة الموجودة حالياً داخل Veil.",
    vaultTitle: "خزنة Veil",
    writeSecret: "اكتب سراً...",
    on: "مفعّل",
    off: "متوقف",
  },
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function formatDuration(seconds) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  if (hours) return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  if (minutes) return `${minutes}:${String(rest).padStart(2, "0")}`;
  return `${rest}s`;
}

function currentAccessCodeSeed(now = Date.now()) {
  return Math.floor(now / (ACCESS_CODE_TTL_SECONDS * 1000));
}

function generateAccessCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function secondsUntilAccessCodeRefresh(now = Date.now()) {
  return ACCESS_CODE_TTL_SECONDS - Math.floor((now % (ACCESS_CODE_TTL_SECONDS * 1000)) / 1000);
}

function createIdentity(seed = Date.now()) {
  const left = aliasWords.left[seed % aliasWords.left.length];
  const right = aliasWords.right[Math.floor(seed / 3) % aliasWords.right.length];
  const gradients = [
    "linear-gradient(135deg, #7B61FF, #00D4FF)",
    "linear-gradient(135deg, #9B80FF, #FF4D6D)",
    "linear-gradient(135deg, #00D4FF, #7B61FF)",
    "linear-gradient(135deg, #FF4D6D, #9B80FF)",
    "linear-gradient(135deg, #7B61FF, #9B80FF)",
  ];
  return {
    alias: `${left} ${right}`,
    icon: ["◇", "✦", "◐", "✧", "⌁"][seed % 5],
    gradient: gradients[seed % gradients.length],
  };
}

function StatusIcon({ status }) {
  if (status === "read") return <CheckCheck size={14} className="text-cyan-300" />;
  if (status === "delivered") return <CheckCheck size={14} className="text-white/58" />;
  return <Check size={14} className="text-white/48" />;
}

function ToastStack({ toasts, dismiss }) {
  return (
    <div className="fixed inset-x-3 top-[calc(78px+env(safe-area-inset-top))] z-[80] mx-auto grid max-w-sm gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismiss(toast.id)}
          className={classNames(
            "min-h-11 rounded-[18px] border px-4 py-3 text-left text-sm font-bold shadow-[0_22px_70px_rgba(0,0,0,.38)] backdrop-blur-2xl transition active:scale-[.98]",
            toast.tone === "danger"
              ? "border-[#ff4d6d]/35 bg-[#3b111c]/88 text-[#ffd8df]"
              : "border-white/15 bg-[#151528]/88 text-white"
          )}
          data-refero-pattern="Pitch toast d53f76e0: compact elevated notification over app shell"
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}

function EmptyIllustration() {
  return (
    <div
      className="mx-auto grid h-28 w-28 place-items-center rounded-[28px] border border-white/10 bg-white/[.05] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]"
      data-refero-pattern="Cosmos empty state 43c8ab95: centered symbolic empty marker on dark canvas"
    >
      <svg width="74" height="74" viewBox="0 0 74 74" fill="none" aria-hidden="true">
        <rect x="14" y="18" width="46" height="36" rx="14" fill="url(#emptyGrad)" opacity=".9" />
        <path d="M25 34h24M25 42h15" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".85" />
        <path d="M22 19 17 11M52 19l5-8" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" />
        <defs>
          <linearGradient id="emptyGrad" x1="14" x2="62" y1="18" y2="56">
            <stop stopColor="#7B61FF" />
            <stop offset="1" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function SkeletonMessages() {
  return (
    <div className="grid gap-4 px-4 py-6">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className={classNames("skeleton-line h-20 rounded-[22px]", item === 1 ? "ml-auto w-[74%]" : "w-[82%]")}
          data-refero-pattern="iOS dark loading skeleton from Refero search: rounded message placeholders replace spinners"
        />
      ))}
    </div>
  );
}

function MessageBubble({ message, now, onRead, t, lang, grouped }) {
  const remaining = message.timer - Math.floor((now - message.createdAt) / 1000);
  const mine = message.from === "me";

  useEffect(() => {
    if (remaining > 0 || message.expired) return;
    onRead(message.id);
  }, [message.expired, message.id, onRead, remaining]);

  if (message.expired || remaining <= 0) {
    return (
      <div className={classNames("message-enter flex", mine ? "justify-end" : "justify-start", grouped && "-mt-1")}>
        <div
          className="burn-card max-w-[82%] rounded-[18px] border border-[#ff4d6d]/35 bg-[#ff4d6d]/10 px-4 py-3 text-sm font-bold text-[#ffd5dc]"
          data-refero-pattern="Pitch delete confirmation d401fae7: danger feedback stays focused and compact"
        >
          {t.messageExpired}
        </div>
      </div>
    );
  }

  return (
    <article
      className={classNames("message-enter flex", mine ? "justify-end" : "justify-start", grouped && "-mt-1")}
      data-refero-pattern={
        mine
          ? "ChatGPT iOS 4ad4f27f and Otto chat 0a903b60: right aligned sent bubble with status metadata"
          : "Otto iOS group chat 0a903b60: left aligned incoming bubble on dark room canvas"
      }
    >
      <div
        className={classNames(
          "max-w-[88%] rounded-[18px] px-4 py-3 shadow-[0_14px_38px_rgba(0,0,0,.25)] sm:max-w-[70%]",
          mine
            ? "rounded-br-[4px] bg-gradient-to-br from-[#6251EA] to-[#8E73FF] text-white shadow-[0_0_30px_rgba(123,97,255,.18)]"
            : "rounded-bl-[4px] border border-white/10 bg-[#141424]/78 text-white shadow-[0_0_28px_rgba(0,212,255,.08)] backdrop-blur-xl"
        )}
      >
        {!grouped && <div className="mb-1.5 text-[12px] font-black text-white/66">{message.alias}</div>}
        <p className="text-[clamp(15px,3.5vw,16px)] leading-6 text-white/94">{lang === "ar" && message.textAr ? message.textAr : message.text}</p>
        <div className="mt-2 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-[12px] font-bold text-white/50">
          {mine && <StatusIcon status={message.status} />}
          <span className="inline-flex items-center gap-1 font-mono">
            <Clock3 size={12} />
            {formatDuration(remaining)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t.fixedDeletion}</span>
        </div>
      </div>
    </article>
  );
}

function TypingIndicator() {
  return (
    <div className="message-enter flex items-center gap-3 px-1" data-refero-pattern="Chat app typing indicator: compact animated dots below thread">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-white/[.08] text-sm">◇</div>
      <div className="typing-dots rounded-full border border-white/10 bg-white/[.07] px-4 py-3">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function AccessCodeBadge({ accessCode, codeRefreshSeconds, t, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 max-h-[60px] min-w-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#7B61FF]/35 bg-[#100f1c]/90 px-2.5 font-mono text-[10px] font-black text-white/78 shadow-[0_0_24px_rgba(123,97,255,.14)] backdrop-blur-xl transition active:scale-95 min-[390px]:text-[11px] sm:px-3 sm:text-[15px]"
      aria-label={t.openAccessCode}
      data-refero-pattern="Telegram dark header 8cc076f0 and Otto chat 0a903b60: compact room metadata pill in top navigation"
    >
      <Lock size={14} className="shrink-0 text-[#9B80FF]" />
      <span className="font-sans text-[10px] font-black uppercase tracking-[.08em] text-white/44 sm:text-[11px]">{t.codeShort}:</span>
      <span className="tracking-[.08em] text-white/86">{accessCode}</span>
      <span className="text-white/28" aria-hidden="true">•</span>
      <span className="font-sans text-[10px] font-bold text-white/48 sm:text-[11px]">{t.refreshesInShort}</span>
      <span className="text-white/60">{formatDuration(codeRefreshSeconds)}</span>
    </button>
  );
}

function Composer({ value, setValue, onSend, t }) {
  return (
    <footer
      className="fixed inset-x-0 bottom-[calc(94px+env(safe-area-inset-bottom))] z-40 border-t border-white/10 bg-[#0A0A0F]/88 pb-3 pt-3 backdrop-blur-2xl lg:absolute lg:bottom-0 lg:pb-[calc(10px+env(safe-area-inset-bottom))]"
      data-refero-pattern="ChatGPT iOS 4ad4f27f: fixed bottom composer above keyboard with safe-area padding"
    >
      <form
        className="mx-auto flex max-w-3xl items-end gap-2 px-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <label className="sr-only" htmlFor="secret-message">
          {t.secretMessage}
        </label>
        <textarea
          id="secret-message"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={1}
          placeholder={t.writeSecret}
          className="max-h-32 min-h-12 flex-1 resize-none rounded-[20px] border border-white/10 bg-white/[.08] px-4 py-3 text-[16px] leading-6 text-white outline-none placeholder:text-white/36 focus:border-[#00D4FF]/60 focus:ring-4 focus:ring-[#00D4FF]/10"
        />
        <button
          type="submit"
          aria-label="Send secret message"
          className="send-pop grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-[#7B61FF] to-[#00D4FF] text-white shadow-[0_16px_45px_rgba(0,212,255,.24)] transition active:scale-90"
        >
          <Send size={20} />
        </button>
      </form>
    </footer>
  );
}

function Header({ accessCode, codeRefreshSeconds, identity, stats, soundOn, setSoundOn, setCodeOpen, lang, setLang, t }) {
  return (
    <header
      className="sticky top-0 z-30 max-h-[80px] border-b border-white/10 bg-[#0A0A0F]/82 px-4 pb-2 pt-[calc(8px+env(safe-area-inset-top))] backdrop-blur-2xl"
      data-refero-pattern="Telegram dark chat 8cc076f0 and ChatGPT iOS 4ad4f27f: compressed safe-area chat header with utility metadata"
    >
      <div className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 max-w-[70px] items-center gap-2.5 min-[390px]:max-w-[78px] sm:max-w-none">
          <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-[14px] text-base font-black text-white shadow-[0_0_26px_rgba(123,97,255,.28)] sm:grid" style={{ background: identity.gradient }}>
            {identity.icon}
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-baseline gap-2">
              <h1 className="truncate text-[clamp(17px,4vw,20px)] font-black leading-tight text-white">{t.secretRoom}</h1>
              <span className="hidden text-[11px] font-bold text-white/38 sm:inline">{stats.active} {t.statusActiveSecrets}</span>
            </div>
            <p className="truncate text-[11px] font-bold text-white/45">{identity.alias} · {stats.read} {t.read}</p>
          </div>
        </div>
        <div className="flex min-w-0 shrink-0 items-center gap-1.5">
          <AccessCodeBadge accessCode={accessCode} codeRefreshSeconds={codeRefreshSeconds} t={t} onClick={() => setCodeOpen(true)} />
          <button
            type="button"
            className="hidden h-10 min-w-10 items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 text-xs font-black text-white/60 lg:inline-flex"
            aria-label={t.roomExpiryCountdown}
          >
            <Hourglass size={15} />
            5h
          </button>
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-[14px] border border-white/10 bg-white/[.06] px-2 text-[11px] font-black text-white/66 transition active:scale-95"
            aria-label={t.language}
            data-refero-pattern="Language selection 556c6601: compact language control in dark navigation"
          >
            <Languages size={15} />
            <span className="sr-only">{lang === "ar" ? "EN" : "ع"}</span>
          </button>
          <button
            type="button"
            onClick={() => setSoundOn(!soundOn)}
            className="hidden h-10 w-10 place-items-center rounded-[14px] border border-white/10 bg-white/[.06] text-white/66 transition active:scale-95 sm:grid"
            aria-label={soundOn ? t.soundsOff : t.soundsOn}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ identity, active, setActive, accessCode, codeRefreshSeconds, t }) {
  const items = [
    ["room", t.room, MessageCircle],
    ["vault", t.vault, Shield],
    ["settings", t.controls, Settings],
  ];

  return (
    <aside
      className="hidden min-h-screen w-[292px] shrink-0 border-r border-white/10 bg-white/[.045] p-4 backdrop-blur-2xl lg:block"
      data-refero-pattern="Weavy 65ddeef9 and X web DM 774c6adf: dark desktop sidebar with stacked navigation"
    >
      <div className="mb-6 rounded-[22px] border border-white/10 bg-[#111120]/72 p-4">
        <div className="mb-4 h-24 rounded-[20px] bg-[radial-gradient(circle_at_25%_20%,rgba(0,212,255,.42),transparent_34%),radial-gradient(circle_at_72%_60%,rgba(123,97,255,.52),transparent_38%),#0D0D1A]" />
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[16px] text-white" style={{ background: identity.gradient }}>
            {identity.icon}
          </div>
          <div>
            <p className="text-sm font-black text-white">{identity.alias}</p>
            <p className="text-xs text-white/45">{t.anonymousSession}</p>
          </div>
        </div>
      </div>
      <nav className="grid gap-2">
        {items.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={classNames(
              "flex min-h-12 items-center gap-3 rounded-[16px] px-3 text-sm font-black transition",
              active === id ? "bg-white text-[#0A0A0F]" : "text-white/62 hover:bg-white/[.06] hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-6 rounded-[20px] border border-[#00D4FF]/20 bg-[#00D4FF]/10 p-4 text-sm text-[#c8f7ff]">
        <div className="mb-2 flex items-center gap-2 font-black">
          <TimerReset size={16} />
          {t.accessCodeRefreshesIn} {formatDuration(codeRefreshSeconds)}
        </div>
        <p className="mb-2 font-mono text-2xl font-black tracking-[.2em] text-white">{accessCode}</p>
        <p className="text-xs leading-5 text-white/52">{t.roomExpiryDescription}</p>
      </div>
    </aside>
  );
}

function BottomNav({ active, setActive, t }) {
  const items = [
    ["room", t.room, Home],
    ["vault", t.vault, Shield],
    ["settings", t.settings, Settings],
  ];

  return (
    <nav
      className="fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-50 grid grid-cols-3 rounded-[24px] border border-white/10 bg-[#111120]/86 p-2 shadow-[0_24px_80px_rgba(0,0,0,.46)] backdrop-blur-2xl lg:hidden"
      data-refero-pattern="Refero iOS tabbar c16d9659: bottom nav with icon and label, safe-area aware"
      aria-label="Primary"
    >
      {items.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          onClick={() => setActive(id)}
          className={classNames(
            "grid min-h-14 place-items-center rounded-[18px] text-[11px] font-black transition active:scale-95",
            active === id ? "bg-[#7B61FF]/22 text-white shadow-[0_0_28px_rgba(123,97,255,.26)]" : "text-white/48"
          )}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </nav>
  );
}

function AccessCodeModal({ open, onClose, accessCode, codeRefreshSeconds, toast, t }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/62 px-4 py-[calc(18px+env(safe-area-inset-top))] backdrop-blur-xl"
      data-refero-pattern="Dark select/access sheet 556c6601 and Otto settings af493010: focused protected-room access overlay"
    >
      <section className="w-full max-w-md rounded-[28px] border border-white/12 bg-[#111120]/94 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,.58)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#00D4FF]">{t.protectedRoom}</p>
            <h2 className="mt-1 text-2xl font-black">{t.accessCode}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-[16px] bg-white/[.06]" aria-label="Close access code modal">
            <X size={18} />
          </button>
        </div>
        <div className="mb-4 rounded-[24px] border border-[#00D4FF]/20 bg-[#00D4FF]/10 p-4 text-center">
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#8eefff]">{t.protectedByCode}</p>
          <p className="mt-2 font-mono text-4xl font-black tracking-[.24em] text-white">{accessCode}</p>
          <p className="mt-2 text-xs font-bold text-white/54">{t.accessCodeRefreshesIn} {formatDuration(codeRefreshSeconds)}</p>
        </div>
        <label className="grid gap-2 text-sm font-bold text-white/64">
          {t.accessCode}
          <input
            inputMode="numeric"
            maxLength={7}
            readOnly
            value={accessCode}
            className="min-h-12 rounded-[18px] border border-white/10 bg-white/[.07] px-4 font-mono text-[16px] tracking-[.18em] text-white outline-none focus:border-[#00D4FF]/60 focus:ring-4 focus:ring-[#00D4FF]/10"
            placeholder={t.accessCodePlaceholder}
          />
        </label>
        <p className="mt-3 text-xs leading-5 text-white/50">{t.accessCodeHint}</p>
        <button
          type="button"
          onClick={() => {
            toast(t.accessCodeAccepted, "info");
            onClose();
          }}
          className="mt-5 min-h-12 w-full rounded-[18px] bg-gradient-to-br from-[#7B61FF] to-[#00D4FF] font-black"
        >
          {t.saveRoomKey}
        </button>
      </section>
    </div>
  );
}

function VaultPanel({ messages, now, lang, identity, recipient, t }) {
  const active = messages
    .map((message) => ({
      ...message,
      alias: message.from === "me" ? identity.alias : recipient.alias,
      remaining: message.timer - Math.floor((now - message.createdAt) / 1000),
    }))
    .filter((message) => !message.expired && message.remaining > 0);

  return (
    <section
      className="mx-auto flex min-h-[calc(100svh-65px)] max-w-3xl flex-col gap-4 px-4 pb-32 pt-4 lg:pb-8"
      data-refero-pattern="Telegram dark chat list 56035fd0 and Project Indigo dark settings 82f83573: compact dark list with muted metadata"
    >
      <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#9B80FF]">{t.vaultSealed}</p>
          <h2 className="mt-1 text-[clamp(24px,7vw,34px)] font-black leading-tight text-white">{t.vaultTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-white/48">{t.vaultSubtitle}</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border border-[#7B61FF]/25 bg-[#7B61FF]/12 text-[#d8d0ff] shadow-[0_0_26px_rgba(123,97,255,.16)]">
          <Lock size={22} />
        </div>
      </div>

      {active.length ? (
        <div className="grid gap-2">
          {active.map((message) => {
            const percent = Math.max(0, Math.min(100, (message.remaining / MESSAGE_TTL_SECONDS) * 100));
            return (
              <article
                key={message.id}
                className="rounded-[18px] border border-white/10 bg-[#111120]/68 px-4 py-3 text-white shadow-[0_14px_34px_rgba(0,0,0,.22)]"
                data-refero-pattern="Telegram dark chat list 56035fd0: avatarless message rows use title, preview, and compact status metadata"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#00D4FF] shadow-[0_0_16px_rgba(0,212,255,.5)]" />
                      <h3 className="truncate text-sm font-black text-white">{message.alias}</h3>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-white/78">
                      {lang === "ar" && message.textAr ? message.textAr : message.text}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-black/18 px-2.5 py-1 font-mono text-[12px] font-bold text-white/54">
                    <Clock3 size={12} />
                    {formatDuration(message.remaining)}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.07]" aria-label={t.fixedDeletion}>
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7B61FF]" style={{ width: `${percent}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-[42svh] place-items-center rounded-[24px] border border-white/10 bg-white/[.04] px-6 text-center">
          <div>
            <EmptyIllustration />
            <h3 className="mt-5 text-2xl font-black text-white">{t.vaultEmpty}</h3>
            <p className="mt-2 text-sm leading-6 text-white/48">{t.vaultEmptyHint}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function SettingsPanel({ soundOn, setSoundOn, accessCode, codeRefreshSeconds, lang, setLang, t }) {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-4 pb-32 pt-5 lg:pb-8" data-refero-pattern="iOS settings 82f83573: grouped dark cards with toggles">
      {[
        [t.automaticDeletion, t.automaticDeletionDescription, true, Clock3],
        [t.confidentiality, t.confidentialityDescription, true, Shield],
        [t.deliveryReceipts, t.deliveryReceiptsDescription, true, CheckCheck],
        [t.reconnectProtection, t.reconnectProtectionDescription, true, Wifi],
      ].map(([title, text, enabled, Icon]) => (
        <div key={title} className="flex min-h-20 items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[.055] p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[16px] bg-white/[.07] text-[#00D4FF]">
              <Icon size={18} />
            </span>
            <div>
              <p className="font-black">{title}</p>
              <p className="mt-1 text-xs leading-5 text-white/48">{text}</p>
            </div>
          </div>
          <span className={classNames("relative h-7 w-12 rounded-full", enabled ? "bg-[#7B61FF]" : "bg-white/20")}>
            <span className={classNames("absolute top-1 h-5 w-5 rounded-full bg-white transition", enabled ? "left-6" : "left-1")} />
          </span>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setSoundOn(!soundOn)}
        className="flex min-h-16 items-center justify-between rounded-[22px] border border-white/10 bg-white/[.055] px-4 text-left text-white"
      >
        <span className="font-black">{t.soundEffects}</span>
        <span className="text-sm font-bold text-white/52">{soundOn ? t.on : t.off}</span>
      </button>
      <button
        type="button"
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        className="flex min-h-16 items-center justify-between rounded-[22px] border border-white/10 bg-white/[.055] px-4 text-left text-white"
        data-refero-pattern="Language settings 556c6601: dark language option row with clear selected value"
      >
        <span className="font-black">{t.language}</span>
        <span className="text-sm font-bold text-white/52">{lang === "ar" ? "العربية" : "English"}</span>
      </button>
      <label className="grid gap-2 rounded-[22px] border border-white/10 bg-white/[.055] p-4 text-sm font-bold text-white/62">
        {t.roomKey}
        <input
          inputMode="numeric"
          maxLength={7}
          value={accessCode}
          readOnly
          className="min-h-12 rounded-[18px] border border-white/10 bg-black/18 px-4 font-mono text-[16px] tracking-[.18em] text-white outline-none"
        />
        <span className="text-xs text-white/42">{t.accessCodeRefreshesIn} {formatDuration(codeRefreshSeconds)}</span>
      </label>
    </section>
  );
}

export default function VeilApp() {
  const [active, setActive] = useState("room");
  const [lang, setLang] = useState("en");
  const [langReady, setLangReady] = useState(false);
  const [identity] = useState(() => createIdentity(8242));
  const [recipient] = useState(() => createIdentity(4321));
  const [messages, setMessages] = useState(seededMessages);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(true);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [accessCodeRaw, setAccessCodeRaw] = useState("000000");
  const [codeOpen, setCodeOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [now, setNow] = useState(0);
  const threadRef = useRef(null);
  const accessCodeSeedRef = useRef(null);
  const codeRefreshSeconds = secondsUntilAccessCodeRefresh(now);
  const accessCode = `${accessCodeRaw.slice(0, 3)} ${accessCodeRaw.slice(3)}`;
  const t = translations[lang];
  const isRtl = lang === "ar";

  const toast = (message, tone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, tone }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  };

  const dismissToast = (id) => setToasts((items) => items.filter((item) => item.id !== id));

  useEffect(() => {
    const savedLang = window.localStorage.getItem("veil_lang");
    if (savedLang === "ar" || savedLang === "en") {
      setLang(savedLang);
    }
    setLangReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    window.localStorage.setItem("veil_lang", lang);
  }, [lang, isRtl]);

  useEffect(() => {
    setNow(Date.now());
    const loadingTimeout = window.setTimeout(() => setLoading(false), 650);
    const typingTimeout = window.setTimeout(() => setTyping(false), 3600);
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(loadingTimeout);
      window.clearTimeout(typingTimeout);
      window.clearInterval(ticker);
    };
  }, []);

  useEffect(() => {
    if (langReady) toast(t.cipherJoined);
  }, [langReady]);

  useEffect(() => {
    const seed = currentAccessCodeSeed(now);
    if (accessCodeSeedRef.current === seed) return;
    accessCodeSeedRef.current = seed;
    setAccessCodeRaw(generateAccessCode());
  }, [now]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  const stats = useMemo(
    () => ({
      active: messages.filter((message) => !message.expired).length,
      burned: messages.filter((message) => message.expired).length,
      read: messages.filter((message) => message.status === "read").length,
    }),
    [messages]
  );

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const id = Date.now();
    setMessages((items) => [
      ...items,
      {
        id,
        from: "me",
        alias: identity.alias,
        text,
        createdAt: Date.now(),
        timer: MESSAGE_TTL_SECONDS,
        status: "sent",
      },
    ]);
    setDraft("");
    toast(t.secretSentBurn);
    window.setTimeout(() => setMessages((items) => items.map((item) => (item.id === id ? { ...item, status: "delivered" } : item))), 800);
    window.setTimeout(() => setMessages((items) => items.map((item) => (item.id === id ? { ...item, status: "read" } : item))), 1900);
  };

  const expireMessage = (id) => {
    setMessages((items) => items.map((item) => (item.id === id ? { ...item, expired: true, status: "read" } : item)));
  };

  return (
    <main className="secret-shell min-h-screen overflow-x-hidden bg-[#0A0A0F] text-white" dir={isRtl ? "rtl" : "ltr"}>
      {/* Refero Weavy/Browser starry dark screens: ambient aurora background stays behind all functional surfaces. */}
      <div className="aurora-bg" aria-hidden="true" />
      <div className="relative flex min-h-screen">
        <Sidebar identity={identity} active={active} setActive={setActive} accessCode={accessCode} codeRefreshSeconds={codeRefreshSeconds} t={t} />
        <section className="relative min-w-0 flex-1">
          <Header
            accessCode={accessCode}
            codeRefreshSeconds={codeRefreshSeconds}
            identity={identity}
            stats={stats}
            soundOn={soundOn}
            setSoundOn={setSoundOn}
            setCodeOpen={setCodeOpen}
            lang={lang}
            setLang={setLang}
            t={t}
          />

          {active === "room" && (
            <div className="relative mx-auto flex h-[calc(100svh-69px)] max-w-4xl flex-col lg:h-[calc(100vh-69px)]">
              <div ref={threadRef} data-thread="room-thread" className="min-h-0 flex-1 scroll-smooth overflow-y-auto px-4 pb-44 pt-4 lg:pb-24">
                {loading ? (
                  <SkeletonMessages />
                ) : messages.length ? (
                  <div className="flex flex-col gap-3">
                    <div className="mx-auto mb-1 rounded-full border border-white/10 bg-white/[.045] px-3 py-1.5 text-[11px] font-black text-white/42">
                      <Lock size={13} className="mr-1 inline" />
                      {t.privateDivider}
                    </div>
                    {messages.map((message, index) => {
                      const previous = messages[index - 1];
                      const grouped = previous?.from === message.from && !previous.expired && !message.expired;
                      return (
                        <MessageBubble
                          key={message.id}
                          message={{ ...message, alias: message.from === "me" ? identity.alias : recipient.alias }}
                          now={now}
                          onRead={expireMessage}
                          t={t}
                          lang={lang}
                          grouped={grouped}
                        />
                      );
                    })}
                    {typing && <TypingIndicator />}
                  </div>
                ) : (
                  <section className="grid min-h-[48svh] place-items-center text-center">
                    <div>
                      <EmptyIllustration />
                      <h2 className="mt-5 text-2xl font-black">{t.noSecrets}</h2>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-white/52">{t.firstSecretHint}</p>
                    </div>
                  </section>
                )}
              </div>

              <Composer value={draft} setValue={setDraft} onSend={sendMessage} t={t} />
            </div>
          )}

          {active === "vault" && <VaultPanel messages={messages} now={now} lang={lang} identity={identity} recipient={recipient} t={t} />}
          {active === "settings" && <SettingsPanel soundOn={soundOn} setSoundOn={setSoundOn} accessCode={accessCode} codeRefreshSeconds={codeRefreshSeconds} lang={lang} setLang={setLang} t={t} />}
        </section>
      </div>

      <BottomNav active={active} setActive={setActive} t={t} />
      <AccessCodeModal open={codeOpen} onClose={() => setCodeOpen(false)} accessCode={accessCode} codeRefreshSeconds={codeRefreshSeconds} toast={toast} t={t} />
      <ToastStack toasts={toasts} dismiss={dismissToast} />
    </main>
  );
}
