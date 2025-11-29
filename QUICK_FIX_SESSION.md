# 🔧 Fix rapide : "Session expirée"

## Solution immédiate

### Dans le navigateur (F12 → Console)

```javascript
// 1. Nettoyer TOUT
localStorage.clear();
sessionStorage.clear();

// 2. Vérifier que c'est bien nettoyé
console.log('Token:', localStorage.getItem('auth_token')); // Devrait être null

// 3. Recharger
location.reload();
```

### Si ça ne fonctionne pas

Le problème vient probablement du backend qui ne répond pas. Vérifiez :

```bash
# Sur le serveur
pm2 status
pm2 logs hoomy-backend --lines 20
curl https://backend.hoomy.site/api/locations/cantons
```

## Diagnostic

### 1. Ouvrir la console (F12)

### 2. Vérifier les erreurs réseau

- Onglet **Network**
- Recharger la page
- Chercher les requêtes vers `/api/auth/profile`
- Vérifier le **Status Code** :
  - **200** = OK, le backend fonctionne
  - **401** = Non authentifié (normal si pas connecté)
  - **502** = Backend ne répond pas
  - **CORS error** = Problème de configuration CORS

### 3. Vérifier le token

```javascript
const token = localStorage.getItem('auth_token');
console.log('Token présent:', !!token);
if (token) {
  console.log('Token (premiers 20 chars):', token.substring(0, 20));
}
```

## Solutions selon le problème

### Backend retourne 502

→ Voir [FIX_502_GATEWAY.md](./FIX_502_GATEWAY.md)

### Backend retourne CORS error

→ Le backend doit avoir `credentials: true` dans CORS (déjà configuré)

### Token présent mais session expirée

→ Le token JWT est peut-être expiré. Nettoyez et reconnectez-vous.

### Aucune requête vers le backend

→ Vérifiez que l'URL du backend est correcte dans `apiConfig.ts`

## Solution définitive

Si le problème persiste après avoir nettoyé le navigateur :

1. **Vérifier le backend :**
   ```bash
   pm2 status
   curl https://backend.hoomy.site/api/locations/cantons
   ```

2. **Redémarrer le backend :**
   ```bash
   pm2 restart hoomy-backend
   ```

3. **Nettoyer le navigateur et se reconnecter**


