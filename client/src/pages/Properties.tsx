import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearch, useLocation } from 'wouter';
import { getAuthToken, useAuth } from '@/lib/auth';
import { Search, SlidersHorizontal } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/api';
import type { Property, Canton, City } from '@shared/schema';
import { useLanguage } from '@/lib/useLanguage';

export default function Properties() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [, setLocation] = useLocation();
  const { isAuthenticated, isStudent } = useAuth();
  const { t, getCantonName, getCityName } = useLanguage();
  
  const [selectedCanton, setSelectedCanton] = useState(params.get('canton') || '___all___');
  const [selectedCity, setSelectedCity] = useState('___all___');
  const [propertyType, setPropertyType] = useState('___all___');
  const [maxPrice, setMaxPrice] = useState([5000]);
  const [minRooms, setMinRooms] = useState('___all___');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 100); // 100ms debounce - ultra-fast response

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const { data: cantons } = useQuery<Canton[]>({
    queryKey: ['/locations/cantons'],
    queryFn: async () => {
      return apiRequest<Canton[]>('GET', '/locations/cantons');
    },
    staleTime: 1000 * 60 * 60, // 1 hour - cantons are very static
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const { data: cities } = useQuery<City[]>({
    queryKey: [`/locations/cities/${selectedCanton}`],
    enabled: !!selectedCanton && selectedCanton !== '___all___',
    queryFn: async () => {
      if (!selectedCanton || selectedCanton === '___all___') throw new Error('Canton required');
      return apiRequest<City[]>('GET', `/locations/cities?canton=${selectedCanton}`);
    },
    staleTime: 1000 * 60 * 60, // 1 hour - cities are very static
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const queryParams = useMemo(() => {
    const filters: Record<string, string> = {};
    if (selectedCanton && selectedCanton !== '___all___') filters.canton = selectedCanton;
    if (selectedCity && selectedCity !== '___all___') filters.city_id = selectedCity;
    if (propertyType && propertyType !== '___all___') filters.property_type = propertyType;
    if (maxPrice[0] < 5000) filters.max_price = maxPrice[0].toString();
    if (minRooms && minRooms !== '___all___') filters.min_rooms = minRooms;
    const queryString = new URLSearchParams(filters).toString();
    return queryString ? `?${queryString}` : '';
  }, [selectedCanton, selectedCity, propertyType, maxPrice, minRooms]);
  
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/properties', queryParams],
    // S'assurer que queryParams ne contient jamais "create"
    enabled: !queryParams.includes('create'),
    queryFn: async () => {
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const url = `http://localhost:3000/api/properties${queryParams}`;
      // Protection: bloquer les requêtes vers des endpoints invalides
      if (url.includes('/properties/create') || url.includes('/properties/edit')) {
        throw new Error(`Invalid API endpoint: ${url}`);
      }
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || errorData.message || res.statusText);
      }
      
      return res.json();
    },
    staleTime: 1000 * 60 * 3, // 3 minutes - properties can change but not too frequently
    gcTime: 1000 * 60 * 15, // 15 minutes - keep in cache longer
  });

  // Fetch favorites if user is authenticated and is a student
  // Always call useQuery but enable it conditionally
  const { data: favorites, error: favoritesError } = useQuery<Property[]>({
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
      
      const url = `http://localhost:3000/api/favorites`;
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || errorData.message || res.statusText);
      }
      
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - favorites don't change often
    gcTime: 1000 * 60 * 30, // 30 minutes - keep favorites in cache longer
  });

  // Create a Set of favorite property IDs for quick lookup
  // Always create the Set even if favorites is undefined
  const favoriteIds = useMemo(() => {
    if (!favorites || !Array.isArray(favorites)) {
      return new Set<number>();
    }
    return new Set(favorites.map(fav => fav.id));
  }, [favorites]);

  // Mutations for adding/removing favorites with optimistic updates
  const addFavoriteMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return apiRequest('POST', '/favorites', { property_id: propertyId });
    },
    onMutate: async (propertyId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/favorites'] });
      
      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData<Property[]>(['/favorites']);
      
      // Optimistically update - get property from all properties queries in cache
      if (previousFavorites) {
        // Try to find property in any cached properties query
        const cache = queryClient.getQueryCache();
        let property: Property | undefined;
        
        for (const query of cache.getAll()) {
          if (query.queryKey[0] === '/properties' && Array.isArray(query.state.data)) {
            property = (query.state.data as Property[]).find(p => p.id === propertyId);
            if (property) break;
          }
        }
        
        // Fallback: use current properties data if available
        if (!property && properties) {
          property = properties.find(p => p.id === propertyId);
        }
        
        if (property) {
          queryClient.setQueryData<Property[]>(['/favorites'], [...previousFavorites, property]);
        }
      }
      
      return { previousFavorites };
    },
    onError: (err, propertyId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['/favorites'], context.previousFavorites);
      }
      console.error('Error adding favorite:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return apiRequest('DELETE', `/favorites/${propertyId}`);
    },
    onMutate: async (propertyId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/favorites'] });
      
      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData<Property[]>(['/favorites']);
      
      // Optimistically update
      if (previousFavorites) {
        queryClient.setQueryData<Property[]>(
          ['/favorites'],
          previousFavorites.filter(p => p.id !== propertyId)
        );
      }
      
      return { previousFavorites };
    },
    onError: (err, propertyId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['/favorites'], context.previousFavorites);
      }
      console.error('Error removing favorite:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
    },
  });

  // Handler to toggle favorite status
  const handleFavoriteToggle = useCallback((propertyId: number) => {
    if (!isAuthenticated || !isStudent) {
      // Redirect to login if not authenticated
      setLocation('/login?redirect=/properties');
      return;
    }

    if (favoriteIds.has(propertyId)) {
      removeFavoriteMutation.mutate(propertyId);
    } else {
      addFavoriteMutation.mutate(propertyId);
    }
  }, [isAuthenticated, isStudent, favoriteIds, addFavoriteMutation, removeFavoriteMutation, setLocation]);

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    if (!debouncedSearchQuery.trim()) return properties;
    
    const query = debouncedSearchQuery.toLowerCase().trim();
    // Early return optimization
    if (query.length === 0) return properties;
    
    // Use more efficient filtering
    return properties.filter(p => {
      const title = p.title?.toLowerCase() || '';
      const city = p.city_name?.toLowerCase() || '';
      const address = p.address?.toLowerCase() || '';
      return title.includes(query) || city.includes(query) || address.includes(query);
    });
  }, [properties, debouncedSearchQuery]);

  const handleCantonChange = useCallback((value: string) => {
    setSelectedCanton(value);
    setSelectedCity('___all___');
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCanton('___all___');
    setSelectedCity('___all___');
    setPropertyType('___all___');
    setMaxPrice([5000]);
    setMinRooms('___all___');
  }, []);

  // Memoize FiltersContent to prevent re-creation on every render
  const filtersContent = useMemo(() => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">{t('properties.canton')}</label>
        <Select value={selectedCanton} onValueChange={handleCantonChange}>
          <SelectTrigger data-testid="select-canton">
            <SelectValue placeholder={t('properties.canton.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="___all___">{t('properties.canton.all')}</SelectItem>
            {cantons?.map((canton) => (
              <SelectItem key={canton.code} value={canton.code}>
                {getCantonName(canton)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCanton && cities && cities.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">{t('properties.city')}</label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger data-testid="select-city">
              <SelectValue placeholder={t('properties.city.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="___all___">{t('properties.city.all')}</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {getCityName(city.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-2 block">{t('properties.type')}</label>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger data-testid="select-type">
            <SelectValue placeholder={t('properties.type.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="___all___">{t('properties.type.all')}</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="room">Room</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          {t('properties.price.max', { price: maxPrice[0].toLocaleString() })}
        </label>
        <Slider
          value={maxPrice}
          onValueChange={setMaxPrice}
          max={5000}
          min={200}
          step={100}
          data-testid="slider-price"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">{t('properties.rooms.min')}</label>
        <Select value={minRooms} onValueChange={setMinRooms}>
          <SelectTrigger data-testid="select-rooms">
            <SelectValue placeholder={t('properties.rooms.any')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="___all___">{t('properties.rooms.any')}</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleClearFilters}
        data-testid="button-clear-filters"
      >
        {t('properties.clear')}
      </Button>
    </div>
  ), [selectedCanton, selectedCity, propertyType, maxPrice, minRooms, cantons, cities, handleCantonChange, handleClearFilters]);

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2" data-testid="text-page-title">{t('properties.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {filteredProperties.length === 1 
              ? t('properties.subtitle.singular', { count: filteredProperties.length })
              : t('properties.subtitle.plural', { count: filteredProperties.length })}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  {t('properties.filters')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filtersContent}
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('properties.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
                  data-testid="input-search"
                />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden h-9 sm:h-10 active:scale-95 transition-transform duration-100">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <span className="hidden xs:inline">{t('properties.filters')}</span>
                    <span className="xs:hidden">Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>{t('properties.filters')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {filtersContent}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <Card className="p-6 sm:p-8 md:p-12 text-center">
                <p className="text-base sm:text-lg text-muted-foreground">{t('properties.empty')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{t('properties.empty.subtitle')}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    isFavorited={isAuthenticated && isStudent ? favoriteIds.has(property.id) : false}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
