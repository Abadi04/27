export const SUPABASE_URL = "https://rndwafkuqavqabpywosa.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZHdhZmt1cWF2cWFicHl3b3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzkxOTEsImV4cCI6MjA5NDQ1NTE5MX0.tIrLqYHsK-qpvzlZBdPRRFNZZKhX445tE7xxsjZeceM";
export const VAPID_PUBLIC_KEY = "";

export const MESSAGE_TTL_SECONDS = 5 * 60 * 60;
export const BURN_TTL_SECONDS   = 10;
export const FIVE_HOURS         = 5 * 60 * 60 * 1000;

export const PRIVACY_MODES = {
  "10s_read": { seconds: 10,                  burnAfterRead: true  },
  "5m":       { seconds: 5 * 60,              burnAfterRead: false },
  "1h":       { seconds: 60 * 60,             burnAfterRead: false },
  "5h":       { seconds: MESSAGE_TTL_SECONDS, burnAfterRead: false },
  "close":    { seconds: MESSAGE_TTL_SECONDS, burnAfterRead: false, closeDelete: true },
};

export const PROFILE_STORAGE_KEY    = "twentyseven_profile";
export const ONBOARDING_STORAGE_KEY = "veil_seen";
export const HIDE_CHATS_STORAGE_KEY = "twentyseven_hide_chats";

export const SWIPE_DELETE_THRESHOLD = 80;
export const SWIPE_REPLY_THRESHOLD  = 56;
export const DEMO_PROFILE_ID        = "demo-self";
