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

  // Show 3-step guide then dismiss on tap/click
  const ar = state.currentLang !== "en";
  const steps = ar
    ? ["هذا رقمك الخاص 👆", "شاركه مع من تريد", "ستصلك المحادثات هنا ✓"]
    : ["This is your code 👆", "Share it with anyone", "Chats will appear here ✓"];

  let currentStep = 0;
  if (hint) hint.textContent = steps[0];

  // Type the random code to introduce the concept
  let i = 0;
  const typeNext = () => {
    if (i < randomCode.length) {
      code.textContent += randomCode[i++];
      window.setTimeout(typeNext, 110);
      return;
    }
    // Cycle through hints
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
    window.setTimeout(dismiss, 6000); // auto-dismiss after 6s
  };

  typeNext();
}
