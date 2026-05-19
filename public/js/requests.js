import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { DEMO_PROFILE_ID, MESSAGE_TTL_SECONDS } from "./config.js";
import { isLiveMode, isMissingRelationError, showToast, handleAsyncError } from "./utils.js";
import { renderChats } from "./render.js";

export async function loadConversationRequests() {
  if (!isLiveMode()) {
    state.conversationRequests = [
      {
        id: "demo-request-incoming",
        requester_id: "demo-rakan",
        target_id: DEMO_PROFILE_ID,
        status: "pending",
        created_at: new Date().toISOString(),
        requester: { id: "demo-rakan", public_code: "482913", display_name: state.currentLang === "ar" ? "راكان" : "Rakan", avatar_seed: "Rakan" },
        target: { id: DEMO_PROFILE_ID, public_code: "270027", display_name: "27", avatar_seed: "27" },
      },
      {
        id: "demo-request-outgoing",
        requester_id: DEMO_PROFILE_ID,
        target_id: "demo-lina",
        status: "pending",
        created_at: new Date().toISOString(),
        requester: { id: DEMO_PROFILE_ID, public_code: "270027", display_name: "27", avatar_seed: "27" },
        target: { id: "demo-lina", public_code: "918204", display_name: state.currentLang === "ar" ? "لينا" : "Lina", avatar_seed: "Lina" },
      },
    ];
    return [];
  }

  const { data, error } = await db
    .from("conversation_requests")
    .select(`
      id, requester_id, target_id, status, created_at,
      requester:profiles!conversation_requests_requester_id_fkey(id, public_code, display_name, avatar_seed),
      target:profiles!conversation_requests_target_id_fkey(id, public_code, display_name, avatar_seed)
    `)
    .or(`requester_id.eq.${state.currentProfile.id},target_id.eq.${state.currentProfile.id}`)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingRelationError(error)) { state.conversationRequests = []; return []; }
    throw error;
  }
  state.conversationRequests = data || [];
  return state.conversationRequests;
}

export function isIncomingRequest(request) {
  if (!isLiveMode()) return request.target_id === DEMO_PROFILE_ID;
  return request.target_id === state.currentProfile?.id;
}

export async function acceptConversationRequest(requestId, openChat) {
  const request = state.conversationRequests.find((r) => r.id === requestId);
  if (!request || !isIncomingRequest(request)) return;

  if (!isLiveMode()) {
    const { createDemoConversationFromCode } = await import("./demo.js");
    const profile = request.requester;
    const code = profile?.public_code || "482913";
    const chat = createDemoConversationFromCode(code);
    chat.name = profile?.display_name || chat.name;
    chat.otherProfile = profile || chat.otherProfile;
    state.conversationRequests = state.conversationRequests.filter((r) => r.id !== requestId);
    renderChats();
    showToast(i18n[state.currentLang].accepted);
    openChat?.(chat.id);
    return;
  }

  let { data: created, error: createError } = await db
    .from("conversations")
    .insert({
      user_a_id: request.requester_id,
      user_b_id: request.target_id,
      privacy_mode: state.privacyMode,
      last_message_at: new Date().toISOString(),
      status: "active",
    })
    .select("id").single();

  if (createError && isMissingRelationError(createError)) {
    const fallback = await db
      .from("conversations")
      .insert({
        user_a_id: request.requester_id,
        user_b_id: request.target_id,
        last_message_at: new Date().toISOString(),
      })
      .select("id").single();
    created = fallback.data; createError = fallback.error;
  }
  if (createError) throw createError;

  const { error: updateError } = await db
    .from("conversation_requests")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (updateError && !isMissingRelationError(updateError)) throw updateError;

  const { loadConversations } = await import("./conversations.js");
  await loadConversations();
  showToast(i18n[state.currentLang].accepted);
  if (created?.id) openChat?.(created.id);
}

export async function rejectConversationRequest(requestId, block = false) {
  const request = state.conversationRequests.find((r) => r.id === requestId);
  if (!request || !isIncomingRequest(request)) return;

  if (!isLiveMode()) {
    state.conversationRequests = state.conversationRequests.filter((r) => r.id !== requestId);
    if (block) {
      const profile = request.requester;
      state.blockedChats.unshift({
        id: `blocked-${request.requester_id}`,
        online: false, status: "blocked",
        otherProfile: profile,
        name: profile?.display_name || profile?.public_code || "27",
        lastMessageAt: Date.now(), expiresAt: Date.now(),
        messages: { neutral: [] },
      });
    }
    renderChats();
    showToast(block ? i18n[state.currentLang].blocked : i18n[state.currentLang].rejected);
    return;
  }

  if (block) {
    const { error: blockError } = await db
      .from("blocked_profiles")
      .upsert({ blocker_id: state.currentProfile.id, blocked_id: request.requester_id });
    if (blockError && !isMissingRelationError(blockError)) throw blockError;
  }

  const { error } = await db
    .from("conversation_requests")
    .update({ status: block ? "blocked" : "rejected", responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error && !isMissingRelationError(error)) throw error;

  await loadConversationRequests();
  renderChats();
  showToast(block ? i18n[state.currentLang].blocked : i18n[state.currentLang].rejected);
}

export function subscribeToRequests() {
  if (!isLiveMode() || state.requestsSubscription) return;
  state.requestsSubscription = db
    .channel(`requests:${state.currentProfile.id}`)
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
        db.removeChannel(state.requestsSubscription).catch(() => {});
        state.requestsSubscription = null;
      }
    });
}
