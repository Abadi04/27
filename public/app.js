(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // public/js/config.js
  var SUPABASE_URL, SUPABASE_ANON_KEY, VAPID_PUBLIC_KEY, MESSAGE_TTL_SECONDS, FIVE_HOURS, PRIVACY_MODES, PROFILE_STORAGE_KEY, ONBOARDING_STORAGE_KEY, HIDE_CHATS_STORAGE_KEY, SWIPE_DELETE_THRESHOLD, SWIPE_REPLY_THRESHOLD, DEMO_PROFILE_ID;
  var init_config = __esm({
    "public/js/config.js"() {
      SUPABASE_URL = "https://rndwafkuqavqabpywosa.supabase.co";
      SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHdhZmt1cWF2cWFicHl3b3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzkxOTEsImV4cCI6MjA5NDQ1NTE5MX0.tIrLqYHsK-qpvzlZBdPRRFNZZKhX445tE7xxsjZeceM";
      VAPID_PUBLIC_KEY = "";
      MESSAGE_TTL_SECONDS = 5 * 60 * 60;
      FIVE_HOURS = 5 * 60 * 60 * 1e3;
      PRIVACY_MODES = {
        "10s_read": { seconds: 10, burnAfterRead: true },
        "5m": { seconds: 5 * 60, burnAfterRead: false },
        "1h": { seconds: 60 * 60, burnAfterRead: false },
        "5h": { seconds: MESSAGE_TTL_SECONDS, burnAfterRead: false },
        "close": { seconds: MESSAGE_TTL_SECONDS, burnAfterRead: false, closeDelete: true }
      };
      PROFILE_STORAGE_KEY = "twentyseven_profile";
      ONBOARDING_STORAGE_KEY = "veil_seen";
      HIDE_CHATS_STORAGE_KEY = "twentyseven_hide_chats";
      SWIPE_DELETE_THRESHOLD = 80;
      SWIPE_REPLY_THRESHOLD = 56;
      DEMO_PROFILE_ID = "demo-self";
    }
  });

  // public/js/db.js
  var supabaseReady, db;
  var init_db = __esm({
    "public/js/db.js"() {
      init_config();
      supabaseReady = typeof window.supabase !== "undefined" && SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("PASTE_") && !SUPABASE_ANON_KEY.includes("PASTE_");
      db = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
    }
  });

  // public/js/state.js
  var state;
  var init_state = __esm({
    "public/js/state.js"() {
      init_config();
      state = {
        // Language + identity
        currentLang: "ar",
        displayName: "\u0632\u0627\u0626\u0631 27",
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
        generatedShareLink: ""
      };
    }
  });

  // public/js/i18n.js
  var i18n;
  var init_i18n = __esm({
    "public/js/i18n.js"() {
      i18n = {
        ar: {
          headerStatus: "\u0645\u0634\u0641\u0651\u0631 \xB7 \u0628\u062F\u0648\u0646 \u062A\u0633\u062C\u064A\u0644",
          headerStatusLive: "\u0645\u062A\u0635\u0644 \xB7 Supabase Realtime",
          langToggle: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629 / English",
          heroTagline: "\u062E\u0627\u0635. \u0633\u0631\u064A\u0639. \u064A\u062E\u062A\u0641\u064A.",
          heroLine1: "\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0645\u062C\u0647\u0648\u0644\u0629 \u062A\u062E\u062A\u0641\u064A \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u0628\u0639\u062F \u0622\u062E\u0631 \u0646\u0634\u0627\u0637.",
          heroLine2: "",
          inputPlaceholder: "\u0623\u062F\u062E\u0644 \u0631\u0642\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645",
          startBtn: "\u0628\u062F\u0621 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629",
          secondaryOptionsLabel: "\u062E\u064A\u0627\u0631\u0627\u062A \u0623\u062E\u0631\u0649",
          askActionTitle: "Ask Me Anonymously",
          askActionHint: "\u0631\u0627\u0628\u0637 \u0623\u0633\u0626\u0644\u0629 \u0645\u062C\u0647\u0648\u0644 \u064A\u0646\u062A\u0647\u064A \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627",
          roomActionTitle: "Temporary Room",
          roomActionHint: "\u063A\u0631\u0641\u0629 \u062E\u0627\u0635\u0629 \u0628\u0631\u0627\u0628\u0637 \u0645\u0624\u0642\u062A",
          shareReady: "\u062C\u0627\u0647\u0632 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u0629",
          askShareTitle: "Ask Me Anonymously",
          roomShareTitle: "Temporary Room",
          askShareDesc: "\u0627\u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637 \u0648\u0636\u0639\u0647 \u0641\u064A \u0627\u0644\u0628\u0627\u064A\u0648 \u0623\u0648 \u0623\u0631\u0633\u0644\u0647 \u0644\u0635\u062F\u064A\u0642. \u064A\u0646\u062A\u0647\u064A \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u0628\u0639\u062F \u0665 \u0633\u0627\u0639\u0627\u062A.",
          roomShareDesc: "\u0634\u0627\u0631\u0643 \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0644\u063A\u0631\u0641\u0629 \u062E\u0627\u0635\u0629 \u062A\u062E\u062A\u0641\u064A \u0628\u0639\u062F \u0622\u062E\u0631 \u0646\u0634\u0627\u0637.",
          copy: "\u0646\u0633\u062E",
          anonymousEntryKicker: "\u0631\u0627\u0628\u0637 \u0623\u0633\u0626\u0644\u0629 \u0645\u062C\u0647\u0648\u0644",
          roomEntryKicker: "\u063A\u0631\u0641\u0629 \u0645\u0624\u0642\u062A\u0629",
          anonymousEntryTitle: "\u0623\u0631\u0633\u0644 \u0631\u0633\u0627\u0644\u0629 \u0645\u062C\u0647\u0648\u0644\u0629",
          roomEntryTitle: "\u0627\u062F\u062E\u0644 \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0645\u0624\u0642\u062A\u0629",
          anonymousEntryDesc: "\u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0624\u0642\u062A. \u0627\u0643\u062A\u0628 \u0631\u0633\u0627\u0644\u0629 \u0642\u0635\u064A\u0631\u0629 \u0648\u0633\u064A\u062A\u0645 \u0641\u062A\u062D \u0645\u062D\u0627\u062F\u062B\u0629 \u062E\u0627\u0635\u0629 \u0639\u0646\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0622\u062E\u0631.",
          roomEntryDesc: "\u0627\u0644\u063A\u0631\u0641\u0629 \u0644\u0627 \u062A\u062D\u062A\u0627\u062C \u062D\u0633\u0627\u0628\u064B\u0627. \u0623\u0631\u0633\u0644 \u0623\u0648\u0644 \u0631\u0633\u0627\u0644\u0629 \u0648\u0633\u064A\u0628\u062F\u0623 \u0627\u0644\u0639\u062F\u0651\u0627\u062F.",
          anonymousPlaceholder: "\u0627\u0643\u062A\u0628 \u0634\u064A\u0626\u064B\u0627 \u0644\u0627 \u062A\u0631\u064A\u062F \u0623\u0646 \u064A\u0628\u0642\u0649 \u0637\u0648\u064A\u0644\u064B\u0627...",
          roomPlaceholder: "\u0627\u0643\u062A\u0628 \u0623\u0648\u0644 \u0631\u0633\u0627\u0644\u0629 \u0641\u064A \u0627\u0644\u063A\u0631\u0641\u0629...",
          anonymousSend: "\u0623\u0631\u0633\u0644 \u0643\u0645\u062C\u0647\u0648\u0644",
          roomSend: "\u062F\u062E\u0648\u0644 \u0627\u0644\u063A\u0631\u0641\u0629",
          linkCreated: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0624\u0642\u062A.",
          entryQueued: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u062D\u0644\u064A\u064B\u0627 \u0643\u0637\u0644\u0628 \u0645\u0624\u0642\u062A.",
          profileCodeKicker: "\u0634\u0627\u0631\u0643 \u0631\u0627\u0628\u0637\u0643",
          profileCodeLabel: "\u0631\u0642\u0645\u0643",
          copyMyCode: "\u0646\u0633\u062E \u0627\u0644\u0631\u0642\u0645",
          copyMyLink: "\u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637",
          copied: "\u062A\u0645 \u0627\u0644\u0646\u0633\u062E",
          chatsHeader: "\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629",
          emptyTitle: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0628\u0639\u062F",
          emptyText: "\u0623\u062F\u062E\u0644 \u0631\u0642\u0645 \u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0639\u0644\u0627\u0647 \u0644\u0628\u062F\u0621 \u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0634\u0641\u0651\u0631\u0629 \u062A\u062E\u062A\u0641\u064A \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627.",
          footerText: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u062A\u064F\u062D\u0630\u0641 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u0628\u0639\u062F \u0665 \u0633\u0627\u0639\u0627\u062A \u0645\u0646 \u0622\u062E\u0631 \u0631\u0633\u0627\u0644\u0629.",
          footerTextWithCode: "\u0631\u0642\u0645\u0643: {code} \xB7 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u062A\u064F\u062D\u0630\u0641 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u0628\u0639\u062F \u0665 \u0633\u0627\u0639\u0627\u062A.",
          back: "\u0631\u062C\u0648\u0639",
          settings: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A",
          settingsSubtitle: "\u062A\u062D\u0643\u0645 \u0628\u062A\u062C\u0631\u0628\u0629 27 \u0628\u062F\u0648\u0646 \u062D\u0633\u0627\u0628.",
          displayNameLabel: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0631\u0636",
          displayNameHint: "\u064A\u064F\u0633\u062A\u062E\u062F\u0645 \u0644\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0623\u0641\u0627\u062A\u0627\u0631 \u0641\u0642\u0637.",
          privacyLabel: "\u062D\u0630\u0641 \u062A\u0644\u0642\u0627\u0626\u064A",
          privacyHint: "\u0643\u0644 \u0645\u062D\u0627\u062F\u062B\u0629 \u062A\u064F\u0632\u0627\u0644 \u0628\u0639\u062F 5 \u0633\u0627\u0639\u0627\u062A \u0645\u0646 \u0622\u062E\u0631 \u0631\u0633\u0627\u0644\u0629.",
          saveSettings: "\u062D\u0641\u0638",
          settingsSaved: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A.",
          requestSent: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629.",
          requestExists: "\u064A\u0648\u062C\u062F \u0637\u0644\u0628 \u0645\u062D\u0627\u062F\u062B\u0629 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0631\u062F.",
          requestIncoming: "{name} \u064A\u0631\u064A\u062F \u0645\u062D\u0627\u062F\u062B\u062A\u0643",
          accept: "\u0642\u0628\u0648\u0644",
          reject: "\u0631\u0641\u0636",
          block: "\u062D\u0638\u0631",
          blocked: "\u062A\u0645 \u0627\u0644\u062D\u0638\u0631.",
          rejected: "\u062A\u0645 \u0627\u0644\u0631\u0641\u0636.",
          accepted: "\u062A\u0645 \u0642\u0628\u0648\u0644 \u0627\u0644\u0637\u0644\u0628.",
          requestsHeader: "\u0637\u0644\u0628\u0627\u062A \u062C\u062F\u064A\u062F\u0629",
          pendingHeader: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0631\u062F",
          expiringHeader: "\u0642\u0631\u064A\u0628\u0629 \u0645\u0646 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621",
          expiringStripOne: "\u0645\u062D\u0627\u062F\u062B\u0629 \u0633\u062A\u0646\u062A\u0647\u064A \u0642\u0631\u064A\u0628\u064B\u0627 \xB7 \u062E\u0644\u0627\u0644 {time}",
          expiringStrip: "{count} \u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0633\u062A\u0646\u062A\u0647\u064A \u0642\u0631\u064A\u0628\u064B\u0627 \xB7 \u0623\u0642\u0631\u0628\u0647\u0627 \u062E\u0644\u0627\u0644 {time}",
          activeHeader: "\u0646\u0634\u0637\u0629",
          burnedHeader: "\u0645\u0646\u062A\u0647\u064A\u0629",
          blockedHeader: "\u0645\u062D\u0638\u0648\u0631\u0629",
          pendingState: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0642\u0628\u0648\u0644 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0622\u062E\u0631.",
          expiredStateTitle: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u0627\u062E\u062A\u0641\u062A",
          expiredStateBody: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0639\u0631\u0636 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0628\u0639\u062F \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0648\u0642\u062A. \u064A\u0645\u0643\u0646\u0643 \u062D\u0630\u0641 \u0627\u0644\u0623\u062B\u0631 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0623\u0648 \u0628\u062F\u0621 \u0637\u0644\u0628 \u062C\u062F\u064A\u062F.",
          blockedStateTitle: "\u0647\u0630\u0647 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u062D\u0638\u0648\u0631\u0629",
          blockedStateBody: "\u0644\u0646 \u062A\u0633\u062A\u0642\u0628\u0644 \u0631\u0633\u0627\u0626\u0644 \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645. \u064A\u0645\u0643\u0646\u0643 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062D\u0638\u0631 \u0644\u0627\u062D\u0642\u064B\u0627 \u0645\u0646 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629.",
          noChatsTitle: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0646\u0634\u0637\u0629",
          noChatsBody: "\u0627\u0628\u062F\u0623 \u0628\u0631\u0642\u0645 \u0645\u0633\u062A\u062E\u062F\u0645 \u0641\u0642\u0637. \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0627\u0644\u0642\u0631\u064A\u0628\u0629 \u0645\u0646 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u0633\u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627.",
          privacyModeLabel: "\u0648\u0636\u0639 \u0627\u0644\u0627\u062E\u062A\u0641\u0627\u0621",
          privacy10s: "10 \u062B\u0648\u0627\u0646\u064D \u0628\u0639\u062F \u0627\u0644\u0642\u0631\u0627\u0621\u0629",
          privacy5m: "5 \u062F\u0642\u0627\u0626\u0642",
          privacy1h: "\u0633\u0627\u0639\u0629",
          privacy5h: "5 \u0633\u0627\u0639\u0627\u062A",
          privacyClose: "\u0639\u0646\u062F \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629",
          sentStatus: "\u062A\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644",
          deliveredStatus: "\u062A\u0645 \u0627\u0644\u0648\u0635\u0648\u0644",
          readStatus: "\u062A\u0645\u062A \u0627\u0644\u0642\u0631\u0627\u0621\u0629",
          noAccount: "\u0628\u062F\u0648\u0646 \u062D\u0633\u0627\u0628 \u0645\u0631\u062A\u0628\u0637",
          onlineNow: "\u0645\u062A\u0635\u0644 \u0627\u0644\u0622\u0646",
          hideCode: "\u0625\u062E\u0641\u0627\u0621 \u0631\u0642\u0645\u064A",
          showCode: "\u0625\u0638\u0647\u0627\u0631 \u0631\u0642\u0645\u064A",
          hideChats: "\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u062F\u0631\u062F\u0634\u0627\u062A",
          hideChatsHint: "\u0625\u062E\u0641\u0627\u0621 \u0643\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629.",
          hideCodeHint: "\u0645\u0646\u0639 \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0631\u0642\u0645 \u0648\u0627\u0644\u0643\u0648\u062F \u0627\u0644\u0633\u0631\u064A\u0639.",
          hiddenChatsTitle: "\u0627\u0644\u062F\u0631\u062F\u0634\u0627\u062A \u0645\u062E\u0641\u064A\u0629",
          hiddenChatsBody: "\u0623\u0648\u0642\u0641 \u062E\u064A\u0627\u0631 \u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u062F\u0631\u062F\u0634\u0627\u062A \u0645\u0646 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0644\u0639\u0631\u0636 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.",
          regenerateCode: "\u062A\u062C\u062F\u064A\u062F \u0631\u0642\u0645\u064A",
          codeRegenerated: "\u062A\u0645 \u062A\u062C\u062F\u064A\u062F \u0631\u0642\u0645\u0643.",
          deleteAll: "\u0645\u0633\u062D \u0643\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0627\u0644\u0622\u0646",
          deletedAll: "\u062A\u0645 \u0645\u0633\u062D \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A.",
          chatExpiry: "\u062A\u0646\u062A\u0647\u064A \u0628\u0639\u062F \u0665 \u0633\u0627\u0639\u0627\u062A \u0645\u0646 \u0622\u062E\u0631 \u0631\u0633\u0627\u0644\u0629",
          messagePlaceholder: "\u0627\u0643\u062A\u0628 \u0631\u0633\u0627\u0644\u0629 \u0645\u0624\u0642\u062A\u0629...",
          send: "\u0625\u0631\u0633\u0627\u0644",
          attach: "\u0625\u0631\u0633\u0627\u0644 \u0635\u0648\u0631\u0629 \u0623\u0648 \u0641\u064A\u062F\u064A\u0648",
          systemNote: "\u0647\u0630\u0647 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0624\u0642\u062A\u0629 \u0648\u0644\u0627 \u062A\u062D\u062A\u0627\u062C \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644.",
          loadingChats: "\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A...",
          loadingConversation: "\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629...",
          searchingCode: "\u062C\u0627\u0631\u064D \u0627\u0644\u0628\u062D\u062B...",
          sendingMessage: "\u062C\u0627\u0631\u064D \u0627\u0644\u0625\u0631\u0633\u0627\u0644...",
          errorChats: "\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A. \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.",
          invalidCode: "\u0623\u062F\u062E\u0644 \u0643\u0648\u062F\u064B\u0627 \u0631\u0642\u0645\u064A\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627.",
          codeNotFound: "\u0627\u0644\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.",
          cannotChatSelf: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0628\u062F\u0621 \u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0639 \u0631\u0642\u0645\u0643.",
          starting: "\u062A\u0645 \u0641\u062A\u062D \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629.",
          expired: "\u0627\u0646\u062A\u0647\u062A \u0645\u062F\u0629 \u0647\u0630\u0647 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629\u060C \u0648\u062A\u0645 \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0647\u0627 \u0646\u0647\u0627\u0626\u064A\u064B\u0627.",
          emptyChat: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0631\u0633\u0627\u0626\u0644 \u0628\u0639\u062F. \u0627\u0643\u062A\u0628 \u0623\u0648\u0644 \u0631\u0633\u0627\u0644\u0629 \u0645\u0624\u0642\u062A\u0629.",
          expiresIn: "\u064A\u0646\u062A\u0647\u064A \u0628\u0639\u062F {time}",
          lessThanMinute: "\u0623\u0642\u0644 \u0645\u0646 \u062F\u0642\u064A\u0642\u0629",
          hoursUnit: "{count} \u0633\u0627\u0639\u0629",
          minutesUnit: "{count} \u062F\u0642\u064A\u0642\u0629",
          realtimeConnecting: "\u062C\u0627\u0631\u064D \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631...",
          realtimeConnected: "\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0641\u0639\u0651\u0627\u0644",
          mediaStorage: "\u0631\u0641\u0639 \u0627\u0644\u0648\u0633\u0627\u0626\u0637 \u064A\u062D\u062A\u0627\u062C Storage \u0644\u0627\u062D\u0642\u064B\u0627. \u0623\u064F\u0631\u0633\u0644\u062A \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0646\u0635\u064A\u0629 \u0641\u0642\u0637.",
          mediaSheetTitle: "\u0625\u0631\u0633\u0627\u0644 \u0633\u0631\u064A\u0639",
          pickMedia: "\u0635\u0648\u0631\u0629 \u0623\u0648 \u0641\u064A\u062F\u064A\u0648",
          gifSent: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 GIF \u0645\u0624\u0642\u062A",
          voiceHold: "\u0627\u0636\u063A\u0637 \u0645\u0637\u0648\u0644\u064B\u0627 \u0644\u0644\u062A\u0633\u062C\u064A\u0644",
          voiceRecording: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u0633\u062C\u064A\u0644...",
          voiceSent: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0635\u0648\u062A\u064A\u0629 \u0645\u0624\u0642\u062A\u0629",
          hiddenToggle: "\u0631\u0633\u0627\u0644\u0629 \u0645\u062E\u0641\u064A\u0629",
          hiddenActive: "\u0627\u0644\u0646\u0635 \u0645\u062E\u0641\u064A \u062D\u062A\u0649 \u0627\u0644\u0644\u0645\u0633",
          hiddenRevealHint: "\u0627\u0644\u0645\u0633 \u0628\u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0644\u0644\u0643\u0634\u0641",
          hideMode: "\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u062F\u0631\u062F\u0634\u0627\u062A",
          shareQr: "\u0634\u0627\u0631\u0643 \u0643\u0640 QR",
          qrTitle: "\u0634\u0627\u0631\u0643 \u0631\u0642\u0645\u0643",
          copyNumber: "\u0646\u0633\u062E \u0627\u0644\u0631\u0642\u0645",
          close: "\u0625\u063A\u0644\u0627\u0642",
          burnToggle: "\u0631\u0633\u0627\u0644\u0629 \u062A\u062D\u062A\u0631\u0642",
          burnAfterRead: "\u062A\u062D\u062A\u0631\u0642 \u0628\u0639\u062F \u0627\u0644\u0642\u0631\u0627\u0621\u0629",
          tapToRead: "\u0627\u0636\u063A\u0637 \u0644\u0644\u0642\u0631\u0627\u0621\u0629 \xB7 \u062A\u064F\u062D\u0630\u0641 \u062E\u0644\u0627\u0644 10\u062B",
          reply: "\u0631\u062F",
          replyTo: "\u0631\u062F \u0639\u0644\u0649: {text}",
          cancelReply: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0631\u062F",
          copyMessage: "\u0646\u0633\u062E",
          copiedMessage: "\u062A\u0645 \u0646\u0633\u062E \u0627\u0644\u0631\u0633\u0627\u0644\u0629",
          burnNow: "\u0625\u062D\u0631\u0627\u0642 \u0627\u0644\u0622\u0646",
          messageActions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0631\u0633\u0627\u0644\u0629",
          messageDeleted: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0631\u0633\u0627\u0644\u0629",
          reactionAdded: "\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644",
          typing: "\u064A\u0643\u062A\u0628 \u0627\u0644\u0622\u0646...",
          fakeNotesTitle: "Notes",
          now: "\u0627\u0644\u0622\u0646",
          ttlSeconds: "< \u0661 \u062F",
          userPrefix: "\u0645\u0633\u062A\u062E\u062F\u0645",
          demoMode: "\u0648\u0636\u0639 \u062A\u062C\u0631\u064A\u0628\u064A: \u0623\u0636\u0641 \u0645\u0641\u0627\u062A\u064A\u062D Supabase \u0644\u064A\u0635\u0628\u062D \u062D\u0642\u064A\u0642\u064A\u064B\u0627."
        },
        en: {
          headerStatus: "Encrypted \xB7 No login",
          headerStatusLive: "Connected \xB7 Supabase Realtime",
          langToggle: "English / \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
          heroTagline: "Private. Fast. Disappears.",
          heroLine1: "Anonymous chats that disappear automatically after last activity.",
          heroLine2: "",
          inputPlaceholder: "Enter user code",
          startBtn: "Start chat",
          secondaryOptionsLabel: "Other options",
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
          profileCodeKicker: "Share your link",
          profileCodeLabel: "Your code",
          copyMyCode: "Copy code",
          copyMyLink: "Copy link",
          copied: "Copied",
          chatsHeader: "Active chats",
          emptyTitle: "No conversations yet",
          emptyText: "Enter a user code above to start an encrypted chat that auto-deletes.",
          footerText: "All conversations are automatically deleted 5 hours after the last message.",
          footerTextWithCode: "Your code: {code} \xB7 All conversations auto-delete after 5 hours.",
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
          expiringStripOne: "1 chat expires soon \xB7 in {time}",
          expiringStrip: "{count} chats expire soon \xB7 closest in {time}",
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
          tapToRead: "Tap to read \xB7 deletes in 10s",
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
          ttlSeconds: "< 1m",
          userPrefix: "User",
          demoMode: "Demo mode: add Supabase keys to make it real."
        }
      };
    }
  });

  // public/js/utils.js
  function setLoading(message, visible = true) {
    const el = $("loadingState");
    if (!el) return;
    el.textContent = message || "";
    el.hidden = !visible;
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
  function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }
  function flashError(message) {
    const el = $("errorState");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    window.clearTimeout(errorTimer);
    errorTimer = window.setTimeout(() => {
      el.hidden = true;
    }, 2400);
  }
  function handleAsyncError(error, fallbackMessage = "\u062D\u062F\u062B \u062E\u0637\u0623 \u0645\u0627.") {
    console.warn(error);
    flashError(fallbackMessage);
  }
  function vibrate(pattern) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  }
  function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }
  function getAppBasePath() {
    return window.location.pathname.endsWith("/") ? window.location.pathname : window.location.pathname.replace(/\/[^/]*$/, "/");
  }
  function urlBase64ToUint8Array(value) {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  }
  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[c]);
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
    for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 360;
    return hash;
  }
  function randomPublicCode() {
    return String(Math.floor(Math.random() * 9e5) + 1e5);
  }
  function createMessageId(prefix = "msg") {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function createShareToken(prefix) {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${prefix}-${random}-${Date.now().toString(36).toUpperCase()}`;
  }
  function formatTime(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat(state.currentLang === "ar" ? "ar-SA" : "en", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }
  function formatRemaining(ms, t) {
    if (ms <= 6e4) return t.lessThanMinute;
    const totalMinutes = Math.ceil(ms / 6e4);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) {
      return `${t.hoursUnit.replace("{count}", hours)} ${t.minutesUnit.replace("{count}", minutes)}`;
    }
    if (hours > 0) return t.hoursUnit.replace("{count}", hours);
    return t.minutesUnit.replace("{count}", minutes);
  }
  function formatTTL(ms, t) {
    if (ms <= 0) return null;
    const mins = Math.floor(ms / 6e4);
    const hrs = Math.floor(mins / 60);
    if (mins < 1) return { text: t.ttlSeconds || "< 1m", cls: "ttl-critical" };
    if (mins < 30) return { text: `${mins}m`, cls: "ttl-warning" };
    if (hrs < 1) return { text: `${mins}m`, cls: "" };
    const remMins = mins % 60;
    return { text: remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`, cls: "" };
  }
  function isUuid(value = "") {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
  function isLiveMode() {
    return Boolean(db && state.currentProfile);
  }
  function isMissingRelationError(error) {
    const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
    return ["42P01", "42703", "PGRST200", "PGRST204"].includes(error?.code) || message.includes("does not exist") || message.includes("schema cache") || message.includes("could not find") || message.includes("relationship");
  }
  function getPrivacyConfig(mode = state.privacyMode) {
    return PRIVACY_MODES[mode] || PRIVACY_MODES["5h"];
  }
  function getPrivacyLabel(mode, i18n2) {
    const t = i18n2[state.currentLang];
    return {
      "10s_read": t.privacy10s,
      "5m": t.privacy5m,
      "1h": t.privacy1h,
      "5h": t.privacy5h,
      "close": t.privacyClose
    }[mode] || t.privacy5h;
  }
  function getShareLink() {
    const code = state.currentProfile?.public_code || $("profileCodeValue")?.textContent?.trim() || "";
    const base = `${window.location.origin}${getAppBasePath()}`;
    return code ? `${base}?code=${encodeURIComponent(code)}` : base;
  }
  function getTemporaryShareLink(type) {
    const base = `${window.location.origin}${getAppBasePath()}`;
    const param = type === "room" ? "room" : "ask";
    const token = createShareToken(type === "room" ? "ROOM" : "ASK");
    return { token, url: `${base}?${param}=${encodeURIComponent(token)}` };
  }
  var $, toastTimer, errorTimer;
  var init_utils = __esm({
    "public/js/utils.js"() {
      init_config();
      init_state();
      init_db();
      $ = (id) => document.getElementById(id);
      toastTimer = null;
      errorTimer = null;
    }
  });

  // public/js/demo.js
  var demo_exports = {};
  __export(demo_exports, {
    appendDemoMessage: () => appendDemoMessage,
    createDemoChat: () => createDemoChat,
    createDemoConversationFromCode: () => createDemoConversationFromCode,
    demoChats: () => demoChats,
    normalizeMessage: () => normalizeMessage
  });
  function normalizeMessage(message, chatId = "demo", index = 0, fallbackExpiresAt = Date.now() + FIVE_HOURS) {
    return {
      id: message.id || `${chatId}-${index}-${Math.abs(hashHue(message.text || ""))}`,
      burnAfterRead: Boolean(message.burnAfterRead),
      expiresAt: message.expiresAt || new Date(fallbackExpiresAt).toISOString(),
      createdAt: message.createdAt || new Date(fallbackExpiresAt - FIVE_HOURS).toISOString(),
      ...message
    };
  }
  function createDemoChat(id, arName, enName, online, arMessages, enMessages) {
    const lastMessageAt = Date.now() - Math.floor(Math.random() * 25 + 1) * 60 * 1e3;
    const expiresAt = lastMessageAt + FIVE_HOURS;
    return {
      id,
      online,
      names: { ar: arName, en: enName },
      otherProfile: { id, display_name: arName, public_code: id, avatar_seed: arName },
      lastMessageAt,
      expiresAt,
      messages: {
        ar: arMessages.map((m, i) => normalizeMessage(m, `${id}-ar`, i, expiresAt)),
        en: enMessages.map((m, i) => normalizeMessage(m, `${id}-en`, i, expiresAt))
      }
    };
  }
  function createDemoConversationFromCode(code) {
    const id = `code-${code}`;
    const existing = state.chats.find((c) => c.id === id);
    if (existing) return existing;
    const name = state.currentLang === "ar" ? `${i18n.ar.userPrefix} ${code}` : `${i18n.en.userPrefix} ${code}`;
    const chat = {
      id,
      online: true,
      name,
      otherProfile: { id, display_name: name, public_code: code, avatar_seed: name },
      lastMessageAt: Date.now(),
      expiresAt: Date.now() + FIVE_HOURS,
      messages: { neutral: [] }
    };
    state.chats.unshift(chat);
    return chat;
  }
  function appendDemoMessage(conversationId, message, onChange) {
    const chat = [...state.chats, ...state.burnedChats, ...state.blockedChats].find((c) => c.id === conversationId);
    if (!chat) return;
    if (!chat.messages.neutral && !chat.messages[state.currentLang]) {
      chat.messages.neutral = [];
    }
    const target = chat.messages.neutral || chat.messages[state.currentLang];
    const expiresAt = message.expiresAt || new Date(Date.now() + FIVE_HOURS).toISOString();
    target.push({
      id: message.id || createMessageId("demo"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...message,
      expiresAt
    });
    chat.lastMessageAt = Date.now();
    chat.expiresAt = new Date(expiresAt).getTime();
    onChange?.(chat);
  }
  var demoChats;
  var init_demo = __esm({
    "public/js/demo.js"() {
      init_config();
      init_state();
      init_utils();
      init_i18n();
      demoChats = [
        createDemoChat("sara", "\u0633\u0627\u0631\u0629", "Sara", true, [
          { type: "incoming", text: "\u062C\u0627\u0647\u0632\u061F \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u062A\u062E\u062A\u0641\u064A \u0628\u0639\u062F \u062E\u0645\u0633 \u0633\u0627\u0639\u0627\u062A.", time: "\u0642\u0628\u0644 2 \u062F" },
          { type: "outgoing", text: "\u062A\u0645\u0627\u0645\u060C \u0647\u0630\u0627 \u0628\u0627\u0644\u0636\u0628\u0637 \u0627\u0644\u0644\u064A \u0623\u062D\u062A\u0627\u062C\u0647.", time: "\u0627\u0644\u0622\u0646" }
        ], [
          { type: "incoming", text: "Ready? This message disappears after five hours.", time: "2m ago" },
          { type: "outgoing", text: "Perfect, that is exactly what I need.", time: "Now" }
        ]),
        createDemoChat("khaled", "\u062E\u0627\u0644\u062F", "Khaled", true, [
          { type: "incoming", text: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0631\u0642\u0645 \u0641\u0642\u0637 \u0648\u0646\u062F\u062E\u0644 \u0645\u0628\u0627\u0634\u0631\u0629.", time: "\u0642\u0628\u0644 8 \u062F" }
        ], [
          { type: "incoming", text: "Send the code only and we jump straight in.", time: "8m ago" }
        ]),
        createDemoChat("noura", "\u0646\u0648\u0631\u0629", "Noura", false, [
          { type: "incoming", text: "\u0628\u062F\u0648\u0646 \u062A\u0633\u062C\u064A\u0644\u061F \u0645\u0645\u062A\u0627\u0632.", time: "\u0642\u0628\u0644 45 \u062F" }
        ], [
          { type: "incoming", text: "No login? Nice.", time: "45m ago" }
        ])
      ];
      demoChats[2].lastMessageAt = Date.now() - (FIVE_HOURS - 18 * 60 * 1e3);
      demoChats[2].expiresAt = Date.now() + 18 * 60 * 1e3;
      Object.values(demoChats[2].messages).flat().forEach((msg) => {
        msg.expiresAt = new Date(demoChats[2].expiresAt).toISOString();
      });
    }
  });

  // public/js/render.js
  function getChat(chatId) {
    return [...state.chats, ...state.burnedChats, ...state.blockedChats].find((c) => c.id === chatId);
  }
  function getChatName(chat) {
    if (!chat) return "";
    return chat.names?.[state.currentLang] || chat.otherProfile?.display_name || chat.name || chat.id;
  }
  function getMessages(chat) {
    if (!chat) return [];
    if (chat.messages?.[state.currentLang]) return chat.messages[state.currentLang];
    return chat.messages?.neutral || [];
  }
  function getChatExpiryTime(chat) {
    if (!chat) return 0;
    const messages = getMessages(chat);
    const latest = messages.reduce((acc, m) => {
      if (!m.expiresAt) return acc;
      return Math.max(acc, new Date(m.expiresAt).getTime());
    }, 0);
    if (latest) return latest;
    if (chat.expiresAt) return chat.expiresAt;
    if (chat.lastMessageAt) return chat.lastMessageAt + FIVE_HOURS;
    return Date.now() + FIVE_HOURS;
  }
  function moveExpiredChatsToBurned() {
    const now = Date.now();
    const expired = state.chats.filter((c) => getChatExpiryTime(c) <= now);
    if (!expired.length) return 0;
    state.burnedChats = [
      ...expired.map((c) => ({ ...c, burned: true, status: "expired" })),
      ...state.burnedChats
    ].slice(0, 12);
    state.chats = state.chats.filter((c) => getChatExpiryTime(c) > now);
    return expired.length;
  }
  function isIncomingRequest(request) {
    return request.target_id === state.currentProfile?.id || request.target_id === "demo-self";
  }
  function getChatPreview(chat) {
    const messages = getMessages(chat);
    const last = messages[messages.length - 1];
    const t = i18n[state.currentLang];
    if (!last) return t.emptyChat;
    if (last.mediaUrl) return last.fileName || t.attach;
    return last.text || t.emptyChat;
  }
  function getChatPill(chat) {
    const t = i18n[state.currentLang];
    if (chat.burned) return t.burnedHeader;
    if (chat.status === "blocked") return t.block;
    return getPrivacyLabel(chat.privacyMode || "5h", i18n);
  }
  function getChatItemMeta(chat) {
    const t = i18n[state.currentLang];
    const preview = getChatPreview(chat);
    const remaining = getChatExpiryTime(chat) - Date.now();
    const expiry = remaining <= 0 ? t.expiredStateTitle : t.expiresIn.replace("{time}", formatRemaining(remaining, t));
    return preview ? `${preview} \xB7 ${expiry}` : expiry;
  }
  function getMessageStatusLabel(message) {
    const t = i18n[state.currentLang];
    if (message.burnAfterRead && message.readAt) return t.burnAfterRead;
    if (message.status === "read" || message.readAt) return t.readStatus;
    if (message.status === "delivered") return t.deliveredStatus;
    return t.sentStatus;
  }
  function getMessageRemaining(message) {
    if (!message?.expiresAt) return FIVE_HOURS;
    return Math.max(0, new Date(message.expiresAt).getTime() - Date.now());
  }
  function getMessageTimerPercent(message) {
    const ttl = getPrivacyConfig(message?.privacyMode || (message?.burnAfterRead ? "10s_read" : "5h")).seconds;
    return Math.max(0, Math.min(100, getMessageRemaining(message) / (ttl * 1e3) * 100));
  }
  function renderChats() {
    const list = $("chatsList");
    const empty = $("emptyState");
    const t = i18n[state.currentLang];
    moveExpiredChatsToBurned();
    if (state.chatsHidden) {
      list.innerHTML = "";
      empty.hidden = false;
      empty.innerHTML = `
      <strong>${escapeHtml(t.hiddenChatsTitle)}</strong>
      <span id="emptyText">${escapeHtml(t.hiddenChatsBody)}</span>
    `;
      return;
    }
    if (!state.chats.length && !state.conversationRequests.length && !state.burnedChats.length && !state.blockedChats.length) {
      list.innerHTML = "";
      empty.hidden = false;
      empty.innerHTML = `
      <strong>${escapeHtml(t.noChatsTitle)}</strong>
      <span id="emptyText">${escapeHtml(t.noChatsBody)}</span>
    `;
      return;
    }
    empty.hidden = true;
    const incomingRequests = state.conversationRequests.filter(isIncomingRequest);
    const pendingRequests = state.conversationRequests.filter((r) => !isIncomingRequest(r));
    const requestsMarkup = incomingRequests.length ? `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(t.requestsHeader)}</div>
      ${incomingRequests.map(renderRequestItem).join("")}
    </div>` : "";
    const pendingMarkup = pendingRequests.length ? `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(t.pendingHeader)}</div>
      ${pendingRequests.map(renderRequestItem).join("")}
    </div>` : "";
    const expiring = state.chats.filter((c) => getChatExpiryTime(c) - Date.now() < 30 * 60 * 1e3);
    const active = state.chats.filter((c) => !expiring.includes(c));
    const expiringStrip = expiring.length ? renderExpiringStrip(expiring) : "";
    const expiringGroup = expiring.length ? renderChatGroup(t.expiringHeader, expiring) : "";
    const activeGroup = active.length ? renderChatGroup(t.activeHeader, active) : "";
    const burnedGroup = state.burnedChats.length ? renderChatGroup(t.burnedHeader, state.burnedChats, true) : "";
    const blockedGroup = state.blockedChats.length ? renderChatGroup(t.blockedHeader, state.blockedChats, true) : "";
    list.innerHTML = `${requestsMarkup}${pendingMarkup}${expiringStrip}${expiringGroup}${activeGroup}${burnedGroup}${blockedGroup}`;
  }
  function renderChatGroup(title, items, disabled = false) {
    return `
    <div class="inbox-group">
      <div class="inbox-group-title">${escapeHtml(title)}</div>
      ${items.map((c) => renderChatItem(c, disabled)).join("")}
    </div>`;
  }
  function renderExpiringStrip(items) {
    const t = i18n[state.currentLang];
    const soonest = items.reduce((acc, c) => getChatExpiryTime(c) < getChatExpiryTime(acc) ? c : acc, items[0]);
    const remaining = Math.max(0, getChatExpiryTime(soonest) - Date.now());
    const template = items.length === 1 ? t.expiringStripOne : t.expiringStrip;
    const label = template.replace("{count}", items.length).replace("{time}", formatRemaining(remaining, t));
    return `
    <button class="expiring-strip" type="button" data-chat-id="${escapeHtml(soonest.id)}">
      <span class="expiring-dot" aria-hidden="true"></span>
      <span>${escapeHtml(label)}</span>
    </button>`;
  }
  function renderChatItem(chat, disabled = false) {
    const t = i18n[state.currentLang];
    const name = getChatName(chat);
    const hue = hashHue(chat.otherProfile?.avatar_seed || name);
    const statusClass = chat.online ? "online" : "offline";
    const stateClass = chat.burned ? "is-expired" : chat.status === "blocked" ? "is-blocked" : "";
    const meta = chat.burned ? t.expiredStateTitle : chat.status === "blocked" ? t.blockedStateTitle : getChatItemMeta(chat);
    return `
    <div class="chat-item ${disabled ? "state-only" : ""} ${stateClass}"
         role="button" tabindex="0"
         data-chat-id="${escapeHtml(chat.id)}" aria-label="${escapeHtml(name)}">
      <div class="chat-avatar" style="--avatar-hue: ${hue}">${escapeHtml(getInitials(name))}</div>
      <div class="chat-info">
        <div class="chat-name">${escapeHtml(name)}</div>
        <div class="chat-meta">${escapeHtml(meta)}</div>
      </div>
      <div class="chat-pill">${escapeHtml(getChatPill(chat))}</div>
      <div class="chat-status ${statusClass}" aria-hidden="true"></div>
    </div>`;
  }
  function renderRequestItem(request) {
    const t = i18n[state.currentLang];
    const profile = isIncomingRequest(request) ? request.requester : request.target;
    const name = profile?.display_name || profile?.public_code || "27";
    const hue = hashHue(profile?.avatar_seed || name);
    const incoming = isIncomingRequest(request);
    return `
    <div class="request-item ${incoming ? "incoming-request" : "pending-request"}"
         data-request-id="${escapeHtml(request.id)}">
      <div class="chat-avatar" style="--avatar-hue: ${hue}">${escapeHtml(getInitials(name))}</div>
      <div class="chat-info">
        <div class="chat-name">${escapeHtml(incoming ? t.requestIncoming.replace("{name}", name) : t.requestSent)}</div>
        <div class="chat-meta">${escapeHtml(incoming ? profile?.public_code || "" : t.pendingState)}</div>
      </div>
      ${incoming ? `
        <div class="request-actions">
          <button class="mini-action accept-request" type="button">${escapeHtml(t.accept)}</button>
          <button class="mini-action reject-request" type="button">${escapeHtml(t.reject)}</button>
          <button class="mini-action danger reject-block-request" type="button">${escapeHtml(t.block)}</button>
        </div>` : ""}
    </div>`;
  }
  function renderTypingIndicator() {
    return `
    <div class="typing-indicator" role="status" aria-live="polite">
      <span>${escapeHtml(i18n[state.currentLang].typing)}</span>
      <i></i><i></i><i></i>
    </div>`;
  }
  function renderMessageContent(message) {
    const text = escapeHtml(message.text || "");
    const t = i18n[state.currentLang];
    if (message.messageType === "voice") {
      return `
      <span class="voice-message">
        <span class="voice-play" aria-hidden="true"></span>
        <span class="voice-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        <span>${text || "0:03"}</span>
      </span>`;
    }
    if (message.messageType === "gif") {
      return `<span class="gif-message"><strong>${text}</strong><small>GIF</small></span>`;
    }
    if (message.hidden) {
      return `
      <span class="hidden-message" tabindex="0" role="button" aria-label="${escapeHtml(t.hiddenRevealHint)}">
        <span class="hidden-mask">${escapeHtml(t.hiddenRevealHint)}</span>
        <span class="hidden-content">${text}</span>
      </span>`;
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
  function renderMessages(chat, onRendered) {
    const t = i18n[state.currentLang];
    const messages = getMessages(chat);
    const body = messages.length ? messages.map((message) => {
      const remaining = getMessageRemaining(message);
      const percent = getMessageTimerPercent(message);
      const criticalClass = remaining < 6e5 ? " critical" : "";
      const burnLabel = message.burnAfterRead ? `<span class="burn-label">${escapeHtml(t.burnAfterRead)}</span>` : "";
      const statusLabel = message.type === "outgoing" ? `<span class="message-status">${escapeHtml(getMessageStatusLabel(message))}</span>` : "";
      const replyQuote = message.replyToText ? `<span class="message-reply-quote">${escapeHtml(message.replyToText)}</span>` : "";
      const reaction = message.reaction ? `<span class="message-reaction">${escapeHtml(message.reaction)}</span>` : "";
      const ttlInfo = formatTTL(remaining, t);
      const ttlLabel = ttlInfo ? `<span class="message-ttl ${ttlInfo.cls}">${escapeHtml(ttlInfo.text)}</span>` : "";
      const blurClass = message.burnAfterRead && message.type === "incoming" && !message.readAt ? " blur-until-read" : "";
      const tapHint = blurClass ? i18n[state.currentLang].tapToRead || "\u0627\u0636\u063A\u0637 \u0644\u0644\u0642\u0631\u0627\u0621\u0629" : "";
      return `
      <div class="message-shell ${message.type}" data-message-id="${escapeHtml(message.id || "")}">
        <div class="swipe-reply-cue" aria-hidden="true">\u21A9</div>
        <div class="swipe-delete-cue" aria-hidden="true">\u{1F525}</div>
        <div class="message ${message.type}${blurClass}" data-tap-hint="${escapeHtml(tapHint)}" style="--swipe-x: 0px; --delete-opacity: 0;">
          ${replyQuote}
          ${renderMessageContent(message)}
          ${burnLabel}
          ${reaction}
          <span class="message-time">${escapeHtml(message.time || t.now)} ${ttlLabel} ${statusLabel}</span>
          <span class="message-timer${criticalClass}" style="--timer-width: ${percent}%"></span>
        </div>
      </div>`;
    }).join("") : `<div class="system-note">${escapeHtml(t.emptyChat)}</div>`;
    const list = $("messagesList");
    list.innerHTML = `<div class="system-note">${escapeHtml(t.systemNote)}</div>${body}${state.typing ? renderTypingIndicator() : ""}`;
    requestAnimationFrame(() => {
      list.scrollTop = list.scrollHeight;
    });
    onRendered?.(chat);
  }
  function renderConversationState(stateName) {
    const t = i18n[state.currentLang];
    const isBlocked = stateName === "blocked";
    $("chatViewStatus").textContent = isBlocked ? t.blockedStateTitle : t.expiredStateTitle;
    $("messageForm").hidden = true;
    const privBar = document.querySelector(".chat-privacy-bar");
    if (privBar) privBar.hidden = true;
    $("messagesList").innerHTML = `
    <div class="conversation-state ${isBlocked ? "blocked" : "expired"}">
      <div class="conversation-state-icon" aria-hidden="true">${isBlocked ? "!" : "27"}</div>
      <h3>${escapeHtml(isBlocked ? t.blockedStateTitle : t.expiredStateTitle)}</h3>
      <p>${escapeHtml(isBlocked ? t.blockedStateBody : t.expiredStateBody)}</p>
    </div>`;
  }
  function updateChatCountdown(chat) {
    if ($("chatView").hidden || !chat) return;
    const t = i18n[state.currentLang];
    const remaining = getChatExpiryTime(chat) - Date.now();
    $("chatViewStatus").textContent = remaining <= 0 ? t.expired : t.expiresIn.replace("{time}", formatRemaining(remaining, t));
  }
  var init_render = __esm({
    "public/js/render.js"() {
      init_config();
      init_state();
      init_i18n();
      init_utils();
    }
  });

  // public/js/messages.js
  function mapDbMessage(row) {
    return {
      id: row.id,
      type: row.sender_id === state.currentProfile.id ? "outgoing" : "incoming",
      text: row.content,
      messageType: row.message_type || "text",
      hidden: row.message_type === "hidden_text",
      time: formatTime(row.created_at),
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      privacyMode: row.privacy_mode || "5h",
      burnAfterRead: Boolean(row.burn_after_read),
      readAt: row.read_at,
      status: row.sender_id === state.currentProfile.id ? row.read_at ? "read" : "sent" : ""
    };
  }
  async function cleanupExpiredMessages(conversationId = "") {
    if (!isLiveMode()) return;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    let query = db.from("messages").delete().lt("expires_at", nowIso);
    if (conversationId) query = query.eq("conversation_id", conversationId);
    const { error } = await query;
    if (error) throw error;
  }
  async function deleteConversationIfExpiredAndEmpty(chat) {
    if (!isLiveMode() || !chat?.id) return false;
    if (!chat.lastMessageAt || Date.now() - chat.lastMessageAt < FIVE_HOURS) return false;
    const { count, error } = await db.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", chat.id).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString());
    if (error) {
      if (isMissingRelationError(error)) return false;
      throw error;
    }
    if (count && count > 0) return false;
    const { error: deleteError } = await db.from("conversations").delete().eq("id", chat.id);
    if (deleteError) throw deleteError;
    state.chats = state.chats.filter((c) => c.id !== chat.id);
    return true;
  }
  async function sendMessage(conversationId, content, options = {}) {
    if (!content.trim()) return;
    const mode = options.privacyMode || state.privacyMode;
    const config = getPrivacyConfig(mode);
    const ttlMs = config.seconds * 1e3;
    const chat = getChat(conversationId);
    if (!isLiveMode() || chat?.placeholder || !isUuid(conversationId)) {
      appendDemoMessage(conversationId, {
        type: "outgoing",
        text: content,
        time: i18n[state.currentLang].now,
        privacyMode: mode,
        replyToId: options.replyTo?.id,
        replyToText: options.replyTo?.text,
        messageType: options.messageType || (options.hidden ? "hidden_text" : "text"),
        hidden: Boolean(options.hidden),
        burnAfterRead: Boolean(config.burnAfterRead),
        expiresAt: new Date(Date.now() + ttlMs).toISOString()
      }, (c) => {
        renderMessages(c);
        renderChats();
        updateChatCountdown(c);
      });
      vibrate(30);
      return;
    }
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + ttlMs).toISOString();
    let { data: inserted, error } = await db.from("messages").insert({
      conversation_id: conversationId,
      sender_id: state.currentProfile.id,
      content,
      message_type: options.messageType || (options.hidden ? "hidden_text" : "text"),
      expires_at: expiresAt,
      privacy_mode: mode,
      burn_after_read: Boolean(config.burnAfterRead)
    }).select("*").single();
    if (error && isMissingRelationError(error)) {
      let fb = await db.from("messages").insert({
        conversation_id: conversationId,
        sender_id: state.currentProfile.id,
        content,
        expires_at: expiresAt
      }).select("*").single();
      if (fb.error && isMissingRelationError(fb.error)) {
        fb = await db.from("messages").insert({
          conversation_id: conversationId,
          sender_id: state.currentProfile.id,
          content
        }).select("*").single();
      }
      inserted = fb.data;
      error = fb.error;
    }
    if (error) throw error;
    vibrate(30);
    if (chat && inserted) {
      const next = mapDbMessage(inserted);
      const messages = chat.messages.neutral || [];
      if (!messages.some((m) => m.id === next.id)) {
        chat.messages.neutral = [...messages, next];
        chat.lastMessageAt = new Date(next.createdAt || now).getTime();
        chat.expiresAt = next.expiresAt ? new Date(next.expiresAt).getTime() : now.getTime() + ttlMs;
        renderMessages(chat);
        renderChats();
        updateChatCountdown(chat);
      }
    }
    const { error: touchError } = await db.from("conversations").update({ last_message_at: now.toISOString() }).eq("id", conversationId);
    if (touchError) throw touchError;
  }
  async function markIncomingMessagesRead(chat) {
    if (!isLiveMode() || !chat?.id || !isUuid(chat.id)) return;
    const unread = getMessages(chat).filter(
      (m) => m.type === "incoming" && !m.readAt && isUuid(m.id)
    );
    if (!unread.length) return;
    const readAt = (/* @__PURE__ */ new Date()).toISOString();
    const ids = unread.map((m) => m.id);
    const { error } = await db.from("messages").update({ read_at: readAt }).in("id", ids);
    if (error) {
      console.warn(error);
      return;
    }
    unread.forEach((m) => {
      m.readAt = readAt;
    });
  }
  function findMessageById(messageId) {
    const chat = getChat(state.activeConversationId || $("chatView")?.dataset.activeChat);
    return getMessages(chat).find((m) => String(m.id) === String(messageId));
  }
  function removeMessageLocally(messageId) {
    const chat = getChat(state.activeConversationId || $("chatView")?.dataset.activeChat);
    if (!chat) return;
    Object.keys(chat.messages || {}).forEach((key) => {
      chat.messages[key] = (chat.messages[key] || []).filter((m) => String(m.id) !== String(messageId));
    });
    const remaining = getMessages(chat);
    const latest = remaining.reduce((acc, m) => {
      if (!m.expiresAt) return acc;
      return Math.max(acc, new Date(m.expiresAt).getTime());
    }, 0);
    chat.expiresAt = latest || Date.now();
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
      const chat = getChat(state.activeConversationId || $("chatView")?.dataset.activeChat);
      if (chat) {
        if (state.replyDraft?.id === messageId) clearReplyDraft();
        renderMessages(chat);
        renderChats();
        updateChatCountdown(chat);
      }
      showToast(i18n[state.currentLang].messageDeleted);
    };
    if (!shell || prefersReducedMotion()) {
      await finish();
      return;
    }
    const text = shell.querySelector(".message-text");
    if (text && (options.natural || options.swipe)) {
      const words = (message.text || "").split(" ");
      text.innerHTML = words.map(
        (w, i) => `<span class="fade-word" style="animation-delay: ${i * 80}ms">${escapeHtml(w)}</span>`
      ).join(" ");
      window.setTimeout(finish, words.length * 80 + 220);
      return;
    }
    shell.classList.add("message-expiring");
    window.setTimeout(finish, 350);
  }
  function updateMessageTimers() {
    document.querySelectorAll(".message-shell[data-message-id]").forEach((shell) => {
      const message = findMessageById(shell.dataset.messageId);
      if (!message) return;
      const bar = shell.querySelector(".message-timer");
      if (!bar) return;
      const remaining = message.expiresAt ? Math.max(0, new Date(message.expiresAt).getTime() - Date.now()) : FIVE_HOURS;
      const ttl = getPrivacyConfig(message?.privacyMode || (message?.burnAfterRead ? "10s_read" : "5h")).seconds;
      const percent = Math.max(0, Math.min(100, remaining / (ttl * 1e3) * 100));
      bar.style.setProperty("--timer-width", `${percent}%`);
      bar.classList.toggle("critical", remaining < 6e5);
      if (remaining <= 0 && !message.expiring) expireMessage(message.id, { natural: true });
    });
  }
  function startMessageTicker() {
    window.clearInterval(state.messageTicker);
    state.messageTicker = window.setInterval(updateMessageTimers, 1e3);
  }
  function startChatCountdown(chat) {
    window.clearInterval(state.countdownTimer);
    updateChatCountdown(chat);
    state.countdownTimer = window.setInterval(() => updateChatCountdown(chat), 3e4);
  }
  function stopChatCountdown() {
    window.clearInterval(state.countdownTimer);
    state.countdownTimer = null;
  }
  function broadcastTyping(eventName) {
    if (!state.activeSubscription || !state.currentProfile?.id) return;
    state.activeSubscription.send({
      type: "broadcast",
      event: eventName,
      payload: { userId: state.currentProfile.id }
    }).catch((e) => console.warn(e));
  }
  function handleComposerTyping() {
    const now = Date.now();
    if (now - state.typingLastSentAt > 2e3) {
      state.typingLastSentAt = now;
      broadcastTyping("typing");
    }
    window.clearTimeout(state.typingStopTimer);
    state.typingStopTimer = window.setTimeout(() => broadcastTyping("stopped_typing"), 3e3);
  }
  function getMessageSummary(message) {
    const text = message?.text || message?.fileName || "";
    return text.length > 72 ? `${text.slice(0, 72)}\u2026` : text;
  }
  function setReplyDraft(message) {
    if (!message) return;
    state.replyDraft = { id: message.id, text: getMessageSummary(message) };
    updateReplyComposer();
    $("messageInput").focus();
  }
  function clearReplyDraft() {
    state.replyDraft = null;
    updateReplyComposer();
  }
  function updateReplyComposer() {
    const composer = $("replyComposer");
    const text = $("replyComposerText");
    const t = i18n[state.currentLang];
    if (!state.replyDraft) {
      composer.hidden = true;
      text.textContent = "";
      return;
    }
    composer.hidden = false;
    text.textContent = t.replyTo.replace("{text}", state.replyDraft.text || "");
    $("cancelReplyBtn").setAttribute("aria-label", t.cancelReply);
  }
  var init_messages = __esm({
    "public/js/messages.js"() {
      init_db();
      init_state();
      init_i18n();
      init_config();
      init_utils();
      init_render();
      init_demo();
    }
  });

  // public/js/requests.js
  async function loadConversationRequests() {
    if (!isLiveMode()) {
      state.conversationRequests = [
        {
          id: "demo-request-incoming",
          requester_id: "demo-rakan",
          target_id: DEMO_PROFILE_ID,
          status: "pending",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          requester: { id: "demo-rakan", public_code: "482913", display_name: state.currentLang === "ar" ? "\u0631\u0627\u0643\u0627\u0646" : "Rakan", avatar_seed: "Rakan" },
          target: { id: DEMO_PROFILE_ID, public_code: "270027", display_name: "27", avatar_seed: "27" }
        },
        {
          id: "demo-request-outgoing",
          requester_id: DEMO_PROFILE_ID,
          target_id: "demo-lina",
          status: "pending",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          requester: { id: DEMO_PROFILE_ID, public_code: "270027", display_name: "27", avatar_seed: "27" },
          target: { id: "demo-lina", public_code: "918204", display_name: state.currentLang === "ar" ? "\u0644\u064A\u0646\u0627" : "Lina", avatar_seed: "Lina" }
        }
      ];
      return [];
    }
    const { data, error } = await db.from("conversation_requests").select(`
      id, requester_id, target_id, status, created_at,
      requester:profiles!conversation_requests_requester_id_fkey(id, public_code, display_name, avatar_seed),
      target:profiles!conversation_requests_target_id_fkey(id, public_code, display_name, avatar_seed)
    `).or(`requester_id.eq.${state.currentProfile.id},target_id.eq.${state.currentProfile.id}`).eq("status", "pending").order("created_at", { ascending: false });
    if (error) {
      if (isMissingRelationError(error)) {
        state.conversationRequests = [];
        return [];
      }
      throw error;
    }
    state.conversationRequests = data || [];
    return state.conversationRequests;
  }
  function isIncomingRequest2(request) {
    if (!isLiveMode()) return request.target_id === DEMO_PROFILE_ID;
    return request.target_id === state.currentProfile?.id;
  }
  async function acceptConversationRequest(requestId, openChat2) {
    const request = state.conversationRequests.find((r) => r.id === requestId);
    if (!request || !isIncomingRequest2(request)) return;
    if (!isLiveMode()) {
      const { createDemoConversationFromCode: createDemoConversationFromCode2 } = await Promise.resolve().then(() => (init_demo(), demo_exports));
      const profile = request.requester;
      const code = profile?.public_code || "482913";
      const chat = createDemoConversationFromCode2(code);
      chat.name = profile?.display_name || chat.name;
      chat.otherProfile = profile || chat.otherProfile;
      state.conversationRequests = state.conversationRequests.filter((r) => r.id !== requestId);
      renderChats();
      showToast(i18n[state.currentLang].accepted);
      openChat2?.(chat.id);
      return;
    }
    let { data: created, error: createError } = await db.from("conversations").insert({
      user_a_id: request.requester_id,
      user_b_id: request.target_id,
      privacy_mode: state.privacyMode,
      last_message_at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "active"
    }).select("id").single();
    if (createError && isMissingRelationError(createError)) {
      const fallback = await db.from("conversations").insert({
        user_a_id: request.requester_id,
        user_b_id: request.target_id,
        last_message_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select("id").single();
      created = fallback.data;
      createError = fallback.error;
    }
    if (createError) throw createError;
    const { error: updateError } = await db.from("conversation_requests").update({ status: "accepted", responded_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", requestId);
    if (updateError && !isMissingRelationError(updateError)) throw updateError;
    const { loadConversations: loadConversations2 } = await Promise.resolve().then(() => (init_conversations(), conversations_exports));
    await loadConversations2();
    showToast(i18n[state.currentLang].accepted);
    if (created?.id) openChat2?.(created.id);
  }
  async function rejectConversationRequest(requestId, block = false) {
    const request = state.conversationRequests.find((r) => r.id === requestId);
    if (!request || !isIncomingRequest2(request)) return;
    if (!isLiveMode()) {
      state.conversationRequests = state.conversationRequests.filter((r) => r.id !== requestId);
      if (block) {
        const profile = request.requester;
        state.blockedChats.unshift({
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
      showToast(block ? i18n[state.currentLang].blocked : i18n[state.currentLang].rejected);
      return;
    }
    if (block) {
      const { error: blockError } = await db.from("blocked_profiles").upsert({ blocker_id: state.currentProfile.id, blocked_id: request.requester_id });
      if (blockError && !isMissingRelationError(blockError)) throw blockError;
    }
    const { error } = await db.from("conversation_requests").update({ status: block ? "blocked" : "rejected", responded_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", requestId);
    if (error && !isMissingRelationError(error)) throw error;
    await loadConversationRequests();
    renderChats();
    showToast(block ? i18n[state.currentLang].blocked : i18n[state.currentLang].rejected);
  }
  function subscribeToRequests() {
    if (!isLiveMode() || state.requestsSubscription) return;
    state.requestsSubscription = db.channel(`requests:${state.currentProfile.id}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "conversation_requests" },
      async () => {
        await loadConversationRequests();
        renderChats();
      }
    ).subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        db.removeChannel(state.requestsSubscription).catch(() => {
        });
        state.requestsSubscription = null;
      }
    });
  }
  var init_requests = __esm({
    "public/js/requests.js"() {
      init_db();
      init_state();
      init_i18n();
      init_config();
      init_utils();
      init_render();
    }
  });

  // public/js/conversations.js
  var conversations_exports = {};
  __export(conversations_exports, {
    blockActiveChat: () => blockActiveChat,
    createConversationDirectly: () => createConversationDirectly,
    deleteAllConversationsNow: () => deleteAllConversationsNow,
    loadConversation: () => loadConversation,
    loadConversations: () => loadConversations,
    startConversationWithCode: () => startConversationWithCode
  });
  async function loadConversations() {
    setLoading(i18n[state.currentLang].loadingChats, true);
    try {
      if (!isLiveMode()) {
        state.chats = demoChats.filter((c) => c.expiresAt > Date.now());
        moveExpiredChatsToBurned();
        renderChats();
        return state.chats;
      }
      await cleanupExpiredMessages();
      let { data, error } = await db.from("conversations").select(`
        id, user_a_id, user_b_id, created_at, last_message_at,
        privacy_mode, status,
        user_a:profiles!conversations_user_a_id_fkey(id, public_code, display_name, avatar_seed),
        user_b:profiles!conversations_user_b_id_fkey(id, public_code, display_name, avatar_seed)
      `).or(`user_a_id.eq.${state.currentProfile.id},user_b_id.eq.${state.currentProfile.id}`).in("status", ["active", "blocked"]).order("last_message_at", { ascending: false, nullsFirst: false });
      if (error && isMissingRelationError(error)) {
        const fb = await db.from("conversations").select(`
          id, user_a_id, user_b_id, created_at, last_message_at,
          user_a:profiles!conversations_user_a_id_fkey(id, public_code, display_name, avatar_seed),
          user_b:profiles!conversations_user_b_id_fkey(id, public_code, display_name, avatar_seed)
        `).or(`user_a_id.eq.${state.currentProfile.id},user_b_id.eq.${state.currentProfile.id}`).order("last_message_at", { ascending: false, nullsFirst: false });
        data = fb.data;
        error = fb.error;
      }
      if (error) throw error;
      const mapped = (data || []).map((row) => {
        const otherProfile = row.user_a_id === state.currentProfile.id ? row.user_b : row.user_a;
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
      state.chats = mapped.filter((c) => c.status !== "blocked").map((c) => {
        const existing = getChat(c.id);
        if (!existing) return c;
        return {
          ...existing,
          ...c,
          burned: false,
          messages: existing.messages || c.messages,
          expiresAt: existing.expiresAt && existing.expiresAt > Date.now() ? existing.expiresAt : c.expiresAt
        };
      });
      state.blockedChats = mapped.filter((c) => c.status === "blocked");
      state.burnedChats = state.burnedChats.slice(0, 12);
      await loadConversationRequests();
      renderChats();
      return state.chats;
    } finally {
      setLoading("", false);
    }
  }
  async function startConversationWithCode(code, onOpenChat) {
    if (!/^\d{6}$/.test(code)) {
      flashError(i18n[state.currentLang].invalidCode);
      return null;
    }
    if (!isLiveMode()) {
      const chat = createDemoConversationFromCode(code);
      renderChats();
      onOpenChat?.(chat.id);
      return chat.id;
    }
    let { data: target, error: targetError } = await db.from("profiles").select("*").eq("public_code", code).eq("code_visible", true).maybeSingle();
    if (targetError && isMissingRelationError(targetError)) {
      const fb = await db.from("profiles").select("*").eq("public_code", code).maybeSingle();
      target = fb.data;
      targetError = fb.error;
    }
    if (targetError) throw targetError;
    if (!target) {
      flashError(i18n[state.currentLang].codeNotFound);
      return null;
    }
    if (target.id === state.currentProfile.id) {
      flashError(i18n[state.currentLang].cannotChatSelf);
      return null;
    }
    const { data: blocked, error: blockError } = await db.from("blocked_profiles").select("blocker_id").or(`and(blocker_id.eq.${state.currentProfile.id},blocked_id.eq.${target.id}),and(blocker_id.eq.${target.id},blocked_id.eq.${state.currentProfile.id})`).maybeSingle();
    if (blockError && !isMissingRelationError(blockError)) throw blockError;
    if (blocked) {
      flashError(i18n[state.currentLang].blocked);
      return null;
    }
    const { data: existing, error: findError } = await db.from("conversations").select("id").or(`and(user_a_id.eq.${state.currentProfile.id},user_b_id.eq.${target.id}),and(user_a_id.eq.${target.id},user_b_id.eq.${state.currentProfile.id})`).maybeSingle();
    if (findError) throw findError;
    if (existing?.id) {
      await loadConversations();
      onOpenChat?.(existing.id);
      return existing.id;
    }
    const { data: existingRequest, error: rfError } = await db.from("conversation_requests").select("id, status").or(`and(requester_id.eq.${state.currentProfile.id},target_id.eq.${target.id}),and(requester_id.eq.${target.id},target_id.eq.${state.currentProfile.id})`).eq("status", "pending").maybeSingle();
    if (rfError && !isMissingRelationError(rfError)) throw rfError;
    if (existingRequest) {
      showToast(i18n[state.currentLang].requestExists);
      return null;
    }
    const { error: createError } = await db.from("conversation_requests").insert({ requester_id: state.currentProfile.id, target_id: target.id, status: "pending" });
    if (createError) {
      if (isMissingRelationError(createError)) {
        const directId = await createConversationDirectly(target.id);
        if (directId) {
          await loadConversations();
          onOpenChat?.(directId);
          return directId;
        }
        flashError(i18n[state.currentLang].errorChats);
        return null;
      }
      throw createError;
    }
    await loadConversationRequests();
    renderChats();
    showToast(i18n[state.currentLang].requestSent);
    return null;
  }
  async function createConversationDirectly(targetId, mode = state.privacyMode) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    let { data, error } = await db.from("conversations").insert({
      user_a_id: state.currentProfile.id,
      user_b_id: targetId,
      privacy_mode: mode,
      last_message_at: now,
      status: "active"
    }).select("id").single();
    if (error && isMissingRelationError(error)) {
      const fb = await db.from("conversations").insert({
        user_a_id: state.currentProfile.id,
        user_b_id: targetId,
        last_message_at: now
      }).select("id").single();
      data = fb.data;
      error = fb.error;
    }
    if (error) throw error;
    return data?.id || null;
  }
  async function loadConversation(conversationId, onExpired) {
    state.activeConversationId = conversationId;
    const chat = getChat(conversationId);
    setLoading(i18n[state.currentLang].loadingConversation, true);
    try {
      if (!isLiveMode() || chat?.placeholder) {
        renderMessages(chat);
        startChatCountdown(chat);
        return;
      }
      if (state.activeSubscription) {
        await db.removeChannel(state.activeSubscription);
        state.activeSubscription = null;
      }
      await cleanupExpiredMessages(conversationId);
      const { data, error } = await db.from("messages").select("*").eq("conversation_id", conversationId).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", { ascending: true });
      if (error) throw error;
      chat.messages = { neutral: (data || []).map(mapDbMessage) };
      await markIncomingMessagesRead(chat);
      const removed = await deleteConversationIfExpiredAndEmpty(chat);
      if (removed) {
        renderChats();
        showToast(i18n[state.currentLang].expired);
        onExpired?.();
        return;
      }
      renderMessages(chat);
      startChatCountdown(chat);
      state.activeSubscription = db.channel(`messages:${conversationId}:${Date.now()}`).on(
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
          const next = mapDbMessage(payload.new);
          const messages = activeChat.messages.neutral || [];
          if (messages.some((m) => m.id === next.id)) return;
          activeChat.messages.neutral = [...messages, next];
          activeChat.lastMessageAt = new Date(payload.new.created_at).getTime();
          activeChat.expiresAt = new Date(payload.new.expires_at).getTime();
          if (next.type === "incoming") vibrate(15);
          renderMessages(activeChat);
          renderChats();
          updateChatCountdown(activeChat);
        }
      ).on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.userId === state.currentProfile?.id) return;
        state.typing = true;
        renderMessages(getChat(conversationId));
      }).on("broadcast", { event: "stopped_typing" }, (payload) => {
        if (payload.payload?.userId === state.currentProfile?.id) return;
        state.typing = false;
        renderMessages(getChat(conversationId));
      }).subscribe((status) => {
        if (status === "SUBSCRIBED") showToast(i18n[state.currentLang].realtimeConnected);
      });
    } finally {
      setLoading("", false);
    }
  }
  async function deleteAllConversationsNow() {
    if (!isLiveMode() || !state.currentProfile) {
      state.chats = [];
      renderChats();
      return;
    }
    const { error } = await db.from("conversations").delete().or(`user_a_id.eq.${state.currentProfile.id},user_b_id.eq.${state.currentProfile.id}`);
    if (error) throw error;
    state.chats = [];
    state.burnedChats = [];
    state.blockedChats = [];
    renderChats();
    showToast(i18n[state.currentLang].deletedAll);
  }
  async function blockActiveChat() {
    const chat = getChat($("chatView").dataset.activeChat);
    const otherId = chat?.otherProfile?.id;
    if (!otherId || !isLiveMode()) return;
    const { error } = await db.from("blocked_profiles").upsert({ blocker_id: state.currentProfile.id, blocked_id: otherId });
    if (error) throw error;
    await db.from("conversations").update({ status: "blocked" }).eq("id", chat.id);
    state.chats = state.chats.filter((c) => c.id !== chat.id);
    state.blockedChats.unshift({ ...chat, status: "blocked", online: false });
    renderChats();
    showToast(i18n[state.currentLang].blocked);
  }
  var init_conversations = __esm({
    "public/js/conversations.js"() {
      init_db();
      init_state();
      init_i18n();
      init_config();
      init_utils();
      init_render();
      init_messages();
      init_demo();
      init_requests();
    }
  });

  // public/js/app-entry.js
  init_db();
  init_state();
  init_i18n();
  init_demo();
  init_utils();

  // public/js/lang.js
  init_state();
  init_i18n();
  init_utils();
  init_render();

  // public/js/profile.js
  init_db();
  init_state();
  init_i18n();
  init_config();
  init_utils();
  async function getOrCreateProfile() {
    if (!db) return null;
    async function getAuthUser() {
      const { data, error } = await db.auth.getUser();
      if (error) throw error;
      if (!data?.user) throw new Error("Anonymous auth user was not established.");
      return data.user;
    }
    async function insertProfile(authUser) {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const profile = {
          id: authUser.id,
          public_code: randomPublicCode(),
          code_visible: true,
          display_name: state.displayName,
          avatar_seed: state.displayName || randomPublicCode()
        };
        let { data, error } = await db.from("profiles").insert(profile).select("*").single();
        if (error && isMissingRelationError(error)) {
          const fallback = { ...profile };
          delete fallback.code_visible;
          const r = await db.from("profiles").insert(fallback).select("*").single();
          data = r.data;
          error = r.error;
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
    user = await getAuthUser();
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
      const created = await insertProfile(user);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(created));
      return created;
    } catch (error) {
      const msg = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
      const isRls = error?.code === "42501" || msg.includes("row-level security");
      if (!isRls) throw error;
      console.warn("profiles insert failed with RLS; retrying", error);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      user = await getAuthUser();
      const created = await insertProfile(user);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(created));
      return created;
    }
  }
  function updateProfileCodeUI() {
    const card = $("profileCodeCard");
    if (!card) return;
    const t = i18n[state.currentLang];
    $("profileCodeKicker").textContent = t.profileCodeKicker;
    $("profileCodeLabel").textContent = t.profileCodeLabel;
    $("copyCodeBtn").textContent = t.copyMyCode;
    $("copyLinkBtn").textContent = t.copyMyLink;
    $("profileQrBtn").setAttribute("aria-label", t.shareQr);
    $("profileQrBtn").title = t.shareQr;
    const profile = state.currentProfile;
    if (profile?.public_code) {
      card.hidden = false;
      card.removeAttribute("hidden");
      const codeDisplay = profile.code_visible === false ? "\u2022\u2022\u2022\u2022\u2022\u2022" : profile.public_code;
      $("profileCodeValue").textContent = codeDisplay;
      const chip = $("headerCodeChip");
      const chipVal = $("headerCodeValue");
      if (chip && chipVal) {
        chipVal.textContent = codeDisplay;
        chip.hidden = false;
      }
      const qrBtn = $("headerQrBtn");
      if (qrBtn) qrBtn.hidden = profile.code_visible === false;
    }
  }
  async function copyProfileCode() {
    if (!state.currentProfile?.public_code || state.currentProfile.code_visible === false) return;
    const code = state.currentProfile.public_code;
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
        const tmp = document.createElement("textarea");
        tmp.value = code;
        tmp.setAttribute("readonly", "");
        tmp.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(tmp);
        tmp.select();
        copied = document.execCommand("copy");
        tmp.remove();
      }
      showToast(copied ? i18n[state.currentLang].copied : code);
    } catch (error) {
      handleAsyncError(error, i18n[state.currentLang].errorChats);
    }
  }
  async function copyProfileLink() {
    if (!state.currentProfile?.public_code || state.currentProfile.code_visible === false) return;
    const link = getShareLink();
    try {
      if (navigator.share) {
        await navigator.share({ url: link, title: "27 \u2014 " + state.currentProfile.public_code });
        return;
      }
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(link);
      showToast(i18n[state.currentLang].copied);
    } catch (error) {
      if (error.name !== "AbortError") handleAsyncError(error, link);
    }
  }
  async function toggleCodeVisibility() {
    if (!isLiveMode() || !state.currentProfile) return;
    const nextVisible = state.currentProfile.code_visible === false;
    state.currentProfile = { ...state.currentProfile, code_visible: nextVisible };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.currentProfile));
    updateProfileCodeUI();
    const { data, error } = await db.from("profiles").update({ code_visible: nextVisible }).eq("id", state.currentProfile.id).select("*").single();
    if (error && !isMissingRelationError(error)) throw error;
    state.currentProfile = error ? state.currentProfile : data;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.currentProfile));
    updateProfileCodeUI();
  }
  async function regenerateCode() {
    if (!isLiveMode() || !state.currentProfile) return;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const publicCode = randomPublicCode();
      const { data, error } = await db.from("profiles").update({ public_code: publicCode, code_visible: true }).eq("id", state.currentProfile.id).select("*").single();
      if (!error || isMissingRelationError(error)) {
        if (error) {
          const fallback = await db.from("profiles").update({ public_code: publicCode }).eq("id", state.currentProfile.id).select("*").single();
          if (fallback.error) {
            if (fallback.error.code !== "23505") throw fallback.error;
            continue;
          }
          state.currentProfile = { ...fallback.data, code_visible: true };
        } else {
          state.currentProfile = data;
        }
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.currentProfile));
        updateProfileCodeUI();
        showToast(i18n[state.currentLang].codeRegenerated);
        return;
      }
      if (error.code !== "23505") throw error;
    }
  }

  // public/js/settings.js
  init_db();
  init_state();
  init_i18n();
  init_config();
  init_utils();
  init_render();
  async function saveSettings() {
    state.displayName = $("displayNameInput").value.trim() || (state.currentLang === "ar" ? "\u0632\u0627\u0626\u0631 27" : "Guest 27");
    $("displayNameInput").value = state.displayName;
    try {
      if (isLiveMode()) {
        const { data, error } = await db.from("profiles").update({ display_name: state.displayName, avatar_seed: state.displayName }).eq("id", state.currentProfile.id).select("*").single();
        if (error) throw error;
        if (data) {
          state.currentProfile = data;
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
        }
      }
      showToast(i18n[state.currentLang].settingsSaved);
      renderChats();
    } catch (error) {
      handleAsyncError(error, i18n[state.currentLang].errorChats);
    }
  }
  function setBurnMode(enabled) {
    state.privacyMode = enabled ? "10s_read" : $("privacyModeSelect").value === "10s_read" ? "5h" : $("privacyModeSelect").value;
    $("privacyModeSelect").value = state.privacyMode;
    updatePrivacyModeUI();
  }
  function updatePrivacyModeUI() {
    const isBurn = state.privacyMode === "10s_read";
    $("burnToggle").classList.toggle("active", isBurn);
    $("messageInput").classList.toggle("burn-active", isBurn);
    $("burnToggle").setAttribute("aria-pressed", String(isBurn));
    $("privacyModeLabel").textContent = i18n[state.currentLang].privacyModeLabel;
  }
  async function changePrivacyMode(mode) {
    state.privacyMode = mode;
    updatePrivacyModeUI();
    const chat = getChat($("chatView").dataset.activeChat);
    if (chat) chat.privacyMode = mode;
    if (isLiveMode() && chat?.id && isUuid(chat.id)) {
      const { error } = await db.from("conversations").update({ privacy_mode: mode }).eq("id", chat.id);
      if (error) console.warn(error);
    }
  }
  function setHiddenMode(enabled) {
    state.hiddenMode = enabled;
    $("hiddenToggle").classList.toggle("active", state.hiddenMode);
    $("messageInput").classList.toggle("hidden-active", state.hiddenMode);
    $("hiddenToggle").setAttribute("aria-pressed", String(state.hiddenMode));
    if (enabled) showToast(i18n[state.currentLang].hiddenActive);
  }
  function updateSettingsToggles() {
    const hideChatsBtn = $("panicModeBtn");
    hideChatsBtn.classList.toggle("is-on", state.chatsHidden);
    hideChatsBtn.setAttribute("aria-checked", String(state.chatsHidden));
    const hideCodeActive = state.currentProfile?.code_visible === false;
    const codeBtn = $("toggleCodeBtn");
    codeBtn.classList.toggle("is-on", hideCodeActive);
    codeBtn.setAttribute("aria-checked", String(hideCodeActive));
  }
  function toggleChatsHidden() {
    state.chatsHidden = !state.chatsHidden;
    localStorage.setItem(HIDE_CHATS_STORAGE_KEY, state.chatsHidden ? "1" : "0");
    updateSettingsToggles();
    renderChats();
  }
  function setPanicMode(enabled) {
    state.panicMode = enabled;
    $("panicScreen").hidden = !state.panicMode;
    document.body.classList.toggle("panic-active", state.panicMode);
  }
  function resetIdleLock() {
    window.clearTimeout(state.idleLockTimer);
    state.idleLockTimer = window.setTimeout(() => {
      if (!$("chatView").hidden) setPanicMode(true);
    }, 6e4);
  }
  async function openQrModal() {
    if (state.currentProfile?.code_visible === false) return;
    const code = state.currentProfile?.public_code || $("profileCodeValue")?.textContent?.trim();
    if (!code || code === "------") return;
    state.qrModalOpen = true;
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
      handleAsyncError(error, i18n[state.currentLang].errorChats);
    }
  }
  function closeQrModal() {
    state.qrModalOpen = false;
    $("qrModal").hidden = true;
  }

  // public/js/temporary.js
  init_db();
  init_state();
  init_i18n();
  init_config();
  init_utils();
  async function createTemporaryShareLink(type) {
    const link = getTemporaryShareLink(type);
    if (isLiveMode()) {
      const { error } = await db.from("temporary_links").insert({
        owner_id: state.currentProfile.id,
        token: link.token,
        link_type: type === "room" ? "room" : "ask",
        expires_at: new Date(Date.now() + MESSAGE_TTL_SECONDS * 1e3).toISOString()
      });
      if (error && !isMissingRelationError(error)) throw error;
    }
    return link.url;
  }
  async function showShareDrop(type) {
    const t = i18n[state.currentLang];
    state.generatedShareLink = await createTemporaryShareLink(type);
    $("shareDropBackdrop").hidden = false;
    $("shareDrop").hidden = false;
    $("shareDropKicker").textContent = t.shareReady;
    $("shareDropTitle").textContent = type === "room" ? t.roomShareTitle : t.askShareTitle;
    $("shareDropDesc").textContent = type === "room" ? t.roomShareDesc : t.askShareDesc;
    $("shareLinkInput").value = state.generatedShareLink;
    $("copyShareLinkBtn").textContent = t.copy;
    showToast(t.linkCreated);
    vibrate(20);
  }
  async function copyGeneratedShareLink() {
    const link = state.generatedShareLink || $("shareLinkInput")?.value;
    if (!link) return;
    try {
      if (navigator.share) {
        await navigator.share({ url: link, title: "27" });
        return;
      }
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
      showToast(copied ? i18n[state.currentLang].copied : link);
    } catch (error) {
      if (error.name !== "AbortError") handleAsyncError(error, link);
    }
  }
  function showEntryCard(type, token) {
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
  function handleTemporaryEntryParams() {
    const params = new URLSearchParams(window.location.search);
    const ask = params.get("ask");
    const room = params.get("room");
    if (ask) showEntryCard("ask", ask);
    if (room) showEntryCard("room", room);
  }
  async function submitTemporaryEntry() {
    const text = $("entryMessageInput").value.trim();
    if (!text) return;
    const token = $("entryCard").dataset.token || createMessageId(state.entryMode === "room" ? "ROOM" : "ASK");
    const entry = {
      id: createMessageId("entry"),
      token,
      mode: state.entryMode || "ask",
      text,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: new Date(Date.now() + MESSAGE_TTL_SECONDS * 1e3).toISOString()
    };
    if (isLiveMode()) {
      const { data: link, error: linkError } = await db.from("temporary_links").select("id, owner_id, link_type").eq("token", token).maybeSingle();
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
          showToast(i18n[state.currentLang].entryQueued);
          return;
        }
        console.warn(error);
      }
    }
    const key = "twentyseven_temporary_entries";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 24)));
    $("entryMessageInput").value = "";
    showToast(i18n[state.currentLang].entryQueued);
  }
  function closeShareDrop() {
    const bd = $("shareDropBackdrop");
    const sd = $("shareDrop");
    if (bd) bd.hidden = true;
    if (sd) sd.hidden = true;
  }

  // public/js/lang.js
  init_messages();
  function setLanguage(lang) {
    state.currentLang = lang;
    const t = i18n[lang];
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    $("headerStatus").textContent = isLiveMode() ? t.headerStatusLive : t.headerStatus;
    $("langToggle").textContent = t.langToggle;
    $("settingsToggle").textContent = t.settings;
    $("heroTagline").textContent = t.heroTagline;
    $("heroLine1").textContent = t.heroLine1;
    if ($("heroLine2")) $("heroLine2").textContent = t.heroLine2 || "";
    if ($("secondaryOptionsLabel")) $("secondaryOptionsLabel").textContent = t.secondaryOptionsLabel || "\u062E\u064A\u0627\u0631\u0627\u062A \u0623\u062E\u0631\u0649";
    $("codeInput").placeholder = t.inputPlaceholder;
    $("startBtn").textContent = t.startBtn;
    $("askActionTitle").textContent = t.askActionTitle;
    $("askActionHint").textContent = t.askActionHint;
    $("roomActionTitle").textContent = t.roomActionTitle;
    $("roomActionHint").textContent = t.roomActionHint;
    $("copyShareLinkBtn").textContent = t.copy;
    if (!$("shareDrop").hidden) $("shareDropKicker").textContent = t.shareReady;
    if (!$("entryCard").hidden) {
      showEntryCard(state.entryMode || "ask", $("entryCard").dataset.token || "");
    }
    $("chatsHeader").textContent = t.chatsHeader;
    if ($("emptyText")) $("emptyText").textContent = t.emptyText;
    $("footerText").textContent = state.currentProfile?.public_code ? t.footerTextWithCode.replace("{code}", state.currentProfile.public_code) : t.footerText;
    $("backToChats").textContent = t.back;
    $("backFromSettings").textContent = t.back;
    $("chatViewStatus").textContent = t.chatExpiry;
    $("messageInput").placeholder = t.messagePlaceholder;
    $("sendBtn").textContent = t.send;
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
    $("codeVisibilityLabel").textContent = state.currentProfile?.code_visible === false ? t.showCode : t.hideCode;
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
    updateProfileCodeUI();
    updateSettingsToggles();
    updateReplyComposer();
    if (!$("displayNameInput").dataset.edited) {
      state.displayName = lang === "ar" ? "\u0632\u0627\u0626\u0631 27" : "Guest 27";
      $("displayNameInput").value = state.currentProfile?.display_name || state.displayName;
    }
    renderChats();
    if (!$("chatView").hidden) {
      const active = $("chatView").dataset.activeChat;
      const chat = getChat(active);
      if (chat) {
        $("chatViewName").textContent = chat.names?.[state.currentLang] || chat.otherProfile?.display_name || chat.name || chat.id;
        updateChatCountdown(chat);
        updatePrivacyModeUI();
        renderMessages(chat);
      }
    }
  }

  // public/js/app-entry.js
  init_conversations();
  init_requests();
  init_messages();
  init_demo();
  init_render();

  // public/js/routing.js
  init_db();
  init_state();
  init_i18n();
  init_utils();
  init_render();
  init_conversations();
  init_messages();
  init_utils();
  init_demo();
  function showHome() {
    stopChatCountdown();
    const divider = document.querySelector(".section-divider");
    if (divider) divider.hidden = true;
    $("chatsSection").hidden = false;
    $("chatView").hidden = true;
    $("settingsView").hidden = true;
  }
  async function openChat(chatId) {
    const chat = getChat(chatId);
    const t = i18n[state.currentLang];
    if (!chat) {
      showToast(t.expired);
      showHome();
      renderChats();
      window.location.hash = "";
      return;
    }
    $("heroSection").hidden = true;
    const chatDivider = document.querySelector(".section-divider");
    if (chatDivider) chatDivider.hidden = true;
    $("chatsSection").hidden = true;
    $("settingsView").hidden = true;
    $("chatView").hidden = false;
    $("chatView").dataset.activeChat = chat.id;
    $("chatViewName").textContent = getChatName(chat);
    $("chatViewStatus").textContent = t.loadingConversation;
    $("messageForm").hidden = false;
    const privacyBar = document.querySelector(".chat-privacy-bar");
    if (privacyBar) privacyBar.hidden = false;
    state.privacyMode = chat.privacyMode || "5h";
    $("privacyModeSelect").value = state.privacyMode;
    updatePrivacyModeUI();
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
      await loadConversation(chat.id, () => {
        showHome();
        window.location.hash = "";
      });
    } catch (error) {
      handleAsyncError(error, t.errorChats);
    }
  }
  async function closeChat() {
    const chat = getChat(state.activeConversationId);
    if (chat?.privacyMode === "close" && state.chats.some((c) => c.id === chat.id)) {
      if (isLiveMode() && isUuid(chat.id)) {
        await db.from("messages").delete().eq("conversation_id", chat.id);
      } else {
        chat.messages = { neutral: [] };
      }
      chat.burned = true;
      state.burnedChats.unshift({ ...chat, burned: true });
      state.chats = state.chats.filter((c) => c.id !== chat.id);
    }
    if (state.activeSubscription && db) {
      db.removeChannel(state.activeSubscription).catch(() => {
      });
      state.activeSubscription = null;
    }
    state.activeConversationId = "";
    showHome();
    window.location.hash = "";
  }
  function openSettings() {
    $("heroSection").hidden = true;
    const settingsDivider = document.querySelector(".section-divider");
    if (settingsDivider) settingsDivider.hidden = true;
    $("settingsView").hidden = false;
    window.location.hash = "#settings";
  }
  function closeSettings() {
    showHome();
    window.location.hash = "";
  }
  async function openRouteFromHash() {
    const route = window.location.hash.replace("#", "");
    if (route.startsWith("chat/")) {
      const chatId = decodeURIComponent(route.slice(5));
      if (!getChat(chatId) && demoChats.some((c) => c.id === chatId)) {
        state.chats.unshift(demoChats.find((c) => c.id === chatId));
        renderChats();
      }
      await openChat(chatId);
      return;
    }
    if (route === "settings") openSettings();
  }

  // public/js/gestures.js
  init_state();
  init_i18n();
  init_config();
  init_utils();
  init_render();
  init_messages();
  function attachSwipeToMessages() {
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
  function openMessageActions(messageId) {
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
  function closeMessageActions() {
    state.activeActionMessageId = "";
    $("messageActions").hidden = true;
  }
  function getActiveActionMessage() {
    return state.activeActionMessageId ? findMessageById(state.activeActionMessageId) : null;
  }
  async function copyActiveMessage() {
    const message = getActiveActionMessage();
    if (!message?.text) return;
    await navigator.clipboard?.writeText(message.text);
    closeMessageActions();
    showToast(i18n[state.currentLang].copiedMessage);
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
    renderMessages(getChat(state.activeConversationId || $("chatView")?.dataset.activeChat));
    showToast(i18n[state.currentLang].reactionAdded);
  }

  // public/js/media.js
  init_state();
  init_i18n();
  init_utils();
  init_messages();
  init_demo();
  init_render();
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
      await sendMessage(conversationId, text, { privacyMode: state.privacyMode, messageType: "gif" });
      closeMediaSheet();
      showToast(i18n[state.currentLang].gifSent);
      return;
    }
    appendDemoMessage(conversationId, {
      type: "outgoing",
      text,
      time: i18n[state.currentLang].now,
      messageType: "gif",
      privacyMode: state.privacyMode,
      expiresAt: new Date(Date.now() + getPrivacyConfig(state.privacyMode).seconds * 1e3).toISOString()
    }, (c) => {
      renderMessages(c);
      renderChats();
      updateChatCountdown(c);
    });
    closeMediaSheet();
    showToast(i18n[state.currentLang].gifSent);
  }
  function startVoiceRecording() {
    if ($("chatView").hidden || state.voiceRecording) return;
    state.voiceRecording = { startedAt: Date.now() };
    $("voiceBtn").classList.add("recording");
    $("voiceBtn").textContent = "\u25A0";
    showToast(i18n[state.currentLang].voiceRecording);
    vibrate(15);
  }
  async function finishVoiceRecording(cancel = false) {
    if (!state.voiceRecording) return;
    const startedAt = state.voiceRecording.startedAt;
    state.voiceRecording = null;
    $("voiceBtn").classList.remove("recording");
    $("voiceBtn").textContent = "\u25CF";
    if (cancel) return;
    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1e3));
    const conversationId = $("chatView").dataset.activeChat;
    const duration = `0:${String(seconds).padStart(2, "0")}`;
    if (isLiveMode() && isUuid(conversationId)) {
      await sendMessage(conversationId, duration, { privacyMode: state.privacyMode, messageType: "voice" });
      showToast(i18n[state.currentLang].voiceSent);
      return;
    }
    appendDemoMessage(conversationId, {
      type: "outgoing",
      text: duration,
      time: i18n[state.currentLang].now,
      messageType: "voice",
      privacyMode: state.privacyMode,
      expiresAt: new Date(Date.now() + getPrivacyConfig(state.privacyMode).seconds * 1e3).toISOString()
    }, (c) => {
      renderMessages(c);
      renderChats();
      updateChatCountdown(c);
    });
    showToast(i18n[state.currentLang].voiceSent);
  }

  // public/js/pwa.js
  init_db();
  init_state();
  init_config();
  init_utils();
  async function registerPwa() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn(e);
      }
    }
    if (Notification.permission !== "granted") return;
    try {
      const registration = await navigator.serviceWorker.register(`${getAppBasePath()}sw.js`);
      if (VAPID_PUBLIC_KEY && state.currentProfile?.id && db && registration.pushManager) {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        await db.from("push_subscriptions").upsert(
          {
            user_id: state.currentProfile.id,
            endpoint: subscription.endpoint,
            subscription: subscription.toJSON()
          },
          { onConflict: "endpoint" }
        );
      }
    } catch (error) {
      console.warn(error);
    }
  }

  // public/js/onboarding.js
  init_state();
  init_config();
  init_utils();
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
    const hint = $("onboardingHint");
    if (hint) {
      hint.textContent = state.currentLang === "en" ? "This is your code \u2014 share it to start an anonymous chat" : "\u0647\u0630\u0627 \u0631\u0642\u0645\u0643 \u0627\u0644\u062E\u0627\u0635 \u2014 \u0634\u0627\u0631\u0643\u0647 \u0644\u0628\u062F\u0621 \u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u062C\u0647\u0648\u0644\u0629";
    }
    const ar = state.currentLang !== "en";
    const steps = ar ? ["\u0647\u0630\u0627 \u0631\u0642\u0645\u0643 \u0627\u0644\u062E\u0627\u0635 \u{1F446}", "\u0634\u0627\u0631\u0643\u0647 \u0645\u0639 \u0645\u0646 \u062A\u0631\u064A\u062F", "\u0633\u062A\u0635\u0644\u0643 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0647\u0646\u0627 \u2713"] : ["This is your code \u{1F446}", "Share it with anyone", "Chats will appear here \u2713"];
    let currentStep = 0;
    if (hint) hint.textContent = steps[0];
    let i = 0;
    const typeNext = () => {
      if (i < randomCode.length) {
        code.textContent += randomCode[i++];
        window.setTimeout(typeNext, 110);
        return;
      }
      const cycleHints = () => {
        currentStep = (currentStep + 1) % steps.length;
        if (hint) hint.textContent = steps[currentStep];
      };
      const hintTimer = window.setInterval(cycleHints, 1800);
      const dismiss = () => {
        window.clearInterval(hintTimer);
        screen.classList.add("done");
        window.setTimeout(() => {
          screen.hidden = true;
          screen.classList.remove("done");
          localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
          onComplete();
        }, 350);
      };
      screen.addEventListener("click", dismiss, { once: true });
      window.setTimeout(dismiss, 6e3);
    };
    typeNext();
  }

  // public/js/app-entry.js
  async function handleStartChat() {
    const input = $("codeInput");
    const code = input.value.trim();
    if (!/^\d{6}$/.test(code)) {
      input.focus();
      input.style.borderColor = "rgba(244, 63, 94, 0.5)";
      flashError(i18n[state.currentLang].invalidCode);
      window.setTimeout(() => {
        input.style.borderColor = "";
      }, 1200);
      return;
    }
    try {
      setButtonBusy($("startBtn"), true, i18n[state.currentLang].searchingCode);
      const conversationId = await startConversationWithCode(code);
      if (conversationId) {
        input.value = "";
        showToast(i18n[state.currentLang].starting);
      }
    } catch (error) {
      handleAsyncError(error, i18n[state.currentLang].errorChats);
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
      setButtonBusy($("sendBtn"), true, i18n[state.currentLang].sendingMessage);
      if (file && !isLiveMode()) {
        appendDemoMessage(conversationId, {
          type: "outgoing",
          text,
          time: i18n[state.currentLang].now,
          mediaUrl: URL.createObjectURL(file),
          mediaType: file.type,
          fileName: file.name
        });
      }
      if (file && isLiveMode()) {
        showToast(i18n[state.currentLang].mediaStorage);
      }
      if (text) {
        await sendMessage(conversationId, text, {
          privacyMode: state.privacyMode,
          replyTo: state.replyDraft,
          hidden: state.hiddenMode
        });
      }
      input.value = "";
      mediaInput.value = "";
      clearReplyDraft();
      setHiddenMode(false);
      if (state.privacyMode === "10s_read") setBurnMode(false);
    } catch (error) {
      handleAsyncError(error, i18n[state.currentLang].errorChats);
    } finally {
      setButtonBusy($("sendBtn"), false);
    }
  }
  async function boot() {
    setLoading(i18n[state.currentLang].loadingChats, true);
    state.chats = demoChats.filter((chat) => chat.expiresAt > Date.now());
    setLanguage(state.currentLang);
    const sharedCode = new URLSearchParams(window.location.search).get("code");
    if (sharedCode && /^\d{6}$/.test(sharedCode)) {
      $("codeInput").value = sharedCode;
    }
    handleTemporaryEntryParams();
    if (!db) {
      setLoading("", false);
      await loadConversationRequests();
      renderChats();
      startMessageTicker();
      registerPwa();
      showToast(i18n[state.currentLang].demoMode);
      return;
    }
    try {
      state.currentProfile = await getOrCreateProfile();
      state.displayName = state.currentProfile.display_name || state.displayName;
      $("displayNameInput").value = state.displayName;
      updateProfileCodeUI();
      registerPwa();
      await loadConversations();
      subscribeToRequests();
      setLanguage(state.currentLang);
      await openRouteFromHash();
      startMessageTicker();
    } catch (error) {
      handleAsyncError(error, i18n[state.currentLang].errorChats);
      renderChats();
    } finally {
      setLoading("", false);
    }
  }
  $("langToggle").addEventListener("click", () => {
    setLanguage(state.currentLang === "ar" ? "en" : "ar");
  });
  $("settingsToggle").addEventListener("click", openSettings);
  $("backFromSettings").addEventListener("click", closeSettings);
  $("saveSettingsBtn").addEventListener("click", saveSettings);
  $("copyCodeBtn").addEventListener("click", copyProfileCode);
  $("copyLinkBtn").addEventListener("click", copyProfileLink);
  $("toggleCodeBtn").addEventListener(
    "click",
    () => toggleCodeVisibility().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
  );
  $("regenerateCodeBtn").addEventListener(
    "click",
    () => regenerateCode().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
  );
  $("deleteAllBtn").addEventListener(
    "click",
    () => deleteAllConversationsNow().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
  );
  $("createAskLinkBtn").addEventListener(
    "click",
    () => showShareDrop("ask").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
  );
  $("createRoomLinkBtn").addEventListener(
    "click",
    () => showShareDrop("room").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
  );
  $("copyShareLinkBtn").addEventListener("click", copyGeneratedShareLink);
  $("entrySendBtn").addEventListener(
    "click",
    () => submitTemporaryEntry().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
  );
  $("profileQrBtn").addEventListener("click", openQrModal);
  $("shareQrBtn").addEventListener("click", openQrModal);
  $("closeQrModal").addEventListener("click", closeQrModal);
  $("qrBackdrop").addEventListener("click", closeQrModal);
  $("copyQrCodeBtn").addEventListener("click", copyProfileCode);
  $("panicModeBtn").addEventListener("click", toggleChatsHidden);
  $("burnToggle").addEventListener(
    "click",
    () => setBurnMode(state.privacyMode !== "10s_read")
  );
  $("hiddenToggle").addEventListener(
    "click",
    () => setHiddenMode(!state.hiddenMode)
  );
  $("privacyModeSelect").addEventListener(
    "change",
    (event) => changePrivacyMode(event.target.value).catch(
      (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
    )
  );
  var panicPressTimer = null;
  $("fakeNotesArea").addEventListener("pointerdown", () => {
    panicPressTimer = window.setTimeout(() => setPanicMode(false), 1500);
  });
  $("fakeNotesArea").addEventListener(
    "pointerup",
    () => window.clearTimeout(panicPressTimer)
  );
  $("fakeNotesArea").addEventListener(
    "pointerleave",
    () => window.clearTimeout(panicPressTimer)
  );
  $("startBtn").addEventListener("click", handleStartChat);
  $("codeInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleStartChat();
  });
  document.addEventListener("click", (event) => {
    const requestItem = event.target.closest(".request-item");
    if (requestItem) {
      const requestId = requestItem.dataset.requestId;
      if (event.target.closest(".accept-request")) {
        acceptConversationRequest(requestId).catch(
          (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
        );
        return;
      }
      if (event.target.closest(".reject-request")) {
        rejectConversationRequest(requestId).catch(
          (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
        );
        return;
      }
      if (event.target.closest(".reject-block-request")) {
        rejectConversationRequest(requestId, true).catch(
          (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
        );
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
  $("backToChats").addEventListener(
    "click",
    () => closeChat().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
  );
  $("blockChatBtn").addEventListener(
    "click",
    () => blockActiveChat().catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats))
  );
  $("messageForm").addEventListener("submit", handleSendMessage);
  $("messageInput").addEventListener("input", handleComposerTyping);
  $("mediaInput").addEventListener("change", () => {
    if ($("mediaInput").files?.length) $("messageForm").requestSubmit();
  });
  $("attachBtn").addEventListener("click", openMediaSheet);
  $("mediaSheetBackdrop").addEventListener("click", closeMediaSheet);
  $("pickMediaBtn").addEventListener("click", () => {
    closeMediaSheet();
    $("mediaInput").click();
  });
  document.querySelectorAll(".gif-choice").forEach((button) => {
    button.addEventListener(
      "click",
      () => sendGifMessage(button.dataset.gif).catch(
        (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
      )
    );
  });
  $("voiceBtn").addEventListener("pointerdown", (event) => {
    event.preventDefault();
    startVoiceRecording();
  });
  $("voiceBtn").addEventListener(
    "pointerup",
    () => finishVoiceRecording(false).catch(
      (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
    )
  );
  $("voiceBtn").addEventListener(
    "pointerleave",
    () => finishVoiceRecording(true).catch(
      (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
    )
  );
  $("voiceBtn").addEventListener(
    "pointercancel",
    () => finishVoiceRecording(true).catch(
      (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
    )
  );
  $("messageActionsBackdrop").addEventListener("click", closeMessageActions);
  $("replyActionBtn").addEventListener("click", replyToActiveMessage);
  $("copyMessageBtn").addEventListener(
    "click",
    () => copyActiveMessage().catch(
      (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
    )
  );
  $("burnMessageNowBtn").addEventListener("click", burnActiveMessageNow);
  $("messageActions").addEventListener("click", (event) => {
    const reactionButton = event.target.closest("[data-reaction]");
    if (!reactionButton) return;
    addReactionToActiveMessage(reactionButton.dataset.reaction);
  });
  $("cancelReplyBtn").addEventListener("click", clearReplyDraft);
  $("displayNameInput").addEventListener("input", () => {
    $("displayNameInput").dataset.edited = "true";
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
    openRouteFromHash().catch(
      (e) => handleAsyncError(e, i18n[state.currentLang].errorChats)
    );
  });
  window.setInterval(async () => {
    try {
      if (isLiveMode()) {
        await cleanupExpiredMessages();
        if (!$("chatView").hidden && state.activeConversationId) {
          await loadConversation(state.activeConversationId);
        }
        await loadConversations();
        return;
      }
      const before = state.chats.length;
      moveExpiredChatsToBurned();
      renderChats();
      if (before !== state.chats.length) {
        showToast(i18n[state.currentLang].expired);
      }
    } catch (error) {
      console.warn(error);
    }
  }, 6e4);
  attachSwipeToMessages();
  startOnboarding(() => boot());
  function updateFabVisibility() {
    const fab = $("fabBtn");
    if (!fab) return;
    const inChat = $("chatView") && !$("chatView").hidden;
    const inSettings = $("settingsView") && !$("settingsView").hidden;
    fab.hidden = inChat || inSettings;
  }
  var _fabObserver = new MutationObserver(updateFabVisibility);
  document.addEventListener("DOMContentLoaded", () => {
    const chatView = $("chatView");
    const settingsView = $("settingsView");
    if (chatView) _fabObserver.observe(chatView, { attributes: true, attributeFilter: ["hidden"] });
    if (settingsView) _fabObserver.observe(settingsView, { attributes: true, attributeFilter: ["hidden"] });
  });
  function openFabSheet() {
    $("fabSheet").hidden = false;
    $("fabBtn").classList.add("open");
    $("fabBtn").setAttribute("aria-expanded", "true");
  }
  function closeFabSheet() {
    $("fabSheet").hidden = true;
    $("fabBtn").classList.remove("open");
    $("fabBtn").setAttribute("aria-expanded", "false");
  }
  function openCodeModal() {
    closeFabSheet();
    $("codeModal").hidden = false;
    setTimeout(() => $("codeModalInput").focus(), 50);
  }
  function closeCodeModal() {
    $("codeModal").hidden = true;
    $("codeModalInput").value = "";
  }
  $("fabBtn").addEventListener("click", () => {
    if ($("fabSheet").hidden) openFabSheet();
    else closeFabSheet();
  });
  $("fabSheetBackdrop").addEventListener("click", closeFabSheet);
  $("codeModalBackdrop").addEventListener("click", closeCodeModal);
  $("fabStartChat").addEventListener("click", openCodeModal);
  $("fabCreateRoom").addEventListener("click", () => {
    closeFabSheet();
    showShareDrop("room").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
  });
  $("fabCreateAsk").addEventListener("click", () => {
    closeFabSheet();
    showShareDrop("ask").catch((e) => handleAsyncError(e, i18n[state.currentLang].errorChats));
  });
  async function handleCodeModalStart() {
    const input = $("codeModalInput");
    const code = input.value.trim();
    if (!/^\d{6}$/.test(code)) {
      input.style.borderColor = "rgba(244,63,94,.5)";
      flashError(i18n[state.currentLang].invalidCode);
      setTimeout(() => {
        input.style.borderColor = "";
      }, 1200);
      return;
    }
    try {
      setButtonBusy($("codeModalStartBtn"), true, i18n[state.currentLang].searchingCode);
      const id = await startConversationWithCode(code);
      if (id) {
        closeCodeModal();
        showToast(i18n[state.currentLang].starting);
      }
    } catch (e) {
      handleAsyncError(e, i18n[state.currentLang].errorChats);
    } finally {
      setButtonBusy($("codeModalStartBtn"), false);
    }
  }
  $("codeModalStartBtn").addEventListener("click", handleCodeModalStart);
  $("codeModalInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleCodeModalStart();
    if (e.key === "Escape") closeCodeModal();
  });
  $("headerCodeChip").addEventListener("click", copyProfileCode);
  $("headerQrBtn").addEventListener("click", openQrModal);
  $("shareDropBackdrop").addEventListener("click", closeShareDrop);
  $("messagesList").addEventListener("click", (e) => {
    const msg = e.target.closest(".message.blur-until-read");
    if (!msg) return;
    msg.classList.remove("blur-until-read");
    msg.classList.add("blur-reading");
    showToast(i18n[state.currentLang].tapToRead || "\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u062E\u0644\u0627\u0644 10 \u062B\u0648\u0627\u0646\u064D");
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      const hasBurnMsg = $("messagesList")?.querySelector(".burn-label");
      if (hasBurnMsg && !$("chatView").hidden) {
        showToast("\u26A0\uFE0F \u062A\u062D\u0630\u064A\u0631: \u062A\u0645 \u0627\u0643\u062A\u0634\u0627\u0641 \u0645\u063A\u0627\u062F\u0631\u0629 \u0627\u0644\u062A\u0637\u0628\u064A\u0642");
      }
    }
  });
  (function initPullToRefresh() {
    const indicator = $("ptrIndicator");
    if (!indicator) return;
    let startY = 0;
    let pulling = false;
    let refreshing = false;
    const THRESHOLD = 80;
    function isHomeVisible() {
      return $("chatView")?.hidden !== false && $("settingsView")?.hidden !== false;
    }
    document.addEventListener("touchstart", (e) => {
      if (!isHomeVisible()) return;
      if (window.scrollY <= 1) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });
    document.addEventListener("touchmove", (e) => {
      if (!pulling || refreshing) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 20) indicator.classList.add("ptr-visible");
    }, { passive: true });
    document.addEventListener("touchend", async (e) => {
      if (!pulling) return;
      pulling = false;
      const dy = e.changedTouches[0].clientY - startY;
      if (dy >= THRESHOLD && !refreshing) {
        refreshing = true;
        indicator.classList.add("ptr-refreshing");
        indicator.querySelector(".ptr-arrow").textContent = "\u21BB";
        if (navigator.vibrate) navigator.vibrate(15);
        try {
          await loadConversations();
        } catch {
        }
        indicator.querySelector(".ptr-arrow").textContent = "\u2193";
        indicator.classList.remove("ptr-refreshing");
        refreshing = false;
      }
      indicator.classList.remove("ptr-visible");
    }, { passive: true });
  })();
})();
