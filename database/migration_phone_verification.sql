-- =========================================
-- MIGRATION: Vérification du numéro de téléphone
-- =========================================
-- Ce script ajoute les colonnes nécessaires pour la vérification par SMS

-- Ajouter les colonnes de vérification téléphone
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_code_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_pending VARCHAR(20);

-- S'assurer que phone_verified existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Index pour les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_users_phone_code ON users(phone_verification_code) WHERE phone_verification_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users(phone_verified);

-- Message de confirmation
SELECT 'Migration phone verification terminée avec succès' as info;

