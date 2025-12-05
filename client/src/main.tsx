import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./lib/useLanguage";
import "./lib/cacheUtils"; // Load cache utilities globally

// Type declaration for window properties
declare global {
  interface Window {
    __swListenerSetup?: boolean;
    __hideLoader?: () => void;
  }
}

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

// Unregister service worker if it's causing issues (one-time check)
if ('serviceWorker' in navigator) {
  const swDisabled = sessionStorage.getItem('sw_disabled');
  if (!swDisabled) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length > 0) {
        console.log('[App] Service workers detected:', registrations.length);
        // Unregister all service workers to prevent reload loops
        registrations.forEach((registration) => {
          registration.unregister().then((success) => {
            if (success) {
              console.log('[App] Service worker unregistered to prevent reload loops');
              sessionStorage.setItem('sw_disabled', 'true');
            }
          });
        });
      }
    });
  }
}

// DISABLED: Service worker auto-reload is causing infinite loops
// We'll handle updates manually or through user interaction only
if (false && 'serviceWorker' in navigator) {
  const lastReloadTime = sessionStorage.getItem('sw_last_reload');
  const now = Date.now();
  const RELOAD_COOLDOWN = 60000; // 60 seconds cooldown (increased)
  
  // Ne pas recharger si on vient de recharger récemment
  if (lastReloadTime && (now - parseInt(lastReloadTime)) < RELOAD_COOLDOWN) {
    console.log('[App] Skipping SW reload - recently reloaded', Math.floor((RELOAD_COOLDOWN - (now - parseInt(lastReloadTime))) / 1000), 'seconds ago');
  } else {
    // Only set up listener once per page load
    if (!window.__swListenerSetup) {
      window.__swListenerSetup = true;
      
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          const currentTime = Date.now();
          const lastReload = sessionStorage.getItem('sw_last_reload');
          
          // Double check cooldown before reloading
          if (lastReload && (currentTime - parseInt(lastReload)) < RELOAD_COOLDOWN) {
            console.log('[App] Ignoring SW update message - still in cooldown period');
            return;
          }
          
          console.log('[App] Service Worker updated - user will need to manually refresh');
          sessionStorage.setItem('sw_last_reload', currentTime.toString());
          
          // DON'T auto-reload - let user do it manually
          // This prevents infinite loops
        }
      }, { once: false });
    }
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
// DISABLED: Auto-reload causes infinite loops
function handleRenderError() {
  console.error('[App] Render error detected - NOT auto-reloading to prevent loops');
  
  // Just show error message, don't reload
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; padding: 20px; text-align: center;">
        <h1 style="margin-bottom: 16px; color: #1f2937;">Une erreur est survenue</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">Le site n'a pas pu se charger correctement.</p>
        <p style="color: #6b7280; margin-bottom: 24px; font-size: 14px;">Veuillez recharger manuellement la page (F5 ou Ctrl+R).</p>
        <button onclick="window.location.reload();" 
                style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          Recharger la page manuellement
        </button>
      </div>
    `;
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

// DISABLED: Error handlers that auto-reload - they cause infinite loops
// Only log errors, don't trigger reloads
window.addEventListener('error', (event) => {
  // Just log, don't reload
  if (event.message?.includes('Failed to fetch dynamically imported module') ||
      event.message?.includes('Loading chunk') ||
      event.message?.includes('Loading module')) {
    console.error('[App] Module loading error detected (auto-reload disabled):', event.message);
    console.error('[App] Please manually refresh the page if needed');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Just log, don't reload
  if (event.reason?.message?.includes('Failed to fetch dynamically imported module') ||
      event.reason?.message?.includes('Loading chunk')) {
    console.error('[App] Unhandled module loading error (auto-reload disabled):', event.reason);
    console.error('[App] Please manually refresh the page if needed');
  }
});

// Rendre l'app
renderApp();
