#!/bin/bash

# Script pour corriger l'erreur 502 Bad Gateway

echo "🔧 Correction de l'erreur 502 Bad Gateway"
echo "=========================================="

# Vérifier que le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ce script doit être exécuté avec sudo"
    exit 1
fi

cd /home/hoomy_backend

echo ""
echo "📋 Étape 1: Vérification du backend Node.js..."

# Vérifier si le port 3000 est utilisé
if netstat -tlnp 2>/dev/null | grep -q ":3000 " || ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "✅ Le port 3000 est utilisé"
    # Vérifier quel processus utilise le port
    PROCESS=$(lsof -ti:3000 2>/dev/null || fuser 3000/tcp 2>/dev/null | awk '{print $1}')
    if [ ! -z "$PROCESS" ]; then
        echo "   Processus sur le port 3000: $PROCESS"
    fi
else
    echo "❌ Le port 3000 n'est pas utilisé - le backend n'est pas en cours d'exécution"
fi

echo ""
echo "📋 Étape 2: Vérification de PM2..."

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 n'est pas installé. Installation..."
    npm install -g pm2
else
    echo "✅ PM2 est installé"
fi

# Vérifier le statut PM2
echo ""
echo "📊 Statut PM2:"
pm2 status

# Vérifier si l'application est en cours d'exécution
if pm2 list | grep -q "hoomy-backend.*online"; then
    echo "✅ L'application hoomy-backend est en ligne"
    echo ""
    echo "📋 Étape 3: Vérification des logs..."
    echo "Dernières lignes des logs:"
    pm2 logs hoomy-backend --lines 10 --nostream
else
    echo "❌ L'application hoomy-backend n'est pas en ligne"
    echo ""
    echo "📋 Étape 3: Démarrage de l'application..."
    
    # Nettoyer PM2 si nécessaire
    echo "🧹 Nettoyage de PM2..."
    pm2 delete hoomy-backend 2>/dev/null || true
    
    # Vérifier que le fichier ecosystem.config.js existe
    if [ ! -f "ecosystem.config.js" ]; then
        echo "❌ Le fichier ecosystem.config.js n'existe pas"
        exit 1
    fi
    
    # Vérifier que server.js existe
    if [ ! -f "server.js" ]; then
        echo "❌ Le fichier server.js n'existe pas"
        exit 1
    fi
    
    # Créer le répertoire de logs si nécessaire
    mkdir -p logs
    
    # Démarrer l'application
    echo "🚀 Démarrage de l'application avec PM2..."
    pm2 start ecosystem.config.js
    
    # Attendre un peu pour que l'application démarre
    sleep 3
    
    # Sauvegarder la configuration PM2
    echo "💾 Sauvegarde de la configuration PM2..."
    pm2 save
    
    # Vérifier le statut
    echo ""
    echo "📊 Nouveau statut PM2:"
    pm2 status
    
    # Afficher les logs
    echo ""
    echo "📋 Logs de démarrage:"
    pm2 logs hoomy-backend --lines 20 --nostream
fi

echo ""
echo "📋 Étape 4: Test de connexion au backend..."

# Attendre un peu pour que le serveur soit prêt
sleep 2

# Tester la connexion
if curl -s http://127.0.0.1:3000/api/locations/cantons > /dev/null; then
    echo "✅ Le backend répond correctement sur le port 3000"
else
    echo "❌ Le backend ne répond pas sur le port 3000"
    echo ""
    echo "📋 Vérification des logs d'erreur..."
    if [ -f "logs/pm2-error.log" ]; then
        echo "Dernières erreurs:"
        tail -20 logs/pm2-error.log
    fi
    echo ""
    echo "💡 Essayez de voir les logs en temps réel:"
    echo "   pm2 logs hoomy-backend"
    exit 1
fi

echo ""
echo "📋 Étape 5: Vérification de la configuration Nginx..."

# Vérifier que Nginx peut se connecter au backend
if nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Configuration Nginx valide"
    systemctl reload nginx
    echo "✅ Nginx rechargé"
else
    echo "❌ Erreur dans la configuration Nginx"
    nginx -t
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════"
echo "✅ Correction terminée!"
echo ""
echo "🧪 Testez maintenant:"
echo "   curl https://backend.hoomy.site/api/properties"
echo ""
echo "📋 Commandes utiles:"
echo "   pm2 status              - Voir le statut"
echo "   pm2 logs hoomy-backend  - Voir les logs"
echo "   pm2 restart hoomy-backend - Redémarrer"
echo "   pm2 monit               - Monitoring en temps réel"
echo "════════════════════════════════════════════════"


