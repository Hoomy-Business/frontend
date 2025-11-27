# 🔧 Corriger l'erreur de syntaxe Nginx

## Erreur
```
unknown directive "1~server" in /etc/nginx/sites-enabled/hoomy-backend:25
```

Cela signifie qu'il y a des caractères invalides dans le fichier de configuration.

## Solution rapide

### Option 1 : Script automatique

```bash
cd /home/hoomy_backend
chmod +x fix-nginx-config.sh
sudo bash fix-nginx-config.sh
```

### Option 2 : Correction manuelle

```bash
# 1. Voir le contenu actuel (pour voir l'erreur)
sudo cat /etc/nginx/sites-available/hoomy-backend

# 2. Supprimer le fichier et le recréer proprement
sudo rm /etc/nginx/sites-available/hoomy-backend

# 3. Créer un nouveau fichier propre
sudo nano /etc/nginx/sites-available/hoomy-backend
```

**Coller EXACTEMENT ce contenu (sans espaces supplémentaires au début) :**
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

**Important :**
- Pas d'espaces avant `server {`
- Pas de caractères spéciaux
- Utiliser des tabulations ou 4 espaces pour l'indentation
- Sauvegarder avec Ctrl+O, Enter, Ctrl+X

```bash
# 4. Supprimer les anciens liens
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/hoomy-backend

# 5. Activer la configuration
sudo ln -sf /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# 6. Tester
sudo nginx -t

# 7. Si OK, recharger
sudo systemctl reload nginx
```

## Vérification

```bash
# Vérifier la syntaxe
sudo nginx -t

# Voir le contenu du fichier
sudo cat /etc/nginx/sites-available/hoomy-backend

# Vérifier les liens
ls -la /etc/nginx/sites-enabled/

# Tester
curl http://127.0.0.1/api/locations/cantons
```

## Si l'erreur persiste

```bash
# Voir les erreurs détaillées
sudo nginx -t 2>&1 | head -20

# Voir le fichier ligne par ligne
sudo cat -n /etc/nginx/sites-available/hoomy-backend

# Vérifier les caractères invisibles
sudo cat -A /etc/nginx/sites-available/hoomy-backend | head -30
```

