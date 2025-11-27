/**
 * Configuration centralisée de l'URL de l'API
 * Détecte automatiquement l'environnement (dev/prod) et utilise la bonne URL
 */
export function getAPIBaseURL(): string {
  // Si VITE_API_BASE_URL est défini, l'utiliser (priorité)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // En développement, utiliser le backend de production (https://backend.hoomy.site/api)
  if (import.meta.env.DEV) {
    return 'https://backend.hoomy.site/api';
  }
  
  // En production (hoomy.site), utiliser le backend de production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'hoomy.site' || hostname === 'www.hoomy.site') {
      return 'https://backend.hoomy.site/api';
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

