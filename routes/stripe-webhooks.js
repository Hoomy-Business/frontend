// routes/stripe-webhooks.js
// ========================================
// 🔔 WEBHOOKS STRIPE
// ========================================
require('dotenv').config();
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Utiliser le pool partagé depuis db.js
const { pool } = require('../db');

// ⚠️ IMPORTANT: Cette route doit utiliser express.raw() pour la vérification de signature
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('❌ Erreur webhook signature:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📩 Webhook reçu: ${event.type}`);

    const client = await pool.connect();

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object, client);
                break;

            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object, client);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object, client);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object, client);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object, client);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object, client);
                break;

            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object, client);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object, client);
                break;

            default:
                console.log(`⚠️ Type d'événement non géré: ${event.type}`);
        }

        res.json({ received: true });

    } catch (error) {
        console.error('❌ Erreur traitement webhook:', error);
        res.status(500).json({ error: 'Erreur traitement webhook' });
    } finally {
        client.release();
    }
});

// ========================================
// 📝 HANDLERS DES ÉVÉNEMENTS WEBHOOK
// ========================================

// Checkout session completed
async function handleCheckoutSessionCompleted(session, client) {
    console.log('✅ Checkout session completed:', session.id);
    
    if (session.mode === 'subscription') {
        const subscriptionId = session.subscription;
        const metadata = session.subscription_data?.metadata || session.metadata;
        const contractId = metadata?.contract_id;
        
        if (contractId) {
            await client.query(
                `UPDATE rental_contracts 
                 SET stripe_subscription_id = $1, status = $2, contract_signed_at = CURRENT_TIMESTAMP 
                 WHERE id = $3`,
                [subscriptionId, 'active', contractId]
            );
            
            console.log(`✅ Contrat #${contractId} activé avec subscription ${subscriptionId}`);
        }
    }
}

// Subscription created
async function handleSubscriptionCreated(subscription, client) {
    console.log('✅ Subscription created:', subscription.id);
    
    const contractId = subscription.metadata?.contract_id;
    
    if (contractId) {
        await client.query(
            `UPDATE rental_contracts 
             SET stripe_subscription_id = $1, status = $2 
             WHERE id = $3`,
            [subscription.id, 'active', contractId]
        );
    }
}

// Subscription updated
async function handleSubscriptionUpdated(subscription, client) {
    console.log('🔄 Subscription updated:', subscription.id);
    
    // Mettre à jour le statut si nécessaire
    if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
        const result = await client.query(
            'SELECT id FROM rental_contracts WHERE stripe_subscription_id = $1',
            [subscription.id]
        );
        
        if (result.rows.length > 0) {
            await client.query(
                'UPDATE rental_contracts SET status = $1 WHERE stripe_subscription_id = $2',
                ['cancelled', subscription.id]
            );
            
            console.log(`❌ Contrat #${result.rows[0].id} annulé (subscription ${subscription.status})`);
        }
    }
}

// Subscription deleted
async function handleSubscriptionDeleted(subscription, client) {
    console.log('❌ Subscription deleted:', subscription.id);
    
    const result = await client.query(
        'SELECT id FROM rental_contracts WHERE stripe_subscription_id = $1',
        [subscription.id]
    );
    
    if (result.rows.length > 0) {
        await client.query(
            'UPDATE rental_contracts SET status = $1 WHERE stripe_subscription_id = $2',
            ['cancelled', subscription.id]
        );
        
        console.log(`❌ Contrat #${result.rows[0].id} marqué comme annulé`);
    }
}

// Invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice, client) {
    console.log('💰 Invoice payment succeeded:', invoice.id);
    
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;
    
    // Récupérer le contrat
    const contractResult = await client.query(
        'SELECT id, monthly_rent, hoomy_commission, owner_payout FROM rental_contracts WHERE stripe_subscription_id = $1',
        [subscriptionId]
    );
    
    if (contractResult.rows.length > 0) {
        const contract = contractResult.rows[0];
        
        // Enregistrer la transaction
        await client.query(
            `INSERT INTO payment_transactions 
             (contract_id, stripe_payment_intent_id, stripe_charge_id, stripe_invoice_id,
              amount, hoomy_fee, owner_payout, payment_type, payment_status, paid_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
            [
                contract.id,
                invoice.payment_intent,
                invoice.charge,
                invoice.id,
                (invoice.amount_paid / 100).toFixed(2),
                (invoice.application_fee_amount / 100).toFixed(2),
                ((invoice.amount_paid - invoice.application_fee_amount) / 100).toFixed(2),
                'monthly_rent',
                'succeeded'
            ]
        );
        
        console.log(`✅ Paiement mensuel enregistré pour le contrat #${contract.id}`);
    }
}

// Invoice payment failed
async function handleInvoicePaymentFailed(invoice, client) {
    console.log('❌ Invoice payment failed:', invoice.id);
    
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;
    
    const contractResult = await client.query(
        'SELECT id FROM rental_contracts WHERE stripe_subscription_id = $1',
        [subscriptionId]
    );
    
    if (contractResult.rows.length > 0) {
        const contract = contractResult.rows[0];
        
        // Enregistrer l'échec
        await client.query(
            `INSERT INTO payment_transactions 
             (contract_id, stripe_payment_intent_id, stripe_invoice_id,
              amount, hoomy_fee, owner_payout, payment_type, payment_status, failure_reason) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                contract.id,
                invoice.payment_intent,
                invoice.id,
                (invoice.amount_due / 100).toFixed(2),
                0,
                0,
                'monthly_rent',
                'failed',
                invoice.last_finalization_error?.message || 'Payment failed'
            ]
        );
        
        console.warn(`⚠️ Échec de paiement pour le contrat #${contract.id}`);
    }
}

// Payment Intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent, client) {
    console.log('✅ Payment intent succeeded:', paymentIntent.id);
    
    await client.query(
        `UPDATE payment_transactions 
         SET payment_status = $1, paid_at = CURRENT_TIMESTAMP 
         WHERE stripe_payment_intent_id = $2`,
        ['succeeded', paymentIntent.id]
    );
}

// Payment Intent failed
async function handlePaymentIntentFailed(paymentIntent, client) {
    console.log('❌ Payment intent failed:', paymentIntent.id);
    
    await client.query(
        `UPDATE payment_transactions 
         SET payment_status = $1, failure_reason = $2 
         WHERE stripe_payment_intent_id = $3`,
        ['failed', paymentIntent.last_payment_error?.message || 'Payment failed', paymentIntent.id]
    );
}

module.exports = router;
