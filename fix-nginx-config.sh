#!/bin/bash

# Script pour corriger la configuration Nginx

echo "🔧 Correction de la configuration Nginx"
echo "======================================"

# Sauvegarder l'ancienne config
if [ -f /etc/nginx/sites-available/hoomy-backend ]; then
    echo "💾 Sauvegarde de l'ancienne configuration..."
    sudo cp /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-available/hoomy-backend.backup
fi

# Créer la configuration propre
echo "📝 Création de la nouvelle configuration..."
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

# Supprimer les anciens liens
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
    echo "✅ Nginx rechargé avec succès"
else
    echo "❌ Erreur dans la configuration"
    echo "📋 Vérifiez le fichier :"
    echo "   sudo cat /etc/nginx/sites-available/hoomy-backend"
    exit 1
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "🧪 Tests :"
echo "   curl http://127.0.0.1/api/locations/cantons"
echo "   curl http://backend.hoomy.site/api/locations/cantons"
echo ""
echo "📊 Vérifications :"
echo "   sudo systemctl status nginx"
echo "   pm2 status"

