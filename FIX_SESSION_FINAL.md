# 🔧 Fix définitif : "Session expirée"

## 🚀 Solution rapide (copier-coller dans la console)

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Nettoyer TOUT et recharger
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Puis reconnectez-vous avec vos identifiants.

## 🔍 Diagnostic complet

### Option 1 : Script automatique

1. Ouvrez la console (F12)
2. Copiez-collez le contenu de `diagnose-session-issue.js`
3. Appuyez sur Entrée
4. Suivez les recommandations affichées

### Option 2 : Diagnostic manuel

#### Étape 1 : Vérifier le backend

Dans la console :

```javascript
fetch('https://backend.hoomy.site/api/locations/cantons')
  .then(r => r.json())
  .then(data => console.log('✅ Backend OK:', data.length, 'cantons'))
  .catch(err => console.error('❌ Backend down:', err));
```

**Si erreur :** Le backend ne répond pas. Vérifiez PM2 sur le serveur.

#### Étape 2 : Vérifier le token

```javascript
const token = localStorage.getItem('auth_token');
console.log('Token:', token ? 'Présent' : 'Absent');
```

**Si absent :** Normal, vous n'êtes pas connecté.

**Si présent mais session expire :** Le token est invalide. Nettoyez et reconnectez-vous.

#### Étape 3 : Tester l'authentification

```javascript
const token = localStorage.getItem('auth_token');
if (token) {
  fetch('https://backend.hoomy.site/api/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => console.log('✅ Auth OK:', data))
  .catch(err => console.error('❌ Auth failed:', err));
}
```

## 🛠️ Solutions selon le problème

### Problème 1 : Backend retourne 502

**Cause :** Le backend Node.js n'est pas démarré.

**Solution :**
```bash
# Sur le serveur
cd /home/hoomy_backend
pm2 status
pm2 start ecosystem.config.js
pm2 save
```

### Problème 2 : Backend retourne 401

**Cause :** Le token JWT est invalide ou expiré.

**Solution :**
```javascript
// Dans la console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Puis reconnectez-vous.

### Problème 3 : Erreur CORS

**Cause :** Problème de configuration CORS (peu probable, déjà configuré).

**Solution :** Vérifiez que le backend a `credentials: true` dans CORS (déjà fait).

### Problème 4 : Token présent mais session expire quand même

**Cause :** Le frontend vérifie la session et la trouve invalide.

**Solution :**
1. Nettoyer le navigateur (voir ci-dessus)
2. Vérifier que le backend répond
3. Se reconnecter

## 📋 Checklist de dépannage

- [ ] Backend répond (test avec `/api/locations/cantons`)
- [ ] PM2 est démarré (`pm2 status`)
- [ ] Token présent dans localStorage
- [ ] Token valide (test avec `/api/auth/profile`)
- [ ] Pas d'erreur CORS dans la console
- [ ] Pas d'erreur réseau dans l'onglet Network

## 🎯 Solution définitive

Si rien ne fonctionne :

1. **Nettoyer le navigateur :**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Vérifier le backend :**
   ```bash
   pm2 status
   pm2 logs hoomy-backend --lines 20
   ```

3. **Redémarrer le backend si nécessaire :**
   ```bash
   pm2 restart hoomy-backend
   ```

4. **Se reconnecter** avec vos identifiants

## 💡 Note importante

Le message "Session expirée" apparaît quand :
- Le token JWT est expiré (30 jours)
- La session frontend est expirée (24h d'inactivité)
- Le backend ne répond pas à `/api/auth/profile`
- Le token est invalide (JWT_SECRET changé sur le serveur)

Dans tous les cas, la solution est de **nettoyer le navigateur et se reconnecter**.


