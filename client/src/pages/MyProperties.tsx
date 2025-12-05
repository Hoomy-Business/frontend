import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Property } from '@shared/schema';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/useLanguage';

export default function MyProperties() {
  const { user, isAuthenticated, isOwner } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (!isOwner) {
      setLocation('/profile');
    }
  }, [isAuthenticated, isOwner, setLocation]);

  const { data: propertiesData, isLoading: propertiesLoading, error: propertiesError } = useQuery<{ properties: Property[]; pagination?: any }>({
    queryKey: ['/properties/my-properties'],
    queryFn: async () => {
      try {
        const response = await apiRequest<any>('GET', '/properties/my-properties');
        if (Array.isArray(response)) {
          return { properties: response };
        }
        return response;
      } catch (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    enabled: isAuthenticated && isOwner,
  });

  const properties = propertiesData?.properties || [];

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/properties/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/properties/my-properties'] });
      toast({ title: 'Success', description: 'Property deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <Building2 className="h-7 w-7 text-primary" />
              {t('dashboard.properties')}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.properties.desc')}
            </p>
          </div>
          <Link href="/properties/create">
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.properties.create')}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.properties')}</CardTitle>
            <CardDescription>{t('dashboard.properties.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {propertiesError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Erreur lors du chargement des propriétés: {propertiesError instanceof Error ? propertiesError.message : 'Erreur inconnue'}
                </AlertDescription>
              </Alert>
            )}
            {propertiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            ) : !properties || properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('dashboard.properties.empty')}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t('dashboard.properties.empty.desc')}
                </p>
                <Link href="/properties/create">
                  <Button size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.properties.create')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="relative">
                    <PropertyCard property={property} />
                    <div className="mt-2 flex gap-2">
                      <Link href={`/properties/${property.id}/edit`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this property?')) {
                            deletePropertyMutation.mutate(property.id);
                          }
                        }}
                        disabled={deletePropertyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

