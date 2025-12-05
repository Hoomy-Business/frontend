import { useState, useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerSchema, type RegisterInput } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function Register() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const roleParam = params.get('role');
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string>('');

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocation('/cgu');
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocation('/privacy');
  };

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        setLocation('/admin/dashboard');
      } else if (user.role === 'student') {
        setLocation('/profile');
      } else {
        setLocation('/dashboard/owner');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  // Ne pas afficher le formulaire si déjà connecté
  if (isAuthenticated && user) {
    return null;
  }

  const form = useForm<RegisterInput & { terms_accepted: boolean }>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: roleParam === 'owner' ? 'owner' : 'student',
      phone: '',
      date_of_birth: '',
      terms_accepted: false,
    },
  });

  useEffect(() => {
    if (roleParam && (roleParam === 'student' || roleParam === 'owner')) {
      form.setValue('role', roleParam);
    }
  }, [roleParam, form]);

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => apiRequest('POST', '/auth/register', data),
    onSuccess: (data, variables) => {
      setLocation(`/verify-email?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (err: Error & { code?: string }) => {
      // Le message a déjà été traduit par api.ts, mais on peut personnaliser davantage
      const errorCode = (err as any).code;
      
      if (errorCode === 'INVALID_PHONE' || err.message.includes('téléphone')) {
        setError(err.message);
      } else if (err.message.includes('email') && err.message.includes('déjà')) {
        setError('Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez une autre adresse.');
      } else if (err.message.includes('18 ans')) {
        setError('Vous devez avoir au moins 18 ans pour créer un compte.');
      } else if (err.message.includes('temporaire')) {
        setError('Les adresses email temporaires ou jetables ne sont pas acceptées. Utilisez une adresse email permanente.');
      } else {
        setError(err.message || 'L\'inscription a échoué. Veuillez vérifier vos informations et réessayer.');
      }
    },
  });

  const onSubmit = (data: RegisterInput & { terms_accepted: boolean }) => {
    setError('');
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="mb-4 cursor-pointer">
              <Logo iconClassName="h-8 w-8" textClassName="text-2xl" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold" data-testid="text-register-title">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">Join thousands of students and landlords on Hoomy</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Fill in your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="student" id="student" data-testid="radio-student" />
                            <label htmlFor="student" className="cursor-pointer">Student looking for housing</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="owner" id="owner" data-testid="radio-owner" />
                            <label htmlFor="owner" className="cursor-pointer">Landlord with properties</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="John" className="pl-10" data-testid="input-firstname" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" data-testid="input-lastname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="your.email@example.com" className="pl-10" data-testid="input-email" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="password" placeholder="••••••••" className="pl-10" data-testid="input-password" />
                        </div>
                      </FormControl>
                      <FormDescription>At least 8 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone (Optionnel)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="+41 76 123 45 67" className="pl-10" data-testid="input-phone" />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Format suisse: +41 XX XXX XX XX. Le numéro devra être vérifié par SMS.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="date" className="pl-10" data-testid="input-dob" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="terms_accepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept the{' '}
                          <a href="/cgu" className="text-primary hover:underline" onClick={handleTermsClick}>Terms of Service</a>
                          {' '}and{' '}
                          <a href="/privacy" className="text-primary hover:underline" onClick={handlePrivacyClick}>Privacy Policy</a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={registerMutation.isPending}
                  data-testid="button-submit"
                >
                  {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
