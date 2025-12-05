import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, getAuthToken } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Property } from '@shared/schema';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/useLanguage';
import { getAPIBaseURL } from '@/lib/apiConfig';

export default function Favorites() {
  const { user, isAuthenticated, isStudent } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (!isStudent) {
      setLocation('/dashboard/owner');
    }
  }, [isAuthenticated, isStudent, setLocation]);

  const { data: favorites, isLoading: favoritesLoading, error: favoritesError } = useQuery<Property[]>({
    queryKey: ['/favorites'],
    enabled: isAuthenticated && isStudent,
    retry: false,
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };
      
      const apiBase = getAPIBaseURL();
      const baseClean = apiBase.replace(/\/+$/, '');
      const url = `${baseClean}/favorites`;
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || errorData.message || res.statusText);
      }
      
      const data = await res.json();
      if (data && Array.isArray(data.favorites)) {
        return data.favorites;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    select: (data: any): Property[] => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && data.favorites && Array.isArray(data.favorites)) {
        return data.favorites;
      }
      return [];
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/favorites/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
    },
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Heart className="h-7 w-7 text-primary" />
            {t('dashboard.student.favorites')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.student.favorites.desc')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.student.favorites')}</CardTitle>
            <CardDescription>{t('dashboard.student.favorites.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {favoritesError ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold mb-1">Erreur de chargement</p>
                      <p className="text-sm">
                        {favoritesError instanceof Error ? favoritesError.message : 'Erreur inconnue'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['/favorites'] })}
                    >
                      Réessayer
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : favoritesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            ) : !favorites || favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('dashboard.student.favorites.empty')}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t('dashboard.student.favorites.empty.desc')}
                </p>
                <Link href="/properties">
                  <Button size="lg">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('messages.browse')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorited={true}
                    onFavoriteToggle={(id) => removeFavoriteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

