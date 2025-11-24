import { getAuthToken } from './auth';
import { logger } from './logger';
import { getAPIBaseURL } from './apiConfig';

const API_BASE_URL = getAPIBaseURL();

// Helper function to prevent double slashes in URLs
function normalizeUrl(base: string, endpoint: string): string {
  const baseClean = base.replace(/\/+$/, ''); // Remove trailing slashes
  const endpointClean = endpoint.replace(/^\/+/, ''); // Remove leading slashes
  return `${baseClean}/${endpointClean}`;
}

export async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  data?: any
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const url = endpoint.startsWith('http') ? endpoint : normalizeUrl(API_BASE_URL, endpoint);
  
  // Protection: bloquer les requêtes vers des endpoints invalides
  if (url.includes('/properties/create') || url.includes('/properties/edit')) {
    logger.error('🚫 BLOCKED invalid API request in apiRequest:', url);
    logger.error('Method:', method, 'Endpoint:', endpoint);
    logger.error('Stack trace:', new Error().stack);
    throw new Error(`Invalid API endpoint: ${endpoint}. This appears to be a frontend route, not an API endpoint.`);
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    
    // Gestion spéciale pour les erreurs 429 (Too Many Requests)
    if (response.status === 429) {
      const retryAfter = errorData.retryAfter || 60;
      throw new Error(`Trop de requêtes. Veuillez réessayer dans ${retryAfter} secondes.`);
    }
    
    throw new Error(errorData.error || errorData.message || 'Request failed');
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(normalizeUrl(API_BASE_URL, '/upload/image'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  return response.json();
}

export async function uploadImages(files: File[]): Promise<{ images: { url: string; filename: string }[] }> {
  const token = getAuthToken();
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch(normalizeUrl(API_BASE_URL, '/upload/images'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Images upload failed');
  }

  return response.json();
}
