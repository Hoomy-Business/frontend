import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Shield, CheckCircle2, XCircle, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/useLanguage';
import type { AdminKYC } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedKYC, setSelectedKYC] = useState<AdminKYC | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Protection d'accès - ne rediriger qu'une seule fois
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (isAuthenticated && !isAdmin) {
      setLocation('/');
      // Utiliser setTimeout pour éviter les boucles infinies
      setTimeout(() => {
        toast({
          title: 'Accès refusé',
          description: 'Cette page est réservée aux administrateurs.',
          variant: 'destructive',
        });
      }, 100);
    }
  }, [isAuthenticated, isAdmin, setLocation, toast]);

  const { data: stats } = useQuery<{ stats: { pending_count: string; approved_count: string; rejected_count: string; total_count: string } }>({
    queryKey: ['/admin/kyc/stats'],
    queryFn: async () => {
      return apiRequest('GET', '/admin/kyc/stats');
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const { data: pendingKYCs, isLoading, refetch } = useQuery<{ kycs: AdminKYC[] }>({
    queryKey: ['/admin/kyc/pending'],
    queryFn: async () => {
      return apiRequest('GET', '/admin/kyc/pending');
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const approveMutation = useMutation({
    mutationFn: (kycId: number) => apiRequest('PUT', `/admin/kyc/${kycId}/approve`),
    onSuccess: () => {
      toast({
        title: 'KYC approuvé',
        description: 'Le KYC a été approuvé avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['/admin/kyc/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/admin/kyc/stats'] });
      setSelectedKYC(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ kycId, reason }: { kycId: number; reason: string }) =>
      apiRequest('PUT', `/admin/kyc/${kycId}/reject`, { reason }),
    onSuccess: () => {
      toast({
        title: 'KYC rejeté',
        description: 'Le KYC a été rejeté avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['/admin/kyc/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/admin/kyc/stats'] });
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedKYC(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleApprove = (kyc: AdminKYC) => {
    if (confirm(`Êtes-vous sûr de vouloir approuver le KYC de ${kyc.first_name} ${kyc.last_name} ?`)) {
      approveMutation.mutate(kyc.id);
    }
  };

  const handleReject = (kyc: AdminKYC) => {
    setSelectedKYC(kyc);
    setRejectDialogOpen(true);
  };

  const submitReject = () => {
    if (!selectedKYC) return;
    if (!rejectReason.trim()) {
      toast({
        title: 'Raison requise',
        description: 'Veuillez fournir une raison de rejet.',
        variant: 'destructive',
      });
      return;
    }
    rejectMutation.mutate({ kycId: selectedKYC.id, reason: rejectReason });
  };

  // Ne pas afficher si pas admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Panneau d'Administration</h1>
          </div>
          <p className="text-muted-foreground">Gestion des vérifications KYC</p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">En attente</p>
                    <p className="text-2xl font-bold">{stats.stats.pending_count}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Approuvés</p>
                    <p className="text-2xl font-bold text-green-600">{stats.stats.approved_count}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rejetés</p>
                    <p className="text-2xl font-bold text-red-600">{stats.stats.rejected_count}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold">{stats.stats.total_count}</p>
                  </div>
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section KYC Ultra Sécurisée */}
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Vérifications KYC en Attente
                </CardTitle>
                <CardDescription>
                  Section sécurisée - Vérifiez les documents d'identité et les selfies
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                🔒 Sécurisé
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : !pendingKYCs || pendingKYCs.kycs.length === 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Aucune vérification KYC en attente. Tous les KYC ont été traités.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {pendingKYCs.kycs.map((kyc) => (
                  <Card key={kyc.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {kyc.first_name} {kyc.last_name}
                          </CardTitle>
                          <CardDescription>
                            {kyc.email} • {kyc.role} • Soumis le {new Date(kyc.submitted_at).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">En attente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Documents */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Carte d'identité - Recto</Label>
                          {kyc.id_card_front_url ? (
                            <div className="relative border rounded-lg overflow-hidden bg-muted">
                              <img
                                src={kyc.id_card_front_url}
                                alt="Carte d'identité recto"
                                className="w-full h-auto max-h-64 object-contain"
                                onError={(e) => {
                                  // Si l'image ne charge pas, essayer avec HTTPS une seule fois
                                  const target = e.currentTarget;
                                  if (target.src.startsWith('http://') && !target.dataset.httpsTried) {
                                    target.dataset.httpsTried = 'true';
                                    target.src = target.src.replace('http://', 'https://');
                                  } else {
                                    // Si HTTPS a déjà été essayé ou si c'est déjà HTTPS, utiliser le placeholder
                                    if (!target.src.includes('data:image')) {
                                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ccc" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                                    }
                                  }
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-black/50 text-white">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Recto
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                              Image non disponible
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Carte d'identité - Verso</Label>
                          {kyc.id_card_back_url ? (
                            <div className="relative border rounded-lg overflow-hidden bg-muted">
                              <img
                                src={kyc.id_card_back_url}
                                alt="Carte d'identité verso"
                                className="w-full h-auto max-h-64 object-contain"
                                onError={(e) => {
                                  // Si l'image ne charge pas, essayer avec HTTPS une seule fois
                                  const target = e.currentTarget;
                                  if (target.src.startsWith('http://') && !target.dataset.httpsTried) {
                                    target.dataset.httpsTried = 'true';
                                    target.src = target.src.replace('http://', 'https://');
                                  } else {
                                    // Si HTTPS a déjà été essayé ou si c'est déjà HTTPS, utiliser le placeholder
                                    if (!target.src.includes('data:image')) {
                                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ccc" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                                    }
                                  }
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-black/50 text-white">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Verso
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                              Image non disponible
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Selfie</Label>
                          {kyc.selfie_url ? (
                            <div className="relative border rounded-lg overflow-hidden bg-muted">
                              <img
                                src={kyc.selfie_url}
                                alt="Selfie"
                                className="w-full h-auto max-h-64 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ccc" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESelfie non disponible%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-black/50 text-white">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Selfie
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                              Selfie non disponible
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleReject(kyc)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter
                        </Button>
                        <Button
                          onClick={() => handleApprove(kyc)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {approveMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Approbation...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approuver
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de rejet */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter le KYC</DialogTitle>
              <DialogDescription>
                Veuillez fournir une raison de rejet pour {selectedKYC?.first_name} {selectedKYC?.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="reject-reason">Raison du rejet *</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Photo floue, document illisible, selfie ne correspond pas..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={submitReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejet en cours...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

