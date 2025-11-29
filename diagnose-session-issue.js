// Script de diagnostic pour le problème "Session expirée"
// À exécuter dans la console du navigateur (F12)

console.log('🔍 Diagnostic de la session...');
console.log('================================');

// 1. Vérifier le localStorage
const token = localStorage.getItem('auth_token');
const user = localStorage.getItem('auth_user');
const session = sessionStorage.getItem('auth_session');

console.log('\n1️⃣ Données stockées:');
console.log('  Token:', token ? token.substring(0, 30) + '...' : '❌ Aucun token');
console.log('  User:', user ? JSON.parse(user).email : '❌ Aucun utilisateur');
console.log('  Session:', session ? '✅ Présente' : '❌ Aucune session');

// 2. Tester le backend
console.log('\n2️⃣ Test du backend...');
fetch('https://backend.hoomy.site/api/locations/cantons')
  .then(async (r) => {
    const status = r.status;
    const data = await r.json().catch(() => null);
    
    if (status === 200 && Array.isArray(data)) {
      console.log('  ✅ Backend fonctionne (retourne', data.length, 'cantons)');
      return true;
    } else {
      console.log('  ⚠️  Backend répond mais avec un statut:', status);
      return false;
    }
  })
  .catch((err) => {
    console.log('  ❌ Backend ne répond pas:', err.message);
    console.log('  💡 Vérifiez que PM2 est démarré sur le serveur');
    return false;
  })
  .then((backendOk) => {
    // 3. Tester la route d'authentification
    if (backendOk && token) {
      console.log('\n3️⃣ Test de l\'authentification...');
      return fetch('https://backend.hoomy.site/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(async (r) => {
        const status = r.status;
        const data = await r.json().catch(() => ({ error: r.statusText }));
        
        if (status === 200) {
          console.log('  ✅ Authentification OK');
          console.log('  User:', data.user?.email);
          return true;
        } else if (status === 401) {
          console.log('  ❌ Token invalide ou expiré (401)');
          console.log('  💡 Solution: Nettoyer et se reconnecter');
          return false;
        } else if (status === 502) {
          console.log('  ❌ Backend ne répond pas (502 Bad Gateway)');
          console.log('  💡 Solution: Vérifier que PM2 est démarré');
          return false;
        } else {
          console.log('  ⚠️  Erreur inattendue:', status, data);
          return false;
        }
      })
      .catch((err) => {
        console.log('  ❌ Erreur réseau:', err.message);
        return false;
      });
    } else {
      console.log('\n3️⃣ Test de l\'authentification: ⏭️  Ignoré (pas de token ou backend down)');
      return false;
    }
  })
  .then((authOk) => {
    // 4. Recommandations
    console.log('\n4️⃣ Recommandations:');
    
    if (!token) {
      console.log('  → Aucun token trouvé. C\'est normal si vous n\'êtes pas connecté.');
      console.log('  → Connectez-vous avec vos identifiants.');
    } else if (!authOk) {
      console.log('  → Le token est invalide ou le backend ne répond pas.');
      console.log('  → Exécutez ce code pour nettoyer et vous reconnecter:');
      console.log('');
      console.log('     localStorage.clear();');
      console.log('     sessionStorage.clear();');
      console.log('     location.reload();');
    } else {
      console.log('  ✅ Tout semble fonctionner!');
      console.log('  → Si vous voyez toujours "Session expirée",');
      console.log('    c\'est peut-être un problème de cache du navigateur.');
      console.log('  → Essayez: Ctrl+Shift+R (hard refresh)');
    }
    
    console.log('\n================================');
    console.log('✅ Diagnostic terminé');
  });


