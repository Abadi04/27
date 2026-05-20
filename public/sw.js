/* eslint-env serviceworker */
/* 27 — Service Worker
   - Offline support via precache (app shell) + runtime caching for static assets
   - Network-first for navigations so users always get the latest HTML when online
   - Never caches Supabase / API responses (privacy + freshness)
   - Push notifications + click handling
   Bump CACHE_VERSION on every deploy that changes cached assets. */

const CACHE_VERSION = "27-v1";
const PRECACHE = `${CACHE_VERSION}-precache`;
const RUNTIME = `${CACHE_VERSION}-runtime`;

// App shell — keep this list aligned with the assets index.html actually loads.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./vendor/qrcode.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()) // never block install on a single 404
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isCacheableStatic(url) {
  return /\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf)(\?.*)?$/i.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET; let everything else hit the network untouched.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never cache cross-origin API traffic (Supabase, CDNs we don't control state for).
  // Same-origin static assets and the app shell only.
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to cached shell when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (isCacheableStatic(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(RUNTIME).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});

// Allow the page to trigger an immediate SW update.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("push", (event) => {
  let body = "";
  try {
    const data = event.data ? event.data.json() : {};
    body = data.message || data.body || "";
  } catch {
    body = event.data ? event.data.text() : "";
  }

  event.waitUntil(
    self.registration.showNotification("27", {
      body,
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      data: { url: self.registration.scope },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.registration.scope;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((client) => client.url.startsWith(targetUrl));
      if (existing) return existing.focus();
      return clients.openWindow(targetUrl);
    })
  );
});
