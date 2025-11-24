-- =========================================
-- MISE À JOUR DU MOT DE PASSE ADMIN
-- =========================================
-- Ce script met à jour le mot de passe de l'admin
-- 
-- Mot de passe: Admin123!
-- Hash: $2b$10$UijVYpJW3SX8MLciPjAvH.vtV9kix6s6xEil2khWy9.W1Q9iH0mvC

UPDATE users 
SET password_hash = '$2b$10$UijVYpJW3SX8MLciPjAvH.vtV9kix6s6xEil2khWy9.W1Q9iH0mvC'
WHERE email = 'admin@hoomy.ch';

-- Vérifier la mise à jour
SELECT 
    id,
    email,
    first_name || ' ' || last_name as name,
    role,
    email_verified
FROM users 
WHERE email = 'admin@hoomy.ch';

SELECT 'Mot de passe admin mis à jour avec succès !' as message;
SELECT 'Email: admin@hoomy.ch' as credentials;
SELECT 'Mot de passe: Admin123!' as credentials;

