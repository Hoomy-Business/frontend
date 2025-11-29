# 🔧 Corriger l'erreur 404 Nginx

## Problème
Nginx retourne une erreur 404 au lieu de proxy vers le backend.

## Solution rapide

### Option 1 : Script automatique

```bash
cd /home/hoomy_backend
chmod +x fix-nginx-404.sh
sudo bash fix-nginx-404.sh
```

### Option 2 : Configuration manuelle

```bash
# 1. Créer/Modifier la configuration
sudo nano /etc/nginx/sites-available/hoomy-backend
```

**Coller ce contenu (remplacer tout) :**
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 50M;

    access_log /var/log/nginx/hoomy-backend-access.log;
    error_log /var/log/nginx/hoomy-backend-error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

```bash
# 2. Supprimer la config par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Activer la configuration
sudo ln -sf /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# 4. Tester
sudo nginx -t

# 5. Recharger
sudo systemctl reload nginx

# 6. Vérifier que PM2 tourne
pm2 status

# Si pas en ligne, démarrer
pm2 start ecosystem.config.js
pm2 save

# 7. Tester
curl http://127.0.0.1/api/locations/cantons
curl http://164.92.237.171/api/locations/cantons
```

## 🔍 Diagnostic

### Vérifier la configuration active

```bash
# Voir toutes les configs activées
ls -la /etc/nginx/sites-enabled/

# Voir le contenu de la config
cat /etc/nginx/sites-available/hoomy-backend

# Tester la syntaxe
sudo nginx -t
```

### Vérifier les logs

```bash
# Logs d'erreur
sudo tail -f /var/log/nginx/hoomy-backend-error.log

# Logs d'accès
sudo tail -f /var/log/nginx/hoomy-backend-access.log

# Logs Nginx généraux
sudo journalctl -u nginx -n 50
```

### Vérifier que le backend répond

```bash
# Depuis le serveur
curl http://127.0.0.1:3000/api/locations/cantons

# Vérifier PM2
pm2 logs hoomy-backend --lines 20
```

## ⚠️ Points importants

1. **default_server** : Utilisez `default_server` pour que Nginx accepte toutes les requêtes sur le port 80
2. **PM2 doit être actif** : Le backend doit tourner avec PM2, pas avec nodemon
3. **Port 3000** : Vérifiez que le backend écoute bien sur le port 3000

## ✅ Après correction

Une fois corrigé, vous devriez pouvoir accéder depuis l'extérieur :

```bash
# Depuis votre machine locale
curl http://164.92.237.171/api/locations/cantons
```

Vous devriez recevoir le JSON des cantons au lieu d'une erreur 404.


