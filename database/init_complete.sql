-- =========================================
-- SCRIPT SQL COMPLET - HOOMY SUISSE
-- =========================================
-- Ce script crée toute la base de données et le compte admin
-- Usage: psql -U postgres -f init_complete.sql

-- =========================================
-- CRÉATION DE LA BASE DE DONNÉES
-- =========================================
DROP DATABASE IF EXISTS hoomy_ch;
CREATE DATABASE hoomy_ch ENCODING 'UTF-8';
\c hoomy_ch

-- =========================================
-- TYPES ENUM POUR POSTGRES
-- =========================================
CREATE TYPE user_role AS ENUM ('student', 'owner', 'admin');
CREATE TYPE property_type AS ENUM ('apartment','house','studio','room','other');
CREATE TYPE property_status AS ENUM ('available','pending','rented');
CREATE TYPE request_status AS ENUM ('pending','accepted','rejected');
CREATE TYPE verification_type AS ENUM ('email','phone');
CREATE TYPE payment_status AS ENUM ('pending','completed','failed','refunded');
CREATE TYPE payment_method AS ENUM ('card','twint','bank_transfer');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- =========================================
-- TABLE UTILISATEURS
-- =========================================
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL,
    profile_picture VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kyc_verified ON users(kyc_verified);

-- =========================================
-- TABLE CODES DE VÉRIFICATION
-- =========================================
DROP TABLE IF EXISTS verification_codes CASCADE;
CREATE TABLE verification_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_type verification_type NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_user ON verification_codes(user_id);

-- =========================================
-- TABLE CANTONS ET VILLES SUISSES
-- =========================================
DROP TABLE IF EXISTS swiss_cantons CASCADE;
CREATE TABLE swiss_cantons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) NOT NULL UNIQUE,
    name_fr VARCHAR(50) NOT NULL,
    name_de VARCHAR(50) NOT NULL
);

INSERT INTO swiss_cantons (code, name_fr, name_de) VALUES
('ZH', 'Zurich', 'Zürich'),
('BE', 'Berne', 'Bern'),
('LU', 'Lucerne', 'Luzern'),
('UR', 'Uri', 'Uri'),
('SZ', 'Schwytz', 'Schwyz'),
('OW', 'Obwald', 'Obwalden'),
('NW', 'Nidwald', 'Nidwalden'),
('GL', 'Glaris', 'Glarus'),
('ZG', 'Zoug', 'Zug'),
('FR', 'Fribourg', 'Freiburg'),
('SO', 'Soleure', 'Solothurn'),
('BS', 'Bâle-Ville', 'Basel-Stadt'),
('BL', 'Bâle-Campagne', 'Basel-Landschaft'),
('SH', 'Schaffhouse', 'Schaffhausen'),
('AR', 'Appenzell Rhodes-Extérieures', 'Appenzell Ausserrhoden'),
('AI', 'Appenzell Rhodes-Intérieures', 'Appenzell Innerrhoden'),
('SG', 'Saint-Gall', 'St. Gallen'),
('GR', 'Grisons', 'Graubünden'),
('AG', 'Argovie', 'Aargau'),
('TG', 'Thurgovie', 'Thurgau'),
('TI', 'Tessin', 'Ticino'),
('VD', 'Vaud', 'Waadt'),
('VS', 'Valais', 'Wallis'),
('NE', 'Neuchâtel', 'Neuenburg'),
('GE', 'Genève', 'Genf'),
('JU', 'Jura', 'Jura');

DROP TABLE IF EXISTS swiss_cities CASCADE;
CREATE TABLE swiss_cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    canton_code VARCHAR(2) NOT NULL REFERENCES swiss_cantons(code),
    postal_code VARCHAR(4) NOT NULL,
    is_university_city BOOLEAN DEFAULT FALSE
);

INSERT INTO swiss_cities (name, canton_code, postal_code, is_university_city) VALUES
-- Genève
('Genève', 'GE', '1200', TRUE),
('Carouge', 'GE', '1227', FALSE),
('Vernier', 'GE', '1214', FALSE),
('Meyrin', 'GE', '1217', FALSE),
-- Vaud
('Lausanne', 'VD', '1000', TRUE),
('Montreux', 'VD', '1820', FALSE),
('Vevey', 'VD', '1800', FALSE),
('Yverdon-les-Bains', 'VD', '1400', FALSE),
('Renens', 'VD', '1020', FALSE),
-- Zurich
('Zurich', 'ZH', '8000', TRUE),
('Winterthur', 'ZH', '8400', TRUE),
('Uster', 'ZH', '8610', FALSE),
('Dübendorf', 'ZH', '8600', FALSE),
-- Berne
('Berne', 'BE', '3000', TRUE),
('Bienne', 'BE', '2500', TRUE),
('Thoune', 'BE', '3600', FALSE),
('Interlaken', 'BE', '3800', FALSE),
-- Lucerne
('Lucerne', 'LU', '6000', TRUE),
('Emmen', 'LU', '6020', FALSE),
('Sursee', 'LU', '6210', FALSE),
-- Fribourg
('Fribourg', 'FR', '1700', TRUE),
('Bulle', 'FR', '1630', FALSE),
('Murten', 'FR', '3280', FALSE),
-- Bâle-Ville / Campagne
('Bâle', 'BS', '4000', TRUE),
('Riehen', 'BS', '4125', FALSE),
('Allschwil', 'BL', '4123', FALSE),
('Liestal', 'BL', '4410', FALSE),
-- Neuchâtel
('Neuchâtel', 'NE', '2000', TRUE),
('La Chaux-de-Fonds', 'NE', '2300', FALSE),
('Le Locle', 'NE', '2400', FALSE),
-- Saint-Gall
('Saint-Gall', 'SG', '9000', TRUE),
('Rapperswil-Jona', 'SG', '8640', FALSE),
('Wil', 'SG', '9500', FALSE),
-- Tessin
('Lugano', 'TI', '6900', TRUE),
('Bellinzone', 'TI', '6500', FALSE),
('Locarno', 'TI', '6600', FALSE),
('Mendrisio', 'TI', '6850', FALSE),
-- Valais
('Sion', 'VS', '1950', TRUE),
('Monthey', 'VS', '1870', FALSE),
('Sierre', 'VS', '3960', FALSE),
('Verbier', 'VS', '1936', FALSE),
-- Jura
('Delémont', 'JU', '2800', TRUE),
('Porrentruy', 'JU', '2900', FALSE),
-- Argovie
('Aarau', 'AG', '5000', TRUE),
('Baden', 'AG', '5400', FALSE),
('Zofingue', 'AG', '4800', FALSE),
-- Soleure
('Soleure', 'SO', '4500', TRUE),
('Olten', 'SO', '4600', FALSE),
('Grenchen', 'SO', '2540', FALSE),
-- Thurgovie
('Frauenfeld', 'TG', '8500', TRUE),
('Weinfelden', 'TG', '8570', FALSE),
('Kreuzlingen', 'TG', '8280', FALSE),
-- Grisons
('Coire', 'GR', '7000', TRUE),
('Davos', 'GR', '7270', FALSE),
('Saint-Moritz', 'GR', '7500', FALSE),
-- Uri
('Altdorf', 'UR', '6460', FALSE),
-- Schwytz
('Schwytz', 'SZ', '6430', FALSE),
('Pfäffikon', 'SZ', '8808', FALSE),
-- Obwald
('Sarnen', 'OW', '6060', FALSE),
-- Nidwald
('Stans', 'NW', '6370', FALSE),
-- Glaris
('Glaris', 'GL', '8750', FALSE),
-- Zoug
('Zoug', 'ZG', '6300', TRUE),
-- Schaffhouse
('Schaffhouse', 'SH', '8200', FALSE),
-- Appenzell Rhodes-Extérieures / Intérieures
('Herisau', 'AR', '9100', FALSE),
('Appenzell', 'AI', '9050', FALSE);

-- =========================================
-- TABLE ANNONCES IMMOBILIÈRES
-- =========================================
DROP TABLE IF EXISTS properties CASCADE;
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    address VARCHAR(255) NOT NULL,
    city_id INT REFERENCES swiss_cities(id),
    city_name VARCHAR(100) NOT NULL,
    postal_code VARCHAR(4) NOT NULL,
    canton_code VARCHAR(2) NOT NULL REFERENCES swiss_cantons(code),
    price NUMERIC(10,2) NOT NULL,
    rooms NUMERIC(3,1),
    bathrooms INT,
    surface_area INT,
    available_from DATE,
    status property_status DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_city ON properties(city_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_type ON properties(property_type);

-- =========================================
-- TABLE PHOTOS DES ANNONCES
-- =========================================
DROP TABLE IF EXISTS property_photos CASCADE;
CREATE TABLE property_photos (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_photos_property ON property_photos(property_id);

-- =========================================
-- TABLE CONVERSATIONS
-- =========================================
DROP TABLE IF EXISTS conversations CASCADE;
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, student_id, owner_id)
);

CREATE INDEX idx_conversations_student ON conversations(student_id);
CREATE INDEX idx_conversations_owner ON conversations(owner_id);
CREATE INDEX idx_conversations_property ON conversations(property_id);

-- =========================================
-- TABLE MESSAGES
-- =========================================
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- =========================================
-- TABLE FAVORIS
-- =========================================
DROP TABLE IF EXISTS favorites CASCADE;
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_property ON favorites(property_id);

-- =========================================
-- TABLE DEMANDES / RÉSERVATIONS
-- =========================================
DROP TABLE IF EXISTS property_requests CASCADE;
CREATE TABLE property_requests (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status request_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requests_property ON property_requests(property_id);
CREATE INDEX idx_requests_requester ON property_requests(requester_id);
CREATE INDEX idx_requests_status ON property_requests(status);

-- =========================================
-- TABLE PAIEMENTS
-- =========================================
DROP TABLE IF EXISTS payments CASCADE;
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    payer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    description TEXT,
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    payment_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_receiver ON payments(receiver_id);
CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_type ON payments(payment_type);

-- =========================================
-- TABLE KYC (Know Your Customer)
-- =========================================
DROP TABLE IF EXISTS kyc_verifications CASCADE;
CREATE TABLE kyc_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_card_front_url VARCHAR(500),
    id_card_back_url VARCHAR(500),
    selfie_url VARCHAR(500),
    status kyc_status DEFAULT 'pending',
    rejection_reason TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status);

-- =========================================
-- TABLE CONTRATS DE LOCATION
-- =========================================
DROP TABLE IF EXISTS rental_contracts CASCADE;
CREATE TABLE rental_contracts (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id BIGINT REFERENCES property_requests(id) ON DELETE SET NULL,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE SET NULL,
    monthly_rent NUMERIC(10,2) NOT NULL,
    hoomy_commission NUMERIC(10,2) NOT NULL,
    owner_payout NUMERIC(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deposit_amount NUMERIC(10,2) DEFAULT 0,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated', 'completed', 'cancelled')),
    contract_signed_at TIMESTAMP,
    owner_stripe_account_id VARCHAR(255),
    contract_document_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date > start_date),
    CONSTRAINT check_rent CHECK (monthly_rent > 0)
);

CREATE INDEX idx_contracts_property ON rental_contracts(property_id);
CREATE INDEX idx_contracts_owner ON rental_contracts(owner_id);
CREATE INDEX idx_contracts_student ON rental_contracts(student_id);
CREATE INDEX idx_contracts_status ON rental_contracts(status);
CREATE INDEX idx_rental_contracts_conversation ON rental_contracts(conversation_id);

-- =========================================
-- TABLE PAIEMENTS DE LOYERS
-- =========================================
DROP TABLE IF EXISTS rental_payments CASCADE;
CREATE TABLE rental_payments (
    id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    proof_url VARCHAR(500),
    payment_method VARCHAR(50),
    verified_by_owner BOOLEAN DEFAULT FALSE,
    owner_verification_date TIMESTAMP,
    commission_amount NUMERIC(10,2) NOT NULL,
    commission_paid BOOLEAN DEFAULT FALSE,
    commission_payment_date TIMESTAMP,
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_id, month_year)
);

CREATE INDEX idx_rental_payments_contract ON rental_payments(contract_id);
CREATE INDEX idx_rental_payments_student ON rental_payments(student_id);
CREATE INDEX idx_rental_payments_owner ON rental_payments(owner_id);
CREATE INDEX idx_rental_payments_month ON rental_payments(month_year);
CREATE INDEX idx_rental_payments_commission_paid ON rental_payments(commission_paid);

-- =========================================
-- TABLE FRAIS DE PLATEFORME
-- =========================================
DROP TABLE IF EXISTS platform_fees CASCADE;
CREATE TABLE platform_fees (
    id BIGSERIAL PRIMARY KEY,
    rental_payment_id BIGINT NOT NULL REFERENCES rental_payments(id) ON DELETE CASCADE,
    contract_id BIGINT NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    base_amount NUMERIC(10,2) NOT NULL,
    fee_percentage NUMERIC(5,2) DEFAULT 2.00,
    fee_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    due_date DATE NOT NULL,
    paid_at TIMESTAMP,
    metadata JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platform_fees_rental_payment ON platform_fees(rental_payment_id);
CREATE INDEX idx_platform_fees_contract ON platform_fees(contract_id);
CREATE INDEX idx_platform_fees_owner ON platform_fees(owner_id);
CREATE INDEX idx_platform_fees_status ON platform_fees(status);
CREATE INDEX idx_platform_fees_due_date ON platform_fees(due_date);

-- =========================================
-- TABLE TRANSACTIONS DE PAIEMENT
-- =========================================
DROP TABLE IF EXISTS payment_transactions CASCADE;
CREATE TABLE payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT REFERENCES rental_contracts(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    amount NUMERIC(10,2) NOT NULL,
    hoomy_fee NUMERIC(10,2) NOT NULL,
    owner_payout NUMERIC(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    payment_method VARCHAR(50),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_amount CHECK (amount > 0)
);

CREATE INDEX idx_payment_transactions_contract ON payment_transactions(contract_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(payment_status);

-- =========================================
-- TABLE COMPTES STRIPE CONNECT
-- =========================================
DROP TABLE IF EXISTS owner_stripe_accounts CASCADE;
CREATE TABLE owner_stripe_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    payouts_enabled BOOLEAN DEFAULT FALSE,
    charges_enabled BOOLEAN DEFAULT FALSE,
    bank_account_last4 VARCHAR(4),
    bank_account_bank_name VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'unverified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_owner_stripe_accounts_user ON owner_stripe_accounts(user_id);

-- =========================================
-- FONCTIONS ET TRIGGERS
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON kyc_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_contracts_updated_at BEFORE UPDATE ON rental_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_payments_updated_at BEFORE UPDATE ON rental_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_fees_updated_at BEFORE UPDATE ON platform_fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owner_stripe_accounts_updated_at BEFORE UPDATE ON owner_stripe_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer la commission
CREATE OR REPLACE FUNCTION calculate_commission(rent_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(rent_amount * 0.02, 2);
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- VUES UTILES
-- =========================================
CREATE OR REPLACE VIEW owner_payment_dashboard AS
SELECT 
    o.id as owner_id,
    COUNT(DISTINCT rc.id) as active_contracts,
    SUM(CASE WHEN rp.verified_by_owner = TRUE THEN rp.amount ELSE 0 END) as total_rent_received,
    SUM(CASE WHEN rp.commission_paid = TRUE THEN rp.commission_amount ELSE 0 END) as total_commission_paid,
    SUM(CASE WHEN rp.commission_paid = FALSE AND rp.verified_by_owner = TRUE THEN rp.commission_amount ELSE 0 END) as pending_commission
FROM users o
LEFT JOIN rental_contracts rc ON o.id = rc.owner_id AND rc.status = 'active'
LEFT JOIN rental_payments rp ON rc.id = rp.contract_id
WHERE o.role = 'owner'
GROUP BY o.id;

CREATE OR REPLACE VIEW student_payment_dashboard AS
SELECT 
    s.id as student_id,
    COUNT(DISTINCT rc.id) as active_contracts,
    SUM(rp.amount) as total_rent_paid,
    COUNT(CASE WHEN rp.verified_by_owner = FALSE THEN 1 END) as pending_verifications
FROM users s
LEFT JOIN rental_contracts rc ON s.id = rc.student_id AND rc.status = 'active'
LEFT JOIN rental_payments rp ON rc.id = rp.contract_id
WHERE s.role = 'student'
GROUP BY s.id;

CREATE OR REPLACE VIEW contract_overview AS
SELECT 
    rc.id,
    rc.status,
    rc.monthly_rent,
    rc.start_date,
    rc.end_date,
    p.title as property_title,
    p.city_name,
    CONCAT(s.first_name, ' ', s.last_name) as student_name,
    s.email as student_email,
    CONCAT(o.first_name, ' ', o.last_name) as owner_name,
    o.email as owner_email,
    rc.created_at
FROM rental_contracts rc
JOIN properties p ON rc.property_id = p.id
JOIN users s ON rc.student_id = s.id
JOIN users o ON rc.owner_id = o.id
ORDER BY rc.created_at DESC;

-- =========================================
-- CRÉATION DU COMPTE ADMIN
-- =========================================
-- Mot de passe: HgXGmCONtjiggzkOfZQ32qposMjI5a0l
-- Hash bcrypt: $2b$10$L.pyC8XRp1axyGcGjOjT1uGevAhqznsIzK28ktITxRBT8WIZDFdDm
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
    '$2b$10$L.pyC8XRp1axyGcGjOjT1uGevAhqznsIzK28ktITxRBT8WIZDFdDm',
    'admin',
    TRUE,
    TRUE,
    TRUE
) ON CONFLICT (email) DO UPDATE
SET 
    role = 'admin',
    password_hash = '$2b$10$L.pyC8XRp1axyGcGjOjT1uGevAhqznsIzK28ktITxRBT8WIZDFdDm',
    email_verified = TRUE,
    phone_verified = TRUE,
    kyc_verified = TRUE;

-- =========================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =========================================
-- Mot de passe pour tous les comptes de test: "password123"
-- Hash bcrypt de "password123": $2b$10$rBV2JDeWW3.vKyYU3bHR9eRJNW0qs4qTYc6vCqYqRr3bqM3qV7yYm

INSERT INTO users (first_name, last_name, email, password_hash, phone, role, email_verified, phone_verified) VALUES
('Sophie', 'Müller', 'etudiant@hoomy.ch', '$2b$10$rBV2JDeWW3.vKyYU3bHR9eRJNW0qs4qTYc6vCqYqRr3bqM3qV7yYm', '+41 76 123 45 67', 'student', TRUE, TRUE),
('Marc', 'Dupont', 'proprietaire@hoomy.ch', '$2b$10$rBV2JDeWW3.vKyYU3bHR9eRJNW0qs4qTYc6vCqYqRr3bqM3qV7yYm', '+41 79 987 65 43', 'owner', TRUE, TRUE),
('Julia', 'Weber', 'proprietaire2@hoomy.ch', '$2b$10$rBV2JDeWW3.vKyYU3bHR9eRJNW0qs4qTYc6vCqYqRr3bqM3qV7yYm', '+41 78 111 22 33', 'owner', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO properties (owner_id, title, description, property_type, address, city_id, city_name, postal_code, canton_code, price, rooms, bathrooms, surface_area, status) VALUES
(2, 'Studio moderne proche EPFL', 'Studio de 25m² entièrement meublé, situé à 10 minutes à pied de l''EPFL. Cuisine équipée, salle de bain avec douche, connexion internet fibre optique incluse. Chauffage et charges compris.', 'studio', '15 Avenue des Étudiants', 5, 'Lausanne', '1015', 'VD', 950, 1, 1, 25, 'available'),
(2, 'Appartement 2.5 pièces centre-ville', 'Charmant appartement de 55m² au cœur du centre-ville. Séjour lumineux, chambre spacieuse, cuisine équipée, balcon. Proche des transports publics. Idéal pour étudiants ou jeune couple.', 'apartment', '8 Rue du Centre', 5, 'Lausanne', '1003', 'VD', 1450, 2.5, 1, 55, 'available'),
(3, 'Chambre dans colocation', 'Grande chambre meublée de 18m² dans appartement en colocation avec 2 autres étudiants. Cuisine et salon partagés, ambiance conviviale. Proche de l''Université de Genève.', 'room', '23 Rue des Universités', 1, 'Genève', '1205', 'GE', 750, 1, 1, 18, 'available'),
(3, 'Studio avec vue sur le lac', 'Studio de 32m² avec balcon et vue sur le lac Léman. Très lumineux, calme, proche transports. Cuisine américaine équipée, lave-linge dans la salle de bain.', 'studio', '42 Quai du Lac', 1, 'Genève', '1204', 'GE', 1200, 1, 1, 32, 'available')
ON CONFLICT DO NOTHING;

-- =========================================
-- MESSAGE DE CONFIRMATION
-- =========================================
SELECT '========================================' as separator;
SELECT 'BASE DE DONNÉES HOOMY SUISSE CRÉÉE' as info;
SELECT '========================================' as separator;
SELECT 'COMPTE ADMIN CRÉÉ' as info;
SELECT 'Email: admin@hoomy.ch' as credentials;
SELECT 'Mot de passe: HgXGmCONtjiggzkOfZQ32qposMjI5a0l' as credentials;
SELECT '========================================' as separator;
SELECT 'COMPTES DE TEST' as info;
SELECT 'Email: ' || email || ' | Rôle: ' || role || ' | Mot de passe: password123' as compte FROM users WHERE role != 'admin';
SELECT '========================================' as separator;

