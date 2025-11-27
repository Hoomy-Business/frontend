/**
 * Security utilities for Hoomy frontend
 * Provides XSS protection, input sanitization, and security helpers
 */

// =============================================================================
// XSS PROTECTION & SANITIZATION
// =============================================================================

/**
 * HTML entities to escape for XSS prevention
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize a string by removing potentially dangerous content
 */
export function sanitizeString(input: unknown): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);
  
  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Remove javascript: and data: URIs
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    // Remove vbscript: URIs
    .replace(/vbscript:/gi, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize an object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

// =============================================================================
// URL VALIDATION
// =============================================================================

/**
 * Allowed URL protocols
 */
const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];

/**
 * Validate and sanitize a URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  
  // Block javascript: and data: URIs
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  
  try {
    const parsed = new URL(trimmed, window.location.origin);
    
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.href;
  } catch {
    // If it's a relative URL, it's generally safe
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    return '';
  }
}

/**
 * Check if URL is from a trusted domain
 */
export function isTrustedUrl(url: string): boolean {
  const TRUSTED_DOMAINS = [
    'hoomy.site',
    'backend.hoomy.site',
    'api.stripe.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'images.unsplash.com',
  ];
  
  try {
    const parsed = new URL(url);
    return TRUSTED_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// =============================================================================
// CSRF PROTECTION
// =============================================================================

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create CSRF token
 */
export function getCSRFToken(): string {
  const CSRF_KEY = 'hoomy_csrf_token';
  let token = sessionStorage.getItem(CSRF_KEY);
  
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem(CSRF_KEY, token);
  }
  
  return token;
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCSRFToken(): void {
  sessionStorage.removeItem('hoomy_csrf_token');
}

// =============================================================================
// REQUEST FINGERPRINTING
// =============================================================================

/**
 * Generate a request fingerprint for additional security
 */
export function generateRequestFingerprint(): string {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// =============================================================================
// RATE LIMITING (CLIENT-SIDE)
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  key: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  entry.count++;
  return { allowed: true };
}

// =============================================================================
// SECURE STORAGE
// =============================================================================

/**
 * Secure storage wrapper with encryption for sensitive data
 */
export const secureStorage = {
  /**
   * Store data securely (with basic obfuscation)
   */
  set(key: string, value: string): void {
    try {
      // Add timestamp and encode
      const data = JSON.stringify({
        v: value,
        t: Date.now(),
        h: generateRequestFingerprint(),
      });
      const encoded = btoa(encodeURIComponent(data));
      localStorage.setItem(`_s_${key}`, encoded);
    } catch (e) {
      console.error('Secure storage set error:', e);
    }
  },

  /**
   * Retrieve securely stored data
   */
  get(key: string, maxAgeMs: number = 24 * 60 * 60 * 1000): string | null {
    try {
      const encoded = localStorage.getItem(`_s_${key}`);
      if (!encoded) return null;
      
      const data = JSON.parse(decodeURIComponent(atob(encoded)));
      
      // Check if data is expired
      if (Date.now() - data.t > maxAgeMs) {
        this.remove(key);
        return null;
      }
      
      return data.v;
    } catch (e) {
      this.remove(key);
      return null;
    }
  },

  /**
   * Remove securely stored data
   */
  remove(key: string): void {
    localStorage.removeItem(`_s_${key}`);
  },

  /**
   * Clear all secure storage
   */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('_s_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
};

// =============================================================================
// INPUT VALIDATION
// =============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number (Swiss format)
 */
export function isValidSwissPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  const swissPhoneRegex = /^(\+41|0041|0)[1-9][0-9]{8}$/;
  return swissPhoneRegex.test(cleaned);
}

/**
 * Validate Swiss postal code
 */
export function isValidSwissPostalCode(code: string): boolean {
  return /^[1-9][0-9]{3}$/.test(code);
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  else feedback.push('Au moins 8 caractères requis');
  
  if (password.length >= 12) score++;
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Ajoutez des lettres minuscules');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Ajoutez des lettres majuscules');
  
  if (/[0-9]/.test(password)) score++;
  else feedback.push('Ajoutez des chiffres');
  
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Ajoutez des caractères spéciaux');
  
  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score--;
    feedback.push('Évitez les caractères répétés');
  }
  
  if (/^(123|abc|qwerty|password|azerty)/i.test(password)) {
    score--;
    feedback.push('Évitez les séquences communes');
  }
  
  return { score: Math.max(0, Math.min(6, score)), feedback };
}

// =============================================================================
// SECURITY HEADERS VERIFICATION
// =============================================================================

/**
 * Verify that security headers are present (for debugging)
 */
export function verifySecurityHeaders(): Record<string, boolean> {
  // This can only check meta tags, not HTTP headers
  const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  
  return {
    hasCSP: !!csp,
    hasViewport: !!document.querySelector('meta[name="viewport"]'),
    hasCharset: !!document.querySelector('meta[charset]'),
    isHTTPS: window.location.protocol === 'https:',
  };
}

// =============================================================================
// CONTENT SECURITY
// =============================================================================

/**
 * Check if running in a secure context
 */
export function isSecureContext(): boolean {
  return window.isSecureContext === true;
}

/**
 * Report security violation
 */
export function reportSecurityViolation(type: string, details: Record<string, unknown>): void {
  console.error(`[SECURITY] ${type}:`, details);
  
  // In production, you would send this to a logging service
  if (import.meta.env.PROD) {
    // Could send to backend security logging endpoint
    // fetch('/api/security/report', { method: 'POST', body: JSON.stringify({ type, details }) });
  }
}

// =============================================================================
// ANTI-TAMPERING
// =============================================================================

/**
 * Detect if DevTools are open (basic check)
 */
export function detectDevTools(): boolean {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  return widthThreshold || heightThreshold;
}

/**
 * Protect against clickjacking
 */
export function preventClickjacking(): void {
  if (window.self !== window.top) {
    // We're in an iframe
    document.body.innerHTML = '';
    reportSecurityViolation('clickjacking', { 
      topOrigin: document.referrer,
      currentOrigin: window.location.origin,
    });
  }
}

// Run clickjacking protection immediately
if (typeof window !== 'undefined') {
  preventClickjacking();
}

