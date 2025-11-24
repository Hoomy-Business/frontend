import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { createPropertySchema, type CreatePropertyInput } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, uploadImages } from '@/lib/api';
import type { Canton, City, KYCStatus } from '@shared/schema';
import { useLanguage } from '@/lib/useLanguage';
import { AlertCircle } from 'lucide-react';

export default function CreateProperty() {
  const [, setLocation] = useLocation();
  const { isOwner } = useAuth();
  const { getCantonName, getCityName } = useLanguage();
  const [error, setError] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedCanton, setSelectedCanton] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const { data: kycStatus } = useQuery<KYCStatus>({
    queryKey: ['/kyc/status'],
    queryFn: async () => {
      return apiRequest<KYCStatus>('GET', '/kyc/status');
    },
    enabled: isOwner,
  });

  const form = useForm<CreatePropertyInput>({
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
      rooms: undefined,
      bathrooms: undefined,
      surface_area: undefined,
      available_from: '',
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: CreatePropertyInput & { photos?: string[]; image_urls?: string[] }) => {
      // Use image_urls if provided, otherwise fall back to photos
      const imageUrls = data.image_urls || data.photos || [];
      
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error('Au moins une image est requise');
      }
      
      const payload = {
        ...data,
        image_urls: imageUrls
      };
      // Remove photos from payload as backend expects image_urls
      delete (payload as any).photos;
      
      // Sending property creation request
      return apiRequest('POST', '/properties', payload);
    },
    onSuccess: () => {
      setLocation('/dashboard/owner');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create property');
    },
  });

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB en bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Vérifier la taille de chaque fichier
      const oversizedFiles: File[] = [];
      const validFiles: File[] = [];
      
      files.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          oversizedFiles.push(file);
        } else {
          validFiles.push(file);
        }
      });
      
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        setError(`Les fichiers suivants sont trop volumineux (max ${maxSizeMB} MB par image) : ${fileNames}. Veuillez réduire leur taille avant de les uploader.`);
        return;
      }
      
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        setError(''); // Clear any previous errors
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Ajuster l'index si nécessaire
      if (currentImageIndex >= newFiles.length && newFiles.length > 0) {
        setCurrentImageIndex(newFiles.length - 1);
      } else if (newFiles.length === 0) {
        setCurrentImageIndex(0);
      }
      return newFiles;
    });
  };

  // Réinitialiser l'index quand les fichiers changent
  useEffect(() => {
    if (currentImageIndex >= selectedFiles.length && selectedFiles.length > 0) {
      setCurrentImageIndex(selectedFiles.length - 1);
    } else if (selectedFiles.length === 0) {
      setCurrentImageIndex(0);
    }
  }, [selectedFiles.length, currentImageIndex]);

  const onSubmit = async (data: CreatePropertyInput) => {
    setError('');
    
    // Vérifier qu'au moins une image est sélectionnée
    if (selectedFiles.length === 0) {
      setError('Au moins une image est requise');
      return;
    }
    
    let imageUrls: string[] = [];
    try {
      // Uploading images
      const result = await uploadImages(selectedFiles);
        // Upload successful
      imageUrls = result.images.map(img => img.url);
        // Image URLs received
      
      // Vérifier que l'upload a réussi
      if (!imageUrls || imageUrls.length === 0) {
        // No image URLs returned
        setError('Échec du téléchargement des images');
        return;
      }
    } catch (err) {
      // Upload error - afficher le message d'erreur détaillé
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError('Échec du téléchargement des images: ' + errorMessage);
      
      // Si c'est une erreur de taille de fichier, donner des conseils
      if (errorMessage.includes('trop volumineux') || errorMessage.includes('File too large')) {
        setError('Échec du téléchargement des images: Les fichiers sont trop volumineux. La taille maximale est de 10 MB par image. Veuillez compresser ou réduire la taille de vos images avant de les uploader.');
      }
      return;
    }

    createPropertyMutation.mutate({
      ...data,
      rooms: data.rooms ?? undefined,
      bathrooms: data.bathrooms ?? undefined,
      surface_area: data.surface_area ?? undefined,
      available_from: data.available_from || null,
      image_urls: imageUrls
    } as any);
  };

  if (!isOwner) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Only property owners can create listings</p>
          <Link href="/">
            <Button>Go Home</Button>
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
              <CardTitle>Add New Property</CardTitle>
              <CardDescription>Fill in the details of your property listing</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {kycStatus && !kycStatus.is_verified && !kycStatus.kyc_verified && (
                <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    <strong>Vérification KYC requise</strong>
                    <br />
                    Vous devez compléter la vérification KYC avant de pouvoir publier des annonces.
                    <br />
                    <Link href="/dashboard/owner?tab=profile" className="underline font-medium mt-2 inline-block">
                      Compléter la vérification dans votre profil
                    </Link>
                  </AlertDescription>
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
                          <Input {...field} placeholder="Cozy 2-room apartment near university" data-testid="input-title" />
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
                        <FormDescription>Minimum 20 characters</FormDescription>
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
                              <SelectTrigger data-testid="select-type">
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
                              value={field.value || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseFloat(val) || undefined);
                              }}
                              data-testid="input-price"
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
                          <Input {...field} placeholder="Bahnhofstrasse 123" data-testid="input-address" />
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
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-canton">
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
                              <SelectTrigger data-testid="select-city">
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
                            <Input {...field} placeholder="8001" maxLength={4} data-testid="input-postal" />
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
                              value={field.value || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseFloat(val) || undefined);
                              }}
                              data-testid="input-rooms"
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
                              value={field.value || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val) || undefined);
                              }}
                              data-testid="input-bathrooms"
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
                              value={field.value || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val) || undefined);
                              }}
                              data-testid="input-surface"
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
                          <Input {...field} type="date" data-testid="input-available" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Property Photos</label>
                    <div className="border-2 border-dashed rounded-md p-8 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </label>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border-2 border-border group">
                          <img
                            src={URL.createObjectURL(selectedFiles[currentImageIndex])}
                            alt={`Preview ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Bouton de suppression */}
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => {
                              removeFile(currentImageIndex);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>

                          {/* Compteur d'images */}
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium z-10">
                            {currentImageIndex + 1} / {selectedFiles.length}
                          </div>

                          {/* Flèche gauche */}
                          {selectedFiles.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-lg"
                              onClick={() => {
                                setCurrentImageIndex((prev) => 
                                  prev === 0 ? selectedFiles.length - 1 : prev - 1
                                );
                              }}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </Button>
                          )}

                          {/* Flèche droite */}
                          {selectedFiles.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-lg"
                              onClick={() => {
                                setCurrentImageIndex((prev) => 
                                  prev === selectedFiles.length - 1 ? 0 : prev + 1
                                );
                              }}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </Button>
                          )}
                        </div>

                        {/* Indicateurs de points (optionnel) */}
                        {selectedFiles.length > 1 && (
                          <div className="flex justify-center gap-2 mt-3">
                            {selectedFiles.map((_, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentImageIndex(index)}
                                className={`h-2 rounded-full transition-all ${
                                  currentImageIndex === index
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={createPropertyMutation.isPending || (kycStatus && !kycStatus.is_verified && !kycStatus.kyc_verified)}
                      className="flex-1"
                      data-testid="button-submit"
                    >
                      {createPropertyMutation.isPending ? 'Creating...' : 'Create Property'}
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
