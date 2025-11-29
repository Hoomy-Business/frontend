# 🔧 Fix: Conflit de merge dans package.json

## Problème
```
npm error code EJSONPARSE
npm error Merge conflict detected in your package.json.
```

## Cause
Un conflit de merge Git n'a pas été résolu dans le fichier `package.json`. Le fichier contient des marqueurs de conflit (`<<<<<<<`, `=======`, `>>>>>>>`).

## ✅ Solution rapide

### Option 1 : Script automatique (recommandé)

```bash
cd /home/hoomy_backend
chmod +x fix-package-json-conflict.sh
./fix-package-json-conflict.sh
```

### Option 2 : Correction manuelle

```bash
cd /home/hoomy_backend

# Sauvegarder l'ancien fichier
cp package.json package.json.backup

# Éditer le fichier et supprimer les marqueurs de conflit
nano package.json
```

**Garder uniquement la partie backend (avant `=======`) et supprimer :**
- Les lignes `<<<<<<< HEAD`
- Les lignes `=======`
- Les lignes `>>>>>>> 2ba09aeee7be86614164f5b0e361fe8c7cb04baa`
- Tout le contenu frontend après `=======`

**Le fichier final doit ressembler à :**
```json
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
```

Puis :
```bash
# Installer les dépendances
npm install

# Démarrer le backend
pm2 start ecosystem.config.js
pm2 save
```

## 🔍 Vérification

```bash
# Vérifier que package.json est valide
cat package.json | python3 -m json.tool

# Ou avec Node.js
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"

# Installer les dépendances
npm install

# Vérifier que tout est installé
npm list --depth=0
```

## 📝 Notes

- Le conflit venait d'une fusion entre la configuration backend (HEAD) et frontend (autre branche)
- Pour le backend, nous gardons uniquement les dépendances backend (Express, PostgreSQL, etc.)
- Le frontend a son propre `package.json` dans le dossier `client/`


