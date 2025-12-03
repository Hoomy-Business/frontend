import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function SignaturePad({ onSave, onCancel, title, description }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fonction pour obtenir les coordonnées de la souris/touch
    const getCoordinates = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e instanceof MouseEvent) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      } else {
        const touch = e.touches[0] || e.changedTouches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }
    };

    // Démarrer le dessin
    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const coords = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    };

    // Dessiner
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const coords = getCoordinates(e);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setHasSignature(true);
    };

    // Arrêter le dessin
    const stopDrawing = () => {
      setIsDrawing(false);
    };

    // Événements souris
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Événements tactile
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isDrawing]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    
    // Convertir en base64
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-muted/20">
        <canvas
          ref={canvasRef}
          className="w-full h-48 cursor-crosshair touch-none bg-white rounded"
          style={{ maxWidth: '100%' }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={clearSignature}
          disabled={!hasSignature}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Effacer
        </Button>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasSignature}
          >
            Enregistrer la signature
          </Button>
        </div>
      </div>
      
      {!hasSignature && (
        <p className="text-sm text-muted-foreground text-center">
          Veuillez signer dans la zone ci-dessus
        </p>
      )}
    </div>
  );
}

