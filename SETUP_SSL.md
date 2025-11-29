# 🔐 Configuration SSL/TLS pour backend.hoomy.site

## Problème
Le navigateur essaie de se connecter en HTTPS mais le serveur n'accepte que HTTP, ce qui cause l'erreur `PR_CONNECT_RESET_ERROR`.

## Solution : Configurer SSL/TLS avec Let's Encrypt

### 1️⃣ Installer Certbot

```bash
# Mettre à jour les paquets
sudo apt update

# Installer Certbot et le plugin Nginx
sudo apt install certbot python3-certbot-nginx -y
```

### 2️⃣ Préparer le répertoire pour la validation Let's Encrypt

```bash
# Créer le répertoire pour les challenges ACME
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
```

### 3️⃣ Configuration Nginx temporaire (HTTP seulement)

Avant d'obtenir le certificat, vous devez avoir une configuration HTTP qui fonctionne. Si vous n'avez pas encore de configuration, créez-la :

```bash
sudo nano /etc/nginx/sites-available/hoomy-backend
```

**Contenu temporaire (HTTP seulement) :**
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
# Activer la configuration
sudo ln -sf /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 4️⃣ Vérifier que le DNS fonctionne

```bash
# Depuis votre machine locale, vérifier que le DNS résout correctement
nslookup backend.hoomy.site

# Ou avec dig
dig backend.hoomy.site
```

Le résultat doit pointer vers l'IP de votre serveur (164.92.237.171).

### 5️⃣ Obtenir le certificat SSL

```bash
# Obtenir le certificat SSL avec Certbot
sudo certbot --nginx -d backend.hoomy.site

# Suivre les instructions :
# - Entrer votre email
# - Accepter les termes
# - Choisir si vous voulez rediriger HTTP vers HTTPS (recommandé : 2)
```

Certbot va automatiquement :
- Obtenir le certificat
- Configurer Nginx pour utiliser SSL
- Configurer le renouvellement automatique

### 6️⃣ Vérifier la configuration SSL

Après l'installation, Certbot aura modifié votre configuration Nginx. Vous pouvez vérifier :

```bash
# Voir la configuration générée
sudo cat /etc/nginx/sites-available/hoomy-backend

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 7️⃣ Tester le renouvellement automatique

```bash
# Tester le renouvellement (dry-run)
sudo certbot renew --dry-run
```

Le renouvellement automatique est configuré par défaut via un cron job.

### 8️⃣ Vérifier que HTTPS fonctionne

```bash
# Depuis le serveur
curl https://backend.hoomy.site/api/properties

# Depuis votre machine locale
curl https://backend.hoomy.site/api/properties
```

### 9️⃣ Configuration manuelle (alternative)

Si Certbot ne configure pas automatiquement Nginx, vous pouvez utiliser la configuration fournie dans `nginx-backend-ssl.conf` :

```bash
# Copier la configuration SSL
sudo cp nginx-backend-ssl.conf /etc/nginx/sites-available/hoomy-backend

# Ou éditer directement
sudo nano /etc/nginx/sites-available/hoomy-backend
```

**Important :** Assurez-vous que les chemins des certificats sont corrects :
- `/etc/letsencrypt/live/backend.hoomy.site/fullchain.pem`
- `/etc/letsencrypt/live/backend.hoomy.site/privkey.pem`

```bash
# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

## ✅ Vérifications finales

1. **Vérifier que le port 443 est ouvert :**
```bash
sudo ufw status
# Doit afficher 443/tcp ALLOW
```

Si ce n'est pas le cas :
```bash
sudo ufw allow 443/tcp
sudo ufw reload
```

2. **Tester depuis le navigateur :**
- Ouvrir `https://backend.hoomy.site/api/properties`
- Vérifier que le cadenas SSL est vert
- Vérifier qu'il n'y a pas d'erreur de certificat

3. **Vérifier les logs en cas de problème :**
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/hoomy-backend-error.log

# Logs Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## 🔧 Dépannage

### Erreur : "Failed to obtain certificate"
- Vérifier que le DNS pointe correctement vers le serveur
- Vérifier que le port 80 est ouvert et accessible
- Vérifier que Nginx fonctionne et répond sur le port 80

### Erreur : "Connection refused" sur HTTPS
- Vérifier que le port 443 est ouvert : `sudo ufw allow 443/tcp`
- Vérifier que Nginx écoute sur le port 443 : `sudo netstat -tlnp | grep 443`

### Certificat expiré
```bash
# Renouveler manuellement
sudo certbot renew

# Recharger Nginx après renouvellement
sudo systemctl reload nginx
```

### Vérifier la validité du certificat
```bash
# Voir les détails du certificat
sudo certbot certificates

# Vérifier la date d'expiration
sudo openssl x509 -in /etc/letsencrypt/live/backend.hoomy.site/cert.pem -noout -dates
```

## 📝 Notes importantes

- Les certificats Let's Encrypt sont valides pendant 90 jours
- Le renouvellement automatique est configuré par défaut
- Ne supprimez jamais les fichiers dans `/etc/letsencrypt/`
- Si vous changez de serveur, vous devrez reconfigurer le certificat


