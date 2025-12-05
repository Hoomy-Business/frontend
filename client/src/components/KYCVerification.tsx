import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { KYCStatus } from '@shared/schema';
import { getAPIBaseURL } from '@/lib/apiConfig';
import { normalizeImageUrl } from '@/lib/imageUtils';

export function KYCVerification() {
  const { toast } = useToast();
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: kycStatus, isLoading, refetch, error: kycError } = useQuery<KYCStatus>({
    queryKey: ['/kyc/status'],
    queryFn: async () => {
      return apiRequest<KYCStatus>('GET', '/kyc/status');
    },
    retry: 1,
  });

  const submitKYCMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = getAuthToken();
      if (!token) throw new Error('Non authentifié');

      const apiBase = getAPIBaseURL();
      const baseClean = apiBase.replace(/\/+$/, '');
      const url = `${baseClean}/kyc/submit`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la soumission du KYC');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'KYC soumis avec succès',
        description: 'Votre demande de vérification a été envoyée. Vous serez notifié une fois la vérification terminée.',
      });
      refetch();
      setIdCardFront(null);
      setIdCardBack(null);
      setSelfieFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Gestion de la webcam
  useEffect(() => {
    if (!showCamera) {
      // Arrêter le stream quand on ferme la caméra
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraLoading(false);
      setCameraError(null);
      return;
    }

    // Vérifier que l'API est disponible
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = 'Votre navigateur ne supporte pas l\'accès à la caméra, ou le site doit être en HTTPS.';
      setCameraError(errorMsg);
      setCameraLoading(false);
      toast({
        title: 'Caméra non disponible',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setCameraLoading(true);
    setCameraError(null);

    // Attendre que le ref soit disponible
    const initCamera = () => {
      if (!videoRef.current) {
        // Réessayer après un court délai
        setTimeout(initCamera, 100);
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          try {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              // Attendre que la vidéo soit prête
              videoRef.current.onloadedmetadata = () => {
                setCameraLoading(false);
                if (videoRef.current) {
                  videoRef.current.play().catch((err) => {
                    // Video error handled
                    setCameraError('Erreur lors de la lecture de la vidéo');
                    setCameraLoading(false);
                  });
                }
              };
            } else {
              stream.getTracks().forEach((track) => track.stop());
              setCameraError('Élément vidéo non disponible');
              setCameraLoading(false);
            }
          } catch (err: any) {
            // Video config error handled
            stream.getTracks().forEach((track) => track.stop());
            setCameraError('Erreur lors de la configuration de la caméra');
            setCameraLoading(false);
          }
        })
        .catch((err) => {
          // Camera access error handled
          let errorMessage = 'Impossible d\'accéder à la caméra.';
          
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = 'Permission d\'accès à la caméra refusée. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage = 'Aucune caméra trouvée sur cet appareil.';
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMessage = 'La caméra est déjà utilisée par une autre application.';
          } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
            errorMessage = 'Les paramètres de la caméra ne sont pas supportés.';
          } else if (err.name === 'SecurityError') {
            errorMessage = 'Accès à la caméra bloqué pour des raisons de sécurité. Le site doit être en HTTPS.';
          }
          
          setCameraError(errorMessage);
          setCameraLoading(false);
          toast({
            title: 'Erreur caméra',
            description: errorMessage,
            variant: 'destructive',
          });
        });
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraLoading(false);
      setCameraError(null);
    };
  }, [showCamera, toast]);

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            setSelfieFile(file);
            setShowCamera(false);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileChange = (type: 'front' | 'back', file: File | null) => {
    if (type === 'front') {
      setIdCardFront(file);
    } else {
      setIdCardBack(file);
    }
  };

  const handleSubmit = async () => {
    if (!idCardFront || !idCardBack || !selfieFile) {
      toast({
        title: 'Documents manquants',
        description: 'Veuillez fournir tous les documents requis.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('id_card_front', idCardFront);
    formData.append('id_card_back', idCardBack);
    formData.append('selfie', selfieFile);

    submitKYCMutation.mutate(formData);
  };

  const getStatusBadge = () => {
    if (!kycStatus) {
      return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Non soumis</Badge>;
    }

    switch (kycStatus.status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Vérifié</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
      case 'not_submitted':
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Non soumis</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérification KYC</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (kycError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérification KYC</CardTitle>
          <CardDescription>Erreur de chargement</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Impossible de charger le statut KYC. Veuillez vérifier que le serveur backend est démarré et que la route /api/kyc/status est accessible.
              <br />
              <small className="text-xs mt-2 block">Erreur: {kycError instanceof Error ? kycError.message : 'Erreur inconnue'}</small>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Vérifier explicitement que le statut est 'approved' pour être considéré comme vérifié
  // Si kycStatus est null/undefined ou si le statut n'est pas 'approved', ce n'est pas vérifié
  const isVerified = kycStatus?.status === 'approved';
  const isPending = kycStatus?.status === 'pending';
  const isRejected = kycStatus?.status === 'rejected';
  const isNotSubmitted = !kycStatus || kycStatus.status === 'not_submitted' || (kycStatus.status !== 'approved' && kycStatus.status !== 'pending' && kycStatus.status !== 'rejected');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vérification KYC</CardTitle>
            <CardDescription>
              Vérification d'identité requise pour publier des annonces
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isVerified && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Votre identité a été vérifiée avec succès. Vous pouvez maintenant publier des annonces.
            </AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Votre demande de vérification est en cours d'examen. Vous serez notifié une fois la vérification terminée.
            </AlertDescription>
          </Alert>
        )}

        {isRejected && kycStatus.rejection_reason && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Vérification rejetée:</strong> {kycStatus.rejection_reason}
              <br />
              Veuillez soumettre à nouveau vos documents.
            </AlertDescription>
          </Alert>
        )}

        {!isVerified && (
          <>
            <div className="space-y-4">
              {/* Carte d'identité avant */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Carte d'identité - Recto <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('front', e.target.files?.[0] || null)}
                    className="hidden"
                    id="id-card-front"
                    disabled={isPending}
                  />
                  <label htmlFor="id-card-front">
                    <Button variant="outline" asChild disabled={isPending}>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {idCardFront ? 'Changer' : 'Télécharger'}
                      </span>
                    </Button>
                  </label>
                  {idCardFront && (
                    <div className="flex items-center gap-2">
                      <img
                        src={URL.createObjectURL(idCardFront)}
                        alt="Prévisualisation recto"
                        className="h-20 w-auto rounded border object-cover"
                      />
                      <span className="text-sm text-muted-foreground">{idCardFront.name}</span>
                    </div>
                  )}
                  {kycStatus?.id_card_front_url && !idCardFront && (
                    <img
                      src={normalizeImageUrl(kycStatus.id_card_front_url)}
                      alt="Carte d'identité recto"
                      className="h-20 w-auto rounded border"
                      onError={(e) => {
                        // Si l'image ne charge pas, essayer avec HTTPS
                        const target = e.currentTarget;
                        if (target.src.startsWith('http://')) {
                          target.src = target.src.replace('http://', 'https://');
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Carte d'identité arrière */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Carte d'identité - Verso <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('back', e.target.files?.[0] || null)}
                    className="hidden"
                    id="id-card-back"
                    disabled={isPending}
                  />
                  <label htmlFor="id-card-back">
                    <Button variant="outline" asChild disabled={isPending}>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {idCardBack ? 'Changer' : 'Télécharger'}
                      </span>
                    </Button>
                  </label>
                  {idCardBack && (
                    <div className="flex items-center gap-2">
                      <img
                        src={URL.createObjectURL(idCardBack)}
                        alt="Prévisualisation verso"
                        className="h-20 w-auto rounded border object-cover"
                      />
                      <span className="text-sm text-muted-foreground">{idCardBack.name}</span>
                    </div>
                  )}
                  {kycStatus?.id_card_back_url && !idCardBack && (
                    <img
                      src={normalizeImageUrl(kycStatus.id_card_back_url)}
                      alt="Carte d'identité verso"
                      className="h-20 w-auto rounded border"
                      onError={(e) => {
                        // Si l'image ne charge pas, essayer avec HTTPS
                        const target = e.currentTarget;
                        if (target.src.startsWith('http://')) {
                          target.src = target.src.replace('http://', 'https://');
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Selfie */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Selfie <span className="text-destructive">*</span>
                </label>
                <div className="space-y-4">
                  {!showCamera && !selfieFile && (
                    <div className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {typeof navigator !== 'undefined' && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices && (
                          <Button
                            variant="outline"
                            onClick={() => setShowCamera(true)}
                            disabled={isPending}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Prendre un selfie
                          </Button>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelfieFile(file);
                            }
                          }}
                          className="hidden"
                          id="selfie-upload"
                          disabled={isPending}
                        />
                        <label htmlFor="selfie-upload">
                          <Button variant="outline" asChild disabled={isPending}>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {typeof navigator !== 'undefined' && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices 
                                ? 'Ou uploader depuis la galerie' 
                                : 'Uploader une photo'}
                            </span>
                          </Button>
                        </label>
                      </div>
                      {(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) && (
                        <p className="text-xs text-muted-foreground">
                          ⚠️ La caméra en direct nécessite HTTPS. Vous pouvez uploader une photo depuis votre galerie.
                        </p>
                      )}
                    </div>
                  )}

                  {showCamera && (
                    <div className="space-y-4">
                      <div className="relative border rounded-lg overflow-hidden bg-black min-h-[300px] flex items-center justify-center">
                        {cameraLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Chargement de la caméra...</p>
                            </div>
                          </div>
                        )}
                        {cameraError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 p-4">
                            <Alert variant="destructive" className="max-w-md">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{cameraError}</AlertDescription>
                            </Alert>
                          </div>
                        )}
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full max-w-md mx-auto"
                          style={{ transform: 'scaleX(-1)', display: cameraError ? 'none' : 'block' }}
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={captureSelfie}
                          disabled={cameraLoading || !!cameraError || !streamRef.current}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capturer
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowCamera(false);
                          setCameraError(null);
                          setCameraLoading(false);
                        }}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}

                  {selfieFile && !showCamera && (
                    <div className="mt-4 flex items-center gap-4">
                      <img
                        src={URL.createObjectURL(selfieFile)}
                        alt="Prévisualisation selfie"
                        className="h-32 w-auto rounded border object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selfieFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selfieFile.size / 1024).toFixed(1)} KB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setSelfieFile(null)}
                          disabled={isPending}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  )}

                  {kycStatus?.selfie_url && !selfieFile && !showCamera && (
                    <div className="mt-4">
                      <img
                        src={normalizeImageUrl(kycStatus.selfie_url)}
                        alt="Selfie soumis"
                        className="h-32 w-auto rounded border"
                        onError={(e) => {
                          // Si l'image ne charge pas, essayer avec HTTPS une seule fois
                          const target = e.currentTarget;
                          if (target.src.startsWith('http://') && !target.dataset.httpsTried) {
                            target.dataset.httpsTried = 'true';
                            target.src = target.src.replace('http://', 'https://');
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!idCardFront || !idCardBack || !selfieFile || submitKYCMutation.isPending || isPending}
              className="w-full"
            >
              {submitKYCMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Soumission en cours...
                </>
              ) : (
                'Soumettre la vérification'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

