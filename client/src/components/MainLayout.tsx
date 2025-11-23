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

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isAuthenticated, isStudent, isOwner } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" data-testid="link-home">
                <div className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md cursor-pointer">
                  <Building2 className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">Hoomy</span>
                </div>
              </Link>

              <nav className="hidden md:flex gap-6">
                <Link href="/properties" data-testid="link-properties">
                  <Button 
                    variant="ghost" 
                    className={location === '/properties' ? 'bg-accent' : ''}
                    data-testid="button-browse"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  {isStudent && (
                    <Link href="/dashboard/student" data-testid="link-dashboard-student">
                      <Button 
                        variant="ghost"
                        className={location.startsWith('/dashboard/student') ? 'bg-accent' : ''}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  
                  {isOwner && (
                    <Link href="/dashboard/owner" data-testid="link-dashboard-owner">
                      <Button 
                        variant="ghost"
                        className={location.startsWith('/dashboard/owner') ? 'bg-accent' : ''}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}

                  <Link href="/messages" data-testid="link-messages">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={location === '/messages' ? 'bg-accent' : ''}
                    >
                      <MessageSquare className="h-5 w-5" />
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
                              Add Property
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
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" data-testid="link-login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register" data-testid="link-register">
                    <Button variant="default">Sign Up</Button>
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
                Find your perfect student home across Switzerland. Trusted by thousands of students and landlords.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/properties" className="hover:text-foreground">Browse Properties</Link></li>
                <li><Link href="/register?role=student" className="hover:text-foreground">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Landlords</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register?role=owner" className="hover:text-foreground">List Your Property</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Owner Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Hoomy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
