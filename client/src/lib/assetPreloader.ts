/**
 * Asset Preloader with Caching
 * Preloads critical assets (videos, images) and caches them for faster subsequent loads
 */

const CACHE_NAME = 'hoomy-assets-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Critical assets to preload
const CRITICAL_ASSETS = [
  // Videos
  '/video/background.webm',
  '/video/background.mp4',
  // Logo
  '/logo.svg',
  // City images (used on landing page)
  '/images/zurich.webp',
  '/images/geneva.webp',
  '/images/lausanne.webp',
  '/images/bern.webp',
  '/images/basel.webp',
  '/images/lugano.webp',
  // Favicon
  '/favicon.png',
];

interface PreloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

type ProgressCallback = (progress: PreloadProgress) => void;

/**
 * Check if Cache API is available
 */
function isCacheAPIAvailable(): boolean {
  return 'caches' in window && typeof caches !== 'undefined';
}

/**
 * Open or create the cache
 */
async function openCache(): Promise<Cache | null> {
  if (!isCacheAPIAvailable()) {
    return null;
  }
  try {
    return await caches.open(CACHE_NAME);
  } catch (error) {
    console.warn('Failed to open cache:', error);
    return null;
  }
}

/**
 * Check if an asset is cached and still valid
 */
async function isCached(url: string): Promise<boolean> {
  const cache = await openCache();
  if (!cache) return false;
  
  try {
    const cachedResponse = await cache.match(url);
    if (!cachedResponse) return false;
    
    // Check if cache is still valid (within duration)
    const cachedDate = cachedResponse.headers.get('cached-date');
    if (cachedDate) {
      const cacheTime = parseInt(cachedDate, 10);
      const now = Date.now();
      if (now - cacheTime > CACHE_DURATION) {
        // Cache expired, remove it
        await cache.delete(url);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn('Error checking cache for', url, error);
    return false;
  }
}

/**
 * Cache an asset
 */
async function cacheAsset(url: string, response: Response): Promise<void> {
  const cache = await openCache();
  if (!cache) return;
  
  try {
    // Clone the response and add cache date header
    const headers = new Headers(response.headers);
    headers.set('cached-date', Date.now().toString());
    
    const responseToCache = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
    
    await cache.put(url, responseToCache);
  } catch (error) {
    console.warn('Failed to cache asset', url, error);
  }
}

/**
 * Load an asset (from cache or network)
 */
async function loadAsset(url: string): Promise<Response> {
  // Try cache first
  const cached = await isCached(url);
  if (cached) {
    const cache = await openCache();
    if (cache) {
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
  }
  
  // Load from network
  try {
    const response = await fetch(url);
    if (response.ok) {
      // Cache the response
      await cacheAsset(url, response.clone());
      return response;
    }
    throw new Error(`Failed to load ${url}: ${response.status}`);
  } catch (error) {
    console.error('Error loading asset', url, error);
    throw error;
  }
}

/**
 * Preload a video element
 */
function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    
    const handleCanPlay = () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      resolve();
    };
    
    const handleError = (e: Event) => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      reject(new Error(`Failed to preload video: ${src}`));
    };
    
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    
    video.src = src;
    video.load();
  });
}

/**
 * Preload an image
 */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    img.src = src;
  });
}

/**
 * Preload all critical assets
 */
export async function preloadAssets(
  onProgress?: ProgressCallback
): Promise<void> {
  const total = CRITICAL_ASSETS.length;
  let loaded = 0;
  
  const updateProgress = () => {
    if (onProgress) {
      onProgress({
        loaded,
        total,
        percentage: Math.round((loaded / total) * 100),
      });
    }
  };
  
  // Preload assets in parallel with error handling
  const preloadPromises = CRITICAL_ASSETS.map(async (asset) => {
    try {
      // For videos, preload directly (don't cache via fetch)
      if (asset.includes('/video/')) {
        if (asset.endsWith('.webm')) {
          try {
            await preloadVideo(asset);
            // Also try to cache it
            try {
              const response = await fetch(asset);
              if (response.ok) {
                await cacheAsset(asset, response.clone());
              }
            } catch {
              // Ignore cache errors for videos
            }
          } catch {
            // If webm fails, try mp4
            const mp4Asset = asset.replace('.webm', '.mp4');
            if (CRITICAL_ASSETS.includes(mp4Asset)) {
              await preloadVideo(mp4Asset);
              try {
                const response = await fetch(mp4Asset);
                if (response.ok) {
                  await cacheAsset(mp4Asset, response.clone());
                }
              } catch {
                // Ignore cache errors
              }
            }
          }
        } else if (asset.endsWith('.mp4')) {
          await preloadVideo(asset);
          // Try to cache it
          try {
            const response = await fetch(asset);
            if (response.ok) {
              await cacheAsset(asset, response.clone());
            }
          } catch {
            // Ignore cache errors
          }
        }
      } else {
        // For images and other assets, load and cache
        await loadAsset(asset);
        await preloadImage(asset);
      }
      
      loaded++;
      updateProgress();
    } catch (error) {
      // Continue even if one asset fails
      console.warn(`Failed to preload ${asset}:`, error);
      loaded++;
      updateProgress();
    }
  });
  
  await Promise.allSettled(preloadPromises);
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  const cache = await openCache();
  if (!cache) return;
  
  try {
    const keys = await cache.keys();
    const now = Date.now();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const cachedDate = response.headers.get('cached-date');
        if (cachedDate) {
          const cacheTime = parseInt(cachedDate, 10);
          if (now - cacheTime > CACHE_DURATION) {
            await cache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error clearing expired cache:', error);
  }
}

/**
 * Clear all cached assets
 */
export async function clearAssetCache(): Promise<void> {
  if (!isCacheAPIAvailable()) return;
  
  try {
    await caches.delete(CACHE_NAME);
    console.log('Asset cache cleared');
  } catch (error) {
    console.warn('Error clearing asset cache:', error);
  }
}

