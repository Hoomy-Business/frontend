import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearch, useLocation } from 'wouter';
import { getAuthToken, useAuth } from '@/lib/auth';
import { Search, SlidersHorizontal, X, Home, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/api';
import type { Property, Canton, City } from '@shared/schema';
import { useLanguage } from '@/lib/useLanguage';
import { getAPIBaseURL } from '@/lib/apiConfig';
import { CityAutocomplete } from '@/components/CityAutocomplete';

export default function Properties() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [, setLocation] = useLocation();
  const { isAuthenticated, isStudent } = useAuth();
  const { t, getCantonName, getCityName } = useLanguage();
  
  const [selectedCanton, setSelectedCanton] = useState(params.get('canton') || '___all___');
  const [selectedCity, setSelectedCity] = useState(params.get('city_id') || '___all___');
  const [propertyType, setPropertyType] = useState(params.get('property_type') || '___all___');
  const [maxPrice, setMaxPrice] = useState([params.get('max_price') ? parseInt(params.get('max_price')!) : 5000]);
  const [minRooms, setMinRooms] = useState(params.get('min_rooms') || '___all___');
  const [searchQuery, setSearchQuery] = useState(params.get('search') || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(params.get('search') || '');
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

  // Update URL when filters change (debounced to avoid too many updates)
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip on initial mount to avoid overriding URL params
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const timeoutId = setTimeout(() => {
      const filters: Record<string, string> = {};
      if (selectedCanton && selectedCanton !== '___all___') filters.canton = selectedCanton;
      if (selectedCity && selectedCity !== '___all___') filters.city_id = selectedCity;
      if (propertyType && propertyType !== '___all___') filters.property_type = propertyType;
      if (maxPrice[0] < 5000) filters.max_price = maxPrice[0].toString();
      if (minRooms && minRooms !== '___all___') filters.min_rooms = minRooms;
      if (debouncedSearchQuery.trim()) filters.search = debouncedSearchQuery.trim();
      
      const queryString = new URLSearchParams(filters).toString();
      const newPath = queryString ? `/properties?${queryString}` : '/properties';
      const newSearch = queryString ? `?${queryString}` : '';
      
      // Only update if different from current location
      const currentSearch = search || '';
      if (currentSearch !== newSearch) {
        setLocation(newPath);
      }
    }, 300); // Debounce URL updates
    
    return () => clearTimeout(timeoutId);
  }, [selectedCanton, selectedCity, propertyType, maxPrice, minRooms, debouncedSearchQuery, setLocation, search]);

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
    if (debouncedSearchQuery.trim()) filters.search = debouncedSearchQuery.trim();
    const queryString = new URLSearchParams(filters).toString();
    return queryString ? `?${queryString}` : '';
  }, [selectedCanton, selectedCity, propertyType, maxPrice, minRooms, debouncedSearchQuery]);
  
  const { data: propertiesData, isLoading, error } = useQuery<{ properties: Property[]; pagination?: any } | Property[]>({
    queryKey: ['/properties', queryParams],
    // S'assurer que queryParams ne contient jamais "create"
    enabled: !queryParams.includes('create'),
    queryFn: async () => {
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const apiBase = getAPIBaseURL();
      const baseClean = apiBase.replace(/\/+$/, '');
      const endpointClean = `/properties${queryParams}`.replace(/^\/+/, '');
      const url = `${baseClean}/${endpointClean}`;
      
      // Protection: bloquer les requêtes vers des endpoints invalides
      if (url.includes('/properties/create') || url.includes('/properties/edit')) {
        throw new Error(`Invalid API endpoint: ${url}`);
      }
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || errorData.message || res.statusText);
      }
      
      const response = await res.json();
      // Gérer la compatibilité : si c'est un tableau (ancien format), le convertir
      if (Array.isArray(response)) {
        return response;
      }
      // Sinon, c'est le nouveau format avec pagination
      return response;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes - properties can change but not too frequently
    gcTime: 1000 * 60 * 15, // 15 minutes - keep in cache longer
  });

  // Extraire le tableau properties de la réponse (gère ancien et nouveau format)
  const properties = Array.isArray(propertiesData) 
    ? propertiesData 
    : (propertiesData?.properties || []);

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
      
      const apiBase = getAPIBaseURL();
      const baseClean = apiBase.replace(/\/+$/, '');
      const url = `${baseClean}/favorites`;
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || errorData.message || res.statusText);
      }
      
      const data = await res.json();
      // Gérer la nouvelle structure avec pagination
      if (Array.isArray(data)) {
        return data;
      }
      // Si c'est un objet avec pagination, extraire le tableau favorites
      return data?.favorites || [];
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
          if (query.queryKey[0] === '/properties') {
            const data = query.state.data;
            let propertiesArray: Property[] = [];
            if (Array.isArray(data)) {
              propertiesArray = data;
            } else if (data && typeof data === 'object' && 'properties' in data) {
              propertiesArray = (data as any).properties || [];
            }
            property = propertiesArray.find(p => p.id === propertyId);
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
      // Error handled by toast
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
      // Error handled by toast
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

      {selectedCanton && selectedCanton !== '___all___' && (
        <div>
          <label className="text-sm font-medium mb-2 block">{t('properties.city')}</label>
          <div className="space-y-2">
            <CityAutocomplete
              value={selectedCity !== '___all___' && selectedCity && cities ? cities.find(c => c.id.toString() === selectedCity)?.name || '' : ''}
              onChange={(value) => {
                if (!value) {
                  setSelectedCity('___all___');
                }
              }}
              onSelect={(city) => {
                setSelectedCity(city.id.toString());
              }}
              cantonCode={selectedCanton !== '___all___' ? selectedCanton : undefined}
              placeholder={t('properties.city.all')}
            />
            {selectedCity !== '___all___' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedCity('___all___')}
              >
                {t('properties.city.all')}
              </Button>
            )}
          </div>
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
          {maxPrice[0] >= 5000 ? '5000+/mois' : `CHF ${maxPrice[0].toLocaleString()}/mois`}
        </label>
        <Slider
          value={maxPrice}
          onValueChange={setMaxPrice}
          max={5000}
          min={200}
          step={100}
          data-testid="slider-price"
          className="cursor-grab active:cursor-grabbing"
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
  ), [selectedCanton, selectedCity, propertyType, maxPrice, minRooms, cantons, cities, handleCantonChange, handleClearFilters, t, getCantonName, getCityName]);

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCanton && selectedCanton !== '___all___') count++;
    if (selectedCity && selectedCity !== '___all___') count++;
    if (propertyType && propertyType !== '___all___') count++;
    if (maxPrice[0] < 5000) count++;
    if (minRooms && minRooms !== '___all___') count++;
    if (debouncedSearchQuery.trim()) count++;
    return count;
  }, [selectedCanton, selectedCity, propertyType, maxPrice, minRooms, debouncedSearchQuery]);

  // Prix moyen des propriétés
  const averagePrice = useMemo(() => {
    if (!filteredProperties || filteredProperties.length === 0) return 0;
    const sum = filteredProperties.reduce((acc, p) => acc + (p.price || 0), 0);
    return Math.round(sum / filteredProperties.length);
  }, [filteredProperties]);

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
                <Home className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                {t('properties.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">Chargement...</span>
                  </span>
                ) : filteredProperties.length === 1 ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {t('properties.subtitle.singular', { count: filteredProperties.length })}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {t('properties.subtitle.plural', { count: filteredProperties.length })}
                    {averagePrice > 0 && (
                      <span className="ml-2 text-primary font-semibold">
                        • Prix moyen: CHF {averagePrice.toLocaleString()}/mois
                      </span>
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Badges des filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="gap-1">
                <Filter className="h-3 w-3" />
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
              {selectedCanton && selectedCanton !== '___all___' && cantons && (
                <Badge variant="outline" className="gap-1">
                  {getCantonName(cantons.find(c => c.code === selectedCanton) || { code: selectedCanton, name_fr: selectedCanton, name_de: selectedCanton })}
                  <button
                    onClick={() => handleCantonChange('___all___')}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCity && selectedCity !== '___all___' && cities && (
                <Badge variant="outline" className="gap-1">
                  {getCityName(cities.find(c => c.id.toString() === selectedCity)?.name || '')}
                  <button
                    onClick={() => setSelectedCity('___all___')}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {propertyType && propertyType !== '___all___' && (
                <Badge variant="outline" className="gap-1">
                  {propertyType}
                  <button
                    onClick={() => setPropertyType('___all___')}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {maxPrice[0] < 5000 && (
                <Badge variant="outline" className="gap-1">
                  {maxPrice[0].toLocaleString()}/mois
                  <button
                    onClick={() => setMaxPrice([5000])}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {maxPrice[0] >= 5000 && (
                <Badge variant="outline">
                  5000+/mois
                </Badge>
              )}
              {minRooms && minRooms !== '___all___' && (
                <Badge variant="outline" className="gap-1">
                  {minRooms}+ pièces
                  <button
                    onClick={() => setMinRooms('___all___')}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {debouncedSearchQuery.trim() && (
                <Badge variant="outline" className="gap-1">
                  "{debouncedSearchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 text-xs"
              >
                Tout effacer
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-20 border-2">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  {t('properties.filters')}
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
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
                  <Button variant="outline" className="lg:hidden h-9 sm:h-10 active:scale-95 transition-transform duration-100 relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <span className="hidden xs:inline">{t('properties.filters')}</span>
                    <span className="xs:hidden">Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
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

            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold mb-1">Erreur de chargement</p>
                      <p className="text-sm">{error instanceof Error ? error.message : 'Erreur inconnue'}</p>
                      <p className="text-xs mt-2 text-muted-foreground">
                        URL: {getAPIBaseURL()}/properties{queryParams}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['/properties'] })}
                    >
                      Réessayer
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : isLoading ? (
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
              <Card className="p-6 sm:p-8 md:p-12 text-center border-dashed">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('properties.empty')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t('properties.empty.subtitle')}</p>
                    {activeFiltersCount > 0 && (
                      <Alert className="max-w-md mx-auto mb-4">
                        <AlertDescription className="text-center">
                          Aucune propriété ne correspond à vos critères. Essayez de modifier vos filtres.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button onClick={handleClearFilters} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </div>
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
