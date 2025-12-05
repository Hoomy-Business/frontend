import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, MessageSquare, FileText, User, Building2, Inbox, X, Sparkles, TrendingUp, Clock, CheckCircle2, Camera, Phone, AlertTriangle, Lock, Mail } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, getAuthToken } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Property, Contract, Conversation } from '@shared/schema';
import { apiRequest, uploadImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/useLanguage';
import { getAPIBaseURL } from '@/lib/apiConfig';
import { normalizeImageUrl } from '@/lib/imageUtils';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { PhoneVerificationDialog } from '@/components/PhoneVerificationDialog';
import { EmailVerificationDialog } from '@/components/EmailVerificationDialog';
import { EmailChangeDialog } from '@/components/EmailChangeDialog';
import { PhoneChangeDialog } from '@/components/PhoneChangeDialog';
import { KYCVerification } from '@/components/KYCVerification';

export default function StudentDashboard() {
  const { user, isAuthenticated, isStudent, refreshUser } = useAuth();
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
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('favorites');
  const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [phoneChangeOpen, setPhoneChangeOpen] = useState(false);

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

  // Mutations pour accepter/refuser un contrat
  const acceptContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      return apiRequest<any>('PUT', `/contracts/${contractId}/accept`, {});
    },
    onSuccess: (_data, contractId) => {
      toast({
        title: 'Contrat accepté',
        description: 'Le contrat a été accepté et est maintenant actif.',
      });
      queryClient.invalidateQueries({ queryKey: ['/contracts/my-contracts'] });
      // Rediriger vers le détail du contrat
      setLocation(`/contracts/${contractId}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'accepter le contrat',
        variant: 'destructive',
      });
    },
  });

  const rejectContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      return apiRequest<any>('PUT', `/contracts/${contractId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: 'Contrat refusé',
        description: 'Le contrat a été refusé.',
      });
      queryClient.invalidateQueries({ queryKey: ['/contracts/my-contracts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de refuser le contrat',
        variant: 'destructive',
      });
    },
  });

  const { data: conversationsData, isLoading: conversationsLoading } = useQuery<any>({
    queryKey: ['/conversations'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', '/conversations');
      // Gérer les deux formats: tableau direct ou { conversations: [...] }
      if (Array.isArray(response)) return response;
      if (response?.conversations && Array.isArray(response.conversations)) return response.conversations;
      return [];
    },
    staleTime: 1000 * 30, // 30 seconds - conversations can change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // S'assurer que conversations est toujours un tableau
  const conversations: Conversation[] = Array.isArray(conversationsData) ? conversationsData : [];

  const removeFavoriteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/favorites/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
    },
  });

  const { data: sentRequestsData, isLoading: sentRequestsLoading } = useQuery<any>({
    queryKey: ['/requests/sent'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', '/requests/sent');
      // Gérer les deux formats: tableau direct ou { requests: [...] }
      if (Array.isArray(response)) return response;
      if (response?.requests && Array.isArray(response.requests)) return response.requests;
      return [];
    },
    staleTime: 1000 * 30, // 30 seconds - requests can change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // S'assurer que sentRequests est toujours un tableau
  const sentRequests = Array.isArray(sentRequestsData) ? sentRequestsData : [];

  const deleteRequestMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest('DELETE', `/requests/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/requests/sent'] });
      toast({ title: 'Success', description: 'Request cancelled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { first_name?: string; last_name?: string; email?: string; phone?: string; current_password?: string; new_password?: string; profile_picture?: string }) =>
      apiRequest('PUT', '/auth/profile', data),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['/auth/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/auth/user'] });
      // Recharger le profil utilisateur pour avoir les dernières données
      await refreshUser();
      toast({ 
        title: 'Succès', 
        description: response.message || 'Profil mis à jour avec succès' 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      apiRequest('PUT', '/auth/profile', { ...data }),
    onSuccess: async (response) => {
      await refreshUser();
      toast({ 
        title: 'Succès', 
        description: response.message || 'Mot de passe modifié avec succès' 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Le fichier doit être une image',
        variant: 'destructive',
      });
      return;
    }

    // Créer une URL d'aperçu pour le recadrage
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.onerror = () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la lecture du fichier',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setUploadingPhoto(true);
    try {
      // Convertir le blob en File pour l'upload
      const croppedFile = new File([croppedImageBlob], 'profile-picture.png', {
        type: 'image/png',
        lastModified: Date.now(),
      });

      const result = await uploadImage(croppedFile);
      const imageUrl = result.url;
      
      // Mettre à jour le profil avec la nouvelle photo
      await updateProfileMutation.mutateAsync({
        profile_picture: imageUrl,
      });
      
      toast({
        title: 'Succès',
        description: 'Photo de profil mise à jour',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
      setSelectedImageSrc(null);
    }
  };

  // Redirect to appropriate routes instead of using tabs
  useEffect(() => {
    if (isAuthenticated && isStudent) {
      // Redirect based on current location or default to profile
      const currentPath = window.location.pathname;
      if (currentPath === '/dashboard/student') {
        // Default dashboard view - show overview or redirect to profile
        setLocation('/profile');
      }
    }
  }, [isAuthenticated, isStudent, setLocation]);

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
