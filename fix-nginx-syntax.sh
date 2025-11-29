#!/bin/bash

# Script rapide pour corriger l'erreur de syntaxe Nginx

echo "🔧 Correction de la syntaxe Nginx"
echo "=================================="

# Vérifier que le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

NGINX_CONFIG="/etc/nginx/sites-available/hoomy-backend"
NGINX_ENABLED="/etc/nginx/sites-enabled/hoomy-backend"

# Sauvegarder l'ancienne configuration
if [ -f "$NGINX_CONFIG" ]; then
    echo "💾 Sauvegarde de l'ancienne configuration..."
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Supprimer les anciens liens
echo "🗑️  Suppression des anciens liens..."
rm -f "$NGINX_ENABLED"
rm -f /etc/nginx/sites-enabled/default

# Créer une configuration propre
echo "📝 Création d'une configuration Nginx propre..."
tee "$NGINX_CONFIG" > /dev/null <<'EOF'
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

# Activer la configuration
echo "🔗 Activation de la configuration..."
ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"

# Tester la configuration
echo "🧪 Test de la configuration Nginx..."
if nginx -t; then
    echo "✅ Configuration Nginx valide"
    systemctl reload nginx
    echo "✅ Nginx rechargé avec succès"
    echo ""
    echo "✅ Configuration corrigée! Vous pouvez maintenant exécuter setup-ssl.sh"
else
    echo "❌ Erreur dans la configuration Nginx"
    echo "📋 Vérifiez le fichier: $NGINX_CONFIG"
    exit 1
fi


