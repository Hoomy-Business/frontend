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
import { ContractSignatureDialog } from '@/components/ContractSignatureDialog';

export default function ContractDetail() {
  const params = useParams();
  const contractId = params.id ? parseInt(params.id) : null;
  const { isStudent, isOwner, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
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

  // Handle Stripe payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const type = urlParams.get('type');
    
    if (payment === 'success') {
      queryClient.invalidateQueries({ queryKey: ['/contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['/contracts/payments', contractId] });
      
      if (type === 'deposit') {
        toast({
          title: 'Deposit Payment Successful',
          description: 'Your security deposit has been successfully processed.',
        });
      } else {
        toast({
          title: 'Payment Setup Successful',
          description: 'Your subscription has been set up successfully. Monthly payments will be processed automatically.',
        });
      }
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'cancelled') {
      toast({
        title: 'Payment Cancelled',
        description: 'The payment was cancelled. You can try again anytime.',
        variant: 'destructive',
      });
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [contractId, toast]);

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
    mutationFn: (signatureData: string) => {
      // Les étudiants utilisent /accept, les propriétaires peuvent utiliser /status
      if (isStudent) {
        return apiRequest('PUT', `/contracts/${contractId}/accept`, { 
          signature: signatureData 
        });
      } else {
        return apiRequest('PUT', `/contracts/${contractId}/status`, { 
          status: 'active',
          signature: signatureData 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['/contracts/my-contracts'] });
      toast({ title: 'Succès', description: 'Contrat signé avec succès' });
      setSignatureDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const handleSignContract = async (signatureData: string) => {
    await signContractMutation.mutateAsync(signatureData);
  };

  const createSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; checkout_url: string; requires_owner_setup?: boolean }>('POST', '/contracts/create-subscription', { contract_id: contractId }),
    onSuccess: (data) => {
      if (data.requires_owner_setup) {
        toast({ 
          title: 'Owner Setup Required', 
          description: 'The property owner must complete their Stripe setup before payments can be processed.',
          variant: 'destructive' 
        });
        return;
      }
      if (data.checkout_url) {
        toast({ 
          title: 'Redirecting to Stripe', 
          description: 'You will be redirected to complete your payment setup.' 
        });
        window.location.href = data.checkout_url;
      } else {
        toast({ 
          title: 'Error', 
          description: 'No checkout URL received from server.',
          variant: 'destructive' 
        });
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to create subscription. Please try again.';
      toast({ 
        title: 'Payment Setup Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/contracts/cancel-subscription', { contract_id: contractId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['/contracts/payments', contractId] });
      toast({ 
        title: 'Subscription Cancelled', 
        description: 'Your subscription has been cancelled. Automatic payments will stop.' 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Cancellation Error', 
        description: error.message || 'Failed to cancel subscription. Please try again.',
        variant: 'destructive' 
      });
    },
  });

  const payDepositMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; checkout_url: string; requires_owner_setup?: boolean }>('POST', '/contracts/pay-deposit', { contract_id: contractId }),
    onSuccess: (data) => {
      if (data.requires_owner_setup) {
        toast({ 
          title: 'Owner Setup Required', 
          description: 'The property owner must complete their Stripe setup before payments can be processed.',
          variant: 'destructive' 
        });
        return;
      }
      if (data.checkout_url) {
        toast({ 
          title: 'Redirecting to Stripe', 
          description: 'You will be redirected to complete your deposit payment.' 
        });
        window.location.href = data.checkout_url;
      } else {
        toast({ 
          title: 'Error', 
          description: 'No checkout URL received from server.',
          variant: 'destructive' 
        });
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to process deposit payment. Please try again.';
      toast({ 
        title: 'Payment Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
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

      // Get the PDF response
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `contract-${contractId}.pdf`;
      
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

  const canSign = (isStudent && contract.status === 'pending' && !contract.student_signature) ||
                  (isOwner && contract.status === 'pending' && !contract.owner_signature);
  const needsOwnerSignature = isOwner && contract.status === 'pending' && !contract.owner_signature;
  const needsStudentSignature = isStudent && contract.status === 'pending' && !contract.student_signature;
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
                  <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
                    <span>
                      {needsStudentSignature && 'Veuillez examiner et signer ce contrat pour procéder avec votre location'}
                      {needsOwnerSignature && 'Veuillez signer ce contrat pour le finaliser'}
                    </span>
                    <Button
                      onClick={() => setSignatureDialogOpen(true)}
                      disabled={signContractMutation.isPending}
                      data-testid="button-sign-contract"
                    >
                      {signContractMutation.isPending ? 'Signature en cours...' : 'Signer le contrat'}
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
                  {isOwner && (contract.status === 'pending' || contract.is_editable) && (
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
                    <p className="font-semibold text-lg">CHF {Number(contract.monthly_rent || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Charges</p>
                    <p className="font-semibold text-lg">CHF {Number(contract.charges || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deposit</p>
                    <p className="font-semibold text-lg">CHF {Number(contract.deposit_amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  {isOwner && (
                    <div>
                      <p className="text-sm text-muted-foreground">Your Monthly Payout</p>
                      <p className="font-semibold text-lg">CHF {Number(contract.owner_payout || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-muted-foreground mt-1">After platform fee</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Total mensuel</p>
                    <p className="font-semibold text-lg">CHF {(Number(contract.monthly_rent || 0) + Number(contract.charges || 0)).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-muted-foreground mt-1">Loyer + Charges</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Signatures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Propriétaire (LE BAILLEUR)</p>
                    {contract.owner_signature ? (
                      <div className="space-y-2">
                        <div className="border rounded p-3 bg-muted/20">
                          <img 
                            src={contract.owner_signature} 
                            alt="Signature du propriétaire" 
                            className="max-h-20 mx-auto"
                          />
                        </div>
                        {contract.owner_signed_at && (
                          <p className="text-xs text-muted-foreground">
                            Signé le {new Date(contract.owner_signed_at).toLocaleDateString('fr-CH', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">En attente de signature</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Locataire (LE LOCATAIRE)</p>
                    {contract.student_signature ? (
                      <div className="space-y-2">
                        <div className="border rounded p-3 bg-muted/20">
                          <img 
                            src={contract.student_signature} 
                            alt="Signature du locataire" 
                            className="max-h-20 mx-auto"
                          />
                        </div>
                        {contract.student_signed_at && (
                          <p className="text-xs text-muted-foreground">
                            Signé le {new Date(contract.student_signed_at).toLocaleDateString('fr-CH', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">En attente de signature</p>
                    )}
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
                        onClick={() => setSignatureDialogOpen(true)}
                        disabled={signContractMutation.isPending}
                        className="flex-1"
                        data-testid="button-sign"
                      >
                        {signContractMutation.isPending ? 'Signature en cours...' : 'Signer le contrat'}
                      </Button>
                    )}
                  </div>
                </TabsContent>

                {contract?.status === 'active' && (
                  <>
                    <TabsContent value="payments" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Management
                          </h3>
                          
                          {/* Subscription Status */}
                          <Card className="mb-4">
                            <CardHeader>
                              <CardTitle className="text-lg">Monthly Subscription</CardTitle>
                              <CardDescription>
                                {contract.stripe_subscription_id 
                                  ? 'Automatic monthly payments are active'
                                  : 'Set up automatic monthly rent payments'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {!contract.stripe_subscription_id ? (
                                <div className="space-y-3">
                                  <Alert>
                                    <AlertDescription>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium mb-1">Set up automatic payments</p>
                                          <p className="text-sm text-muted-foreground">
                                            Your monthly rent of CHF {Number(contract.monthly_rent || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} will be charged automatically each month.
                                          </p>
                                        </div>
                                        <Button
                                          onClick={() => createSubscriptionMutation.mutate()}
                                          disabled={createSubscriptionMutation.isPending}
                                          className="ml-4"
                                        >
                                          {createSubscriptionMutation.isPending ? (
                                            <>
                                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                                              Setting up...
                                            </>
                                          ) : (
                                            <>
                                              <CreditCard className="h-4 w-4 mr-2" />
                                              Set Up Payments
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-green-900 mb-1">Subscription Active</p>
                                          <p className="text-sm text-green-700">
                                            Payments are processed automatically on the 1st of each month.
                                          </p>
                                        </div>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => {
                                            if (confirm('Are you sure you want to cancel the subscription? This will stop automatic payments.')) {
                                              cancelSubscriptionMutation.mutate();
                                            }
                                          }}
                                          disabled={cancelSubscriptionMutation.isPending}
                                        >
                                          {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel'}
                                        </Button>
                                      </div>
                                    </AlertDescription>
                                  </Alert>
                                  <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Next Payment</p>
                                      <p className="font-semibold">
                                        {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('fr-CH', { 
                                          day: 'numeric', 
                                          month: 'long',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Amount</p>
                                      <p className="font-semibold">
                                        CHF {Number(contract.monthly_rent || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Deposit Payment */}
                          {contract.deposit_amount > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Security Deposit</CardTitle>
                                <CardDescription>
                                  One-time payment of CHF {Number(contract.deposit_amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {(() => {
                                  const depositPaid = paymentsData?.payments?.some(
                                    (p: any) => p.payment_type === 'deposit' && p.payment_status === 'succeeded'
                                  );
                                  
                                  if (depositPaid) {
                                    return (
                                      <Alert className="border-green-200 bg-green-50">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription>
                                          <p className="font-medium text-green-900 mb-1">Deposit Paid</p>
                                          <p className="text-sm text-green-700">
                                            Your security deposit has been successfully paid. It will be returned at the end of the contract, minus any damages or unpaid fees.
                                          </p>
                                        </AlertDescription>
                                      </Alert>
                                    );
                                  }
                                  
                                  return (
                                    <Alert>
                                      <AlertDescription>
                                        <div className="space-y-3">
                                          <div>
                                            <p className="font-medium mb-1">Pay Security Deposit</p>
                                            <p className="text-sm text-muted-foreground">
                                              The security deposit of CHF {Number(contract.deposit_amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} will be returned at the end of the contract, minus any damages or unpaid fees.
                                            </p>
                                          </div>
                                          {isStudent && (
                                            <Button
                                              onClick={() => payDepositMutation.mutate()}
                                              disabled={payDepositMutation.isPending}
                                              className="w-full sm:w-auto"
                                            >
                                              {payDepositMutation.isPending ? (
                                                <>
                                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                  Processing...
                                                </>
                                              ) : (
                                                <>
                                                  <CreditCard className="h-4 w-4 mr-2" />
                                                  Pay Deposit
                                                </>
                                              )}
                                            </Button>
                                          )}
                                        </div>
                                      </AlertDescription>
                                    </Alert>
                                  );
                                })()}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Payment History
                        </h3>
                        {!paymentsData?.payments || paymentsData.payments.length === 0 ? (
                          <Card>
                            <CardContent className="p-8 text-center">
                              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-muted-foreground">No payment history available yet</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Payments will appear here once they are processed.
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {paymentsData.payments.map((payment: any) => (
                              <Card key={payment.id}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <p className="font-semibold text-lg">
                                          CHF {Number(payment.amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <Badge 
                                          variant={
                                            payment.payment_status === 'succeeded' ? 'default' :
                                            payment.payment_status === 'pending' ? 'secondary' :
                                            'destructive'
                                          }
                                        >
                                          {payment.payment_status === 'succeeded' ? 'Paid' :
                                           payment.payment_status === 'pending' ? 'Pending' :
                                           payment.payment_status === 'failed' ? 'Failed' :
                                           payment.payment_status}
                                        </Badge>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                          {payment.payment_type === 'monthly_rent' ? 'Monthly Rent' :
                                           payment.payment_type === 'deposit' ? 'Security Deposit' :
                                           payment.payment_type}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(payment.created_at).toLocaleDateString('fr-CH', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                        {payment.paid_at && (
                                          <p className="text-xs text-green-600">
                                            Paid on {new Date(payment.paid_at).toLocaleDateString('fr-CH')}
                                          </p>
                                        )}
                                        {payment.failure_reason && (
                                          <p className="text-xs text-red-600">
                                            {payment.failure_reason}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {payment.payment_status === 'succeeded' && (
                                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    )}
                                    {payment.payment_status === 'failed' && (
                                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                    )}
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

      {/* Dialog de signature électronique */}
      <ContractSignatureDialog
        open={signatureDialogOpen}
        onOpenChange={setSignatureDialogOpen}
        onSign={handleSignContract}
        role={isOwner ? 'owner' : 'student'}
        contractTitle={contract?.property_title}
        isLoading={signContractMutation.isPending}
      />
    </MainLayout>
  );
}
