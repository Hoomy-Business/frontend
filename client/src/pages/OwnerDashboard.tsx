import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Building2, MessageSquare, FileText, User, Inbox, CreditCard } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { StripeAccountStatus } from '@shared/schema';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/useLanguage';

export default function OwnerDashboard() {
  const { user, isAuthenticated, isOwner } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (!isOwner) {
      if (user?.role === 'admin') {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/dashboard/student');
      }
    }
  }, [isAuthenticated, isOwner, user?.role, setLocation]);

  const { data: stripeStatus } = useQuery<StripeAccountStatus>({
    queryKey: ['/contracts/connect/account-status'],
    queryFn: async () => {
      return apiRequest<StripeAccountStatus>('GET', '/contracts/connect/account-status');
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: isAuthenticated && isOwner,
  });

  const createAccountMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; account_id?: string; requires_account_creation?: boolean }>('POST', '/contracts/connect/create-account'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts/connect/account-status'] });
      toast({
        title: 'Account Created',
        description: 'Stripe account created successfully. Please complete the onboarding process.',
      });
    },
    onError: (error: any) => {
      toast({
        title: error?.message || 'Stripe Account Creation Failed',
        description: error?.details || error?.message || 'Failed to create Stripe account. Please try again.',
        variant: 'destructive',
        duration: 10000,
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
          title: 'Error',
          description: 'No onboarding URL received',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      if (error?.requires_account_creation) {
        toast({
          title: 'Account Required',
          description: 'Please create a Stripe account first.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Onboarding Link Failed',
          description: error?.details || error?.message || 'Failed to create onboarding link. Please try again.',
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
            {t('dashboard.owner.welcome', { name: user?.first_name || '' })}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.owner.manage')}</p>
        </div>

        {stripeStatus && !stripeStatus.onboarding_complete && (
          <Alert className="mb-6">
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              {t('dashboard.stripe.setup')}
              <Button 
                variant="ghost" 
                className="ml-2 p-0 h-auto"
                onClick={handleStripeSetup}
                disabled={createAccountMutation.isPending || createOnboardingLinkMutation.isPending}
                data-testid="button-setup-stripe"
              >
                {createAccountMutation.isPending || createOnboardingLinkMutation.isPending 
                  ? t('dashboard.stripe.setting')
                  : t('dashboard.stripe.setup.button')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Link href="/my-properties">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Building2 className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.properties')}</span>
            </Button>
          </Link>
          <Link href="/requests">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Inbox className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.requests')}</span>
            </Button>
          </Link>
          <Link href="/contracts">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.contracts')}</span>
            </Button>
          </Link>
          <Link href="/messages">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.messages')}</span>
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <User className="h-5 w-5" />
              <span className="text-xs">{t('dashboard.profile.title')}</span>
            </Button>
          </Link>
        </div>


        {/* All content moved to separate routes */}
      </div>
    </MainLayout>
  );
}
