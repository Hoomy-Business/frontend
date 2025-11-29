import { useState, useEffect, useCallback } from 'react';
import { Phone, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PhoneChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPhone?: string | null;
}

type Step = 'verify_old_phone' | 'new_phone' | 'success';

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 4) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  const last4 = cleaned.slice(-4);
  const prefix = cleaned.slice(0, -4);
  return `${prefix.slice(0, 2)}***${last4}`;
};

export function PhoneChangeDialog({ 
  open, 
  onClose, 
  onSuccess,
  currentPhone 
}: PhoneChangeDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('verify_old_phone');
  const [oldPhoneCode, setOldPhoneCode] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);

  const handleRequestOldPhoneCode = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      await apiRequest('POST', '/auth/phone/request-change', {});
      const masked = currentPhone ? maskPhone(currentPhone) : 'votre téléphone';
      setMaskedPhone(masked);
      setCountdown(60);

      toast({
        title: 'Code envoyé',
        description: `Un code de confirmation a été envoyé à ${masked}`,
      });
    } catch (err: any) {
      let errorMessage = 'Erreur lors de l\'envoi du code';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err.code === 'SMS_SERVICE_UNAVAILABLE') {
        errorMessage = 'Le service d\'envoi de SMS est temporairement indisponible. Veuillez contacter le support ou réessayer plus tard.';
        if (err.debug_code && process.env.NODE_ENV !== 'production') {
          errorMessage += `\n\nCode de développement: ${err.debug_code}`;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPhone, toast]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep('verify_old_phone');
      setOldPhoneCode('');
      setNewPhone('');
      setError(null);
      setCountdown(0);
      setMaskedPhone(currentPhone ? maskPhone(currentPhone) : null);
      // Envoyer automatiquement le code à l'ancien téléphone
      handleRequestOldPhoneCode();
    }
  }, [open, currentPhone, handleRequestOldPhoneCode]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleVerifyOldPhone = async () => {
    setError(null);
    setLoading(true);

    try {
      await apiRequest('POST', '/auth/phone/verify-change-code', { code: oldPhoneCode });
      setStep('new_phone');
      setError(null);
    } catch (err: any) {
      if (err.code === 'CODE_EXPIRED') {
        setError('Le code a expiré. Veuillez demander un nouveau code.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Code incorrect';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = async () => {
    setError(null);
    setLoading(true);

    try {
      await apiRequest('PUT', '/auth/profile', { 
        phone: newPhone,
        phone_change_code: oldPhoneCode 
      });

      setStep('success');

      toast({
        title: 'Succès',
        description: 'Votre numéro de téléphone a été modifié. Un code de vérification a été envoyé au nouveau numéro.',
      });

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de numéro';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setError(null);
    setLoading(true);

    try {
      if (step === 'verify_old_phone') {
        await handleRequestOldPhoneCode();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du renvoi du code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step !== 'success') {
      if (confirm('Voulez-vous annuler le changement de numéro?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {step === 'success' ? 'Numéro modifié' : 'Changer votre numéro de téléphone'}
          </DialogTitle>
          <DialogDescription>
            {step === 'verify_old_phone' && `Pour des raisons de sécurité, nous devons vérifier votre identité. Entrez le code envoyé à ${maskedPhone || currentPhone || 'votre téléphone actuel'}.`}
            {step === 'new_phone' && 'Entrez votre nouveau numéro de téléphone. Un code de vérification sera envoyé à ce numéro.'}
            {step === 'success' && 'Votre numéro de téléphone a été modifié avec succès!'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'verify_old_phone' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old_phone_code">Code de confirmation</Label>
              <Input
                id="old_phone_code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={oldPhoneCode}
                onChange={(e) => setOldPhoneCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Code envoyé à {maskedPhone || currentPhone}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={countdown > 0 || loading}
                className="text-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
              </Button>
            </div>
          </div>
        )}

        {step === 'new_phone' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new_phone">Nouveau numéro de téléphone</Label>
              <Input
                id="new_phone"
                type="tel"
                placeholder="+41 76 123 45 67"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="text-lg"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Format: +41 XX XXX XX XX ou 0XX XXX XX XX. Vous devrez vérifier ce nouveau numéro après le changement.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-600">Numéro modifié!</p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Un code de vérification a été envoyé à votre nouveau numéro.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'verify_old_phone' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleVerifyOldPhone} 
                disabled={oldPhoneCode.length !== 6 || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Vérifier
              </Button>
            </>
          )}

          {step === 'new_phone' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('verify_old_phone');
                  setNewPhone('');
                  setError(null);
                }}
              >
                Retour
              </Button>
              <Button 
                onClick={handleChangePhone} 
                disabled={!newPhone.trim() || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Changer le numéro
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

