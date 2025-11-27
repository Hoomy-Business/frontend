// routes/kyc.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { pool } = require('../db');

// Fonction pour obtenir l'IP locale
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIP();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://${LOCAL_IP}:${PORT}`;

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

// Configuration Multer pour les uploads KYC
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'kyc');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `kyc-${req.user.id}-${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|webp|WEBP)$/)) {
        req.fileValidationError = 'Seuls les fichiers image sont autorisés (JPG, PNG, WEBP)';
        return cb(null, false); // Ne pas throw, juste retourner false
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: fileFilter
});

// =========================================
// ROUTE: GET KYC STATUS
// =========================================
router.get('/status', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                k.*,
                u.kyc_verified,
                CASE 
                    WHEN k.status = 'approved' THEN true
                    ELSE false
                END as is_verified
            FROM kyc_verifications k
            RIGHT JOIN users u ON u.id = $1
            WHERE u.id = $1
            ORDER BY k.id DESC
            LIMIT 1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            // Pas encore de KYC soumis
            return res.json({
                status: 'not_submitted',
                is_verified: false,
                kyc_verified: false
            });
        }

        const kyc = result.rows[0];
        
        // Construire les URLs complètes
        // BASE_URL est défini en haut du fichier
        const kycData = {
            id: kyc.id,
            status: kyc.status || 'not_submitted',
            is_verified: kyc.is_verified || false,
            kyc_verified: kyc.kyc_verified || false,
            id_card_front_url: kyc.id_card_front_url 
                ? (kyc.id_card_front_url.startsWith('http') ? kyc.id_card_front_url : `${BASE_URL}/api/kyc/image/${path.basename(kyc.id_card_front_url)}`)
                : null,
            id_card_back_url: kyc.id_card_back_url 
                ? (kyc.id_card_back_url.startsWith('http') ? kyc.id_card_back_url : `${BASE_URL}/api/kyc/image/${path.basename(kyc.id_card_back_url)}`)
                : null,
            selfie_url: kyc.selfie_url 
                ? (kyc.selfie_url.startsWith('http') ? kyc.selfie_url : `${BASE_URL}/api/kyc/image/${path.basename(kyc.selfie_url)}`)
                : null,
            rejection_reason: kyc.rejection_reason,
            submitted_at: kyc.submitted_at,
            reviewed_at: kyc.reviewed_at
        };

        res.json(kycData);

    } catch (error) {
        console.error('❌ Erreur récupération statut KYC:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: SUBMIT KYC
// =========================================
router.post('/submit', authenticateToken, (req, res, next) => {
    // Middleware pour gérer les erreurs multer
    upload.fields([
        { name: 'id_card_front', maxCount: 1 },
        { name: 'id_card_back', maxCount: 1 },
        { name: 'selfie', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'Fichier trop volumineux. Taille maximale: 10MB' });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({ error: 'Trop de fichiers envoyés' });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({ error: 'Nom de champ de fichier inattendu' });
                }
                return res.status(400).json({ error: `Erreur upload: ${err.message}` });
            }
            if (err.message && err.message.includes('Only image files')) {
                return res.status(400).json({ error: 'Seuls les fichiers image sont autorisés (JPG, PNG, WEBP)' });
            }
            return res.status(400).json({ error: err.message || 'Erreur lors de l\'upload des fichiers' });
        }
        // Gérer les erreurs de validation multer
        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        }
        if (req.files === undefined) {
            return res.status(400).json({ error: 'Aucun fichier reçu. Assurez-vous d\'envoyer les fichiers avec les noms: id_card_front, id_card_back, selfie' });
        }
        next();
    });
}, async (req, res) => {
    const client = await pool.connect();
    try {
        const files = req.files;
        
        // Vérifier que tous les fichiers sont présents
        if (!files || !files.id_card_front || !files.id_card_back || !files.selfie) {
            const missing = [];
            if (!files || !files.id_card_front) missing.push('carte d\'identité avant');
            if (!files || !files.id_card_back) missing.push('carte d\'identité arrière');
            if (!files || !files.selfie) missing.push('selfie');
            
            return res.status(400).json({ 
                error: `Documents manquants: ${missing.join(', ')}. Tous les documents sont requis.` 
            });
        }
        
        // Vérifier que les fichiers ne sont pas vides
        if (!files.id_card_front[0] || !files.id_card_back[0] || !files.selfie[0]) {
            return res.status(400).json({ 
                error: 'Un ou plusieurs fichiers sont vides ou invalides' 
            });
        }

        // Vérifier que l'utilisateur existe dans la base de données
        const userCheck = await client.query(
            'SELECT id FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (userCheck.rows.length === 0) {
            console.error(`❌ Tentative de création KYC pour un utilisateur inexistant: user_id=${req.user.id}`);
            return res.status(404).json({ 
                error: 'Utilisateur non trouvé. Veuillez vous reconnecter.' 
            });
        }

        // BASE_URL est défini en haut du fichier
        const idCardFrontUrl = `${BASE_URL}/api/kyc/image/${files.id_card_front[0].filename}`;
        const idCardBackUrl = `${BASE_URL}/api/kyc/image/${files.id_card_back[0].filename}`;
        const selfieUrl = `${BASE_URL}/api/kyc/image/${files.selfie[0].filename}`;

        // Vérifier si un KYC existe déjà
        const existingKYC = await client.query(
            'SELECT id FROM kyc_verifications WHERE user_id = $1',
            [req.user.id]
        );

        let result;
        if (existingKYC.rows.length > 0) {
            // Mettre à jour le KYC existant
            result = await client.query(`
                UPDATE kyc_verifications 
                SET 
                    id_card_front_url = $1,
                    id_card_back_url = $2,
                    selfie_url = $3,
                    status = 'pending',
                    rejection_reason = NULL,
                    submitted_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $4
                RETURNING *
            `, [idCardFrontUrl, idCardBackUrl, selfieUrl, req.user.id]);
        } else {
            // Créer un nouveau KYC
            result = await client.query(`
                INSERT INTO kyc_verifications (
                    user_id, id_card_front_url, id_card_back_url, selfie_url, status
                )
                VALUES ($1, $2, $3, $4, 'pending')
                RETURNING *
            `, [req.user.id, idCardFrontUrl, idCardBackUrl, selfieUrl]);
        }

        // Mettre à jour kyc_verified à false car en attente
        await client.query(
            'UPDATE users SET kyc_verified = FALSE WHERE id = $1',
            [req.user.id]
        );

        res.json({
            message: 'KYC soumis avec succès. En attente de vérification.',
            kyc: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Erreur soumission KYC:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la soumission du KYC' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE: UPLOAD IMAGE (pour selfie en direct)
// =========================================
router.post('/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        // BASE_URL est défini en haut du fichier
        const imageUrl = `${BASE_URL}/api/kyc/image/${req.file.filename}`;
        
        res.json({
            success: true,
            url: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Erreur upload image KYC:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

// =========================================
// ROUTE: GET KYC IMAGE
// =========================================
router.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // Headers CORS pour les images - TOUJOURS définir même sans origin
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
    
    // Déterminer le type MIME basé sur l'extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    const contentType = mimeTypes[ext] || 'image/jpeg';
    
    if (fs.existsSync(filePath)) {
        // Headers de cache et type MIME
        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000', // 1 an
            'ETag': `"${filename}"`,
            'Last-Modified': new Date().toUTCString()
        });
        
        // Utiliser sendFile avec les options pour éviter les problèmes de réponse opaque
        res.sendFile(filePath, {
            headers: {
                'Content-Type': contentType
            }
        }, (err) => {
            if (err) {
                console.error('Erreur envoi image KYC:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Erreur serveur lors de l\'envoi de l\'image' });
                }
            }
        });
    } else {
        res.status(404).json({ error: 'Image non trouvée' });
    }
});

module.exports = router;

