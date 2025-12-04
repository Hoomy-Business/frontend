import { getBackendBaseURL } from './apiConfig';

/**
 * Normalise une URL d'image pour pointer vers le backend
 * Gère les différents formats : URLs complètes, chemins relatifs, ou juste le nom de fichier
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  // Si pas d'URL, retourner le placeholder SVG inline
  if (!url || url.trim() === '') {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="16"%3EImage non disponible%3C/text%3E%3C/svg%3E';
  }

  const trimmedUrl = url.trim();

  // Si c'est déjà un placeholder, le retourner tel quel
  if (trimmedUrl.startsWith('/placeholder-') || trimmedUrl.startsWith('data:')) {
    return trimmedUrl;
  }

  // Get API base URL
  const imageBaseUrl = getBackendBaseURL();

  // Si c'est déjà une URL complète vers le backend (localhost, IP, ou domaine), normaliser
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    // Vérifier si c'est une URL du backend (localhost, IP locale, ou domaine backend)
    const isBackendUrl = 
      trimmedUrl.includes('localhost:3000') ||
      trimmedUrl.includes('backend.hoomy.site') ||
      trimmedUrl.includes('/api/image/') || // Si ça contient /api/image/, c'est probablement notre backend
      trimmedUrl.includes('/api/kyc/image/') || // URLs KYC
      /^\d+\.\d+\.\d+\.\d+:\d+/.test(trimmedUrl); // IP avec port (ex: 165.227.164.39:3000)
    
    if (isBackendUrl) {
      // Extraire le nom de fichier depuis l'URL KYC
      const kycUrlMatch = trimmedUrl.match(/\/api\/kyc\/image\/([^\/\?]+)/);
      if (kycUrlMatch) {
        const base = imageBaseUrl.replace(/\/+$/, '');
        return `${base}/api/kyc/image/${kycUrlMatch[1]}`;
      }
      
      // Extraire le nom de fichier depuis l'URL image normale
      const urlMatch = trimmedUrl.match(/\/api\/image\/([^\/\?]+)/);
      if (urlMatch) {
        const base = imageBaseUrl.replace(/\/+$/, '');
        return `${base}/api/image/${urlMatch[1]}`;
      }
      
      // Si l'URL contient un nom de fichier à la fin (fallback)
      const filenameMatch = trimmedUrl.match(/\/([^\/\?]+\.(jpg|jpeg|png|gif|webp))$/i);
      if (filenameMatch) {
        const base = imageBaseUrl.replace(/\/+$/, '');
        // Essayer de deviner si c'est une image KYC ou normale
        if (filenameMatch[1].startsWith('kyc-')) {
          return `${base}/api/kyc/image/${filenameMatch[1]}`;
        }
        return `${base}/api/image/${filenameMatch[1]}`;
      }
    }
    // Si c'est une URL externe valide (pas notre backend), la retourner tel quel
    return trimmedUrl;
  }

  // Si c'est un chemin relatif qui commence par /api/kyc/image/, construire l'URL complète
  if (trimmedUrl.startsWith('/api/kyc/image/')) {
    const base = imageBaseUrl.replace(/\/+$/, '');
    return `${base}${trimmedUrl}`;
  }

  // Si c'est un chemin relatif qui commence par /api/image/, construire l'URL complète
  if (trimmedUrl.startsWith('/api/image/')) {
    const base = imageBaseUrl.replace(/\/+$/, '');
    return `${base}${trimmedUrl}`;
  }

  // Si c'est juste un nom de fichier, extraire le nom et construire l'URL
  // Le backend stocke parfois l'URL complète, parfois juste le nom de fichier
  let filename = trimmedUrl;
  
  // Extraire le nom de fichier si c'est un chemin
  if (trimmedUrl.includes('/')) {
    filename = trimmedUrl.split('/').pop() || trimmedUrl;
  }
  
  // Nettoyer le filename (enlever les paramètres de requête, etc.)
  filename = filename.split('?')[0].split('#')[0];
  
  // Si le filename contient déjà l'extension et ressemble à un nom de fichier valide
  if (filename && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
    const base = imageBaseUrl.replace(/\/+$/, '');
    // Si le filename commence par "kyc-", c'est une image KYC
    if (filename.startsWith('kyc-')) {
      return `${base}/api/kyc/image/${filename}`;
    }
    return `${base}/api/image/${filename}`;
  }

  // Si c'est un chemin qui contient "api/kyc/image", extraire le filename
  const kycMatch = trimmedUrl.match(/\/api\/kyc\/image\/([^\/\?]+)/);
  if (kycMatch) {
    const base = imageBaseUrl.replace(/\/+$/, '');
    return `${base}/api/kyc/image/${kycMatch[1]}`;
  }

  // Si c'est un chemin qui contient "api/image", extraire le filename
  const match = trimmedUrl.match(/\/api\/image\/([^\/\?]+)/);
  if (match) {
    const base = imageBaseUrl.replace(/\/+$/, '');
    return `${base}/api/image/${match[1]}`;
  }

  // Si le filename n'a pas d'extension mais ressemble à un nom de fichier (contient des caractères alphanumériques)
  if (filename && /^[a-zA-Z0-9_-]+$/.test(filename)) {
    const base = imageBaseUrl.replace(/\/+$/, '');
    return `${base}/api/image/${filename}`;
  }

  // Par défaut, retourner le placeholder SVG inline si on ne peut pas déterminer l'URL
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="16"%3EImage non disponible%3C/text%3E%3C/svg%3E';
}

