import { getAuthToken } from './auth';
import { logger } from './logger';
import { getAPIBaseURL } from './apiConfig';
import { 
  sanitizeObject, 
  sanitizeUrl, 
  getCSRFToken, 
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
  return RATE_LIMITS.default || { max: 60, window: 60000 };
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
    // Note: X-Client-Fingerprint removed - backend CORS doesn't allow it
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
      
      // Log pour débogage - voir exactement ce que le serveur renvoie
      if (process.env.NODE_ENV === 'development') {
        console.log('🔴 ERREUR SERVEUR - Status:', response.status);
        console.log('🔴 ERREUR SERVEUR - errorData complet:', JSON.stringify(errorData, null, 2));
        console.log('🔴 ERREUR SERVEUR - errorData.error:', errorData.error);
        console.log('🔴 ERREUR SERVEUR - errorData.message:', errorData.message);
      }
      
      // Traduire les messages d'erreur techniques en messages compréhensibles
      const translateError = (error: string): string => {
        // Ne pas traduire si le message contient des détails techniques importants
        // (comme les erreurs de base de données qui ont besoin du message original)
        if (error.includes('property_id') || error.includes('column') || error.includes('is of type') || error.includes('Erreur création annonce')) {
          return error; // Garder le message original pour les erreurs techniques détaillées
        }
        
        const translations: Record<string, string> = {
          // Authentification
          'Identifiants incorrects': 'L\'email ou le mot de passe est incorrect. Vérifiez vos informations et réessayez.',
          'Invalid credentials': 'L\'email ou le mot de passe est incorrect. Vérifiez vos informations et réessayez.',
          'Token requis': 'Vous devez être connecté pour accéder à cette page.',
          'Token invalide': 'Votre connexion a expiré. Veuillez vous reconnecter.',
          'Token expired': 'Votre connexion a expiré. Veuillez vous reconnecter.',
          'Email non vérifié': 'Votre adresse email n\'est pas encore vérifiée. Consultez votre boîte mail pour le code de vérification.',
          'Champs requis': 'Veuillez remplir tous les champs obligatoires.',
          
          // Compte
          'Cet email est déjà utilisé': 'Un compte existe déjà avec cette adresse email. Essayez de vous connecter ou utilisez une autre adresse.',
          'Utilisateur non trouvé': 'Aucun compte n\'existe avec cette adresse email.',
          'Ce compte a été supprimé': 'Ce compte a été supprimé et n\'est plus accessible.',
          
          // Téléphone
          'Ce numéro de téléphone est déjà utilisé par un autre compte': 'Ce numéro de téléphone est déjà associé à un autre compte.',
          'Code incorrect': 'Le code de vérification est incorrect. Vérifiez et réessayez.',
          'Code expiré': 'Le code de vérification a expiré. Demandez un nouveau code.',
          
          // Général
          'Non autorisé': 'Vous n\'avez pas les droits pour effectuer cette action.',
          'Accès refusé': 'Vous n\'avez pas les droits pour accéder à cette ressource.',
          'Erreur serveur': 'Un problème technique est survenu. Veuillez réessayer dans quelques instants.',
          'Request failed': 'La connexion au serveur a échoué. Vérifiez votre connexion internet.',
        };
        
        return translations[error] || error;
      };
      
      // Extraire le message d'erreur en vérifiant TOUS les champs possibles
      // Le message détaillé peut être dans error, message, details, ou autres champs
      // Convertir TOUT errorData en string pour rechercher dedans
      const errorDataString = JSON.stringify(errorData);
      
      const rawError = String(errorData.error || '');
      const rawMessage = String(errorData.message || '');
      const rawDetails = String(errorData.details || errorData.detail || '');
      
      // Vérifier si un des messages contient des détails techniques importants
      const hasTechnicalDetails = (text: string) => {
        if (!text || text.trim() === '') return false;
        const textLower = text.toLowerCase();
        return text.includes('property_id') || 
               text.includes('column') || 
               text.includes('is of type') || 
               text.includes('Erreur création annonce') ||
               text.includes('out of range') ||
               textLower.includes('bigint') ||
               textLower.includes('boolean');
      };
      
      // Vérifier si le message détaillé est dans errorDataString (tout le JSON)
      const hasDetailsInFullData = hasTechnicalDetails(errorDataString);
      
      // Priorité : prendre le message qui contient des détails techniques
      // Vérifier dans l'ordre : details > error > message > tout errorData
      let errorMessage: string;
      if (hasTechnicalDetails(rawDetails)) {
        errorMessage = rawDetails;
      } else if (hasTechnicalDetails(rawError)) {
        errorMessage = rawError;
      } else if (hasTechnicalDetails(rawMessage)) {
        errorMessage = rawMessage;
      } else if (hasDetailsInFullData) {
        // Si les détails sont quelque part dans errorData, essayer de les extraire
        // Chercher "Erreur création annonce: ..." dans tout le JSON
        const matchFull = errorDataString.match(/Erreur création annonce[^"}]*?([^"}]*property_id[^"}]*?)/i);
        if (matchFull) {
          errorMessage = matchFull[0].replace(/^["']+|["']+$/g, '').trim();
        } else {
          // Chercher juste le message avec property_id
          const matchPropertyId = errorDataString.match(/[^"]*property_id[^"]*is of type[^"]*/i);
          if (matchPropertyId) {
            errorMessage = matchPropertyId[0].replace(/^["']+|["']+$/g, '').trim();
          } else {
            // Prendre le premier champ non vide qui contient des détails
            errorMessage = rawError || rawMessage || rawDetails || errorDataString.substring(0, 200);
          }
        }
      } else if (rawError && rawError.trim() !== '' && rawError !== 'Erreur serveur') {
        // Si error existe et n'est pas juste "Erreur serveur", le traduire
        errorMessage = translateError(rawError);
      } else if (rawMessage && rawMessage.trim() !== '') {
        // Si message existe, le traduire
        errorMessage = translateError(rawMessage);
      } else if (rawError === 'Erreur serveur') {
        // Si c'est juste "Erreur serveur", utiliser le message générique
        errorMessage = 'Un problème technique est survenu. Veuillez réessayer dans quelques instants.';
      } else {
        // Fallback : message vide ou non défini
        errorMessage = '';
      }
      
      // Log pour débogage - TOUJOURS logger pour voir ce qui arrive du serveur
      console.log('🔍 DEBUG ERREUR COMPLET:');
      console.log('  Status:', response.status);
      console.log('  URL:', url);
      console.log('  errorData complet:', errorData);
      console.log('  errorData JSON:', JSON.stringify(errorData, null, 2));
      console.log('  rawError:', rawError);
      console.log('  rawMessage:', rawMessage);
      console.log('  rawDetails:', rawDetails);
      console.log('  errorDataString contient détails:', hasDetailsInFullData);
      console.log('  Message final extrait:', errorMessage);
      
      // Handle specific error codes
      switch (response.status) {
        case 401:
          // Pour 401, utiliser le message du backend s'il existe (ex: "Identifiants incorrects")
          // Sinon seulement utiliser "session expirée" pour les cas où on est déconnecté
          const hasBackendMessage = errorData.error || errorData.message;
          const authErrorMsg = hasBackendMessage 
            ? errorMessage 
            : 'Votre session a expiré. Veuillez vous reconnecter.';
          const authError = new Error(authErrorMsg);
          (authError as any).status = 401;
          (authError as any).code = errorData.code;
          throw authError;
        case 403:
          // 403 peut être email non vérifié ou compte supprimé
          const forbiddenError = new Error(errorMessage || 'Accès non autorisé.');
          (forbiddenError as any).status = 403;
          (forbiddenError as any).code = errorData.code;
          throw forbiddenError;
        case 429:
          const retryAfter = errorData.retryAfter || response.headers.get('Retry-After') || 60;
          throw new Error(`Trop de tentatives. Veuillez patienter ${retryAfter} secondes avant de réessayer.`);
        case 400:
          throw new Error(errorMessage || 'Les informations saisies sont invalides. Veuillez vérifier et réessayer.');
        case 404:
          throw new Error(errorMessage || 'La ressource demandée n\'existe pas.');
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors - preserve detailed error messages
          const serverError = new Error(errorMessage || 'Le serveur est temporairement indisponible. Veuillez réessayer dans quelques instants.');
          (serverError as any).status = response.status;
          (serverError as any).code = errorData.code;
          (serverError as any).debug_code = errorData.debug_code;
          throw serverError;
        default:
          // Pour les autres erreurs, préserver le message détaillé s'il existe
          throw new Error(errorMessage || 'Une erreur inattendue est survenue. Veuillez réessayer.');
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

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', text);
      console.error('URL:', url);
      throw new Error('Réponse invalide du serveur');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Log all errors for debugging
    console.error('API request error:', error);
    console.error('URL:', url);
    console.error('Method:', method);
    console.error('Endpoint:', endpoint);
    
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
        // Note: X-Client-Fingerprint removed - backend CORS doesn't allow it
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
        // Note: X-Client-Fingerprint removed - backend CORS doesn't allow it
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
