import { useState } from 'react';
import { useSearch } from 'wouter';
import { getAuthToken } from '@/lib/auth';
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
import { useQuery } from '@tanstack/react-query';
import type { Property, Canton, City } from '@shared/schema';

export default function Properties() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  const [selectedCanton, setSelectedCanton] = useState(params.get('canton') || '___all___');
  const [selectedCity, setSelectedCity] = useState('___all___');
  const [propertyType, setPropertyType] = useState('___all___');
  const [maxPrice, setMaxPrice] = useState([5000]);
  const [minRooms, setMinRooms] = useState('___all___');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: cantons } = useQuery<Canton[]>({
    queryKey: ['/locations/cantons'],
  });

  const { data: cities } = useQuery<City[]>({
    queryKey: [`/locations/cities/${selectedCanton}`],
    enabled: !!selectedCanton && selectedCanton !== '___all___',
  });

  const buildQueryParams = () => {
    const filters: Record<string, string> = {};
    if (selectedCanton && selectedCanton !== '___all___') filters.canton = selectedCanton;
    if (selectedCity && selectedCity !== '___all___') filters.city_id = selectedCity;
    if (propertyType && propertyType !== '___all___') filters.property_type = propertyType;
    if (maxPrice[0] < 5000) filters.max_price = maxPrice[0].toString();
    if (minRooms && minRooms !== '___all___') filters.min_rooms = minRooms;
    const queryString = new URLSearchParams(filters).toString();
    return queryString ? `?${queryString}` : '';
  };

  const queryParams = buildQueryParams();
  
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/properties', queryParams],
    queryFn: async () => {
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const url = `http://localhost:3000/api/properties${queryParams}`;
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || errorData.message || res.statusText);
      }
      
      return res.json();
    },
  });

  const filteredProperties = properties?.filter(p => 
    !searchQuery || 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Canton</label>
        <Select value={selectedCanton} onValueChange={(value) => {
          setSelectedCanton(value);
          setSelectedCity('___all___');
        }}>
          <SelectTrigger data-testid="select-canton">
            <SelectValue placeholder="All Cantons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="___all___">All Cantons</SelectItem>
            {cantons?.map((canton) => (
              <SelectItem key={canton.code} value={canton.code}>
                {canton.name_fr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCanton && cities && cities.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">City</label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger data-testid="select-city">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="___all___">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-2 block">Property Type</label>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger data-testid="select-type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="___all___">All Types</SelectItem>
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
          Max Price: CHF {maxPrice[0].toLocaleString()}/month
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
        <label className="text-sm font-medium mb-2 block">Minimum Rooms</label>
        <Select value={minRooms} onValueChange={setMinRooms}>
          <SelectTrigger data-testid="select-rooms">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="___all___">Any</SelectItem>
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
        onClick={() => {
          setSelectedCanton('___all___');
          setSelectedCity('___all___');
          setPropertyType('___all___');
          setMaxPrice([5000]);
          setMinRooms('___all___');
        }}
        data-testid="button-clear-filters"
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Find Student Housing</h1>
          <p className="text-muted-foreground">Browse {filteredProperties.length} available properties across Switzerland</p>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, city, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
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
              <Card className="p-12 text-center">
                <p className="text-lg text-muted-foreground">No properties found matching your criteria</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
