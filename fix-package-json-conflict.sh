#!/bin/bash

# Script pour résoudre le conflit de merge dans package.json

echo "🔧 Résolution du conflit de merge dans package.json"
echo "==================================================="

cd /home/hoomy_backend

# Sauvegarder l'ancien fichier
if [ -f "package.json" ]; then
    echo "💾 Sauvegarde de l'ancien package.json..."
    cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)
fi

# Créer le package.json propre pour le backend
echo "📝 Création du package.json propre..."
cat > package.json << 'EOF'
{
  "name": "hoomy-suisse",
  "version": "2.0.0",
  "description": "Plateforme de logement étudiant pour la Suisse",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:setup": "psql -U postgres -f database/schema.sql"
  },
  "keywords": [
    "housing",
    "students",
    "switzerland",
    "rental"
  ],
  "author": "Hoomy Team",
  "license": "MIT",
  "dependencies": {
    "@getbrevo/brevo": "^3.0.1",
    "bcryptjs": "^3.0.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.21.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mailersend": "^2.6.0",
    "multer": "^2.0.2",
    "nodemailer": "^7.0.10",
    "pg": "^8.11.3",
    "stripe": "^20.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF

echo "✅ package.json corrigé"
echo ""
echo "📦 Installation des dépendances..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dépendances installées avec succès"
    echo ""
    echo "🚀 Vous pouvez maintenant démarrer le backend:"
    echo "   pm2 start ecosystem.config.js"
else
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi


