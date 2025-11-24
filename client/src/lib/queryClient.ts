import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthToken } from "./auth";
import { logger } from "./logger";
import { getAPIBaseURL } from "./apiConfig";

const API_BASE_URL = getAPIBaseURL();

// Helper function to prevent double slashes in URLs
function normalizeUrl(base: string, endpoint: string): string {
  const baseClean = base.replace(/\/+$/, ''); // Remove trailing slashes
  const endpointClean = endpoint.replace(/^\/+/, ''); // Remove leading slashes
  return `${baseClean}/${endpointClean}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
    }
    
    const error = new Error(errorMessage);
    (error as any).status = res.status;
    throw error;
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : normalizeUrl(API_BASE_URL, url);

  // Protection: bloquer les requêtes vers des endpoints invalides
  if (fullUrl.includes('/properties/create') || fullUrl.includes('/properties/edit')) {
    logger.error('🚫 BLOCKED invalid API request in queryClient.apiRequest:', fullUrl);
    logger.error('Method:', method, 'URL:', url);
    logger.error('Stack trace:', new Error().stack);
    throw new Error(`Invalid API endpoint: ${url}. This appears to be a frontend route, not an API endpoint.`);
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  
  const contentLength = res.headers.get('content-length');
  if (contentLength === '0' || res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Filtrer les valeurs null/undefined de la queryKey
    const validKey = queryKey.filter(k => k != null && k !== '');
    const endpoint = validKey.join('/');
    
    // Rejeter les endpoints invalides qui contiennent "create", "edit", etc.
    // Ces routes sont des pages frontend, pas des endpoints API
    const invalidPatterns = ['/create', '/edit', '/delete', '/update'];
    const hasInvalidPattern = invalidPatterns.some(pattern => 
      endpoint.includes(pattern) || endpoint.endsWith(pattern)
    );
    
    if (hasInvalidPattern) {
      // Log avec stack trace pour identifier la source
      logger.error('🚫 BLOCKED invalid API request:', endpoint);
      logger.error('QueryKey:', queryKey);
      logger.error('Stack trace:', new Error().stack);
      // Retourner une promesse rejetée au lieu de throw pour éviter les erreurs non gérées
      return Promise.reject(new Error(`Invalid API endpoint: ${endpoint}. This appears to be a frontend route, not an API endpoint.`));
    }
    
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const fullUrl = endpoint.startsWith('http') ? endpoint : normalizeUrl(API_BASE_URL, endpoint);

    // Protection: bloquer les requêtes vers des endpoints invalides (déjà fait plus haut, mais double vérification)
    if (fullUrl.includes('/properties/create') || fullUrl.includes('/properties/edit')) {
      logger.error('🚫 BLOCKED invalid API request in getQueryFn:', fullUrl);
      return Promise.reject(new Error(`Invalid API endpoint: ${endpoint}. This appears to be a frontend route, not an API endpoint.`));
    }

    const res = await fetch(fullUrl, {
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    const contentLength = res.headers.get('content-length');
    if (contentLength === '0' || res.status === 204) {
      return {} as any;
    }

    const text = await res.text();
    if (!text) {
      return {} as any;
    }

    return JSON.parse(text);
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // DÉSACTIVÉ: Ne pas utiliser de queryFn par défaut
      // Toutes les queries DOIVENT avoir un queryFn explicite
      // Cela empêche les requêtes accidentelles vers des routes invalides
      queryFn: async ({ queryKey }) => {
        const keyStr = JSON.stringify(queryKey);
        logger.error('❌ Query without explicit queryFn:', keyStr);
        logger.error('Stack trace:', new Error().stack);
        throw new Error(`Query missing explicit queryFn. QueryKey: ${keyStr}. All queries must provide a queryFn.`);
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 15, // 15 minutes par défaut (augmenté pour performance)
      gcTime: 1000 * 60 * 60, // 1 heure (augmenté pour garder plus de données en cache)
      structuralSharing: true, // Optimize object references
      refetchOnMount: false, // Don't refetch if data is fresh
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('401')) return false;
        if (error instanceof Error && error.message.includes('403')) return false;
        if (error instanceof Error && error.message.includes('404')) return false;
        // Retry network errors up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      gcTime: 0, // Don't cache mutations
    },
  },
});
