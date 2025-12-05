import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  onRef?: (ref: { getSignature: () => string | null }) => void;
}

export function SignaturePad({ onSave, onCancel, title, description, onRef }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Exposer une méthode pour récupérer la signature
  const getSignature = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is null');
      return null;
    }
    
    // Vérifier si le canvas a du contenu en vérifiant les pixels
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Cannot get canvas context');
      return null;
    }
    
    // Vérifier si le canvas a du contenu (pas juste blanc)
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some((pixel, index) => {
        // Vérifier les pixels non-transparents (alpha > 0)
        return index % 4 === 3 && pixel > 0;
      });
      
      if (!hasContent) {
        console.error('Canvas appears to be empty');
        return null;
      }
    } catch (e) {
      console.error('Error checking canvas content:', e);
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    console.log('Signature retrieved from canvas - Length:', dataUrl.length, 'First 30 chars:', dataUrl.substring(0, 30));
    return dataUrl;
  };

  // Exposer la méthode via ref si fournie
  useEffect(() => {
    if (onRef) {
      onRef({ getSignature });
    }
  }, [onRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas (une seule fois au montage)
    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Ne réinitialiser que si les dimensions ont changé
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);
      }
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    setupCanvas();

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
        if (!touch) {
          return { x: 0, y: 0 };
        }
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }
    };

    // Démarrer le dessin
    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      const coords = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    };

    // Dessiner
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const coords = getCoordinates(e);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setHasSignature(true);
    };

    // Arrêter le dessin
    const stopDrawing = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
      }
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

    // Gérer le redimensionnement de la fenêtre
    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Pas de dépendances - ne s'exécute qu'une fois

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

