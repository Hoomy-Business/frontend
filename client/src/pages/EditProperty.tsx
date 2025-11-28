import { useState, useEffect } from 'react';
import { useLocation, Link, useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { createPropertySchema, type CreatePropertyInput, type Property } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, uploadImages } from '@/lib/api';
import type { Canton, City } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { useLanguage } from '@/lib/useLanguage';

export default function EditProperty() {
  const [, params] = useRoute('/properties/:id/edit');
  const propertyId = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { isOwner } = useAuth();
  const { getCantonName, getCityName } = useLanguage();
  const [error, setError] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCanton, setSelectedCanton] = useState('');

  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: [`/properties/${propertyId}`],
    enabled: !!propertyId && propertyId > 0,
    queryFn: async () => {
      if (!propertyId || propertyId <= 0) throw new Error('Invalid property ID');
      return apiRequest<Property>('GET', `/properties/${propertyId}`);
    },
  });

  const { data: cantons } = useQuery<Canton[]>({
    queryKey: ['/locations/cantons'],
    queryFn: async () => {
      return apiRequest<Canton[]>('GET', '/locations/cantons');
    },
  });

  const { data: cities } = useQuery<City[]>({
    queryKey: ['/locations/cities', selectedCanton],
    enabled: !!selectedCanton,
    queryFn: async () => {
      if (!selectedCanton) throw new Error('Canton required');
      return apiRequest<City[]>('GET', `/locations/cities?canton=${selectedCanton}`);
    },
  });

  const form = useForm<CreatePropertyInput & { status?: string }>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: 'apartment',
      address: '',
      city_name: '',
      postal_code: '',
      canton_code: '',
      price: 0,
      rooms: 0,
      bathrooms: 0,
      surface_area: 0,
      available_from: '',
    },
  });

  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title,
        description: property.description || '',
        property_type: property.property_type,
        address: property.address,
        city_name: property.city_name,
        postal_code: property.postal_code,
        canton_code: property.canton_code,
        price: property.price,
        rooms: property.rooms || 0,
        bathrooms: property.bathrooms || 0,
        surface_area: property.surface_area || 0,
        available_from: property.available_from || '',
      });
      setSelectedCanton(property.canton_code);
    }
  }, [property, form]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: CreatePropertyInput & { status?: string }) => {
      return apiRequest<Property>('PUT', `/properties/${propertyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/properties/${propertyId}`] });
      queryClient.invalidateQueries({ queryKey: ['/properties/my-properties'] });
      setLocation('/dashboard/owner');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update property');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreatePropertyInput & { status?: string }) => {
    setError('');
    
    // Vérifier que les champs d'adresse sont remplis
    if (!data.address || !data.city_name || !data.postal_code || !data.canton_code) {
      setError('Veuillez remplir tous les champs d\'adresse (rue, canton, ville, code postal)');
      return;
    }
    
    // Note: Image updates would require additional backend support
    // For now, we only update property details
    
    const submitData = {
      ...data,
      rooms: data.rooms || 0,
      bathrooms: data.bathrooms || 0,
      surface_area: data.surface_area || 0,
      available_from: data.available_from || null,
      status: property?.status || 'available',
    };
    
    updatePropertyMutation.mutate(submitData as any);
  };

  if (!isOwner) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Only property owners can edit listings</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (propertyLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading property details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!property) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Link href="/dashboard/owner">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard/owner">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Property</CardTitle>
              <CardDescription>Update your property listing details</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cozy 2-room apartment near university" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe your property, amenities, nearby facilities..."
                            rows={6}
                            className="resize-none"
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormDescription>Minimum 20 caractères avec plusieurs mots séparés par des espaces</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="property_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="room">Room</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent (CHF)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              placeholder="1500"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Entrez une adresse"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="canton_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canton</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCanton(value);
                              form.setValue('city_name', '');
                              // Réinitialiser l'adresse si le canton change
                              form.setValue('address', '');
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cantons?.map((canton) => (
                                <SelectItem key={canton.code} value={canton.code}>
                                  {getCantonName(canton)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities?.map((city) => (
                                <SelectItem key={city.id} value={city.name}>
                                  {getCityName(city.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="8001" maxLength={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="rooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rooms</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.5"
                              placeholder="2.5"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              placeholder="1"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="surface_area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface (m²)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              placeholder="65"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="available_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available From (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={updatePropertyMutation.isPending}
                      className="flex-1"
                    >
                      {updatePropertyMutation.isPending ? 'Updating...' : 'Update Property'}
                    </Button>
                    <Link href="/dashboard/owner">
                      <Button type="button" variant="outline" size="lg">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

