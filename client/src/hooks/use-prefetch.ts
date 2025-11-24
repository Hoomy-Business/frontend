import { useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';
import { getQueryFn } from '@/lib/queryClient';

/**
 * Hook pour précharger les données d'une propriété quand l'utilisateur survole une PropertyCard
 */
export function usePrefetchProperty() {
  const prefetchProperty = useCallback((propertyId: string | number) => {
    queryClient.prefetchQuery({
      queryKey: [`/properties/${propertyId}`],
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, []);

  return { prefetchProperty };
}

/**
 * Hook pour précharger les données des cantons (souvent utilisées)
 */
export function usePrefetchLocations() {
  const prefetchLocations = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['/locations/cantons'],
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 1000 * 60 * 30, // 30 minutes - les cantons changent rarement
    });
  }, []);

  return { prefetchLocations };
}

