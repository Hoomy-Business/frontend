# Configuration du Panneau Administrateur

## 🎯 Vue d'ensemble

Le panneau administrateur permet de gérer les vérifications KYC (Know Your Customer) de manière sécurisée. Seuls les comptes avec le rôle `admin` peuvent y accéder.

## 📋 Étapes d'installation

### 1. Créer le compte administrateur

Exécutez le script SQL pour créer le compte admin :

```bash
cd "D:\Users\kor\Desktop\updo\hoomy_backend"
psql -U postgres -d hoomy_ch -f database/create_admin.sql
```

**Identifiants par défaut :**
- Email: `admin@hoomy.ch`
- Mot de passe: `Admin123!`

⚠️ **IMPORTANT** : Changez le mot de passe immédiatement après la première connexion !

### 2. Redémarrer le serveur backend

```bash
cd "D:\Users\kor\Desktop\updo\hoomy_backend"
npm start
```

### 3. Se connecter en tant qu'admin

1. Allez sur `http://[VOTRE_IP]:5000/login`
2. Connectez-vous avec `admin@hoomy.ch` / `Admin123!`
3. Vous verrez un bouton "Admin" dans la navigation (icône Shield)

## 🔐 Accès au Panneau Admin

### Depuis le navigateur desktop
- Cliquez sur le bouton "Admin" (icône Shield) dans la barre de navigation

### Depuis mobile
- Cliquez sur votre avatar (en haut à droite)
- Sélectionnez "Panneau Admin" dans le menu

### URL directe
- `http://[VOTRE_IP]:5000/admin/dashboard`

## 🛡️ Fonctionnalités du Panneau Admin

### Section KYC Ultra Sécurisée

1. **Statistiques en temps réel**
   - Nombre de KYC en attente
   - Nombre de KYC approuvés
   - Nombre de KYC rejetés
   - Total des KYC

2. **Liste des KYC en attente**
   - Affichage de tous les KYC soumis et en attente de validation
   - Informations utilisateur (nom, email, rôle)
   - Date de soumission

3. **Visualisation des documents**
   - **Carte d'identité recto** : Image complète et zoomable
   - **Carte d'identité verso** : Image complète et zoomable
   - **Selfie** : Photo du visage de l'utilisateur

4. **Actions disponibles**
   - **Approuver** : Valide le KYC et permet à l'utilisateur de publier des annonces
   - **Rejeter** : Rejette le KYC avec une raison (obligatoire)

## 📝 Processus de validation

### Approuver un KYC

1. Vérifiez les 3 documents (recto, verso, selfie)
2. Vérifiez que :
   - Les documents sont clairs et lisibles
   - Le selfie correspond aux photos de la carte d'identité
   - Les informations sont cohérentes
3. Cliquez sur "Approuver"
4. Confirmez l'action
5. L'utilisateur pourra maintenant publier des annonces

### Rejeter un KYC

1. Vérifiez les documents
2. Cliquez sur "Rejeter"
3. **Remplissez obligatoirement la raison du rejet** (ex: "Photo floue", "Document illisible", "Selfie ne correspond pas")
4. Cliquez sur "Rejeter"
5. L'utilisateur recevra la raison et pourra soumettre à nouveau

## 🔒 Sécurité

- **Routes protégées** : Toutes les routes admin vérifient le rôle `admin`
- **Authentification requise** : Impossible d'accéder sans être connecté
- **Vérification côté serveur** : Le backend vérifie le rôle à chaque requête
- **Section visuellement sécurisée** : Bordure et badge de sécurité visibles

## 🐛 Dépannage

### Je ne vois pas le bouton Admin
- Vérifiez que vous êtes connecté avec un compte admin
- Vérifiez que le rôle dans la base de données est bien `admin`
- Déconnectez-vous et reconnectez-vous

### Erreur 403 "Accès réservé aux administrateurs"
- Vérifiez que votre compte a bien le rôle `admin` en base de données
- Vérifiez que le token JWT contient bien le rôle admin

### Les images ne s'affichent pas
- Vérifiez que le backend est démarré
- Vérifiez que les fichiers sont bien dans `public/uploads/kyc/`
- Vérifiez les permissions de lecture des fichiers

## 📊 Requêtes SQL utiles

### Vérifier le rôle d'un utilisateur
```sql
SELECT id, email, role FROM users WHERE email = 'admin@hoomy.ch';
```

### Changer le rôle d'un utilisateur en admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'votre@email.com';
```

### Voir tous les KYC
```sql
SELECT k.*, u.email, u.first_name, u.last_name 
FROM kyc_verifications k 
JOIN users u ON k.user_id = u.id 
ORDER BY k.submitted_at DESC;
```

### Approuver manuellement un KYC
```sql
UPDATE kyc_verifications 
SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP 
WHERE id = [KYC_ID];

UPDATE users 
SET kyc_verified = TRUE 
WHERE id = [USER_ID];
```

## 🎨 Interface

Le panneau admin est conçu avec :
- **Section ultra sécurisée** : Bordure primaire et badge de sécurité
- **Affichage des images** : Zoom et prévisualisation optimisés
- **Statistiques en temps réel** : Mise à jour automatique toutes les 30 secondes
- **Interface responsive** : Fonctionne sur desktop et mobile

