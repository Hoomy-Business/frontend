import { useRoute, useLocation, Link } from 'wouter';
import { MapPin, Home, Bath, Maximize, Calendar, Mail, Phone, CheckCircle2, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import type { Property, PropertyPhoto } from '@shared/schema';

export default function PropertyDetail() {
  const [, params] = useRoute('/properties/:id');
  const [, setLocation] = useLocation();
  const { isAuthenticated, isStudent, user } = useAuth();
  const propertyId = params?.id;

  const { data: property, isLoading } = useQuery<Property & { photos?: PropertyPhoto[] }>({
    queryKey: [`/properties/${propertyId}`],
    enabled: !!propertyId,
  });

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

  const images = property.photos && property.photos.length > 0
    ? property.photos.map(p => p.photo_url)
    : property.main_photo 
    ? [property.main_photo]
    : ['/placeholder-property.jpg'];

  const ownerInitials = property.first_name && property.last_name
    ? `${property.first_name[0]}${property.last_name[0]}`.toUpperCase()
    : 'O';

  const canContact = isAuthenticated && isStudent && user?.id !== property.owner_id;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/properties">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
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
                        className="w-full h-full object-cover"
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
                className="w-full h-full object-cover"
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
                  <h1 className="text-3xl font-bold mb-2" data-testid="text-property-title">{property.title}</h1>
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
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed font-serif" data-testid="text-description">
                {property.description || 'No description available.'}
              </p>
            </div>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Contact Owner</CardTitle>
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
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setLocation(`/messages?property=${property.id}&owner=${property.owner_id}`)}
                    data-testid="button-contact-owner"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Owner
                  </Button>
                ) : !isAuthenticated ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Sign in to contact the owner</p>
                    <Link href="/login">
                      <Button className="w-full" size="lg">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    {user?.id === property.owner_id ? 'This is your property' : 'Sign in as a student to contact the owner'}
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
