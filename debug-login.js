// Script de diagnostic pour le problème de connexion
// À exécuter dans la console du navigateur (F12) AVANT de cliquer sur "Sign In"

console.log('🔍 Diagnostic de connexion');
console.log('==========================');

// Intercepter les requêtes de login
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('/auth/login')) {
    console.log('📤 Requête de login détectée:', url);
    console.log('📦 Données:', args[1]?.body);
    
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('📥 Réponse reçue:', response.status, response.statusText);
        return response.clone().json().then(data => {
          console.log('📄 Données de réponse:', data);
          if (response.ok && data.token) {
            console.log('✅ Connexion réussie! Token:', data.token.substring(0, 30) + '...');
            console.log('👤 User:', data.user);
          } else {
            console.error('❌ Erreur de connexion:', data);
          }
          return response;
        }).catch(err => {
          console.error('❌ Erreur parsing JSON:', err);
          return response;
        });
      })
      .catch(error => {
        console.error('❌ Erreur réseau:', error);
        throw error;
      });
  }
  return originalFetch.apply(this, args);
};

console.log('✅ Intercepteur installé. Essayez de vous connecter maintenant.');
console.log('📋 Surveillez les messages ci-dessus pour voir ce qui se passe.');


