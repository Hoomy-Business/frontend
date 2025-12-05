import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, MessageSquare, FileText, User, Inbox, Sparkles, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth, getAuthToken } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import type { Property, Contract } from '@shared/schema';
import { apiRequest } from '@/lib/api';
import { useLanguage } from '@/lib/useLanguage';
import { getAPIBaseURL } from '@/lib/apiConfig';

export default function StudentDashboard() {
  const { user, isAuthenticated, isStudent } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (!isStudent) {
      // Si admin, rediriger vers admin dashboard
      if (user?.role === 'admin') {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/dashboard/owner');
      }
    }
  }, [isAuthenticated, isStudent, user?.role, setLocation]);
  const { t } = useLanguage();

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
      // Le backend retourne { favorites: [...], pagination: {...} }
      // Extraire le tableau favorites
      if (data && Array.isArray(data.favorites)) {
        return data.favorites;
      }
      // Fallback si le résultat est directement un tableau (pour compatibilité)
      if (Array.isArray(data)) {
        return data;
      }
      // Sinon retourner un tableau vide
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    // S'assurer que les données retournées sont toujours valides
    select: (data: any): Property[] => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && data.favorites && Array.isArray(data.favorites)) {
        return data.favorites;
      }
      return [];
    },
  });

  const { data: contractsData, isLoading: contractsLoading, error: contractsError } = useQuery<any>({
    queryKey: ['/contracts/my-contracts'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', '/contracts/my-contracts');
      console.log('📋 Contracts response:', response);
      // Gérer les deux formats: { contracts: [...] } ou tableau direct
      if (Array.isArray(response)) {
        console.log('✅ Contracts array:', response.length, 'contracts');
        return response;
      }
      if (response?.contracts && Array.isArray(response.contracts)) {
        console.log('✅ Contracts from object:', response.contracts.length, 'contracts');
        return response.contracts;
      }
      if (response?.success && response?.contracts && Array.isArray(response.contracts)) {
        console.log('✅ Contracts from success object:', response.contracts.length, 'contracts');
        return response.contracts;
      }
      console.warn('⚠️ Unexpected contracts response format:', response);
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - contracts don't change often
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnMount: true, // Toujours refetch pour avoir les données à jour
    retry: 2,
  });

  // S'assurer que contracts est toujours un tableau
  const contracts: Contract[] = Array.isArray(contractsData) ? contractsData : [];


  // Note: No automatic redirect - users can see the dashboard overview with navigation buttons
  // They can click on the buttons to navigate to specific pages

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3" data-testid="text-dashboard-title">
                <Sparkles className="h-7 w-7 text-primary" />
                {t('dashboard.student.welcome', { name: user?.first_name || '' })}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('dashboard.student.manage')}
              </p>
            </div>
            {/* Statistiques rapides */}
            <div className="hidden md:flex gap-3">
              {favorites && favorites.length > 0 && (
                <Link href="/favorites">
                  <Card className="px-4 py-2 border-primary/20 hover:border-primary/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Favoris</div>
                        <div className="text-lg font-bold">{favorites.length}</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}
              {contracts && contracts.length > 0 && (
                <Link href="/contracts">
                  <Card className="px-4 py-2 border-primary/20 hover:border-primary/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Contrats</div>
                        <div className="text-lg font-bold">{contracts.length}</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Link href="/favorites">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Heart className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.student.favorites')}</span>
            </Button>
          </Link>
          <Link href="/requests">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Inbox className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.student.requests')}</span>
            </Button>
          </Link>
          <Link href="/messages">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.student.messages')}</span>
            </Button>
          </Link>
          <Link href="/contracts">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.student.contracts')}</span>
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <User className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.profile.title')}</span>
            </Button>
          </Link>
        </div>

        {/* All content moved to separate routes: /favorites, /requests, /contracts, /profile, /messages */}
        {/* This dashboard now serves as an overview/landing page */}
      </div>
    </MainLayout>
  );
}
