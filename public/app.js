const state = {
  token: localStorage.getItem("veil_token") || localStorage.getItem("wishlistic_token") || "",
  user: JSON.parse(localStorage.getItem("veil_user") || localStorage.getItem("wishlistic_user") || "null"),
  lang: localStorage.getItem("veil_lang") || "ar",
  theme: localStorage.getItem("veil_theme") || "dark"
};

const copy = {
  ar: {
    login: "دخول",
    logout: "خروج",
    dashboard: "لوحتي",
    home: "الرئيسية",
    start: "ابدأ الآن",
    profile: "رابطي",
    settings: "الإعدادات",
    heroBadge: "مصمم لمتصفح الجوال",
    heroTitle: "Veil",
    heroSub: "تلق رسائل مجهولة صادقة، أجب عليها علنا، وشارك رابطك في أي تطبيق اجتماعي خلال ثوان.",
    searchPlaceholder: "ابحث عن @username",
    search: "بحث",
    createLink: "أنشئ رابطك",
    previewTitle: "صندوق وارد مجهول",
    previewUser: "@veil",
    previewOne: "أنت شخص مريح بالكلام، كيف تحافظ على هدوئك؟",
    previewReply: "أحاول أسمع أكثر مما أتكلم، والباقي يتعلم مع الوقت.",
    previewTwo: "فيه شيء كنت أود أقوله لك من زمان.",
    featureOneTitle: "رابط واحد",
    featureOneText: "انسخه وضعه في البايو أو الستوري واستقبل الرسائل بدون كشف الهوية.",
    featureTwoTitle: "ردود عامة",
    featureTwoText: "اختر الرسائل التي تستحق الرد، وانشر السؤال مع إجابتك في ملفك.",
    featureThreeTitle: "تجربة جوال",
    featureThreeText: "أزرار كبيرة، حقول واضحة، وتصفح سريع من أسفل الشاشة.",
    register: "تسجيل",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    identifier: "البريد أو اسم المستخدم",
    show: "إظهار",
    hide: "إخفاء",
    askPlaceholder: "اكتب رسالتك المجهولة هنا...",
    send: "إرسال",
    sent: "تم إرسال الرسالة بسرية.",
    limit: "حرف",
    answers: "إجابات عامة",
    noAnswers: "لا توجد إجابات بعد.",
    greeting: "أهلا",
    statsTotal: "الكل",
    statsUnread: "جديدة",
    statsReplied: "مجابة",
    reply: "رد",
    sendReply: "نشر الرد",
    delete: "حذف",
    empty: "صندوقك هادئ الآن",
    emptySub: "شارك رابطك لتبدأ الرسائل بالوصول.",
    bio: "النبذة",
    avatar: "رابط الصورة",
    save: "حفظ",
    profileLink: "رابط ملفك",
    copyLink: "نسخ",
    copied: "تم نسخ الرابط.",
    saved: "تم الحفظ.",
    needLogin: "سجل الدخول أولا.",
    notFound: "لم نجد هذه الصفحة.",
    userNotFound: "لم نصل لهذا المستخدم بعد."
  },
  en: {
    login: "Login",
    logout: "Logout",
    dashboard: "Inbox",
    home: "Home",
    start: "Start",
    profile: "My link",
    settings: "Settings",
    heroBadge: "Built for mobile browsers",
    heroTitle: "Veil",
    heroSub: "Receive honest anonymous messages, reply publicly, and share your link anywhere in seconds.",
    searchPlaceholder: "Search @username",
    search: "Search",
    createLink: "Create my link",
    previewTitle: "Anonymous inbox",
    previewUser: "@veil",
    previewOne: "You are easy to talk to. How do you stay this calm?",
    previewReply: "I try to listen more than I speak, then learn the rest slowly.",
    previewTwo: "There is something I have wanted to say for a while.",
    featureOneTitle: "One link",
    featureOneText: "Add it to a bio or story and receive messages without revealing senders.",
    featureTwoTitle: "Public replies",
    featureTwoText: "Choose the messages worth answering and publish the question with your reply.",
    featureThreeTitle: "Mobile first",
    featureThreeText: "Large controls, clear fields, and quick navigation from the bottom bar.",
    register: "Register",
    username: "Username",
    email: "Email",
    password: "Password",
    identifier: "Email or username",
    show: "Show",
    hide: "Hide",
    askPlaceholder: "Write your anonymous message here...",
    send: "Send",
    sent: "Message sent anonymously.",
    limit: "chars",
    answers: "Public answers",
    noAnswers: "No answers yet.",
    greeting: "Hi",
    statsTotal: "Total",
    statsUnread: "New",
    statsReplied: "Replied",
    reply: "Reply",
    sendReply: "Publish reply",
    delete: "Delete",
    empty: "Your inbox is quiet",
    emptySub: "Share your link to start receiving messages.",
    bio: "Bio",
    avatar: "Avatar URL",
    save: "Save",
    profileLink: "Profile link",
    copyLink: "Copy",
    copied: "Link copied.",
    saved: "Saved.",
    needLogin: "Please log in first.",
    notFound: "We could not find that page.",
    userNotFound: "We have not found that user yet."
  }
};

const app = document.getElementById("app");
const mobileNav = document.getElementById("mobileNav");
const t = (key) => copy[state.lang][key] || key;

const icons = {
  home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 10.5 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  inbox: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>',
  user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
  send: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  copy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  link: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  message: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></svg>',
  phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>'
};

function applyPreferences() {
  document.documentElement.dataset.theme = state.theme;
  document.body.dir = state.lang === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = state.lang;

  const authLink = document.querySelector("[data-auth-link]");
  authLink.textContent = state.user ? t("dashboard") : t("login");
  authLink.href = state.user ? "/dashboard" : "/auth";
  document.getElementById("languageToggle").textContent = state.lang === "ar" ? "EN" : "ع";
  renderMobileNav();
}

function renderMobileNav() {
  const current = location.pathname;
  const profileHref = state.user ? `/u/${state.user.username}` : "/auth";
  const items = [
    { href: "/", label: t("home"), icon: icons.home, active: current === "/" },
    { href: state.user ? "/dashboard" : "/auth", label: state.user ? t("dashboard") : t("login"), icon: icons.inbox, active: current === "/dashboard" || current === "/auth" },
    { href: profileHref, label: t("profile"), icon: icons.user, active: current.startsWith("/u/") || current === "/settings" }
  ];

  mobileNav.innerHTML = items.map((item) => `
    <a href="${item.href}" data-link class="${item.active ? "active" : ""}" aria-label="${escapeAttr(item.label)}">
      ${item.icon}
    </a>
  `).join("");
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function setSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("veil_token", token);
  localStorage.setItem("veil_user", JSON.stringify(user));
  applyPreferences();
}

function clearSession() {
  state.token = "";
  state.user = null;
  localStorage.removeItem("veil_token");
  localStorage.removeItem("veil_user");
  localStorage.removeItem("wishlistic_token");
  localStorage.removeItem("wishlistic_user");
  applyPreferences();
  navigate("/");
}

function navigate(path) {
  history.pushState({}, "", path);
  render();
}

function toast(message, type = "success") {
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.textContent = message;
  document.getElementById("toastHost").appendChild(node);
  setTimeout(() => node.remove(), 3000);
}

function escapeAttr(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function avatar(user, size = "avatar") {
  if (user?.avatarUrl) {
    return `<span class="${size}"><img src="${escapeAttr(user.avatarUrl)}" alt="${escapeAttr(user.username)}"></span>`;
  }
  return `<span class="${size}">${(user?.username || "V").slice(0, 1).toUpperCase()}</span>`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(state.lang === "ar" ? "ar-SA" : "en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function page(html) {
  app.innerHTML = html;
  bindRipples();
  applyPreferences();
}

function renderLanding() {
  page(`
    <section class="hero">
      <div class="hero-copy animate-in">
        <span class="badge"><span class="dot"></span>${t("heroBadge")}</span>
        <h1><span class="gradient-text">${t("heroTitle")}</span></h1>
        <p class="subtitle">${t("heroSub")}</p>
        <div class="search-card">
          <form class="search-form" id="userSearch">
            <input class="search-input" name="username" autocomplete="off" placeholder="${t("searchPlaceholder")}" />
            <button class="button button-primary" type="submit">${t("search")}</button>
          </form>
        </div>
        <div class="hero-actions">
          <a class="button button-primary" href="/auth" data-link>${t("createLink")}</a>
          <a class="button button-soft" href="#features">${t("settings")}</a>
        </div>
      </div>

      <div class="phone-card animate-in delay-1">
        <div class="phone-screen">
          <div class="mini-row">
            <div class="mini-profile">
              <span class="avatar">V</span>
              <div>
                <strong>${t("previewTitle")}</strong>
                <div class="tiny">${t("previewUser")}</div>
              </div>
            </div>
            <span class="badge"><span class="dot"></span>live</span>
          </div>
          <article class="mock-message">
            <p>${t("previewOne")}</p>
            <div class="mock-reply">${t("previewReply")}</div>
          </article>
          <article class="mock-message">
            <p>${t("previewTwo")}</p>
          </article>
          <div class="features" id="features">
            ${feature(icons.link, t("featureOneTitle"), t("featureOneText"))}
            ${feature(icons.message, t("featureTwoTitle"), t("featureTwoText"))}
            ${feature(icons.phone, t("featureThreeTitle"), t("featureThreeText"))}
          </div>
        </div>
      </div>
    </section>
  `);

  document.getElementById("userSearch").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = new FormData(event.currentTarget).get("username").replace(/^@/, "").trim().toLowerCase();
    if (!username) return;
    navigate(`/u/${encodeURIComponent(username)}`);
  });
}

function feature(icon, title, text) {
  return `
    <article class="feature-row">
      <span class="feature-icon">${icon}</span>
      <div>
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
    </article>
  `;
}

function renderAuth() {
  if (state.user) {
    navigate("/dashboard");
    return;
  }

  page(`
    <section class="auth-card animate-in">
      <div class="auth-tabs">
        <button class="auth-tab active" type="button" data-mode="login">${t("login")}</button>
        <button class="auth-tab" type="button" data-mode="register">${t("register")}</button>
      </div>
      <form id="authForm">
        <div id="registerFields" hidden>
          <label class="field">${t("username")}<input name="username" autocomplete="username" inputmode="latin" /></label>
          <label class="field">${t("email")}<input name="email" type="email" autocomplete="email" /></label>
        </div>
        <div id="loginFields">
          <label class="field">${t("identifier")}<input name="identifier" autocomplete="username" /></label>
        </div>
        <label class="field">${t("password")}
          <span class="input-wrap">
            <input name="password" type="password" autocomplete="current-password" />
            <button class="password-toggle" type="button">${t("show")}</button>
          </span>
        </label>
        <button class="button button-primary button-full" type="submit">${t("login")}</button>
      </form>
    </section>
  `);

  let mode = "login";
  const form = document.getElementById("authForm");
  const submit = form.querySelector("[type='submit']");

  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      mode = tab.dataset.mode;
      document.querySelectorAll(".auth-tab").forEach((item) => item.classList.toggle("active", item === tab));
      document.getElementById("registerFields").hidden = mode !== "register";
      document.getElementById("loginFields").hidden = mode !== "login";
      submit.textContent = t(mode === "login" ? "login" : "register");
    });
  });

  document.querySelector(".password-toggle").addEventListener("click", (event) => {
    const input = form.password;
    input.type = input.type === "password" ? "text" : "password";
    event.currentTarget.textContent = input.type === "password" ? t("show") : t("hide");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());

    try {
      const data = await api(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body)
      });
      setSession(data.token, data.user);
      navigate("/dashboard");
    } catch (error) {
      toast(error.message, "error");
    }
  });
}

async function renderProfile(username) {
  page(`
    <section class="profile-head animate-in">
      <span class="avatar-large skeleton"></span>
      <h1>@${escapeHtml(username)}</h1>
      <p class="subtitle">${t("answers")}</p>
    </section>
    <section class="glass-card composer skeleton"></section>
  `);

  try {
    const data = await api(`/api/user/${username}`);
    page(`
      <section class="profile-head animate-in">
        ${avatar(data.user, "avatar-large")}
        <h1>@${escapeHtml(data.user.username)}</h1>
        <p class="subtitle">${escapeHtml(data.user.bio || "")}</p>
      </section>
      <section class="glass-card composer animate-in delay-1" id="composerCard">
        <textarea id="messageContent" maxlength="300" placeholder="${t("askPlaceholder")}"></textarea>
        <div class="counter-row">
          <span><strong id="charCount">0</strong>/300 ${t("limit")}</span>
          <button class="button button-primary" id="sendMessage" type="button">${icons.send}${t("send")}</button>
        </div>
      </section>
      <section class="feed animate-in delay-2">
        <h2 class="section-title">${t("answers")}</h2>
        ${data.answered.length ? data.answered.map((message) => `
          <article class="message-card">
            <div class="message-head">
              <span class="anon-avatar">?</span>
              <span class="message-meta">${formatDate(message.createdAt)}</span>
            </div>
            <p>${escapeHtml(message.content)}</p>
            <span class="reply-label">${t("reply")}</span>
            <p>${escapeHtml(message.reply)}</p>
          </article>
        `).join("") : `<article class="glass-card empty-state">${t("noAnswers")}</article>`}
      </section>
    `);

    const textarea = document.getElementById("messageContent");
    const count = document.getElementById("charCount");
    textarea.addEventListener("input", () => {
      count.textContent = textarea.value.length;
      count.classList.toggle("danger", textarea.value.length > 260);
    });

    document.getElementById("sendMessage").addEventListener("click", async () => {
      try {
        await api(`/api/messages/${data.user.username}`, {
          method: "POST",
          body: JSON.stringify({ content: textarea.value })
        });
        burstConfetti(document.getElementById("sendMessage"));
        document.getElementById("composerCard").classList.add("sent-pop");
        toast(t("sent"));
        setTimeout(() => renderProfile(data.user.username), 650);
      } catch (error) {
        toast(error.message, "error");
      }
    });
  } catch (error) {
    page(`<section class="glass-card empty-state animate-in"><div class="empty-illustration">?</div><h1>${t("userNotFound")}</h1><p>${escapeHtml(error.message)}</p></section>`);
  }
}

async function renderDashboard() {
  if (!state.user) {
    toast(t("needLogin"), "error");
    navigate("/auth");
    return;
  }

  const link = `${location.origin}/u/${state.user.username}`;
  page(`
    <section class="dashboard-head animate-in">
      <h1>${t("greeting")} ${escapeHtml(state.user.username)}</h1>
      <p>${escapeHtml(link)}</p>
      <div class="cta-row">
        <button class="button button-primary" id="copyProfileLink" type="button">${icons.copy}${t("copyLink")}</button>
        <a class="button button-soft" href="/settings" data-link>${t("settings")}</a>
        <button class="button button-danger" id="logoutButton" type="button">${t("logout")}</button>
      </div>
    </section>
    <section class="stats-grid">
      <article class="stat-card skeleton"></article>
      <article class="stat-card skeleton"></article>
      <article class="stat-card skeleton"></article>
    </section>
  `);
  bindDashboardHeader(link);

  try {
    const data = await api("/api/messages/inbox");
    page(`
      <section class="dashboard-head animate-in">
        <h1>${t("greeting")} ${escapeHtml(state.user.username)}</h1>
        <p>${escapeHtml(link)}</p>
        <div class="cta-row">
          <button class="button button-primary" id="copyProfileLink" type="button">${icons.copy}${t("copyLink")}</button>
          <a class="button button-soft" href="/settings" data-link>${t("settings")}</a>
          <button class="button button-danger" id="logoutButton" type="button">${t("logout")}</button>
        </div>
      </section>
      <section class="stats-grid animate-in delay-1">
        <article class="stat-card"><span class="stat-number">${data.stats.total}</span><span class="stat-label">${t("statsTotal")}</span></article>
        <article class="stat-card"><span class="stat-number">${data.stats.unread}</span><span class="stat-label">${t("statsUnread")}</span></article>
        <article class="stat-card"><span class="stat-number">${data.stats.replied}</span><span class="stat-label">${t("statsReplied")}</span></article>
      </section>
      <section class="messages-list animate-in delay-2">
        ${data.messages.length ? data.messages.map((message) => messageCard(message)).join("") : emptyState()}
      </section>
    `);
    bindDashboardHeader(link);
    bindMessageActions();
  } catch (error) {
    toast(error.message, "error");
  }
}

function bindDashboardHeader(link) {
  document.getElementById("logoutButton")?.addEventListener("click", clearSession);
  document.getElementById("copyProfileLink")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(link);
    toast(t("copied"));
  });
}

function messageCard(message) {
  return `
    <article class="message-card ${message.isRead ? "" : "unread"}" data-id="${message._id}">
      <div class="message-head">
        <span class="anon-avatar">?</span>
        <span class="message-meta">${formatDate(message.createdAt)}</span>
      </div>
      <p>${escapeHtml(message.content)}</p>
      ${message.reply ? `<span class="reply-label">${t("reply")}</span><p>${escapeHtml(message.reply)}</p>` : ""}
      <div class="card-actions">
        <button class="button button-primary" type="button" data-action="toggle">${t("reply")}</button>
        <button class="button button-danger" type="button" data-action="delete">${t("delete")}</button>
      </div>
      <div class="reply-box">
        <div class="reply-inner">
          <textarea maxlength="800">${escapeHtml(message.reply || "")}</textarea>
          <div class="card-actions">
            <button class="button button-primary button-full" type="button" data-action="reply">${t("sendReply")}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function emptyState() {
  return `
    <article class="glass-card empty-state">
      <div class="empty-illustration">${icons.inbox}</div>
      <h2>${t("empty")}</h2>
      <p class="muted">${t("emptySub")}</p>
    </article>
  `;
}

function bindMessageActions() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const card = button.closest(".message-card");
      const id = card.dataset.id;
      const action = button.dataset.action;

      if (action === "toggle") {
        card.querySelector(".reply-box").classList.toggle("open");
        return;
      }

      try {
        if (action === "delete") {
          await api(`/api/messages/${id}`, { method: "DELETE" });
          card.remove();
          toast(t("delete"));
        }

        if (action === "reply") {
          const reply = card.querySelector("textarea").value;
          await api(`/api/messages/${id}/reply`, {
            method: "POST",
            body: JSON.stringify({ reply })
          });
          toast(t("saved"));
          renderDashboard();
        }
      } catch (error) {
        toast(error.message, "error");
      }
    });
  });
  bindRipples();
}

function renderSettings() {
  if (!state.user) {
    toast(t("needLogin"), "error");
    navigate("/auth");
    return;
  }

  const link = `${location.origin}/u/${state.user.username}`;
  page(`
    <section class="settings-card glass-card animate-in">
      <div class="profile-head">
        ${avatar(state.user, "avatar-large")}
        <h1>${t("settings")}</h1>
      </div>
      <form id="settingsForm">
        <label class="field">${t("bio")}<textarea name="bio" maxlength="180">${escapeHtml(state.user.bio || "")}</textarea></label>
        <label class="field">${t("avatar")}<input name="avatarUrl" value="${escapeAttr(state.user.avatarUrl || "")}" inputmode="url" /></label>
        <button class="button button-primary button-full" type="submit">${t("save")}</button>
      </form>
      <div class="field" style="margin-top: 20px;">
        ${t("profileLink")}
        <div class="profile-link-box">
          <input id="profileLink" readonly value="${escapeAttr(link)}" />
          <button class="button button-soft" id="copySettingsLink" type="button">${icons.copy}${t("copyLink")}</button>
        </div>
      </div>
    </section>
  `);

  document.getElementById("settingsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget).entries());
      const data = await api("/api/me", { method: "PUT", body: JSON.stringify(body) });
      state.user = data.user;
      localStorage.setItem("veil_user", JSON.stringify(data.user));
      toast(t("saved"));
      renderSettings();
    } catch (error) {
      toast(error.message, "error");
    }
  });

  document.getElementById("copySettingsLink").addEventListener("click", async () => {
    await navigator.clipboard.writeText(link);
    toast(t("copied"));
  });
}

function renderNotFound() {
  page(`<section class="glass-card empty-state animate-in"><div class="empty-illustration">?</div><h1>${t("notFound")}</h1></section>`);
}

function render() {
  applyPreferences();
  const path = location.pathname;

  if (path === "/") return renderLanding();
  if (path === "/auth") return renderAuth();
  if (path === "/dashboard") return renderDashboard();
  if (path === "/settings") return renderSettings();
  if (path.startsWith("/u/")) return renderProfile(decodeURIComponent(path.split("/u/")[1] || ""));
  return renderNotFound();
}

function bindRipples() {
  document.querySelectorAll(".button, .icon-button, .pill-link").forEach((button) => {
    if (button.dataset.rippleBound) return;
    button.dataset.rippleBound = "true";
    button.addEventListener("click", (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 560);
    });
  });
}

function burstConfetti(anchor) {
  const rect = anchor.getBoundingClientRect();
  const colors = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b"];

  for (let index = 0; index < 20; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${rect.left + rect.width / 2}px`;
    piece.style.top = `${rect.top}px`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--x", `${Math.random() * 220 - 110}px`);
    piece.style.setProperty("--y", `${Math.random() * -150 - 40}px`);
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 920);
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");
  if (!link) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin) return;
  event.preventDefault();
  navigate(url.pathname + url.search);
});

document.getElementById("themeToggle").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("veil_theme", state.theme);
  applyPreferences();
});

document.getElementById("languageToggle").addEventListener("click", () => {
  state.lang = state.lang === "ar" ? "en" : "ar";
  localStorage.setItem("veil_lang", state.lang);
  render();
});

window.addEventListener("popstate", render);
applyPreferences();
render();
