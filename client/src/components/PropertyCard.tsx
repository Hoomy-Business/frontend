import { Link } from 'wouter';
import { MapPin, Home, Bath, Maximize, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Property } from '@shared/schema';

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: number) => void;
  isFavorited?: boolean;
}

export function PropertyCard({ property, onFavoriteToggle, isFavorited }: PropertyCardProps) {
  const imageUrl = property.main_photo || '/placeholder-property.jpg';

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-property-${property.id}`}>
      <Link href={`/properties/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-property.jpg';
            }}
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur">
              {property.city_name}, {property.canton_code}
            </Badge>
          </div>
          {onFavoriteToggle && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 bg-background/90 backdrop-blur hover:bg-background"
              onClick={(e) => {
                e.preventDefault();
                onFavoriteToggle(property.id);
              }}
              data-testid={`button-favorite-${property.id}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
            </Button>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/properties/${property.id}`}>
          <div className="space-y-3">
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
}
