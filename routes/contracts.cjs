// routes/contracts.js
// ========================================
// 📝 GESTION DES CONTRATS DE LOCATION
// ========================================
require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Utiliser le pool partagé depuis db.js
const { pool } = require('../db.cjs');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requis' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// ========================================
// 🏦 STRIPE CONNECT - COMPTES PROPRIÉTAIRES
// ========================================

// Créer un compte Stripe Connect
router.post('/connect/create-account', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;

        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Seuls les propriétaires peuvent créer un compte Stripe Connect' });
        }

        // Vérifier que Stripe est configuré
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('❌ STRIPE_SECRET_KEY non configuré');
            return res.status(500).json({ error: 'Configuration Stripe manquante' });
        }

        // Vérifier si la table existe
        try {
            await client.query('SELECT 1 FROM owner_stripe_accounts LIMIT 1');
        } catch (tableError) {
            console.error('❌ Table owner_stripe_accounts non trouvée:', tableError);
            return res.status(500).json({ 
                error: 'Table de base de données manquante',
                details: 'La table owner_stripe_accounts doit être créée'
            });
        }

        // Vérifier si un compte existe déjà
        const existing = await client.query(
            'SELECT * FROM owner_stripe_accounts WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length > 0) {
            return res.json({
                success: true,
                account_id: existing.rows[0].stripe_account_id,
                onboarding_complete: existing.rows[0].onboarding_complete || false
            });
        }

        // Récupérer les infos utilisateur
        const userResult = await client.query(
            'SELECT email, first_name, last_name FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = userResult.rows[0];

        if (!user.email) {
            return res.status(400).json({ error: 'Email utilisateur requis pour créer un compte Stripe' });
        }

        // Créer le compte Stripe Connect Express
        let account;
        try {
            account = await stripe.accounts.create({
                type: 'express',
                country: 'CH',
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true }
                },
                business_type: 'individual',
                metadata: {
                    user_id: userId.toString(),
                    user_email: user.email
                }
            });
        } catch (stripeError) {
            console.error('❌ Erreur Stripe API:', stripeError);
            
            // Gérer les erreurs spécifiques Stripe
            let errorMessage = 'Erreur lors de la création du compte Stripe';
            let errorDetails = stripeError.message || 'Erreur inconnue avec l\'API Stripe';
            
            // Vérifier si c'est une erreur de Connect non activé
            if (stripeError.message && stripeError.message.includes('signed up for Connect')) {
                errorMessage = 'Stripe Connect non activé';
                errorDetails = 'Votre compte Stripe doit activer Stripe Connect pour créer des comptes. Veuillez activer Stripe Connect dans votre dashboard Stripe: https://dashboard.stripe.com/settings/connect';
            } else if (stripeError.type === 'StripeInvalidRequestError') {
                errorMessage = 'Erreur de configuration Stripe';
                errorDetails = stripeError.message || 'Vérifiez votre configuration Stripe dans le dashboard';
            }
            
            return res.status(500).json({ 
                error: errorMessage,
                details: errorDetails
            });
        }

        // Sauvegarder dans la DB
        try {
            // Vérifier si la colonne created_at existe
            const hasCreatedAt = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'owner_stripe_accounts' 
                AND column_name = 'created_at'
            `);
            
            if (hasCreatedAt.rows.length > 0) {
                await client.query(
                    `INSERT INTO owner_stripe_accounts 
                     (user_id, stripe_account_id, onboarding_complete, payouts_enabled, created_at) 
                     VALUES ($1, $2, FALSE, FALSE, CURRENT_TIMESTAMP)`,
                    [userId, account.id]
                );
            } else {
                await client.query(
                    `INSERT INTO owner_stripe_accounts 
                     (user_id, stripe_account_id, onboarding_complete, payouts_enabled) 
                     VALUES ($1, $2, FALSE, FALSE)`,
                    [userId, account.id]
                );
            }
        } catch (dbError) {
            console.error('❌ Erreur insertion DB:', dbError);
            // Essayer de supprimer le compte Stripe créé si l'insertion échoue
            try {
                await stripe.accounts.del(account.id);
            } catch (delError) {
                console.error('❌ Erreur suppression compte Stripe:', delError);
            }
            return res.status(500).json({ 
                error: 'Erreur lors de la sauvegarde du compte',
                details: dbError.message || 'Erreur base de données'
            });
        }

        res.json({
            success: true,
            account_id: account.id,
            onboarding_complete: false
        });

    } catch (error) {
        console.error('❌ Erreur création compte Stripe:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la création du compte',
            details: error.message || 'Erreur inconnue'
        });
    } finally {
        client.release();
    }
});

// Créer un lien d'onboarding
router.post('/connect/create-onboarding-link', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;

        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Seuls les propriétaires peuvent créer un lien d\'onboarding' });
        }

        // Vérifier que Stripe est configuré
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('❌ STRIPE_SECRET_KEY non configuré');
            return res.status(500).json({ error: 'Configuration Stripe manquante' });
        }

        const result = await client.query(
            'SELECT stripe_account_id FROM owner_stripe_accounts WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Aucun compte Stripe trouvé',
                requires_account_creation: true
            });
        }

        const accountId = result.rows[0].stripe_account_id;

        if (!accountId) {
            return res.status(400).json({ error: 'Compte Stripe invalide' });
        }

        // Créer le lien d'onboarding
        let accountLink;
        try {
            accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${process.env.FRONTEND_URL || 'https://hoomy.site'}/dashboard/owner?stripe=refresh`,
                return_url: `${process.env.FRONTEND_URL || 'https://hoomy.site'}/dashboard/owner?stripe=success`,
                type: 'account_onboarding'
            });
        } catch (stripeError) {
            console.error('❌ Erreur Stripe API (accountLinks):', stripeError);
            return res.status(500).json({ 
                error: 'Erreur lors de la création du lien d\'onboarding',
                details: stripeError.message || 'Erreur inconnue avec l\'API Stripe'
            });
        }

        if (!accountLink || !accountLink.url) {
            return res.status(500).json({ error: 'Lien d\'onboarding invalide' });
        }

        res.json({
            success: true,
            url: accountLink.url
        });

    } catch (error) {
        console.error('❌ Erreur création lien onboarding:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la création du lien d\'onboarding',
            details: error.message || 'Erreur inconnue'
        });
    } finally {
        client.release();
    }
});

// Vérifier le statut du compte
router.get('/connect/account-status', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;

        const result = await client.query(
            'SELECT * FROM owner_stripe_accounts WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ 
                success: true,
                has_account: false 
            });
        }

        const accountData = result.rows[0];
        const account = await stripe.accounts.retrieve(accountData.stripe_account_id);

        // Mettre à jour le statut
        const onboardingComplete = account.details_submitted;
        const payoutsEnabled = account.payouts_enabled;

        await client.query(
            `UPDATE owner_stripe_accounts 
             SET onboarding_complete = $1, payouts_enabled = $2, charges_enabled = $3 
             WHERE user_id = $4`,
            [onboardingComplete, payoutsEnabled, account.charges_enabled, userId]
        );

        res.json({
            success: true,
            has_account: true,
            onboarding_complete: onboardingComplete,
            payouts_enabled: payoutsEnabled,
            charges_enabled: account.charges_enabled
        });

    } catch (error) {
        console.error('Erreur vérification compte:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification' });
    } finally {
        client.release();
    }
});

// ========================================
// 📝 GESTION DES CONTRATS
// ========================================

// Créer un contrat
router.post('/create', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('📝 Création contrat - Données:', req.body);
        console.log('👤 Utilisateur:', { id: req.user.id, role: req.user.role });

        const { property_id, owner_id, student_id, conversation_id, monthly_rent, start_date, end_date, deposit_amount } = req.body;

        // Validation des champs obligatoires
        if (!property_id) {
            return res.status(400).json({ error: 'property_id est requis' });
        }
        if (!monthly_rent || monthly_rent <= 0) {
            return res.status(400).json({ error: 'monthly_rent doit être > 0' });
        }
        if (!start_date) {
            return res.status(400).json({ error: 'start_date est requis' });
        }
        if (!end_date) {
            return res.status(400).json({ error: 'end_date est requis' });
        }

        // Déterminer qui est l'étudiant et qui est le propriétaire
        let finalStudentId, finalOwnerId;
        
        if (req.user.role === 'student') {
            // L'étudiant crée le contrat
            finalStudentId = req.user.id;
            finalOwnerId = owner_id;
            
            if (!owner_id) {
                return res.status(400).json({ error: 'owner_id est requis' });
            }
        } else if (req.user.role === 'owner') {
            // Le propriétaire crée le contrat
            finalOwnerId = req.user.id;
            finalStudentId = student_id;
            
            if (!student_id) {
                return res.status(400).json({ error: 'student_id est requis' });
            }
        } else {
            return res.status(403).json({ error: 'Rôle non autorisé' });
        }

        console.log('🔍 Vérifications:', { finalStudentId, finalOwnerId, property_id });

        // Vérifier que la propriété existe et appartient au bon propriétaire
        const propertyCheck = await client.query(
            'SELECT owner_id, title FROM properties WHERE id = $1',
            [property_id]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Propriété non trouvée' });
        }

        if (propertyCheck.rows[0].owner_id !== finalOwnerId) {
            return res.status(403).json({ error: 'Cette propriété n\'appartient pas au propriétaire spécifié' });
        }

        // Vérifier que l'étudiant existe et a le bon rôle
        const studentCheck = await client.query(
            'SELECT role FROM users WHERE id = $1',
            [finalStudentId]
        );

        if (studentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Étudiant non trouvé' });
        }

        if (studentCheck.rows[0].role !== 'student') {
            return res.status(400).json({ error: 'L\'utilisateur doit être un étudiant' });
        }

        // Vérifier si un contrat actif existe déjà pour cette propriété
        const existingContract = await client.query(
            `SELECT id FROM rental_contracts 
             WHERE property_id = $1 
             AND status IN ('pending', 'active') 
             LIMIT 1`,
            [property_id]
        );

        if (existingContract.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Un contrat actif existe déjà pour cette propriété',
                existing_contract_id: existingContract.rows[0].id
            });
        }

        // Calculer les montants
        const rent = parseFloat(monthly_rent);
        const hoomy_commission = parseFloat((rent * 0.04).toFixed(2)); // 4%
        const owner_payout = parseFloat((rent - hoomy_commission).toFixed(2));

        console.log('💰 Montants:', { rent, hoomy_commission, owner_payout });

        // Créer le contrat (même si le propriétaire n'a pas encore configuré Stripe)
        const result = await client.query(
            `INSERT INTO rental_contracts 
             (property_id, student_id, owner_id, conversation_id, monthly_rent, 
              hoomy_commission, owner_payout, start_date, end_date, deposit_amount, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') 
             RETURNING *`,
            [property_id, finalStudentId, finalOwnerId, conversation_id || null, rent, 
             hoomy_commission, owner_payout, start_date, end_date, deposit_amount || 0]
        );

        // Mettre à jour le statut de la propriété
        await client.query(
            'UPDATE properties SET status = $1 WHERE id = $2',
            ['pending', property_id]
        );

        console.log('✅ Contrat créé avec succès - ID:', result.rows[0].id);

        res.status(201).json({
            success: true,
            message: 'Contrat créé avec succès',
            contract: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Erreur création contrat:', error);
        res.status(500).json({ 
            error: 'Erreur serveur',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Proposer un contrat (utilisé par le propriétaire depuis la messagerie)
router.post('/propose', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Seuls les propriétaires peuvent proposer un contrat' });
        }

        const { property_id, student_id, conversation_id, monthly_rent, charges, start_date, end_date, deposit_amount } = req.body;

        // Validation des champs obligatoires
        if (!property_id || !student_id) {
            return res.status(400).json({ error: 'property_id et student_id sont requis' });
        }
        if (!monthly_rent || monthly_rent <= 0) {
            return res.status(400).json({ error: 'monthly_rent doit être > 0' });
        }
        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'start_date et end_date sont requis' });
        }

        const ownerId = req.user.id;

        console.log('📝 Proposition contrat - Owner:', ownerId, 'Student:', student_id, 'Property:', property_id, 'Conversation:', conversation_id);

        // Vérifier que la propriété existe et appartient au propriétaire
        const propertyCheck = await client.query(
            'SELECT owner_id, title, price, charges FROM properties WHERE id = $1',
            [property_id]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Propriété non trouvée' });
        }

        if (propertyCheck.rows[0].owner_id !== ownerId) {
            return res.status(403).json({ error: 'Cette propriété ne vous appartient pas' });
        }

        // Vérifier que l'étudiant existe et a le bon rôle
        const studentCheck = await client.query(
            'SELECT id, role, first_name, last_name FROM users WHERE id = $1',
            [student_id]
        );

        if (studentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Étudiant non trouvé' });
        }

        if (studentCheck.rows[0].role !== 'student') {
            return res.status(400).json({ error: 'L\'utilisateur doit être un étudiant' });
        }

        console.log('✅ Étudiant vérifié:', studentCheck.rows[0].first_name, studentCheck.rows[0].last_name, '(ID:', student_id, ')');

        // Vérifier si un contrat existe déjà pour cette conversation
        if (conversation_id) {
            const existingContract = await client.query(
                `SELECT id FROM rental_contracts 
                 WHERE conversation_id = $1 
                 AND status IN ('pending', 'active') 
                 LIMIT 1`,
                [conversation_id]
            );

            if (existingContract.rows.length > 0) {
                return res.status(400).json({ 
                    error: 'Un contrat existe déjà pour cette conversation',
                    existing_contract_id: existingContract.rows[0].id
                });
            }
        }

        // Utiliser les charges de la propriété si non fournies
        const finalCharges = charges !== undefined ? parseFloat(charges) : (parseFloat(propertyCheck.rows[0].charges) || 0);
        const rent = parseFloat(monthly_rent);
        const hoomy_commission = parseFloat((rent * 0.04).toFixed(2)); // 4%
        const owner_payout = parseFloat((rent - hoomy_commission).toFixed(2));
        const finalDeposit = deposit_amount || (rent * 3); // 3 mois par défaut

        // Créer le contrat avec le statut 'pending'
        // Vérifier si la colonne charges existe avant de l'insérer
        const hasChargesColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rental_contracts' 
            AND column_name = 'charges'
        `);
        
        let insertQuery, insertValues;
        if (hasChargesColumn.rows.length > 0) {
            // La colonne existe, on l'utilise
            insertQuery = `INSERT INTO rental_contracts 
             (property_id, student_id, owner_id, conversation_id, monthly_rent, charges,
              hoomy_commission, owner_payout, start_date, end_date, deposit_amount, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending') 
             RETURNING *`;
            insertValues = [property_id, student_id, ownerId, conversation_id || null, rent, finalCharges,
             hoomy_commission, owner_payout, start_date, end_date, finalDeposit];
        } else {
            // La colonne n'existe pas, on ne l'insère pas
            insertQuery = `INSERT INTO rental_contracts 
             (property_id, student_id, owner_id, conversation_id, monthly_rent,
              hoomy_commission, owner_payout, start_date, end_date, deposit_amount, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') 
             RETURNING *`;
            insertValues = [property_id, student_id, ownerId, conversation_id || null, rent,
             hoomy_commission, owner_payout, start_date, end_date, finalDeposit];
        }
        
        const result = await client.query(insertQuery, insertValues);

        // Mettre à jour le statut de la propriété
        await client.query(
            'UPDATE properties SET status = $1 WHERE id = $2',
            ['pending', property_id]
        );

        console.log('✅ Contrat proposé avec succès - ID:', result.rows[0].id);

        res.status(201).json({
            success: true,
            message: 'Contrat proposé avec succès',
            contract: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Erreur proposition contrat:', error);
        res.status(500).json({ 
            error: 'Erreur serveur',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Obtenir un contrat par conversation_id
router.get('/by-conversation/:conversation_id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const conversationId = req.params.conversation_id;
        const userId = req.user.id;

        // Vérifier si la colonne charges existe
        const hasChargesColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rental_contracts' 
            AND column_name = 'charges'
        `);
        
        const chargesField = hasChargesColumn.rows.length > 0 ? 'rc.charges,' : '0 as charges,';
        
        const result = await client.query(
            `SELECT rc.id, rc.property_id, rc.owner_id, rc.student_id, rc.request_id, rc.conversation_id,
                    rc.monthly_rent, ${chargesField}
                    rc.hoomy_commission, rc.owner_payout, rc.start_date, rc.end_date, rc.deposit_amount,
                    rc.stripe_subscription_id, rc.stripe_customer_id, rc.stripe_price_id, rc.status,
                    rc.contract_signed_at, rc.owner_signature, rc.student_signature, 
                    rc.owner_signed_at, rc.student_signed_at,
                    rc.owner_stripe_account_id, rc.contract_document_url, rc.notes,
                    rc.created_at, rc.updated_at,
                    p.title as property_title, p.city_name, p.address,
                    (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
                    s.first_name as student_first_name, s.last_name as student_last_name, s.email as student_email,
                    o.first_name as owner_first_name, o.last_name as owner_last_name, o.email as owner_email,
                    (rc.status = 'pending' AND rc.owner_id = $2) as is_editable
             FROM rental_contracts rc
             JOIN properties p ON rc.property_id = p.id
             JOIN users s ON rc.student_id = s.id
             JOIN users o ON rc.owner_id = o.id
             WHERE rc.conversation_id = $1 AND (rc.student_id = $2 OR rc.owner_id = $2)
             ORDER BY rc.created_at DESC
             LIMIT 1`,
            [conversationId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Aucun contrat trouvé pour cette conversation' });
        }

        res.json({
            success: true,
            contract: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur récupération contrat par conversation:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// Accepter un contrat (utilisé par l'étudiant)
router.put('/:id/accept', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const contractId = req.params.id;
        const userId = req.user.id;
        const { signature } = req.body;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Seuls les étudiants peuvent accepter un contrat' });
        }

        // Valider la signature si fournie
        if (signature) {
            // Nettoyer la signature (retirer les espaces, retours à la ligne, etc.)
            const cleanedSignature = signature.trim().replace(/\s/g, '');
            
            // Pattern plus flexible pour accepter différents formats
            const base64Pattern = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\s]+$/;
            if (!base64Pattern.test(cleanedSignature)) {
                console.error('Invalid signature format. Received:', cleanedSignature.substring(0, 50));
                return res.status(400).json({ error: 'Format de signature invalide. Format attendu: data:image/png;base64,...' });
            }
            
            // Utiliser la signature nettoyée
            signature = cleanedSignature;
        }

        const contractCheck = await client.query(
            'SELECT * FROM rental_contracts WHERE id = $1 AND student_id = $2',
            [contractId, userId]
        );

        if (contractCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const contract = contractCheck.rows[0];

        if (contract.status !== 'pending') {
            return res.status(400).json({ error: 'Ce contrat ne peut pas être accepté (statut: ' + contract.status + ')' });
        }

        // Construire la requête de mise à jour avec la signature
        let updateQuery = `UPDATE rental_contracts 
             SET student_signature = $1,
                 student_signed_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP`;
        const updateValues = [signature || null];

        // Vérifier si le propriétaire a déjà signé
        const hasOwnerSignature = contract.owner_signature ? true : false;

        // Si les deux parties ont signé, activer le contrat
        if (signature && hasOwnerSignature) {
            updateQuery += `, status = 'active', contract_signed_at = COALESCE(contract_signed_at, CURRENT_TIMESTAMP)`;
        } else if (signature) {
            // L'étudiant signe mais le propriétaire n'a pas encore signé, le statut reste 'pending'
            // Mais on enregistre la signature de l'étudiant
        } else {
            // Pas de signature fournie, comportement legacy : activer directement
            updateQuery += `, status = 'active', contract_signed_at = COALESCE(contract_signed_at, CURRENT_TIMESTAMP)`;
        }

        updateQuery += ` WHERE id = $${updateValues.length + 1} RETURNING *`;
        updateValues.push(contractId);

        const result = await client.query(updateQuery, updateValues);
        const updatedContract = result.rows[0];

        // Si les deux parties ont maintenant signé, mettre à jour le statut de la propriété
        if (updatedContract.status === 'active' && updatedContract.student_signature && updatedContract.owner_signature) {
            await client.query(
                'UPDATE properties SET status = $1 WHERE id = $2',
                ['rented', contract.property_id]
            );
        }

        res.json({
            success: true,
            message: signature ? 'Contrat signé avec succès' : 'Contrat accepté avec succès',
            contract: updatedContract
        });

    } catch (error) {
        console.error('Erreur acceptation contrat:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// Refuser un contrat (utilisé par l'étudiant)
router.put('/:id/reject', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const contractId = req.params.id;
        const userId = req.user.id;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Seuls les étudiants peuvent refuser un contrat' });
        }

        const contractCheck = await client.query(
            'SELECT * FROM rental_contracts WHERE id = $1 AND student_id = $2',
            [contractId, userId]
        );

        if (contractCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const contract = contractCheck.rows[0];

        if (contract.status !== 'pending') {
            return res.status(400).json({ error: 'Ce contrat ne peut pas être refusé (statut: ' + contract.status + ')' });
        }

        // Mettre à jour le statut du contrat
        const result = await client.query(
            `UPDATE rental_contracts 
             SET status = 'cancelled', 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING *`,
            [contractId]
        );

        // Remettre la propriété en disponible
        await client.query(
            'UPDATE properties SET status = $1 WHERE id = $2',
            ['available', contract.property_id]
        );

        res.json({
            success: true,
            message: 'Contrat refusé',
            contract: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur refus contrat:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// Obtenir mes contrats
router.get('/my-contracts', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Vérifier si la colonne charges existe
        const hasChargesColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rental_contracts' 
            AND column_name = 'charges'
        `);
        
        const chargesField = hasChargesColumn.rows.length > 0 ? 'rc.charges,' : '0 as charges,';

        let query;
        if (userRole === 'student') {
            query = `
                SELECT rc.id, rc.property_id, rc.owner_id, rc.student_id, rc.request_id, rc.conversation_id,
                       rc.monthly_rent, ${chargesField}
                       rc.hoomy_commission, rc.owner_payout, rc.start_date, rc.end_date, rc.deposit_amount,
                       rc.stripe_subscription_id, rc.stripe_customer_id, rc.stripe_price_id, rc.status,
                       rc.contract_signed_at, rc.owner_signature, rc.student_signature,
                       rc.owner_signed_at, rc.student_signed_at,
                       rc.owner_stripe_account_id, rc.contract_document_url, rc.notes,
                       rc.created_at, rc.updated_at,
                       p.title as property_title,
                       p.city_name, p.address,
                       (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
                       u.first_name as owner_first_name,
                       u.last_name as owner_last_name,
                       u.email as owner_email,
                       FALSE as is_editable
                FROM rental_contracts rc
                JOIN properties p ON rc.property_id = p.id
                JOIN users u ON rc.owner_id = u.id
                WHERE rc.student_id = $1
                ORDER BY rc.created_at DESC
            `;
        } else {
            query = `
                SELECT rc.id, rc.property_id, rc.owner_id, rc.student_id, rc.request_id, rc.conversation_id,
                       rc.monthly_rent, ${chargesField}
                       rc.hoomy_commission, rc.owner_payout, rc.start_date, rc.end_date, rc.deposit_amount,
                       rc.stripe_subscription_id, rc.stripe_customer_id, rc.stripe_price_id, rc.status,
                       rc.contract_signed_at, rc.owner_signature, rc.student_signature,
                       rc.owner_signed_at, rc.student_signed_at,
                       rc.owner_stripe_account_id, rc.contract_document_url, rc.notes,
                       rc.created_at, rc.updated_at,
                       p.title as property_title,
                       p.city_name, p.address,
                       (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
                       u.first_name as student_first_name,
                       u.last_name as student_last_name,
                       u.email as student_email,
                       (rc.status = 'pending' AND rc.owner_id = $1) as is_editable
                FROM rental_contracts rc
                JOIN properties p ON rc.property_id = p.id
                JOIN users u ON rc.student_id = u.id
                WHERE rc.owner_id = $1
                ORDER BY rc.created_at DESC
            `;
        }

        const result = await client.query(query, [userId]);

        console.log(`📋 Récupération contrats pour ${userRole} (ID: ${userId}): ${result.rows.length} contrat(s) trouvé(s)`);
        if (result.rows.length > 0) {
            console.log('📋 Contrats:', result.rows.map(c => ({ id: c.id, status: c.status, student_id: c.student_id, owner_id: c.owner_id })));
        }

        res.json({
            success: true,
            contracts: result.rows
        });

    } catch (error) {
        console.error('Erreur récupération contrats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// Télécharger le PDF du contrat (DOIT être avant /:id pour éviter les conflits de route)
router.get('/:id/pdf', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const contractId = req.params.id;
        const userId = req.user.id;

        // Vérifier si la colonne charges existe
        const hasChargesColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rental_contracts' 
            AND column_name = 'charges'
        `);
        
        const chargesField = hasChargesColumn.rows.length > 0 ? 'rc.charges,' : '0 as charges,';

        const result = await client.query(
            `SELECT rc.id, rc.property_id, rc.owner_id, rc.student_id, rc.request_id, rc.conversation_id,
                    rc.monthly_rent, ${chargesField}
                    rc.hoomy_commission, rc.owner_payout, rc.start_date, rc.end_date, rc.deposit_amount,
                    rc.stripe_subscription_id, rc.stripe_customer_id, rc.stripe_price_id, rc.status,
                    rc.contract_signed_at, rc.owner_signature, rc.student_signature,
                    rc.owner_signed_at, rc.student_signed_at,
                    rc.owner_stripe_account_id, rc.contract_document_url, rc.notes,
                    rc.created_at, rc.updated_at,
                    p.title as property_title, p.city_name, p.address,
                    s.first_name as student_first_name, s.last_name as student_last_name, s.email as student_email,
                    o.first_name as owner_first_name, o.last_name as owner_last_name, o.email as owner_email
             FROM rental_contracts rc
             JOIN properties p ON rc.property_id = p.id
             JOIN users s ON rc.student_id = s.id
             JOIN users o ON rc.owner_id = o.id
             WHERE rc.id = $1 AND (rc.student_id = $2 OR rc.owner_id = $2)`,
            [contractId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const contract = result.rows[0];

        // Fonction de formatage pour les montants CHF (format suisse avec virgule)
        const formatCHF = (amount) => {
            const num = parseFloat(amount || 0);
            if (isNaN(num)) return '0,00';
            
            // Format suisse : 1'150,00 ou 1150,00 (virgule pour décimales)
            // Utiliser un espace comme séparateur de milliers pour éviter les problèmes d'affichage
            const parts = num.toFixed(2).split('.');
            const integerPart = parts[0];
            const decimalPart = parts[1];
            
            // Ajouter des espaces comme séparateurs de milliers (uniquement si >= 1000)
            let formattedInteger = integerPart;
            if (parseInt(integerPart) >= 1000) {
                // Utiliser un espace insécable ou un espace normal
                formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            }
            
            return `${formattedInteger},${decimalPart}`;
        };

        // Préparer les données pour le PDF
        const startDate = new Date(contract.start_date);
        const endDate = new Date(contract.end_date);
        const durationMonths = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        const monthlyRent = parseFloat(contract.monthly_rent || 0);
        const charges = parseFloat(contract.charges || 0);
        const depositAmount = parseFloat(contract.deposit_amount || 0);
        const totalMonthly = monthlyRent + charges;

        // Créer le PDF
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            info: {
                Title: `Contrat de Location #${contract.id}`,
                Author: 'Hoomy',
                Subject: 'Contrat de location étudiant',
                Creator: 'Hoomy Platform'
            }
        });

        // Buffer pour stocker le PDF
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        // Couleurs
        const primaryColor = '#1E3A5F';
        const textColor = '#202124';
        const lightGray = '#5f6368';
        const borderColor = '#dadce0';

        // En-tête
        doc.fillColor(primaryColor)
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('CONTRAT DE LOCATION', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(14)
           .font('Helvetica')
           .text('Logement Étudiant', { align: 'center' });
        
        doc.moveDown(2);

        // Article 1 - Parties du contrat
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 1 – Parties du contrat', { width: 500 });
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica')
           .text('Le présent contrat est conclu entre :');
        
        doc.moveDown(1);

        // LE BAILLEUR
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('LE BAILLEUR (Propriétaire)');
        
        doc.moveDown(0.3);
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(10)
           .font('Helvetica')
           .text('Nom et prénom / Raison sociale');
        
        doc.moveDown(0.2);
        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica')
           .text(`${contract.owner_first_name || ''} ${contract.owner_last_name || ''}`.trim() || 'Non spécifié');
        
        doc.moveDown(0.8);
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(10)
           .text('Téléphone / Email');
        
        doc.moveDown(0.2);
        doc.fillColor(textColor)
           .fontSize(11)
           .text(contract.owner_email || 'Non spécifié');
        
        doc.moveDown(1.5);

        // LE LOCATAIRE
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('LE LOCATAIRE (Étudiant)');
        
        doc.moveDown(0.3);
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(10)
           .text('Nom et prénom');
        
        doc.moveDown(0.2);
        doc.fillColor(textColor)
           .fontSize(11)
           .text(`${contract.student_first_name || ''} ${contract.student_last_name || ''}`.trim() || 'Non spécifié');
        
        doc.moveDown(0.8);
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(10)
           .text('Téléphone / Email');
        
        doc.moveDown(0.2);
        doc.fillColor(textColor)
           .fontSize(11)
           .text(contract.student_email || 'Non spécifié');
        
        doc.moveDown(2);

        // Article 2 - Désignation du logement
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 2 – Désignation du logement', { width: 500 });
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(10)
           .text('Adresse complète du logement loué');
        
        doc.moveDown(0.2);
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .text(`${contract.address || 'Non spécifiée'}, ${contract.city_name || ''}`.trim());
        
        doc.moveDown(1);
        doc.fillColor(lightGray)
           .fontSize(10)
           .text('Type de logement (studio, T1, chambre, etc.)');
        
        doc.moveDown(0.2);
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .text(contract.property_title || 'Non spécifié');
        
        doc.moveDown(2);

        // Article 3 - Durée du contrat
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 3 – Durée du contrat', { width: 500 });
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .text('Le présent bail est conclu pour une durée déterminée selon les modalités suivantes :');
        
        doc.moveDown(1);
        
        // Tableau pour les dates - version ultra simple
        doc.moveDown(0.5);
        
        // En-têtes
        doc.fillColor(lightGray)
           .fontSize(10)
           .text('Durée: ', { continued: true });
        doc.text('Du: ', { continued: true });
        doc.text('Au:');
        
        // Valeurs
        doc.moveDown(0.3);
        doc.fillColor(textColor)
           .fontSize(11)
           .text(`${durationMonths} mois`, { continued: true });
        doc.text(startDate.toLocaleDateString('fr-CH'), { continued: true });
        doc.text(endDate.toLocaleDateString('fr-CH'));
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(10)
           .font('Helvetica-Oblique')
           .text('Le contrat est renouvelable selon accord écrit des deux parties.');
        
        doc.moveDown(2);

        // Article 4 - Loyer et charges
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 4 – Loyer et charges', { width: 500 });
        
        doc.moveDown(1);
        
        // Tableau financier - version ultra simple avec flux normal uniquement
        doc.moveDown(0.5);
        
        // Loyer mensuel
        doc.fillColor(textColor)
           .fontSize(11)
           .text('Loyer mensuel (hors charges): ', { continued: true });
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text(`${formatCHF(monthlyRent)} CHF`);
        
        doc.moveDown(0.5);
        
        // Charges
        doc.fillColor(textColor)
           .font('Helvetica')
           .fontSize(11)
           .text('Charges mensuelles: ', { continued: true });
        doc.fillColor(textColor)
           .text(`${formatCHF(charges)} CHF`);
        
        doc.moveDown(0.5);
        
        // Total
        doc.fillColor(primaryColor)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('TOTAL MENSUEL (charges comprises): ', { continued: true });
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text(`${formatCHF(totalMonthly)} CHF`);
        
        doc.moveDown(1);
        doc.fillColor(textColor)
           .fontSize(11)
           .text('Date de paiement : Le 1er de chaque mois');
        
        doc.moveDown(2);

        // Article 5 - Dépôt de garantie
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 5 – Dépôt de garantie', { width: 500 });
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica')
           .text(`Un dépôt de garantie d'un montant de `, { continued: true });
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text(`${formatCHF(depositAmount)} CHF`, { continued: true });
        doc.fillColor(textColor)
           .font('Helvetica')
           .text(' est versé à la signature du présent bail.');
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(10)
           .font('Helvetica-Oblique')
           .text('Ce montant sera restitué dans un délai de 30 jours suivant la remise des clés, déduction faite des éventuelles sommes dues.');
        
        doc.moveDown(2);

        // Article 6 - Obligations du locataire
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 6 – Obligations du locataire', { width: 500 });
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .text('Le locataire s\'engage à :');
        
        const obligations = [
            'Utiliser paisiblement les lieux conformément à leur destination',
            'Payer le loyer et les charges aux dates convenues',
            'Assurer l\'entretien courant du logement et des équipements',
            'Respecter le règlement intérieur de l\'immeuble le cas échéant',
            'Souscrire une assurance responsabilité civile locative'
        ];
        
        obligations.forEach(obligation => {
            doc.moveDown(0.4);
            doc.fillColor(textColor)
               .fontSize(11)
               .text(`• ${obligation}`, { indent: 20 });
        });
        
        doc.moveDown(2);

        // Article 7 - Obligations du bailleur
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 7 – Obligations du bailleur', { width: 500 });
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .text('Le bailleur s\'engage à :');
        
        const obligationsBailleur = [
            'Fournir un logement décent et en bon état d\'usage',
            'Assurer au locataire une jouissance paisible du logement',
            'Effectuer les réparations nécessaires autres que locatives',
            'Remettre les quittances de loyer sur demande'
        ];
        
        obligationsBailleur.forEach(obligation => {
            doc.moveDown(0.4);
            doc.fillColor(textColor)
               .fontSize(11)
               .text(`• ${obligation}`, { indent: 20 });
        });
        
        doc.moveDown(2);

        // Article 8 - État des lieux
        doc.moveDown(2);
        
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 8 – État des lieux', { width: 500 });
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .text('Un état des lieux contradictoire et détaillé sera établi à l\'entrée et à la sortie du locataire. Ces documents, annexés au présent contrat, seront signés par les deux parties.');
        
        doc.moveDown(2);

        // Article 9 - Résiliation
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 9 – Résiliation', { width: 500 });
        
        doc.moveDown(0.5);
        doc.fillColor(textColor)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Conditions de résiliation :');
        
        const resiliation = [
            'Le locataire peut résilier le bail avec un préavis d\'un (1) mois',
            'Le bailleur peut résilier dans les conditions prévues par la loi suisse',
            'Tout préavis doit être notifié par écrit (lettre recommandée ou remise en main propre)'
        ];
        
        resiliation.forEach(item => {
            doc.moveDown(0.4);
            doc.fillColor(textColor)
               .fontSize(11)
               .text(`• ${item}`, { indent: 20 });
        });
        
        doc.moveDown(2);

        // Article 10 - Signatures
        doc.fillColor(primaryColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Article 10 – Signatures', { width: 500 });
        
        doc.moveDown(2);
        
        // Tableau signatures - version simplifiée
        doc.fillColor(textColor)
           .fontSize(11)
           .text('Fait à : _______________________', { width: 250, continued: true });
        doc.text('Le : ' + new Date().toLocaleDateString('fr-CH'), { width: 250 });
        
        doc.moveDown(1);
        doc.fillColor(lightGray)
           .fontSize(10)
           .font('Helvetica-Oblique')
           .text('En deux exemplaires originaux, dont un pour chaque partie.');
        
        doc.moveDown(3);
        
        // Signatures - version ultra simple avec flux normal uniquement
        // Colonne gauche - Bailleur
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('LE BAILLEUR');
        
        doc.moveDown(0.3);
        doc.fillColor(lightGray)
           .fontSize(9)
           .font('Helvetica-Oblique')
           .text('(Signature précédée de la mention « Lu et approuvé »)');
        
        doc.moveDown(1);
        // Ligne de signature
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(250, doc.y)
           .stroke();
        
        doc.moveDown(2);
        
        // Colonne droite - Locataire
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('LE LOCATAIRE');
        
        doc.moveDown(0.3);
        doc.fillColor(lightGray)
           .fontSize(9)
           .font('Helvetica-Oblique')
           .text('(Signature précédée de la mention « Lu et approuvé »)');
        
        doc.moveDown(1);
        // Ligne de signature
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(250, doc.y)
           .stroke();
        
        doc.moveDown(2);
        
        // Footer
        doc.fillColor(lightGray)
           .fontSize(9)
           .font('Helvetica-Oblique')
           .text('Ce contrat est établi conformément aux dispositions du Code des obligations suisse relatives au bail à loyer.', { align: 'center' });
        
        doc.moveDown(1);
        doc.fillColor(lightGray)
           .fontSize(9)
           .text('Hoomy - Entreprise individuelle | www.hoomy.site | contact@hoomy.site', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fillColor(lightGray)
           .fontSize(8)
           .text(`Contrat ID: ${contract.id} | Généré le ${new Date().toLocaleDateString('fr-CH')} à ${new Date().toLocaleTimeString('fr-CH')}`, { align: 'center' });

        // Finaliser le PDF et envoyer la réponse
        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                try {
                    const pdfBuffer = Buffer.concat(chunks);
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `inline; filename="contract-${contractId}.pdf"`);
                    res.send(pdfBuffer);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
            
            doc.on('error', (err) => {
                reject(err);
            });
            
            // Finaliser le PDF
            doc.end();
        });

    } catch (error) {
        console.error('❌ Erreur génération PDF contrat:', error);
        console.error('Stack:', error.stack);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Erreur serveur lors de la génération du PDF',
                details: error.message 
            });
        }
    } finally {
        if (client) client.release();
    }
});

// Obtenir un contrat par ID
router.get('/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const contractId = req.params.id;
        const userId = req.user.id;

        // Vérifier si la colonne charges existe
        const hasChargesColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rental_contracts' 
            AND column_name = 'charges'
        `);
        
        const chargesField = hasChargesColumn.rows.length > 0 ? 'rc.charges,' : '0 as charges,';

        const result = await client.query(
            `SELECT rc.id, rc.property_id, rc.owner_id, rc.student_id, rc.request_id, rc.conversation_id,
                    rc.monthly_rent, ${chargesField}
                    rc.hoomy_commission, rc.owner_payout, rc.start_date, rc.end_date, rc.deposit_amount,
                    rc.stripe_subscription_id, rc.stripe_customer_id, rc.stripe_price_id, rc.status,
                    rc.contract_signed_at, rc.owner_signature, rc.student_signature,
                    rc.owner_signed_at, rc.student_signed_at,
                    rc.owner_stripe_account_id, rc.contract_document_url, rc.notes,
                    rc.created_at, rc.updated_at,
                    p.title as property_title, p.city_name, p.address,
                    (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
                    s.first_name as student_first_name, s.last_name as student_last_name, s.email as student_email,
                    o.first_name as owner_first_name, o.last_name as owner_last_name, o.email as owner_email,
                    (rc.status = 'pending' AND rc.owner_id = $2) as is_editable
             FROM rental_contracts rc
             JOIN properties p ON rc.property_id = p.id
             JOIN users s ON rc.student_id = s.id
             JOIN users o ON rc.owner_id = o.id
             WHERE rc.id = $1 AND (rc.student_id = $2 OR rc.owner_id = $2)`,
            [contractId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        res.json({
            success: true,
            contract: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur récupération contrat:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// Mettre à jour un contrat (monthly_rent, charges, deposit_amount, dates, etc.)
router.put('/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const contractId = req.params.id;
        const userId = req.user.id;
        const { monthly_rent, charges, deposit_amount, start_date, end_date } = req.body;

        // Vérifier que le contrat existe et que l'utilisateur y a accès
        const contractCheck = await client.query(
            'SELECT owner_id, student_id, status FROM rental_contracts WHERE id = $1',
            [contractId]
        );

        if (contractCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const contract = contractCheck.rows[0];

        // Seul le propriétaire peut modifier le contrat (sauf admin)
        if (contract.owner_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Seul le propriétaire peut modifier le contrat' });
        }

        // Vérifier si le contrat peut être modifié (seulement si pending ou si is_editable)
        if (contract.status !== 'pending') {
            return res.status(400).json({ error: 'Seuls les contrats en attente peuvent être modifiés' });
        }

        // Construire la requête de mise à jour dynamiquement
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (monthly_rent !== undefined) {
            updates.push(`monthly_rent = $${paramIndex++}`);
            values.push(parseFloat(monthly_rent));
            
            // Recalculer hoomy_commission et owner_payout si le loyer change
            const rent = parseFloat(monthly_rent);
            const hoomy_commission = parseFloat((rent * 0.04).toFixed(2)); // 4%
            const owner_payout = parseFloat((rent - hoomy_commission).toFixed(2));
            updates.push(`hoomy_commission = $${paramIndex++}`);
            values.push(hoomy_commission);
            updates.push(`owner_payout = $${paramIndex++}`);
            values.push(owner_payout);
        }

        // Vérifier si la colonne charges existe
        const hasChargesColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rental_contracts' 
            AND column_name = 'charges'
        `);
        
        if (charges !== undefined && hasChargesColumn.rows.length > 0) {
            updates.push(`charges = $${paramIndex++}`);
            values.push(parseFloat(charges) || 0);
        }

        if (deposit_amount !== undefined) {
            updates.push(`deposit_amount = $${paramIndex++}`);
            values.push(parseFloat(deposit_amount) || 0);
        }

        if (start_date !== undefined) {
            updates.push(`start_date = $${paramIndex++}`);
            values.push(start_date);
        }

        if (end_date !== undefined) {
            updates.push(`end_date = $${paramIndex++}`);
            values.push(end_date);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(contractId);

        const result = await client.query(
            `UPDATE rental_contracts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        res.json({
            success: true,
            message: 'Contrat mis à jour avec succès',
            contract: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur mise à jour contrat:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    } finally {
        client.release();
    }
});

// Mettre à jour le statut d'un contrat
router.put('/:id/status', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const contractId = req.params.id;
        const { status, signature } = req.body;
        const userId = req.user.id;

        const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Statut invalide', validStatuses });
        }

        // Valider la signature si fournie
        if (signature) {
            // Nettoyer la signature (retirer les espaces, retours à la ligne, etc.)
            const cleanedSignature = signature.trim().replace(/\s/g, '');
            
            // Pattern plus flexible pour accepter différents formats
            const base64Pattern = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\s]+$/;
            if (!base64Pattern.test(cleanedSignature)) {
                console.error('Invalid signature format. Received:', cleanedSignature.substring(0, 50));
                return res.status(400).json({ error: 'Format de signature invalide. Format attendu: data:image/png;base64,...' });
            }
            
            // Utiliser la signature nettoyée
            signature = cleanedSignature;
        }

        const contractCheck = await client.query(
            'SELECT * FROM rental_contracts WHERE id = $1',
            [contractId]
        );

        if (contractCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const contract = contractCheck.rows[0];
        const { owner_id, property_id } = contract;

        if (owner_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Seul le propriétaire peut modifier le statut' });
        }

        // Construire la requête de mise à jour
        let updateQuery = 'UPDATE rental_contracts SET updated_at = CURRENT_TIMESTAMP';
        const updateValues = [];

        // Ajouter la signature du propriétaire si fournie
        if (signature) {
            updateQuery += ', owner_signature = $' + (updateValues.length + 1) + ', owner_signed_at = CURRENT_TIMESTAMP';
            updateValues.push(signature);
        }

        // Gérer le statut
        if (status) {
            updateQuery += ', status = $' + (updateValues.length + 1);
            updateValues.push(status);

            // Si on passe à 'active' et que les deux parties ont signé
            if (status === 'active') {
                const hasStudentSignature = contract.student_signature ? true : false;
                const hasOwnerSignature = signature ? true : (contract.owner_signature ? true : false);

                if (hasStudentSignature && hasOwnerSignature) {
                    updateQuery += ', contract_signed_at = COALESCE(contract_signed_at, CURRENT_TIMESTAMP)';
                }
            }
        }

        updateQuery += ' WHERE id = $' + (updateValues.length + 1) + ' RETURNING *';
        updateValues.push(contractId);

        const result = await client.query(updateQuery, updateValues);
        const updatedContract = result.rows[0];

        // Mettre à jour le statut de la propriété
        const finalStatus = status || updatedContract.status;
        let propertyStatus = 'available';
        if (finalStatus === 'active') propertyStatus = 'rented';
        else if (finalStatus === 'pending') propertyStatus = 'pending';

        await client.query(
            'UPDATE properties SET status = $1 WHERE id = $2',
            [propertyStatus, property_id]
        );

        res.json({
            success: true,
            contract: updatedContract
        });

    } catch (error) {
        console.error('Erreur mise à jour statut:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// ========================================
// 💳 GESTION DES PAIEMENTS
// ========================================

// Créer une subscription Stripe
router.post('/create-subscription', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { contract_id } = req.body;
        const studentId = req.user.id;

        // Récupérer le contrat
        const contractResult = await client.query(
            'SELECT * FROM rental_contracts WHERE id = $1 AND student_id = $2',
            [contract_id, studentId]
        );

        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const contract = contractResult.rows[0];

        // Récupérer le compte Stripe du propriétaire
        const ownerAccountResult = await client.query(
            'SELECT stripe_account_id FROM owner_stripe_accounts WHERE user_id = $1 AND onboarding_complete = TRUE',
            [contract.owner_id]
        );

        if (ownerAccountResult.rows.length === 0) {
            return res.json({ 
                success: true,
                requires_owner_setup: true,
                error: 'Le propriétaire doit d\'abord configurer son compte de paiement Stripe'
            });
        }

        const ownerStripeAccountId = ownerAccountResult.rows[0].stripe_account_id;

        // Créer ou récupérer le customer
        let customerId = contract.stripe_customer_id;
        
        if (!customerId) {
            const userResult = await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [studentId]);
            const user = userResult.rows[0];

            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                metadata: {
                    user_id: studentId.toString(),
                    contract_id: contract_id.toString()
                }
            });
            customerId = customer.id;

            await client.query(
                'UPDATE rental_contracts SET stripe_customer_id = $1 WHERE id = $2',
                [customerId, contract_id]
            );
        }

        // Créer un Price pour la subscription
        const price = await stripe.prices.create({
            unit_amount: Math.round(parseFloat(contract.monthly_rent) * 100),
            currency: 'chf',
            recurring: { interval: 'month' },
            product_data: {
                name: `Loyer mensuel - Contrat #${contract_id}`,
                metadata: {
                    contract_id: contract_id.toString()
                }
            }
        });

        // Créer une Session Checkout
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price.id,
                    quantity: 1
                }
            ],
            subscription_data: {
                application_fee_percent: 4,
                transfer_data: {
                    destination: ownerStripeAccountId
                },
                metadata: {
                    contract_id: contract_id.toString()
                }
            },
            success_url: `${process.env.FRONTEND_URL || 'https://hoomy.site'}/contracts/${contract_id}?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL || 'https://hoomy.site'}/contracts/${contract_id}?payment=cancelled`
        });

        // Mettre à jour le contrat
        await client.query(
            'UPDATE rental_contracts SET stripe_price_id = $1 WHERE id = $2',
            [price.id, contract_id]
        );

        res.json({
            success: true,
            checkout_url: session.url,
            session_id: session.id
        });

    } catch (error) {
        console.error('Erreur création subscription:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Annuler une subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { contract_id } = req.body;
        const userId = req.user.id;

        const result = await client.query(
            'SELECT * FROM rental_contracts WHERE id = $1 AND (student_id = $2 OR owner_id = $2)',
            [contract_id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const contract = result.rows[0];

        if (!contract.stripe_subscription_id) {
            return res.status(400).json({ error: 'Aucune subscription active' });
        }

        await stripe.subscriptions.cancel(contract.stripe_subscription_id);

        await client.query(
            'UPDATE rental_contracts SET status = $1 WHERE id = $2',
            ['cancelled', contract_id]
        );

        res.json({
            success: true,
            message: 'Subscription annulée avec succès'
        });

    } catch (error) {
        console.error('Erreur annulation subscription:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Historique des paiements pour un contrat
router.get('/payments/:contract_id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { contract_id } = req.params;
        const userId = req.user.id;

        const contractCheck = await client.query(
            'SELECT * FROM rental_contracts WHERE id = $1 AND (student_id = $2 OR owner_id = $2)',
            [contract_id, userId]
        );

        if (contractCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const result = await client.query(
            `SELECT * FROM payment_transactions 
             WHERE contract_id = $1 
             ORDER BY created_at DESC`,
            [contract_id]
        );

        res.json({
            success: true,
            payments: result.rows
        });

    } catch (error) {
        console.error('Erreur récupération paiements:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// Créer un paiement unique (dépôt, etc.)
router.post('/pay-deposit', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { contract_id } = req.body;
        const studentId = req.user.id;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Seuls les étudiants peuvent payer le dépôt' });
        }

        // Récupérer le contrat
        const contractResult = await client.query(
            'SELECT * FROM rental_contracts WHERE id = $1 AND student_id = $2',
            [contract_id, studentId]
        );

        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const contract = contractResult.rows[0];

        if (!contract.deposit_amount || contract.deposit_amount <= 0) {
            return res.status(400).json({ error: 'Aucun dépôt requis pour ce contrat' });
        }

        // Vérifier si le dépôt a déjà été payé
        const existingPayment = await client.query(
            `SELECT * FROM payment_transactions 
             WHERE contract_id = $1 AND payment_type = 'deposit' AND payment_status = 'succeeded'`,
            [contract_id]
        );

        if (existingPayment.rows.length > 0) {
            return res.status(400).json({ error: 'Le dépôt a déjà été payé' });
        }

        // Récupérer le compte Stripe du propriétaire
        const ownerAccountResult = await client.query(
            'SELECT stripe_account_id FROM owner_stripe_accounts WHERE user_id = $1 AND onboarding_complete = TRUE',
            [contract.owner_id]
        );

        if (ownerAccountResult.rows.length === 0) {
            return res.json({ 
                success: true,
                requires_owner_setup: true,
                error: 'Le propriétaire doit d\'abord configurer son compte de paiement Stripe'
            });
        }

        const ownerStripeAccountId = ownerAccountResult.rows[0].stripe_account_id;

        // Créer ou récupérer le customer
        let customerId = contract.stripe_customer_id;
        
        if (!customerId) {
            const userResult = await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [studentId]);
            const user = userResult.rows[0];

            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                metadata: {
                    user_id: studentId.toString(),
                    contract_id: contract_id.toString()
                }
            });
            customerId = customer.id;

            await client.query(
                'UPDATE rental_contracts SET stripe_customer_id = $1 WHERE id = $2',
                [customerId, contract_id]
            );
        }

        // Créer une Session Checkout pour le paiement unique
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'chf',
                        product_data: {
                            name: `Dépôt de garantie - Contrat #${contract_id}`,
                            description: 'Dépôt de garantie pour la location'
                        },
                        unit_amount: Math.round(parseFloat(contract.deposit_amount) * 100)
                    },
                    quantity: 1
                }
            ],
            payment_intent_data: {
                application_fee_amount: Math.round(parseFloat(contract.deposit_amount) * 100 * 0.04), // 4% de commission
                transfer_data: {
                    destination: ownerStripeAccountId
                },
                metadata: {
                    contract_id: contract_id.toString(),
                    payment_type: 'deposit'
                }
            },
            success_url: `${process.env.FRONTEND_URL || 'https://hoomy.site'}/contracts/${contract_id}?payment=success&type=deposit`,
            cancel_url: `${process.env.FRONTEND_URL || 'https://hoomy.site'}/contracts/${contract_id}?payment=cancelled`
        });

        res.json({
            success: true,
            checkout_url: session.url,
            session_id: session.id
        });

    } catch (error) {
        console.error('Erreur création paiement dépôt:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
