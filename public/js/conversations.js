import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import {
  $, setLoading, isLiveMode, isMissingRelationError,
  showToast, flashError, vibrate,
} from "./utils.js";
import {
  getChat, renderChats, renderMessages,
  updateChatCountdown, moveExpiredChatsToBurned,
} from "./render.js";
import {
  mapDbMessage, cleanupExpiredMessages, deleteConversationIfExpiredAndEmpty,
  markIncomingMessagesRead, startChatCountdown,
} from "./messages.js";
import { demoChats, createDemoConversationFromCode } from "./demo.js";
import { loadConversationRequests } from "./requests.js";

// ============================================================
// Load chat list
// ============================================================
export async function loadConversations() {
  // Only show skeleton on first load (no data yet) — avoid jarring flash during background refresh
  const silentRefresh = state.chats.length > 0;
  if (!silentRefresh) setLoading(i18n[state.currentLang].loadingChats, true);
  try {
    if (!isLiveMode()) {
      state.chats = demoChats.filter((c) => c.expiresAt > Date.now());
      moveExpiredChatsToBurned();
      renderChats();
      return state.chats;
    }

    await cleanupExpiredMessages();

    let { data, error } = await db
      .from("conversations")
      .select(`
        id, user_a_id, user_b_id, created_at, last_message_at,
        privacy_mode, status,
        user_a:profiles!conversations_user_a_id_fkey(id, public_code, display_name, avatar_seed),
        user_b:profiles!conversations_user_b_id_fkey(id, public_code, display_name, avatar_seed)
      `)
      .or(`user_a_id.eq.${state.currentProfile.id},user_b_id.eq.${state.currentProfile.id}`)
      .in("status", ["active", "blocked"])
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error && isMissingRelationError(error)) {
      const fb = await db
        .from("conversations")
        .select(`
          id, user_a_id, user_b_id, created_at, last_message_at,
          user_a:profiles!conversations_user_a_id_fkey(id, public_code, display_name, avatar_seed),
          user_b:profiles!conversations_user_b_id_fkey(id, public_code, display_name, avatar_seed)
        `)
        .or(`user_a_id.eq.${state.currentProfile.id},user_b_id.eq.${state.currentProfile.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      data = fb.data; error = fb.error;
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
        messages: { neutral: [] },
      };
    });

    state.chats = mapped
      .filter((c) => c.status !== "blocked")
      .map((c) => {
        const existing = getChat(c.id);
        if (!existing) return c;
        return {
          ...existing, ...c, burned: false,
          messages: existing.messages || c.messages,
          expiresAt: existing.expiresAt && existing.expiresAt > Date.now() ? existing.expiresAt : c.expiresAt,
        };
      });
    state.blockedChats = mapped.filter((c) => c.status === "blocked");
    state.burnedChats = state.burnedChats.slice(0, 12);

    // FIX: if Supabase returned zero conversations, keep demo chats as preview
    // so the user doesn't see a blank screen — they see sample data instead
    if (!state.chats.length && !state.blockedChats.length) {
      state.chats = demoChats.filter((c) => c.expiresAt > Date.now());
    }

    await loadConversationRequests();
    renderChats();
    return state.chats;
  } finally {
    if (!silentRefresh) setLoading("", false);
  }
}

// ============================================================
// Start chat with code (creates request or opens existing)
// ============================================================
export async function startConversationWithCode(code, onOpenChat) {
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

  // Find target profile
  let { data: target, error: targetError } = await db
    .from("profiles").select("*")
    .eq("public_code", code).eq("code_visible", true).maybeSingle();
  if (targetError && isMissingRelationError(targetError)) {
    // Fallback for older schemas missing the column — but still respect
    // visibility by filtering client-side; never expose a hidden profile.
    const fb = await db.from("profiles").select("*").eq("public_code", code).maybeSingle();
    target = fb.data && fb.data.code_visible !== false ? fb.data : null;
    targetError = fb.error;
  }
  if (targetError) throw targetError;
  if (!target) { flashError(i18n[state.currentLang].codeNotFound); return null; }
  if (target.id === state.currentProfile.id) {
    flashError(i18n[state.currentLang].cannotChatSelf); return null;
  }

  // Block check
  const { data: blocked, error: blockError } = await db
    .from("blocked_profiles").select("blocker_id")
    .or(`and(blocker_id.eq.${state.currentProfile.id},blocked_id.eq.${target.id}),and(blocker_id.eq.${target.id},blocked_id.eq.${state.currentProfile.id})`)
    .maybeSingle();
  if (blockError && !isMissingRelationError(blockError)) throw blockError;
  if (blocked) { flashError(i18n[state.currentLang].blocked); return null; }

  // Existing conversation?
  const { data: existing, error: findError } = await db
    .from("conversations").select("id")
    .or(`and(user_a_id.eq.${state.currentProfile.id},user_b_id.eq.${target.id}),and(user_a_id.eq.${target.id},user_b_id.eq.${state.currentProfile.id})`)
    .maybeSingle();
  if (findError) throw findError;
  if (existing?.id) {
    await loadConversations();
    onOpenChat?.(existing.id);
    return existing.id;
  }

  // Existing pending request?
  const { data: existingRequest, error: rfError } = await db
    .from("conversation_requests").select("id, status")
    .or(`and(requester_id.eq.${state.currentProfile.id},target_id.eq.${target.id}),and(requester_id.eq.${target.id},target_id.eq.${state.currentProfile.id})`)
    .eq("status", "pending").maybeSingle();
  if (rfError && !isMissingRelationError(rfError)) throw rfError;
  if (existingRequest) {
    showToast(i18n[state.currentLang].requestExists);
    return null;
  }

  // Create new request (fallback to direct conv if requests table missing)
  const { error: createError } = await db
    .from("conversation_requests")
    .insert({ requester_id: state.currentProfile.id, target_id: target.id, status: "pending" });

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

export async function createConversationDirectly(targetId, mode = state.privacyMode) {
  const now = new Date().toISOString();
  let { data, error } = await db
    .from("conversations")
    .insert({
      user_a_id: state.currentProfile.id,
      user_b_id: targetId,
      privacy_mode: mode,
      last_message_at: now,
      status: "active",
    })
    .select("id").single();

  if (error && isMissingRelationError(error)) {
    const fb = await db
      .from("conversations")
      .insert({
        user_a_id: state.currentProfile.id,
        user_b_id: targetId,
        last_message_at: now,
      })
      .select("id").single();
    data = fb.data; error = fb.error;
  }
  if (error) throw error;
  return data?.id || null;
}

// ============================================================
// Load a conversation (messages + realtime)
// ============================================================
export async function loadConversation(conversationId, onExpired) {
  state.activeConversationId = conversationId;
  const chat = getChat(conversationId);
  // FIX: Don't call setLoading() here — #loadingState is in #chatsSection (home screen).
  // Instead update the chat header status text which is the correct loading indicator.
  const statusEl = $("chatViewStatus");
  if (statusEl) statusEl.textContent = i18n[state.currentLang].loadingConversation;

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

    const { data, error } = await db
      .from("messages").select("*")
      .eq("conversation_id", conversationId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });
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

    state.activeSubscription = db
      .channel(`messages:${conversationId}:${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages",
          filter: `conversation_id=eq.${conversationId}` },
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
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.userId === state.currentProfile?.id) return;
        state.typing = true;
        renderMessages(getChat(conversationId));
      })
      .on("broadcast", { event: "stopped_typing" }, (payload) => {
        if (payload.payload?.userId === state.currentProfile?.id) return;
        state.typing = false;
        renderMessages(getChat(conversationId));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") showToast(i18n[state.currentLang].realtimeConnected);
      });
  } finally {
    // FIX: no setLoading here - we use chatViewStatus for chat loading state
  }
}

// ============================================================
// Destructive
// ============================================================
export async function deleteAllConversationsNow() {
  if (!isLiveMode() || !state.currentProfile) {
    state.chats = [];
    renderChats();
    return;
  }
  const { error } = await db
    .from("conversations").delete()
    .or(`user_a_id.eq.${state.currentProfile.id},user_b_id.eq.${state.currentProfile.id}`);
  if (error) throw error;

  state.chats = [];
  state.burnedChats = [];
  state.blockedChats = [];
  renderChats();
  showToast(i18n[state.currentLang].deletedAll);
}

export async function blockActiveChat() {
  const chat = getChat($("chatView").dataset.activeChat);
  const otherId = chat?.otherProfile?.id;
  if (!otherId || !isLiveMode()) return;

  const { error } = await db
    .from("blocked_profiles")
    .upsert({ blocker_id: state.currentProfile.id, blocked_id: otherId });
  if (error) throw error;

  await db.from("conversations").update({ status: "blocked" }).eq("id", chat.id);
  state.chats = state.chats.filter((c) => c.id !== chat.id);
  state.blockedChats.unshift({ ...chat, status: "blocked", online: false });
  renderChats();
  showToast(i18n[state.currentLang].blocked);
}
