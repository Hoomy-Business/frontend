import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, MessageSquare, FileText, User, Building2, Inbox, X, Sparkles, TrendingUp, Clock, CheckCircle2, Camera } from 'lucide-react';
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
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });

  const { data: contracts, isLoading: contractsLoading } = useQuery<{ success: boolean; contracts: Contract[] }, Error, Contract[]>({
    queryKey: ['/contracts/my-contracts'],
    queryFn: async () => {
      return apiRequest<{ success: boolean; contracts: Contract[] }>('GET', '/contracts/my-contracts');
    },
    select: (data) => data?.contracts || [],
    staleTime: 1000 * 60 * 5, // 5 minutes - contracts don't change often
    gcTime: 1000 * 60 * 15, // 15 minutes
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/conversations'],
    queryFn: async () => {
      return apiRequest<Conversation[]>('GET', '/conversations');
    },
    staleTime: 1000 * 30, // 30 seconds - conversations can change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/favorites/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
    },
  });

  const { data: sentRequests, isLoading: sentRequestsLoading } = useQuery<any[]>({
    queryKey: ['/requests/sent'],
    queryFn: async () => {
      return apiRequest<any[]>('GET', '/requests/sent');
    },
    staleTime: 1000 * 30, // 30 seconds - requests can change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

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
    mutationFn: (data: { first_name?: string; last_name?: string; phone?: string; profile_picture?: string }) =>
      apiRequest('PUT', '/users/profile', data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/auth/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/auth/user'] });
      // Recharger le profil utilisateur pour avoir les dernières données
      await refreshUser();
      toast({ title: 'Success', description: 'Profile updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
                <Card className="px-4 py-2 border-primary/20">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Favoris</div>
                      <div className="text-lg font-bold">{favorites.length}</div>
                    </div>
                  </div>
                </Card>
              )}
              {contracts && contracts.length > 0 && (
                <Card className="px-4 py-2 border-primary/20">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Contrats</div>
                      <div className="text-lg font-bold">{contracts.length}</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="favorites" className="gap-2" data-testid="tab-favorites">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.student.favorites')}</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2" data-testid="tab-requests">
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.student.requests')}</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2" data-testid="tab-messages">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.student.messages')}</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2" data-testid="tab-contracts">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.student.contracts')}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2" data-testid="tab-profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.profile.title')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.student.requests.title')}</CardTitle>
                <CardDescription>{t('dashboard.student.requests.desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {sentRequestsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : !sentRequests || sentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Inbox className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t('dashboard.student.requests.empty')}</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {t('dashboard.student.requests.empty.desc')}
                    </p>
                    <Link href="/properties">
                      <Button size="lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentRequests.map((req) => (
                      <Card key={req.id} className="hover-elevate transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">{req.property_title}</h4>
                              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                {req.city_name} • CHF {req.price?.toLocaleString()}/mois
                              </p>
                              <div className="bg-muted/50 p-3 rounded-md border-l-4 border-primary">
                                <p className="text-sm italic">
                                  "{req.message}"
                                </p>
                              </div>
                            </div>
                            <Badge variant={
                              req.status === 'accepted' ? 'default' :
                              req.status === 'pending' ? 'secondary' :
                              'destructive'
                            } className="gap-1">
                              {req.status === 'accepted' && <CheckCircle2 className="h-3 w-3" />}
                              {req.status === 'pending' && <Clock className="h-3 w-3" />}
                              {req.status}
                            </Badge>
                          </div>
                          
                          {req.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this request?')) {
                                    deleteRequestMutation.mutate(req.id);
                                  }
                                }}
                                disabled={deleteRequestMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel Request
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

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('messages.conversations')}</CardTitle>
                <CardDescription>{t('dashboard.student.messages.desc')}</CardDescription>
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
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t('dashboard.student.messages.empty')}</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {t('dashboard.student.messages.empty.desc')}
                    </p>
                    <Link href="/properties">
                      <Button size="lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t('messages.browse')}
                      </Button>
                    </Link>
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

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.student.contracts.title')}</CardTitle>
                <CardDescription>{t('dashboard.student.contracts.desc')}</CardDescription>
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
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t('dashboard.student.contracts.empty')}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {t('dashboard.student.contracts.empty.desc')}
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
                              <p className="text-sm text-muted-foreground">{contract.city_name}</p>
                            </div>
                            <Badge variant={
                              contract.status === 'active' ? 'default' :
                              contract.status === 'pending' ? 'secondary' :
                              'outline'
                            }>
                              {contract.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Monthly Rent</p>
                              <p className="font-semibold">CHF {contract.monthly_rent.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Duration</p>
                              <p className="font-semibold">
                                {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/contracts/${contract.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
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
                    <Label htmlFor="profile-picture-upload-student" className="cursor-pointer">
                      <Button variant="outline" asChild disabled={uploadingPhoto}>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          {uploadingPhoto ? 'Upload en cours...' : 'Changer la photo de profil'}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="profile-picture-upload-student"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Formats acceptés: JPG, PNG, WEBP (max 10 MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.first_name')}</p>
                    <p className="font-medium">{user?.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.last_name')}</p>
                    <p className="font-medium">{user?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.email')}</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.phone')}</p>
                    <p className="font-medium">{user?.phone || t('dashboard.phone.not_provided')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.account_type')}</p>
                    <Badge>{user?.role}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.email_verified')}</p>
                    <Badge variant={user?.email_verified ? 'default' : 'secondary'}>
                      {user?.email_verified ? t('dashboard.profile.verified') : t('dashboard.profile.not_verified')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
