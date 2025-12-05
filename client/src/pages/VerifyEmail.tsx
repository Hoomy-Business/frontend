import { useState, useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { verifyEmailSchema, type VerifyEmailInput, type AuthResponse } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const emailParam = params.get('email') || '';
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailParam,
      code: '',
    },
  });

  useEffect(() => {
    if (emailParam) {
      form.setValue('email', emailParam);
    }
  }, [emailParam, form]);

  const verifyMutation = useMutation({
    mutationFn: (data: VerifyEmailInput) => apiRequest<AuthResponse>('POST', '/auth/verify-email', data),
    onSuccess: (data) => {
      login(data.token, data.user);
      const role = data.user.role;
      if (role === 'admin') {
        setLocation('/admin/dashboard');
      } else if (role === 'student') {
        setLocation('/profile');
      } else {
        setLocation('/dashboard/owner');
      }
    },
    onError: (err: Error) => {
      setError(err.message || 'Verification failed. Please check your code.');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/auth/resend-verification', { email: form.getValues('email') }),
    onSuccess: () => {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to resend code.');
    },
  });

  const onSubmit = (data: VerifyEmailInput) => {
    setError('');
    verifyMutation.mutate(data);
  };

  const handleResend = () => {
    setError('');
    setResendSuccess(false);
    resendMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-4 cursor-pointer">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Hoomy</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold" data-testid="text-verify-title">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2">We sent a verification code to your email</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>
              Please check your email for the 6-digit verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Verification code resent successfully!</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            type="email" 
                            disabled
                            className="pl-10 bg-muted"
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                          data-testid="input-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={verifyMutation.isPending}
                  data-testid="button-submit"
                >
                  {verifyMutation.isPending ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground mb-2">Didn't receive the code?</p>
              <Button 
                variant="ghost" 
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="p-0 h-auto underline"
                data-testid="button-resend"
              >
                {resendMutation.isPending ? 'Sending...' : 'Resend verification code'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
