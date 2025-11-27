# 🚀 Guide de Configuration Complète - Ubuntu Server

## 📋 Prérequis
- Ubuntu Server installé
- Accès root/sudo
- Connexion SSH ou accès direct

---

## 1️⃣ Installation de PostgreSQL

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vérifier le statut
sudo systemctl status postgresql
```

### Configuration du mot de passe PostgreSQL

```bash
# Se connecter en tant qu'utilisateur postgres
sudo -u postgres psql

# Dans psql, exécuter :
ALTER USER postgres PASSWORD 'VotreMotDePasseSecurise123!';
\q
```

### Créer la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE hoomy_ch;

# Créer un utilisateur (optionnel, ou utiliser postgres)
CREATE USER hoomy_user WITH PASSWORD 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE hoomy_ch TO hoomy_user;
ALTER DATABASE hoomy_ch OWNER TO hoomy_user;

# Quitter
\q
```

### Configurer PostgreSQL pour accepter les connexions

```bash
# Éditer le fichier de configuration
sudo nano /etc/postgresql/*/main/postgresql.conf

# Trouver et modifier :
listen_addresses = '*'  # Au lieu de 'localhost'

# Éditer pg_hba.conf pour autoriser les connexions
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Ajouter à la fin :
host    all             all             0.0.0.0/0               md5
host    all             all             ::/0                    md5

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

---

## 2️⃣ Installation de Node.js et NPM

```bash
# Installer Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier les versions
node --version
npm --version

# Installer PM2 globalement
sudo npm install -g pm2
```

---

## 3️⃣ Installation de Nginx

```bash
# Installer Nginx
sudo apt install nginx -y

# Démarrer et activer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier le statut
sudo systemctl status nginx
```

---

## 4️⃣ Configuration du Backend

### Cloner/Uploader le code

```bash
# Créer le répertoire
sudo mkdir -p /home/hoomy/backend
cd /home/hoomy/backend

# Si vous avez le code en local, utilisez scp ou git clone
# Exemple avec git :
git clone https://github.com/votre-repo/hoomy_backend.git .

# Installer les dépendances
npm install
```

### Créer le fichier .env

```bash
cd /home/hoomy/backend
nano .env
```

**Contenu du .env :**
```env
# Base de données
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=hoomy_ch
DB_USER=postgres
DB_PASSWORD=VotreMotDePasseSecurise123!

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire_changez_moi

# Serveur
PORT=3000
NODE_ENV=production

# Backend URL (pour les images)
BACKEND_URL=https://backend.hoomy.site

# Email (optionnel)
MAILERSEND_API_KEY=votre_cle_api_mailersend
# ou
BREVO_API_KEY=votre_cle_api_brevo
EMAIL_FROM=noreply@hoomy.site

# Stripe (optionnel)
STRIPE_SECRET_KEY=votre_cle_secrete_stripe
STRIPE_WEBHOOK_SECRET=votre_webhook_secret_stripe
```

### Initialiser la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql -d hoomy_ch

# Exécuter le script SQL
\i database/init_complete.sql

# Ou si vous avez un fichier SQL :
psql -U postgres -d hoomy_ch -f database/init_complete.sql
```

---

## 5️⃣ Configuration PM2

### Créer le fichier ecosystem.config.js

```bash
cd /home/hoomy/backend
nano ecosystem.config.js
```

**Contenu :**
```javascript
module.exports = {
  apps: [{
    name: 'hoomy-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};
```

### Créer le répertoire de logs

```bash
mkdir -p /home/hoomy/backend/logs
```

### Démarrer avec PM2

```bash
cd /home/hoomy/backend

# Démarrer l'application
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées (généralement une commande sudo à exécuter)

# Vérifier le statut
pm2 status
pm2 logs hoomy-backend
```

---

## 6️⃣ Configuration Nginx

### Créer la configuration pour le backend

```bash
sudo nano /etc/nginx/sites-available/hoomy-backend
```

**Contenu :**
```nginx
# Backend API
server {
    listen 80;
    server_name backend.hoomy.site;

    # Taille maximale des uploads
    client_max_body_size 50M;

    # Logs
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Activer la configuration

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/hoomy-backend /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### Configuration SSL avec Certbot (Let's Encrypt)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat SSL
sudo certbot --nginx -d backend.hoomy.site

# Le certificat sera renouvelé automatiquement
```

---

## 7️⃣ Configuration du Firewall

```bash
# Autoriser SSH (important !)
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Autoriser PostgreSQL (seulement depuis localhost)
sudo ufw allow from 127.0.0.1 to any port 5432

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

---

## 8️⃣ Vérifications Finales

### Vérifier PostgreSQL

```bash
# Tester la connexion
psql -U postgres -d hoomy_ch -h 127.0.0.1
# Entrer le mot de passe quand demandé

# Vérifier les tables
\dt
\q
```

### Vérifier PM2

```bash
# Statut
pm2 status

# Logs en temps réel
pm2 logs hoomy-backend

# Monitoring
pm2 monit
```

### Vérifier Nginx

```bash
# Statut
sudo systemctl status nginx

# Tester la configuration
sudo nginx -t

# Logs
sudo tail -f /var/log/nginx/hoomy-backend-error.log
```

### Tester l'API

```bash
# Depuis le serveur
curl http://127.0.0.1:3000/api/locations/cantons

# Depuis l'extérieur (si DNS configuré)
curl http://backend.hoomy.site/api/locations/cantons
```

---

## 9️⃣ Commandes Utiles

### PM2

```bash
# Redémarrer
pm2 restart hoomy-backend

# Arrêter
pm2 stop hoomy-backend

# Démarrer
pm2 start hoomy-backend

# Supprimer
pm2 delete hoomy-backend

# Recharger (zero downtime)
pm2 reload hoomy-backend

# Logs
pm2 logs hoomy-backend --lines 100
```

### PostgreSQL

```bash
# Se connecter
sudo -u postgres psql

# Se connecter à une base spécifique
sudo -u postgres psql -d hoomy_ch

# Backup
sudo -u postgres pg_dump hoomy_ch > backup_$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql -d hoomy_ch < backup_20241127.sql
```

### Nginx

```bash
# Recharger la configuration
sudo systemctl reload nginx

# Redémarrer
sudo systemctl restart nginx

# Tester la configuration
sudo nginx -t

# Voir les logs
sudo tail -f /var/log/nginx/hoomy-backend-error.log
```

---

## 🔟 Troubleshooting

### PostgreSQL ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u postgresql -n 50

# Vérifier les permissions
sudo chown -R postgres:postgres /var/lib/postgresql
```

### PM2 ne démarre pas

```bash
# Vérifier les logs
pm2 logs hoomy-backend --err

# Vérifier les variables d'environnement
pm2 env hoomy-backend
```

### Nginx erreur 502

```bash
# Vérifier que le backend tourne
pm2 status

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/hoomy-backend-error.log

# Vérifier que le port 3000 est accessible
curl http://127.0.0.1:3000
```

### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL écoute
sudo netstat -tlnp | grep 5432

# Vérifier pg_hba.conf
sudo cat /etc/postgresql/*/main/pg_hba.conf

# Tester la connexion
psql -U postgres -h 127.0.0.1 -d hoomy_ch
```

---

## 📝 Checklist de Configuration

- [ ] PostgreSQL installé et configuré
- [ ] Mot de passe PostgreSQL défini
- [ ] Base de données `hoomy_ch` créée
- [ ] Tables créées (init_complete.sql exécuté)
- [ ] Node.js et NPM installés
- [ ] PM2 installé
- [ ] Code backend uploadé
- [ ] Fichier .env configuré
- [ ] Dépendances installées (npm install)
- [ ] PM2 configuré et application démarrée
- [ ] PM2 configuré pour démarrer au boot
- [ ] Nginx installé et configuré
- [ ] Configuration Nginx activée
- [ ] SSL configuré (Certbot)
- [ ] Firewall configuré
- [ ] DNS configuré (backend.hoomy.site → IP du serveur)
- [ ] Tests de connexion réussis

---

## 🎯 Prochaines Étapes

1. Configurer le DNS pour pointer `backend.hoomy.site` vers l'IP du serveur
2. Obtenir le certificat SSL avec Certbot
3. Configurer les backups automatiques de la base de données
4. Configurer le monitoring (optionnel : PM2 Plus, New Relic, etc.)
5. Configurer les logs rotation

---

**Note** : Remplacez tous les mots de passe et secrets par des valeurs sécurisées !

