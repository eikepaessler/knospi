self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = { title: 'Knospi', body: 'Eine Pflanze braucht dich.' };
  try { data = event.data.json(); } catch { /* Text statt JSON, Default beibehalten */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { plantId: data.plantId }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const plantId = event.notification.data?.plantId;
  const url = plantId ? `/pflanze/${plantId}` : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => 'focus' in c);
      if (existing) { existing.navigate(url); return existing.focus(); }
      return self.clients.openWindow(url);
    })
  );
});
