import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { ArrowLeft, FileText, Download, CheckCircle2, XCircle, Clock, CreditCard, History, Edit } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, getAuthToken } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Contract } from '@shared/schema';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getAPIBaseURL } from '@/lib/apiConfig';

export default function ContractDetail() {
  const params = useParams();
  const contractId = params.id ? parseInt(params.id) : null;
  const { isStudent, isOwner, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    monthly_rent: 0,
    charges: 0,
    deposit_amount: 0,
    start_date: '',
    end_date: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
  }, [isAuthenticated, setLocation]);

  const { data: contractData, isLoading } = useQuery<{ success: boolean; contract: Contract }>({
    queryKey: ['/contracts', contractId],
    enabled: !!contractId && isAuthenticated,
    queryFn: async () => {
      if (!contractId) throw new Error('Contract ID required');
      return apiRequest<{ success: boolean; contract: Contract }>('GET', `/contracts/${contractId}`);
    },
  });

  const contract = contractData?.contract;

  // Initialiser les données d'édition quand le contrat est chargé
  useEffect(() => {
    if (contract && contract.start_date && contract.end_date) {
      const startDate = contract.start_date.split('T')[0] || '';
      const endDate = contract.end_date.split('T')[0] || '';
      setEditData({
        monthly_rent: contract.monthly_rent,
        charges: contract.charges ?? 0,
        deposit_amount: contract.deposit_amount,
        start_date: startDate,
        end_date: endDate,
      });
    }
  }, [contract]);

  const updateContractMutation = useMutation({
    mutationFn: (data: typeof editData) => {
      return apiRequest('PUT', `/contracts/${contractId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['/contracts/my-contracts'] });
      toast({ title: 'Succès', description: 'Contrat mis à jour avec succès' });
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const signContractMutation = useMutation({
    mutationFn: () => {
      // Les étudiants utilisent /accept, les propriétaires peuvent utiliser /status
      if (isStudent) {
        return apiRequest('PUT', `/contracts/${contractId}/accept`, {});
      } else {
        return apiRequest('PUT', `/contracts/${contractId}/status`, { status: 'active' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['/contracts/my-contracts'] });
      toast({ title: 'Success', description: 'Contract signed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; checkout_url: string }>('POST', '/contracts/create-subscription', { contract_id: contractId }),
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/contracts/cancel-subscription', { contract_id: contractId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts', contractId] });
      toast({ title: 'Success', description: 'Subscription cancelled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const { data: paymentsData } = useQuery<{ success: boolean; payments: any[] }>({
    queryKey: ['/contracts/payments', contractId],
    enabled: !!contractId && contract?.status === 'active',
    queryFn: async () => {
      if (!contractId) throw new Error('Contract ID required');
      return apiRequest<{ success: boolean; payments: any[] }>('GET', `/contracts/payments/${contractId}`);
    },
  });

  const handleDownloadPDF = async () => {
    if (!contractId) {
      toast({
        title: 'Erreur',
        description: 'ID de contrat manquant',
        variant: 'destructive',
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour télécharger le PDF',
        variant: 'destructive',
      });
      return;
    }

    try {
      const apiBase = getAPIBaseURL();
      const baseClean = apiBase.replace(/\/+$/, '');
      const url = `${baseClean}/contracts/${contractId}/pdf`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors du téléchargement' }));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      // Get the response (could be PDF or HTML)
      const contentType = response.headers.get('content-type') || '';
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Set appropriate file extension based on content type
      if (contentType.includes('application/pdf')) {
        link.download = `contract-${contractId}.pdf`;
      } else if (contentType.includes('text/html')) {
        link.download = `contract-${contractId}.html`;
        // For HTML, also open in new window for printing
        window.open(downloadUrl, '_blank');
      } else {
        link.download = `contract-${contractId}.pdf`;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: 'Succès',
        description: 'PDF téléchargé avec succès',
      });
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de télécharger le PDF',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
        </div>
      </MainLayout>
    );
  }

  if (!contract) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Contract Not Found</h1>
          <Link href={isOwner ? '/dashboard/owner' : '/dashboard/student'}>
            <Button data-testid="button-dashboard">Back to Dashboard</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const canSign = isStudent && contract.status === 'pending';
  const statusIcon = {
    pending: <Clock className="h-5 w-5 text-yellow-600" />,
    active: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    completed: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    cancelled: <XCircle className="h-5 w-5 text-red-600" />,
  }[contract.status];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={isOwner ? '/dashboard/owner' : '/dashboard/student'}>
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <CardTitle>Rental Contract</CardTitle>
                  </div>
                  <CardDescription>Contract ID: {contract.id}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon}
                  <Badge
                    variant={
                      contract.status === 'active' ? 'default' :
                      contract.status === 'pending' ? 'secondary' :
                      'outline'
                    }
                  >
                    {contract.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {canSign && (
                <Alert>
                  <AlertDescription className="flex items-center justify-between">
                    <span>Please review and sign this contract to proceed with your rental</span>
                    <Button
                      onClick={() => signContractMutation.mutate()}
                      disabled={signContractMutation.isPending}
                      data-testid="button-sign-contract"
                    >
                      {signContractMutation.isPending ? 'Signing...' : 'Sign Contract'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <h3 className="font-semibold mb-3">Property Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Property</p>
                    <p className="font-medium" data-testid="text-property-title">{contract.property_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{contract.city_name}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Parties</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Property Owner</p>
                    <p className="font-medium">
                      {contract.owner_first_name} {contract.owner_last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tenant</p>
                    <p className="font-medium">
                      {contract.student_first_name} {contract.student_last_name}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Contract Terms</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{new Date(contract.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(contract.end_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {Math.round(
                        (new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) /
                        (1000 * 60 * 60 * 24 * 30)
                      )} months
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Financial Details</h3>
                  {(contract.status === 'pending' || contract.is_editable) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (contract && contract.start_date && contract.end_date) {
                          const startDate = contract.start_date.split('T')[0] || '';
                          const endDate = contract.end_date.split('T')[0] || '';
                          setEditData({
                            monthly_rent: contract.monthly_rent,
                            charges: contract.charges ?? 0,
                            deposit_amount: contract.deposit_amount,
                            start_date: startDate,
                            end_date: endDate,
                          });
                          setEditDialogOpen(true);
                        }
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-semibold text-lg">CHF {contract.monthly_rent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Charges</p>
                    <p className="font-semibold text-lg">CHF {(contract.charges ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deposit</p>
                    <p className="font-semibold text-lg">CHF {contract.deposit_amount.toLocaleString()}</p>
                  </div>
                  {isOwner && (
                    <div>
                      <p className="text-sm text-muted-foreground">Your Monthly Payout</p>
                      <p className="font-semibold text-lg">CHF {contract.owner_payout.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">After platform fee</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Total mensuel</p>
                    <p className="font-semibold text-lg">CHF {(contract.monthly_rent + (contract.charges ?? 0)).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Loyer + Charges</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Contract Status</h3>
                <div className="flex items-center gap-2">
                  {statusIcon}
                  <p className="text-sm">
                    {contract.status === 'active' && 'Contract is active'}
                    {contract.status === 'pending' && 'Contract is pending approval'}
                    {contract.status === 'completed' && 'Contract has been completed'}
                    {contract.status === 'cancelled' && 'Contract has been cancelled'}
                  </p>
                </div>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  {contract?.status === 'active' && (
                    <>
                      <TabsTrigger value="payments">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payments
                      </TabsTrigger>
                      <TabsTrigger value="history">
                        <History className="h-4 w-4 mr-2" />
                        History
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      className="flex-1"
                      data-testid="button-download-pdf"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    {canSign && (
                      <Button
                        onClick={() => signContractMutation.mutate()}
                        disabled={signContractMutation.isPending}
                        className="flex-1"
                        data-testid="button-sign"
                      >
                        {signContractMutation.isPending ? 'Signing...' : 'Sign Contract'}
                      </Button>
                    )}
                  </div>
                </TabsContent>

                {contract?.status === 'active' && (
                  <>
                    <TabsContent value="payments" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Payment Setup</h3>
                        {!contract.stripe_subscription_id ? (
                          <Alert>
                            <AlertDescription className="flex items-center justify-between">
                              <span>Set up automatic monthly payments</span>
                              <Button
                                onClick={() => createSubscriptionMutation.mutate()}
                                disabled={createSubscriptionMutation.isPending}
                              >
                                {createSubscriptionMutation.isPending ? 'Setting up...' : 'Set Up Payments'}
                              </Button>
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert>
                            <AlertDescription className="flex items-center justify-between">
                              <span>Subscription is active. Payments will be processed automatically.</span>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel the subscription?')) {
                                    cancelSubscriptionMutation.mutate();
                                  }
                                }}
                                disabled={cancelSubscriptionMutation.isPending}
                              >
                                {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                              </Button>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Payment History</h3>
                        {!paymentsData?.payments || paymentsData.payments.length === 0 ? (
                          <p className="text-muted-foreground">No payment history available</p>
                        ) : (
                          <div className="space-y-2">
                            {paymentsData.payments.map((payment) => (
                              <Card key={payment.id}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">CHF {payment.amount?.toLocaleString()}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(payment.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                      {payment.status}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog d'édition du contrat */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le contrat</DialogTitle>
            <DialogDescription>
              Vous pouvez modifier les détails du contrat. Les deux parties doivent être d'accord avec les modifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="monthly_rent">Loyer mensuel (CHF)</Label>
              <Input
                id="monthly_rent"
                type="number"
                value={editData.monthly_rent}
                onChange={(e) => setEditData({ ...editData, monthly_rent: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="charges">Charges mensuelles (CHF)</Label>
              <Input
                id="charges"
                type="number"
                value={editData.charges}
                onChange={(e) => setEditData({ ...editData, charges: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="deposit_amount">Caution (CHF)</Label>
              <Input
                id="deposit_amount"
                type="number"
                value={editData.deposit_amount}
                onChange={(e) => setEditData({ ...editData, deposit_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={editData.start_date}
                  onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={editData.end_date}
                  onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => updateContractMutation.mutate(editData)}
              disabled={updateContractMutation.isPending}
            >
              {updateContractMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
