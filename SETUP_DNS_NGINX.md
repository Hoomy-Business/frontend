# 🌐 Configuration DNS + Nginx pour backend.hoomy.site

## ✅ Votre DNS est correctement configuré

Vous avez créé un enregistrement A :
- **Host:** `backend`
- **Value:** `164.92.237.171`
- **Type:** A Record

Cela signifie que `backend.hoomy.site` pointera vers votre serveur.

## 🔧 Configuration Nginx requise

Maintenant, vous devez configurer Nginx sur votre serveur pour accepter les requêtes pour `backend.hoomy.site`.

### Commandes à exécuter sur le serveur

```bash
# 1. Créer/modifier la configuration Nginx
sudo nano /etc/nginx/sites-available/hoomy-backend
```

**Coller ce contenu :**
```nginx
server {
    listen 80;
    server_name backend.hoomy.site;

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
# 2. Activer la configuration
sudo ln -sf /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# 3. Supprimer la config par défaut si elle existe
sudo rm -f /etc/nginx/sites-enabled/default

# 4. Tester la configuration
sudo nginx -t

# 5. Si OK, recharger Nginx
sudo systemctl reload nginx

# 6. Vérifier que PM2 tourne
pm2 status

# Si pas en ligne :
cd /home/hoomy_backend
pm2 start ecosystem.config.js
pm2 save
```

## 🧪 Tests

### Depuis le serveur
```bash
# Test direct du backend
curl http://127.0.0.1:3000/api/locations/cantons

# Test via Nginx
curl http://127.0.0.1/api/locations/cantons
curl -H "Host: backend.hoomy.site" http://127.0.0.1/api/locations/cantons
```

### Depuis l'extérieur (après propagation DNS)
```bash
# Attendre 5-10 minutes pour la propagation DNS, puis :
curl http://backend.hoomy.site/api/locations/cantons
```

## ⏱️ Propagation DNS

La propagation DNS peut prendre :
- **5-10 minutes** pour la plupart des cas
- **Jusqu'à 48 heures** dans de rares cas (mais généralement beaucoup plus rapide)

### Vérifier la propagation DNS

```bash
# Depuis votre machine locale
nslookup backend.hoomy.site

# Ou
dig backend.hoomy.site

# Vous devriez voir : 164.92.237.171
```

## 🔐 Configuration SSL (après que HTTP fonctionne)

Une fois que `http://backend.hoomy.site` fonctionne :

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat SSL
sudo certbot --nginx -d backend.hoomy.site

# Certbot configurera automatiquement HTTPS et redirigera HTTP vers HTTPS
```

## 📋 Checklist

- [x] DNS configuré (enregistrement A pour `backend` → `164.92.237.171`)
- [ ] Nginx configuré avec `server_name backend.hoomy.site`
- [ ] Configuration Nginx activée
- [ ] Nginx rechargé
- [ ] PM2 actif avec l'application
- [ ] Firewall configuré (ports 80 et 443 ouverts)
- [ ] Test depuis le serveur : `curl http://127.0.0.1/api/locations/cantons`
- [ ] Attendre la propagation DNS (5-10 min)
- [ ] Test depuis l'extérieur : `curl http://backend.hoomy.site/api/locations/cantons`
- [ ] SSL configuré avec Certbot (optionnel mais recommandé)

## 🚨 Problèmes courants

### DNS ne résout pas encore
- Attendre 5-10 minutes
- Vérifier avec `nslookup backend.hoomy.site`
- Vérifier que l'enregistrement DNS est bien sauvegardé

### Erreur 502 Bad Gateway
- Vérifier que PM2 est actif : `pm2 status`
- Vérifier que le backend répond : `curl http://127.0.0.1:3000/api/locations/cantons`
- Vérifier les logs : `sudo tail -f /var/log/nginx/hoomy-backend-error.log`

### Erreur 404
- Vérifier que `server_name backend.hoomy.site` est dans la config Nginx
- Vérifier que la config est activée : `ls -la /etc/nginx/sites-enabled/`
- Recharger Nginx : `sudo systemctl reload nginx`

