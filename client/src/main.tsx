import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./lib/useLanguage";

// Corriger le pathname si on est sur /index.html/...
if (window.location.pathname.startsWith('/index.html/')) {
  const cleanPath = window.location.pathname.replace('/index.html', '');
  window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
}

// Gérer la redirection depuis 404.html
// Attendre que le DOM soit prêt avant de gérer la redirection
if (typeof window !== 'undefined') {
  const redirectPath = sessionStorage.getItem('redirectPath');
  if (redirectPath && window.location.pathname === '/') {
    sessionStorage.removeItem('redirectPath');
    // Utiliser replaceState pour mettre à jour l'URL sans recharger
    // Attendre un peu pour que le router soit initialisé
    setTimeout(() => {
      window.history.replaceState(null, '', redirectPath);
      // Déclencher un événement popstate pour que le router réagisse
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    }, 0);
  }
}

// Hide initial loader when React is ready
if (typeof window !== 'undefined' && (window as any).__hideLoader) {
  (window as any).__hideLoader();
}

// Register Service Worker for offline support and caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
        
        // Check for updates immediately and periodically
        const checkForUpdates = () => {
          registration.update().catch((err) => {
            console.log('SW update check failed:', err);
          });
        };
        
        // Check for updates on page load
        checkForUpdates();
        
        // Check for updates every 5 minutes
        setInterval(checkForUpdates, 5 * 60 * 1000);
        
        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available - prompt user to reload
                console.log('New service worker available');
                // Auto-reload after a short delay to use new service worker
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

// Ensure root element exists before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Make sure there's a <div id='root'></div> in your HTML.");
}

// Render the app with error handling
try {
  createRoot(rootElement).render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; font-family: system-ui, sans-serif;">
      <div style="text-align: center; max-width: 500px;">
        <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">Erreur de démarrage</h1>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">Une erreur critique s'est produite lors du démarrage de l'application.</p>
        <button 
          onclick="window.location.reload()" 
          style="padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 1rem;"
        >
          Recharger la page
        </button>
      </div>
    </div>
  `;
}
