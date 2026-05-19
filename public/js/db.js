import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const supabaseReady =
  typeof window.supabase !== "undefined" &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_") &&
  !SUPABASE_ANON_KEY.includes("PASTE_");

export const db = supabaseReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
