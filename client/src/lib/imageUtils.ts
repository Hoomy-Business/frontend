/**
 * Normalise une URL d'image pour pointer vers le backend
 * Gère les différents formats : URLs complètes, chemins relatifs, ou juste le nom de fichier
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  // Si pas d'URL, retourner le placeholder
  if (!url || url.trim() === '') {
    return '/placeholder-property.jpg';
  }

  const trimmedUrl = url.trim();

  // Si c'est déjà un placeholder, le retourner tel quel
  if (trimmedUrl.startsWith('/placeholder-') || trimmedUrl.startsWith('data:')) {
    return trimmedUrl;
  }

  // Si c'est déjà une URL complète vers le backend, la retourner
  if (trimmedUrl.startsWith('https://backend.hoomy.site') || trimmedUrl.startsWith('https://backend.hoomy.site')) {
    return trimmedUrl;
  }

  // Si c'est une URL avec localhost ou un autre domaine, extraire le nom de fichier
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    // Extraire le nom de fichier depuis l'URL
    const urlMatch = trimmedUrl.match(/\/api\/image\/([^\/\?]+)/);
    if (urlMatch) {
      return `http://https://backend.hoomy.site/api/image/${urlMatch[1]}`;
    }
    // Si l'URL contient un nom de fichier à la fin
    const filenameMatch = trimmedUrl.match(/\/([^\/\?]+\.(jpg|jpeg|png|gif|webp))$/i);
    if (filenameMatch) {
      return `https://backend.hoomy.site/api/image/${filenameMatch[1]}`;
    }
    // Si on ne peut pas extraire, retourner tel quel (peut-être une URL externe valide)
    return trimmedUrl;
  }

  // Si c'est un chemin relatif qui commence par /api/image/, construire l'URL complète
  if (trimmedUrl.startsWith('/api/image/')) {
    return `https://backend.hoomy.site${trimmedUrl}`;
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
    return `https://backend.hoomy.site/api/image/${filename}`;
  }

  // Si c'est un chemin qui contient "api/image", extraire le filename
  const match = trimmedUrl.match(/\/api\/image\/([^\/\?]+)/);
  if (match) {
    return `https://backend.hoomy.site/api/image/${match[1]}`;
  }

  // Si le filename n'a pas d'extension mais ressemble à un nom de fichier (contient des caractères alphanumériques)
  if (filename && /^[a-zA-Z0-9_-]+$/.test(filename)) {
    return `https://backend.hoomy.site/api/image/${filename}`;
  }

  // Par défaut, retourner le placeholder si on ne peut pas déterminer l'URL
  return '/placeholder-property.jpg';
}

