import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { $, isLiveMode } from "./utils.js";
import { renderChats, renderMessages, getChat, updateChatCountdown } from "./render.js";
import { updateProfileCodeUI } from "./profile.js";
import { updateSettingsToggles, updatePrivacyModeUI } from "./settings.js";
import { showEntryCard } from "./temporary.js";
import { updateReplyComposer } from "./messages.js";

/**
 * setLanguage updates every visible string and toggles RTL/LTR.
 * Called on language toggle and at boot.
 */
export function setLanguage(lang) {
  state.currentLang = lang;
  const t = i18n[lang];
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";

  // Header
  $("headerStatus").textContent = isLiveMode() ? t.headerStatusLive : t.headerStatus;
  $("langToggle").textContent = t.langToggle;
  $("settingsToggle").textContent = t.settings;

  // Hero
  $("heroTagline").textContent = t.heroTagline;
  $("heroLine1").textContent = t.heroLine1;
  if ($("heroLine2")) $("heroLine2").textContent = t.heroLine2 || "";
  if ($("secondaryOptionsLabel")) $("secondaryOptionsLabel").textContent = t.secondaryOptionsLabel || "خيارات أخرى";
  $("codeInput").placeholder = t.inputPlaceholder;
  $("startBtn").textContent = t.startBtn;

  // Viral actions
  $("askActionTitle").textContent = t.askActionTitle;
  $("askActionHint").textContent = t.askActionHint;
  $("roomActionTitle").textContent = t.roomActionTitle;
  $("roomActionHint").textContent = t.roomActionHint;
  $("copyShareLinkBtn").textContent = t.copy;
  if (!$("shareDrop").hidden) $("shareDropKicker").textContent = t.shareReady;
  if (!$("entryCard").hidden) {
    showEntryCard(state.entryMode || "ask", $("entryCard").dataset.token || "");
  }

  // Chats section
  $("chatsHeader").textContent = t.chatsHeader;
  if ($("emptyText")) $("emptyText").textContent = t.emptyText;
  $("footerText").textContent = state.currentProfile?.public_code
    ? t.footerTextWithCode.replace("{code}", state.currentProfile.public_code)
    : t.footerText;

  // Chat view
  $("backToChats").textContent = t.back;
  $("backFromSettings").textContent = t.back;
  $("chatViewStatus").textContent = t.chatExpiry;
  $("messageInput").placeholder = t.messagePlaceholder;
  $("sendBtn").textContent = t.send;
  $("attachBtn").title = t.attach;
  $("attachBtn").setAttribute("aria-label", t.attach);

  // State cards
  $("loadingState").textContent = t.loadingChats;
  $("errorState").textContent = t.errorChats;

  // Settings
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

  // Privacy bar
  $("privacyModeLabel").textContent = t.privacyModeLabel;
  $("privacyModeSelect").options[0].textContent = t.privacy10s;
  $("privacyModeSelect").options[1].textContent = t.privacy5m;
  $("privacyModeSelect").options[2].textContent = t.privacy1h;
  $("privacyModeSelect").options[3].textContent = t.privacy5h;
  $("privacyModeSelect").options[4].textContent = t.privacyClose;

  // Composer toggles
  $("burnToggle").setAttribute("aria-label", t.burnToggle);
  $("burnToggle").title = t.burnToggle;
  $("hiddenToggle").setAttribute("aria-label", t.hiddenToggle);
  $("hiddenToggle").title = t.hiddenToggle;
  $("voiceBtn").setAttribute("aria-label", t.voiceHold);
  $("voiceBtn").title = t.voiceHold;

  // Sheets / modals
  $("mediaSheetTitle").textContent = t.mediaSheetTitle;
  $("pickMediaBtn").textContent = t.pickMedia;
  $("qrModalTitle").textContent = t.qrTitle;
  $("copyQrCodeBtn").textContent = t.copyNumber;
  $("closeQrModal").setAttribute("aria-label", t.close);
  $("fakeNotesTitle").textContent = t.fakeNotesTitle;

  // Reply composer + message actions
  $("cancelReplyBtn").setAttribute("aria-label", t.cancelReply);
  $("messageActionsTitle").textContent = t.messageActions;
  $("replyActionBtn").textContent = t.reply;
  $("copyMessageBtn").textContent = t.copyMessage;
  $("burnMessageNowBtn").textContent = t.burnNow;

  updateProfileCodeUI();
  updateSettingsToggles();
  updateReplyComposer();

  // Reset placeholder name if user hasn't edited it
  if (!$("displayNameInput").dataset.edited) {
    state.displayName = lang === "ar" ? "زائر 27" : "Guest 27";
    $("displayNameInput").value = state.currentProfile?.display_name || state.displayName;
  }

  renderChats();
  if (!$("chatView").hidden) {
    const active = $("chatView").dataset.activeChat;
    const chat = getChat(active);
    if (chat) {
      $("chatViewName").textContent = chat.names?.[state.currentLang]
        || chat.otherProfile?.display_name || chat.name || chat.id;
      updateChatCountdown(chat);
      updatePrivacyModeUI();
      renderMessages(chat);
    }
  }
}
