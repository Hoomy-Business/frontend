import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { getAuthToken } from "./auth";
import { getAPIBaseURL } from "./apiConfig";

const API_BASE_URL = getAPIBaseURL();

// ============================================
// URL HELPERS
// ============================================

function normalizeUrl(base: string, endpoint: string): string {
  const baseClean = base.replace(/\/+$/, '');
  const endpointClean = endpoint.replace(/^\/+/, '');
  return `${baseClean}/${endpointClean}`;
}

// ============================================
// ERROR HANDLING
// ============================================

class APIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function parseErrorResponse(res: Response): Promise<never> {
  let errorMessage = res.statusText;
  let errorCode: string | undefined;
  
  try {
    const errorData = await res.json();
    errorMessage = errorData.error || errorData.message || errorMessage;
    errorCode = errorData.code;
  } catch {
    // JSON parsing failed, use status text
  }
  
  throw new APIError(errorMessage, res.status, errorCode);
}

// ============================================
// API REQUEST FUNCTION
// ============================================

export async function apiRequest<T>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : normalizeUrl(API_BASE_URL, url);

  // Block invalid endpoints
  if (fullUrl.includes('/properties/create') || fullUrl.includes('/properties/edit')) {
    throw new APIError(`Invalid API endpoint: ${url}`, 400, 'INVALID_ENDPOINT');
  }

  // Log pour déboguer les signatures
  if (data && typeof data === 'object' && 'signature' in data) {
    const sig = (data as any).signature;
    console.log('apiRequest - Sending signature:');
    console.log('  - Type:', typeof sig);
    console.log('  - Length:', sig?.length);
    console.log('  - First 50 chars:', sig?.substring(0, 50));
    console.log('  - Is string:', typeof sig === 'string');
    console.log('  - Starts with data:image:', sig?.startsWith('data:image/'));
  }

  const body = data ? JSON.stringify(data) : undefined;
  
  // Vérifier la taille du body
  if (body && body.length > 1000000) {
    console.warn('Large request body:', body.length, 'bytes');
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body,
  });

  if (!res.ok) {
    return parseErrorResponse(res);
  }
  
  // Handle empty responses
  const contentLength = res.headers.get('content-length');
  if (contentLength === '0' || res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ============================================
// QUERY FUNCTION FACTORY
// ============================================

type UnauthorizedBehavior = "returnNull" | "throw";

export function getQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  return async ({ queryKey, signal }) => {
    // Filter null/undefined values from queryKey
    const validKey = queryKey.filter((k): k is string | number => k != null && k !== '');
    const endpoint = validKey.join('/');
    
    // Block invalid patterns
    const invalidPatterns = ['/create', '/edit', '/delete', '/update'];
    if (invalidPatterns.some(pattern => endpoint.includes(pattern))) {
      throw new APIError(`Invalid API endpoint: ${endpoint}`, 400, 'INVALID_ENDPOINT');
    }
    
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const fullUrl = endpoint.startsWith('http') ? endpoint : normalizeUrl(API_BASE_URL, endpoint);

    const res = await fetch(fullUrl, {
      headers,
      signal, // Support query cancellation
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null as T;
    }

    if (!res.ok) {
      return parseErrorResponse(res);
    }
    
    const contentLength = res.headers.get('content-length');
    if (contentLength === '0' || res.status === 204) {
      return {} as T;
    }

    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
  };
}

// ============================================
// QUERY CLIENT CONFIGURATION
// ============================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Require explicit queryFn for safety
      queryFn: async ({ queryKey }) => {
        throw new Error(`Query missing explicit queryFn. QueryKey: ${JSON.stringify(queryKey)}`);
      },
      
      // Refetch settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchInterval: false,
      
      // Cache settings - optimized for performance
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      
      // Structural sharing for memoization
      structuralSharing: true,
      
      // Smart retry logic
      retry: (failureCount, error) => {
        // Don't retry client errors
        if (error instanceof APIError) {
          if (error.status >= 400 && error.status < 500) return false;
        }
        // Retry network errors up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // Network mode
      networkMode: 'offlineFirst',
    },
    
    mutations: {
      retry: false,
      gcTime: 0,
      networkMode: 'online',
    },
  },
});

// ============================================
// QUERY INVALIDATION HELPERS
// ============================================

export const invalidateQueries = {
  properties: () => queryClient.invalidateQueries({ queryKey: ['/properties'] }),
  conversations: () => queryClient.invalidateQueries({ queryKey: ['/conversations'] }),
  contracts: () => queryClient.invalidateQueries({ queryKey: ['/contracts'] }),
  requests: () => queryClient.invalidateQueries({ queryKey: ['/requests'] }),
  user: () => queryClient.invalidateQueries({ queryKey: ['/auth'] }),
};
