# 🔧 Correction rapide de l'erreur de syntaxe Nginx

## Erreur rencontrée
```
unknown directive "1~server" in /etc/nginx/sites-enabled/hoomy-backend:25
```

## ✅ Solution rapide (2 options)

### Option 1 : Script automatique (recommandé)

Sur le serveur, exécutez :

```bash
cd /home/hoomy_backend

# Télécharger ou créer le script fix-nginx-syntax.sh
# Puis :
chmod +x fix-nginx-syntax.sh
sudo ./fix-nginx-syntax.sh
```

### Option 2 : Correction manuelle

```bash
# 1. Sauvegarder l'ancienne config
sudo cp /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-available/hoomy-backend.backup

# 2. Supprimer les anciens liens
sudo rm -f /etc/nginx/sites-enabled/hoomy-backend
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Recréer le fichier proprement
sudo tee /etc/nginx/sites-available/hoomy-backend > /dev/null <<'EOF'
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
EOF

# 4. Activer la configuration
sudo ln -sf /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# 5. Tester
sudo nginx -t

# 6. Si OK, recharger
sudo systemctl reload nginx
```

## Après la correction

Une fois la syntaxe corrigée, vous pouvez relancer le script SSL :

```bash
sudo ./setup-ssl.sh
```

Le script `setup-ssl.sh` a été corrigé pour éviter ce problème à l'avenir.


