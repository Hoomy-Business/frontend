#!/bin/bash

# Script rapide pour configurer Nginx et rendre le backend accessible

echo "🚀 Configuration Nginx pour accès externe"
echo "========================================"

# Vérifier si Nginx est installé
if ! command -v nginx &> /dev/null; then
    echo "📦 Installation de Nginx..."
    sudo apt update
    sudo apt install nginx -y
fi

# Créer la configuration
echo "📝 Création de la configuration Nginx..."
sudo tee /etc/nginx/sites-available/hoomy-backend > /dev/null <<EOF
server {
    listen 80;
    server_name backend.hoomy.site 164.92.237.171;

    client_max_body_size 50M;

    access_log /var/log/nginx/hoomy-backend-access.log;
    error_log /var/log/nginx/hoomy-backend-error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Activer la configuration
echo "🔗 Activation de la configuration..."
sudo ln -sf /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# Supprimer la config par défaut si elle existe
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Suppression de la configuration par défaut..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Tester la configuration
echo "🧪 Test de la configuration Nginx..."
if sudo nginx -t; then
    echo "✅ Configuration valide"
    sudo systemctl reload nginx
    echo "✅ Nginx rechargé"
else
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

# Configurer le firewall
echo "🔥 Configuration du firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "🧪 Tests à effectuer :"
echo "   curl http://127.0.0.1/api/locations/cantons"
echo "   curl http://164.92.237.171/api/locations/cantons"
echo ""
echo "📊 Vérifier le statut :"
echo "   sudo systemctl status nginx"
echo "   pm2 status"
echo "   sudo ufw status"


