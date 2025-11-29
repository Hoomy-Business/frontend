/**
 * Configuration centralisée de l'URL de l'API
 * Détecte automatiquement l'environnement (dev/prod) et utilise la bonne URL
 */
export function getAPIBaseURL(): string {
  // Si VITE_API_BASE_URL est défini, l'utiliser (priorité)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // En production (hoomy.site), utiliser le backend de production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'hoomy.site' || hostname === 'www.hoomy.site' || hostname.endsWith('.github.io')) {
      return 'https://backend.hoomy.site/api';
    }
    
    // En développement local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    
    // LAN (développement)
    if (import.meta.env.DEV) {
      return `http://${hostname}:3000/api`;
    }
  }
  
  // Par défaut en production
  return 'https://backend.hoomy.site/api';
}

/**
 * Obtient l'URL de base du backend (sans /api)
 */
export function getBackendBaseURL(): string {
  const apiBase = getAPIBaseURL();
  return apiBase.replace(/\/api$/, '') || (apiBase.includes('https') ? 'https://backend.hoomy.site' : 'http://localhost:3000');
}

