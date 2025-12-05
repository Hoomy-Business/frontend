// Service Worker for Hoomy - Optimized for reliability
// IMPORTANT: Always fetch fresh HTML to prevent blank page issues
const SW_VERSION = 'v7-fix';
const CACHE_NAME = `hoomy-${SW_VERSION}`;
const IMAGE_CACHE = `hoomy-images-${SW_VERSION}`;

// Static assets to cache (NO HTML - always fresh)
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.svg',
  '/favicon.png',
];

// Install event - cache only essential static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up ALL old caches aggressively
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', SW_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('hoomy-') && !name.includes(SW_VERSION))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Taking control of all clients');
      return self.clients.claim();
    })
    // REMOVED: Don't send SW_UPDATED messages on activation
    // This was causing infinite reload loops
    // Clients will get updates naturally when they make requests
  );
});

// Fetch event - NETWORK FIRST for HTML, cache for images only
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip API requests completely
  if (url.pathname.startsWith('/api') || url.hostname === 'backend.hoomy.site') {
    return;
  }
  
  // CRITICAL: NEVER cache HTML or JS/CSS - always fetch fresh
  // This prevents blank page issues when new versions are deployed
  if (request.mode === 'navigate' || 
      url.pathname === '/' || 
      url.pathname.endsWith('.html') ||
      url.pathname.match(/\.(js|css)$/i) ||
      url.pathname.startsWith('/assets/')) {
    // Let browser handle directly - no SW interference
    return;
  }
  
  // Only cache images with stale-while-revalidate
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok && response.status === 200) {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => cached);
        
        return cached || fetchPromise;
      })
    );
    return;
  }
  
  // Everything else: network only, no caching
  // Don't intercept - let browser handle
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
