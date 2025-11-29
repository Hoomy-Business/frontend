import { memo, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, MessageSquare, User, LogOut, FileText, Shield, Building2 } from 'lucide-react';
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
import { useAuth } from '@/lib/auth';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/useLanguage';
import { normalizeImageUrl } from '@/lib/imageUtils';
import { formatUserDisplayName, getUserProfilePicture, getUserInitials, isUserDeleted } from '@/lib/userUtils';

export const MainLayout = memo(function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isAuthenticated, isStudent, isOwner } = useAuth();
  const { t } = useLanguage();

  // Memoize computed values
  const profilePicture = useMemo(() => 
    user ? getUserProfilePicture(user) : null, 
    [user]
  );
  const normalizedProfilePicture = useMemo(() => 
    profilePicture ? normalizeImageUrl(profilePicture) : undefined, 
    [profilePicture]
  );
  const userInitials = useMemo(() => 
    user ? getUserInitials(user) : '', 
    [user]
  );
  const userDisplayName = useMemo(() => 
    user ? formatUserDisplayName(user) : '', 
    [user]
  );
  const userEmail = useMemo(() => 
    user ? (isUserDeleted(user) ? 'Compte supprimé' : user.email) : '', 
    [user]
  );

  // Memoize location checks
  const isPropertiesPage = useMemo(() => location === '/properties', [location]);
  const isStudentDashboard = useMemo(() => location.startsWith('/dashboard/student'), [location]);
  const isOwnerDashboard = useMemo(() => location.startsWith('/dashboard/owner'), [location]);
  const isAdminDashboard = useMemo(() => location.startsWith('/admin/dashboard'), [location]);
  const isMessagesPage = useMemo(() => location === '/messages', [location]);
  const isUserAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  // Memoize handlers
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Utiliser la fonction helper pour gérer les utilisateurs supprimés

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-8">
              <Link href="/" data-testid="link-home">
                <div className="hover-elevate px-1.5 sm:px-2 py-1 rounded-md cursor-pointer active:scale-95 transition-transform duration-100">
                  <Logo />
                </div>
              </Link>

              <nav className="hidden md:flex gap-4 lg:gap-6">
                <Link href="/properties" data-testid="link-properties">
                  <Button 
                    variant="ghost" 
                    className={isPropertiesPage ? 'bg-accent' : ''}
                    data-testid="button-browse"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t('nav.properties')}
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <LanguageSelector />
              {isAuthenticated && user ? (
                <>
                  {isStudent && (
                    <Link href="/dashboard/student" data-testid="link-dashboard-student">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className={`${isStudentDashboard ? 'bg-accent' : ''} hidden sm:flex active:scale-95 transition-transform duration-100`}
                      >
                        <User className="h-4 w-4 mr-1.5 sm:mr-2" />
                        <span className="hidden lg:inline">{t('nav.dashboard')}</span>
                      </Button>
                    </Link>
                  )}
                  
                  {isOwner && (
                    <Link href="/dashboard/owner" data-testid="link-dashboard-owner">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className={`${isOwnerDashboard ? 'bg-accent' : ''} hidden sm:flex active:scale-95 transition-transform duration-100`}
                      >
                        <Building2 className="h-4 w-4 mr-1.5 sm:mr-2" />
                        <span className="hidden lg:inline">{t('nav.dashboard')}</span>
                      </Button>
                    </Link>
                  )}

                  {isUserAdmin && (
                    <Link href="/admin/dashboard" data-testid="link-dashboard-admin">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className={`${isAdminDashboard ? 'bg-accent' : ''} hidden sm:flex active:scale-95 transition-transform duration-100 border-primary/20`}
                      >
                        <Shield className="h-4 w-4 mr-1.5 sm:mr-2" />
                        <span className="hidden lg:inline">Admin</span>
                      </Button>
                    </Link>
                  )}

                  <Link href="/messages" data-testid="link-messages">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`${isMessagesPage ? 'bg-accent' : ''} h-9 w-9 sm:h-10 sm:w-10 active:scale-95 transition-transform duration-100`}
                    >
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={normalizedProfilePicture} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium">{userDisplayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      {isStudent && (
                        <Link href="/dashboard/student" data-testid="link-dashboard-student-mobile">
                          <DropdownMenuItem className="cursor-pointer">
                            <User className="h-4 w-4 mr-2" />
                            {t('nav.dashboard')}
                          </DropdownMenuItem>
                        </Link>
                      )}
                      {isOwner && (
                        <>
                          <Link href="/dashboard/owner" data-testid="link-dashboard-owner-mobile">
                            <DropdownMenuItem className="cursor-pointer">
                              <Building2 className="h-4 w-4 mr-2" />
                              {t('nav.dashboard')}
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
                      {isUserAdmin && (
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
                      <DropdownMenuItem 
                        onClick={handleLogout} 
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
                <div className="flex gap-2">
                  <Link href="/login" data-testid="link-login">
                    <Button variant="ghost">{t('nav.login')}</Button>
                  </Link>
                  <Link href="/register" data-testid="link-register">
                    <Button variant="default">{t('nav.register')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

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
});
