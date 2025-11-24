# Implémentation KYC (Know Your Customer)

## Vue d'ensemble

Le système KYC a été implémenté pour rendre obligatoire la vérification d'identité avant de pouvoir publier des annonces. Le processus est totalement immersif avec capture de selfie en direct.

## Base de données

### Migration SQL

Exécutez le fichier de migration pour créer la table KYC :

```bash
psql -U postgres -d hoomy_ch -f database/kyc_migration.sql
```

Ou manuellement dans PostgreSQL :

```sql
-- La table kyc_verifications sera créée
-- La colonne kyc_verified sera ajoutée à la table users
```

### Structure de la table `kyc_verifications`

- `id`: Identifiant unique
- `user_id`: Référence à l'utilisateur
- `id_card_front_url`: URL de la carte d'identité recto
- `id_card_back_url`: URL de la carte d'identité verso
- `selfie_url`: URL du selfie
- `status`: Statut (pending, approved, rejected)
- `rejection_reason`: Raison du rejet si applicable
- `submitted_at`: Date de soumission
- `reviewed_at`: Date de vérification
- `reviewed_by`: ID de l'admin qui a vérifié

## Backend

### Routes API

#### GET `/api/kyc/status`
Récupère le statut KYC de l'utilisateur connecté.

**Réponse:**
```json
{
  "status": "pending" | "approved" | "rejected" | "not_submitted",
  "is_verified": boolean,
  "kyc_verified": boolean,
  "id_card_front_url": string | null,
  "id_card_back_url": string | null,
  "selfie_url": string | null,
  "rejection_reason": string | null,
  "submitted_at": string | null,
  "reviewed_at": string | null
}
```

#### POST `/api/kyc/submit`
Soumet les documents KYC (cartes d'identité + selfie).

**Body (FormData):**
- `id_card_front`: Fichier image (recto)
- `id_card_back`: Fichier image (verso)
- `selfie`: Fichier image (selfie)

**Réponse:**
```json
{
  "message": "KYC soumis avec succès. En attente de vérification.",
  "kyc": { ... }
}
```

#### POST `/api/kyc/upload-image`
Upload une image individuelle (pour selfie en direct).

**Body (FormData):**
- `image`: Fichier image

#### GET `/api/kyc/image/:filename`
Récupère une image KYC par son nom de fichier.

### Vérification obligatoire

La route `POST /api/properties` vérifie maintenant que le KYC est approuvé avant de permettre la création d'une annonce. Si le KYC n'est pas vérifié, une erreur 403 est retournée avec le code `KYC_REQUIRED`.

## Frontend

### Composant KYCVerification

Le composant `KYCVerification` est intégré dans l'onglet "Profile" du dashboard owner.

**Fonctionnalités:**
- Upload de carte d'identité recto
- Upload de carte d'identité verso
- Capture de selfie en direct avec la webcam
- Affichage du statut KYC (not_submitted, pending, approved, rejected)
- Affichage des raisons de rejet si applicable

### Intégration dans CreateProperty

La page de création d'annonce vérifie le statut KYC et :
- Affiche une alerte si le KYC n'est pas vérifié
- Désactive le bouton de soumission si le KYC n'est pas vérifié
- Redirige vers le profil pour compléter le KYC

## Workflow utilisateur

1. **Inscription** : L'utilisateur s'inscrit normalement
2. **Première tentative de publication** : Si l'utilisateur essaie de publier une annonce sans KYC, il est redirigé vers son profil
3. **Vérification KYC** : Dans le profil, l'utilisateur :
   - Télécharge la carte d'identité recto
   - Télécharge la carte d'identité verso
   - Prend un selfie en direct avec la webcam
   - Soumet le KYC
4. **Vérification en attente** : Le statut passe à "pending"
5. **Vérification approuvée** : Un admin approuve le KYC (à implémenter côté admin)
6. **Publication autorisée** : L'utilisateur peut maintenant publier des annonces

## Fichiers modifiés/créés

### Backend
- `database/kyc_migration.sql` : Migration SQL
- `routes/kyc.js` : Routes API KYC
- `server.js` : Intégration des routes KYC et vérification dans POST /api/properties

### Frontend
- `client/src/components/KYCVerification.tsx` : Composant KYC
- `client/src/pages/OwnerDashboard.tsx` : Intégration du composant KYC
- `client/src/pages/CreateProperty.tsx` : Vérification KYC avant soumission
- `shared/schema.ts` : Schémas TypeScript pour KYC

## Prochaines étapes (optionnel)

1. **Interface admin** : Créer une interface pour que les admins puissent approuver/rejeter les KYC
2. **Notifications** : Envoyer des notifications email quand le KYC est approuvé/rejeté
3. **Vérification automatique** : Intégrer un service de vérification automatique (ex: Onfido, Jumio)
4. **Expiration KYC** : Ajouter une date d'expiration pour les KYC (ex: 1 an)

