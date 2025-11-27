import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";
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
    throw new Error(`Invalid API endpoint: ${url}. This appears to be a frontend route, not an API endpoint.`);
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // Include cookies for cross-origin requests
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
  async ({ queryKey, signal }) => {
    // Filtrer les valeurs null/undefined de la queryKey
    const validKey = queryKey.filter(k => k != null && k !== '');
    const endpoint = validKey.join('/');
    
    // Rejeter les endpoints invalides
    const invalidPatterns = ['/create', '/edit', '/delete', '/update'];
    const hasInvalidPattern = invalidPatterns.some(pattern => 
      endpoint.includes(pattern) || endpoint.endsWith(pattern)
    );
    
    if (hasInvalidPattern) {
      logger.error('🚫 BLOCKED invalid API request:', endpoint);
      return Promise.reject(new Error(`Invalid API endpoint: ${endpoint}.`));
    }
    
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const fullUrl = endpoint.startsWith('http') ? endpoint : normalizeUrl(API_BASE_URL, endpoint);

    if (fullUrl.includes('/properties/create') || fullUrl.includes('/properties/edit')) {
      return Promise.reject(new Error(`Invalid API endpoint: ${endpoint}.`));
    }

    const res = await fetch(fullUrl, {
      headers,
      signal, // Support query cancellation
      credentials: 'include', // Include cookies for cross-origin requests
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

// Query cache with error handling
const queryCache = new QueryCache({
  onError: (error, query) => {
    // Only log errors for queries that have already been fetched
    if (query.state.data !== undefined) {
      logger.error('Query error:', error);
    }
  },
});

// Mutation cache with optimistic update support
const mutationCache = new MutationCache({
  onError: (error) => {
    logger.error('Mutation error:', error);
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Require explicit queryFn for safety
      queryFn: async ({ queryKey }) => {
        const keyStr = JSON.stringify(queryKey);
        logger.error('❌ Query without explicit queryFn:', keyStr);
        throw new Error(`Query missing explicit queryFn. QueryKey: ${keyStr}.`);
      },
      // Performance optimizations
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false,
      
      // Caching strategy
      staleTime: 1000 * 60 * 10, // 10 minutes - data considered fresh
      gcTime: 1000 * 60 * 60, // 1 hour - keep in cache
      
      // Structural sharing for performance
      structuralSharing: true,
      
      // Network mode for better offline support
      networkMode: 'offlineFirst',
      
      // Retry logic
      retry: (failureCount, error) => {
        // Don't retry on client errors
        if (error instanceof Error) {
          const message = error.message.toLowerCase();
          if (message.includes('401') || message.includes('403') || message.includes('404')) {
            return false;
          }
        }
        // Retry network errors up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Placeholder data during loading
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      retry: false,
      gcTime: 0,
      networkMode: 'online',
    },
  },
});

// Prefetch helper with deduplication
export function prefetchQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  staleTime = 1000 * 60 * 5
) {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime,
  });
}

// Invalidate related queries helper
export function invalidateQueries(patterns: string[]) {
  patterns.forEach(pattern => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.includes(pattern);
      },
    });
  });
}
