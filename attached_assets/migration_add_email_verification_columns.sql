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

