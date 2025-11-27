import { getAuthToken } from './auth';
import { logger } from './logger';
import { getAPIBaseURL } from './apiConfig';
import { 
  sanitizeObject, 
  sanitizeUrl, 
  getCSRFToken, 
  generateRequestFingerprint,
  checkRateLimit,
  reportSecurityViolation,
  isTrustedUrl,
} from './security';

const API_BASE_URL = getAPIBaseURL();

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================

const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB max request size
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

// Endpoints that require CSRF protection
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Rate limit configurations per endpoint pattern
const RATE_LIMITS: Record<string, { max: number; window: number }> = {
  '/auth/login': { max: 5, window: 60000 }, // 5 requests per minute
  '/auth/register': { max: 3, window: 60000 }, // 3 requests per minute
  '/upload': { max: 10, window: 60000 }, // 10 uploads per minute
  'default': { max: 60, window: 60000 }, // 60 requests per minute default
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Normalize URL to prevent double slashes
 */
function normalizeUrl(base: string, endpoint: string): string {
  const baseClean = base.replace(/\/+$/, '');
  const endpointClean = endpoint.replace(/^\/+/, '');
  return `${baseClean}/${endpointClean}`;
}

/**
 * Get rate limit config for endpoint
 */
function getRateLimitConfig(endpoint: string): { max: number; window: number } {
  for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
    if (pattern !== 'default' && endpoint.includes(pattern)) {
      return config;
    }
  }
  return RATE_LIMITS.default;
}

/**
 * Validate endpoint to prevent SSRF and invalid requests
 */
function validateEndpoint(endpoint: string): boolean {
  // Block frontend routes being used as API endpoints
  const invalidPatterns = [
    '/properties/create',
    '/properties/edit',
    '/dashboard',
    '/login',
    '/register',
  ];
  
  return !invalidPatterns.some(pattern => endpoint.includes(pattern));
}

/**
 * Create AbortController with timeout
 */
function createTimeoutController(timeout: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}

// =============================================================================
// SECURE API REQUEST
// =============================================================================

export async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<T> {
  // Validate endpoint
  if (!validateEndpoint(endpoint)) {
    reportSecurityViolation('invalid_endpoint', { endpoint, method });
    throw new Error(`Invalid API endpoint: ${endpoint}`);
  }

  // Build URL
  const url = endpoint.startsWith('http') ? endpoint : normalizeUrl(API_BASE_URL, endpoint);
  
  // Validate URL is trusted
  if (endpoint.startsWith('http') && !isTrustedUrl(url)) {
    reportSecurityViolation('untrusted_url', { url });
    throw new Error('Request to untrusted URL blocked');
  }

  // Check client-side rate limit
  const rateLimitConfig = getRateLimitConfig(endpoint);
  const rateLimitKey = `api:${method}:${endpoint.split('?')[0]}`;
  const rateCheck = checkRateLimit(rateLimitKey, rateLimitConfig.max, rateLimitConfig.window);
  
  if (!rateCheck.allowed) {
    throw new Error(`Trop de requêtes. Veuillez réessayer dans ${rateCheck.retryAfter} secondes.`);
  }

  // Build headers
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Helps prevent CSRF
    'X-Client-Fingerprint': generateRequestFingerprint(),
  };

  // Add auth token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add CSRF token for state-changing requests
  if (CSRF_PROTECTED_METHODS.includes(method.toUpperCase())) {
    headers['X-CSRF-Token'] = getCSRFToken();
  }

  // Build request config
  const config: RequestInit = {
    method: method.toUpperCase(),
    headers,
    // Use 'include' for cross-origin requests (needed for LAN development)
    // In production with same origin, this still works fine
    credentials: 'include', // Include cookies for cross-origin requests
  };

  // Add body for POST/PUT/PATCH
  if (data && CSRF_PROTECTED_METHODS.includes(method.toUpperCase())) {
    // Sanitize data before sending
    const sanitizedData = typeof data === 'object' ? sanitizeObject(data as Record<string, unknown>) : data;
    const body = JSON.stringify(sanitizedData);
    
    // Check request size
    if (body.length > MAX_REQUEST_SIZE) {
      throw new Error('Request body too large');
    }
    
    config.body = body;
  }

  // Create timeout controller
  const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      
      // Handle specific error codes
      switch (response.status) {
        case 401:
          // Token expired or invalid - will be handled by auth context
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        case 403:
          reportSecurityViolation('forbidden_access', { endpoint, status: 403 });
          throw new Error('Accès non autorisé.');
        case 429:
          const retryAfter = errorData.retryAfter || response.headers.get('Retry-After') || 60;
          throw new Error(`Trop de requêtes. Veuillez réessayer dans ${retryAfter} secondes.`);
        case 400:
          throw new Error(errorData.error || errorData.message || 'Données invalides.');
        default:
          throw new Error(errorData.error || errorData.message || 'Une erreur est survenue.');
      }
    }

    // Parse response
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La requête a expiré. Veuillez réessayer.');
      }
      throw error;
    }
    
    throw new Error('Une erreur réseau est survenue.');
  }
}

// =============================================================================
// SECURE FILE UPLOAD
// =============================================================================

export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  // Validate file
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.');
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Fichier trop volumineux. Taille maximale: 10 MB.');
  }

  // Rate limit check
  const rateCheck = checkRateLimit('upload:image', 10, 60000);
  if (!rateCheck.allowed) {
    throw new Error(`Trop d'uploads. Veuillez réessayer dans ${rateCheck.retryAfter} secondes.`);
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentification requise');
  }

  const formData = new FormData();
  formData.append('image', file);

  const { controller, timeoutId } = createTimeoutController(60000); // 60s for uploads

  try {
    const response = await fetch(normalizeUrl(API_BASE_URL, '/upload/image'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': getCSRFToken(),
        'X-Client-Fingerprint': generateRequestFingerprint(),
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Échec de l\'upload');
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function uploadImages(files: File[]): Promise<{ images: { url: string; filename: string }[] }> {
  // Validate files
  if (!files || files.length === 0) {
    throw new Error('Aucun fichier fourni');
  }

  if (files.length > 10) {
    throw new Error('Maximum 10 images par upload');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024;

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Type de fichier non autorisé: ${file.name}`);
    }
    if (file.size > maxSize) {
      throw new Error(`Fichier trop volumineux: ${file.name}`);
    }
  }

  // Rate limit check
  const rateCheck = checkRateLimit('upload:images', 5, 60000);
  if (!rateCheck.allowed) {
    throw new Error(`Trop d'uploads. Veuillez réessayer dans ${rateCheck.retryAfter} secondes.`);
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentification requise');
  }
  
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const { controller, timeoutId } = createTimeoutController(120000); // 2 min for multiple uploads

  try {
    const response = await fetch(normalizeUrl(API_BASE_URL, '/upload/images'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': getCSRFToken(),
        'X-Client-Fingerprint': generateRequestFingerprint(),
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Échec de l'upload (${response.status})`;
      try {
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            if (text.includes('File too large')) {
              errorMessage = 'Fichier trop volumineux. Taille maximale: 10 MB par image.';
            } else {
              errorMessage = text.substring(0, 200);
            }
          }
        }
      } catch {
        // Use default error message
      }
      logger.error('Upload images error:', errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
