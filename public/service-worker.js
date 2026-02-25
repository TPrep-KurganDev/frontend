const APP_SHELL_CACHE = 'app-shell-v1';
const STATIC_CACHE = 'static-v1';
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/cards.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/avatar.png',
  '/Arrow 1.svg',
  '/bell active.svg',
  '/bell inactive.svg',
  '/createdTests.svg',
  '/createTest.svg',
  '/cross.svg',
  '/deleteCard.svg',
  '/findTest.svg',
  '/mark.svg',
  '/settingsCard.svg',
  '/share.svg',
  '/share2.svg',
  '/star.svg',
  '/starActive.svg',
  '/upload button.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return caches.match('/index.html');
  }
}

function isDevHost(url) {
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

self.addEventListener('fetch', (event) => {
  const {request} = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  const devHost = isDevHost(url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  const isStaticAsset = ['script', 'style', 'image', 'font', 'worker'].includes(request.destination);
  if (isStaticAsset) {
    event.respondWith(devHost ? networkFirst(request) : cacheFirst(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const title = data.exam_title || 'Уведомление';
  const notificationId = data.id;

  const options = {
    body: 'Напоминание',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'notification',
    data: {notificationId, url: '/'}
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      self.clients.matchAll({type: 'window', includeUncontrolled: true}).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'NOTIFICATION_SHOWN',
            notificationId
          });
        });
      })
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
