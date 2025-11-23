import { useState } from 'react';
import { Link } from 'wouter';
import { Heart, MessageSquare, FileText, User, Building2 } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Property, Contract, Conversation } from '@shared/schema';
import { apiRequest } from '@/lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');

  const { data: favorites, isLoading: favoritesLoading } = useQuery<Property[]>({
    queryKey: ['/favorites'],
  });

  const { data: contracts, isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['/contracts/my-contracts'],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/messages/conversations'],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (propertyId: number) => apiRequest('DELETE', `/favorites/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/favorites'] });
    },
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-muted-foreground">Manage your favorites, messages, and rental contracts</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="favorites" className="gap-2" data-testid="tab-favorites">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2" data-testid="tab-messages">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2" data-testid="tab-contracts">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Contracts</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2" data-testid="tab-profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Properties</CardTitle>
                <CardDescription>Properties you've favorited</CardDescription>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-80 w-full" />
                    ))}
                  </div>
                ) : !favorites || favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start browsing properties and save your favorites
                    </p>
                    <Link href="/properties">
                      <Button>Browse Properties</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        isFavorited={true}
                        onFavoriteToggle={(id) => removeFavoriteMutation.mutate(id)}
                      />
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
                <CardDescription>Messages with property owners</CardDescription>
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
                    <p className="text-muted-foreground mb-4">
                      Contact property owners to start a conversation
                    </p>
                    <Link href="/properties">
                      <Button>Browse Properties</Button>
                    </Link>
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

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rental Contracts</CardTitle>
                <CardDescription>Your active and past rental agreements</CardDescription>
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
                      Your rental contracts will appear here once created
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
                              <p className="text-sm text-muted-foreground">Monthly Rent</p>
                              <p className="font-semibold">CHF {contract.monthly_rent.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Duration</p>
                              <p className="font-semibold">
                                {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/contracts/${contract.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
