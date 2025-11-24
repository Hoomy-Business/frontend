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
const redirectPath = sessionStorage.getItem('redirectPath');
if (redirectPath && window.location.pathname === '/') {
  sessionStorage.removeItem('redirectPath');
  // Utiliser replaceState pour mettre à jour l'URL sans recharger
  window.history.replaceState(null, '', redirectPath);
  // Déclencher un événement popstate pour que le router réagisse
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
}

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
