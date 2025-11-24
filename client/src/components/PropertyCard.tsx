import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { MapPin, Home, Bath, Maximize, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Property } from '@shared/schema';
import { normalizeImageUrl } from '@/lib/imageUtils';
import { usePrefetchProperty } from '@/hooks/use-prefetch';
import { useLanguage } from '@/lib/useLanguage';

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: number) => void;
  isFavorited?: boolean;
  hideFavoriteButton?: boolean;
}

export const PropertyCard = memo(function PropertyCard({ property, onFavoriteToggle, isFavorited, hideFavoriteButton = false }: PropertyCardProps) {
  const imageUrl = normalizeImageUrl(property.main_photo);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { prefetchProperty } = usePrefetchProperty();
  const [, setLocation] = useLocation();
  const { getCityName, getCantonNameFromCode } = useLanguage();

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id);
    } else {
      // Redirect to login if no handler provided
      setLocation(`/login?redirect=/properties/${property.id}`);
    }
  }, [onFavoriteToggle, property.id, setLocation]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Check if element is already visible (e.g., above the fold)
    const rect = cardRef.current.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight + 50 && rect.bottom > -50;
    
    if (isAlreadyVisible) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' } // Start loading 50px before visible
    );
    
    observer.observe(cardRef.current);
    
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = useCallback(() => {
    prefetchProperty(property.id);
  }, [property.id, prefetchProperty]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    setImageLoaded(true);
    e.currentTarget.src = '/placeholder-property.jpg';
  }, []);

  return (
    <Card 
      ref={cardRef}
      className="overflow-hidden hover-elevate transition-all duration-200 hover:shadow-lg group will-change-transform active:scale-[0.98] touch-manipulation" 
      data-testid={`card-property-${property.id}`}
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link href={`/properties/${property.id}`}>
          <div className="block w-full h-full cursor-pointer">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            {isVisible && (
              <img
                ref={imageRef}
                src={imageError ? '/placeholder-property.jpg' : imageUrl}
                alt={property.title}
                className={`w-full h-full object-cover transition-all duration-200 group-hover:scale-105 will-change-transform ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                decoding="async"
                // @ts-expect-error - fetchpriority is a valid HTML attribute but TypeScript types don't include it yet
                fetchpriority="low"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>
        </Link>

        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-background/90 text-foreground backdrop-blur">
            {getCityName(property.city_name)}, {getCantonNameFromCode(property.canton_code)}
          </Badge>
        </div>

        {!hideFavoriteButton && (
          <button
            type="button"
            className="absolute top-3 right-3 z-30 rounded-full bg-white p-2 shadow-lg hover:bg-white hover:scale-110 transition-all border border-gray-300 flex items-center justify-center"
            onClick={handleFavoriteClick}
            data-testid={`button-favorite-${property.id}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-6 w-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
        )}
      </div>

      <CardContent className="p-4">
        <Link href={`/properties/${property.id}`}>
          <div className="space-y-3 cursor-pointer">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-title-${property.id}`}>
                {property.title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {property.address}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {property.rooms && (
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  {property.rooms} rooms
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {property.bathrooms} bath
                </div>
              )}
              {property.surface_area && (
                <div className="flex items-center gap-1">
                  <Maximize className="h-4 w-4" />
                  {property.surface_area}m²
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <span className="text-2xl font-bold text-primary" data-testid={`text-price-${property.id}`}>
                  CHF {property.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <Badge variant="outline">{property.property_type}</Badge>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
});
