# 🔧 Corriger l'erreur PM2

## Problème
PM2 a une erreur de corruption : `Cannot read properties of undefined (reading 'pm2_env')`

## Solution rapide

### Option 1 : Script automatique

```bash
cd /home/hoomy_backend
chmod +x fix-pm2.sh
bash fix-pm2.sh
```

### Option 2 : Commandes manuelles

```bash
# 1. Tuer tous les processus PM2
pm2 kill

# 2. Attendre quelques secondes
sleep 3

# 3. Redémarrer le daemon PM2
pm2 ping

# 4. Supprimer tous les processus (nettoyage)
pm2 delete all

# 5. Aller dans le répertoire
cd /home/hoomy_backend

# 6. Démarrer proprement
pm2 start ecosystem.config.js

# 7. Sauvegarder
pm2 save

# 8. Vérifier
pm2 status
pm2 logs hoomy-backend
```

## Si ça ne fonctionne toujours pas

### Réinstallation complète de PM2

```bash
# Désinstaller PM2
sudo npm uninstall -g pm2

# Nettoyer les fichiers PM2
sudo rm -rf ~/.pm2
sudo rm -rf /root/.pm2

# Réinstaller PM2
sudo npm install -g pm2

# Redémarrer
cd /home/hoomy_backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Alternative : Démarrer directement avec Node

Si PM2 continue à poser problème, vous pouvez démarrer directement :

```bash
cd /home/hoomy_backend
NODE_ENV=production node server.js
```

Mais il vaut mieux corriger PM2 pour avoir la gestion automatique.

## Vérification

```bash
# Vérifier que l'application tourne
pm2 status

# Voir les logs
pm2 logs hoomy-backend

# Tester l'API
curl http://127.0.0.1:3000/api/locations/cantons
```

