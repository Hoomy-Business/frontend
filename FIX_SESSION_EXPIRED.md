# 🔧 Fix: "Session expirée" au chargement

## Problème
Vous voyez "Session expirée. Veuillez vous reconnecter." même après avoir rechargé la page.

## Causes possibles

1. **Le backend ne répond pas** - La vérification de session échoue
2. **Token JWT invalide ou expiré** - Le token stocké est corrompu
3. **Problème CORS** - Les requêtes ne passent pas
4. **Backend non démarré** - Le serveur Node.js n'est pas en cours d'exécution

## ✅ Solutions

### 1. Vérifier que le backend fonctionne

```bash
# Sur le serveur
curl https://backend.hoomy.site/api/locations/cantons

# Devrait retourner du JSON, pas une erreur
```

### 2. Vérifier PM2

```bash
# Sur le serveur
pm2 status

# Si l'application n'est pas en ligne
cd /home/hoomy_backend
pm2 start ecosystem.config.js
pm2 save
```

### 3. Nettoyer le localStorage (côté navigateur)

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Nettoyer toutes les données d'authentification
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
sessionStorage.removeItem('auth_session');

// Recharger la page
location.reload();
```

### 4. Vérifier les logs du backend

```bash
# Sur le serveur
pm2 logs hoomy-backend --lines 50

# Vérifier les erreurs
pm2 logs hoomy-backend --err --lines 50
```

### 5. Vérifier la configuration CORS

Le backend doit avoir `credentials: true` dans la configuration CORS (déjà fait dans server.js).

### 6. Tester la route d'authentification

```bash
# Tester la route de profil (sans token - devrait retourner 401)
curl https://backend.hoomy.site/api/auth/profile

# Devrait retourner: {"error":"Token requis"}
```

## 🔍 Diagnostic détaillé

### Dans la console du navigateur (F12)

1. **Ouvrir l'onglet Network**
2. **Recharger la page**
3. **Chercher la requête vers `/api/auth/profile`**
4. **Vérifier :**
   - Status code (devrait être 200 si connecté, 401 si non connecté)
   - Headers de la requête (Authorization header présent ?)
   - Réponse du serveur

### Vérifier le token stocké

Dans la console du navigateur :

```javascript
// Voir le token stocké
const token = localStorage.getItem('auth_token');
console.log('Token:', token ? token.substring(0, 20) + '...' : 'Aucun token');

// Voir l'utilisateur stocké
const user = localStorage.getItem('auth_user');
console.log('User:', user ? JSON.parse(user) : 'Aucun utilisateur');
```

## 🚨 Problèmes courants

### Le backend retourne 502 Bad Gateway

→ Voir [FIX_502_GATEWAY.md](./FIX_502_GATEWAY.md)

### Le backend retourne 401 immédiatement

→ Le token est invalide ou expiré. Nettoyez le localStorage et reconnectez-vous.

### Erreur CORS dans la console

→ Vérifiez que le backend a `credentials: true` dans la config CORS.

### Le token semble valide mais la session expire quand même

→ Vérifiez que le backend répond correctement à `/api/auth/profile` :

```bash
# Tester avec un token (remplacez YOUR_TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" https://backend.hoomy.site/api/auth/profile
```

## ✅ Solution rapide

1. **Nettoyer le navigateur :**
   ```javascript
   // Dans la console (F12)
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Vérifier le backend :**
   ```bash
   # Sur le serveur
   pm2 status
   curl https://backend.hoomy.site/api/locations/cantons
   ```

3. **Se reconnecter** avec vos identifiants

## 📝 Notes

- Les tokens JWT sont valides pendant 30 jours
- La session frontend expire après 24 heures d'inactivité
- Si vous changez le `JWT_SECRET` sur le serveur, tous les tokens existants deviennent invalides


