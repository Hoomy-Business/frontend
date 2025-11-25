-- =========================================
-- MIGRATION: Ajout du champ profile_picture
-- =========================================
-- Ce script ajoute la colonne profile_picture à la table users
-- si elle n'existe pas déjà.
-- 
-- Usage: psql -U postgres -d hoomy_ch -f migration_add_profile_picture.sql
-- OU depuis psql: \i migration_add_profile_picture.sql

-- Vérifier si la colonne existe et l'ajouter si nécessaire
DO $$
BEGIN
    -- Vérifier si la colonne profile_picture n'existe pas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'profile_picture'
    ) THEN
        -- Ajouter la colonne profile_picture
        ALTER TABLE users 
        ADD COLUMN profile_picture VARCHAR(255);
        
        RAISE NOTICE 'Colonne profile_picture ajoutée avec succès à la table users';
    ELSE
        RAISE NOTICE 'La colonne profile_picture existe déjà dans la table users';
    END IF;
END $$;

-- Vérification
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'profile_picture';

SELECT 'Migration terminée avec succès!' as status;

