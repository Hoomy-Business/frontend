import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'wouter';

// ============================================
// TYPES
// ============================================

type FallbackRender = (props: { error: Error; resetError: () => void }) => ReactNode;

interface Props {
  children: ReactNode;
  fallback?: FallbackRender | ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================
// ERROR BOUNDARY CLASS
// ============================================

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Store error for debugging
    if (typeof window !== 'undefined') {
      (window as Window & { __lastError?: unknown }).__lastError = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        timestamp: new Date().toISOString(),
      };
      
      // Log error to console for debugging
      console.error('❌ ErrorBoundary caught an error:', error.message);
      if (error.message.includes('is not a function')) {
        console.error('💡 This error suggests that a value is not of the expected type (e.g., array, object). Check that data is properly validated before use.');
      }
    }
    
    this.setState({
      error,
      errorInfo,
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    // Clear module cache if possible
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('workbox') || name.includes('vite')) {
            caches.delete(name);
          }
        });
      });
    }
    
    this.handleReset();
    // Force a hard reload to clear module cache
    window.location.reload();
  };
  
  handleRetry = async (): Promise<void> => {
    // Try to clear the error and retry loading
    this.handleReset();
    
    // If it's a module loading error, try to reload the page
    if (this.state.error?.message?.includes('loading dynamically imported module')) {
      // Force a hard reload
      window.location.reload();
    }
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Support function-as-fallback pattern
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        });
      }
      
      // Support ReactNode fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Une erreur s&apos;est produite</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Désolé, une erreur inattendue s&apos;est produite. Veuillez réessayer.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono text-destructive mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer text-muted-foreground">
                        Détails techniques
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto p-2 bg-background rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {this.state.error?.message?.includes('loading dynamically imported module') && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                    <strong>Erreur de chargement de module :</strong> Le fichier JavaScript n&apos;a pas pu être chargé. Cela peut être dû à :
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1">
                    <li>Un problème de cache du navigateur</li>
                    <li>Un problème de réseau</li>
                    <li>Un fichier manquant après un déploiement</li>
                  </ul>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                    Essayez de vider le cache de votre navigateur (Ctrl+Shift+Delete) ou utilisez le bouton &quot;Recharger la page&quot; ci-dessous.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={this.handleReload} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recharger la page
                </Button>
                {this.state.error?.message?.includes('loading dynamically imported module') && (
                  <Button onClick={this.handleRetry} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Retour à l&apos;accueil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// HOOK FOR MANUAL ERROR TRIGGERING
// ============================================

export function useErrorHandler(): (error: Error) => void {
  return (error: Error) => {
    throw error;
  };
}
