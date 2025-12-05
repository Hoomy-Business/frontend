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

## 📝 Licence

MIT License - Voir le fichier LICENSE pour plus de détails

## 👥 Support

Pour toute question ou problème :
- Email : contact@hoomy.ch
- Documentation : Ce README

---

**Développé avec ❤️ pour les étudiants suisses**
