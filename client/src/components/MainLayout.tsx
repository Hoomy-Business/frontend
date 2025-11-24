import { Link, useLocation } from 'wouter';
import { Home, Search, MessageSquare, User, LogOut, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/useLanguage';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isAuthenticated, isStudent, isOwner } = useAuth();
  const { t } = useLanguage();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-8">
              <Link href="/" data-testid="link-home">
                <div className="flex items-center gap-1.5 sm:gap-2 hover-elevate px-1.5 sm:px-2 py-1 rounded-md cursor-pointer active:scale-95 transition-transform duration-100">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <span className="text-lg sm:text-xl font-bold">Hoomy</span>
                </div>
              </Link>

              <nav className="hidden md:flex gap-4 lg:gap-6">
                <Link href="/properties" data-testid="link-properties">
                  <Button 
                    variant="ghost" 
                    className={location === '/properties' ? 'bg-accent' : ''}
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
                        className={`${location.startsWith('/dashboard/student') ? 'bg-accent' : ''} hidden sm:flex active:scale-95 transition-transform duration-100`}
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
                        className={`${location.startsWith('/dashboard/owner') ? 'bg-accent' : ''} hidden sm:flex active:scale-95 transition-transform duration-100`}
                      >
                        <Building2 className="h-4 w-4 mr-1.5 sm:mr-2" />
                        <span className="hidden lg:inline">{t('nav.dashboard')}</span>
                      </Button>
                    </Link>
                  )}

                  <Link href="/messages" data-testid="link-messages">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`${location === '/messages' ? 'bg-accent' : ''} h-9 w-9 sm:h-10 sm:w-10 active:scale-95 transition-transform duration-100`}
                    >
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user.first_name, user.last_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {isOwner && (
                        <>
                          <Link href="/properties/create" data-testid="link-create-property">
                            <DropdownMenuItem className="cursor-pointer">
                              <Building2 className="h-4 w-4 mr-2" />
                              {t('dashboard.properties.add')}
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                        </>
                      )}
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
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Hoomy</span>
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
                <li><a href="#" className="hover:text-foreground">{t('footer.company.about')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('footer.company.contact')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('footer.company.terms')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('footer.company.privacy')}</a></li>
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
