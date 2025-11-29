# 🔧 Fix: La connexion ne fonctionne pas

## 🚀 Diagnostic immédiat

### Étape 1 : Ouvrir la console (F12)

### Étape 2 : Exécuter ce code AVANT de cliquer sur "Sign In"

```javascript
// Intercepter les requêtes de login
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('/auth/login')) {
    console.log('📤 Requête de login:', url);
    console.log('📦 Données:', args[1]?.body);
    
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('📥 Réponse:', response.status);
        return response.clone().json().then(data => {
          console.log('📄 Données:', data);
          if (response.ok && data.token) {
            console.log('✅ Connexion réussie!');
          } else {
            console.error('❌ Erreur:', data);
          }
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

console.log('✅ Prêt. Essayez de vous connecter.');
```

### Étape 3 : Essayer de vous connecter

### Étape 4 : Regarder les messages dans la console

## 🔍 Vérifications

### 1. Vérifier l'onglet Network

1. Ouvrez l'onglet **Network** (F12)
2. Essayez de vous connecter
3. Cherchez la requête vers `/api/auth/login`
4. Vérifiez :
   - **Status Code** (200 = OK, 401 = mauvais identifiants, 502 = backend down)
   - **Response** (doit contenir `token` et `user`)
   - **Request Payload** (email et password envoyés)

### 2. Tester directement l'API

Dans la console :

```javascript
// Tester la connexion directement
fetch('https://backend.hoomy.site/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'VOTRE_EMAIL@example.com',
    password: 'VOTRE_MOT_DE_PASSE'
  })
})
.then(r => r.json())
.then(data => {
  if (data.token) {
    console.log('✅ Connexion OK!');
    console.log('Token:', data.token.substring(0, 30) + '...');
    // Sauvegarder manuellement
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    location.reload();
  } else {
    console.error('❌ Erreur:', data);
  }
})
.catch(err => console.error('❌ Erreur:', err));
```

## 🛠️ Solutions selon l'erreur

### Erreur 401 : "Identifiants incorrects"

- Vérifiez votre email et mot de passe
- Vérifiez que votre email est vérifié (`email_verified = true`)

### Erreur 403 : "Email non vérifié"

- Vous devez vérifier votre email avant de vous connecter
- Allez sur `/verify-email` avec votre email

### Erreur 502 : "Bad Gateway"

- Le backend ne répond pas
- Vérifiez PM2 sur le serveur :
  ```bash
  pm2 status
  pm2 restart hoomy-backend
  ```

### Erreur CORS

- Vérifiez que le backend a `credentials: true` dans CORS (déjà configuré)
- Vérifiez que l'URL du backend est correcte

### Pas de réponse / Timeout

- Vérifiez que le backend fonctionne :
  ```bash
  curl https://backend.hoomy.site/api/locations/cantons
  ```

## 🔧 Solution de contournement

Si rien ne fonctionne, connectez-vous manuellement :

```javascript
// Dans la console, après avoir obtenu le token avec le test ci-dessus
const token = 'VOTRE_TOKEN_ICI';
const user = { id: 1, email: 'votre@email.com', role: 'student' };

localStorage.setItem('auth_token', token);
localStorage.setItem('auth_user', JSON.stringify(user));
sessionStorage.setItem('auth_session', JSON.stringify({
  fingerprint: 'temp',
  createdAt: Date.now(),
  lastActivity: Date.now(),
  expiresAt: Date.now() + 24*60*60*1000
}));

location.reload();
```

## 📋 Checklist

- [ ] Console ouverte (F12)
- [ ] Onglet Network ouvert
- [ ] Tentative de connexion effectuée
- [ ] Requête `/api/auth/login` visible dans Network
- [ ] Status code vérifié
- [ ] Réponse vérifiée
- [ ] Backend fonctionne (test avec curl)


