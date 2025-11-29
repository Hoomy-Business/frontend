#!/bin/bash

# Script d'installation SSL/TLS pour backend.hoomy.site
# Ce script configure automatiquement SSL avec Let's Encrypt

set -e

echo "🔐 Configuration SSL/TLS pour backend.hoomy.site"
echo "================================================"

# Vérifier que le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

# Variables
DOMAIN="backend.hoomy.site"
NGINX_CONFIG="/etc/nginx/sites-available/hoomy-backend"
NGINX_ENABLED="/etc/nginx/sites-enabled/hoomy-backend"

echo ""
echo "📋 Étape 1: Vérification des prérequis..."

# Vérifier que Nginx est installé
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx n'est pas installé. Installation..."
    apt update
    apt install nginx -y
fi

# Vérifier que le domaine résout correctement
echo "🔍 Vérification du DNS pour $DOMAIN..."
IP=$(dig +short $DOMAIN | tail -n1)
if [ -z "$IP" ]; then
    echo "⚠️  Attention: Le DNS pour $DOMAIN ne résout pas. Continuez quand même? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ DNS résout vers: $IP"
fi

# Vérifier que le port 80 est ouvert
echo "🔍 Vérification du firewall..."
if command -v ufw &> /dev/null; then
    if ! ufw status | grep -q "80/tcp"; then
        echo "📝 Ouverture du port 80..."
        ufw allow 80/tcp
    fi
    if ! ufw status | grep -q "443/tcp"; then
        echo "📝 Ouverture du port 443..."
        ufw allow 443/tcp
    fi
fi

# Vérifier que Nginx fonctionne
if ! systemctl is-active --quiet nginx; then
    echo "🚀 Démarrage de Nginx..."
    systemctl start nginx
    systemctl enable nginx
fi

echo ""
echo "📋 Étape 2: Configuration Nginx temporaire (HTTP)..."

# Sauvegarder l'ancienne configuration si elle existe
if [ -f "$NGINX_CONFIG" ]; then
    echo "💾 Sauvegarde de l'ancienne configuration..."
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Supprimer les anciens liens symboliques
echo "🗑️  Nettoyage des anciennes configurations..."
rm -f "$NGINX_ENABLED"
rm -f /etc/nginx/sites-enabled/default

# Créer une configuration HTTP propre
echo "📝 Création de la configuration Nginx propre..."
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

# Tester et recharger Nginx
echo "🧪 Test de la configuration Nginx..."
if nginx -t; then
    echo "✅ Configuration Nginx valide"
    systemctl reload nginx
else
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

echo ""
echo "📋 Étape 3: Installation de Certbot..."

# Installer Certbot si nécessaire
if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    apt update
    apt install certbot python3-certbot-nginx -y
else
    echo "✅ Certbot est déjà installé"
fi

# Préparer le répertoire pour les challenges ACME
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

echo ""
echo "📋 Étape 4: Obtention du certificat SSL..."

# Demander l'email pour les notifications Let's Encrypt
if [ -z "$CERTBOT_EMAIL" ]; then
    echo "📧 Entrez votre email pour les notifications Let's Encrypt (ou appuyez sur Entrée pour utiliser certbot@$DOMAIN):"
    read -r CERTBOT_EMAIL
    if [ -z "$CERTBOT_EMAIL" ]; then
        CERTBOT_EMAIL="certbot@$DOMAIN"
    fi
fi

# Obtenir le certificat
echo "🔐 Exécution de Certbot pour $DOMAIN..."
echo "📧 Email: $CERTBOT_EMAIL"

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$CERTBOT_EMAIL" --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificat SSL installé avec succès!"
else
    echo ""
    echo "❌ Erreur lors de l'installation du certificat"
    echo "💡 Essayez manuellement: sudo certbot --nginx -d $DOMAIN"
    exit 1
fi

echo ""
echo "📋 Étape 5: Vérification du renouvellement automatique..."

# Tester le renouvellement
echo "🧪 Test du renouvellement automatique..."
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo "✅ Renouvellement automatique configuré"
else
    echo "⚠️  Problème avec le renouvellement automatique"
fi

echo ""
echo "📋 Étape 6: Vérifications finales..."

# Vérifier que Nginx fonctionne avec SSL
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx rechargé avec la configuration SSL"
else
    echo "❌ Erreur dans la configuration SSL"
    exit 1
fi

# Vérifier que le port 443 est accessible
if command -v netstat &> /dev/null; then
    if netstat -tlnp | grep -q ":443 "; then
        echo "✅ Nginx écoute sur le port 443"
    else
        echo "⚠️  Nginx ne semble pas écouter sur le port 443"
    fi
fi

echo ""
echo "════════════════════════════════════════════════"
echo "✅ Configuration SSL terminée avec succès!"
echo ""
echo "🌐 Testez votre API:"
echo "   curl https://$DOMAIN/api/properties"
echo ""
echo "📝 Vérifiez les certificats:"
echo "   sudo certbot certificates"
echo ""
echo "📋 Logs en cas de problème:"
echo "   sudo tail -f /var/log/nginx/hoomy-backend-error.log"
echo "════════════════════════════════════════════════"

