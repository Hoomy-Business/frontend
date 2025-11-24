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

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t, getCantonName, getCityName } = useLanguage();
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
      image: '../src/assets/images/zurich.webp'
    },
    { 
      name: 'Genève', 
      code: 'GE', 
      image: '../src/assets/images/geneva.webp'
    },
    { 
      name: 'Lausanne', 
      code: 'VD', 
      image: '../src/assets/images/lausanne.webp'
    },
    { 
      name: 'Berne', 
      code: 'BE', 
      image: '../src/assets/images/bern.webp'
    },
    { 
      name: 'Bâle', 
      code: 'BS', 
      image: '../src/assets/images/basel.webp'
    },
    { 
      name: 'Lugano', 
      code: 'TI', 
      image: '../src/assets/images/lugano.webp'
    },
  ], []);

  return (
    <MainLayout>
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=1920&h=1080&fit=crop&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {t('landing.hero.subtitle')}
            </p>

            <Card className="bg-background/95 backdrop-blur border-2 shadow-2xl">
              <CardContent className="p-6">
                <div className="mb-4 text-center">
                  <Badge variant="secondary" className="mb-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recherche rapide
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Trouvez votre logement étudiant en quelques clics
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Canton</label>
                    <Select value={selectedCanton} onValueChange={setSelectedCanton}>
                      <SelectTrigger data-testid="select-canton" className="h-12">
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
                    <label className="text-xs text-muted-foreground mb-1 block">Budget maximum</label>
                    <Input 
                      type="number"
                      placeholder={t('landing.search.budget')}
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      data-testid="input-budget"
                      className="h-12"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleSearch} 
                      size="lg" 
                      className="w-full h-12"
                      data-testid="button-search"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {t('landing.search.button')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.cities.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('landing.cities.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{getCityName(city.name)}</h3>
                      <p className="text-sm text-white/90 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        Canton {city.code}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.how.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('landing.how.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover-elevate transition-all border-2 hover:border-primary/50">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 relative">
                  <Search className="h-8 w-8" />
                  <Badge variant="default" className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs">
                    1
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.how.step1.title')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.how.step1.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all border-2 hover:border-primary/50">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 relative">
                  <Shield className="h-8 w-8" />
                  <Badge variant="default" className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs">
                    2
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.how.step2.title')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.how.step2.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate transition-all border-2 hover:border-primary/50">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 relative">
                  <CreditCard className="h-8 w-8" />
                  <Badge variant="default" className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs">
                    3
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landing.how.step3.title')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.how.step3.desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.why.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="flex flex-col items-center text-center hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <Shield className="h-7 w-7" />
                </div>
                <h3 className="font-semibold mb-2">{t('landing.why.verified')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.why.verified.desc')}</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <CreditCard className="h-7 w-7" />
                </div>
                <h3 className="font-semibold mb-2">{t('landing.why.secure')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.why.secure.desc')}</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <MapPin className="h-7 w-7" />
                </div>
                <h3 className="font-semibold mb-2">{t('landing.why.locations')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.why.locations.desc')}</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="font-semibold mb-2">{t('landing.why.student')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.why.student.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.cta.title')}</h2>
              <p className="text-lg mb-6 text-primary-foreground/90">
                {t('landing.cta.subtitle')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register?role=student">
                  <Button size="lg" variant="secondary" data-testid="button-student-signup">
                    {t('landing.cta.student')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/register?role=owner">
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-owner-signup">
                    {t('landing.cta.owner')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
