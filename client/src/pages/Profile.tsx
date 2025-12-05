import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { User, Camera, Phone, CheckCircle2, AlertTriangle, Mail, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest, uploadImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/useLanguage';
import { normalizeImageUrl } from '@/lib/imageUtils';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { PhoneVerificationDialog } from '@/components/PhoneVerificationDialog';
import { EmailVerificationDialog } from '@/components/EmailVerificationDialog';
import { EmailChangeDialog } from '@/components/EmailChangeDialog';
import { PhoneChangeDialog } from '@/components/PhoneChangeDialog';
import { KYCVerification } from '@/components/KYCVerification';
import type { StripeAccountStatus } from '@shared/schema';

export default function Profile() {
  const { user, isAuthenticated, refreshUser, isOwner } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [phoneChangeOpen, setPhoneChangeOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  // Query Stripe status for owners
  const { data: stripeStatus } = useQuery<StripeAccountStatus>({
    queryKey: ['/contracts/connect/account-status'],
    queryFn: async () => {
      try {
        return await apiRequest<StripeAccountStatus>('GET', '/contracts/connect/account-status');
      } catch (error: any) {
        // If user is not owner, API will return error - return null instead of throwing
        if (error?.status === 403 || error?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: false, // Don't retry if user is not owner (will get 403/404)
  });

  // Stripe setup mutations
  const createAccountMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; account_id?: string; requires_account_creation?: boolean }>('POST', '/contracts/connect/create-account'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts/connect/account-status'] });
      toast({
        title: 'Compte créé',
        description: 'Compte Stripe créé avec succès. Veuillez compléter le processus d\'onboarding.',
      });
    },
    onError: (error: any) => {
      toast({
        title: error?.message || 'Échec de la création du compte Stripe',
        description: error?.details || error?.message || 'Échec de la création du compte Stripe. Veuillez réessayer.',
        variant: 'destructive',
      });
    },
  });

  const createOnboardingLinkMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; url: string; requires_account_creation?: boolean }>('POST', '/contracts/connect/create-onboarding-link'),
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: 'Erreur',
          description: 'Aucune URL d\'onboarding reçue',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      if (error?.requires_account_creation) {
        toast({
          title: 'Compte requis',
          description: 'Veuillez d\'abord créer un compte Stripe.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Échec du lien d\'onboarding',
          description: error?.details || error?.message || 'Échec de la création du lien d\'onboarding. Veuillez réessayer.',
          variant: 'destructive',
        });
      }
    },
  });

  const handleStripeSetup = async () => {
    if (!isOwner) {
      toast({
        title: 'Action non autorisée',
        description: 'La configuration Stripe est uniquement disponible pour les propriétaires.',
        variant: 'destructive',
      });
      return;
    }
    try {
      if (!stripeStatus?.has_account) {
        await createAccountMutation.mutateAsync();
      }
      createOnboardingLinkMutation.mutate();
    } catch (error) {
      console.error('Stripe setup error:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
  }, [isAuthenticated, setLocation]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { first_name?: string; last_name?: string; email?: string; phone?: string; current_password?: string; new_password?: string; profile_picture?: string }) =>
      apiRequest('PUT', '/auth/profile', data),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['/auth/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/auth/user'] });
      await refreshUser();
      toast({ 
        title: 'Succès', 
        description: response.message || 'Profil mis à jour avec succès' 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      apiRequest('PUT', '/auth/profile', { ...data }),
    onSuccess: async (response) => {
      await refreshUser();
      toast({ 
        title: 'Succès', 
        description: response.message || 'Mot de passe modifié avec succès' 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Le fichier doit être une image',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.onerror = () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la lecture du fichier',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setUploadingPhoto(true);
    try {
      const croppedFile = new File([croppedImageBlob], 'profile-picture.png', {
        type: 'image/png',
        lastModified: Date.now(),
      });

      const result = await uploadImage(croppedFile);
      const imageUrl = result.url;
      
      await updateProfileMutation.mutateAsync({
        profile_picture: imageUrl,
      });
      
      toast({
        title: 'Succès',
        description: 'Photo de profil mise à jour',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
      setSelectedImageSrc(null);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <User className="h-7 w-7 text-primary" />
            {t('dashboard.profile.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.profile.desc')}
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('dashboard.profile.title')}</CardTitle>
            <CardDescription>{t('dashboard.profile.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profile_picture ? normalizeImageUrl(user.profile_picture) : undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="profile-picture-upload" className="cursor-pointer">
                  <Button variant="outline" asChild disabled={uploadingPhoto} className="w-full sm:w-auto whitespace-normal break-words">
                    <span className="flex items-center justify-center">
                      <Camera className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words text-center">{uploadingPhoto ? 'Upload en cours...' : 'Changer la photo de profil'}</span>
                    </span>
                  </Button>
                </Label>
                <Input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Formats acceptés: JPG, PNG, WEBP (max 10 MB)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.first_name')}</p>
                <p className="font-medium break-words">{user?.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.last_name')}</p>
                <p className="font-medium break-words">{user?.last_name}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.email')}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium break-all min-w-0 flex-1">{user?.email}</p>
                  <Badge variant={user?.email_verified ? 'default' : 'secondary'} className="gap-1 flex-shrink-0 whitespace-nowrap">
                    {user?.email_verified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Vérifié
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        Non vérifié
                      </>
                    )}
                  </Badge>
                </div>
                {!user?.email_verified && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full sm:w-auto whitespace-normal break-words"
                    onClick={() => setEmailVerificationOpen(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="break-words">Vérifier mon email</span>
                  </Button>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.phone')}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium break-words min-w-0 flex-1">{user?.phone || t('dashboard.phone.not_provided')}</p>
                  {user?.phone && (
                    <Badge variant={user?.phone_verified ? 'default' : 'secondary'} className="gap-1 flex-shrink-0 whitespace-nowrap">
                      {user?.phone_verified ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Vérifié
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          Non vérifié
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                {!user?.phone_verified && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full sm:w-auto whitespace-normal break-words"
                    onClick={() => setPhoneVerificationOpen(true)}
                  >
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="break-words">{user?.phone ? 'Vérifier mon numéro' : 'Ajouter un numéro'}</span>
                  </Button>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('dashboard.profile.account_type')}</p>
                <Badge className="whitespace-nowrap">{user?.role}</Badge>
              </div>
            </div>

            <Separator />

            <ProfileEditForm 
              user={user}
              updateProfileMutation={updateProfileMutation}
              changePasswordMutation={changePasswordMutation}
              onPhotoUpload={handlePhotoUpload}
              onEmailChange={() => setEmailChangeOpen(true)}
              onPhoneChange={() => setPhoneChangeOpen(true)}
            />

            <Separator />

            {/* KYC Verification Section */}
            <KYCVerification />

            {/* Stripe Configuration Section */}
            <Separator />
            <StripeConfiguration 
              stripeStatus={stripeStatus}
              onSetup={handleStripeSetup}
              isLoading={createAccountMutation.isPending || createOnboardingLinkMutation.isPending}
              isOwner={isOwner}
            />
          </CardContent>
        </Card>

        {/* Yellow Warning Alert for Stripe Configuration */}
        {isOwner && stripeStatus && !stripeStatus.onboarding_complete && (
          <Alert className="mt-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <strong className="font-semibold">Configuration Stripe requise</strong>
                  <p className="text-sm mt-1">
                    Vous devez configurer votre compte Stripe pour recevoir les paiements de location.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleStripeSetup}
                  disabled={createAccountMutation.isPending || createOnboardingLinkMutation.isPending}
                  className="border-yellow-600 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-200 dark:hover:bg-yellow-900/30 whitespace-nowrap"
                >
                  {createAccountMutation.isPending || createOnboardingLinkMutation.isPending 
                    ? 'Configuration...'
                    : 'Configurer Stripe'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Image Crop Dialog */}
        {selectedImageSrc && (
          <ImageCropDialog
            open={cropDialogOpen}
            onClose={() => {
              setCropDialogOpen(false);
              setSelectedImageSrc(null);
            }}
            imageSrc={selectedImageSrc}
            onCropComplete={handleCropComplete}
            aspectRatio={1}
            circularCrop={true}
          />
        )}
        
        {/* Phone Verification Dialog */}
        <PhoneVerificationDialog
          open={phoneVerificationOpen}
          onClose={() => setPhoneVerificationOpen(false)}
          onSuccess={() => refreshUser()}
          currentPhone={user?.phone}
        />
        
        <EmailVerificationDialog
          open={emailVerificationOpen}
          onClose={() => setEmailVerificationOpen(false)}
          onSuccess={() => refreshUser()}
          currentEmail={user?.email}
        />
        
        <EmailChangeDialog
          open={emailChangeOpen}
          onClose={() => setEmailChangeOpen(false)}
          onSuccess={() => refreshUser()}
          currentEmail={user?.email}
        />
        
        <PhoneChangeDialog
          open={phoneChangeOpen}
          onClose={() => setPhoneChangeOpen(false)}
          onSuccess={() => refreshUser()}
          currentPhone={user?.phone}
        />
      </div>
    </MainLayout>
  );
}

function ProfileEditForm({ 
  user, 
  updateProfileMutation, 
  changePasswordMutation,
  onPhotoUpload,
  onEmailChange,
  onPhoneChange
}: { 
  user: any; 
  updateProfileMutation: any; 
  changePasswordMutation: any;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: () => void;
  onPhoneChange: () => void;
}) {
  const { t } = useLanguage();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    setProfileData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    });
  }, [user]);

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(profileData);
    setEditProfileOpen(false);
  };

  const handleChangePassword = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      return;
    }
    changePasswordMutation.mutate({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });
    setChangePasswordOpen(false);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-4">{t('dashboard.profile.settings')}</h3>
        <div className="flex flex-wrap gap-2">
          <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto whitespace-normal break-words">
                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="break-words">{t('dashboard.profile.edit')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('dashboard.profile.edit')}</DialogTitle>
                <DialogDescription>{t('dashboard.profile.edit.desc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="first_name">{t('dashboard.profile.first_name')}</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">{t('dashboard.profile.last_name')}</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditProfileOpen(false);
                        onEmailChange();
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Changer
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">{t('dashboard.profile.phone')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      value={user?.phone || ''}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditProfileOpen(false);
                        onPhoneChange();
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Changer
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditProfileOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? t('dashboard.profile.saving') : t('dashboard.profile.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto whitespace-normal break-words">
                <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="break-words">{t('dashboard.profile.change_password')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('dashboard.profile.change_password')}</DialogTitle>
                <DialogDescription>{t('dashboard.profile.change_password.desc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="current_password">{t('dashboard.profile.current_password')}</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new_password">{t('dashboard.profile.new_password')}</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm_password">{t('dashboard.profile.confirm_password')}</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  />
                  {passwordData.new_password && passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                    <p className="text-sm text-destructive mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>{t('common.cancel')}</Button>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={changePasswordMutation.isPending || passwordData.new_password !== passwordData.confirm_password}
                >
                  {changePasswordMutation.isPending ? t('dashboard.profile.changing') : t('dashboard.profile.change_password')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function StripeConfiguration({ 
  stripeStatus, 
  onSetup, 
  isLoading,
  isOwner
}: { 
  stripeStatus: StripeAccountStatus | undefined; 
  onSetup: () => void; 
  isLoading: boolean;
  isOwner: boolean;
}) {
  const { t } = useLanguage();
  const isConfigured = stripeStatus?.onboarding_complete;
  const hasAccount = stripeStatus?.has_account;

  // If not owner, show info message
  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuration Stripe</CardTitle>
              <CardDescription>
                Configuration Stripe disponible uniquement pour les propriétaires
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              Non applicable
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La configuration Stripe est uniquement disponible pour les comptes propriétaires. 
              Si vous souhaitez devenir propriétaire, veuillez créer un compte propriétaire.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Configuration Stripe</CardTitle>
            <CardDescription>
              Configurez votre compte Stripe pour recevoir les paiements de location
            </CardDescription>
          </div>
          {isConfigured ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Configuré
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Non configuré
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Votre compte Stripe est configuré et prêt à recevoir les paiements.
              {stripeStatus?.payouts_enabled && stripeStatus?.charges_enabled && (
                <span className="block mt-1 text-sm">
                  Les paiements et les virements sont activés.
                </span>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Configuration requise</strong>
                <p className="text-sm mt-1">
                  Vous devez configurer votre compte Stripe pour recevoir les paiements de location.
                </p>
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={onSetup}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? 'Configuration...' : hasAccount ? 'Compléter la configuration' : 'Configurer Stripe'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

