# 🔧 Corrections Backend - Trust Proxy et Colonnes Email

## Problème 1 : Erreur Trust Proxy avec express-rate-limit

### Erreur
```
ValidationError: The Express 'trust proxy' setting is true, which allows anyone to trivially bypass IP-based rate limiting.
```

### Solution

**Fichier**: `server.js` (ou le fichier principal du serveur)

**Trouver et modifier** :
```javascript
// ❌ À SUPPRIMER ou MODIFIER
app.set('trust proxy', true);
```

**Options de correction** :

#### Option A : Si vous n'êtes PAS derrière un proxy (recommandé pour serveur LAN)
```javascript
// Supprimer complètement cette ligne
// app.set('trust proxy', true);  // ❌ SUPPRIMER
```

#### Option B : Si vous êtes derrière un proxy (nginx, load balancer)
```javascript
// Configurer avec le nombre exact de proxies
app.set('trust proxy', 1); // Si vous avez 1 proxy devant

// OU pour être plus spécifique
app.set('trust proxy', ['127.0.0.1', '::1']); // Si vous êtes en local uniquement
```

#### Option C : Désactiver la validation dans express-rate-limit (non recommandé)
Si vous devez absolument garder `trust proxy: true`, vous pouvez désactiver la validation :
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  // ... autres options
  validate: {
    trustProxy: false // Désactive la validation (non recommandé pour la sécurité)
  }
});
```

---

## Problème 2 : Colonnes de vérification email manquantes

### Erreur
```
⚠️ Colonnes de vérification email non trouvées, validation du code ignorée
```

### Cause
Le code backend essaie d'utiliser `email_verification_code` et `email_code_expires_at` dans la table `users`, mais ces colonnes n'existent pas dans votre base de données.

### Solution : Script de migration SQL

**Créer un fichier** : `migration_add_email_verification_columns.sql`

```sql
-- =========================================
-- MIGRATION: Ajout des colonnes de vérification email
-- =========================================
-- Ce script ajoute les colonnes email_verification_code et email_code_expires_at
-- à la table users si elles n'existent pas déjà.
-- 
-- Usage: psql -U postgres -d hoomy_ch -f migration_add_email_verification_columns.sql

-- Vérifier et ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    -- Ajouter email_verification_code si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email_verification_code'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN email_verification_code VARCHAR(6);
        
        RAISE NOTICE 'Colonne email_verification_code ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne email_verification_code existe déjà';
    END IF;

    -- Ajouter email_code_expires_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email_code_expires_at'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN email_code_expires_at TIMESTAMP;
        
        RAISE NOTICE 'Colonne email_code_expires_at ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne email_code_expires_at existe déjà';
    END IF;

    -- Ajouter terms_accepted si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'terms_accepted'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Colonne terms_accepted ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne terms_accepted existe déjà';
    END IF;

    -- Ajouter terms_accepted_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'terms_accepted_at'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN terms_accepted_at TIMESTAMP;
        
        RAISE NOTICE 'Colonne terms_accepted_at ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne terms_accepted_at existe déjà';
    END IF;

    -- Ajouter date_of_birth si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN date_of_birth DATE;
        
        RAISE NOTICE 'Colonne date_of_birth ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne date_of_birth existe déjà';
    END IF;
END $$;

-- Vérification
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name IN ('email_verification_code', 'email_code_expires_at', 'terms_accepted', 'terms_accepted_at', 'date_of_birth')
ORDER BY column_name;

SELECT 'Migration terminée avec succès!' as status;
```

### Exécution de la migration

```bash
psql -U postgres -d hoomy_ch -f migration_add_email_verification_columns.sql
```

Ou depuis psql :
```sql
\c hoomy_ch
\i migration_add_email_verification_columns.sql
```

---

## Résumé des actions à effectuer

1. ✅ **Corriger trust proxy** dans `server.js`
   - Supprimer `app.set('trust proxy', true)` si vous n'êtes pas derrière un proxy
   - OU configurer avec `app.set('trust proxy', 1)` si vous avez un proxy

2. ✅ **Exécuter la migration SQL** pour ajouter les colonnes manquantes
   - `email_verification_code`
   - `email_code_expires_at`
   - `terms_accepted`
   - `terms_accepted_at`
   - `date_of_birth`

3. ✅ **Redémarrer le serveur backend**

---

## Vérification

Après avoir appliqué ces corrections :
- L'erreur `trust proxy` ne devrait plus apparaître
- L'inscription devrait fonctionner sans l'avertissement sur les colonnes manquantes
- La vérification email devrait fonctionner correctement

