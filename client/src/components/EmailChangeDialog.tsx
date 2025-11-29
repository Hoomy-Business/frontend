import { useState, useEffect, useCallback } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface EmailChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentEmail?: string | null;
}

type Step = 'verify_old_email' | 'new_email' | 'success';

const maskEmail = (email: string) => {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (!local || local.length <= 2) return email;
  const masked = local[0] + '***' + local[local.length - 1];
  return `${masked}@${domain}`;
};

export function EmailChangeDialog({ 
  open, 
  onClose, 
  onSuccess,
  currentEmail 
}: EmailChangeDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('verify_old_email');
  const [oldEmailCode, setOldEmailCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  const handleRequestOldEmailCode = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      await apiRequest('POST', '/auth/email/request-change', {});
      setMaskedEmail(currentEmail ? maskEmail(currentEmail) : 'votre email');
      setCountdown(60);

      toast({
        title: 'Code envoyé',
        description: `Un code de confirmation a été envoyé à ${maskedEmail || currentEmail}`,
      });
    } catch (err: any) {
      let errorMessage = 'Erreur lors de l\'envoi du code';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err.code === 'EMAIL_SERVICE_UNAVAILABLE') {
        errorMessage = 'Le service d\'envoi d\'email est temporairement indisponible. Veuillez contacter le support ou réessayer plus tard.';
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
  }, [currentEmail, toast]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep('verify_old_email');
      setOldEmailCode('');
      setNewEmail('');
      setError(null);
      setCountdown(0);
      setMaskedEmail(currentEmail ? maskEmail(currentEmail) : null);
      // Envoyer automatiquement le code à l'ancien email
      handleRequestOldEmailCode();
    }
  }, [open, currentEmail, handleRequestOldEmailCode]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleVerifyOldEmail = async () => {
    setError(null);
    setLoading(true);

    try {
      await apiRequest('POST', '/auth/email/verify-change-code', { code: oldEmailCode });
      setStep('new_email');
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

  const handleChangeEmail = async () => {
    setError(null);
    setLoading(true);

    try {
      await apiRequest('PUT', '/auth/profile', { 
        email: newEmail,
        email_change_code: oldEmailCode 
      });

      setStep('success');

      toast({
        title: 'Succès',
        description: 'Votre email a été modifié. Un code de vérification a été envoyé au nouvel email.',
      });

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement d\'email';
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
      if (step === 'verify_old_email') {
        await handleRequestOldEmailCode();
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
      if (confirm('Voulez-vous annuler le changement d\'email?')) {
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
            <Mail className="h-5 w-5" />
            {step === 'success' ? 'Email modifié' : 'Changer votre email'}
          </DialogTitle>
          <DialogDescription>
            {step === 'verify_old_email' && `Pour des raisons de sécurité, nous devons vérifier votre identité. Entrez le code envoyé à ${maskedEmail || currentEmail || 'votre email actuel'}.`}
            {step === 'new_email' && 'Entrez votre nouveau email. Un code de vérification sera envoyé à cette adresse.'}
            {step === 'success' && 'Votre email a été modifié avec succès!'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'verify_old_email' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old_email_code">Code de confirmation</Label>
              <Input
                id="old_email_code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={oldEmailCode}
                onChange={(e) => setOldEmailCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Code envoyé à {maskedEmail || currentEmail}
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

        {step === 'new_email' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new_email">Nouvel email</Label>
              <Input
                id="new_email"
                type="email"
                placeholder="nouveau@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="text-lg"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Vous devrez vérifier ce nouvel email après le changement.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-600">Email modifié!</p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Un code de vérification a été envoyé à votre nouvel email.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'verify_old_email' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleVerifyOldEmail} 
                disabled={oldEmailCode.length !== 6 || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Vérifier
              </Button>
            </>
          )}

          {step === 'new_email' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('verify_old_email');
                  setNewEmail('');
                  setError(null);
                }}
              >
                Retour
              </Button>
              <Button 
                onClick={handleChangeEmail} 
                disabled={!newEmail.trim() || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Changer l'email
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

