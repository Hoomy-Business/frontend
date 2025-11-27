// routes/admin.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token requis' });

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide' });
        req.user = user;
        next();
    });
};

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
};

// =========================================
// FONCTION HELPER: LOGGER LES ACTIONS ADMIN
// =========================================
async function logAdminAction(client, adminId, actionType, targetType, targetId, targetEmail, targetName, description, metadata = null, req = null) {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip) : null;
        const userAgent = req ? req.headers['user-agent'] : null;
        
        await client.query(`
            INSERT INTO admin_logs (
                admin_id, action_type, target_type, target_id, target_email, target_name,
                description, metadata, ip_address, user_agent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
            adminId,
            actionType,
            targetType,
            targetId,
            targetEmail,
            targetName,
            description,
            metadata ? JSON.stringify(metadata) : null,
            ipAddress,
            userAgent
        ]);
    } catch (error) {
        // Ne pas bloquer l'action si le log échoue
        console.error('⚠️ Erreur lors de l\'enregistrement du log:', error.message);
    }
}

// =========================================
// ROUTE: STATISTIQUES KYC (DOIT ÊTRE AVANT /kyc/:id)
// =========================================
router.get('/kyc/stats', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
                COUNT(*) as total_count
            FROM kyc_verifications
        `);

        res.json({ stats: result.rows[0] });
    } catch (error) {
        console.error('❌ Erreur statistiques KYC:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: GET KYC EN ATTENTE
// =========================================
router.get('/kyc/pending', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                k.*,
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                u.created_at as user_created_at
            FROM kyc_verifications k
            JOIN users u ON k.user_id = u.id
            WHERE k.status = 'pending'
            ORDER BY k.submitted_at DESC
        `);

        // Construire les URLs complètes pour les images (HTTPS en production)
        const BASE_URL = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://backend.hoomy.site' : 'http://localhost:3000');
        const path = require('path');
        const kycs = result.rows.map(kyc => {
            const normalizeUrl = (url) => {
                if (!url) return null;
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    // Si c'est déjà une URL HTTP, la convertir en HTTPS en production
                    if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
                        return url.replace('http://', 'https://');
                    }
                    return url;
                }
                // Construire l'URL complète
                const filename = path.basename(url);
                const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
                const base = BASE_URL.replace(/^https?:\/\//, '').replace(/^http:\/\//, '');
                return `${protocol}://${base}/api/kyc/image/${filename}`;
            };
            return {
                ...kyc,
                id_card_front_url: normalizeUrl(kyc.id_card_front_url),
                id_card_back_url: normalizeUrl(kyc.id_card_back_url),
                selfie_url: normalizeUrl(kyc.selfie_url),
            };
        });

        res.json({ kycs });
    } catch (error) {
        console.error('❌ Erreur récupération KYC en attente:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: GET DÉTAILS D'UN KYC
// =========================================
router.get('/kyc/:id', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const result = await client.query(`
            SELECT 
                k.*,
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                u.phone,
                u.created_at as user_created_at
            FROM kyc_verifications k
            JOIN users u ON k.user_id = u.id
            WHERE k.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'KYC non trouvé' });
        }

        const kyc = result.rows[0];
        const BASE_URL = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://backend.hoomy.site' : 'http://localhost:3000');
        const path = require('path');
        
        const normalizeUrl = (url) => {
            if (!url) return null;
            if (url.startsWith('http://') || url.startsWith('https://')) {
                // Si c'est déjà une URL HTTP, la convertir en HTTPS en production
                if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
                    return url.replace('http://', 'https://');
                }
                return url;
            }
            // Construire l'URL complète
            const filename = path.basename(url);
            const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
            const base = BASE_URL.replace(/^https?:\/\//, '').replace(/^http:\/\//, '');
            return `${protocol}://${base}/api/kyc/image/${filename}`;
        };

        const kycData = {
            ...kyc,
            id_card_front_url: normalizeUrl(kyc.id_card_front_url),
            id_card_back_url: normalizeUrl(kyc.id_card_back_url),
            selfie_url: normalizeUrl(kyc.selfie_url),
        };

        res.json({ kyc: kycData });
    } catch (error) {
        console.error('❌ Erreur récupération KYC:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: APPROUVER UN KYC
// =========================================
router.put('/kyc/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        // Vérifier que le KYC existe
        const kycCheck = await client.query(
            'SELECT user_id, status FROM kyc_verifications WHERE id = $1',
            [id]
        );

        if (kycCheck.rows.length === 0) {
            return res.status(404).json({ error: 'KYC non trouvé' });
        }

        if (kycCheck.rows[0].status === 'approved') {
            return res.status(400).json({ error: 'Ce KYC est déjà approuvé' });
        }

        // Approuver le KYC
        await client.query(`
            UPDATE kyc_verifications 
            SET 
                status = 'approved',
                reviewed_at = CURRENT_TIMESTAMP,
                reviewed_by = $1,
                rejection_reason = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [req.user.id, id]);

        // Mettre à jour kyc_verified dans users
        await client.query(`
            UPDATE users 
            SET kyc_verified = TRUE 
            WHERE id = $1
        `, [kycCheck.rows[0].user_id]);

        // Logger l'action
        const userInfo = await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [kycCheck.rows[0].user_id]);
        const user = userInfo.rows[0];
        await logAdminAction(
            client,
            req.user.id,
            'kyc_approve',
            'kyc',
            id,
            user?.email,
            user ? `${user.first_name} ${user.last_name}` : null,
            `KYC approuvé pour ${user ? `${user.first_name} ${user.last_name}` : `utilisateur ${kycCheck.rows[0].user_id}`}`,
            { kyc_id: id, user_id: kycCheck.rows[0].user_id },
            req
        );

        res.json({ 
            message: 'KYC approuvé avec succès',
            kyc_id: id
        });

    } catch (error) {
        console.error('❌ Erreur approbation KYC:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: REJETER UN KYC
// =========================================
router.put('/kyc/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ error: 'Une raison de rejet est requise' });
        }

        // Vérifier que le KYC existe
        const kycCheck = await client.query(
            'SELECT user_id, status FROM kyc_verifications WHERE id = $1',
            [id]
        );

        if (kycCheck.rows.length === 0) {
            return res.status(404).json({ error: 'KYC non trouvé' });
        }

        if (kycCheck.rows[0].status === 'rejected') {
            return res.status(400).json({ error: 'Ce KYC est déjà rejeté' });
        }

        // Rejeter le KYC
        await client.query(`
            UPDATE kyc_verifications 
            SET 
                status = 'rejected',
                rejection_reason = $1,
                reviewed_at = CURRENT_TIMESTAMP,
                reviewed_by = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
        `, [reason.trim(), req.user.id, id]);

        // S'assurer que kyc_verified est FALSE
        await client.query(`
            UPDATE users 
            SET kyc_verified = FALSE 
            WHERE id = $1
        `, [kycCheck.rows[0].user_id]);

        // Logger l'action
        const userInfo = await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [kycCheck.rows[0].user_id]);
        const user = userInfo.rows[0];
        await logAdminAction(
            client,
            req.user.id,
            'kyc_reject',
            'kyc',
            id,
            user?.email,
            user ? `${user.first_name} ${user.last_name}` : null,
            `KYC rejeté pour ${user ? `${user.first_name} ${user.last_name}` : `utilisateur ${kycCheck.rows[0].user_id}`}. Raison: ${reason.trim()}`,
            { kyc_id: id, user_id: kycCheck.rows[0].user_id, reason: reason.trim() },
            req
        );

        res.json({ 
            message: 'KYC rejeté avec succès',
            kyc_id: id
        });

    } catch (error) {
        console.error('❌ Erreur rejet KYC:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// FONCTION: S'assurer que les colonnes ban/mute existent
// =========================================
async function ensureModerationColumns(client) {
    try {
        // Vérifier et ajouter les colonnes si elles n'existent pas
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='users' AND column_name='banned_until') THEN
                    ALTER TABLE users ADD COLUMN banned_until TIMESTAMP NULL;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='users' AND column_name='ban_reason') THEN
                    ALTER TABLE users ADD COLUMN ban_reason TEXT NULL;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='users' AND column_name='muted_until') THEN
                    ALTER TABLE users ADD COLUMN muted_until TIMESTAMP NULL;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='users' AND column_name='mute_reason') THEN
                    ALTER TABLE users ADD COLUMN mute_reason TEXT NULL;
                END IF;
            END $$;
        `);
    } catch (error) {
        console.error('⚠️ Erreur lors de la vérification des colonnes:', error.message);
        // Ne pas bloquer si les colonnes existent déjà
    }
}

// =========================================
// ROUTE: STATISTIQUES GÉNÉRALES
// =========================================
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const [usersStats, propertiesStats] = await Promise.all([
            client.query(`
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(*) FILTER (WHERE role = 'student') as total_students,
                    COUNT(*) FILTER (WHERE role = 'owner') as total_owners,
                    COUNT(*) FILTER (WHERE role = 'admin') as total_admins
                FROM users
            `),
            client.query(`
                SELECT 
                    COUNT(*) as total_properties,
                    COUNT(*) FILTER (WHERE status = 'available') as active_properties,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_properties,
                    COUNT(*) FILTER (WHERE status = 'rented') as rented_properties
                FROM properties
            `)
        ]);

        // Vérifier si la table contracts existe
        let contractsCount = 0;
        try {
            const contractsCheck = await client.query(`
                SELECT COUNT(*) as total_contracts
                FROM contracts
            `);
            contractsCount = parseInt(contractsCheck.rows[0].total_contracts || 0);
        } catch (contractsError) {
            // Table contracts n'existe pas encore, utiliser 0
            console.log('⚠️ Table contracts n\'existe pas encore, utilisation de 0');
            contractsCount = 0;
        }

        res.json({
            total_users: parseInt(usersStats.rows[0].total_users),
            total_students: parseInt(usersStats.rows[0].total_students),
            total_owners: parseInt(usersStats.rows[0].total_owners),
            total_properties: parseInt(propertiesStats.rows[0].total_properties),
            active_properties: parseInt(propertiesStats.rows[0].active_properties),
            total_contracts: contractsCount
        });
    } catch (error) {
        console.error('❌ Erreur statistiques générales:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: LISTE DES UTILISATEURS
// =========================================
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        await ensureModerationColumns(client);
        
        // Vérifier si la colonne deleted_at existe
        const hasDeletedAt = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'deleted_at'
        `);
        const deletedAtExists = hasDeletedAt.rows.length > 0;
        const deletedAtFilter = deletedAtExists ? 'AND deleted_at IS NULL' : '';
        
        const result = await client.query(`
            SELECT 
                id, email, first_name, last_name, role, phone,
                email_verified, phone_verified, created_at,
                banned_until, ban_reason,
                muted_until, mute_reason,
                CASE 
                    WHEN banned_until IS NOT NULL AND banned_until > CURRENT_TIMESTAMP THEN true
                    WHEN banned_until IS NOT NULL AND banned_until <= CURRENT_TIMESTAMP THEN false
                    ELSE false
                END as is_banned,
                CASE 
                    WHEN muted_until IS NOT NULL AND muted_until > CURRENT_TIMESTAMP THEN true
                    WHEN muted_until IS NOT NULL AND muted_until <= CURRENT_TIMESTAMP THEN false
                    ELSE false
                END as is_muted
            FROM users
            WHERE 1=1 ${deletedAtFilter}
            ORDER BY created_at DESC
        `);

        res.json({ users: result.rows });
    } catch (error) {
        console.error('❌ Erreur récupération utilisateurs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: LISTE DES PROPRIÉTÉS
// =========================================
router.get('/properties', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                p.*,
                u.first_name, u.last_name, u.email, u.phone,
                sc.name_fr as canton_name,
                (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            ORDER BY p.created_at DESC
        `);

        res.json({ properties: result.rows });
    } catch (error) {
        console.error('❌ Erreur récupération propriétés:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: BANNIR UN UTILISATEUR
// =========================================
router.post('/users/:id/ban', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { days, reason } = req.body;

        if (!days || !reason || reason.trim().length === 0) {
            return res.status(400).json({ error: 'Durée et raison requises' });
        }

        await ensureModerationColumns(client);

        // Vérifier que l'utilisateur existe
        const userCheck = await client.query('SELECT id, role FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Ne pas bannir un autre admin
        if (userCheck.rows[0].role === 'admin') {
            return res.status(403).json({ error: 'Impossible de bannir un administrateur' });
        }

        // Calculer la date de fin de bannissement
        const bannedUntil = new Date();
        bannedUntil.setDate(bannedUntil.getDate() + parseInt(days));

        await client.query(`
            UPDATE users 
            SET 
                banned_until = $1,
                ban_reason = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
        `, [bannedUntil, reason.trim(), id]);

        // Logger l'action
        const userInfo = await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [id]);
        const user = userInfo.rows[0];
        await logAdminAction(
            client,
            req.user.id,
            'user_ban',
            'user',
            id,
            user?.email,
            user ? `${user.first_name} ${user.last_name}` : null,
            `Utilisateur banni pour ${days} jour(s). Raison: ${reason.trim()}`,
            { user_id: id, days: parseInt(days), reason: reason.trim(), banned_until: bannedUntil.toISOString() },
            req
        );

        res.json({ 
            message: 'Utilisateur banni avec succès',
            banned_until: bannedUntil.toISOString()
        });
    } catch (error) {
        console.error('❌ Erreur bannissement utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: DÉBANNIR UN UTILISATEUR
// =========================================
router.post('/users/:id/unban', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        await ensureModerationColumns(client);

        await client.query(`
            UPDATE users 
            SET 
                banned_until = NULL,
                ban_reason = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [id]);

        // Logger l'action
        const userInfo = await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [id]);
        const user = userInfo.rows[0];
        await logAdminAction(
            client,
            req.user.id,
            'user_unban',
            'user',
            id,
            user?.email,
            user ? `${user.first_name} ${user.last_name}` : null,
            `Utilisateur débanni`,
            { user_id: id },
            req
        );

        res.json({ message: 'Utilisateur débanni avec succès' });
    } catch (error) {
        console.error('❌ Erreur débannissement utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: MUTER UN UTILISATEUR
// =========================================
router.post('/users/:id/mute', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { hours, reason } = req.body;

        if (!hours || !reason || reason.trim().length === 0) {
            return res.status(400).json({ error: 'Durée et raison requises' });
        }

        await ensureModerationColumns(client);

        // Vérifier que l'utilisateur existe
        const userCheck = await client.query('SELECT id, role FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Ne pas muter un autre admin
        if (userCheck.rows[0].role === 'admin') {
            return res.status(403).json({ error: 'Impossible de muter un administrateur' });
        }

        // Calculer la date de fin de mute
        const mutedUntil = new Date();
        mutedUntil.setHours(mutedUntil.getHours() + parseInt(hours));

        await client.query(`
            UPDATE users 
            SET 
                muted_until = $1,
                mute_reason = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
        `, [mutedUntil, reason.trim(), id]);

        // Logger l'action
        const userInfo = await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [id]);
        const user = userInfo.rows[0];
        await logAdminAction(
            client,
            req.user.id,
            'user_mute',
            'user',
            id,
            user?.email,
            user ? `${user.first_name} ${user.last_name}` : null,
            `Utilisateur muté pour ${hours} heure(s). Raison: ${reason.trim()}`,
            { user_id: id, hours: parseInt(hours), reason: reason.trim(), muted_until: mutedUntil.toISOString() },
            req
        );

        res.json({ 
            message: 'Utilisateur muté avec succès',
            muted_until: mutedUntil.toISOString()
        });
    } catch (error) {
        console.error('❌ Erreur mute utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: DÉMUTER UN UTILISATEUR
// =========================================
router.post('/users/:id/unmute', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        await ensureModerationColumns(client);

        await client.query(`
            UPDATE users 
            SET 
                muted_until = NULL,
                mute_reason = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [id]);

        // Logger l'action
        const userInfo = await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [id]);
        const user = userInfo.rows[0];
        await logAdminAction(
            client,
            req.user.id,
            'user_unmute',
            'user',
            id,
            user?.email,
            user ? `${user.first_name} ${user.last_name}` : null,
            `Utilisateur démuté`,
            { user_id: id },
            req
        );

        res.json({ message: 'Utilisateur démuté avec succès' });
    } catch (error) {
        console.error('❌ Erreur démutage utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: SUPPRIMER UN UTILISATEUR
// =========================================
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        // Vérifier que l'utilisateur existe
        const userCheck = await client.query('SELECT id, role FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Ne pas supprimer un autre admin
        if (userCheck.rows[0].role === 'admin') {
            return res.status(403).json({ error: 'Impossible de supprimer un administrateur' });
        }

        // Ne pas se supprimer soi-même
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({ error: 'Impossible de supprimer votre propre compte' });
        }

        // Logger l'action AVANT la suppression
        const userInfo = await client.query('SELECT email, first_name, last_name, role FROM users WHERE id = $1', [id]);
        const user = userInfo.rows[0];
        
        // Suppression définitive (hard delete)
        // Les contraintes ON DELETE CASCADE s'occuperont de supprimer automatiquement
        // toutes les données liées (properties, messages, conversations, etc.)
        await client.query('DELETE FROM users WHERE id = $1', [id]);

        // Logger l'action
        await logAdminAction(
            client,
            req.user.id,
            'user_delete',
            'user',
            id,
            user?.email,
            user ? `${user.first_name} ${user.last_name}` : null,
            `Utilisateur supprimé définitivement (rôle: ${user?.role || 'inconnu'})`,
            { user_id: id, user_role: user?.role },
            req
        );

        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: SUPPRIMER UNE PROPRIÉTÉ (ADMIN)
// =========================================
router.delete('/properties/:id', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const path = require('path');
        const fs = require('fs');

        // Vérifier que la propriété existe
        const propertyCheck = await client.query('SELECT id FROM properties WHERE id = $1', [id]);
        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Propriété non trouvée' });
        }

        // Récupérer les photos pour les supprimer
        const photos = await client.query('SELECT photo_url FROM property_photos WHERE property_id = $1', [id]);
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        
        photos.rows.forEach(photo => {
            if (photo.photo_url) {
                const filename = path.basename(photo.photo_url);
                const filePath = path.join(uploadsDir, filename);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (err) {
                        console.error('⚠️ Erreur suppression fichier:', err.message);
                    }
                }
            }
        });

        // Logger l'action AVANT la suppression
        const propertyInfo = await client.query('SELECT title, owner_id FROM properties WHERE id = $1', [id]);
        const property = propertyInfo.rows[0];
        const ownerInfo = property ? await client.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [property.owner_id]) : null;
        const owner = ownerInfo?.rows[0];

        // Supprimer la propriété
        await client.query('DELETE FROM properties WHERE id = $1', [id]);

        // Logger l'action
        await logAdminAction(
            client,
            req.user.id,
            'property_delete',
            'property',
            id,
            owner?.email,
            property?.title || null,
            `Propriété "${property?.title || 'ID ' + id}" supprimée définitivement`,
            { property_id: id, property_title: property?.title, owner_id: property?.owner_id },
            req
        );

        res.json({ message: 'Propriété supprimée avec succès' });
    } catch (error) {
        console.error('❌ Erreur suppression propriété:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: RÉCUPÉRER LES LOGS ADMINISTRATIFS
// =========================================
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { limit = 100, offset = 0, action_type, target_type } = req.query;
        
        let query = `
            SELECT 
                l.*,
                u.email as admin_email,
                u.first_name as admin_first_name,
                u.last_name as admin_last_name
            FROM admin_logs l
            LEFT JOIN users u ON l.admin_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (action_type) {
            query += ` AND l.action_type = $${paramCount}`;
            params.push(action_type);
            paramCount++;
        }

        if (target_type) {
            query += ` AND l.target_type = $${paramCount}`;
            params.push(target_type);
            paramCount++;
        }

        query += ` ORDER BY l.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await client.query(query, params);

        // Compter le total
        let countQuery = `
            SELECT COUNT(*) as total
            FROM admin_logs
            WHERE 1=1
        `;
        const countParams = [];
        let countParamCount = 1;

        if (action_type) {
            countQuery += ` AND action_type = $${countParamCount}`;
            countParams.push(action_type);
            countParamCount++;
        }

        if (target_type) {
            countQuery += ` AND target_type = $${countParamCount}`;
            countParams.push(target_type);
            countParamCount++;
        }

        const countResult = await client.query(countQuery, countParams);

        res.json({
            logs: result.rows,
            total: parseInt(countResult.rows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('❌ Erreur récupération logs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

module.exports = router;

