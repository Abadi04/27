(function () {
  const storageKey = "whispr-user";

  const registerForm = document.querySelector("[data-register-form]");
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const user = {
        name: formData.get("name"),
        username: formData.get("username"),
      };
      localStorage.setItem(storageKey, JSON.stringify(user));
      window.location.href = "dashboard.html";
    });
  }

  const loginForm = document.querySelector("[data-login-form]");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      window.location.href = "dashboard.html";
    });
  }

  const copyButton = document.querySelector("[data-copy-link]");
  if (copyButton) {
    copyButton.addEventListener("click", async function () {
      const link = document.querySelector("[data-profile-link]").textContent.trim();
      const feedback = document.querySelector("[data-copy-feedback]");
      let copied = false;

      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(link);
          copied = true;
        }
      } catch (error) {
        copied = false;
      }

      if (!copied) {
        const tempInput = document.createElement("input");
        tempInput.value = link;
        tempInput.setAttribute("readonly", "");
        tempInput.style.position = "fixed";
        tempInput.style.opacity = "0";
        document.body.appendChild(tempInput);
        tempInput.select();
        copied = document.execCommand("copy");
        tempInput.remove();
      }

      copyButton.textContent = "تم النسخ ✓";
      feedback.textContent = copied ? "تم النسخ ✓" : "انسخ الرابط يدوياً من المربع.";

      window.setTimeout(function () {
        copyButton.textContent = "نسخ الرابط";
      }, 2200);
    });
  }

  const textarea = document.querySelector("[data-send-form] textarea");
  const counter = document.querySelector("[data-char-count]");
  if (textarea && counter) {
    textarea.addEventListener("input", function () {
      counter.textContent = textarea.value.length;
    });
  }

  const sendForm = document.querySelector("[data-send-form]");
  if (sendForm) {
    sendForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const panel = document.querySelector("[data-send-panel]");
      panel.innerHTML = [
        '<div class="success-state">',
        "<span>🎉</span>",
        "<h1>تم إرسال رسالتك بنجاح</h1>",
        "<p>تقدر ترسل رسالة ثانية إذا حاب.</p>",
        '<button class="btn btn-primary" type="button" data-send-again>إرسال رسالة ثانية</button>',
        "</div>",
      ].join("");

      panel.querySelector("[data-send-again]").addEventListener("click", function () {
        window.location.reload();
      });
    });
  }
})();
