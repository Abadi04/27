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
      icon: "cat-logo.jpg",
      badge: "cat-logo.jpg",
      data: { url: self.registration.scope }
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
