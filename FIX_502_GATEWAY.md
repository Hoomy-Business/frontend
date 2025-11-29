# 🔧 Fix: 502 Bad Gateway

## Problème
Après la configuration SSL, vous obtenez une erreur **502 Bad Gateway** de Nginx.

## Cause
Le backend Node.js n'est pas en cours d'exécution sur le port 3000, donc Nginx ne peut pas se connecter.

## ✅ Solution rapide

### Option 1 : Script automatique (recommandé)

```bash
cd /home/hoomy_backend
chmod +x fix-502-gateway.sh
sudo ./fix-502-gateway.sh
```

### Option 2 : Commandes manuelles

```bash
# 1. Aller dans le répertoire
cd /home/hoomy_backend

# 2. Vérifier le statut PM2
pm2 status

# 3. Si l'application n'est pas en ligne, la démarrer
pm2 start ecosystem.config.js

# 4. Sauvegarder la configuration PM2
pm2 save

# 5. Vérifier les logs
pm2 logs hoomy-backend --lines 20

# 6. Tester le backend directement
curl http://127.0.0.1:3000/api/locations/cantons

# 7. Si ça fonctionne, recharger Nginx
sudo systemctl reload nginx
```

## 🔍 Diagnostic

### Vérifier si le port 3000 est utilisé

```bash
# Vérifier quel processus utilise le port 3000
sudo netstat -tlnp | grep 3000
# ou
sudo ss -tlnp | grep 3000
# ou
sudo lsof -i :3000
```

### Vérifier PM2

```bash
# Statut
pm2 status

# Logs
pm2 logs hoomy-backend

# Monitoring
pm2 monit
```

### Vérifier les logs Nginx

```bash
# Logs d'erreur
sudo tail -f /var/log/nginx/hoomy-backend-error.log

# Logs d'accès
sudo tail -f /var/log/nginx/hoomy-backend-access.log
```

## 🚨 Problèmes courants

### 1. PM2 n'est pas installé

```bash
sudo npm install -g pm2
cd /home/hoomy_backend
pm2 start ecosystem.config.js
pm2 save
```

### 2. L'application crash au démarrage

```bash
# Voir les logs d'erreur
pm2 logs hoomy-backend --err

# Vérifier les variables d'environnement
pm2 env hoomy-backend

# Vérifier que le fichier .env existe et est correct
cat .env
```

### 3. Le port 3000 est déjà utilisé par un autre processus

```bash
# Trouver le processus
sudo lsof -i :3000

# Tuer le processus (remplacer PID par l'ID du processus)
sudo kill -9 PID

# Redémarrer PM2
pm2 restart hoomy-backend
```

### 4. Problème de permissions

```bash
# Vérifier les permissions du répertoire
ls -la /home/hoomy_backend

# Si nécessaire, corriger les permissions
sudo chown -R $USER:$USER /home/hoomy_backend
```

### 5. Base de données non accessible

```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Tester la connexion
psql -U postgres -d hoomy_ch -h 127.0.0.1
```

## ✅ Vérifications finales

1. **Backend répond sur le port 3000 :**
   ```bash
   curl http://127.0.0.1:3000/api/locations/cantons
   ```

2. **Nginx peut se connecter :**
   ```bash
   curl http://127.0.0.1/api/locations/cantons
   ```

3. **HTTPS fonctionne :**
   ```bash
   curl https://backend.hoomy.site/api/properties
   ```

4. **Dans le navigateur :**
   - Ouvrir `https://backend.hoomy.site/api/properties`
   - Devrait retourner du JSON, pas une erreur 502

## 📋 Checklist

- [ ] PM2 est installé
- [ ] L'application hoomy-backend est en ligne (pm2 status)
- [ ] Le port 3000 est utilisé (netstat -tlnp | grep 3000)
- [ ] Le backend répond (curl http://127.0.0.1:3000/api/locations/cantons)
- [ ] Nginx est rechargé (sudo systemctl reload nginx)
- [ ] HTTPS fonctionne (curl https://backend.hoomy.site/api/properties)


