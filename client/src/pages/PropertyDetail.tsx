import { useRoute, useLocation, Link } from 'wouter';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { MapPin, Home, Bath, Maximize, Calendar, Mail, Phone, CheckCircle2, ArrowLeft, Heart, Send } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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

  // Rediriger si l'ID est invalide
  useEffect(() => {
    if (propertyId && !isValidPropertyId) {
      if (propertyId === 'create') {
        setLocation('/properties/create');
      } else {
        setLocation('/properties');
      }
    }
  }, [propertyId, isValidPropertyId, setLocation]);

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
  });

  const isFavorited = useMemo(() => {
    if (!favorites || !numericPropertyId) return false;
    return favorites.some(fav => fav.id === numericPropertyId);
  }, [favorites, numericPropertyId]);

  const addFavoriteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('POST', '/favorites', { property_id: propertyId }),
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: ['/favorites'] });
      const previousFavorites = queryClient.getQueryData<Property[]>(['/favorites']);
      
      if (previousFavorites && property) {
        queryClient.setQueryData<Property[]>(['/favorites'], [...previousFavorites, property]);
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
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/favorites/${propertyId}`),
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: ['/favorites'] });
      const previousFavorites = queryClient.getQueryData<Property[]>(['/favorites']);
      
      if (previousFavorites) {
        queryClient.setQueryData<Property[]>(
          ['/favorites'],
          previousFavorites.filter(p => p.id !== propertyId)
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
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
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
    if (!property) return ['/placeholder-property.jpg'];
    if (property.photos && property.photos.length > 0) {
      return property.photos.map(p => normalizeImageUrl(p.photo_url));
    }
    if (property.main_photo) {
      return [normalizeImageUrl(property.main_photo)];
    }
    return ['/placeholder-property.jpg'];
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Link href="/properties">
            <Button>Browse Properties</Button>
          </Link>
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
                          e.currentTarget.src = '/placeholder-property.jpg';
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
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
                  e.currentTarget.src = '/placeholder-property.jpg';
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
                  <div className="text-3xl font-bold text-primary" data-testid="text-property-price">
                    CHF {property.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                {property.rooms && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Home className="h-5 w-5" />
                    <span>{property.rooms} rooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bath className="h-5 w-5" />
                    <span>{property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}</span>
                  </div>
                )}
                {property.surface_area && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Maximize className="h-5 w-5" />
                    <span>{property.surface_area}m²</span>
                  </div>
                )}
                {property.available_from && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>Available from {new Date(property.available_from).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Badge>{property.property_type}</Badge>
                <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                  {property.status}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">{t('property.description')}</h2>
              <p className="text-muted-foreground leading-relaxed font-serif" data-testid="text-description">
                {property.description || t('property.description.empty')}
              </p>
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
                  <div className="space-y-3">
                    {isAuthenticated && isStudent && (
                      <Button
                        className="w-full"
                        variant={isFavorited ? "default" : "outline"}
                        size="lg"
                        onClick={handleFavoriteToggle}
                        disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                        data-testid="button-favorite-sidebar"
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                        {isFavorited ? t('property.favorite.remove') : t('property.favorite.add')}
                      </Button>
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
                          <DialogTitle>{t('property.request')}</DialogTitle>
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
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button
                            onClick={handleSendRequest}
                            disabled={sendRequestMutation.isPending || !requestMessage.trim()}
                          >
                            {sendRequestMutation.isPending ? t('property.request.sending') : t('property.request.send')}
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
                ) : !isAuthenticated ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">{t('property.signin')}</p>
                    <Link href="/login">
                      <Button className="w-full" size="lg">
                        {t('property.signin.button')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    {user?.id === property.owner_id ? t('property.owner.own') : t('property.owner.student')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
