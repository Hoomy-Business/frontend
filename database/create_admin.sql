-- =========================================
-- CRÉATION D'UN COMPTE ADMINISTRATEUR
-- =========================================
-- Ce script crée un compte administrateur pour gérer les KYC
-- 
-- IMPORTANT: Changez le mot de passe après la première connexion !
-- 
-- Pour exécuter: psql -U postgres -d hoomy_ch -f create_admin.sql

-- Mot de passe par défaut: Admin123! (à changer immédiatement)
-- Hash bcrypt de "Admin123!": $2b$10$UijVYpJW3SX8MLciPjAvH.vtV9kix6s6xEil2khWy9.W1Q9iH0mvC

-- Vérifier si l'admin existe déjà
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@hoomy.ch') INTO admin_exists;
    
    IF admin_exists THEN
        RAISE NOTICE 'Le compte admin existe déjà. Mise à jour du rôle...';
        UPDATE users 
        SET role = 'admin', 
            email_verified = TRUE,
            phone_verified = TRUE
        WHERE email = 'admin@hoomy.ch';
    ELSE
        -- Créer le compte admin
        INSERT INTO users (
            first_name, 
            last_name, 
            email, 
            password_hash, 
            role, 
            email_verified, 
            phone_verified,
            kyc_verified
        ) VALUES (
            'Admin',
            'Hoomy',
            'admin@hoomy.ch',
            '$2b$10$UijVYpJW3SX8MLciPjAvH.vtV9kix6s6xEil2khWy9.W1Q9iH0mvC', -- Admin123!
            'admin',
            TRUE,
            TRUE,
            TRUE
        );
        RAISE NOTICE 'Compte admin créé avec succès !';
    END IF;
END $$;

-- Afficher les informations du compte admin
SELECT 
    id,
    email,
    first_name || ' ' || last_name as name,
    role,
    email_verified,
    kyc_verified,
    created_at
FROM users 
WHERE email = 'admin@hoomy.ch';

-- Instructions
SELECT '========================================' as separator;
SELECT 'COMPTE ADMIN CRÉÉ' as info;
SELECT '========================================' as separator;
SELECT 'Email: admin@hoomy.ch' as credentials;
SELECT 'Mot de passe: Admin123!' as credentials;
SELECT 'CHANGEZ LE MOT DE PASSE IMMEDIATEMENT !' as warning;
SELECT '========================================' as separator;

