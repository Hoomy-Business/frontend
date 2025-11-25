import { useState, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, MapPin, Shield, CreditCard, CheckCircle, ArrowRight, Sparkles, TrendingUp, Users, Home, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Canton } from '@shared/schema';
import { useLanguage } from '@/lib/useLanguage';
import { useAuth } from '@/lib/auth';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t, getCantonName, getCityName } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [selectedCanton, setSelectedCanton] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const { data: cantons } = useQuery<Canton[]>({
    queryKey: ['/locations/cantons'],
    queryFn: async () => {
      return apiRequest<Canton[]>('GET', '/locations/cantons');
    },
    staleTime: 1000 * 60 * 60, // 1 hour - cantons are very static
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });


  const handleSearch = useCallback(() => {
    let query = '/properties?';
    if (selectedCanton) query += `canton=${selectedCanton}&`;
    if (maxBudget) query += `max_price=${maxBudget}`;
    setLocation(query);
  }, [selectedCanton, maxBudget, setLocation]);

  const featuredCities = useMemo(() => [
    { 
      name: 'Zurich', 
      code: 'ZH', 
      image: '/images/zurich.webp'
    },
    { 
      name: 'Genève', 
      code: 'GE', 
      image: '/images/geneva.webp'
    },
    { 
      name: 'Lausanne', 
      code: 'VD', 
      image: '/images/lausanne.webp'
    },
    { 
      name: 'Berne', 
      code: 'BE', 
      image: '/images/bern.webp'
    },
    { 
      name: 'Bâle', 
      code: 'BS', 
      image: '/images/basel.webp'
    },
    { 
      name: 'Lugano', 
      code: 'TI', 
      image: '/images/lugano.webp'
    },
  ], []);

  const [videoError, setVideoError] = useState(false);

  return (
    <MainLayout>
      <div className="relative overflow-hidden min-h-screen sm:min-h-[600px] md:min-h-screen">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ minHeight: '100vh' }}
            onError={(e) => {
              console.error('Video loading error:', e);
              setVideoError(true);
            }}
            onLoadedMetadata={() => {
              // Vidéo chargée avec succès
              console.log('Video metadata loaded successfully');
            }}
          >
            <source src="/video/background.webm" type="video/webm" />
            <source src="/video/background.mp4" type="video/mp4" />
          </video>
        ) : (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
        )}
        <div 
          className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 to-black/60"
        />
        
        <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight px-2" data-testid="text-hero-title">
              {t('landing.hero.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-7 md:mb-8 text-white/90 px-3 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <Card className="bg-background/95 backdrop-blur border-2 shadow-2xl mx-2 sm:mx-0">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="mb-3 sm:mb-4 text-center">
                  <Badge variant="secondary" className="mb-2 text-xs sm:text-sm">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('landing.search.quick')}
                  </Badge>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('landing.search.quick.subtitle')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 sm:mb-2 block">{t('landing.search.canton.label')}</label>
                    <Select value={selectedCanton} onValueChange={setSelectedCanton}>
                      <SelectTrigger data-testid="select-canton" className="h-11 sm:h-12 text-base">
                        <SelectValue placeholder={t('landing.search.canton')} />
                      </SelectTrigger>
                      <SelectContent>
                        {cantons?.map((canton) => (
                          <SelectItem key={canton.code} value={canton.code}>
                            {getCantonName(canton)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 sm:mb-2 block">{t('landing.search.budget.label')}</label>
                    <Input 
                      type="number"
                      placeholder={t('landing.search.budget')}
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      data-testid="input-budget"
                      className="h-11 sm:h-12 text-base"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleSearch} 
                      size="lg" 
                      className="w-full h-11 sm:h-12 text-base sm:text-lg touch-manipulation"
                      data-testid="button-search"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t('landing.search.button')}</span>
                      <span className="sm:hidden">{t('landing.search.button')}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">{t('landing.cities.title')}</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-3">{t('landing.cities.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {featuredCities.map((city) => (
              <Link key={city.code} href={`/properties?canton=${city.code}`}>
                <Card className="overflow-hidden hover-elevate cursor-pointer" data-testid={`card-city-${city.code}`}>
                  <div className="relative aspect-[3/2]">
                    <img 
                      src={city.image} 
                      alt={getCityName(city.name)}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      // @ts-expect-error - fetchpriority is a valid HTML attribute but TypeScript types don't include it yet
                      fetchpriority="low"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 text-white">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{getCityName(city.name)}</h3>
                      <p className="text-xs sm:text-sm text-white/90 flex items-center gap-1 mt-0.5 sm:mt-1">
                        <MapPin className="h-3 w-3" />
                        {t('landing.cities.canton')} {city.code}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">{t('landing.how.title')}</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-3">{t('landing.how.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="text-center hover-elevate transition-all border-2 hover:border-primary/50">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4 relative">
                  <Search className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  <Badge variant="default" className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 flex items-center justify-center text-xs">
                    1
                  </Badge>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('landing.how.step1.title')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('landing.how.step1.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all border-2 hover:border-primary/50">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4 relative">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  <Badge variant="default" className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 flex items-center justify-center text-xs">
                    2
                  </Badge>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('landing.how.step2.title')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('landing.how.step2.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all border-2 hover:border-primary/50">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4 relative">
                  <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  <Badge variant="default" className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 flex items-center justify-center text-xs">
                    3
                  </Badge>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{t('landing.how.step3.title')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('landing.how.step3.desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">{t('landing.why.title')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
            <Card className="flex flex-col items-center text-center hover-elevate transition-all">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">{t('landing.why.verified')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('landing.why.verified.desc')}</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center hover-elevate transition-all">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                  <CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">{t('landing.why.secure')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('landing.why.secure.desc')}</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center hover-elevate transition-all">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                  <MapPin className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">{t('landing.why.locations')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('landing.why.locations.desc')}</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center hover-elevate transition-all">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">{t('landing.why.student')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('landing.why.student.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">{t('landing.cta.title')}</h2>
              <p className="text-sm sm:text-base md:text-lg mb-5 sm:mb-6 text-primary-foreground/90 px-3">
                {t('landing.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                <Link href="/register?role=student" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 touch-manipulation" data-testid="button-student-signup">
                    {t('landing.cta.student')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/register?role=owner" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 touch-manipulation" data-testid="button-owner-signup">
                    {t('landing.cta.owner')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      )}
    </MainLayout>
  );
}
