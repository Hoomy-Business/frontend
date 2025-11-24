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

// =========================================
// ROUTE: Créer un Payment Intent
// =========================================
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Seuls les propriétaires peuvent effectuer des paiements' });
        }

        const { property_id, amount, description } = req.body;

        if (!property_id || !amount) {
            return res.status(400).json({ error: 'property_id et amount requis' });
        }

        // Vérifier que la propriété appartient bien au propriétaire
        const propertyCheck = await client.query(
            'SELECT id, owner_id, title FROM properties WHERE id = $1',
            [property_id]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Propriété non trouvée' });
        }

        if (propertyCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Vous n\'êtes pas propriétaire de cette propriété' });
        }

        // Créer le Payment Intent avec Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convertir en centimes
            currency: 'chf',
            metadata: {
                property_id: property_id,
                owner_id: req.user.id,
                description: description || `Commission pour ${propertyCheck.rows[0].title}`
            }
        });

        // Enregistrer dans platform_fees
        await client.query(`
            INSERT INTO platform_fees (
                property_id, 
                owner_id, 
                amount, 
                stripe_payment_intent_id, 
                status,
                description
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            property_id,
            req.user.id,
            amount,
            paymentIntent.id,
            'pending',
            description || `Commission pour ${propertyCheck.rows[0].title}`
        ]);

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Erreur création Payment Intent:', error);
        res.status(500).json({ error: 'Erreur lors de la création du paiement' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: Récupérer l'historique des paiements
// =========================================
router.get('/payment-history', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        let query = `
            SELECT pf.*, p.title as property_title, p.city_name, p.canton_code
            FROM platform_fees pf
            JOIN properties p ON pf.property_id = p.id
        `;
        const params = [];

        if (req.user.role === 'owner') {
            query += ' WHERE pf.owner_id = $1';
            params.push(req.user.id);
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        query += ' ORDER BY pf.created_at DESC';

        const result = await client.query(query, params);
        res.json(result.rows);

    } catch (error) {
        console.error('Erreur récupération historique paiements:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: Récupérer les détails d'un paiement
// =========================================
router.get('/payment/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const result = await client.query(`
            SELECT pf.*, p.title as property_title, p.city_name, p.canton_code, p.price,
                   u.first_name, u.last_name, u.email
            FROM platform_fees pf
            JOIN properties p ON pf.property_id = p.id
            JOIN users u ON pf.owner_id = u.id
            WHERE pf.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paiement non trouvé' });
        }

        // Vérifier les permissions
        if (req.user.role !== 'admin' && result.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Erreur récupération détails paiement:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: Récupérer les frais en attente pour une propriété
// =========================================
router.get('/pending-fees/:property_id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { property_id } = req.params;

        // Vérifier que l'utilisateur est propriétaire
        const propertyCheck = await client.query(
            'SELECT owner_id FROM properties WHERE id = $1',
            [property_id]
        );

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Propriété non trouvée' });
        }

        if (propertyCheck.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Récupérer les frais en attente
        const result = await client.query(`
            SELECT * FROM platform_fees
            WHERE property_id = $1 AND status = 'pending'
            ORDER BY created_at DESC
        `, [property_id]);

        res.json(result.rows);

    } catch (error) {
        console.error('Erreur récupération frais en attente:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: Statistiques des paiements (Admin)
// =========================================
router.get('/stats', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
        }

        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_payments,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_revenue
            FROM platform_fees
        `);

        const monthlyRevenue = await client.query(`
            SELECT 
                TO_CHAR(paid_at, 'YYYY-MM') as month,
                COUNT(*) as payment_count,
                SUM(amount) as total_amount
            FROM platform_fees
            WHERE status = 'completed' AND paid_at IS NOT NULL
            GROUP BY TO_CHAR(paid_at, 'YYYY-MM')
            ORDER BY month DESC
            LIMIT 12
        `);

        res.json({
            overview: stats.rows[0],
            monthly: monthlyRevenue.rows
        });

    } catch (error) {
        console.error('Erreur récupération statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: Confirmer manuellement un paiement (Admin)
// =========================================
router.post('/confirm-payment/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
        }

        const { id } = req.params;

        const result = await client.query(`
            UPDATE platform_fees
            SET status = 'completed', paid_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paiement non trouvé' });
        }

        res.json({ 
            message: 'Paiement confirmé avec succès',
            payment: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur confirmation paiement:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: Calculer les frais pour une propriété
// =========================================
router.post('/calculate-fees', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { property_id, rental_duration_months } = req.body;

        if (!property_id || !rental_duration_months) {
            return res.status(400).json({ error: 'property_id et rental_duration_months requis' });
        }

        // Récupérer les infos de la propriété
        const property = await client.query(
            'SELECT price, owner_id FROM properties WHERE id = $1',
            [property_id]
        );

        if (property.rows.length === 0) {
            return res.status(404).json({ error: 'Propriété non trouvée' });
        }

        if (property.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // Calcul des frais (exemple: 10% du loyer mensuel)
        const monthlyRent = parseFloat(property.rows[0].price);
        const commissionRate = 0.10; // 10%
        const totalFees = monthlyRent * commissionRate;

        res.json({
            property_id,
            monthly_rent: monthlyRent,
            commission_rate: commissionRate * 100,
            total_fees: totalFees.toFixed(2),
            rental_duration_months
        });

    } catch (error) {
        console.error('Erreur calcul frais:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: Vérifier le statut d'un paiement Stripe
// =========================================
router.get('/verify-payment/:payment_intent_id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { payment_intent_id } = req.params;

        // Récupérer depuis la DB
        const dbPayment = await client.query(
            'SELECT * FROM platform_fees WHERE stripe_payment_intent_id = $1',
            [payment_intent_id]
        );

        if (dbPayment.rows.length === 0) {
            return res.status(404).json({ error: 'Paiement non trouvé dans la base de données' });
        }

        // Vérifier depuis Stripe
        const stripePayment = await stripe.paymentIntents.retrieve(payment_intent_id);

        res.json({
            database: dbPayment.rows[0],
            stripe: {
                id: stripePayment.id,
                status: stripePayment.status,
                amount: stripePayment.amount / 100,
                currency: stripePayment.currency,
                created: new Date(stripePayment.created * 1000)
            }
        });

    } catch (error) {
        console.error('Erreur vérification paiement:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

module.exports = router;
