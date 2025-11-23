import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, MapPin, Shield, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/MainLayout';
import { useQuery } from '@tanstack/react-query';
import type { Canton } from '@shared/schema';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [selectedCanton, setSelectedCanton] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const { data: cantons } = useQuery<Canton[]>({
    queryKey: ['/locations/cantons'],
  });

  const featuredCities = [
    { name: 'Zurich', code: 'ZH', image: 'https://images.unsplash.com/photo-1563493407-17ca09d37e0b?w=600&h=400&fit=crop' },
    { name: 'Geneva', code: 'GE', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&h=400&fit=crop' },
    { name: 'Lausanne', code: 'VD', image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&h=400&fit=crop' },
    { name: 'Bern', code: 'BE', image: 'https://images.unsplash.com/photo-1551633371-1e02a57b2e80?w=600&h=400&fit=crop' },
    { name: 'Basel', code: 'BS', image: 'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=600&h=400&fit=crop' },
    { name: 'Lugano', code: 'TI', image: 'https://images.unsplash.com/photo-1562975909-169a5e2b072e?w=600&h=400&fit=crop' },
  ];

  const handleSearch = () => {
    let query = '/properties?';
    if (selectedCanton) query += `canton=${selectedCanton}&`;
    if (maxBudget) query += `max_price=${maxBudget}`;
    setLocation(query);
  };

  return (
    <MainLayout>
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=1920&h=1080&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Find Your Perfect Student Home in Switzerland
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Browse verified properties across Switzerland. From cozy studios to shared apartments.
            </p>

            <Card className="bg-background/95 backdrop-blur">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedCanton} onValueChange={setSelectedCanton}>
                    <SelectTrigger data-testid="select-canton">
                      <SelectValue placeholder="Select Canton" />
                    </SelectTrigger>
                    <SelectContent>
                      {cantons?.map((canton) => (
                        <SelectItem key={canton.code} value={canton.code}>
                          {canton.name_fr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input 
                    type="number"
                    placeholder="Max Budget (CHF)"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    data-testid="input-budget"
                  />

                  <Button 
                    onClick={handleSearch} 
                    size="lg" 
                    className="w-full"
                    data-testid="button-search"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Properties
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular University Cities</h2>
            <p className="text-lg text-muted-foreground">Discover student-friendly housing in Switzerland's top cities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCities.map((city) => (
              <Link key={city.code} href={`/properties?canton=${city.code}`}>
                <Card className="overflow-hidden hover-elevate cursor-pointer" data-testid={`card-city-${city.code}`}>
                  <div className="relative aspect-[3/2]">
                    <img 
                      src={city.image} 
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{city.name}</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Hoomy Works</h2>
            <p className="text-lg text-muted-foreground">Find your perfect student home in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Search & Filter</h3>
              <p className="text-muted-foreground">
                Browse hundreds of verified student properties across Switzerland. Filter by location, budget, and room type.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Connect Securely</h3>
              <p className="text-muted-foreground">
                Message verified landlords directly. All profiles are verified for your safety and peace of mind.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Sign & Move In</h3>
              <p className="text-muted-foreground">
                Sign your rental contract online with secure payment processing. Move into your new home hassle-free.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Hoomy?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Verified Listings</h3>
              <p className="text-sm text-muted-foreground">All properties and landlords are verified</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">Protected transactions via Stripe</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Swiss Locations</h3>
              <p className="text-sm text-muted-foreground">Properties in all 26 cantons</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Student Focused</h3>
              <p className="text-sm text-muted-foreground">Tailored for student needs</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Home?</h2>
              <p className="text-lg mb-6 text-primary-foreground/90">
                Join thousands of students who found their perfect accommodation through Hoomy
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register?role=student">
                  <Button size="lg" variant="secondary" data-testid="button-student-signup">
                    Sign Up as Student
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/register?role=owner">
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-owner-signup">
                    List Your Property
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
