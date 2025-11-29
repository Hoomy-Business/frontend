#!/bin/bash

# Script pour corriger l'erreur 404 Nginx

echo "🔧 Correction de la configuration Nginx"
echo "======================================"

# Vérifier si Nginx est actif
if ! systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx n'est pas actif, démarrage..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Créer la configuration correcte
echo "📝 Création de la configuration Nginx..."
sudo tee /etc/nginx/sites-available/hoomy-backend > /dev/null <<'EOF'
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
EOF

# Supprimer toutes les autres configurations
echo "🗑️  Nettoyage des anciennes configurations..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/hoomy-backend

# Activer la nouvelle configuration
echo "🔗 Activation de la configuration..."
sudo ln -sf /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# Tester la configuration
echo "🧪 Test de la configuration..."
if sudo nginx -t; then
    echo "✅ Configuration valide"
    sudo systemctl reload nginx
    echo "✅ Nginx rechargé"
else
    echo "❌ Erreur dans la configuration"
    exit 1
fi

# Vérifier que le backend tourne
echo ""
echo "📊 Vérification du backend..."
if pm2 list | grep -q "hoomy-backend.*online"; then
    echo "✅ Backend PM2 est en ligne"
else
    echo "⚠️  Backend PM2 n'est pas en ligne, démarrage..."
    cd /home/hoomy_backend
    pm2 start ecosystem.config.js
    pm2 save
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "🧪 Tests :"
echo "   curl http://127.0.0.1/api/locations/cantons"
echo "   curl http://164.92.237.171/api/locations/cantons"
echo ""
echo "📋 Vérifications :"
echo "   sudo systemctl status nginx"
echo "   pm2 status"
echo "   sudo tail -f /var/log/nginx/hoomy-backend-error.log"


