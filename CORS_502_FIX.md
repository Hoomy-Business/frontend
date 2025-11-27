# Fix CORS 502 Errors - Configuration Backend et Nginx

## Problème
Les requêtes retournent des erreurs 502 avec "CORS Missing Allow Origin", ce qui indique que :
1. Le backend n'est pas accessible depuis nginx (502 = Bad Gateway)
2. Ou nginx ne transmet pas correctement les requêtes OPTIONS (preflight)

## Corrections apportées au backend

### 1. Configuration CORS renforcée
- Handler explicite pour les requêtes OPTIONS
- Middleware qui ajoute les headers CORS à toutes les réponses
- Exclusion des requêtes OPTIONS du rate limiting
- Middleware d'erreur qui garantit les headers CORS même en cas d'erreur

### 2. Headers CORS ajoutés
- `Access-Control-Allow-Origin`: Dynamique selon l'origine
- `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, OPTIONS, PATCH
- `Access-Control-Allow-Headers`: Content-Type, Authorization, X-Requested-With, X-CSRF-Token
- `Access-Control-Allow-Credentials`: true
- `Access-Control-Max-Age`: 86400 (24 heures)

## Configuration Nginx requise

Si vous utilisez nginx comme reverse proxy, ajoutez cette configuration :

```nginx
server {
    listen 443 ssl http2;
    server_name backend.hoomy.site;

    # SSL configuration...
    
    # Headers CORS pour toutes les requêtes
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Max-Age' '86400' always;
    
    # Gérer les requêtes OPTIONS (preflight) directement dans nginx
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '86400' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts pour éviter les 502
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Ne pas bufferiser les réponses pour les erreurs
        proxy_buffering off;
    }
}
```

## Vérifications à faire

### 1. Vérifier que le backend est démarré
```bash
# Sur le serveur de production
ps aux | grep node
# ou
systemctl status hoomy-backend
# ou
pm2 list
```

### 2. Vérifier que le backend écoute sur le bon port
```bash
netstat -tlnp | grep 3000
# ou
ss -tlnp | grep 3000
```

### 3. Tester le backend directement (sans nginx)
```bash
curl -X OPTIONS https://backend.hoomy.site/api/auth/profile \
  -H "Origin: https://hoomy.site" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```

### 4. Vérifier les logs nginx
```bash
tail -f /var/log/nginx/error.log
```

### 5. Vérifier les logs du backend
```bash
# Si vous utilisez PM2
pm2 logs hoomy-backend

# Si vous utilisez systemd
journalctl -u hoomy-backend -f

# Si vous utilisez directement node
# Les logs apparaissent dans la console
```

## Redémarrage après modifications

1. **Redémarrer le backend** :
```bash
# PM2
pm2 restart hoomy-backend

# systemd
systemctl restart hoomy-backend

# Directement
# Arrêter avec Ctrl+C puis relancer
node server.js
```

2. **Recharger nginx** :
```bash
sudo nginx -t  # Vérifier la configuration
sudo systemctl reload nginx
# ou
sudo service nginx reload
```

## Test de la configuration

Après redémarrage, tester avec :

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS https://backend.hoomy.site/api/auth/profile \
  -H "Origin: https://hoomy.site" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v

# Devrait retourner 204 avec tous les headers CORS

# Test GET normal
curl -X GET https://backend.hoomy.site/api/auth/profile \
  -H "Origin: https://hoomy.site" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v

# Devrait retourner 200 ou 401 avec les headers CORS
```

## Notes importantes

1. **Les erreurs 502** indiquent généralement que nginx ne peut pas joindre le backend
2. **Vérifiez que le backend écoute sur `0.0.0.0:3000`** et non `127.0.0.1:3000`
3. **Les requêtes OPTIONS doivent être traitées rapidement** - elles ne doivent pas passer par le rate limiting
4. **Les headers CORS doivent être présents même en cas d'erreur** - c'est pourquoi nous avons ajouté un middleware d'erreur

## Si le problème persiste

1. Vérifier les logs nginx : `/var/log/nginx/error.log`
2. Vérifier les logs du backend
3. Tester le backend directement (sans nginx) : `http://IP_SERVEUR:3000/api/auth/profile`
4. Vérifier les règles de firewall qui pourraient bloquer le port 3000
5. Vérifier que nginx peut joindre `localhost:3000` ou `127.0.0.1:3000`

