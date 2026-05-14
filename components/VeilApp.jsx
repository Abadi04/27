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
  User,
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
  },
  {
    id: 2,
    tone: "Curious",
    preview: "I have wanted to ask this for a while, but never knew how.",
    body: "I have wanted to ask this for a while, but never knew how. What is something you wish more friends understood about you?",
    time: "18m",
    unread: true,
    status: "Needs reply",
  },
  {
    id: 3,
    tone: "Support",
    preview: "You handled that public reply with a lot of grace.",
    body: "You handled that public reply with a lot of grace. It changed the way I thought about anonymous Q&A.",
    time: "1h",
    unread: false,
    status: "Read",
  },
  {
    id: 4,
    tone: "Filtered",
    preview: "This message was moved to requests until you approve it.",
    body: "This message was moved to requests until you approve it. The sender is not allowed to send repeated notes.",
    time: "3h",
    unread: false,
    status: "Request",
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

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function Avatar({ label = "V", tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    pink: "bg-rose-50 text-rose-700 ring-rose-100",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
  };

  return (
    <span className={classNames("grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ring-2", tones[tone])}>
      {label}
    </span>
  );
}

function IconButton({ label, children, onClick, active = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={classNames(
        "grid h-10 w-10 place-items-center rounded-full border text-gray-700 transition hover:border-gray-300 hover:bg-white",
        active ? "border-blue-200 bg-blue-50 text-action" : "border-transparent bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, className = "", variant = "blue", onClick }) {
  const variants = {
    blue: "bg-action text-white hover:bg-blue-700",
    dark: "bg-gray-950 text-white hover:bg-black",
    pink: "bg-premium text-white hover:bg-rose-600",
    light: "border border-line bg-white text-ink hover:border-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition", variants[variant], className)}
    >
      {children}
    </button>
  );
}

function QRMark() {
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
    <div className="grid h-36 w-36 grid-cols-11 gap-1 rounded-lg border border-gray-200 bg-white p-3 shadow-panel" aria-label="Profile QR code preview">
      {cells.map((fill, index) => (
        <span key={index} className={classNames("rounded-[2px]", fill ? "bg-gray-950" : "bg-transparent")} />
      ))}
    </div>
  );
}

function LandingHero({ onOpenAuth, onOpenShare }) {
  return (
    <section
      className="mx-auto grid min-h-[min(760px,100svh)] w-full max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:px-8"
      data-refero-pattern="Hashnode flow 3913 marketing-to-auth + Mozi b83b0ba5 share preview + Telegram iOS chat list"
    >
      <div className="min-w-0 max-w-2xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-panel">
          <span className="h-2 w-2 rounded-full bg-success" />
          Anonymous inbox, profile link, safety controls
        </div>
        <h1 className="max-w-2xl text-5xl font-bold tracking-normal text-ink sm:text-6xl lg:text-7xl">
          Veil
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
          Receive anonymous messages, manage requests, reply from a focused inbox, and share a profile link that feels natural on web and iOS.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <PrimaryButton onClick={onOpenAuth}>
            <LogIn size={18} />
            Create profile
          </PrimaryButton>
          <PrimaryButton variant="light" onClick={onOpenShare}>
            <QrCode size={18} />
            Preview share link
          </PrimaryButton>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[0.82fr_1fr]">
        <div className="order-2 min-w-0 rounded-lg border border-line bg-white p-4 shadow-panel lg:order-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Share profile</p>
              <p className="text-sm font-semibold text-ink">@maya</p>
            </div>
            <IconButton label="Copy profile link">
              <Copy size={17} />
            </IconButton>
          </div>
          <div className="grid justify-items-center gap-4">
            <div className="rounded-lg bg-gray-950 px-5 py-4 text-center text-white">
              <Avatar label="M" tone="pink" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-300">Maya Rivers</p>
            </div>
            <QRMark />
            <div className="grid w-full grid-cols-2 gap-2">
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

        <div className="order-1 min-w-0 rounded-lg border border-line bg-white shadow-panel lg:order-2">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <button className="text-sm font-semibold text-action" type="button">Edit</button>
            <div className="flex items-center gap-2">
              <Avatar label="M" tone="blue" />
              <h2 className="text-base font-bold">Inbox</h2>
            </div>
            <div className="flex items-center gap-1 text-action">
              <Plus size={19} />
              <MessageCircle size={19} />
            </div>
          </div>
          <div className="border-b border-line bg-gray-50 px-4 py-3">
            <label className="flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm text-gray-500 ring-1 ring-gray-200">
              <Search size={17} />
              Search messages
            </label>
          </div>
          <div className="divide-y divide-gray-100">
            {messages.slice(0, 3).map((message, index) => (
              <div key={message.id} className="flex gap-3 px-4 py-3">
                <Avatar label={message.tone.slice(0, 1)} tone={index === 0 ? "green" : index === 1 ? "pink" : "gray"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-ink">{message.tone} anonymous note</p>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">{message.preview}</p>
                </div>
                {message.unread && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-action" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopRail({ active, setActive }) {
  return (
    <aside
      className="hidden border-r border-line bg-white lg:block"
      data-refero-pattern="X Flow 927 and Instagram web settings three-column left navigation"
    >
      <div className="flex h-full min-h-[760px] flex-col px-3 py-4">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-950 text-lg font-bold text-white">V</div>
        <nav className="grid gap-1">
          <button className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50" type="button">
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
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition",
                  active === item.id ? "bg-blue-50 text-action" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <PrimaryButton className="mt-6 w-full">
          <Plus size={18} />
          New link
        </PrimaryButton>
        <div className="mt-auto flex items-center gap-3 rounded-lg bg-gray-50 p-2">
          <Avatar label="M" tone="blue" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Maya</p>
            <p className="truncate text-xs text-gray-500">@maya</p>
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
      <button className="text-sm font-semibold text-action" type="button">Edit</button>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <div className="flex items-center gap-1 text-action">
        <IconButton label="Report issue" onClick={() => setReportOpen(true)}>
          <Flag size={18} />
        </IconButton>
      </div>
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
          <h2 className="text-xl font-bold text-ink">Messages</h2>
          <div className="flex text-gray-600">
            <IconButton label="Search">
              <Search size={18} />
            </IconButton>
            <IconButton label="New message">
              <Plus size={18} />
            </IconButton>
          </div>
        </div>
        <div className="mt-4 flex rounded-lg bg-gray-100 p-1 text-sm font-semibold">
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
        {messages.map((message, index) => (
          <button
            key={message.id}
            type="button"
            onClick={() => setSelectedId(message.id)}
            className={classNames(
              "flex w-full gap-3 px-4 py-4 text-left transition hover:bg-gray-50 lg:px-5",
              selectedId === message.id ? "bg-blue-50/70" : "bg-white"
            )}
          >
            <Avatar label={message.tone.slice(0, 1)} tone={index === 0 ? "green" : index === 1 ? "pink" : "gray"} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{message.tone} anonymous note</p>
                  <p className="mt-1 truncate text-sm text-gray-500">{message.preview}</p>
                </div>
                <div className="grid justify-items-end gap-1">
                  <span className="text-xs text-gray-500">{message.time}</span>
                  {message.unread && <span className="rounded-full bg-action px-2 py-0.5 text-xs font-semibold text-white">New</span>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{message.status}</span>
                {message.status === "Request" && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">filtered</span>}
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
      className="flex min-h-[620px] flex-col bg-white"
      data-refero-pattern="Missive conversation detail + X Flow 927 conversation management"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <Avatar label="A" tone="green" />
          <div>
            <h3 className="text-base font-bold text-ink">Anonymous sender</h3>
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

      <div className="flex-1 space-y-4 overflow-auto bg-gray-50 px-4 py-5 lg:px-8">
        <div className="max-w-xl rounded-lg border border-line bg-white p-4 shadow-panel">
          <p className="text-sm leading-6 text-ink">{message.body}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Lock size={14} />
            Sender identity is not collected
          </div>
        </div>
        <div className="ml-auto max-w-xl rounded-lg bg-blue-600 p-4 text-white shadow-panel">
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

      <div className="border-t border-line bg-white p-4">
        <div className="rounded-lg border border-line bg-white p-3">
          <textarea
            className="min-h-24 w-full resize-none border-0 p-0 text-sm leading-6 outline-none placeholder:text-gray-400"
            placeholder="Write a public reply..."
            defaultValue="I usually reply when the question feels useful for more than one person."
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
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
      data-refero-pattern="Substack Flow 4511, Hashnode Flow 3913, Teal 657ecdd2, Instagram iOS login 5c5b4ccd"
    >
      <div className="flex min-h-[520px] flex-col justify-between rounded-lg bg-gray-950 p-6 text-white">
        <div>
          <p className="text-sm font-semibold text-gray-300">Step 1 of 3</p>
          <h2 className="mt-3 max-w-sm text-4xl font-bold tracking-normal">Create your anonymous inbox.</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
            Email-first auth keeps the path light on web, while the code confirmation pattern maps cleanly to iOS.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">Check your inbox</p>
          <div className="mt-3 flex items-center gap-3">
            <Mail size={20} />
            <p className="text-sm">A 6-digit code was sent to maya@example.com</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col justify-center py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-gray-950 text-lg font-bold text-white">V</div>
          <h2 className="mt-5 text-2xl font-bold text-ink">Sign in</h2>
          <p className="mt-2 text-sm text-gray-500">Use email, username, or a one-time code.</p>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm font-medium text-gray-700">
            Email or username
            <input className="min-h-12 rounded-lg border border-line px-3 outline-none focus:border-action focus:ring-4 focus:ring-blue-100" defaultValue="maya@example.com" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-gray-700">
            Password
            <input className="min-h-12 rounded-lg border border-line px-3 outline-none focus:border-action focus:ring-4 focus:ring-blue-100" type="password" defaultValue="password" />
          </label>
          <PrimaryButton className="mt-2 w-full">Sign in</PrimaryButton>
          <button type="button" className="text-sm font-semibold text-action">Send a one-time code instead</button>
          <div className="grid grid-cols-6 gap-2 pt-4">
            {["4", "1", "8", "0", "", ""].map((digit, index) => (
              <span key={index} className="grid h-12 place-items-center rounded-lg border border-line bg-gray-50 text-lg font-semibold">
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
      className="grid gap-6 bg-ios p-4 lg:grid-cols-[0.9fr_1.1fr] lg:p-6"
      data-refero-pattern="Mozi b83b0ba5 share link + Instagram QR fa1930c4 paired actions"
    >
      <div className="rounded-lg bg-white p-5 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <IconButton label="Back">
            <X size={18} />
          </IconButton>
          <h2 className="text-lg font-bold">Connect</h2>
          <IconButton label="Info">
            <Shield size={18} />
          </IconButton>
        </div>
        <div className="rounded-lg bg-gray-950 p-5 text-center text-white">
          <Avatar label="M" tone="pink" />
          <h3 className="mt-4 text-xl font-bold uppercase tracking-wide">Maya Rivers</h3>
          <p className="mt-1 text-sm text-gray-300">@maya</p>
        </div>
        <div className="mt-6 grid justify-items-center gap-4">
          <QRMark />
          <PrimaryButton variant="light" className="w-full">
            <LinkIcon size={18} />
            veil.app/maya
          </PrimaryButton>
          <p className="max-w-sm text-center text-sm leading-6 text-gray-500">
            Sharing this link lets anyone send an anonymous message. Sender identity is not shown in your inbox.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-panel">
        <h2 className="text-xl font-bold text-ink">Profile link performance</h2>
        <p className="mt-2 text-sm text-gray-500">A simple web layout that can become an iOS share screen without changing the content hierarchy.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Link scans", "1,284"],
            ["Messages", "312"],
            ["Blocked", "18"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-action" />
            <div>
              <h3 className="text-sm font-bold text-ink">Share prompt</h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">"Ask me anything anonymously" works best as profile copy because it sets expectations before the send form.</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton>
            <Send size={18} />
            Share profile
          </PrimaryButton>
          <PrimaryButton variant="light">
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
          <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-action">
            <ChevronLeft size={17} />
            Back
          </button>
          <h2 className="text-lg font-bold">Notifications</h2>
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
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <div className="divide-y divide-gray-100 rounded-lg bg-white shadow-panel">{children}</div>
    </div>
  );
}

function ToggleRow({ label, sub, enabled }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
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
      data-refero-pattern="Instagram settings 2e596d7f + Telegram privacy 5a478b87 + Square pricing ba4df9a6"
    >
      <div className="hidden border-r border-line pr-5 lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Settings</p>
        {["Messages and replies", "Hidden words", "Restricted senders", "Notifications", "Billing", "Help"].map((item, index) => (
          <button
            key={item}
            type="button"
            className={classNames("mb-1 flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold", index === 0 ? "bg-gray-100 text-ink" : "text-gray-600 hover:bg-gray-50")}
          >
            {item}
            <ChevronRight size={16} />
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-ink">Message Controls</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Decide who can send anonymous messages, how requests are filtered, and what happens when a sender is blocked.
        </p>

        <div className="mt-6 divide-y divide-gray-100 rounded-lg border border-line">
          {settingsRows.map(([label, value]) => (
            <button key={label} type="button" className="flex min-h-14 w-full items-center justify-between gap-4 px-4 text-left hover:bg-gray-50">
              <span className="text-sm font-semibold text-ink">{label}</span>
              <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                {value}
                <ChevronRight size={16} />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-line p-4">
            <h3 className="text-base font-bold">Safety actions</h3>
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

          <div className="rounded-lg border border-line p-4">
            <h3 className="text-base font-bold">Veil Plus</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">Unlock message insights, custom links, and extra safety automation.</p>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <div>
                <p className="text-sm font-bold text-ink">$8/mo</p>
                <p className="text-xs text-gray-500">30-day trial</p>
              </div>
              <PrimaryButton onClick={() => setPaywallOpen(true)}>Upgrade</PrimaryButton>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-line p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Potential connections</p>
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
      <p className="text-sm font-medium text-ink">{label}</p>
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
          <h2 className="text-xl font-bold text-ink">Report an issue</h2>
          <IconButton label="Close report" onClick={() => setOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>
        <p className="text-sm leading-6 text-gray-600">
          Help us understand what is wrong with this anonymous message. Reports are reviewed against community rules.
        </p>
        <div className="mt-5 grid gap-3">
          {["It is spam", "It is abusive or harmful", "It includes private information"].map((item) => (
            <button key={item} type="button" className="flex min-h-12 items-center justify-between rounded-lg border border-line px-3 text-left text-sm font-semibold hover:bg-gray-50">
              {item}
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
        <label className="mt-4 grid gap-1.5 text-sm font-semibold text-gray-700">
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
          <h2 className="text-lg font-bold">Select plan</h2>
          <IconButton label="Close" onClick={() => setOpen(false)}>
            <X size={18} />
          </IconButton>
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
        <button type="button" className="mt-4 w-full text-sm font-semibold text-gray-700">Restore purchase</button>
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
        <h3 className="text-base font-bold">{title}</h3>
        {badge && <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-premium">{badge}</span>}
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{price}</p>
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
              className={classNames("grid min-h-14 place-items-center rounded-lg text-xs font-semibold", active === item.id ? "text-action" : "text-gray-500")}
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
    <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-line bg-white p-4 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Refero trace</p>
        <div className="mt-3 flex gap-2 overflow-auto no-scrollbar">
          {referoSources.slice(0, 8).map((source) => (
            <span key={source.refero} className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
              {source.id}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-gray-600">{designRules.desktop}</p>
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
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
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
