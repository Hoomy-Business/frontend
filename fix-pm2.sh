#!/bin/bash

# Script pour corriger PM2 et redémarrer proprement

echo "🔧 Réparation de PM2"
echo "==================="

# Arrêter tous les processus PM2
echo "🛑 Arrêt de tous les processus PM2..."
pm2 kill 2>/dev/null || true

# Nettoyer le daemon PM2
echo "🧹 Nettoyage du daemon PM2..."
pm2 kill

# Attendre un peu
sleep 2

# Redémarrer le daemon PM2
echo "🚀 Redémarrage du daemon PM2..."
pm2 resurrect 2>/dev/null || pm2 ping

# Supprimer l'ancien processus s'il existe
echo "🗑️  Suppression des anciens processus..."
pm2 delete all 2>/dev/null || true

# Aller dans le répertoire du backend
cd /home/hoomy_backend

# Démarrer proprement
echo "▶️  Démarrage de l'application..."
pm2 start ecosystem.config.js

# Sauvegarder
echo "💾 Sauvegarde de la configuration PM2..."
pm2 save

# Afficher le statut
echo ""
echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "✅ PM2 réparé et application démarrée!"
echo ""
echo "📋 Commandes utiles :"
echo "   pm2 logs hoomy-backend"
echo "   pm2 monit"
echo "   pm2 restart hoomy-backend"

