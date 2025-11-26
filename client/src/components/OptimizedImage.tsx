import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean; // For LCP images
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

// Generate srcset for responsive images
function generateSrcSet(src: string, widths: number[]): string {
  // For external URLs (Unsplash), use their API
  if (src.includes('unsplash.com')) {
    return widths
      .map(w => `${src.replace(/w=\d+/, `w=${w}`).replace(/&w=\d+/, `&w=${w}`)} ${w}w`)
      .join(', ');
  }
  
  // For local images, just return the original
  return '';
}

// Placeholder SVG for loading state
const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3C/svg%3E`;

const errorSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='14'%3EImage non disponible%3C/text%3E%3C/svg%3E`;

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  onLoad,
  onError,
  fallback = errorSvg,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  // Generate srcset for Unsplash images
  const srcSet = src.includes('unsplash.com') 
    ? generateSrcSet(src, [400, 640, 768, 1024, 1280])
    : undefined;

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        className
      )}
      style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
    >
      {/* Placeholder skeleton */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted/80 to-muted"
          style={{ backgroundSize: '200% 100%' }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={hasError ? fallback : src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
});

export default OptimizedImage;

