import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SignaturePad } from '@/components/SignaturePad';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle } from 'lucide-react';

interface ContractSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSign: (signatureData: string) => Promise<void>;
  role: 'owner' | 'student';
  contractTitle?: string;
  isLoading?: boolean;
}

export function ContractSignatureDialog({
  open,
  onOpenChange,
  onSign,
  role,
  contractTitle,
  isLoading = false,
}: ContractSignatureDialogProps) {
  const signaturePadRef = useRef<{ getSignature: () => string | null }>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);

  const handleSignatureSave = (data: string) => {
    setSignatureData(data);
  };

  const handleConfirm = async () => {
    // TOUJOURS récupérer la signature directement du canvas au moment de la confirmation
    // pour éviter les problèmes de synchronisation
    let finalSignature: string | null = null;
    
    if (signaturePadRef.current) {
      finalSignature = signaturePadRef.current.getSignature();
    }
    
    // Si on n'a pas pu récupérer du canvas, utiliser celle sauvegardée
    if (!finalSignature) {
      finalSignature = signatureData;
    }
    
    if (!finalSignature) {
      console.error('No signature to send - canvas and saved data are both empty');
      return;
    }
    
    // Vérifier que la signature est au bon format
    if (!finalSignature.startsWith('data:image/')) {
      console.error('Invalid signature format:', finalSignature.substring(0, 50));
      return;
    }
    
    // Vérifier que la signature n'est pas vide (juste le header)
    if (finalSignature.length < 100) {
      console.error('Signature seems empty, length:', finalSignature.length);
      return;
    }
    
    console.log('Sending signature - Length:', finalSignature.length, 'First 50 chars:', finalSignature.substring(0, 50));
    
    setIsSigning(true);
    try {
      await onSign(finalSignature);
      setSignatureData('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error signing contract:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleCancel = () => {
    setSignatureData('');
    onOpenChange(false);
  };

  const roleLabel = role === 'owner' ? 'Propriétaire' : 'Locataire';
  const roleLabelEn = role === 'owner' ? 'Lessor' : 'Lessee';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Signature du contrat
          </DialogTitle>
          <DialogDescription>
            {contractTitle && (
              <span className="block mb-2 font-medium">{contractTitle}</span>
            )}
            En tant que <strong>{roleLabel}</strong>, veuillez signer électroniquement le contrat de location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Important</p>
              <p className="text-sm">
                En signant ce contrat, vous confirmez avoir lu et approuvé toutes les conditions.
                La signature électronique a la même valeur légale qu'une signature manuscrite selon la loi suisse.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Signature du {roleLabel} (LE {roleLabelEn.toUpperCase()})
            </p>
            <p className="text-xs text-muted-foreground">
              (Signature précédée de la mention « Lu et approuvé »)
            </p>
          </div>

          <SignaturePad
            onSave={handleSignatureSave}
            onCancel={handleCancel}
            onRef={(ref) => { signaturePadRef.current = ref; }}
            title="Votre signature"
            description="Veuillez signer dans la zone ci-dessous en utilisant votre souris ou votre doigt"
          />

          {signatureData && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Aperçu de votre signature :</p>
              <div className="border rounded p-2 bg-white">
                <img 
                  src={signatureData} 
                  alt="Signature preview" 
                  className="max-h-20 mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSigning || isLoading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!signatureData || isSigning || isLoading}
          >
            {isSigning || isLoading ? 'Signature en cours...' : 'Confirmer et signer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

