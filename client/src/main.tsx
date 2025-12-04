import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./lib/useLanguage";
import "./lib/cacheUtils"; // Load cache utilities globally

// Corriger le pathname si on est sur /index.html/...
if (window.location.pathname.startsWith('/index.html/')) {
  const cleanPath = window.location.pathname.replace('/index.html', '');
  window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
}

// Gérer la redirection depuis 404.html (une seule fois)
if (typeof window !== 'undefined') {
  const redirectPath = sessionStorage.getItem('redirectPath');
  const redirectHandled = sessionStorage.getItem('redirectHandled');
  
  if (redirectPath && window.location.pathname === '/' && !redirectHandled) {
    sessionStorage.setItem('redirectHandled', 'true');
    sessionStorage.removeItem('redirectPath');
    
    // Clear the flag after 5 seconds to allow future redirects if needed
    setTimeout(() => {
      sessionStorage.removeItem('redirectHandled');
    }, 5000);
    
    setTimeout(() => {
      window.history.replaceState(null, '', redirectPath);
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    }, 0);
  }
}

// Marquer le body comme chargé
if (typeof document !== 'undefined') {
  document.body.classList.add('loaded');
}

// Écouter les mises à jour du Service Worker (avec protection contre les boucles)
if ('serviceWorker' in navigator) {
  let reloadAttempted = false;
  const lastReloadTime = sessionStorage.getItem('sw_last_reload');
  const now = Date.now();
  
  // Ne pas recharger si on vient de recharger il y a moins de 10 secondes
  if (lastReloadTime && (now - parseInt(lastReloadTime)) < 10000) {
    console.log('[App] Skipping SW reload - recently reloaded');
  } else {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_UPDATED' && !reloadAttempted) {
        console.log('[App] Service Worker updated to:', event.data.version);
        reloadAttempted = true;
        sessionStorage.setItem('sw_last_reload', now.toString());
        
        // Attendre un peu avant de recharger pour éviter les boucles
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            window.location.reload();
          }
        }, 1000);
      }
    }, { once: true });
  }
}

// Fonction pour rendre l'app avec gestion d'erreur
function renderApp() {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error('[App] Root element not found');
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    
    // Cacher le loader initial après le rendu
    if (typeof window !== 'undefined' && (window as any).__hideLoader) {
      (window as any).__hideLoader();
    }
  } catch (error) {
    console.error('[App] Error rendering app:', error);
    handleRenderError();
  }
}

// Gestion des erreurs de rendu (page blanche)
function handleRenderError() {
  const hasReloaded = sessionStorage.getItem('app_reload_attempted');
  
  if (!hasReloaded) {
    console.log('[App] Attempting reload to fix render error...');
    sessionStorage.setItem('app_reload_attempted', 'true');
    
    // Désenregistrer le service worker et recharger
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      }).finally(() => {
        // Vider les caches et recharger
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          }).finally(() => {
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  } else {
    // On a déjà essayé de recharger, afficher un message d'erreur
    sessionStorage.removeItem('app_reload_attempted');
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; padding: 20px; text-align: center;">
          <h1 style="margin-bottom: 16px; color: #1f2937;">Une erreur est survenue</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">Le site n'a pas pu se charger correctement.</p>
          <button onclick="sessionStorage.clear(); localStorage.clear(); window.location.reload();" 
                  style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            Recharger la page
          </button>
        </div>
      `;
    }
  }
}

// Effacer le flag de reload au chargement réussi
window.addEventListener('load', () => {
  // Si on arrive ici, le chargement a réussi
  setTimeout(() => {
    sessionStorage.removeItem('app_reload_attempted');
    // Clear SW reload flag after 30 seconds
    const swReloadTime = sessionStorage.getItem('sw_last_reload');
    if (swReloadTime && (Date.now() - parseInt(swReloadTime)) > 30000) {
      sessionStorage.removeItem('sw_last_reload');
    }
  }, 2000);
});

// Détecter les erreurs globales qui pourraient causer une page blanche (avec protection contre les boucles)
let errorCount = 0;
const ERROR_THRESHOLD = 3;
const ERROR_WINDOW = 5000; // 5 seconds
let lastErrorTime = 0;

window.addEventListener('error', (event) => {
  const now = Date.now();
  
  // Reset counter if enough time has passed
  if (now - lastErrorTime > ERROR_WINDOW) {
    errorCount = 0;
  }
  
  lastErrorTime = now;
  errorCount++;
  
  // Only handle if it's a module loading error and we haven't exceeded threshold
  if ((event.message?.includes('Failed to fetch dynamically imported module') ||
       event.message?.includes('Loading chunk') ||
       event.message?.includes('Loading module')) && 
      errorCount <= ERROR_THRESHOLD) {
    console.error('[App] Module loading error:', event.message, `(${errorCount}/${ERROR_THRESHOLD})`);
    handleRenderError();
  } else if (errorCount > ERROR_THRESHOLD) {
    console.error('[App] Too many errors detected, stopping auto-reload to prevent loop');
  }
});

// Détecter les rejets de promesses non gérées (avec protection contre les boucles)
window.addEventListener('unhandledrejection', (event) => {
  const now = Date.now();
  
  // Reset counter if enough time has passed
  if (now - lastErrorTime > ERROR_WINDOW) {
    errorCount = 0;
  }
  
  lastErrorTime = now;
  errorCount++;
  
  if ((event.reason?.message?.includes('Failed to fetch dynamically imported module') ||
       event.reason?.message?.includes('Loading chunk')) && 
      errorCount <= ERROR_THRESHOLD) {
    console.error('[App] Unhandled module loading error:', event.reason, `(${errorCount}/${ERROR_THRESHOLD})`);
    handleRenderError();
  } else if (errorCount > ERROR_THRESHOLD) {
    console.error('[App] Too many errors detected, stopping auto-reload to prevent loop');
  }
});

// Rendre l'app
renderApp();
