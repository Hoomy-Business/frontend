// routes/contracts.js
// ========================================
// 📝 GESTION DES CONTRATS DE LOCATION
// ========================================
require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Utiliser le pool partagé depuis db.js
const { pool } = require('../db');

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

        // Vérifier si un compte existe déjà
        const existing = await client.query(
            'SELECT * FROM owner_stripe_accounts WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length > 0) {
            return res.json({
                success: true,
                account_id: existing.rows[0].stripe_account_id,
                onboarding_complete: existing.rows[0].onboarding_complete
            });
        }

        // Récupérer les infos utilisateur
        const userResult = await client.query(
            'SELECT email, first_name, last_name FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        // Créer le compte Stripe Connect Express
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'CH',
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }
            },
            business_type: 'individual'
        });

        // Sauvegarder dans la DB
        await client.query(
            `INSERT INTO owner_stripe_accounts 
             (user_id, stripe_account_id, onboarding_complete, payouts_enabled) 
             VALUES ($1, $2, FALSE, FALSE)`,
            [userId, account.id]
        );

        res.json({
            success: true,
            account_id: account.id,
            onboarding_complete: false
        });

    } catch (error) {
        console.error('Erreur création compte Stripe:', error);
        res.status(500).json({ error: 'Erreur lors de la création du compte' });
    } finally {
        client.release();
    }
});

// Créer un lien d'onboarding
router.post('/connect/create-onboarding-link', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;

        const result = await client.query(
            'SELECT stripe_account_id FROM owner_stripe_accounts WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Compte Stripe non trouvé' });
        }

        const accountId = result.rows[0].stripe_account_id;

        // Créer le lien d'onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.FRONTEND_URL || 'https://tunnel.hoomy.site'}/settings`,
            return_url: `${process.env.FRONTEND_URL || 'https://tunnel.hoomy.site'}/settings?stripe_onboarding=success`,
            type: 'account_onboarding'
        });

        res.json({
            success: true,
            url: accountLink.url
        });

    } catch (error) {
        console.error('Erreur création lien onboarding:', error);
        res.status(500).json({ error: 'Erreur lors de la création du lien' });
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
        const hoomy_commission = parseFloat((rent * 0.02).toFixed(2)); // 2%
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

// Obtenir mes contrats
router.get('/my-contracts', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query;
        if (userRole === 'student') {
            query = `
                SELECT rc.*, 
                       p.title as property_title,
                       p.city_name,
                       (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
                       u.first_name as owner_first_name,
                       u.last_name as owner_last_name,
                       u.email as owner_email
                FROM rental_contracts rc
                JOIN properties p ON rc.property_id = p.id
                JOIN users u ON rc.owner_id = u.id
                WHERE rc.student_id = $1
                ORDER BY rc.created_at DESC
            `;
        } else {
            query = `
                SELECT rc.*, 
                       p.title as property_title,
                       p.city_name,
                       (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
                       u.first_name as student_first_name,
                       u.last_name as student_last_name,
                       u.email as student_email
                FROM rental_contracts rc
                JOIN properties p ON rc.property_id = p.id
                JOIN users u ON rc.student_id = u.id
                WHERE rc.owner_id = $1
                ORDER BY rc.created_at DESC
            `;
        }

        const result = await client.query(query, [userId]);

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

// Obtenir un contrat par ID
router.get('/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const contractId = req.params.id;
        const userId = req.user.id;

        const result = await client.query(
            `SELECT rc.*, 
                    p.title as property_title, p.city_name, 
                    (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
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

// Mettre à jour le statut d'un contrat
router.put('/:id/status', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const contractId = req.params.id;
        const { status } = req.body;
        const userId = req.user.id;

        const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Statut invalide', validStatuses });
        }

        const contractCheck = await client.query(
            'SELECT owner_id, property_id FROM rental_contracts WHERE id = $1',
            [contractId]
        );

        if (contractCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        const { owner_id, property_id } = contractCheck.rows[0];

        if (owner_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Seul le propriétaire peut modifier le statut' });
        }

        const result = await client.query(
            'UPDATE rental_contracts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, contractId]
        );

        // Mettre à jour le statut de la propriété
        let propertyStatus = 'available';
        if (status === 'active') propertyStatus = 'rented';
        else if (status === 'pending') propertyStatus = 'pending';

        await client.query(
            'UPDATE properties SET status = $1 WHERE id = $2',
            [propertyStatus, property_id]
        );

        res.json({
            success: true,
            contract: result.rows[0]
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
            return res.status(400).json({ 
                error: 'Le propriétaire doit d\'abord configurer son compte de paiement Stripe',
                requires_owner_setup: true
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
                application_fee_percent: 2,
                transfer_data: {
                    destination: ownerStripeAccountId
                },
                metadata: {
                    contract_id: contract_id.toString()
                }
            },
            success_url: `${process.env.FRONTEND_URL || 'https://tunnel.hoomy.site'}/dashboard?payment=success&contract_id=${contract_id}`,
            cancel_url: `${process.env.FRONTEND_URL || 'https://tunnel.hoomy.site'}/dashboard?payment=cancelled`
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

module.exports = router;
