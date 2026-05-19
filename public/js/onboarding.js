import { state } from "./state.js";
import { ONBOARDING_STORAGE_KEY } from "./config.js";
import { $, prefersReducedMotion, randomPublicCode } from "./utils.js";

/**
 * Plays a one-time code-type animation to introduce the concept.
 * After completion (or if already seen / reduced motion), calls onComplete.
 */
export function startOnboarding(onComplete) {
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
    hint.textContent = state.currentLang === "en"
      ? "This is your code — share it to start an anonymous chat"
      : "هذا رقمك الخاص — شاركه لبدء محادثة مجهولة";
  }

  let step = 0;
  const typeNext = () => {
    if (step < randomCode.length) {
      code.textContent += randomCode[step];
      step += 1;
      window.setTimeout(typeNext, 120);
      return;
    }
    window.setTimeout(eraseNext, 800);
  };

  const eraseNext = () => {
    if (code.textContent.length) {
      code.textContent = code.textContent.slice(0, -1);
      window.setTimeout(eraseNext, 80);
      return;
    }
    screen.classList.add("done");
    window.setTimeout(() => {
      screen.hidden = true;
      screen.classList.remove("done");
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
      onComplete();
    }, 420);
  };

  typeNext();
}
