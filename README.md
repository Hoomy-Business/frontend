# 🏠 Hoomy Suisse - Plateforme de Logement Étudiant

Plateforme professionnelle de mise en relation entre étudiants et propriétaires en Suisse.

## ✨ Nouvelles Fonctionnalités (v2.0)

### ✅ Fonctionnalités Implémentées

1. **Vérification d'Identité**
   - Vérification par email avec code à 6 chiffres
   - Vérification par SMS (téléphone)
   - Expiration automatique des codes (15 minutes)
   - Badges de vérification visibles sur les profils

2. **Messagerie Intégrée**
   - Conversations privées entre étudiants et propriétaires
   - Messages en temps réel
   - Compteur de messages non lus
   - Historique complet des échanges
   - Notifications de nouveaux messages

3. **Système de Paiements**
   - Support TWINT (méthode suisse)
   - Paiement par carte bancaire
   - Virement bancaire
   - Historique des transactions
   - IDs de transaction uniques
   - Statuts de paiement (en attente, complété, échoué, remboursé)

4. **Adaptation Suisse**
   - 26 cantons suisses (français/allemand)
   - 30+ villes universitaires
   - Codes postaux à 4 chiffres
   - Prix en CHF
   - Format téléphone suisse (+41)
   - Interface en français avec termes suisses

5. **Gestion des Paramètres**
   - Mise à jour du profil
   - Changement de mot de passe
   - Gestion des préférences
   - Suppression de compte

6. **Blocage d'Accès**
   - Connexion obligatoire pour voir les détails des annonces
   - Redirection automatique vers la page de connexion
   - Protection des informations de contact

7. **Design Modernisé**
   - Suppression de tous les emojis
   - Style épuré et professionnel
   - Inspiré de Google Material Design
   - Bordures subtiles au lieu d'ombres lourdes
   - Palette de couleurs professionnelle

## 📦 Installation

### Prérequis

- Node.js 14+ 
- PostgreSQL 12+
- npm ou yarn

### 1. Cloner le projet

```bash
git clone <repository-url>
cd hoomy-improved
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données

#### Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Ou exécuter directement le script
psql -U postgres -f database/schema.sql
```

Cela créera automatiquement :
- La base de données `hoomy_ch`
- Toutes les tables nécessaires
- Les données de test (cantons, villes, utilisateurs de test)

#### Comptes de test créés

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| etudiant@hoomy.ch | password123 | Étudiant |
| proprietaire@hoomy.ch | password123 | Propriétaire |
| proprietaire2@hoomy.ch | password123 | Propriétaire |

### 4. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` et remplacez les valeurs :

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=hoomy_ch
DB_PASSWORD=votre_mot_de_passe_postgres
DB_PORT=5432
JWT_SECRET=generer_une_cle_secrete_securisee
PORT=3000
```

### 5. Démarrer le serveur

```bash
# Mode production
npm start

# Mode développement (avec auto-reload)
npm run dev
```

Le serveur démarre sur http://localhost:3000

### 6. Accéder à l'application

Ouvrez votre navigateur et accédez à :
- Frontend : http://localhost:3000
- API : http://localhost:3000/api/

## 🗂️ Structure du Projet

```
hoomy-improved/
├── database/
│   └── schema.sql              # Schéma complet de la base de données
├── public/
│   ├── index.html              # Frontend (à compléter)
│   └── app.js                  # JavaScript frontend (à compléter)
├── server.js                   # Serveur Express avec toutes les routes API
├── package.json                # Dépendances Node.js
├── .env.example                # Template de configuration
├── .env                        # Configuration (à créer)
├── AMELIORATIONS.md            # Documentation des améliorations
└── README.md                   # Ce fichier
```

## 📚 API Documentation

### Authentification

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "Sophie",
  "last_name": "Müller",
  "email": "sophie@example.ch",
  "password": "motdepasse123",
  "phone": "+41 76 123 45 67",
  "role": "student"
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "sophie@example.ch",
  "password": "motdepasse123"
}
```

### Vérification

#### Envoyer un code de vérification
```http
POST /api/verification/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "email"  // ou "phone"
}
```

#### Vérifier un code
```http
POST /api/verification/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "email",
  "code": "123456"
}
```

### Localisation

#### Récupérer les cantons
```http
GET /api/locations/cantons
```

#### Récupérer les villes
```http
GET /api/locations/cities?canton=VD&university_only=true
```

### Annonces

#### Créer une annonce
```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Studio moderne proche EPFL",
  "description": "Beau studio meublé...",
  "property_type": "studio",
  "address": "15 Avenue des Étudiants",
  "city_name": "Lausanne",
  "postal_code": "1015",
  "canton_code": "VD",
  "price": 950,
  "rooms": 1,
  "bathrooms": 1,
  "surface_area": 25
}
```

#### Rechercher des annonces
```http
GET /api/properties?city_id=1&max_price=1500&property_type=studio
```

### Messagerie

#### Créer une conversation
```http
POST /api/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": 1,
  "owner_id": 2
}
```

#### Envoyer un message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": 1,
  "content": "Bonjour, je suis intéressé par votre annonce..."
}
```

#### Récupérer les messages
```http
GET /api/messages/1
Authorization: Bearer <token>
```

### Paiements

#### Créer un paiement
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": 1,
  "receiver_id": 2,
  "amount": 950,
  "payment_method": "twint",
  "description": "Premier mois de loyer"
}
```

## 🎨 Guide de Style Frontend

### Principes de Design

1. **Minimaliste** : Espaces blancs généreux, moins d'éléments visuels
2. **Épuré** : Bordures fines (1-2px) au lieu d'ombres lourdes
3. **Professionnel** : Typographie claire, hiérarchie visuelle
4. **Flat Design** : Pas de dégradés complexes
5. **Material Design Light** : Inspiré de Google Workspace

### Palette de Couleurs

```css
--primary: #1a73e8     /* Bleu professionnel */
--secondary: #34a853   /* Vert validation */
--accent: #ea4335      /* Rouge alerte */
--warning: #fbbc04     /* Jaune attention */
--text: #202124        /* Texte principal */
--text-light: #5f6368  /* Texte secondaire */
--border: #dadce0      /* Bordures */
--bg: #f8f9fa          /* Fond */
```

### Exemples de Modifications

❌ **Avant (style IA) :**
```html
<button class="btn">🏠 Accueil</button>
<div class="card" style="box-shadow: 0 8px 24px rgba(0,0,0,0.2)">
```

✅ **Après (style professionnel) :**
```html
<button class="btn">Accueil</button>
<div class="card" style="border: 1px solid var(--border); box-shadow: 0 1px 2px rgba(0,0,0,0.1)">
```

## 🚀 Tâches Restantes (Frontend)

### Priorité 1 - Essentiel
- [ ] Retirer tous les emojis du HTML
- [ ] Moderniser les cards (design épuré)
- [ ] Bloquer accès annonces sans connexion
- [ ] Implémenter dropdown cantons
- [ ] Implémenter dropdown villes
- [ ] Adapter tous les prix en CHF

### Priorité 2 - Important
- [ ] Créer page de vérification email/téléphone
- [ ] Créer interface de messagerie complète
- [ ] Créer page de paiements
- [ ] Créer page de paramètres détaillée
- [ ] Créer page d'aide/FAQ

### Priorité 3 - Améliorations
- [ ] Upload de photos d'annonces
- [ ] Galerie d'images avec lightbox
- [ ] Système de notation/avis
- [ ] Recherche avancée avec carte
- [ ] Notifications push en temps réel

## 🔒 Sécurité

### Implémenté
- ✅ Hash des mots de passe (bcrypt avec salt)
- ✅ Tokens JWT avec expiration (7 jours)
- ✅ Middleware d'authentification
- ✅ Vérification des permissions utilisateur
- ✅ Codes de vérification avec expiration (15 min)
- ✅ Protection contre requêtes duplicates
- ✅ Validation des entrées

### À Ajouter en Production
- [ ] HTTPS obligatoire (Let's Encrypt)
- [ ] Rate limiting (express-rate-limit)
- [ ] Protection CSRF
- [ ] Validation stricte des uploads
- [ ] Logs d'audit
- [ ] Backup automatique de la BDD
- [ ] Monitoring (Sentry, New Relic)

## 📊 Base de Données

### Tables Principales

| Table | Description | Lignes |
|-------|-------------|--------|
| users | Utilisateurs (étudiants, propriétaires) | ~ |
| verification_codes | Codes de vérification temporaires | ~ |
| swiss_cantons | 26 cantons suisses | 26 |
| swiss_cities | Villes suisses avec universités | 30+ |
| properties | Annonces de logement | ~ |
| property_photos | Photos des annonces | ~ |
| conversations | Conversations de messagerie | ~ |
| messages | Messages individuels | ~ |
| property_requests | Demandes de contact | ~ |
| payments | Historique des paiements | ~ |
| favorites | Favoris des utilisateurs | ~ |

### Migrations

Pour réinitialiser la base de données :

```bash
# Attention : cela supprime toutes les données !
psql -U postgres -c "DROP DATABASE IF EXISTS hoomy_ch;"
psql -U postgres -f database/schema.sql
```

## 🧪 Tests

### Tester l'API avec curl

```bash
# Test de santé
curl http://localhost:3000/api/health

# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.ch",
    "password": "password123",
    "role": "student"
  }'

# Récupérer les cantons
curl http://localhost:3000/api/locations/cantons

# Récupérer les villes
curl http://localhost:3000/api/locations/cities
```

## 🐛 Dépannage

### La base de données ne se connecte pas

1. Vérifiez que PostgreSQL est démarré :
```bash
sudo service postgresql status
```

2. Vérifiez vos credentials dans `.env`
3. Créez la base manuellement si nécessaire :
```bash
psql -U postgres -c "CREATE DATABASE hoomy_ch;"
```

### Le serveur ne démarre pas

1. Vérifiez que le port 3000 est libre :
```bash
lsof -i :3000
```

2. Vérifiez les dépendances :
```bash
rm -rf node_modules package-lock.json
npm install
```

### Les codes de vérification ne s'envoient pas

En mode développement, les codes sont simplement affichés dans la console du serveur. Pour envoyer de vrais emails/SMS, configurez :
- SMTP pour les emails (Gmail, SendGrid, AWS SES)
- Twilio pour les SMS

## 📝 Licence

MIT License - Voir le fichier LICENSE pour plus de détails

## 👥 Support

Pour toute question ou problème :
- Email : support@hoomy.ch
- Issues : [GitHub Issues]
- Documentation : Ce README

## 🎯 Roadmap

### Version 2.1 (Q1 2024)
- [ ] Upload de photos
- [ ] Système de notation
- [ ] Recherche avec carte interactive
- [ ] Application mobile (React Native)

### Version 2.2 (Q2 2024)
- [ ] Paiements en ligne réels (Stripe)
- [ ] Contrats numériques
- [ ] Signature électronique
- [ ] Assurance logement intégrée

### Version 3.0 (Q3 2024)
- [ ] IA pour recommandations personnalisées
- [ ] Chatbot d'assistance
- [ ] Traduction automatique FR/DE/IT
- [ ] API publique pour partenaires

---

**Développé avec ❤️ pour les étudiants suisses**
