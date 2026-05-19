import { db } from "./db.js";
import { state } from "./state.js";
import { i18n } from "./i18n.js";
import { PROFILE_STORAGE_KEY } from "./config.js";
import {
  $, escapeHtml, randomPublicCode, isMissingRelationError,
  showToast, handleAsyncError, getShareLink, isLiveMode,
} from "./utils.js";

// ============================================================
// Auth + profile creation
// ============================================================
export async function getOrCreateProfile() {
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
        avatar_seed: state.displayName || randomPublicCode(),
      };
      let { data, error } = await db.from("profiles").insert(profile).select("*").single();

      if (error && isMissingRelationError(error)) {
        const fallback = { ...profile };
        delete fallback.code_visible;
        const r = await db.from("profiles").insert(fallback).select("*").single();
        data = r.data; error = r.error;
      }
      if (!error) return { code_visible: true, ...data };
      if (error.code !== "23505") throw error; // not a unique-violation, give up
    }
    throw new Error("Could not generate a unique public_code.");
  }

  // Ensure session
  let { data: sessionData } = await db.auth.getSession();
  let user = sessionData?.session?.user;
  if (!user) {
    const { data, error } = await db.auth.signInAnonymously();
    if (error) throw error;
    if (data.session?.access_token && data.session?.refresh_token) {
      await db.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }
  }
  user = await getAuthUser();

  // Stale cached profile cleanup
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

// ============================================================
// Profile code card UI
// ============================================================
export function updateProfileCodeUI() {
  const card = $("profileCodeCard");
  if (!card) return;
  const t = i18n[state.currentLang];

  // Always update text labels
  $("profileCodeKicker").textContent = t.profileCodeKicker;
  $("profileCodeLabel").textContent = t.profileCodeLabel;
  $("copyCodeBtn").textContent = t.copyMyCode;
  $("copyLinkBtn").textContent = t.copyMyLink;
  $("profileQrBtn").setAttribute("aria-label", t.shareQr);
  $("profileQrBtn").title = t.shareQr;

  const profile = state.currentProfile;
  if (profile?.public_code) {
    // Show real code
    card.hidden = false;
    card.removeAttribute("hidden");
    const codeDisplay = profile.code_visible === false ? "••••••" : profile.public_code;
    $("profileCodeValue").textContent = codeDisplay;

    // Update header chip (always visible, updates code)
    const chipVal = $("headerCodeValue");
    if (chipVal) chipVal.textContent = codeDisplay;
  }
  // Never hide the card once the profile is loaded - it starts visible in HTML
}

// ============================================================
// Copy actions
// ============================================================
export async function copyProfileCode() {
  if (!state.currentProfile?.public_code || state.currentProfile.code_visible === false) return;
  const code = state.currentProfile.public_code;
  try {
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(code); copied = true; }
      catch { copied = false; }
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

export async function copyProfileLink() {
  if (!state.currentProfile?.public_code || state.currentProfile.code_visible === false) return;
  const link = getShareLink();
  try {
    if (navigator.share) {
      await navigator.share({ url: link, title: "27 — " + state.currentProfile.public_code });
      return;
    }
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(link);
    showToast(i18n[state.currentLang].copied);
  } catch (error) {
    if (error.name !== "AbortError") handleAsyncError(error, link);
  }
}

// ============================================================
// Code visibility / regeneration
// ============================================================
export async function toggleCodeVisibility() {
  if (!isLiveMode() || !state.currentProfile) return;
  const nextVisible = state.currentProfile.code_visible === false;
  state.currentProfile = { ...state.currentProfile, code_visible: nextVisible };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.currentProfile));
  updateProfileCodeUI();

  const { data, error } = await db
    .from("profiles")
    .update({ code_visible: nextVisible })
    .eq("id", state.currentProfile.id)
    .select("*").single();

  if (error && !isMissingRelationError(error)) throw error;
  state.currentProfile = error ? state.currentProfile : data;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.currentProfile));
  updateProfileCodeUI();
}

export async function regenerateCode() {
  if (!isLiveMode() || !state.currentProfile) return;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const publicCode = randomPublicCode();
    const { data, error } = await db
      .from("profiles")
      .update({ public_code: publicCode, code_visible: true })
      .eq("id", state.currentProfile.id)
      .select("*").single();

    if (!error || isMissingRelationError(error)) {
      if (error) {
        const fallback = await db
          .from("profiles")
          .update({ public_code: publicCode })
          .eq("id", state.currentProfile.id)
          .select("*").single();
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
