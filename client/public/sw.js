// Service Worker for Hoomy - Offline caching and performance
const CACHE_NAME = 'hoomy-v1';
const STATIC_CACHE = 'hoomy-static-v1';
const DYNAMIC_CACHE = 'hoomy-dynamic-v1';
const IMAGE_CACHE = 'hoomy-images-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/favicon.png',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fall back to cache
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/');
      }
      throw new Error('Network unavailable');
    }
  },
  
  // Cache first, fall back to network
  cacheFirst: async (request) => {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      throw new Error('Resource unavailable');
    }
  },
  
  // Stale while revalidate - best for images
  staleWhileRevalidate: async (request) => {
    const cached = await caches.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        const cache = caches.open(IMAGE_CACHE);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    }).catch(() => null);
    
    return cached || fetchPromise;
  },
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('hoomy-') && !name.includes('-v1'))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip API requests (let them go through normally)
  if (url.pathname.startsWith('/api') || url.hostname === 'backend.hoomy.site') {
    return;
  }
  
  // Handle different resource types
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)) {
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
    return;
  }
  
  // Static assets (JS, CSS, fonts)
  if (url.pathname.match(/\.(js|css|woff2?|ttf|otf)$/i) || url.pathname.startsWith('/assets/')) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
    return;
  }
  
  // HTML navigation - network first
  if (request.mode === 'navigate') {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }
  
  // Default: network first
  event.respondWith(CACHE_STRATEGIES.networkFirst(request));
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  // Sync favorites when back online
  // Implementation depends on IndexedDB storage
  console.log('Syncing favorites...');
}

// Handle push notifications (if implemented)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Hoomy', {
      body: data.body,
      icon: '/logo.svg',
      badge: '/favicon.png',
      data: data.url,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

