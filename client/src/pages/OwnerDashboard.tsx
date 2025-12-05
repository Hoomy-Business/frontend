import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Building2, MessageSquare, FileText, User, Plus, Edit, Trash2, CreditCard, Check, X, Inbox, Lock, Upload, Camera, AlertCircle, Phone, CheckCircle2, AlertTriangle, Mail } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/useLanguage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Property, Contract, Conversation, StripeAccountStatus } from '@shared/schema';
import { apiRequest, uploadImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { KYCVerification } from '@/components/KYCVerification';
import { normalizeImageUrl } from '@/lib/imageUtils';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { formatUserDisplayName } from '@/lib/userUtils';
import { PhoneVerificationDialog } from '@/components/PhoneVerificationDialog';
import { EmailVerificationDialog } from '@/components/EmailVerificationDialog';
import { EmailChangeDialog } from '@/components/EmailChangeDialog';
import { PhoneChangeDialog } from '@/components/PhoneChangeDialog';

export default function OwnerDashboard() {
  const { user, isAuthenticated, isOwner, refreshUser } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (!isOwner) {
      // Si admin, rediriger vers admin dashboard
      if (user?.role === 'admin') {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/dashboard/student');
      }
    }
  }, [isAuthenticated, isOwner, user?.role, setLocation]);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('properties');
  const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [phoneChangeOpen, setPhoneChangeOpen] = useState(false);

  const { data: propertiesData, isLoading: propertiesLoading, error: propertiesError } = useQuery<{ properties: Property[]; pagination?: any }>({
    queryKey: ['/properties/my-properties'],
    queryFn: async () => {
      try {
        const response = await apiRequest<any>('GET', '/properties/my-properties');
        // Gérer la compatibilité : si c'est un tableau (ancien format), le convertir
        if (Array.isArray(response)) {
          return { properties: response };
        }
        // Sinon, c'est déjà le nouveau format avec pagination
        return response;
      } catch (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Retry once on failure
  });

  const properties = propertiesData?.properties || [];

  const { data: requestsData, isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ['/requests/received'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', '/requests/received');
      // S'assurer que la réponse est toujours un tableau
      return Array.isArray(response) ? response : [];
    },
    staleTime: 1000 * 30, // 30 seconds - requests can change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // S'assurer que requests est toujours un tableau
  const requests = Array.isArray(requestsData) ? requestsData : [];

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'accepted' | 'rejected' }) =>
      apiRequest('PUT', `/requests/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/requests/received'] });
      
      // Snapshot previous value
      const previousRequests = queryClient.getQueryData<any[]>(['/requests/received']);
      
      // Optimistically update
      if (previousRequests && Array.isArray(previousRequests)) {
        queryClient.setQueryData<any[]>(
          ['/requests/received'],
          previousRequests.map(req => req.id === id ? { ...req, status } : req)
        );
      }
      
      return { previousRequests };
    },
    onSuccess: (data, variables) => {
      // Si la requête est acceptée, invalider aussi les conversations pour afficher la nouvelle
      if (variables.status === 'accepted') {
        queryClient.invalidateQueries({ queryKey: ['/conversations'] });
        toast({ 
          title: 'Requête acceptée', 
          description: 'Une conversation a été créée automatiquement avec l\'étudiant.' 
        });
      } else {
        toast({ title: 'Success', description: 'Request updated successfully' });
      }
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(['/requests/received'], context.previousRequests);
      }
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/requests/received'] });
    },
  });

  const { data: contractsData, isLoading: contractsLoading } = useQuery<{ success: boolean; contracts: Contract[] }, Error, Contract[]>({
    queryKey: ['/contracts/my-contracts'],
    queryFn: async () => {
      return apiRequest<{ success: boolean; contracts: Contract[] }>('GET', '/contracts/my-contracts');
    },
    select: (data) => {
      const contracts = data?.contracts;
      return Array.isArray(contracts) ? contracts : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - contracts don't change often
    gcTime: 1000 * 60 * 15, // 15 minutes
  });

  // S'assurer que contracts est toujours un tableau
  const contracts = Array.isArray(contractsData) ? contractsData : [];

  const { data: conversationsData, isLoading: conversationsLoading } = useQuery<{ conversations: Conversation[]; pagination?: any } | Conversation[]>({
    queryKey: ['/conversations'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', '/conversations');
      // Gérer la compatibilité : si c'est un tableau (ancien format), le convertir
      if (Array.isArray(response)) {
        return response;
      }
      // Sinon, c'est déjà le nouveau format avec pagination
      return response;
    },
    staleTime: 1000 * 30, // 30 seconds - conversations can change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Extraire le tableau conversations de la réponse (gère ancien et nouveau format)
  const conversations = Array.isArray(conversationsData) 
    ? conversationsData 
    : (conversationsData?.conversations || []);

  const { data: stripeStatus } = useQuery<StripeAccountStatus>({
    queryKey: ['/contracts/connect/account-status'],
    queryFn: async () => {
      return apiRequest<StripeAccountStatus>('GET', '/contracts/connect/account-status');
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - stripe status doesn't change often
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const createAccountMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; account_id?: string; requires_account_creation?: boolean }>('POST', '/contracts/connect/create-account'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts/connect/account-status'] });
      toast({
        title: 'Account Created',
        description: 'Stripe account created successfully. Please complete the onboarding process.',
      });
    },
    onError: (error: any) => {
      // Afficher les détails si disponibles, sinon le message d'erreur
      const errorTitle = error?.message || 'Stripe Account Creation Failed';
      const errorDescription = error?.details || error?.message || 'Failed to create Stripe account. Please try again.';
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
        duration: 10000, // Afficher plus longtemps pour les erreurs importantes
      });
    },
  });

  const createOnboardingLinkMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; url: string; requires_account_creation?: boolean }>('POST', '/contracts/connect/create-onboarding-link'),
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: 'Error',
          description: 'No onboarding URL received',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.details || error?.message || 'Failed to create onboarding link. Please try again.';
      
      if (error?.requires_account_creation) {
        toast({
          title: 'Account Required',
          description: 'Please create a Stripe account first.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Onboarding Link Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
  });

  const handleStripeSetup = async () => {
    try {
      if (!stripeStatus?.has_account) {
        await createAccountMutation.mutateAsync();
      }
      createOnboardingLinkMutation.mutate();
    } catch (error) {
      // Error is already handled in onError callbacks
      console.error('Stripe setup error:', error);
    }
  };

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

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/properties/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/properties/my-properties'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { first_name?: string; last_name?: string; email?: string; phone?: string; current_password?: string; new_password?: string }) =>
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
            {t('dashboard.owner.welcome', { name: user?.first_name || '' })}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.owner.manage')}</p>
        </div>

        {stripeStatus && !stripeStatus.onboarding_complete && (
          <Alert className="mb-6">
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              {t('dashboard.stripe.setup')}
              <Button 
                variant="ghost" 
                className="ml-2 p-0 h-auto"
                onClick={handleStripeSetup}
                disabled={createAccountMutation.isPending || createOnboardingLinkMutation.isPending}
                data-testid="button-setup-stripe"
              >
                {createAccountMutation.isPending || createOnboardingLinkMutation.isPending 
                  ? t('dashboard.stripe.setting')
                  : t('dashboard.stripe.setup.button')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:w-auto lg:inline-grid gap-1 sm:gap-2">
            <TabsTrigger value="properties" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-0" data-testid="tab-properties">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate hidden xs:inline">{t('dashboard.properties')}</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-0" data-testid="tab-requests">
              <Inbox className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate hidden xs:inline">{t('dashboard.requests')}</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-0" data-testid="tab-contracts">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate hidden xs:inline">{t('dashboard.contracts')}</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-0" data-testid="tab-messages">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate hidden xs:inline">{t('dashboard.messages')}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-0" data-testid="tab-profile">
              <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate hidden xs:inline">{t('dashboard.profile.title')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard.properties')}</h2>
                <p className="text-muted-foreground">{t('dashboard.properties.desc')}</p>
              </div>
              <Link href="/properties/create">
                <Button data-testid="button-add-property">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dashboard.properties.add')}
                </Button>
              </Link>
            </div>

            {propertiesError ? (
              <Card className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Erreur de chargement</h3>
                <p className="text-muted-foreground mb-4">
                  {propertiesError instanceof Error ? propertiesError.message : 'Impossible de charger les propriétés'}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Recharger la page
                </Button>
              </Card>
            ) : propertiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            ) : !properties || properties.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('dashboard.properties.empty')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.properties.empty.desc')}
                </p>
                <Link href="/properties/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.properties.empty.button')}
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="relative">
                    <PropertyCard property={property} hideFavoriteButton={true} />
                    <div className="absolute top-3 right-3 flex gap-2 z-50">
                      <Link href={`/properties/${property.id}/edit`}>
                        <Button size="icon" variant="secondary" className="bg-background/90 backdrop-blur shadow-md hover:shadow-lg" data-testid={`button-edit-${property.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        size="icon" 
                        variant="secondary"
                        className="bg-background/90 backdrop-blur hover:bg-destructive hover:text-destructive-foreground shadow-md hover:shadow-lg"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this property?')) {
                            deletePropertyMutation.mutate(property.id);
                          }
                        }}
                        data-testid={`button-delete-${property.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.requests')}</CardTitle>
                <CardDescription>{t('dashboard.requests.desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : !requests || requests.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{t('dashboard.requests.empty')}</h3>
                    <p className="text-muted-foreground">
                      {t('dashboard.requests.empty.desc')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req) => (
                      <Card key={req.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{req.property_title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                From: {formatUserDisplayName(req)}
                              </p>
                              <p className="text-sm bg-muted p-3 rounded-md">
                                "{req.message}"
                              </p>
                            </div>
                            <Badge variant={
                              req.status === 'accepted' ? 'default' :
                              req.status === 'pending' ? 'secondary' :
                              'destructive'
                            }>
                              {req.status}
                            </Badge>
                          </div>
                          
                          {req.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateRequestMutation.mutate({ id: req.id, status: 'rejected' })}
                                    disabled={updateRequestMutation.isPending}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    {t('dashboard.request.reject')}
                                </Button>
                                <Button 
                                    size="sm"
                                    onClick={() => updateRequestMutation.mutate({ id: req.id, status: 'accepted' })}
                                    disabled={updateRequestMutation.isPending}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    {t('dashboard.request.accept')}
                                </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rental Contracts</CardTitle>
                <CardDescription>Manage your rental agreements</CardDescription>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : !contracts || contracts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No contracts yet</h3>
                    <p className="text-muted-foreground">
                      Your rental contracts will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contracts.map((contract) => (
                      <Card key={contract.id} data-testid={`card-contract-${contract.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{contract.property_title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Tenant: {contract.student_deleted_at ? `deleted_user_${contract.student_id}` : `${contract.student_first_name || ''} ${contract.student_last_name || ''}`.trim()}
                              </p>
                            </div>
                            <Badge variant={
                              contract.status === 'active' ? 'default' :
                              contract.status === 'pending' ? 'secondary' :
                              'outline'
                            }>
                              {contract.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">{t('dashboard.contract.rent')}</p>
                              <p className="font-semibold">CHF {Number(contract.monthly_rent || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{t('dashboard.contract.payout')}</p>
                              <p className="font-semibold">CHF {Number(contract.owner_payout || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{t('dashboard.contract.duration')}</p>
                              <p className="font-semibold">
                                {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <Link href={`/contracts/${contract.id}`}>
                            <Button variant="outline" size="sm">{t('dashboard.contract.view')}</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>Messages with potential tenants</CardDescription>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : !conversations || conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">
                      Student inquiries will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conv) => (
                      <Link key={conv.id} href={`/messages?conversation=${conv.id}`}>
                        <Card className="hover-elevate cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{conv.property_title}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.other_user_name}
                              </p>
                              {conv.last_message && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {conv.last_message}
                                </p>
                              )}
                            </div>
                            {conv.unread_count && conv.unread_count > 0 && (
                              <Badge variant="default">{conv.unread_count}</Badge>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.profile.title')}</CardTitle>
                <CardDescription>{t('dashboard.profile.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture Section */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profile_picture ? normalizeImageUrl(user.profile_picture) : undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="profile-picture-upload" className="cursor-pointer">
                      <Button variant="outline" asChild disabled={uploadingPhoto} className="w-full sm:w-auto whitespace-normal break-words">
                        <span className="flex items-center justify-center">
                          <Camera className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="break-words text-center">{uploadingPhoto ? 'Upload en cours...' : 'Changer la photo de profil'}</span>
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Formats acceptés: JPG, PNG, WEBP (max 10 MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.first_name')}</p>
                    <p className="font-medium break-words">{user?.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.last_name')}</p>
                    <p className="font-medium break-words">{user?.last_name}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.email')}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium break-all min-w-0 flex-1">{user?.email}</p>
                      <Badge variant={user?.email_verified ? 'default' : 'secondary'} className="gap-1 flex-shrink-0 whitespace-nowrap">
                        {user?.email_verified ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Vérifié
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            Non vérifié
                          </>
                        )}
                      </Badge>
                    </div>
                    {!user?.email_verified && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full sm:w-auto whitespace-normal break-words"
                        onClick={() => setEmailVerificationOpen(true)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="break-words">Vérifier mon email</span>
                      </Button>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.phone')}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium break-words min-w-0 flex-1">{user?.phone || t('dashboard.phone.not_provided')}</p>
                      {user?.phone && (
                        <Badge variant={user?.phone_verified ? 'default' : 'secondary'} className="gap-1 flex-shrink-0 whitespace-nowrap">
                          {user?.phone_verified ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Vérifié
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              Non vérifié
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                    {!user?.phone_verified && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full sm:w-auto whitespace-normal break-words"
                        onClick={() => setPhoneVerificationOpen(true)}
                      >
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="break-words">{user?.phone ? 'Vérifier mon numéro' : 'Ajouter un numéro'}</span>
                      </Button>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.account_type')}</p>
                    <Badge className="whitespace-nowrap">{user?.role}</Badge>
                  </div>
                </div>

                <Separator />

                <ProfileEditForm 
                  user={user}
                  updateProfileMutation={updateProfileMutation}
                  changePasswordMutation={changePasswordMutation}
                  onPhotoUpload={handlePhotoUpload}
                  onEmailChange={() => setEmailChangeOpen(true)}
                  onPhoneChange={() => setPhoneChangeOpen(true)}
                />

                <Separator />

                {stripeStatus && (
                  <div>
                    <h3 className="font-semibold mb-4">Payment Setup</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Stripe Account</p>
                        <Badge variant={stripeStatus.has_account ? 'default' : 'secondary'}>
                          {stripeStatus.has_account ? 'Connected' : 'Not Connected'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Onboarding</p>
                        <Badge variant={stripeStatus.onboarding_complete ? 'default' : 'secondary'}>
                          {stripeStatus.onboarding_complete ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </div>
                      {stripeStatus.payouts_enabled !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Payouts</p>
                          <Badge variant={stripeStatus.payouts_enabled ? 'default' : 'secondary'}>
                            {stripeStatus.payouts_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {!stripeStatus.onboarding_complete && (
                      <Button 
                        className="mt-4"
                        onClick={handleStripeSetup}
                        disabled={createAccountMutation.isPending || createOnboardingLinkMutation.isPending}
                      >
                        {createAccountMutation.isPending || createOnboardingLinkMutation.isPending 
                          ? 'Setting up...' 
                          : 'Complete Stripe Setup'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KYC Verification Section */}
            <KYCVerification />

          </TabsContent>
        </Tabs>
        
        {/* Image Crop Dialog - Rendu au niveau principal pour être accessible partout */}
        {selectedImageSrc && (
          <ImageCropDialog
            open={cropDialogOpen}
            onClose={() => {
              setCropDialogOpen(false);
              setSelectedImageSrc(null);
            }}
            imageSrc={selectedImageSrc}
            onCropComplete={handleCropComplete}
            aspectRatio={1}
            circularCrop={true}
          />
        )}
        
        {/* Phone Verification Dialog */}
        <PhoneVerificationDialog
          open={phoneVerificationOpen}
          onClose={() => setPhoneVerificationOpen(false)}
          onSuccess={() => refreshUser()}
          currentPhone={user?.phone}
        />
        
        <EmailVerificationDialog
          open={emailVerificationOpen}
          onClose={() => setEmailVerificationOpen(false)}
          onSuccess={() => refreshUser()}
          currentEmail={user?.email}
        />
        
        <EmailChangeDialog
          open={emailChangeOpen}
          onClose={() => setEmailChangeOpen(false)}
          onSuccess={() => refreshUser()}
          currentEmail={user?.email}
        />
        
        <PhoneChangeDialog
          open={phoneChangeOpen}
          onClose={() => setPhoneChangeOpen(false)}
          onSuccess={() => refreshUser()}
          currentPhone={user?.phone}
        />
      </div>
    </MainLayout>
  );
}

function ProfileEditForm({ 
  user, 
  updateProfileMutation, 
  changePasswordMutation,
  onPhotoUpload,
  onEmailChange,
  onPhoneChange
}: { 
  user: any; 
  updateProfileMutation: any; 
  changePasswordMutation: any;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: () => void;
  onPhoneChange: () => void;
}) {
  const { t } = useLanguage();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Mettre à jour les données du formulaire quand l'utilisateur change
  useEffect(() => {
    setProfileData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    });
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPhotoUpload(e);
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(profileData);
    setEditProfileOpen(false);
  };

  const handleChangePassword = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      return;
    }
    changePasswordMutation.mutate({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });
    setChangePasswordOpen(false);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-4">{t('dashboard.profile.settings')}</h3>
        <div className="flex flex-wrap gap-2">
          <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto whitespace-normal break-words">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-4 w-4 mr-2 flex-shrink-0">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="break-words">{t('dashboard.profile.edit')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('dashboard.profile.edit')}</DialogTitle>
                <DialogDescription>{t('dashboard.profile.edit.desc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="first_name">{t('dashboard.profile.first_name')}</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">{t('dashboard.profile.last_name')}</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditProfileOpen(false);
                        onEmailChange();
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Changer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pour changer votre email, vous devrez confirmer votre identité avec un code envoyé à votre email actuel.
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">{t('dashboard.profile.phone')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      value={user?.phone || ''}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditProfileOpen(false);
                        onPhoneChange();
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Changer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pour changer votre numéro de téléphone, vous devrez confirmer votre identité avec un code envoyé à votre numéro actuel.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditProfileOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? t('dashboard.profile.saving') : t('dashboard.profile.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto whitespace-normal break-words">
                <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="break-words">{t('dashboard.profile.change_password')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('dashboard.profile.change_password')}</DialogTitle>
                <DialogDescription>{t('dashboard.profile.change_password.desc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="current_password">{t('dashboard.profile.current_password')}</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new_password">{t('dashboard.profile.new_password')}</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm_password">{t('dashboard.profile.confirm_password')}</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  />
                  {passwordData.new_password && passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                    <p className="text-sm text-destructive mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>{t('common.cancel')}</Button>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={changePasswordMutation.isPending || passwordData.new_password !== passwordData.confirm_password}
                >
                  {changePasswordMutation.isPending ? t('dashboard.profile.changing') : t('dashboard.profile.change_password')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
