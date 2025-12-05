import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Inbox, Sparkles, Building2, X, Clock, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/useLanguage';

export default function Requests() {
  const { user, isAuthenticated, isStudent, isOwner } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
  }, [isAuthenticated, setLocation]);

  const queryKey = isStudent ? '/requests/sent' : '/requests/received';
  const { data: requestsData, isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', queryKey);
      if (Array.isArray(response)) return response;
      if (response?.requests && Array.isArray(response.requests)) return response.requests;
      return [];
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
  });

  const requests = Array.isArray(requestsData) ? requestsData : [];

  const deleteRequestMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest('DELETE', `/requests/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({ title: 'Success', description: 'Request cancelled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Inbox className="h-7 w-7 text-primary" />
            {isStudent ? t('dashboard.student.requests.title') : t('dashboard.requests')}
          </h1>
          <p className="text-muted-foreground">
            {isStudent ? t('dashboard.student.requests.desc') : t('dashboard.requests.desc')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isStudent ? t('dashboard.student.requests.title') : t('dashboard.requests')}</CardTitle>
            <CardDescription>{isStudent ? t('dashboard.student.requests.desc') : t('dashboard.requests.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : !requests || requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Inbox className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{isStudent ? t('dashboard.student.requests.empty') : t('dashboard.requests.empty')}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {isStudent ? t('dashboard.student.requests.empty.desc') : t('dashboard.requests.empty.desc')}
                </p>
                <Link href="/properties">
                  <Button size="lg">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <Card key={req.id} className="hover-elevate transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{req.property_title}</h4>
                          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            {req.city_name} • CHF {req.price?.toLocaleString()}/mois
                          </p>
                          {req.message && (
                            <div className="bg-muted/50 p-3 rounded-md border-l-4 border-primary">
                              <p className="text-sm italic">"{req.message}"</p>
                            </div>
                          )}
                        </div>
                        <Badge variant={
                          req.status === 'accepted' ? 'default' :
                          req.status === 'pending' ? 'secondary' :
                          'destructive'
                        } className="gap-1">
                          {req.status === 'accepted' && <CheckCircle2 className="h-3 w-3" />}
                          {req.status === 'pending' && <Clock className="h-3 w-3" />}
                          {req.status}
                        </Badge>
                      </div>
                      
                      {isStudent && req.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this request?')) {
                                deleteRequestMutation.mutate(req.id);
                              }
                            }}
                            disabled={deleteRequestMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Request
                          </Button>
                        </div>
                      )}
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

