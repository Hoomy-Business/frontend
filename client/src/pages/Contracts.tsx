import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { FileText, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Contract } from '@shared/schema';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/useLanguage';

export default function Contracts() {
  const { user, isAuthenticated, isStudent } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
  }, [isAuthenticated, setLocation]);

  const { data: contractsData, isLoading: contractsLoading, error: contractsError } = useQuery<any>({
    queryKey: ['/contracts/my-contracts'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', '/contracts/my-contracts');
      if (Array.isArray(response)) return response;
      if (response?.contracts && Array.isArray(response.contracts)) return response.contracts;
      if (response?.success && response?.contracts && Array.isArray(response.contracts)) return response.contracts;
      return [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnMount: true,
    retry: 2,
    enabled: isAuthenticated,
  });

  const contracts: Contract[] = Array.isArray(contractsData) ? contractsData : [];

  const acceptContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      return apiRequest<any>('PUT', `/contracts/${contractId}/accept`, {});
    },
    onSuccess: (_data, contractId) => {
      toast({
        title: 'Contrat accepté',
        description: 'Le contrat a été accepté et est maintenant actif.',
      });
      queryClient.invalidateQueries({ queryKey: ['/contracts/my-contracts'] });
      setLocation(`/contracts/${contractId}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'accepter le contrat',
        variant: 'destructive',
      });
    },
  });

  const rejectContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      return apiRequest<any>('PUT', `/contracts/${contractId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: 'Contrat refusé',
        description: 'Le contrat a été refusé.',
      });
      queryClient.invalidateQueries({ queryKey: ['/contracts/my-contracts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de refuser le contrat',
        variant: 'destructive',
      });
    },
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            {isStudent ? t('dashboard.student.contracts.title') : t('dashboard.contracts')}
          </h1>
          <p className="text-muted-foreground">
            {isStudent ? t('dashboard.student.contracts.desc') : t('dashboard.contracts.desc')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isStudent ? t('dashboard.student.contracts.title') : t('dashboard.contracts')}</CardTitle>
            <CardDescription>{isStudent ? t('dashboard.student.contracts.desc') : t('dashboard.contracts.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {contractsError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Erreur lors du chargement des contrats: {contractsError instanceof Error ? contractsError.message : 'Erreur inconnue'}
                </AlertDescription>
              </Alert>
            )}
            {contractsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : !contracts || contracts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{isStudent ? t('dashboard.student.contracts.empty') : t('dashboard.contracts.empty')}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isStudent ? t('dashboard.student.contracts.empty.desc') : t('dashboard.contracts.empty.desc')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Card key={contract.id} data-testid={`card-contract-${contract.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{contract.property_title}</h4>
                          <p className="text-sm text-muted-foreground">{contract.city_name}</p>
                        </div>
                        <Badge variant={
                          contract.status === 'active' ? 'default' :
                          contract.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {contract.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t('dashboard.contract.rent')}</p>
                          <p className="font-semibold">CHF {Number(contract.monthly_rent || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        {contract.charges !== undefined && contract.charges !== null && contract.charges > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground">Charges mensuelles</p>
                            <p className="font-semibold">CHF {Number(contract.charges || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">{t('dashboard.contract.duration')}</p>
                          <p className="font-semibold">
                            {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Caution</p>
                          <p className="font-semibold">CHF {Number(contract.deposit_amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      {contract.status === 'pending' && (
                        <Alert className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Un contrat vous a été proposé. Vous pouvez l'accepter ou le refuser.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {contract.status === 'pending' && isStudent && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => acceptContractMutation.mutate(contract.id)}
                              disabled={acceptContractMutation.isPending || rejectContractMutation.isPending}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {acceptContractMutation.isPending ? 'Acceptation...' : 'Accepter'}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => rejectContractMutation.mutate(contract.id)}
                              disabled={acceptContractMutation.isPending || rejectContractMutation.isPending}
                              className="flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              {rejectContractMutation.isPending ? 'Refus...' : 'Refuser'}
                            </Button>
                          </>
                        )}
                        <Link href={`/contracts/${contract.id}`}>
                          <Button variant="outline" size="sm">Voir les détails</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

