// Service Worker for Hoomy - Offline caching and performance
// Version updated for aggressive mobile caching
const SW_VERSION = 'v3';
const CACHE_NAME = `hoomy-${SW_VERSION}`;
const STATIC_CACHE = `hoomy-static-${SW_VERSION}`;
const DYNAMIC_CACHE = `hoomy-dynamic-${SW_VERSION}`;
const IMAGE_CACHE = `hoomy-images-${SW_VERSION}`;
const JS_CSS_CACHE = `hoomy-assets-${SW_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/favicon.png',
];

// Track if this is first visit (for cache strategy)
let isFirstVisit = true;

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
  
  // Stale while revalidate - best for images (fast on mobile)
  staleWhileRevalidate: async (request) => {
    const cached = await caches.match(request);
    
    // Return cached immediately if available (fast!)
    if (cached) {
      // Update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          caches.open(IMAGE_CACHE).then(cache => cache.put(request, response.clone()));
        }
      }).catch(() => {});
      return cached;
    }
    
    // Not cached - fetch and cache
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(IMAGE_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return null;
    }
  },
};

// Install event - cache static assets aggressively
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(JS_CSS_CACHE), // Pre-create cache for JS/CSS
      caches.open(IMAGE_CACHE), // Pre-create cache for images
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete all old caches that don't match current version
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('hoomy-') && !name.includes(SW_VERSION))
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    }).then(() => {
      // Mark that first visit is done after activation
      isFirstVisit = false;
    })
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
  
  // Static assets (JS, CSS, fonts) - Cache first after first visit for speed
  // Network first on first visit to get latest, then cache-first for speed
  if (url.pathname.match(/\.(js|css|woff2?|ttf|otf)$/i) || url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      // Check if we have this in cache
      const cached = await caches.match(request);
      
      // If cached and not first visit, return cached immediately (fast!)
      if (cached && !isFirstVisit) {
        // Update cache in background
        fetch(request).then(response => {
          if (response.ok) {
            caches.open(JS_CSS_CACHE).then(cache => cache.put(request, response.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      
      // First visit or not cached - network first
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(JS_CSS_CACHE);
          cache.put(request, response.clone());
          isFirstVisit = false;
        }
        return response;
      } catch {
        // Fallback to cache if network fails
        if (cached) return cached;
        throw new Error('Resource unavailable');
      }
    })());
    return;
  }
  
  // HTML navigation - cache first for speed after first visit
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      // If cached, return immediately (fast!) and update in background
      if (cached && !isFirstVisit) {
        fetch(request).then(response => {
          if (response.ok) {
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, response.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      // First visit or not cached - network first
      return CACHE_STRATEGIES.networkFirst(request);
    })());
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

