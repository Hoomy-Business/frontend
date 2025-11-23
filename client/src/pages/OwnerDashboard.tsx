import { useState } from 'react';
import { Link } from 'wouter';
import { Building2, MessageSquare, FileText, User, Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Property, Contract, Conversation, StripeAccountStatus } from '@shared/schema';
import { apiRequest } from '@/lib/api';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');

  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/properties/my-properties'],
  });

  const { data: contracts, isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['/contracts/my-contracts'],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/messages/conversations'],
  });

  const { data: stripeStatus } = useQuery<StripeAccountStatus>({
    queryKey: ['/contracts/connect/account-status'],
  });

  const createAccountMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/contracts/connect/create-account'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/contracts/connect/account-status'] });
    },
  });

  const createOnboardingLinkMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/contracts/connect/create-onboarding-link'),
    onSuccess: (data: { url: string }) => {
      window.location.href = data.url;
    },
  });

  const handleStripeSetup = async () => {
    if (!stripeStatus?.has_account) {
      await createAccountMutation.mutateAsync();
    }
    createOnboardingLinkMutation.mutate();
  };

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/properties/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/properties/my-properties'] });
    },
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-muted-foreground">Manage your properties, contracts, and messages</p>
        </div>

        {stripeStatus && !stripeStatus.onboarding_complete && (
          <Alert className="mb-6">
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              Complete your Stripe Connect setup to receive payments from tenants.
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto"
                onClick={handleStripeSetup}
                disabled={createAccountMutation.isPending || createOnboardingLinkMutation.isPending}
                data-testid="button-setup-stripe"
              >
                {createAccountMutation.isPending || createOnboardingLinkMutation.isPending 
                  ? 'Setting up...' 
                  : 'Set up now'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="properties" className="gap-2" data-testid="tab-properties">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2" data-testid="tab-contracts">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Contracts</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2" data-testid="tab-messages">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2" data-testid="tab-profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">My Properties</h2>
                <p className="text-muted-foreground">Manage your property listings</p>
              </div>
              <Link href="/properties/create">
                <Button data-testid="button-add-property">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </Link>
            </div>

            {propertiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            ) : !properties || properties.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No properties yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start listing your properties to connect with students
                </p>
                <Link href="/properties/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="relative">
                    <PropertyCard property={property} />
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <Link href={`/properties/${property.id}/edit`}>
                        <Button size="icon" variant="secondary" className="bg-background/90 backdrop-blur">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        size="icon" 
                        variant="secondary"
                        className="bg-background/90 backdrop-blur hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this property?')) {
                            deletePropertyMutation.mutate(property.id);
                          }
                        }}
                        data-testid={`button-delete-${property.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rental Contracts</CardTitle>
                <CardDescription>Manage your rental agreements</CardDescription>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : !contracts || contracts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No contracts yet</h3>
                    <p className="text-muted-foreground">
                      Your rental contracts will appear here
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
                              <p className="text-sm text-muted-foreground">
                                Tenant: {contract.student_first_name} {contract.student_last_name}
                              </p>
                            </div>
                            <Badge variant={
                              contract.status === 'active' ? 'default' :
                              contract.status === 'pending' ? 'secondary' :
                              'outline'
                            }>
                              {contract.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Monthly Rent</p>
                              <p className="font-semibold">CHF {contract.monthly_rent.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Your Payout</p>
                              <p className="font-semibold">CHF {contract.owner_payout.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Duration</p>
                              <p className="font-semibold">
                                {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <Link href={`/contracts/${contract.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>Messages with potential tenants</CardDescription>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : !conversations || conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">
                      Student inquiries will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conv) => (
                      <Link key={conv.id} href={`/messages?conversation=${conv.id}`}>
                        <Card className="hover-elevate cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{conv.property_title}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.other_user_name}
                              </p>
                              {conv.last_message && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {conv.last_message}
                                </p>
                              )}
                            </div>
                            {conv.unread_count && conv.unread_count > 0 && (
                              <Badge variant="default">{conv.unread_count}</Badge>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">First Name</p>
                    <p className="font-medium">{user?.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Name</p>
                    <p className="font-medium">{user?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                    <Badge>{user?.role}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email Verified</p>
                    <Badge variant={user?.email_verified ? 'default' : 'secondary'}>
                      {user?.email_verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {stripeStatus && (
                  <div>
                    <h3 className="font-semibold mb-4">Payment Setup</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Stripe Account</p>
                        <Badge variant={stripeStatus.has_account ? 'default' : 'secondary'}>
                          {stripeStatus.has_account ? 'Connected' : 'Not Connected'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Onboarding</p>
                        <Badge variant={stripeStatus.onboarding_complete ? 'default' : 'secondary'}>
                          {stripeStatus.onboarding_complete ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </div>
                      {stripeStatus.payouts_enabled !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Payouts</p>
                          <Badge variant={stripeStatus.payouts_enabled ? 'default' : 'secondary'}>
                            {stripeStatus.payouts_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {!stripeStatus.onboarding_complete && (
                      <Button 
                        className="mt-4"
                        onClick={handleStripeSetup}
                        disabled={createAccountMutation.isPending || createOnboardingLinkMutation.isPending}
                      >
                        {createAccountMutation.isPending || createOnboardingLinkMutation.isPending 
                          ? 'Setting up...' 
                          : 'Complete Stripe Setup'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
