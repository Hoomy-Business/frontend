import { Link, useLocation } from 'wouter';
import { Search, MessageSquare, User, LogOut, Shield, Building2, Heart, Inbox, FileText, AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/useLanguage';
import { normalizeImageUrl } from '@/lib/imageUtils';
import { formatUserDisplayName, getUserProfilePicture, getUserInitials, isUserDeleted } from '@/lib/userUtils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { KYCStatus, StripeAccountStatus } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isAuthenticated, isStudent, isOwner } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Query KYC status for all authenticated users
  const { data: kycStatus } = useQuery<KYCStatus>({
    queryKey: ['/kyc/status'],
    queryFn: async () => {
      return apiRequest<KYCStatus>('GET', '/kyc/status');
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
  });

  // Query Stripe status for owners only
  const { data: stripeStatus } = useQuery<StripeAccountStatus>({
    queryKey: ['/contracts/connect/account-status'],
    queryFn: async () => {
      return apiRequest<StripeAccountStatus>('GET', '/contracts/connect/account-status');
    },
    enabled: isAuthenticated && isOwner,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  // Stripe setup mutations
  const createAccountMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; account_id?: string; requires_account_creation?: boolean }>('POST', '/contracts/connect/create-account'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts/connect/account-status'] });
    },
  });

  const createOnboardingLinkMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; url: string; requires_account_creation?: boolean }>('POST', '/contracts/connect/create-onboarding-link'),
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      if (error?.requires_account_creation) {
        toast({
          title: 'Account Required',
          description: 'Please create a Stripe account first.',
          variant: 'destructive',
        });
      }
    },
  });

  const handleStripeSetup = async () => {
    try {
      if (!stripeStatus?.has_account) {
        await createAccountMutation.mutateAsync();
      }
      createOnboardingLinkMutation.mutate();
    } catch (error) {
      console.error('Stripe setup error:', error);
    }
  };

  // Check if KYC is not approved
  const kycNotApproved = kycStatus && kycStatus.status !== 'approved';
  
  // Check if Stripe is not configured (only show if KYC is approved)
  const stripeNotConfigured = isOwner && kycStatus?.status === 'approved' && stripeStatus && !stripeStatus.onboarding_complete;

  // Utiliser la fonction helper pour gérer les utilisateurs supprimés

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 min-w-0 flex-1">
              <Link href="/" data-testid="link-home" className="flex-shrink-0">
                <div className="hover-elevate px-1 sm:px-1.5 md:px-2 py-1 rounded-md cursor-pointer active:scale-95 transition-transform duration-100">
                  <Logo />
                </div>
              </Link>

              <nav className="hidden sm:flex gap-2 md:gap-4 lg:gap-6">
                <Link href="/properties" data-testid="link-properties">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`${location === '/properties' ? 'bg-accent' : ''} h-8 sm:h-9 md:h-10`}
                    data-testid="button-browse"
                  >
                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden md:inline">{t('nav.properties')}</span>
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 flex-shrink-0">
              <LanguageSelector />
              {isAuthenticated && user ? (
                <>
                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard" data-testid="link-dashboard-admin">
                      <Button 
                        variant="ghost"
                        size="icon"
                        className={`${location.startsWith('/admin/dashboard') ? 'bg-accent' : ''} hidden md:flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 active:scale-95 transition-transform duration-100 border-primary/20`}
                        title="Admin"
                      >
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      </Button>
                    </Link>
                  )}

                  {/* Navigation icons for students - progressively show on larger screens */}
                  {isStudent && (
                    <>
                      <Link href="/favorites" data-testid="link-favorites">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={`${location === '/favorites' ? 'bg-accent' : ''} hidden md:flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 active:scale-95 transition-transform duration-100`}
                          title={t('dashboard.student.favorites')}
                        >
                          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        </Button>
                      </Link>
                      <Link href="/requests" data-testid="link-requests">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={`${location === '/requests' ? 'bg-accent' : ''} hidden lg:flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 active:scale-95 transition-transform duration-100`}
                          title={t('dashboard.student.requests')}
                        >
                          <Inbox className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        </Button>
                      </Link>
                    </>
                  )}

                  {/* Navigation icons for owners - progressively show on larger screens */}
                  {isOwner && (
                    <>
                      <Link href="/my-properties" data-testid="link-my-properties">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={`${location === '/my-properties' ? 'bg-accent' : ''} hidden md:flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 active:scale-95 transition-transform duration-100`}
                          title={t('dashboard.properties')}
                        >
                          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        </Button>
                      </Link>
                      <Link href="/requests" data-testid="link-requests">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={`${location === '/requests' ? 'bg-accent' : ''} hidden lg:flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 active:scale-95 transition-transform duration-100`}
                          title={t('dashboard.requests')}
                        >
                          <Inbox className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        </Button>
                      </Link>
                    </>
                  )}

                  {/* Common navigation icons - messages always visible, others progressively */}
                  <Link href="/messages" data-testid="link-messages">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`${location === '/messages' ? 'bg-accent' : ''} h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 active:scale-95 transition-transform duration-100`}
                      title={t('dashboard.messages')}
                    >
                      <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </Button>
                  </Link>
                  <Link href="/contracts" data-testid="link-contracts">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`${location === '/contracts' ? 'bg-accent' : ''} hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 active:scale-95 transition-transform duration-100`}
                      title={t('dashboard.contracts')}
                    >
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </Button>
                  </Link>
                  <Link href="/profile" data-testid="link-profile-header">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`${location === '/profile' ? 'bg-accent' : ''} hidden md:flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 active:scale-95 transition-transform duration-100`}
                      title={t('dashboard.profile.title')}
                    >
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0" data-testid="button-user-menu">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
                          <AvatarImage src={getUserProfilePicture(user) ? normalizeImageUrl(getUserProfilePicture(user)!) : undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium">{formatUserDisplayName(user)}</p>
                        <p className="text-xs text-muted-foreground">
                          {isUserDeleted(user) ? 'Compte supprimé' : user.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      {isStudent && (
                        <>
                          <Link href="/favorites" data-testid="link-favorites-mobile">
                            <DropdownMenuItem className="cursor-pointer">
                              <Heart className="h-4 w-4 mr-2" />
                              {t('dashboard.student.favorites')}
                            </DropdownMenuItem>
                          </Link>
                          <Link href="/requests" data-testid="link-requests-mobile">
                            <DropdownMenuItem className="cursor-pointer">
                              <Inbox className="h-4 w-4 mr-2" />
                              {t('dashboard.student.requests')}
                            </DropdownMenuItem>
                          </Link>
                        </>
                      )}
                      {isOwner && (
                        <>
                          <Link href="/my-properties" data-testid="link-my-properties-mobile">
                            <DropdownMenuItem className="cursor-pointer">
                              <Building2 className="h-4 w-4 mr-2" />
                              {t('dashboard.properties')}
                            </DropdownMenuItem>
                          </Link>
                          <Link href="/requests" data-testid="link-requests-mobile">
                            <DropdownMenuItem className="cursor-pointer">
                              <Inbox className="h-4 w-4 mr-2" />
                              {t('dashboard.requests')}
                            </DropdownMenuItem>
                          </Link>
                          <Link href="/properties/create" data-testid="link-create-property">
                            <DropdownMenuItem className="cursor-pointer">
                              <Building2 className="h-4 w-4 mr-2" />
                              {t('dashboard.properties.add')}
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <Link href="/messages" data-testid="link-messages-mobile">
                        <DropdownMenuItem className="cursor-pointer">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {t('dashboard.messages')}
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/contracts" data-testid="link-contracts-mobile">
                        <DropdownMenuItem className="cursor-pointer">
                          <FileText className="h-4 w-4 mr-2" />
                          {t('dashboard.contracts')}
                        </DropdownMenuItem>
                      </Link>
                      {user.role === 'admin' && (
                        <>
                          <Link href="/admin/dashboard" data-testid="link-dashboard-admin-mobile">
                            <DropdownMenuItem className="cursor-pointer">
                              <Shield className="h-4 w-4 mr-2" />
                              {t('nav.admin')}
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <Link href="/profile" data-testid="link-profile">
                        <DropdownMenuItem className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          {t('dashboard.profile.title')}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={logout} 
                        className="cursor-pointer text-destructive focus:text-destructive"
                        data-testid="button-logout"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('nav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link href="/login" data-testid="link-login">
                    <Button variant="ghost" size="sm" className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/register" data-testid="link-register">
                    <Button variant="default" size="sm" className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                      {t('nav.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* KYC and Stripe Alerts */}
      {isAuthenticated && (
        <>
          {kycNotApproved && (
            <div className="w-full border-b border-yellow-500/20 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
                <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <strong className="font-semibold">Vérification KYC requise</strong>
                        <p className="text-sm mt-1">
                          {kycStatus?.status === 'pending' 
                            ? 'Votre vérification KYC est en cours de traitement. Vous serez notifié une fois approuvée.'
                            : kycStatus?.status === 'rejected'
                            ? `Votre vérification KYC a été rejetée.${kycStatus.rejection_reason ? ` Raison: ${kycStatus.rejection_reason}` : ''} Veuillez soumettre une nouvelle vérification.`
                            : 'Vous devez compléter la vérification KYC pour accéder à toutes les fonctionnalités.'}
                        </p>
                      </div>
                      <Link href="/profile">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-yellow-600 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-200 dark:hover:bg-yellow-900/30 whitespace-nowrap"
                        >
                          Compléter la vérification
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {stripeNotConfigured && (
            <div className="w-full border-b border-orange-500/20 bg-orange-50 dark:bg-orange-900/20">
              <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
                <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                  <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
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
                        className="border-orange-600 text-orange-800 hover:bg-orange-100 dark:border-orange-400 dark:text-orange-200 dark:hover:bg-orange-900/30 whitespace-nowrap"
                      >
                        {createAccountMutation.isPending || createOnboardingLinkMutation.isPending 
                          ? 'Configuration...'
                          : 'Configurer Stripe'}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="mb-4">
                <Logo iconClassName="h-6 w-6" textClassName="text-xl" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('footer.tagline')}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.students.title')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/properties" className="hover:text-foreground">{t('footer.students.browse')}</Link></li>
                <li><Link href="/register?role=student" className="hover:text-foreground">{t('footer.students.signup')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.landlords.title')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register?role=owner" className="hover:text-foreground">{t('footer.landlords.list_property')}</Link></li>
                <li><Link href="/login" className="hover:text-foreground">{t('footer.landlords.login')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.company.title')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">{t('footer.company.about')}</Link></li>
                <li><Link href="/cgu#contact" className="hover:text-foreground">{t('footer.company.contact')}</Link></li>
                <li><Link href="/cgu" className="hover:text-foreground">{t('footer.company.terms')}</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">{t('footer.company.privacy')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
