import { useState, useEffect } from 'react';
import { Phone, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PhoneVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPhone?: string | null;
}

type Step = 'phone_input' | 'code_verification' | 'success';

export function PhoneVerificationDialog({ 
  open, 
  onClose, 
  onSuccess,
  currentPhone 
}: PhoneVerificationDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('phone_input');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep('phone_input');
      setPhone(currentPhone || '');
      setCode('');
      setError(null);
      setCountdown(0);
    }
  }, [open, currentPhone]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestCode = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiRequest<{ 
        message: string; 
        expires_in_minutes: number;
        phone_masked: string;
      }>('POST', '/auth/phone/request-verification', { phone });

      setMaskedPhone(response.phone_masked);
      setStep('code_verification');
      setCountdown(60); // 60 seconds before can resend

      toast({
        title: 'Code envoyé',
        description: `Un code de vérification a été envoyé au ${response.phone_masked}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    setLoading(true);

    try {
      await apiRequest('POST', '/auth/phone/verify', { code });

      setStep('success');

      toast({
        title: 'Succès',
        description: 'Votre numéro de téléphone a été vérifié',
      });

      // Wait a bit then close and trigger success callback
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
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

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setError(null);
    setLoading(true);

    try {
      await apiRequest('POST', '/auth/phone/resend-code', {});
      setCountdown(60);
      setCode('');

      toast({
        title: 'Code renvoyé',
        description: 'Un nouveau code a été envoyé',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du renvoi du code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'code_verification') {
      // Confirm if user wants to cancel verification in progress
      if (confirm('Voulez-vous annuler la vérification en cours? Vous devrez recommencer.')) {
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
            {step === 'success' ? 'Téléphone vérifié' : 'Vérifier votre téléphone'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone_input' && 'Entrez votre numéro de téléphone suisse pour recevoir un code de vérification par SMS.'}
            {step === 'code_verification' && `Entrez le code à 6 chiffres envoyé au ${maskedPhone || 'votre téléphone'}.`}
            {step === 'success' && 'Votre numéro de téléphone a été vérifié avec succès!'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'phone_input' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+41 76 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-lg"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Format: +41 XX XXX XX XX ou 0XX XXX XX XX
              </p>
            </div>
          </div>
        )}

        {step === 'code_verification' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Le code expire dans 15 minutes
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

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-600">Numéro vérifié!</p>
          </div>
        )}

        <DialogFooter>
          {step === 'phone_input' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleRequestCode} 
                disabled={!phone.trim() || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Envoyer le code
              </Button>
            </>
          )}

          {step === 'code_verification' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('phone_input');
                  setCode('');
                  setError(null);
                }}
              >
                Changer de numéro
              </Button>
              <Button 
                onClick={handleVerifyCode} 
                disabled={code.length !== 6 || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Vérifier
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

