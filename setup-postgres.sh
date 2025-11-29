#!/bin/bash

# Script de configuration PostgreSQL pour Hoomy
# Usage: sudo bash setup-postgres.sh

echo "🚀 Configuration PostgreSQL pour Hoomy"
echo "======================================"

# Demander le mot de passe
read -sp "Entrez le nouveau mot de passe pour l'utilisateur postgres: " POSTGRES_PASSWORD
echo ""
read -sp "Confirmez le mot de passe: " POSTGRES_PASSWORD_CONFIRM
echo ""

if [ "$POSTGRES_PASSWORD" != "$POSTGRES_PASSWORD_CONFIRM" ]; then
    echo "❌ Les mots de passe ne correspondent pas!"
    exit 1
fi

# Définir le mot de passe
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$POSTGRES_PASSWORD';"

# Créer la base de données si elle n'existe pas
sudo -u postgres psql -c "CREATE DATABASE hoomy_ch;" 2>/dev/null || echo "Base de données hoomy_ch existe déjà"

# Vérifier la création
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw hoomy_ch; then
    echo "✅ Base de données hoomy_ch créée avec succès"
else
    echo "❌ Erreur lors de la création de la base de données"
    exit 1
fi

# Configurer PostgreSQL pour accepter les connexions
POSTGRESQL_VERSION=$(psql --version | grep -oP '\d+' | head -1)
CONF_FILE="/etc/postgresql/${POSTGRESQL_VERSION}/main/postgresql.conf"
HBA_FILE="/etc/postgresql/${POSTGRESQL_VERSION}/main/pg_hba.conf"

# Modifier listen_addresses
if grep -q "^listen_addresses" "$CONF_FILE"; then
    sudo sed -i "s/^listen_addresses.*/listen_addresses = '*'/" "$CONF_FILE"
else
    echo "listen_addresses = '*'" | sudo tee -a "$CONF_FILE"
fi

# Ajouter les règles d'authentification
if ! grep -q "host    all             all             0.0.0.0/0               md5" "$HBA_FILE"; then
    echo "" | sudo tee -a "$HBA_FILE"
    echo "# Hoomy configuration" | sudo tee -a "$HBA_FILE"
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$HBA_FILE"
    echo "host    all             all             ::/0                    md5" | sudo tee -a "$HBA_FILE"
fi

# Redémarrer PostgreSQL
sudo systemctl restart postgresql

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📝 Informations de connexion:"
echo "   Host: 127.0.0.1"
echo "   Port: 5432"
echo "   Database: hoomy_ch"
echo "   User: postgres"
echo "   Password: [celui que vous avez défini]"
echo ""
echo "💡 N'oubliez pas de mettre à jour votre fichier .env avec ces informations!"


