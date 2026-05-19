import { HIDE_CHATS_STORAGE_KEY } from "./config.js";

/**
 * Single source of truth for all mutable state in the app.
 * Modules import { state } and mutate state.xxx directly.
 * For complex state changes use the helpers at the bottom.
 */
export const state = {
  // Language + identity
  currentLang: "ar",
  displayName: "زائر 27",
  currentProfile: null,

  // Chat data
  chats: [],
  conversationRequests: [],
  burnedChats: [],
  blockedChats: [],

  // Active conversation
  activeConversationId: "",
  activeSubscription: null,
  requestsSubscription: null,

  // Timers
  countdownTimer: null,
  messageTicker: null,
  typingStopTimer: null,
  idleLockTimer: null,

  // Privacy / composer
  privacyMode: "5h",
  panicMode: false,
  chatsHidden: localStorage.getItem(HIDE_CHATS_STORAGE_KEY) === "1",
  typing: false,
  typingLastSentAt: 0,
  hiddenMode: false,

  // UI state
  qrModalOpen: false,
  replyDraft: null,
  activeActionMessageId: "",
  voiceRecording: null,
  entryMode: "",
  generatedShareLink: "",
};
