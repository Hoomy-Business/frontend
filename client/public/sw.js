// Service Worker for Hoomy - Offline caching and performance
// Version updated for aggressive mobile caching and maximum performance
const SW_VERSION = 'v6';
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
      // Only cache full responses (status 200), not partial (206) or other status codes
      // Skip caching for video files and large media files
      const requestUrl = new URL(request.url);
      const isVideo = /\.(webm|mp4|avi|mov|mkv)$/i.test(requestUrl.pathname);
      const isLargeMedia = /\.(webm|mp4|avi|mov|mkv|mp3|wav|ogg)$/i.test(requestUrl.pathname);
      
      if (response.ok && response.status === 200 && response.type === 'basic' && !isLargeMedia) {
        const cache = await caches.open(DYNAMIC_CACHE);
        // Clone response before caching to avoid consuming the stream
        const responseToCache = response.clone();
        // Check if response is cacheable (not a partial response)
        if (responseToCache.status === 200 && !responseToCache.headers.get('content-range')) {
          cache.put(request, responseToCache).catch(() => {
            // Ignore cache errors silently
          });
        }
      }
      return response;
    } catch (error) {
      // For video/media files, don't try to serve from cache, just let it fail gracefully
      const requestUrl = new URL(request.url);
      const isVideo = /\.(webm|mp4|avi|mov|mkv|mp3|wav|ogg)$/i.test(requestUrl.pathname);
      
      if (isVideo) {
        // Return a transparent 1x1 pixel response for videos that fail to load
        return new Response(null, { status: 204, statusText: 'No Content' });
      }
      
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
      // Only cache full responses (status 200), not partial (206)
      if (response.ok && response.status === 200 && response.type === 'basic' && !response.headers.get('content-range')) {
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
        // Only cache full responses (status 200), not partial (206)
        if (response.ok && response.status === 200 && response.type === 'basic' && !response.headers.get('content-range')) {
          caches.open(IMAGE_CACHE).then(cache => cache.put(request, response.clone()));
        }
      }).catch(() => {});
      return cached;
    }
    
    // Not cached - fetch and cache
    try {
      const response = await fetch(request);
      // Only cache full responses (status 200), not partial (206)
      if (response.ok && response.status === 200 && response.type === 'basic' && !response.headers.get('content-range')) {
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
  
  // Static assets (JS, CSS, fonts) - Aggressive cache-first for maximum speed
  // Always return cached if available, update in background
  if (url.pathname.match(/\.(js|css|woff2?|ttf|otf)$/i) || url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      // Check cache first - return immediately if available (FAST!)
      const cached = await caches.match(request);
      if (cached) {
        // Update cache in background (non-blocking)
        fetch(request).then(response => {
          // Only cache full responses (status 200), not partial (206)
          if (response.ok && response.status === 200 && response.type === 'basic' && !response.headers.get('content-range')) {
            caches.open(JS_CSS_CACHE).then(cache => {
              cache.put(request, response.clone());
            });
          }
        }).catch(() => {}); // Ignore errors in background update
        return cached;
      }
      
      // Not cached - fetch and cache
      try {
        const response = await fetch(request);
        // Only cache full responses (status 200), not partial (206)
        if (response.ok && response.status === 200 && response.type === 'basic' && !response.headers.get('content-range')) {
          const cache = await caches.open(JS_CSS_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        throw new Error('Resource unavailable');
      }
    })());
    return;
  }
  
  // HTML navigation - aggressive cache-first for instant page loads
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      // If cached, return immediately (INSTANT!) and update in background
      if (cached) {
        // Background update (non-blocking)
        fetch(request).then(response => {
          // Only cache full responses (status 200), not partial (206)
          if (response.ok && response.status === 200 && response.type === 'basic' && !response.headers.get('content-range')) {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, response.clone());
            });
          }
        }).catch(() => {}); // Ignore errors
        return cached;
      }
      // Not cached - network first, then cache
      try {
        const response = await fetch(request);
        // Only cache full responses (status 200), not partial (206)
        if (response.ok && response.status === 200 && response.type === 'basic' && !response.headers.get('content-range')) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        // Return index.html as fallback for SPA
        const fallback = await caches.match('/');
        return fallback || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }
  
  // Default: network first
  // Skip service worker for video files and assets that might not exist
  const requestUrl = new URL(event.request.url);
  const isVideo = /\.(webm|mp4|avi|mov|mkv|mp3|wav|ogg)$/i.test(requestUrl.pathname);
  const isAsset = requestUrl.pathname.startsWith('/assets/');
  
  // Don't intercept videos or assets that might not exist
  if (isVideo || isAsset) {
    // Let them load directly without service worker interference
    return;
  }
  
  event.respondWith((async () => {
    try {
      const response = await CACHE_STRATEGIES.networkFirst(request);
      return response;
    } catch (error) {
      // Better error handling - log but don't break the app
      console.warn('Service worker fetch error:', error);
      // Try to return from cache as fallback
      const cached = await caches.match(event.request);
      if (cached) {
        return cached;
      }
      // If all else fails, return a basic error response
      return new Response('Resource unavailable', { 
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  })());
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

