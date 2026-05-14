"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flag,
  Home,
  Inbox,
  Link as LinkIcon,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Plus,
  QrCode,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  UserX,
  X,
} from "lucide-react";
import { designRules, referoSources } from "../lib/referoResearch";

const messages = [
  {
    id: 1,
    tone: "Kind",
    preview: "Your answers make people feel safe. How do you decide what to reply to?",
    body: "Your answers make people feel safe. How do you decide what to reply to when everything is anonymous?",
    time: "2m",
    unread: true,
    status: "New",
    accent: "mint",
  },
  {
    id: 2,
    tone: "Curious",
    preview: "I have wanted to ask this for a while, but never knew how.",
    body: "I have wanted to ask this for a while, but never knew how. What is something you wish more friends understood about you?",
    time: "18m",
    unread: true,
    status: "Needs reply",
    accent: "pink",
  },
  {
    id: 3,
    tone: "Support",
    preview: "You handled that public reply with a lot of grace.",
    body: "You handled that public reply with a lot of grace. It changed the way I thought about anonymous Q&A.",
    time: "1h",
    unread: false,
    status: "Read",
    accent: "amber",
  },
  {
    id: 4,
    tone: "Filtered",
    preview: "This message was moved to requests until you approve it.",
    body: "This message was moved to requests until you approve it. The sender is not allowed to send repeated notes.",
    time: "3h",
    unread: false,
    status: "Request",
    accent: "ink",
  },
];

const notifications = [
  ["New messages", "Push and in-app", true],
  ["Weekly inbox recap", "Email summary", true],
  ["Profile link scans", "Quiet activity", false],
  ["Safety decisions", "Report updates", true],
];

const settingsRows = [
  ["Who can message", "Everyone with link"],
  ["Message requests", "Filter unknown senders"],
  ["Hidden words", "12 muted phrases"],
  ["Blocked people", "3 accounts"],
];

const navItems = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "share", label: "Share", icon: QrCode },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const accentStyles = {
  mint: "bg-[#DDFBEA] text-[#0B6B3A] ring-[#B9F2D0]",
  pink: "bg-[#FFE2ED] text-[#B11348] ring-[#FFC0D7]",
  amber: "bg-[#FFF1BF] text-[#805A00] ring-[#FFE08A]",
  ink: "bg-[#ECEEF2] text-[#101214] ring-[#D8DCE3]",
  blue: "bg-[#DFF0FF] text-[#075EAB] ring-[#BADEFF]",
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function Avatar({ label = "V", accent = "blue", className = "" }) {
  return (
    <span
      className={classNames(
        "grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black ring-2",
        accentStyles[accent] || accentStyles.blue,
        className
      )}
    >
      {label}
    </span>
  );
}

function IconButton({ label, children, onClick, active = false, className = "" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={classNames(
        "grid h-10 w-10 place-items-center rounded-lg border text-gray-700 transition hover:border-gray-300 hover:bg-white",
        active ? "border-blue-200 bg-blue-50 text-action" : "border-transparent bg-transparent",
        className
      )}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, className = "", variant = "dark", onClick }) {
  const variants = {
    dark: "bg-[#101214] text-white hover:bg-black",
    blue: "bg-action text-white hover:bg-blue-700",
    pink: "bg-premium text-white hover:bg-rose-600",
    light: "border border-line bg-white text-ink hover:border-gray-300",
    glass: "border border-white/20 bg-white/12 text-white hover:bg-white/20",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

function QRMark({ inverted = false, color = "bg-[#101214]" }) {
  const cells = useMemo(
    () =>
      Array.from({ length: 121 }, (_, index) => {
        const row = Math.floor(index / 11);
        const col = index % 11;
        const finder =
          (row < 3 && col < 3) ||
          (row < 3 && col > 7) ||
          (row > 7 && col < 3);
        const fill = finder || (row * 3 + col * 5 + row * col) % 4 === 0 || (row + col) % 7 === 0;
        return fill;
      }),
    []
  );

  return (
    <div
      className={classNames(
        "grid h-36 w-36 grid-cols-11 gap-1 rounded-lg p-3",
        inverted ? "bg-[#101214]" : "border border-gray-200 bg-white"
      )}
      aria-label="Profile QR code preview"
    >
      {cells.map((fill, index) => (
        <span
          key={index}
          className={classNames(
            "rounded-[2px]",
            fill ? color : inverted ? "bg-white/10" : "bg-transparent"
          )}
        />
      ))}
    </div>
  );
}

function ColorPattern({ variant = "hero" }) {
  const variants = {
    hero: "from-[#FF4F8B] via-[#FFD35A] to-[#34D399]",
    share: "from-[#FF4F8B] via-[#FFE45C] to-[#33D6A6]",
    blue: "from-[#33A6FF] via-[#60E6B5] to-[#FFD35A]",
  };

  return (
    <div
      aria-hidden="true"
      className={classNames(
        "absolute inset-0 bg-gradient-to-br opacity-95",
        variants[variant] || variants.hero
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.28)_0_1px,transparent_1px_18px)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,18,20,0.10)_0_1px,transparent_1px_72px)]" />
    </div>
  );
}

function ShareCard({ compact = false }) {
  return (
    <div
      className={classNames(
        "relative overflow-hidden rounded-lg border border-white/30 bg-white shadow-strong",
        compact ? "p-4" : "p-5"
      )}
      data-refero-pattern="Instagram QR Flow 2871 steps 5-7: color/emoji QR card with paired Share and Copy actions"
    >
      <div className="absolute inset-x-0 top-0 h-20 overflow-hidden">
        <ColorPattern variant="share" />
      </div>
      <div className="relative mx-auto grid justify-items-center">
        <div className="mb-3 inline-flex min-h-8 items-center gap-2 rounded-full border border-[#101214]/15 bg-white px-3 text-xs font-black uppercase text-[#101214]">
          Color
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-panel">
          <Avatar label="M" accent="pink" className="mx-auto -mt-8 h-14 w-14 text-lg" />
          <QRMark color="bg-[#FF2D55]" />
          <p className="mt-3 text-center text-sm font-black uppercase text-[#FF2D55]">@MAYA</p>
        </div>
        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <PrimaryButton variant="light" className="px-2">
            <Send size={16} />
            Share
          </PrimaryButton>
          <PrimaryButton variant="light" className="px-2">
            <LinkIcon size={16} />
            Copy
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div
      className="relative mx-auto w-full max-w-[330px] overflow-hidden rounded-[28px] border-[10px] border-[#101214] bg-[#F2F2F7] shadow-strong"
      data-refero-pattern="Telegram iOS Chats 1cd24653: centered title, edit action, search bar, avatar-led rows, unread badges"
    >
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button className="text-sm font-bold text-action" type="button">Edit</button>
        <h3 className="text-base font-black text-[#101214]">Inbox</h3>
        <div className="flex gap-1 text-action">
          <Plus size={19} />
          <MessageCircle size={19} />
        </div>
      </div>
      <div className="bg-[#F2F2F7] px-4 py-3">
        <label className="flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm text-gray-500 ring-1 ring-black/5">
          <Search size={17} />
          Search
        </label>
      </div>
      <div className="bg-white">
        {messages.slice(0, 4).map((message) => (
          <div key={message.id} className="flex gap-3 border-b border-gray-100 px-4 py-3">
            <Avatar label={message.tone.slice(0, 1)} accent={message.accent} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-black text-[#101214]">{message.tone} note</p>
                <span className="text-xs text-gray-500">{message.time}</span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">{message.preview}</p>
            </div>
            {message.unread && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-action" />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 border-t border-gray-100 bg-white px-2 py-2 text-xs font-bold text-gray-500">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <span key={item.id} className={classNames("grid justify-items-center gap-1", item.id === "inbox" && "text-action")}>
              <Icon size={19} />
              {item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function LandingHero({ onOpenAuth, onOpenShare }) {
  return (
    <section
      className="relative isolate min-h-[84svh] overflow-hidden bg-[#101214] px-4 py-5 text-white sm:px-6 lg:px-8"
      data-refero-pattern="FeedHive 90a7014b product-image landing + ManyChat 34ba7875 large display hero + Instagram QR Flow 2871 visual profile sharing"
    >
      <ColorPattern variant="hero" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,18,20,0.22),rgba(16,18,20,0.78)_62%,#101214)]" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-lg font-black text-[#101214]">V</div>
        <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-bold backdrop-blur sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#34D399]" />
          Anonymous social inbox
        </div>
        <PrimaryButton variant="glass" onClick={onOpenAuth}>
          <LogIn size={17} />
          Sign in
        </PrimaryButton>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 pb-16 pt-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center lg:pb-20 lg:pt-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/75">Veil for anonymous messages</p>
          <h1 className="text-6xl font-black leading-[0.9] tracking-normal sm:text-7xl lg:text-8xl">
            Say the quiet part safely.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
            Share a profile link, collect anonymous questions, and run every reply through an inbox that feels social on web and native on iOS.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton onClick={onOpenAuth} className="!bg-white !text-[#101214] hover:!bg-white/90">
              <Mail size={18} />
              Create profile
            </PrimaryButton>
            <PrimaryButton variant="glass" onClick={onOpenShare}>
              <QrCode size={18} />
              Preview share card
            </PrimaryButton>
          </div>
        </div>

        <div className="relative min-h-[520px] lg:min-h-[620px]" aria-label="Veil product preview">
          <div className="absolute left-0 top-8 w-[48%] max-w-[260px] rotate-[-6deg] sm:left-10 lg:left-0">
            <ShareCard compact />
          </div>
          <div className="absolute bottom-4 right-0 w-[48%] max-w-[260px] rotate-[5deg] sm:right-12 lg:right-6">
            <div
              className="overflow-hidden rounded-lg border border-white/25 bg-[#101214] p-4 text-white shadow-strong"
              data-refero-pattern="Telegram web Flow 616 chat personalization: live chat preview with colorful background"
            >
              <div className="relative mb-4 h-32 overflow-hidden rounded-lg">
                <ColorPattern variant="blue" />
                <div className="absolute inset-3 rounded-lg bg-white/88 p-3 text-[#101214]">
                  <p className="text-xs font-black uppercase text-gray-500">Profile prompt</p>
                  <p className="mt-2 text-lg font-black leading-tight">Ask me anything anonymously</p>
                </div>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-sm leading-6 text-white/82">312 messages this week</p>
                <div className="mt-3 h-2 rounded-full bg-white/12">
                  <div className="h-2 w-3/4 rounded-full bg-[#34D399]" />
                </div>
              </div>
            </div>
          </div>
          <PhonePreview />
        </div>
      </div>
    </section>
  );
}

function DesktopRail({ active, setActive }) {
  return (
    <aside
      className="hidden bg-[#101214] text-white lg:block"
      data-refero-pattern="X Flow 927 and Instagram web settings three-column left navigation"
    >
      <div className="flex h-full min-h-[760px] flex-col px-3 py-4">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-lg font-black text-[#101214]">V</div>
        <nav className="grid gap-1">
          <button className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-bold text-white/88 hover:bg-white/10" type="button">
            <Home size={20} />
            Home
          </button>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={classNames(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition",
                  active === item.id ? "bg-white text-[#101214]" : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <PrimaryButton className="mt-6 w-full bg-[#34D399] text-[#101214] hover:bg-[#5BE7B0]">
          <Plus size={18} />
          New link
        </PrimaryButton>
        <div className="mt-auto overflow-hidden rounded-lg border border-white/12 bg-white/8 p-3">
          <div className="relative mb-3 h-16 rounded-lg">
            <ColorPattern variant="share" />
          </div>
          <div className="flex items-center gap-3">
            <Avatar label="M" accent="pink" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">Maya</p>
              <p className="truncate text-xs text-white/58">@maya</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ active, setReportOpen }) {
  const title = navItems.find((item) => item.id === active)?.label || "Inbox";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
      <button className="text-sm font-bold text-action" type="button">Edit</button>
      <h2 className="text-base font-black text-ink">{title}</h2>
      <IconButton label="Report issue" onClick={() => setReportOpen(true)}>
        <Flag size={18} />
      </IconButton>
    </header>
  );
}

function InboxList({ selectedId, setSelectedId }) {
  return (
    <section
      className="border-r border-line bg-white"
      data-refero-pattern="Telegram iOS chat list + Vimeo messages tabs and filters"
    >
      <div className="hidden border-b border-line px-5 py-4 lg:block">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">Anonymous</p>
            <h2 className="text-2xl font-black text-ink">Messages</h2>
          </div>
          <div className="flex text-gray-600">
            <IconButton label="Search">
              <Search size={18} />
            </IconButton>
            <IconButton label="New message">
              <Plus size={18} />
            </IconButton>
          </div>
        </div>
        <div className="mt-4 flex rounded-lg bg-gray-100 p-1 text-sm font-black">
          {["Inbox", "Unread", "Requests"].map((item, index) => (
            <button
              key={item}
              type="button"
              className={classNames("min-h-9 flex-1 rounded-md px-3", index === 0 ? "bg-white text-ink shadow-panel" : "text-gray-500")}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-line bg-ios px-4 py-3 lg:hidden">
        <label className="flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm text-gray-500">
          <Search size={17} />
          Search
        </label>
      </div>

      <div className="divide-y divide-gray-100">
        {messages.map((message) => (
          <button
            key={message.id}
            type="button"
            onClick={() => setSelectedId(message.id)}
            className={classNames(
              "relative flex w-full gap-3 px-4 py-4 text-left transition hover:bg-gray-50 lg:px-5",
              selectedId === message.id ? "bg-[#EAF5FF]" : "bg-white"
            )}
          >
            {selectedId === message.id && <span className="absolute inset-y-3 left-0 w-1 rounded-r bg-action" />}
            <Avatar label={message.tone.slice(0, 1)} accent={message.accent} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-ink">{message.tone} anonymous note</p>
                  <p className="mt-1 truncate text-sm text-gray-500">{message.preview}</p>
                </div>
                <div className="grid justify-items-end gap-1">
                  <span className="text-xs text-gray-500">{message.time}</span>
                  {message.unread && <span className="rounded-full bg-action px-2 py-0.5 text-xs font-black text-white">New</span>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={classNames("rounded-full px-2 py-1 text-xs font-bold ring-1", accentStyles[message.accent])}>{message.status}</span>
                {message.status === "Request" && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">filtered</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function MessageDetail({ message, setReportOpen }) {
  return (
    <section
      className="flex min-h-[620px] flex-col bg-[#F7F8FA]"
      data-refero-pattern="Missive conversation detail + X Flow 927 conversation management + Telegram Flow 616 chat background preview"
    >
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <Avatar label="A" accent={message.accent} />
          <div>
            <h3 className="text-base font-black text-ink">Anonymous sender</h3>
            <p className="text-xs text-gray-500">Private note via /maya</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Report message" onClick={() => setReportOpen(true)}>
            <Flag size={18} />
          </IconButton>
          <IconButton label="More actions">
            <MoreHorizontal size={18} />
          </IconButton>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto px-4 py-5 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,122,255,0.07)_0_1px,transparent_1px_24px)]" />
        <div className="relative space-y-4">
          <div className="max-w-xl rounded-lg border border-line bg-white p-4 shadow-panel">
            <p className="text-sm leading-6 text-ink">{message.body}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
              <Lock size={14} />
              Sender identity is not collected
            </div>
          </div>
          <div className="ml-auto max-w-xl rounded-lg bg-[#101214] p-4 text-white shadow-panel">
            <p className="text-sm leading-6">
              I usually reply when the question feels useful for more than one person. Private kindness can stay private too.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
            <div className="flex items-start gap-2">
              <Shield size={18} />
              <p>Auto-filter is on for repeated messages, hidden words, and blocked fingerprints.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-white p-4">
        <div className="rounded-lg border border-line bg-white p-3 shadow-panel">
          <textarea
            className="min-h-24 w-full resize-none border-0 p-0 text-sm leading-6 outline-none placeholder:text-gray-400"
            placeholder="Write a public reply..."
            defaultValue="I usually reply when the question feels useful for more than one person."
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <Check size={15} className="text-success" />
              Public reply preview
            </div>
            <PrimaryButton>
              <Send size={17} />
              Publish reply
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthPanel() {
  return (
    <section
      className="grid gap-5 bg-white p-4 lg:grid-cols-[0.92fr_1.08fr] lg:p-6"
      data-refero-pattern="Substack Flow 4511, Hashnode Flow 3913, The Leap fcc63338 account setup"
    >
      <div className="relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-lg bg-[#101214] p-6 text-white">
        <ColorPattern variant="blue" />
        <div className="absolute inset-0 bg-[#101214]/70" />
        <div className="relative">
          <p className="text-sm font-black text-white/70">Step 1 of 3</p>
          <h2 className="mt-3 max-w-sm text-4xl font-black tracking-normal">Create your anonymous inbox.</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
            Email-first auth keeps the path light on web, while the code confirmation pattern maps cleanly to iOS.
          </p>
        </div>
        <div className="relative rounded-lg border border-white/14 bg-white/12 p-4 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-wide text-white/65">Check your inbox</p>
          <div className="mt-3 flex items-center gap-3">
            <Mail size={20} />
            <p className="text-sm">A 6-digit code was sent to maya@example.com</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col justify-center py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-[#101214] text-lg font-black text-white">V</div>
          <h2 className="mt-5 text-2xl font-black text-ink">Sign in</h2>
          <p className="mt-2 text-sm text-gray-500">Use email, username, or a one-time code.</p>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm font-bold text-gray-700">
            Email or username
            <input className="min-h-12 rounded-lg border border-line px-3 outline-none focus:border-action focus:ring-4 focus:ring-blue-100" defaultValue="maya@example.com" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-gray-700">
            Password
            <input className="min-h-12 rounded-lg border border-line px-3 outline-none focus:border-action focus:ring-4 focus:ring-blue-100" type="password" defaultValue="password" />
          </label>
          <PrimaryButton className="mt-2 w-full">Sign in</PrimaryButton>
          <button type="button" className="text-sm font-black text-action">Send a one-time code instead</button>
          <div className="grid grid-cols-6 gap-2 pt-4">
            {["4", "1", "8", "0", "", ""].map((digit, index) => (
              <span key={index} className="grid h-12 place-items-center rounded-lg border border-line bg-gray-50 text-lg font-black">
                {digit || " "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SharePanel() {
  return (
    <section
      className="grid gap-6 bg-[#101214] p-4 text-white lg:grid-cols-[0.86fr_1.14fr] lg:p-6"
      data-refero-pattern="Mozi b83b0ba5 share link + Instagram QR Flow 2871 + Telegram QR af456445"
    >
      <ShareCard />

      <div className="rounded-lg border border-white/14 bg-white/10 p-5 shadow-panel backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/58">Profile link performance</p>
        <h2 className="mt-2 text-3xl font-black text-white">Make the share screen feel worth posting.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
          Refero QR references treat the share card as the main visual artifact: large QR, avatar overlap, style pill, paired share/copy actions, and immediate feedback.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Link scans", "1,284", "mint"],
            ["Messages", "312", "pink"],
            ["Blocked", "18", "amber"],
          ].map(([label, value, accent]) => (
            <div key={label} className="rounded-lg border border-white/12 bg-white p-4 text-[#101214]">
              <p className="text-xs font-black uppercase tracking-wide text-gray-500">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
              <span className={classNames("mt-3 inline-flex rounded-full px-2 py-1 text-xs font-bold ring-1", accentStyles[accent])}>Live</span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg border border-white/12 bg-white/10 p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-[#FFD35A]" />
            <div>
              <h3 className="text-sm font-black text-white">Share prompt</h3>
              <p className="mt-1 text-sm leading-6 text-white/68">"Ask me anything anonymously" works best as profile copy because it sets expectations before the send form.</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton className="!bg-white !text-[#101214] hover:!bg-white/90">
            <Send size={18} />
            Share profile
          </PrimaryButton>
          <PrimaryButton variant="glass">
            <Copy size={18} />
            Copy link
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function NotificationsPanel() {
  return (
    <section
      className="bg-ios p-4 lg:p-6"
      data-refero-pattern="Telegram notifications aa1bb28a grouped settings cards"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="inline-flex items-center gap-1 text-sm font-bold text-action">
            <ChevronLeft size={17} />
            Back
          </button>
          <h2 className="text-lg font-black">Notifications</h2>
          <span className="w-12" />
        </div>
        <SettingsGroup title="Message notifications">
          {notifications.map(([label, sub, enabled]) => (
            <ToggleRow key={label} label={label} sub={sub} enabled={enabled} />
          ))}
        </SettingsGroup>
        <SettingsGroup title="Badge counter">
          <ToggleRow label="Include message requests" sub="Count filtered messages after review" enabled />
          <ToggleRow label="Mute blocked senders" sub="No badge count after block" enabled />
        </SettingsGroup>
      </div>
    </section>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <div className="mb-5">
      <p className="mb-2 px-1 text-xs font-black uppercase tracking-wide text-gray-500">{title}</p>
      <div className="divide-y divide-gray-100 rounded-lg bg-white shadow-panel">{children}</div>
    </div>
  );
}

function ToggleRow({ label, sub, enabled }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-sm font-black text-ink">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{sub}</p>
      </div>
      <button
        type="button"
        aria-pressed={enabled}
        className={classNames("relative h-7 w-12 rounded-full transition", enabled ? "bg-success" : "bg-gray-300")}
      >
        <span className={classNames("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition", enabled ? "left-6" : "left-1")} />
      </button>
    </div>
  );
}

function SettingsPanel({ setReportOpen, setPaywallOpen }) {
  return (
    <section
      className="grid gap-6 bg-white p-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:p-6"
      data-refero-pattern="Instagram settings 2e596d7f + Telegram privacy 5a478b87 + TikTok subscription 4ee573ad"
    >
      <div className="hidden border-r border-line pr-5 lg:block">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-gray-500">Settings</p>
        {["Messages and replies", "Hidden words", "Restricted senders", "Notifications", "Billing", "Help"].map((item, index) => (
          <button
            key={item}
            type="button"
            className={classNames("mb-1 flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-bold", index === 0 ? "bg-gray-100 text-ink" : "text-gray-600 hover:bg-gray-50")}
          >
            {item}
            <ChevronRight size={16} />
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-3xl font-black text-ink">Message Controls</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Decide who can send anonymous messages, how requests are filtered, and what happens when a sender is blocked.
        </p>

        <div className="mt-6 divide-y divide-gray-100 rounded-lg border border-line">
          {settingsRows.map(([label, value]) => (
            <button key={label} type="button" className="flex min-h-14 w-full items-center justify-between gap-4 px-4 text-left hover:bg-gray-50">
              <span className="text-sm font-black text-ink">{label}</span>
              <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                {value}
                <ChevronRight size={16} />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-line p-4">
            <h3 className="text-base font-black">Safety actions</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">Use a focused report dialog for moderation and a clear block confirmation for repeat senders.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PrimaryButton variant="danger" onClick={() => setReportOpen(true)}>
                <Flag size={17} />
                Report sender
              </PrimaryButton>
              <PrimaryButton variant="light">
                <UserX size={17} />
                Block
              </PrimaryButton>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-line p-4">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#FF2D55] via-[#FFD35A] to-[#34D399]" />
            <h3 className="text-base font-black">Veil Plus</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">Unlock message insights, custom links, and extra safety automation.</p>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#101214] p-3 text-white">
              <div>
                <p className="text-sm font-black">$8/mo</p>
                <p className="text-xs text-white/58">30-day trial</p>
              </div>
              <PrimaryButton className="!bg-white !text-[#101214] hover:!bg-white/90" onClick={() => setPaywallOpen(true)}>Upgrade</PrimaryButton>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-line p-4">
          <p className="text-xs font-black uppercase tracking-wide text-gray-500">Potential connections</p>
          <RadioOption label="Allow messages from anyone with my link" selected />
          <RadioOption label="Move unknown senders to requests" selected={false} />
          <RadioOption label="Do not receive messages from unknown senders" selected={false} />
        </div>
      </div>
    </section>
  );
}

function RadioOption({ label, selected }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <span className={classNames("grid h-5 w-5 place-items-center rounded-full border", selected ? "border-action" : "border-gray-300")}>
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-action" />}
      </span>
      <p className="text-sm font-bold text-ink">{label}</p>
    </div>
  );
}

function ReportModal({ open, setOpen }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-gray-950/45 px-4 backdrop-blur-sm"
      data-refero-pattern="GoFundMe report modal ae5aa835 + X report modal ee27d0f4 + Ivory block/report 30846bc7"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-modal">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-ink">Report an issue</h2>
          <IconButton label="Close report" onClick={() => setOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>
        <p className="text-sm leading-6 text-gray-600">
          Help us understand what is wrong with this anonymous message. Reports are reviewed against community rules.
        </p>
        <div className="mt-5 grid gap-3">
          {["It is spam", "It is abusive or harmful", "It includes private information"].map((item) => (
            <button key={item} type="button" className="flex min-h-12 items-center justify-between rounded-lg border border-line px-3 text-left text-sm font-bold hover:bg-gray-50">
              {item}
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
        <label className="mt-4 grid gap-1.5 text-sm font-bold text-gray-700">
          Additional context
          <textarea className="min-h-24 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-action focus:ring-4 focus:ring-blue-100" placeholder="Optional" />
        </label>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <PrimaryButton variant="light" onClick={() => setOpen(false)}>Cancel</PrimaryButton>
          <PrimaryButton variant="danger" onClick={() => setOpen(false)}>Submit report</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function PaywallModal({ open, setOpen }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-gray-950/45 px-4 pb-4 pt-12 backdrop-blur-sm sm:place-items-center"
      data-refero-pattern="TikTok subscription 4ee573ad + Square pricing ba4df9a6 and success 73423778"
    >
      <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-modal">
        <div className="mb-5 flex items-center justify-between">
          <IconButton label="Back" onClick={() => setOpen(false)}>
            <ChevronLeft size={18} />
          </IconButton>
          <h2 className="text-lg font-black">Select plan</h2>
          <IconButton label="Close" onClick={() => setOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="relative mb-5 h-28 overflow-hidden rounded-lg">
          <ColorPattern variant="share" />
          <div className="absolute inset-0 grid place-items-center bg-[#101214]/38 text-center text-white">
            <p className="text-2xl font-black">Veil Plus</p>
          </div>
        </div>
        <p className="text-sm leading-6 text-gray-600">Veil Plus adds custom profile links, advanced filtering, message analytics, and priority report review.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <PlanCard title="Monthly" price="$8" selected />
          <PlanCard title="Yearly" price="$72" badge="Save 25%" />
        </div>
        <label className="mt-5 flex items-start gap-3 text-sm text-gray-600">
          <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border border-action bg-action text-white">
            <Check size={13} />
          </span>
          I agree to the subscription terms and trial reminder.
        </label>
        <PrimaryButton variant="pink" className="mt-5 w-full" onClick={() => setOpen(false)}>
          Start 30-day free trial
        </PrimaryButton>
        <button type="button" className="mt-4 w-full text-sm font-black text-gray-700">Restore purchase</button>
      </div>
    </div>
  );
}

function PlanCard({ title, price, badge, selected = false }) {
  return (
    <button
      type="button"
      className={classNames(
        "min-h-32 rounded-lg border p-4 text-left transition hover:bg-gray-50",
        selected ? "border-premium bg-rose-50" : "border-line bg-white"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black">{title}</h3>
        {badge && <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-black text-premium">{badge}</span>}
      </div>
      <p className="mt-5 text-3xl font-black text-ink">{price}</p>
      <p className="mt-1 text-sm text-gray-500">per account</p>
    </button>
  );
}

function ActivePanel({ active, selectedMessage, setReportOpen, setPaywallOpen }) {
  if (active === "share") return <SharePanel />;
  if (active === "notifications") return <NotificationsPanel />;
  if (active === "settings") return <SettingsPanel setReportOpen={setReportOpen} setPaywallOpen={setPaywallOpen} />;
  if (active === "auth") return <AuthPanel />;
  return <MessageDetail message={selectedMessage} setReportOpen={setReportOpen} />;
}

function MobileNav({ active, setActive }) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-line bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={classNames("grid min-h-14 place-items-center rounded-lg text-xs font-bold", active === item.id ? "text-action" : "text-gray-500")}
            >
              <Icon size={21} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ResearchStrip() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="min-w-0 rounded-lg bg-[#101214] p-5 text-white shadow-panel">
          <p className="text-xs font-black uppercase tracking-wide text-white/58">Refero correction</p>
          <h2 className="mt-2 text-2xl font-black">From conservative inbox to social-share product.</h2>
        </div>
        <div className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-panel">
          <p className="text-xs font-black uppercase tracking-wide text-gray-500">New visual trace</p>
          <div className="mt-3 flex min-w-0 gap-2 overflow-auto no-scrollbar">
            {referoSources.slice(0, 10).map((source) => (
              <span key={source.refero} className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600">
                {source.id}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-600">{designRules.visual}</p>
        </div>
      </div>
    </section>
  );
}

export default function VeilApp() {
  const [active, setActive] = useState("inbox");
  const [selectedId, setSelectedId] = useState(messages[0].id);
  const [reportOpen, setReportOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const selectedMessage = messages.find((message) => message.id === selectedId) || messages[0];

  return (
    <main className="min-h-screen bg-canvas pb-20 lg:pb-0">
      <LandingHero onOpenAuth={() => setActive("auth")} onOpenShare={() => setActive("share")} />
      <ResearchStrip />

      <section id="app" className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-strong">
          <div className="grid min-h-[720px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[220px_380px_minmax(0,1fr)]">
            <DesktopRail active={active} setActive={setActive} />
            <div className={classNames(active === "inbox" ? "block" : "hidden lg:block")}>
              <InboxList selectedId={selectedId} setSelectedId={setSelectedId} />
            </div>
            <div className={classNames(active === "inbox" ? "block" : "col-span-2 block")}>
              <MobileHeader active={active} setReportOpen={setReportOpen} />
              <ActivePanel active={active} selectedMessage={selectedMessage} setReportOpen={setReportOpen} setPaywallOpen={setPaywallOpen} />
            </div>
          </div>
          <MobileNav active={active} setActive={setActive} />
        </div>
      </section>

      <ReportModal open={reportOpen} setOpen={setReportOpen} />
      <PaywallModal open={paywallOpen} setOpen={setPaywallOpen} />
    </main>
  );
}
