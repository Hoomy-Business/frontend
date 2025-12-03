-- Migration: Ajout des colonnes de signature électronique aux contrats
-- Date: 2024
-- Description: Ajoute les colonnes pour stocker les signatures électroniques des propriétaires et étudiants

-- Ajouter les colonnes de signature
ALTER TABLE rental_contracts 
ADD COLUMN IF NOT EXISTS owner_signature TEXT NULL,
ADD COLUMN IF NOT EXISTS student_signature TEXT NULL,
ADD COLUMN IF NOT EXISTS owner_signed_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS student_signed_at TIMESTAMP NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN rental_contracts.owner_signature IS 'Signature électronique du propriétaire au format base64 (data:image/png;base64,...)';
COMMENT ON COLUMN rental_contracts.student_signature IS 'Signature électronique de l''étudiant au format base64 (data:image/png;base64,...)';
COMMENT ON COLUMN rental_contracts.owner_signed_at IS 'Date et heure de signature du propriétaire';
COMMENT ON COLUMN rental_contracts.student_signed_at IS 'Date et heure de signature de l''étudiant';

