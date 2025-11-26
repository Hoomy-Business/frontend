require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const contractsRoutes = require('./routes/contracts');
const stripeWebhooksRoutes = require('./routes/stripe-webhooks');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// =========================================
// CONFIGURATION LAN UNIQUEMENT
// =========================================
function getLocalIP() {
    return 'localhost';
}

const LOCAL_IP = getLocalIP();
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

console.log(`
╔═══════════════════════════════════════════════════╗
║   🔒 CONFIGURATION RÉSEAU LOCAL (LAN) UNIQUEMENT  ║
║   IP Locale: ${LOCAL_IP}                          ║
║   Port: ${PORT}                                   ║
║   URL: ${BASE_URL}                                ║
╚═══════════════════════════════════════════════════╝
`);

// =========================================
// POSTGRESQL POOL - DOIT ÊTRE AVANT LES ROUTES
// =========================================
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hoomy_ch',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Test connexion DB
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Erreur de connexion à PostgreSQL:', err.message);
    } else {
        console.log('✅ Connexion à PostgreSQL réussie');
    }
});

pool.on('error', (err) => {
    console.error('❌ Erreur pool PostgreSQL:', err);
});

// =========================================
// CONFIGURATION UPLOADS
// =========================================
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// =========================================
// WEBHOOK STRIPE - DOIT ÊTRE AVANT express.json()
// =========================================
app.use('/api/stripe', stripeWebhooksRoutes);

// =========================================
// MIDDLEWARE - CORS ET BODY PARSERS
// =========================================
// REMPLACE la configuration CORS actuelle (ligne ~76)
app.use(cors({
    origin: function(origin, callback) {
        // Permet toutes les origines en développement
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204
}));

// Ajoute un handler explicite pour OPTIONS
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir les fichiers statiques
app.use(express.static('public'));
app.use('/uploads', express.static(uploadsDir));

// =========================================
// ROUTES - DANS LE BON ORDRE
// =========================================
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Pour /api/login
app.use('/api/payments', paymentRoutes);
app.use('/api/contracts', contractsRoutes);

// =========================================
// MIDDLEWARE D'AUTHENTIFICATION
// =========================================
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
// CONFIGURATION MULTER
// =========================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: fileFilter
});

// =========================================
// ROUTES D'IMAGES
// =========================================
app.get('/api/image/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Image non trouvée' });
    }
});

app.post('/api/upload/image', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        const imageUrl = `https://backend.hoomy.site/api/image/${req.file.filename}`;
        
        res.json({
            success: true,
            url: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Erreur upload image:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

app.post('/api/upload/images', authenticateToken, upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        const imageUrls = req.files.map(file => ({
            url: `${BASE_URL}/api/image/${file.filename}`,
            filename: file.filename
        }));
        
        res.json({
            success: true,
            images: imageUrls
        });
    } catch (error) {
        console.error('Erreur upload images:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

app.delete('/api/upload/image/:filename', authenticateToken, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Image supprimée' });
        } else {
            res.status(404).json({ error: 'Image non trouvée' });
        }
    } catch (error) {
        console.error('Erreur suppression image:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

// =========================================
// ROUTES VILLES ET CANTONS SUISSES
// =========================================
app.get('/api/locations/cantons', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM swiss_cantons ORDER BY name_fr');
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération cantons:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.get('/api/locations/cities', async (req, res) => {
    const client = await pool.connect();
    try {
        const { canton } = req.query;
        
        let query = 'SELECT c.*, s.name_fr as canton_name FROM swiss_cities c JOIN swiss_cantons s ON c.canton_code = s.code WHERE 1=1';
        const params = [];
        
        if (canton) {
            query += ' AND c.canton_code = $1';
            params.push(canton);
        }
        
        query += ' ORDER BY c.name';
        
        const result = await client.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération villes:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTES PROPERTIES (ANNONCES)
// =========================================
app.get('/api/properties', async (req, res) => {
    const client = await pool.connect();
    try {
        const { city_id, city_name, canton, max_price, min_rooms, property_type, status } = req.query;

        let query = `
            SELECT p.*, 
                   u.first_name, u.last_name, u.email, u.phone, u.profile_picture,
                   sc.name_fr as canton_name,
                   (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (city_id) {
            query += ` AND p.city_id = $${paramCount}`;
            params.push(city_id);
            paramCount++;
        }

        if (city_name) {
            query += ` AND p.city_name = $${paramCount}`;
            params.push(city_name);
            paramCount++;
        }

        if (canton) {
            query += ` AND p.canton_code = $${paramCount}`;
            params.push(canton);
            paramCount++;
        }

        if (max_price) {
            query += ` AND p.price <= $${paramCount}`;
            params.push(max_price);
            paramCount++;
        }

        if (min_rooms) {
            query += ` AND p.rooms >= $${paramCount}`;
            params.push(min_rooms);
            paramCount++;
        }

        if (property_type) {
            query += ` AND p.property_type = $${paramCount}`;
            params.push(property_type);
            paramCount++;
        }

        if (status) {
            query += ` AND p.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        } else {
            query += ` AND p.status = 'available'`;
        }

        query += ' ORDER BY p.created_at DESC';

        const result = await client.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération annonces:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.get('/api/properties/my-properties', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT p.*, 
                   sc.name_fr as canton_name,
                   (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo
            FROM properties p
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE p.owner_id = $1
            ORDER BY p.created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération mes annonces:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.get('/api/properties/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const propertyResult = await client.query(`
            SELECT p.*, u.first_name, u.last_name, u.email, u.phone, u.email_verified, u.phone_verified, u.profile_picture,
                   sc.name_fr as canton_name
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE p.id = $1
        `, [id]);

        if (propertyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        const property = propertyResult.rows[0];

        const photosResult = await client.query(
            'SELECT * FROM property_photos WHERE property_id = $1 ORDER BY is_main DESC',
            [id]
        );

        property.photos = photosResult.rows;

        res.json(property);
    } catch (error) {
        console.error('Erreur récupération annonce:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.post('/api/properties', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Seuls les propriétaires peuvent publier des annonces' });
        }

        const {
            title, description, property_type, address, city_id, city_name, 
            postal_code, canton_code, price, rooms, bathrooms, surface_area, 
            available_from, image_urls
        } = req.body;

        if (!title || !city_name || !postal_code || !canton_code || !address || !price) {
            return res.status(400).json({ error: 'Champs obligatoires manquants' });
        }

        if (!image_urls || image_urls.length === 0) {
            return res.status(400).json({ error: 'Au moins une image est requise' });
        }

        const result = await client.query(`
            INSERT INTO properties (
                owner_id, title, description, property_type, address, city_id, city_name,
                postal_code, canton_code, price, rooms, bathrooms, surface_area, available_from
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `, [
            req.user.id, title, description, property_type || 'other', address, 
            city_id || null, city_name, postal_code, canton_code, price, 
            rooms || null, bathrooms || null, surface_area || null, available_from || null
        ]);

        const property = result.rows[0];

        for (let i = 0; i < image_urls.length; i++) {
            await client.query(
                'INSERT INTO property_photos (property_id, photo_url, is_main) VALUES ($1, $2, $3)',
                [property.id, image_urls[i], i === 0]
            );
        }

        res.status(201).json(property);
    } catch (error) {
        console.error('Erreur création annonce:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.put('/api/properties/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const {
            title, description, property_type, address, city_id, city_name, 
            postal_code, canton_code, price, rooms, bathrooms, surface_area, available_from, status
        } = req.body;

        const checkOwner = await client.query('SELECT owner_id FROM properties WHERE id = $1', [id]);

        if (checkOwner.rows.length === 0) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        if (checkOwner.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        const result = await client.query(`
            UPDATE properties SET
                title = $1, description = $2, property_type = $3, address = $4,
                city_id = $5, city_name = $6, postal_code = $7, canton_code = $8,
                price = $9, rooms = $10, bathrooms = $11, surface_area = $12,
                available_from = $13, status = $14, updated_at = CURRENT_TIMESTAMP
            WHERE id = $15
            RETURNING *
        `, [
            title, description, property_type, address, city_id, city_name, postal_code, canton_code,
            price, rooms, bathrooms, surface_area, available_from, status || 'available', id
        ]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur mise à jour annonce:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const checkOwner = await client.query('SELECT owner_id FROM properties WHERE id = $1', [id]);

        if (checkOwner.rows.length === 0) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        if (checkOwner.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        const photos = await client.query('SELECT photo_url FROM property_photos WHERE property_id = $1', [id]);
        photos.rows.forEach(photo => {
            const filename = path.basename(photo.photo_url);
            const filePath = path.join(uploadsDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await client.query('DELETE FROM properties WHERE id = $1', [id]);
        res.json({ message: 'Annonce supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression annonce:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTES FAVORIS
// =========================================
app.get('/api/favorites', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT p.*, u.first_name, u.last_name, sc.name_fr as canton_name,
                   (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
                   f.id as favorite_id
            FROM favorites f
            JOIN properties p ON f.property_id = p.id
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération favoris:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.get('/api/favorites/check/:property_id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { property_id } = req.params;
        
        const result = await client.query(
            'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
            [req.user.id, property_id]
        );

        res.json({ isFavorite: result.rows.length > 0 });
    } catch (error) {
        console.error('Erreur vérification favori:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { property_id } = req.body;

        const result = await client.query(`
            INSERT INTO favorites (user_id, property_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING *
        `, [req.user.id, property_id]);

        res.status(201).json(result.rows[0] || { message: 'Déjà en favori' });
    } catch (error) {
        console.error('Erreur ajout favori:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.delete('/api/favorites/:property_id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { property_id } = req.params;

        await client.query(
            'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2',
            [req.user.id, property_id]
        );

        res.json({ message: 'Favori supprimé' });
    } catch (error) {
        console.error('Erreur suppression favori:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTES DEMANDES
// =========================================
app.post('/api/requests', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Seuls les étudiants peuvent envoyer des demandes' });
        }

        const { property_id, message } = req.body;

        if (!property_id || !message) {
            return res.status(400).json({ error: 'Propriété et message requis' });
        }

        const propertyCheck = await client.query('SELECT id FROM properties WHERE id = $1', [property_id]);

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Propriété non trouvée' });
        }

        const existingRequest = await client.query(
            'SELECT id FROM property_requests WHERE property_id = $1 AND requester_id = $2 AND status = $3',
            [property_id, req.user.id, 'pending']
        );

        if (existingRequest.rows.length > 0) {
            return res.status(400).json({ error: 'Vous avez déjà une demande en attente pour cette propriété' });
        }

        const result = await client.query(`
            INSERT INTO property_requests (property_id, requester_id, message)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [property_id, req.user.id, message]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur création demande:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.get('/api/requests/received', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT r.*, p.title as property_title, u.first_name, u.last_name, u.email, u.phone
            FROM property_requests r
            JOIN properties p ON r.property_id = p.id
            JOIN users u ON r.requester_id = u.id
            WHERE p.owner_id = $1
            ORDER BY r.created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération demandes reçues:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.get('/api/requests/sent', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT r.*, p.title as property_title, p.city_name, p.price
            FROM property_requests r
            JOIN properties p ON r.property_id = p.id
            WHERE r.requester_id = $1
            ORDER BY r.created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération demandes envoyées:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.put('/api/requests/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }

        const checkOwner = await client.query(`
            SELECT p.owner_id 
            FROM property_requests r
            JOIN properties p ON r.property_id = p.id
            WHERE r.id = $1
        `, [id]);

        if (checkOwner.rows.length === 0) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }

        if (checkOwner.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        const result = await client.query(`
            UPDATE property_requests 
            SET status = $1 
            WHERE id = $2 
            RETURNING property_id, *
        `, [status, id]);

        if (status === 'accepted') {
            await client.query(`UPDATE properties SET status = 'rented' WHERE id = $1`, [result.rows[0].property_id]);
            
            await client.query(`
                UPDATE property_requests 
                SET status = 'rejected' 
                WHERE property_id = $1 AND id != $2 AND status = 'pending'
            `, [result.rows[0].property_id, id]);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur mise à jour demande:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.delete('/api/requests/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const checkRequester = await client.query(
            'SELECT requester_id FROM property_requests WHERE id = $1',
            [id]
        );

        if (checkRequester.rows.length === 0) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }

        if (checkRequester.rows[0].requester_id !== req.user.id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        await client.query('DELETE FROM property_requests WHERE id = $1', [id]);
        res.json({ message: 'Demande annulée avec succès' });
    } catch (error) {
        console.error('Erreur annulation demande:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTES MESSAGERIE
// =========================================
app.post('/api/conversations', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { property_id, owner_id } = req.body;

        if (!property_id || !owner_id) {
            return res.status(400).json({ error: 'property_id et owner_id requis' });
        }

        let conversation = await client.query(
            'SELECT * FROM conversations WHERE property_id = $1 AND student_id = $2 AND owner_id = $3',
            [property_id, req.user.id, owner_id]
        );

        if (conversation.rows.length === 0) {
            conversation = await client.query(
                'INSERT INTO conversations (property_id, student_id, owner_id) VALUES ($1, $2, $3) RETURNING *',
                [property_id, req.user.id, owner_id]
            );
        }

        res.json(conversation.rows[0]);
    } catch (error) {
        console.error('Erreur création conversation:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.get('/api/conversations', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT c.*, 
                   p.title as property_title, p.city_name,
                   CASE 
                       WHEN c.student_id = $1 THEN u_owner.first_name || ' ' || u_owner.last_name
                       ELSE u_student.first_name || ' ' || u_student.last_name
                   END as other_user_name,
                   (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND read_at IS NULL) as unread_count
            FROM conversations c
            LEFT JOIN properties p ON c.property_id = p.id
            LEFT JOIN users u_owner ON c.owner_id = u_owner.id
            LEFT JOIN users u_student ON c.student_id = u_student.id
            WHERE c.student_id = $1 OR c.owner_id = $1
            ORDER BY c.last_message_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération conversations:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { conversation_id, content } = req.body;

        if (!conversation_id || !content) {
            return res.status(400).json({ error: 'conversation_id et content requis' });
        }

        const convCheck = await client.query(
            'SELECT * FROM conversations WHERE id = $1 AND (student_id = $2 OR owner_id = $2)',
            [conversation_id, req.user.id]
        );

        if (convCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Accès refusé à cette conversation' });
        }

        const result = await client.query(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
            [conversation_id, req.user.id, content]
        );

        await client.query(
            'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
            [conversation_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur envoi message:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.get('/api/messages/:conversation_id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { conversation_id } = req.params;

        const convCheck = await client.query(
            'SELECT * FROM conversations WHERE id = $1 AND (student_id = $2 OR owner_id = $2)',
            [conversation_id, req.user.id]
        );

        if (convCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        const result = await client.query(`
            SELECT m.*, u.first_name, u.last_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = $1
            ORDER BY m.created_at ASC
        `, [conversation_id]);

        await client.query(
            'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL',
            [conversation_id, req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération messages:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTES PARAMÈTRES
// =========================================
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { first_name, last_name, phone, profile_picture } = req.body;

        // Construire la requête dynamiquement pour ne mettre à jour que les champs fournis
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (first_name !== undefined) {
            updates.push(`first_name = $${paramCount}`);
            values.push(first_name);
            paramCount++;
        }
        if (last_name !== undefined) {
            updates.push(`last_name = $${paramCount}`);
            values.push(last_name);
            paramCount++;
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount}`);
            values.push(phone);
            paramCount++;
        }
        if (profile_picture !== undefined) {
            updates.push(`profile_picture = $${paramCount}`);
            values.push(profile_picture);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(req.user.id);

        const result = await client.query(`
            UPDATE users SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, first_name, last_name, email, phone, role, email_verified, phone_verified, profile_picture
        `, values);

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Erreur mise à jour profil:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

app.put('/api/users/change-password', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Mots de passe requis' });
        }

        if (new_password.length < 8) {
            return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
        }

        const user = await client.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const validPassword = await bcrypt.compare(current_password, user.rows[0].password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }

        const new_hash = await bcrypt.hash(new_password, 10);
        await client.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [new_hash, req.user.id]);

        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
        console.error('Erreur changement mot de passe:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// DÉMARRAGE DU SERVEUR
// =========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   🏠 Serveur Hoomy Suisse - CORS OUVERT           ║
║   ⚠️  Attention: TOUS les CORS acceptés            ║
╠═══════════════════════════════════════════════════╣
║   IP Locale: ${LOCAL_IP.padEnd(39)}║
║   Port: ${PORT.toString().padEnd(41)}║
║   URL: ${BASE_URL.padEnd(42)}║
║   Base de données: hoomy_ch                       ║
║   Upload d'images: Activé                         ║
║   Limite JSON: 50MB                               ║
╠═══════════════════════════════════════════════════╣
║   📱 Accessible depuis n'importe quelle origine   ║
║   ✅ CORS: Permissif (origin: *)                  ║
╚═══════════════════════════════════════════════════╝
    `);
});
