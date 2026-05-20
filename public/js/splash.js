import { SPLASH_STORAGE_KEY } from "./config.js";

const RESHOW_AFTER_MS = 30 * 60 * 1000; // 30 minutes
const TOTAL_DURATION  = 2500;            // 2.5 seconds

/**
 * shouldShowSplash()
 * Returns true if first visit OR reopened after >30 minutes of inactivity.
 */
function shouldShowSplash() {
  const last = localStorage.getItem(SPLASH_STORAGE_KEY);
  if (!last) return true;
  return Date.now() - parseInt(last, 10) > RESHOW_AFTER_MS;
}

/**
 * showSplash(onComplete)
 * Plays the 4-phase candle animation then calls onComplete.
 * If splash should not show, calls onComplete immediately.
 */
export function showSplash(onComplete) {
  if (!shouldShowSplash()) {
    onComplete();
    return;
  }

  localStorage.setItem(SPLASH_STORAGE_KEY, String(Date.now()));

  const screen = document.getElementById("splashScreen");
  if (!screen) {
    onComplete();
    return;
  }

  // Make visible and start animation
  screen.hidden = false;
  screen.classList.add("splash-running");

  // Phase 1 → 2: show candle body (0s), then ignite flame (0.6s)
  window.setTimeout(() => {
    screen.classList.add("splash-phase2");
  }, 600);

  // Phase 3: spread light + show "27" (1.4s)
  window.setTimeout(() => {
    screen.classList.add("splash-phase3");
  }, 1400);

  // Phase 4: fade out (2.2s), call onComplete at 2.5s
  window.setTimeout(() => {
    screen.classList.add("splash-phase4");
  }, 2200);

  window.setTimeout(() => {
    screen.hidden = true;
    screen.classList.remove(
      "splash-running", "splash-phase2", "splash-phase3", "splash-phase4"
    );
    onComplete();
  }, TOTAL_DURATION);
}
