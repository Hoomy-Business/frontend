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
  const [propertyCreatedWithoutPhotos, setPropertyCreatedWithoutPhotos] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
      charges: 0,
      rooms: undefined,
      bathrooms: undefined,
      surface_area: undefined,
      available_from: '',
    },
    // Préserver les valeurs même en cas d'erreur de validation
    shouldUnregister: false,
    shouldFocusError: true,
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: CreatePropertyInput & { photos?: string[]; image_urls?: string[] }) => {
      // Use image_urls if provided, otherwise fall back to photos
      const imageUrls = data.image_urls || data.photos || [];
      
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error('Au moins une image est requise');
      }
      
      // S'assurer que image_urls est un tableau de strings valides
      const validImageUrls = imageUrls
        .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
        .map(url => url.trim())
        .filter(url => {
          // Valider que l'URL est bien formée (commence par http:// ou https://)
          try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
          } catch {
            return false;
          }
        });
      
      if (validImageUrls.length === 0) {
        throw new Error('Aucune URL d\'image valide fournie. Veuillez réessayer de télécharger les images.');
      }
      
      // Logger pour débogage
      if (process.env.NODE_ENV === 'development') {
        console.log('📸 URLs d\'images valides:', validImageUrls);
        console.log('📊 Nombre d\'images:', validImageUrls.length);
      }
      
      // Créer un payload propre avec uniquement les champs attendus
      // IMPORTANT: Ne pas inclure de valeurs null ou undefined pour éviter les problèmes de sérialisation
      const payload: Record<string, any> = {
        title: String(data.title || '').trim(),
        description: String(data.description || '').trim(),
        property_type: String(data.property_type || 'apartment'),
        address: String(data.address || '').trim(),
        city_name: String(data.city_name || '').trim(),
        postal_code: String(data.postal_code || '').trim(),
        canton_code: String(data.canton_code || '').trim(),
        price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
        image_urls: validImageUrls // Tableau de strings valides
      };
      
      // Ajouter les champs optionnels seulement s'ils sont définis et valides
      if (data.rooms !== undefined && data.rooms !== null) {
        const roomsValue = typeof data.rooms === 'number' ? data.rooms : Number(data.rooms);
        if (!isNaN(roomsValue) && roomsValue > 0) {
          payload.rooms = roomsValue;
        }
      }
      if (data.bathrooms !== undefined && data.bathrooms !== null) {
        const bathroomsValue = typeof data.bathrooms === 'number' ? data.bathrooms : Number(data.bathrooms);
        if (!isNaN(bathroomsValue) && bathroomsValue > 0) {
          payload.bathrooms = bathroomsValue;
        }
      }
      if (data.surface_area !== undefined && data.surface_area !== null) {
        const surfaceValue = typeof data.surface_area === 'number' ? data.surface_area : Number(data.surface_area);
        if (!isNaN(surfaceValue) && surfaceValue > 0) {
          payload.surface_area = surfaceValue;
        }
      }
      // Les charges sont obligatoires, toujours les inclure
      const chargesValue = typeof data.charges === 'number' ? data.charges : Number(data.charges) || 0;
      payload.charges = chargesValue;
      
      // Valider et nettoyer la date available_from - ne l'envoyer que si elle est valide
      if (data.available_from && typeof data.available_from === 'string' && data.available_from.trim() !== '') {
        const date = new Date(data.available_from);
        // Vérifier que la date est valide et pas une date invalide comme "01-01-0001"
        const minValidDate = new Date('1900-01-01');
        if (!isNaN(date.getTime()) && date >= minValidDate) {
          // Formater la date en YYYY-MM-DD pour être sûr
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          payload.available_from = `${year}-${month}-${day}`;
        }
        // Si la date est invalide, ne pas l'ajouter au payload (ne pas envoyer null)
      }
      
      // S'assurer qu'il n'y a pas de valeurs null ou undefined dans le payload
      // qui pourraient causer des problèmes de sérialisation JSON
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      // Log du payload pour débogage
      console.log('📦 Payload préparé pour la création de propriété:');
      console.log('- Titre:', payload.title);
      console.log('- Type:', payload.property_type);
      console.log('- Adresse:', payload.address);
      console.log('- Prix:', payload.price);
      console.log('- Nombre d\'images:', payload.image_urls?.length || 0);
      console.log('- URLs d\'images:', payload.image_urls);
      console.log('- Champs optionnels:', {
        rooms: payload.rooms,
        bathrooms: payload.bathrooms,
        surface_area: payload.surface_area,
        available_from: payload.available_from
      });
      
      // Valider qu'il n'y a pas de valeurs booléennes inattendues
      const hasBooleanValues = Object.values(payload).some(value => typeof value === 'boolean');
      if (hasBooleanValues) {
        console.warn('⚠️ ATTENTION: Le payload contient des valeurs booléennes:', 
          Object.entries(payload).filter(([_, v]) => typeof v === 'boolean')
        );
      }
      
      // Valider que image_urls est bien un tableau de strings
      if (!Array.isArray(payload.image_urls)) {
        throw new Error('image_urls doit être un tableau de strings');
      }
      
      if (payload.image_urls.some((url: any) => typeof url !== 'string')) {
        throw new Error('Toutes les URLs d\'images doivent être des strings');
      }
      
      // Sending property creation request
      try {
        const response = await apiRequest<any>('POST', '/properties', payload);
        
        // Vérifier que la réponse contient bien la propriété créée et que les images sont associées
        if (response && response.id) {
          // Vérifier si la propriété a des images dans la réponse
          const hasPhotos = response.photos && Array.isArray(response.photos) && response.photos.length > 0;
          const hasImageUrls = response.image_urls && Array.isArray(response.image_urls) && response.image_urls.length > 0;
          
          if (hasPhotos || hasImageUrls) {
            // Les images sont présentes dans la réponse - succès complet
            console.log('✅ Propriété créée avec succès avec', hasPhotos ? response.photos.length : response.image_urls.length, 'image(s)');
            return response;
          } else {
            // La propriété a été créée mais sans images dans la réponse - problème potentiel
            console.warn('⚠️ Propriété créée mais réponse sans images. On considère quand même comme succès car le serveur a pu créer les images de manière asynchrone.');
            // Note: On retourne quand même la réponse car le serveur pourrait avoir créé les images
            // même si elles ne sont pas dans la réponse immédiate
            return response;
          }
        }
        
        return response;
      } catch (error) {
        // Si une erreur se produit, la propager
        console.error('❌ Erreur lors de la création de la propriété:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      // Vérifier que la réponse est valide
      if (response && response.id) {
        // La propriété a été créée avec succès
        console.log('✅ Succès - Redirection vers le dashboard');
        setLocation('/dashboard/owner');
      } else {
        // Réponse invalide - ne pas rediriger
        console.error('❌ Réponse invalide du serveur:', response);
        setError('La propriété a été créée mais la réponse du serveur est invalide. Vérifiez votre tableau de bord.');
        setPropertyCreatedWithoutPhotos(true);
      }
    },
    onError: (err: Error) => {
      // Améliorer le message d'erreur pour les erreurs de base de données
      let errorMessage = err.message || 'Failed to create property';
      let propertyCreated = false;
      
      // Détecter différents cas où la propriété pourrait avoir été créée sans images
      const errorLower = errorMessage.toLowerCase();
      
      // Cas 1: Erreur property_id boolean (erreur connue)
      if (errorLower.includes('property_id') && (errorLower.includes('boolean') || errorLower.includes('bool'))) {
        propertyCreated = true;
        errorMessage = '⚠️ Erreur lors de l\'ajout des photos\n\nLa propriété a probablement été créée mais les photos n\'ont pas pu être ajoutées en raison d\'une erreur côté serveur.\n\nCette erreur indique un problème dans le backend lors de l\'insertion des photos dans la base de données. La propriété existe probablement mais sans photos.\n\nVérifiez votre tableau de bord - votre annonce est peut-être déjà visible. Si c\'est le cas, vous pourrez ajouter les photos depuis la page d\'édition.\n\nSi la propriété n\'apparaît pas, veuillez réessayer de créer l\'annonce.';
        setPropertyCreatedWithoutPhotos(true);
        console.error('❌ ERREUR BACKEND property_id:', err.message);
        console.error('⚠️  Cette erreur indique que le serveur essaie d\'insérer un booléen dans la colonne property_id (bigint)');
        console.error('📋 La propriété a probablement été créée malgré l\'erreur - vérifiez le dashboard');
        console.error('🔧 Cette erreur nécessite une correction côté backend dans la logique d\'insertion des photos');
      } 
      // Cas 2: Erreur lors de l'insertion des photos mais propriété créée
      else if (errorLower.includes('photo') || errorLower.includes('image') || errorLower.includes('picture')) {
        // Si l'erreur concerne les photos/images, la propriété a peut-être été créée
        if (errorLower.includes('insert') || errorLower.includes('save') || errorLower.includes('create') || errorLower.includes('upload')) {
          propertyCreated = true;
          errorMessage = '⚠️ Problème avec les photos\n\nLa propriété a probablement été créée mais les photos n\'ont pas pu être ajoutées. Vérifiez votre tableau de bord et ajoutez les photos depuis la page d\'édition si nécessaire.\n\nSi la propriété n\'apparaît pas dans votre tableau de bord, veuillez réessayer de créer l\'annonce.';
          setPropertyCreatedWithoutPhotos(true);
        }
      }
      // Cas 3: Erreur générale mais la réponse pourrait indiquer un succès partiel
      else if (errorLower.includes('erreur création annonce') || errorLower.includes('error creating property')) {
        // Extraire le message d'erreur plus détaillé si disponible
        const detailedError = errorMessage.match(/(?:Erreur création annonce|error creating property):\s*(.+)/i);
        if (detailedError && detailedError[1]) {
          console.error('❌ Erreur détaillée:', detailedError[1]);
          const detailLower = detailedError[1].toLowerCase();
          if (detailLower.includes('property_id') || detailLower.includes('photo') || detailLower.includes('image')) {
            propertyCreated = true;
            errorMessage = '⚠️ Problème avec les photos\n\nLa propriété a probablement été créée mais les photos n\'ont pas pu être ajoutées. Vérifiez votre tableau de bord.\n\nSi la propriété n\'apparaît pas dans votre tableau de bord, veuillez réessayer de créer l\'annonce.';
            setPropertyCreatedWithoutPhotos(true);
          }
        }
      }
      // Cas 4: Erreur de validation numérique
      else if (errorLower.includes('out of range') || errorLower.includes('numeric value out of range')) {
        errorMessage = 'Une valeur numérique est hors limite. Veuillez vérifier vos données.';
      }
      // Cas 5: Erreur de connexion ou timeout
      else if (errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('fetch') || errorLower.includes('failed to fetch')) {
        errorMessage = '⚠️ Erreur de connexion\n\nUne erreur de connexion s\'est produite. La propriété pourrait avoir été créée. Vérifiez votre tableau de bord.\n\nSi la propriété n\'apparaît pas, veuillez réessayer.';
        propertyCreated = true;
        setPropertyCreatedWithoutPhotos(true);
      }
      // Cas 6: Erreur générale non reconnue - considérer comme échec total
      else {
        // Pour toute autre erreur, on considère que la création a échoué
        errorMessage = `Erreur lors de la création de l'annonce : ${errorMessage}\n\nVeuillez vérifier vos données et réessayer. Si le problème persiste, contactez le support.`;
        propertyCreated = false;
      }
      
      setError(errorMessage);
      
      // Si la propriété a probablement été créée, suggérer de vérifier le dashboard
      if (propertyCreated) {
        console.log('💡 Astuce : Vérifiez votre dashboard pour voir si la propriété a été créée');
      }
    },
  });

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB en bytes

  // Fonction pour compresser une image
  const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionner si nécessaire
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Échec de la compression'));
                return;
              }
              // Créer un nouveau File avec le blob compressé
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setError(''); // Clear any previous errors
      
      try {
        const processedFiles: File[] = [];
        
        for (const file of files) {
          // Vérifier que c'est bien une image
          if (!file.type.startsWith('image/')) {
            setError(`Le fichier "${file.name}" n'est pas une image valide.`);
            return;
          }

          let fileToAdd = file;
          
          // Si le fichier est trop grand, essayer de le compresser
          if (file.size > MAX_FILE_SIZE) {
            try {
              fileToAdd = await compressImage(file);
              
              // Si après compression c'est encore trop grand, rejeter
              if (fileToAdd.size > MAX_FILE_SIZE) {
                const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
                setError(`L'image "${file.name}" est trop volumineuse même après compression (${(fileToAdd.size / (1024 * 1024)).toFixed(1)} MB). La taille maximale est de ${maxSizeMB} MB. Veuillez utiliser une image plus petite.`);
                return;
              }
            } catch (compressError) {
              const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
              setError(`Impossible de compresser "${file.name}". Veuillez réduire manuellement la taille de l'image (max ${maxSizeMB} MB).`);
              return;
            }
          }
          
          processedFiles.push(fileToAdd);
        }
        
        if (processedFiles.length > 0) {
          setSelectedFiles(prev => [...prev, ...processedFiles]);
        }
      } catch (error) {
        setError('Erreur lors du traitement des fichiers: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
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
    setPropertyCreatedWithoutPhotos(false);
    
    // Vérifier que les champs d'adresse sont remplis
    if (!data.address || !data.city_name || !data.postal_code || !data.canton_code) {
      setError('Veuillez remplir tous les champs d\'adresse (rue, canton, ville, code postal)');
      return;
    }
    
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
        setError('Échec du téléchargement des images. Aucune URL d\'image n\'a été retournée. Veuillez réessayer.');
        console.error('❌ Aucune URL d\'image retournée après l\'upload');
        return;
      }
      
      // Valider que toutes les URLs sont valides
      const invalidUrls = imageUrls.filter(url => {
        try {
          const urlObj = new URL(url);
          return !(urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
        } catch {
          return true;
        }
      });
      
      if (invalidUrls.length > 0) {
        setError(`Certaines URLs d'images ne sont pas valides. Veuillez réessayer de télécharger les images.`);
        console.error('❌ URLs d\'images invalides:', invalidUrls);
        return;
      }
      
      console.log('✅ Images uploadées avec succès:', imageUrls.length, 'image(s)');
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

    // Validation supplémentaire du code postal
    if (data.postal_code && (!/^\d{4}$/.test(data.postal_code))) {
      setError('Le code postal doit contenir exactement 4 chiffres');
      return;
    }

    // Préparer les données avec les URLs d'images
    const submitData: CreatePropertyInput & { image_urls: string[] } = {
      ...data,
      image_urls: imageUrls
    };

    createPropertyMutation.mutate(submitData);
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
                <Alert 
                  variant={propertyCreatedWithoutPhotos ? "default" : "destructive"} 
                  className={`mb-4 ${propertyCreatedWithoutPhotos ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                >
                  <AlertDescription className={propertyCreatedWithoutPhotos ? 'text-yellow-800 dark:text-yellow-200' : ''}>
                    <div className="space-y-2">
                      <p className="font-semibold">{error.split('\n\n')[0]}</p>
                      {error.includes('\n\n') && (
                        <div className="mt-2 space-y-2">
                          <p>{error.split('\n\n')[1]}</p>
                          {propertyCreatedWithoutPhotos && (
                            <Link href="/dashboard/owner">
                              <Button variant="outline" size="sm" className="mt-2">
                                Vérifier mon tableau de bord
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {kycStatus && kycStatus.status !== 'approved' && (
                <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    <strong>Vérification KYC requise</strong>
                    <br />
                    Vous devez compléter la vérification KYC avant de pouvoir publier des annonces.
                    <br />
                    <Link href="/profile" className="underline font-medium mt-2 inline-block">
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
                        <FormDescription>Minimum 20 caractères avec plusieurs mots séparés par des espaces</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <div className="grid grid-cols-2 gap-4">
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

                    <FormField
                      control={form.control}
                      name="charges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Charges mensuelles (CHF)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              placeholder="200"
                              value={field.value || 0}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? 0 : parseFloat(val) || 0);
                              }}
                              data-testid="input-charges"
                              required
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Électricité, eau, chauffage, etc. (obligatoire)
                          </FormDescription>
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
                            data-testid="input-address"
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
                              // Réinitialiser seulement la ville car elle dépend du canton
                              form.setValue('city_name', '');
                              // Ne pas réinitialiser l'adresse - l'utilisateur peut avoir déjà saisi une adresse valide
                              // form.setValue('address', '');
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
                            <Input 
                              {...field} 
                              placeholder="8001" 
                              maxLength={4} 
                              data-testid="input-postal"
                              onChange={(e) => {
                                // N'accepter que les chiffres
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>Code postal suisse (4 chiffres)</FormDescription>
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
                          <Input 
                            {...field} 
                            type="date" 
                            data-testid="input-available"
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Valider que la date n'est pas invalide
                              if (value && value !== '') {
                                const date = new Date(value);
                                const minValidDate = new Date('1900-01-01');
                                if (isNaN(date.getTime()) || date < minValidDate) {
                                  // Réinitialiser si date invalide
                                  field.onChange('');
                                  return;
                                }
                              }
                              field.onChange(value);
                            }}
                          />
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

                    {selectedFiles.length > 0 && selectedFiles[currentImageIndex] && (
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
                              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white border-0 shadow-lg h-10 w-10 rounded-full transition-all hover:scale-110 active:scale-95 group-hover:bg-black/70"
                              onClick={() => {
                                setCurrentImageIndex((prev) => 
                                  prev === 0 ? selectedFiles.length - 1 : prev - 1
                                );
                              }}
                              aria-label="Image précédente"
                            >
                              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                            </Button>
                          )}

                          {/* Flèche droite */}
                          {selectedFiles.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white border-0 shadow-lg h-10 w-10 rounded-full transition-all hover:scale-110 active:scale-95 group-hover:bg-black/70"
                              onClick={() => {
                                setCurrentImageIndex((prev) => 
                                  prev === selectedFiles.length - 1 ? 0 : prev + 1
                                );
                              }}
                              aria-label="Image suivante"
                            >
                              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
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
                      disabled={createPropertyMutation.isPending || (kycStatus && kycStatus.status !== 'approved')}
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
