// Promise Yura Service Worker for Notifications and PWA capabilities

const CACHE_NAME = 'yura-cache-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/yura-love.png',
  '/manifest.json',
  '/manifest.json?v=6',
  '/icons/icon-192.png',
  '/icons/icon-192.png?v=6',
  '/icons/icon-512.png',
  '/icons/icon-512.png?v=6',
  '/icons/maskable-192.png',
  '/icons/maskable-192.png?v=6',
  '/icons/maskable-512.png',
  '/icons/maskable-512.png?v=6',
  '/icons/notification-yura.png',
  '/icons/notification-yura.png?v=6'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Warm up the cache with essential assets
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// A Network-First fallback to Cache strategy to ensure fresh content
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip tracking, API requests, third-party authentication or browser extensions
  if (
    event.request.method !== 'GET' || 
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('identitytoolkit') ||
    event.request.url.includes('securetoken.googleapis.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If it's a valid successful response of our own site, cache it dynamically
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // network failed, fallback gracefully to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If we can't find it in cache, let the browser handle it
        });
      })
  );
});

// Handle standard push events if sent during local demos
self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.notification?.title || payload.data?.title || payload.title || 'Yura Nudge ⏰';
  const body = payload.notification?.body || payload.data?.body || payload.body || "Yura is checking on your promise!";

  const options = {
    body: body,
    icon: '/icons/notification-yura.png?v=6',
    badge: '/icons/notification-yura.png?v=6',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: payload.data || payload
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        // Focus the existing window if open
        return clientList[0].focus();
      }
      // Or open a new window
      return self.clients.openWindow('/');
    })
  );
});
