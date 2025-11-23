import { Link, useParams } from 'wouter';
import { ArrowLeft, FileText, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Contract } from '@shared/schema';
import { apiRequest } from '@/lib/api';

export default function ContractDetail() {
  const params = useParams();
  const contractId = params.id ? parseInt(params.id) : null;
  const { user, isStudent, isOwner } = useAuth();

  const { data: contract, isLoading } = useQuery<Contract>({
    queryKey: ['/contracts', contractId],
    enabled: !!contractId,
  });

  const signContractMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/contracts/${contractId}/sign`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts', contractId] });
    },
  });

  const handleDownloadPDF = () => {
    if (contractId) {
      window.open(`http://localhost:3000/api/contracts/${contractId}/pdf`, '_blank');
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
                <h3 className="font-semibold mb-3">Financial Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-semibold text-lg">CHF {contract.monthly_rent.toLocaleString()}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
