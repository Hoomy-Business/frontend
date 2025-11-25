import { useRoute, useLocation, Link } from 'wouter';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { MapPin, Home, Bath, Maximize, Calendar, Mail, Phone, CheckCircle2, ArrowLeft, Heart, Send, Shield, Star, Clock, Users, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Property, PropertyPhoto } from '@shared/schema';
import { normalizeImageUrl } from '@/lib/imageUtils';
import { useLanguage } from '@/lib/useLanguage';

export default function PropertyDetail() {
  const [, params] = useRoute('/properties/:id');
  const [, setLocation] = useLocation();
  const { isAuthenticated, isStudent, user } = useAuth();
  const propertyId = params?.id;
  const { toast } = useToast();
  const { t } = useLanguage();
  const [requestMessage, setRequestMessage] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  // Validation: s'assurer que propertyId est un nombre valide
  const isValidPropertyId = propertyId && propertyId !== 'create' && !isNaN(Number(propertyId)) && Number(propertyId) > 0;
  const numericPropertyId = isValidPropertyId ? Number(propertyId) : null;

  // Rediriger si l'ID est invalide (une seule fois)
  const hasRedirected = useRef(false);
  useEffect(() => {
    if (propertyId && !isValidPropertyId && !hasRedirected.current) {
      hasRedirected.current = true;
      if (propertyId === 'create') {
        setLocation('/properties/create');
      } else {
        setLocation('/properties');
      }
    }
    // Reset si propertyId change
    if (propertyId !== params?.id) {
      hasRedirected.current = false;
    }
  }, [propertyId, isValidPropertyId, setLocation, params?.id]);

  const { data: property, isLoading } = useQuery<Property & { photos?: PropertyPhoto[] }>({
    queryKey: [`/properties/${numericPropertyId}`],
    enabled: !!numericPropertyId,
    queryFn: async () => {
      if (!numericPropertyId) {
        throw new Error('Invalid property ID');
      }
      return apiRequest<Property & { photos?: PropertyPhoto[] }>('GET', `/properties/${numericPropertyId}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - property details don't change often
    gcTime: 1000 * 60 * 15, // 15 minutes
  });

  const sendRequestMutation = useMutation({
    mutationFn: (data: { property_id: number; message: string }) =>
      apiRequest('POST', '/requests', data),
    onSuccess: () => {
      toast({
        title: 'Request sent',
        description: 'Your request has been sent to the owner.',
      });
      setIsRequestDialogOpen(false);
      setRequestMessage('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSendRequest = () => {
    if (!numericPropertyId || !requestMessage.trim()) return;
    sendRequestMutation.mutate({
      property_id: numericPropertyId,
      message: requestMessage,
    });
  };

  // Check if property is favorited by checking the favorites list
  const { data: favorites } = useQuery<Property[]>({
    queryKey: ['/favorites'],
    enabled: !!numericPropertyId && isAuthenticated && isStudent,
    queryFn: async () => {
      return apiRequest<Property[]>('GET', '/favorites');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnMount: true, // Toujours refetch pour avoir l'état à jour
  });

  const isFavorited = useMemo(() => {
    if (!favorites || !numericPropertyId) return false;
    // Comparaison robuste en convertissant les deux en nombres
    return favorites.some(fav => Number(fav.id) === Number(numericPropertyId));
  }, [favorites, numericPropertyId]);

  const addFavoriteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('POST', '/favorites', { property_id: propertyId }),
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: ['/favorites'] });
      const previousFavorites = queryClient.getQueryData<Property[]>(['/favorites']);
      
      if (previousFavorites && property) {
        // Vérifier que la propriété n'est pas déjà dans les favoris
        const isAlreadyFavorite = previousFavorites.some(fav => Number(fav.id) === Number(propertyId));
        if (!isAlreadyFavorite) {
          queryClient.setQueryData<Property[]>(['/favorites'], [...previousFavorites, property]);
        }
      }
      
      return { previousFavorites };
    },
    onError: (err, propertyId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['/favorites'], context.previousFavorites);
      }
      toast({
        title: 'Error',
        description: 'Failed to add to favorites',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Property added to favorites',
      });
      // Invalider et refetch immédiatement pour avoir l'état à jour
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
      queryClient.refetchQueries({ queryKey: ['/favorites'] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/favorites/${propertyId}`),
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: ['/favorites'] });
      const previousFavorites = queryClient.getQueryData<Property[]>(['/favorites']);
      
      if (previousFavorites) {
        // Comparaison robuste en convertissant les deux en nombres
        queryClient.setQueryData<Property[]>(
          ['/favorites'],
          previousFavorites.filter(p => Number(p.id) !== Number(propertyId))
        );
      }
      
      return { previousFavorites };
    },
    onError: (err, propertyId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['/favorites'], context.previousFavorites);
      }
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Property removed from favorites',
      });
      // Invalider et refetch immédiatement pour avoir l'état à jour
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
      queryClient.refetchQueries({ queryKey: ['/favorites'] });
    },
  });

  const handleFavoriteToggle = useCallback(() => {
    if (!isAuthenticated || !isStudent) {
      if (numericPropertyId) {
        setLocation(`/login?redirect=/properties/${numericPropertyId}`);
      } else {
        setLocation('/login');
      }
      return;
    }

    if (!numericPropertyId) return;
    if (isFavorited) {
      removeFavoriteMutation.mutate(numericPropertyId);
    } else {
      addFavoriteMutation.mutate(numericPropertyId);
    }
  }, [numericPropertyId, isFavorited, removeFavoriteMutation, addFavoriteMutation, isAuthenticated, isStudent, setLocation]);

  // Move all hooks before any conditional returns
  const images = useMemo(() => {
    if (!property) return ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="16"%3EImage non disponible%3C/text%3E%3C/svg%3E'];
    if (property.photos && property.photos.length > 0) {
      return property.photos.map(p => normalizeImageUrl(p.photo_url));
    }
    if (property.main_photo) {
      return [normalizeImageUrl(property.main_photo)];
    }
    return ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="16"%3EImage non disponible%3C/text%3E%3C/svg%3E'];
  }, [property?.photos, property?.main_photo]);

  const ownerInitials = useMemo(() => {
    if (!property) return 'O';
    return property.first_name && property.last_name
      ? `${property.first_name[0]}${property.last_name[0]}`.toUpperCase()
      : 'O';
  }, [property?.first_name, property?.last_name]);

  const canContact = useMemo(() => {
    if (!property) return false;
    return isAuthenticated && isStudent && user?.id !== property.owner_id;
  }, [isAuthenticated, isStudent, user?.id, property?.owner_id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!property) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Home className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Propriété introuvable</h1>
            <p className="text-muted-foreground mb-6">
              La propriété que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Link href="/properties">
              <Button size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux propriétés
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/properties">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('property.back')}
          </Button>
        </Link>

        <div className="mb-8">
          {images.length > 1 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg bg-muted">
                      <img
                        src={image}
                        alt={`${property.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-200"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding={index === 0 ? 'sync' : 'async'}
                        // @ts-expect-error - fetchpriority is a valid HTML attribute but TypeScript types don't include it yet
                        fetchpriority={index === 0 ? 'high' : 'low'}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('data:image')) {
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="16"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                          }
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="!left-6 sm:!left-8 md:!left-12 lg:!left-16 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white border-0 shadow-lg h-10 w-10 z-20 hover:scale-110 active:scale-95" />
              <CarouselNext className="!right-6 sm:!right-8 md:!right-12 lg:!right-16 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white border-0 shadow-lg h-10 w-10 z-20 hover:scale-110 active:scale-95" />
            </Carousel>
          ) : (
            <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg bg-muted">
              <img
                src={images[0]}
                alt={property.title}
                className="w-full h-full object-cover transition-opacity duration-200"
                loading="eager"
                decoding="sync"
                // @ts-expect-error - fetchpriority is a valid HTML attribute but TypeScript types don't include it yet
                fetchpriority="high"
                sizes="100vw"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('data:image')) {
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="16"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold" data-testid="text-property-title">{property.title}</h1>
                    {isAuthenticated && isStudent && (
                      <Button
                        size="icon"
                        variant={isFavorited ? "default" : "outline"}
                        onClick={handleFavoriteToggle}
                        disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                        className={`transition-all ${isFavorited ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        data-testid="button-favorite"
                        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`h-5 w-5 transition-all ${isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                    )}
                    {!isAuthenticated && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setLocation(`/login?redirect=/properties/${property.id}`)}
                        className="hover:bg-muted"
                        data-testid="button-favorite-login"
                        aria-label="Sign in to add to favorites"
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}, {property.city_name}, {property.canton_code} {property.postal_code}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-2 mb-1">
                    <div className="text-3xl font-bold text-primary" data-testid="text-property-price">
                      CHF {property.price.toLocaleString()}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Excellent prix
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    par mois
                  </div>
                  {property.rooms && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ≈ CHF {Math.round(property.price / (property.rooms || 1)).toLocaleString()}/pièce
                    </div>
                  )}
                </div>
              </div>

              <TooltipProvider>
                <div className="flex flex-wrap gap-4 mb-4">
                  {property.rooms && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-help">
                          <Home className="h-5 w-5 text-primary" />
                          <span className="font-medium">{property.rooms}</span>
                          <span className="text-muted-foreground">pièce{property.rooms > 1 ? 's' : ''}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nombre de pièces</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {property.bathrooms && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-help">
                          <Bath className="h-5 w-5 text-primary" />
                          <span className="font-medium">{property.bathrooms}</span>
                          <span className="text-muted-foreground">salle{property.bathrooms > 1 ? 's' : ''} de bain</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nombre de salles de bain</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {property.surface_area && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-help">
                          <Maximize className="h-5 w-5 text-primary" />
                          <span className="font-medium">{property.surface_area}</span>
                          <span className="text-muted-foreground">m²</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Surface habitable</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {property.available_from && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-help">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="text-muted-foreground">Disponible dès</span>
                          <span className="font-medium">{new Date(property.available_from).toLocaleDateString('fr-CH')}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Date de disponibilité</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>

              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className="gap-1">
                  <Home className="h-3 w-3" />
                  {property.property_type}
                </Badge>
                <Badge variant={property.status === 'available' ? 'default' : 'secondary'} className="gap-1">
                  {property.status === 'available' ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Disponible
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      {property.status}
                    </>
                  )}
                </Badge>
                {property.email_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Propriétaire vérifié
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {t('property.description')}
              </h2>
              {property.description ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed font-serif whitespace-pre-wrap" data-testid="text-description">
                    {property.description}
                  </p>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    <p className="text-muted-foreground italic">{t('property.description.empty')}</p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>{t('property.contact')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.first_name && property.last_name && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={property.profile_picture ? normalizeImageUrl(property.profile_picture) : undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {ownerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium" data-testid="text-owner-name">
                        {property.first_name} {property.last_name}
                      </p>
                      {property.email_verified && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Verified Owner
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {property.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{property.email}</span>
                  </div>
                )}

                {property.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{property.phone}</span>
                  </div>
                )}

                <Separator />

                {canContact ? (
                  <TooltipProvider>
                    <div className="space-y-3">
                      {isAuthenticated && isStudent && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="w-full"
                              variant={isFavorited ? "default" : "outline"}
                              size="lg"
                              onClick={handleFavoriteToggle}
                              disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                              data-testid="button-favorite-sidebar"
                            >
                              <Heart className={`h-4 w-4 mr-2 transition-all ${isFavorited ? 'fill-current animate-pulse' : ''}`} />
                              {isFavorited ? t('property.favorite.remove') : t('property.favorite.add')}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" size="lg" data-testid="button-send-request">
                          <Send className="h-4 w-4 mr-2" />
                          {t('property.request')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            {t('property.request')}
                          </DialogTitle>
                          <DialogDescription>
                            {t('property.request.message')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Textarea
                            placeholder={t('property.request.placeholder')}
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 Soyez poli et mentionnez votre situation d'étudiant
                          </p>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button
                            onClick={handleSendRequest}
                            disabled={sendRequestMutation.isPending || !requestMessage.trim()}
                          >
                            {sendRequestMutation.isPending ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                {t('property.request.sending')}
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                {t('property.request.send')}
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      className="w-full"
                      variant="outline"
                      size="lg"
                      onClick={() => setLocation(`/messages?property=${property.id}&owner=${property.owner_id}`)}
                      data-testid="button-contact-owner"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t('property.contact')}
                    </Button>
                    </div>
                  </TooltipProvider>
                ) : !isAuthenticated ? (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription className="text-center">
                      <p className="font-medium mb-2">{t('property.signin')}</p>
                      <Link href="/login">
                        <Button className="w-full" size="lg">
                          {t('property.signin.button')}
                        </Button>
                      </Link>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertDescription className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {user?.id === property.owner_id ? t('property.owner.own') : t('property.owner.student')}
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
