# 🔧 Résoudre l'accès externe au backend

## Problème
Le backend fonctionne en local (127.0.0.1:3000) mais n'est pas accessible depuis l'extérieur.

## Solutions étape par étape

### 1️⃣ Vérifier Nginx

```bash
# Vérifier si Nginx est installé et actif
sudo systemctl status nginx

# Si Nginx n'est pas installé
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2️⃣ Créer la configuration Nginx

```bash
# Créer le fichier de configuration
sudo nano /etc/nginx/sites-available/hoomy-backend
```

**Coller ce contenu :**
```nginx
server {
    listen 80;
    server_name backend.hoomy.site 164.92.237.171;

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

### 3️⃣ Activer la configuration

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Si OK, recharger Nginx
sudo systemctl reload nginx
```

### 4️⃣ Configurer le Firewall

```bash
# Vérifier le statut du firewall
sudo ufw status

# Autoriser HTTP (port 80)
sudo ufw allow 80/tcp

# Autoriser HTTPS (port 443)
sudo ufw allow 443/tcp

# Autoriser SSH (important !)
sudo ufw allow 22/tcp

# Activer le firewall si pas déjà fait
sudo ufw enable

# Vérifier
sudo ufw status numbered
```

### 5️⃣ Redémarrer PM2 en mode production

```bash
# Arrêter nodemon si en cours
# Ctrl+C dans le terminal où nodemon tourne

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save

# Vérifier
pm2 status
```

### 6️⃣ Tester l'accès

```bash
# Depuis le serveur (devrait fonctionner)
curl http://127.0.0.1/api/locations/cantons
curl http://164.92.237.171/api/locations/cantons

# Depuis l'extérieur (depuis votre machine locale)
curl http://164.92.237.171/api/locations/cantons
curl http://backend.hoomy.site/api/locations/cantons
```

### 7️⃣ Vérifier les logs en cas d'erreur

```bash
# Logs Nginx
sudo tail -f /var/log/nginx/hoomy-backend-error.log
sudo tail -f /var/log/nginx/hoomy-backend-access.log

# Logs PM2
pm2 logs hoomy-backend

# Vérifier que le port 3000 écoute
sudo netstat -tlnp | grep 3000
```

## 🔍 Diagnostic rapide

### Vérifier que Nginx écoute sur le port 80

```bash
sudo netstat -tlnp | grep :80
# Devrait afficher nginx
```

### Vérifier que le backend écoute sur le port 3000

```bash
sudo netstat -tlnp | grep :3000
# Devrait afficher node
```

### Tester la connexion directe au backend

```bash
# Depuis le serveur
curl http://127.0.0.1:3000/api/locations/cantons

# Depuis l'extérieur (remplacer par votre IP publique)
curl http://164.92.237.171:3000/api/locations/cantons
```

**Note** : Si le port 3000 est accessible directement depuis l'extérieur, c'est que le firewall n'est pas configuré. Il vaut mieux utiliser Nginx comme reverse proxy.

## 🚨 Problèmes courants

### Erreur 502 Bad Gateway

```bash
# Vérifier que PM2 est actif
pm2 status

# Vérifier que le backend répond
curl http://127.0.0.1:3000/api/locations/cantons

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Erreur Connection Refused

```bash
# Vérifier le firewall
sudo ufw status

# Vérifier que les ports sont ouverts
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Nginx ne démarre pas

```bash
# Tester la configuration
sudo nginx -t

# Voir les erreurs
sudo journalctl -u nginx -n 50
```

## ✅ Checklist

- [ ] Nginx installé et actif
- [ ] Configuration Nginx créée dans `/etc/nginx/sites-available/hoomy-backend`
- [ ] Lien symbolique créé dans `/etc/nginx/sites-enabled/`
- [ ] Configuration Nginx testée (`nginx -t`)
- [ ] Nginx rechargé
- [ ] Firewall configuré (ports 80 et 443 ouverts)
- [ ] PM2 démarré avec l'application
- [ ] Test depuis le serveur : `curl http://127.0.0.1/api/locations/cantons`
- [ ] Test depuis l'extérieur : `curl http://164.92.237.171/api/locations/cantons`

## 🔐 Configuration SSL (après que tout fonctionne)

Une fois que HTTP fonctionne, configurez SSL :

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat (remplacer par votre domaine)
sudo certbot --nginx -d backend.hoomy.site

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

