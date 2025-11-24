-- =========================================
-- TABLE KYC (Know Your Customer)
-- =========================================
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Documents d'identité
    id_card_front_url VARCHAR(500),
    id_card_back_url VARCHAR(500),
    selfie_url VARCHAR(500),
    
    -- Statut de vérification
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Commentaires de vérification (pour les rejets)
    rejection_reason TEXT,
    
    -- Dates
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

CREATE INDEX idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status);

-- Ajouter la colonne kyc_verified dans la table users si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'kyc_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN kyc_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_kyc_verified ON users(kyc_verified);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_kyc_verifications_updated_at 
    BEFORE UPDATE ON kyc_verifications
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

