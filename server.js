require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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
const kycRoutes = require('./routes/kyc');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// =========================================
// CONFIGURATION LAN UNIQUEMENT
// =========================================
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            // Ignorer les interfaces internes et non-IPv4
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost'; // Fallback si aucune IP trouvée
}

const LOCAL_IP = getLocalIP();

// Déterminer BASE_URL selon l'environnement
let BASE_URL;
if (process.env.NODE_ENV === 'production') {
    // En production, utiliser l'URL du backend de production
    BASE_URL = process.env.BACKEND_URL || 'https://backend.hoomy.site';
} else {
    // En développement, utiliser l'IP locale
    BASE_URL = `http://${LOCAL_IP}:${PORT}`;
}

console.log(`
╔═══════════════════════════════════════════════════╗
║   🔒 CONFIGURATION ${process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'RÉSEAU LOCAL (LAN)'}  ║
║   IP Locale: ${LOCAL_IP}                          ║
║   Port: ${PORT}                                   ║
║   URL: ${BASE_URL}                                ║
╚═══════════════════════════════════════════════════╝
`);

// =========================================
// POSTGRESQL POOL OPTIMISÉ - ULTRA RAPIDE
// =========================================
// Utiliser le pool partagé depuis db.js
const { pool } = require('./db');

// =========================================
// CACHE EN MÉMOIRE POUR PERFORMANCE
// =========================================
const cache = {
    cantons: null,
    cities: {},
    lastUpdate: {
        cantons: 0,
        cities: {}
    },
    TTL: 5 * 60 * 1000 // 5 minutes
};

async function getCachedCantons() {
    const now = Date.now();
    if (cache.cantons && (now - cache.lastUpdate.cantons) < cache.TTL) {
        return cache.cantons;
    }
    
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM swiss_cantons ORDER BY name_fr');
        cache.cantons = result.rows;
        cache.lastUpdate.cantons = now;
        return cache.cantons;
    } finally {
        client.release();
    }
}

async function getCachedCities(canton) {
    const now = Date.now();
    const cacheKey = canton || 'all';
    
    if (cache.cities[cacheKey] && (now - (cache.lastUpdate.cities[cacheKey] || 0)) < cache.TTL) {
        return cache.cities[cacheKey];
    }
    
    const client = await pool.connect();
    try {
        let query = 'SELECT c.*, s.name_fr as canton_name FROM swiss_cities c JOIN swiss_cantons s ON c.canton_code = s.code WHERE 1=1';
        const params = [];
        
        if (canton) {
            query += ' AND c.canton_code = $1';
            params.push(canton);
        }
        
        query += ' ORDER BY c.name';
        
        const result = await client.query(query, params);
        cache.cities[cacheKey] = result.rows;
        cache.lastUpdate.cities[cacheKey] = now;
        return cache.cities[cacheKey];
    } finally {
        client.release();
    }
}

// =========================================
// CONFIGURATION UPLOADS
// =========================================
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// =========================================
// MIDDLEWARE DE SÉCURITÉ ET PERFORMANCE
// =========================================
// Trust proxy pour express-rate-limit (nécessaire derrière un reverse proxy)
// Configurer trust proxy de manière sécurisée pour éviter le bypass du rate limiting
// Ne faire confiance qu'au premier proxy (reverse proxy)
app.set('trust proxy', 1); // Faire confiance uniquement au premier proxy

// Helmet pour sécurité
app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour permettre les uploads
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression gzip pour toutes les réponses
app.use(compression({
    level: 6, // Niveau de compression optimal
    threshold: 1024, // Compresser seulement les fichiers > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// =========================================
// MIDDLEWARE - CORS (DOIT ÊTRE AVANT RATE LIMITING)
// =========================================
// Configuration CORS complète
const corsOptions = {
    origin: function(origin, callback) {
        // Permettre toutes les origines (y compris null pour les requêtes same-origin)
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Type', 'Content-Length'],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: false,
    maxAge: 86400 // Cache preflight pour 24 heures
};

// Appliquer CORS à toutes les routes
app.use(cors(corsOptions));

// Handler explicite pour les requêtes OPTIONS (preflight)
app.options('*', (req, res) => {
    const origin = req.headers.origin;
    
    // Définir tous les headers CORS nécessaires
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
    
    res.status(204).end();
});

// Middleware pour ajouter les headers CORS à toutes les réponses
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Ajouter les headers CORS à toutes les réponses
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
    
    next();
});

// =========================================
// WEBHOOK STRIPE - DOIT ÊTRE AVANT express.json()
// =========================================
app.use('/api/stripe', stripeWebhooksRoutes);

// =========================================
// RATE LIMITING (APRÈS CORS POUR INCLURE LES EN-TÊTES)
// =========================================
// Rate limiting pour protéger contre les abus (limite augmentée pour le développement)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limite augmentée à 1000 requêtes par fenêtre pour le développement
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
    // Ignorer les requêtes OPTIONS (preflight) - elles ne doivent pas être limitées
    skip: (req) => req.method === 'OPTIONS',
    // Utiliser l'IP réelle même avec trust proxy
    keyGenerator: (req) => {
        // Récupérer l'IP réelle depuis les headers X-Forwarded-For ou l'IP directe
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || req.connection.remoteAddress;
        return ip || 'unknown';
    },
    // Désactiver trustProxy dans rateLimit pour éviter le warning
    trustProxy: false,
    handler: (req, res) => {
        // S'assurer que les en-têtes CORS sont inclus même pour les erreurs 429
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
        }
        res.status(429).json({
            error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

app.use('/api/', limiter);

// Rate limiting plus strict pour l'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Augmenté à 10 tentatives par 15 minutes
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
    skipSuccessfulRequests: true,
    // Ignorer les requêtes OPTIONS (preflight)
    skip: (req) => req.method === 'OPTIONS',
    handler: (req, res) => {
        // S'assurer que les en-têtes CORS sont inclus même pour les erreurs 429
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
        }
        res.status(429).json({
            error: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, charset: 'utf-8' }));

// Servir les fichiers statiques avec cache
app.use(express.static('public', {
    maxAge: '1d', // Cache les fichiers statiques pendant 1 jour
    etag: true,
    lastModified: true
}));

app.use('/uploads', express.static(uploadsDir, {
    maxAge: '7d', // Cache les images pendant 7 jours
    etag: true,
    lastModified: true
}));

// =========================================
// ROUTES - DANS LE BON ORDRE
// =========================================
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Pour /api/login
app.use('/api/payments', paymentRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);

// =========================================
// MIDDLEWARE D'AUTHENTIFICATION OPTIMISÉ
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
// CONFIGURATION MULTER OPTIMISÉE
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
// ROUTES D'IMAGES OPTIMISÉES
// =========================================
app.get('/api/image/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // Headers CORS pour les images - TOUJOURS définir même sans origin
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
    
    // Déterminer le type MIME basé sur l'extension AVANT de définir les headers
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
                console.error('Erreur envoi image:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Erreur serveur lors de l\'envoi de l\'image' });
                }
            }
        });
    } else {
        // Image non trouvée - retourner un placeholder SVG au lieu d'une erreur JSON
        // Cela permet au navigateur d'afficher quelque chose au lieu d'une erreur
        console.warn(`Image non trouvée: ${filename} dans ${uploadsDir}`);
        
        // Créer un placeholder SVG simple
        const placeholderSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect fill="#e5e7eb" width="400" height="300"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui" font-size="16" fill="#9ca3af">
    Image non disponible
  </text>
</svg>`;
        
        res.set({
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600', // Cache 1 heure pour les placeholders
        });
        
        res.send(placeholderSvg);
    }
});

app.post('/api/upload/image', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        const imageUrl = `${BASE_URL}/api/image/${req.file.filename}`;
        
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
// ROUTES VILLES ET CANTONS SUISSES - AVEC CACHE
// =========================================
app.get('/api/locations/cantons', async (req, res) => {
    try {
        // Headers CORS explicites pour cette route
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        const cantons = await getCachedCantons();
        res.set('Cache-Control', 'public, max-age=300'); // Cache 5 minutes
        res.set('Content-Type', 'application/json; charset=utf-8'); // UTF-8 encoding
        res.json(cantons);
    } catch (error) {
        console.error('Erreur récupération cantons:', error.message);
        // S'assurer que les headers CORS sont présents même en cas d'erreur
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/locations/cities', async (req, res) => {
    const client = await pool.connect();
    try {
        // Headers CORS explicites pour cette route
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        const { canton } = req.query;
        const cities = await getCachedCities(canton);
        res.set('Cache-Control', 'public, max-age=300'); // Cache 5 minutes
        res.set('Content-Type', 'application/json; charset=utf-8'); // UTF-8 encoding
        res.json(cities);
    } catch (error) {
        console.error('Erreur récupération villes:', error.message);
        // S'assurer que les headers CORS sont présents même en cas d'erreur
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =========================================
// ROUTE AUTocomplétion ADRESSES
// =========================================
app.get('/api/locations/addresses/autocomplete', async (req, res) => {
    const client = await pool.connect();
    try {
        const { query, canton_code } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.json([]);
        }
        
        const searchQuery = `%${query.trim()}%`;
        const queryLower = query.trim().toLowerCase();
        const results = [];
        const seenAddresses = new Set(); // Pour éviter les doublons
        
        // 1. D'abord, rechercher dans les propriétés existantes (priorité)
        let addressQuery = `
            SELECT DISTINCT 
                p.address,
                p.city_name,
                p.postal_code,
                p.canton_code,
                sc.name_fr as canton_name
            FROM properties p
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE p.address ILIKE $1
        `;
        const addressParams = [searchQuery];
        
        if (canton_code) {
            addressQuery += ' AND p.canton_code = $2';
            addressParams.push(canton_code);
        }
        
        addressQuery += ' ORDER BY p.city_name, p.address LIMIT 50';
        
        const addressResult = await client.query(addressQuery, addressParams);
        
        // Formater les résultats des propriétés existantes
        addressResult.rows.forEach(row => {
            const key = `${row.address.toLowerCase()}_${row.city_name.toLowerCase()}`;
            if (!seenAddresses.has(key)) {
                seenAddresses.add(key);
                results.push({
                    address: row.address,
                    city_name: row.city_name,
                    postal_code: row.postal_code,
                    canton_code: row.canton_code,
                    canton_name: row.canton_name,
                    full_address: `${row.address}, ${row.city_name}`,
                    source: 'existing_property'
                });
            }
        });
        
        // 2. Rechercher toutes les villes suisses correspondantes
        let cityQuery = `
            SELECT DISTINCT
                c.name,
                c.postal_code,
                c.canton_code,
                sc.name_fr as canton_name
            FROM swiss_cities c
            JOIN swiss_cantons sc ON c.canton_code = sc.code
            WHERE 1=1
        `;
        const cityParams = [];
        let paramCount = 1;
        
        // Chercher les villes dont le nom correspond à la recherche OU qui sont dans le canton spécifié
        if (canton_code) {
            cityQuery += ` AND c.canton_code = $${paramCount}`;
            cityParams.push(canton_code);
            paramCount++;
        }
        
        cityQuery += ' ORDER BY c.name LIMIT 200';
        
        const cityResult = await client.query(cityQuery, cityParams);
        
        // 3. Proposer la combinaison adresse + ville pour TOUTES les villes correspondantes
        cityResult.rows.forEach(city => {
            const key = `${queryLower}_${city.name.toLowerCase()}`;
            if (!seenAddresses.has(key)) {
                seenAddresses.add(key);
                results.push({
                    address: query.trim(),
                    city_name: city.name,
                    postal_code: city.postal_code,
                    canton_code: city.canton_code,
                    canton_name: city.canton_name,
                    full_address: `${query.trim()}, ${city.name}`,
                    source: 'suggestion'
                });
            }
        });
        
        // 4. Si la recherche ressemble à un nom de ville, chercher aussi les villes correspondantes
        if (query.trim().length >= 3) {
            let cityNameQuery = `
                SELECT DISTINCT
                    c.name,
                    c.postal_code,
                    c.canton_code,
                    sc.name_fr as canton_name
                FROM swiss_cities c
                JOIN swiss_cantons sc ON c.canton_code = sc.code
                WHERE c.name ILIKE $1
            `;
            const cityNameParams = [searchQuery];
            let cityNameParamCount = 2;
            
            if (canton_code) {
                cityNameQuery += ` AND c.canton_code = $${cityNameParamCount}`;
                cityNameParams.push(canton_code);
                cityNameParamCount++;
            }
            
            cityNameQuery += ' ORDER BY c.name LIMIT 50';
            
            const matchingCities = await client.query(cityNameQuery, cityNameParams);
            
            matchingCities.rows.forEach(city => {
                // Proposer l'adresse avec cette ville
                const key = `${queryLower}_${city.name.toLowerCase()}`;
                if (!seenAddresses.has(key)) {
                    seenAddresses.add(key);
                    results.push({
                        address: query.trim(),
                        city_name: city.name,
                        postal_code: city.postal_code,
                        canton_code: city.canton_code,
                        canton_name: city.canton_name,
                        full_address: `${query.trim()}, ${city.name}`,
                        source: 'suggestion'
                    });
                }
            });
        }
        
        // Trier les résultats : propriétés existantes en premier, puis par nom de ville
        results.sort((a, b) => {
            if (a.source === 'existing_property' && b.source !== 'existing_property') return -1;
            if (a.source !== 'existing_property' && b.source === 'existing_property') return 1;
            return a.city_name.localeCompare(b.city_name);
        });
        
        res.set('Cache-Control', 'public, max-age=60'); // Cache 1 minute
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json(results.slice(0, 100)); // Augmenter la limite à 100 résultats
    } catch (error) {
        console.error('Erreur autocomplétion adresses:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// ROUTE AUTocomplétion VILLES
// =========================================
app.get('/api/locations/cities/autocomplete', async (req, res) => {
    const client = await pool.connect();
    try {
        const { query, canton_code } = req.query;
        
        if (!query || query.trim().length < 1) {
            return res.json([]);
        }
        
        const searchQuery = `%${query.trim()}%`;
        let cityQuery = `
            SELECT c.*, s.name_fr as canton_name
            FROM swiss_cities c
            JOIN swiss_cantons s ON c.canton_code = s.code
            WHERE c.name ILIKE $1
        `;
        const params = [searchQuery];
        
        if (canton_code) {
            cityQuery += ' AND c.canton_code = $2';
            params.push(canton_code);
        }
        
        cityQuery += ' ORDER BY c.name LIMIT 20';
        
        const result = await client.query(cityQuery, params);
        
        res.set('Cache-Control', 'public, max-age=300'); // Cache 5 minutes
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur autocomplétion villes:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// HELPER: Vérifier si la colonne deleted_at existe
// =========================================
async function checkDeletedAtColumn(client) {
    try {
        const result = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'deleted_at'
        `);
        return result.rows.length > 0;
    } catch (error) {
        return false;
    }
}

// =========================================
// HELPER: Formater les données utilisateur pour gérer les soft deletes
// =========================================
function formatUserData(user) {
    if (!user) return user;
    
    // Si l'utilisateur est supprimé (deleted_at IS NOT NULL)
    // Vérifier si deleted_at existe et n'est pas null
    if (user.deleted_at !== undefined && user.deleted_at !== null) {
        return {
            ...user,
            first_name: 'deleted_user',
            last_name: user.id?.toString() || '',
            email: `deleted_user_${user.id}@deleted.local`,
            profile_picture: null,
            phone: null,
        };
    }
    
    return user;
}

// =========================================
// HELPER: Normaliser les URLs d'images pour pointer vers le bon backend
// =========================================
function normalizeImageUrl(url) {
    if (!url) return null;
    
    // Si c'est déjà une URL complète vers le backend de production, la retourner
    if (url.includes('backend.hoomy.site') || url.includes('/api/image/')) {
        // Extraire le nom de fichier
        const filenameMatch = url.match(/\/api\/image\/([^\/\?]+)/);
        if (filenameMatch) {
            return `${BASE_URL}/api/image/${filenameMatch[1]}`;
        }
    }
    
    // Si c'est une URL locale (localhost ou IP), la convertir
    if (url.includes('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(url)) {
        const filenameMatch = url.match(/\/api\/image\/([^\/\?]+)/);
        if (filenameMatch) {
            return `${BASE_URL}/api/image/${filenameMatch[1]}`;
        }
        // Si c'est juste un nom de fichier à la fin
        const filenameMatch2 = url.match(/\/([^\/\?]+\.(jpg|jpeg|png|gif|webp))$/i);
        if (filenameMatch2) {
            return `${BASE_URL}/api/image/${filenameMatch2[1]}`;
        }
    }
    
    // Si c'est juste un nom de fichier, construire l'URL complète
    if (!url.includes('http') && !url.includes('/')) {
        return `${BASE_URL}/api/image/${url}`;
    }
    
    // Si c'est un chemin relatif /api/image/...
    if (url.startsWith('/api/image/')) {
        return `${BASE_URL}${url}`;
    }
    
    // Sinon, retourner tel quel (URL externe valide)
    return url;
}

// =========================================
// ROUTES PROPERTIES (ANNONCES) - OPTIMISÉES
// =========================================
app.get('/api/properties', async (req, res) => {
    const client = await pool.connect();
    try {
        const { city_id, city_name, canton, max_price, min_rooms, property_type, status, search } = req.query;

        // Vérifier si la colonne deleted_at existe
        const hasDeletedAt = await checkDeletedAtColumn(client);
        const deletedAtSelect = hasDeletedAt ? ', u.deleted_at' : ', NULL as deleted_at';

        // Construction optimisée de la requête avec index
        let query = `
            SELECT p.*, 
                   u.first_name, u.last_name, u.email, u.phone, u.profile_picture${deletedAtSelect},
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

        if (search) {
            query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR p.address ILIKE $${paramCount} OR p.city_name ILIKE $${paramCount})`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern);
            params.push(searchPattern);
            params.push(searchPattern);
            params.push(searchPattern);
            paramCount += 4;
        }

        // Pagination pour éviter de retourner trop de résultats
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 par page
        const offset = (page - 1) * limit;
        
        query += ' ORDER BY p.created_at DESC';
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);
        
        // Requête pour compter le total (pour la pagination) - construite séparément
        let countQuery = `
            SELECT COUNT(*) as total
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE 1=1
        `;
        const countParams = [];
        let countParamCount = 1;
        
        // Ajouter les mêmes conditions WHERE
        if (city_id) {
            countQuery += ` AND p.city_id = $${countParamCount}`;
            countParams.push(city_id);
            countParamCount++;
        }
        if (city_name) {
            countQuery += ` AND p.city_name = $${countParamCount}`;
            countParams.push(city_name);
            countParamCount++;
        }
        if (canton) {
            countQuery += ` AND p.canton_code = $${countParamCount}`;
            countParams.push(canton);
            countParamCount++;
        }
        if (max_price) {
            countQuery += ` AND p.price <= $${countParamCount}`;
            countParams.push(max_price);
            countParamCount++;
        }
        if (min_rooms) {
            countQuery += ` AND p.rooms >= $${countParamCount}`;
            countParams.push(min_rooms);
            countParamCount++;
        }
        if (property_type) {
            countQuery += ` AND p.property_type = $${countParamCount}`;
            countParams.push(property_type);
            countParamCount++;
        }
        if (status) {
            countQuery += ` AND p.status = $${countParamCount}`;
            countParams.push(status);
            countParamCount++;
        } else {
            countQuery += ` AND p.status = 'available'`;
        }
        if (search) {
            countQuery += ` AND (p.title ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount} OR p.address ILIKE $${countParamCount} OR p.city_name ILIKE $${countParamCount})`;
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        const [result, countResult] = await Promise.all([
            client.query(query, params),
            client.query(countQuery, countParams)
        ]);
        
        const total = parseInt(countResult.rows[0]?.total || 0);
        
        // Formater les utilisateurs supprimés et normaliser les URLs d'images
        // Masquer les téléphones non vérifiés
        const formattedRows = result.rows.map(row => {
            const formatted = { ...row };
            
            if (hasDeletedAt && row.deleted_at) {
                formatted.first_name = 'deleted_user';
                formatted.last_name = row.owner_id?.toString() || '';
                formatted.email = `deleted_user_${row.owner_id}@deleted.local`;
                formatted.phone = null;
                formatted.profile_picture = null;
            }
            
            // Masquer le téléphone si non vérifié
            if (!formatted.phone_verified) {
                formatted.phone = null;
            }
            
            // Normaliser l'URL de la photo principale
            if (formatted.main_photo) {
                formatted.main_photo = normalizeImageUrl(formatted.main_photo);
            }
            
            return formatted;
        });
        
        // Cache pour les résultats de recherche
        res.set('Cache-Control', 'public, max-age=60'); // Cache 1 minute
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({
            properties: formattedRows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: offset + limit < total
            }
        });
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
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;
        
        const result = await client.query(`
            SELECT p.*, 
                   sc.name_fr as canton_name,
                   (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo
            FROM properties p
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE p.owner_id = $1
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `, [req.user.id, limit, offset]);
        
        // Compter le total
        const countResult = await client.query(
            'SELECT COUNT(*) as total FROM properties WHERE owner_id = $1',
            [req.user.id]
        );
        const total = parseInt(countResult.rows[0]?.total || 0);

        // Normaliser les URLs d'images
        const formattedRows = result.rows.map(row => {
            if (row.main_photo) {
                row.main_photo = normalizeImageUrl(row.main_photo);
            }
            return row;
        });

        res.json({
            properties: formattedRows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: offset + limit < total
            }
        });
    } catch (error) {
        console.error('Erreur récupération mes annonces:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// Route spécifique pour rejeter "create" avant la route :id
app.get('/api/properties/create', (req, res) => {
    return res.status(404).json({ 
        error: 'Route non trouvée. Utilisez POST /api/properties pour créer une propriété.',
        hint: 'GET /api/properties/create is not a valid API endpoint. Use POST /api/properties instead.'
    });
});

app.get('/api/properties/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const propertyId = parseInt(id);
        if (isNaN(propertyId)) {
            return res.status(400).json({ error: 'ID de propriété invalide' });
        }

        // Vérifier si la colonne deleted_at existe
        const hasDeletedAt = await checkDeletedAtColumn(client);
        const deletedAtSelect = hasDeletedAt ? ', u.deleted_at' : ', NULL as deleted_at';
        
        // Requête optimisée avec une seule jointure
        const propertyResult = await client.query(`
            SELECT p.*, u.first_name, u.last_name, u.email, u.phone, u.email_verified, u.phone_verified, u.profile_picture${deletedAtSelect},
                   sc.name_fr as canton_name
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE p.id = $1
        `, [propertyId]);
        
        if (propertyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        const property = propertyResult.rows[0];
        
        // Formater les données utilisateur si supprimé
        if (hasDeletedAt && property && property.deleted_at) {
            property.first_name = 'deleted_user';
            property.last_name = property.owner_id?.toString() || '';
            property.email = `deleted_user_${property.owner_id}@deleted.local`;
            property.profile_picture = null;
            property.phone = null;
        }
        
        // Masquer le téléphone si non vérifié
        if (!property.phone_verified) {
            property.phone = null;
        }

        // Récupération des photos en parallèle serait mieux, mais on garde simple
        const photosResult = await client.query(
            'SELECT * FROM property_photos WHERE property_id = $1 ORDER BY is_main DESC',
            [propertyId]
        );

        // Normaliser les URLs des photos
        property.photos = photosResult.rows.map(photo => ({
            ...photo,
            photo_url: normalizeImageUrl(photo.photo_url)
        }));

        res.set('Cache-Control', 'public, max-age=300'); // Cache 5 minutes
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

        // Vérifier que le KYC est approuvé
        const kycCheck = await client.query(`
            SELECT kyc_verified, k.status 
            FROM users u
            LEFT JOIN kyc_verifications k ON u.id = k.user_id
            WHERE u.id = $1
        `, [req.user.id]);

        if (kycCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const userKYC = kycCheck.rows[0];
        
        if (!userKYC.kyc_verified && userKYC.status !== 'approved') {
            return res.status(403).json({ 
                error: 'Vous devez compléter la vérification KYC avant de pouvoir publier des annonces. Veuillez aller dans votre profil pour effectuer la vérification.',
                code: 'KYC_REQUIRED'
            });
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

        // Insertion batch optimisée des photos
        if (image_urls.length > 0) {
            // Utiliser une seule requête avec VALUES multiples pour meilleure performance
            const photoValues = image_urls.map((_, i) => {
                const paramIndex = i * 2 + 1;
                return `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`;
            }).join(', ');
            
            // Flatten les paramètres : [property.id, url1, is_main1, property.id, url2, is_main2, ...]
            const photoParams = image_urls.flatMap((url, i) => [property.id, url, i === 0]);
            
            await client.query(
                `INSERT INTO property_photos (property_id, photo_url, is_main) VALUES ${photoValues}`,
                photoParams
            );
        }

        // Invalider le cache
        cache.cantons = null;
        cache.cities = {};

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
// ROUTES FAVORIS - OPTIMISÉES
// =========================================
app.get('/api/favorites', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;
        
        const result = await client.query(`
            SELECT p.*, u.first_name, u.last_name, u.profile_picture, sc.name_fr as canton_name,
                   (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo,
                   f.id as favorite_id
            FROM favorites f
            JOIN properties p ON f.property_id = p.id
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
            LIMIT $2 OFFSET $3
        `, [req.user.id, limit, offset]);
        
        // Compter le total
        const countResult = await client.query(
            'SELECT COUNT(*) as total FROM favorites WHERE user_id = $1',
            [req.user.id]
        );
        const total = parseInt(countResult.rows[0]?.total || 0);

        // Normaliser les URLs d'images
        const formattedRows = result.rows.map(row => {
            if (row.main_photo) {
                row.main_photo = normalizeImageUrl(row.main_photo);
            }
            return row;
        });

        res.json({
            favorites: formattedRows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: offset + limit < total
            }
        });
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
// ROUTES DEMANDES - OPTIMISÉES
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

        const propertyIdNum = parseInt(property_id);
        if (isNaN(propertyIdNum)) {
            return res.status(400).json({ error: 'ID de propriété invalide' });
        }

        const requesterId = parseInt(req.user.id);
        if (isNaN(requesterId)) {
            return res.status(400).json({ error: 'ID utilisateur invalide' });
        }

        // Vérifications batch pour performance
        const [userCheck, propertyCheck, existingRequest] = await Promise.all([
            client.query('SELECT id FROM users WHERE id = $1', [requesterId]),
            client.query('SELECT id FROM properties WHERE id = $1', [propertyIdNum]),
            client.query(
                'SELECT id FROM property_requests WHERE property_id = $1 AND requester_id = $2 AND status = $3',
                [propertyIdNum, requesterId, 'pending']
            )
        ]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        if (propertyCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Propriété non trouvée' });
        }

        if (existingRequest.rows.length > 0) {
            return res.status(400).json({ error: 'Vous avez déjà une demande en attente pour cette propriété' });
        }

        const result = await client.query(`
            INSERT INTO property_requests (property_id, requester_id, message)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [propertyIdNum, requesterId, message]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur création demande:', error.message);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    } finally {
        client.release();
    }
});

app.get('/api/requests/received', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        // Vérifier si la colonne deleted_at existe
        const hasDeletedAt = await checkDeletedAtColumn(client);
        const deletedAtSelect = hasDeletedAt ? ', u.deleted_at' : ', NULL as deleted_at';
        
        const result = await client.query(`
            SELECT r.*, p.title as property_title, u.first_name, u.last_name, u.email, u.phone${deletedAtSelect}
            FROM property_requests r
            JOIN properties p ON r.property_id = p.id
            JOIN users u ON r.requester_id = u.id
            WHERE p.owner_id = $1
            ORDER BY r.created_at DESC
        `, [req.user.id]);
        
        // Formater les utilisateurs supprimés
        const formattedRows = result.rows.map(row => {
            if (hasDeletedAt && row.deleted_at) {
                return {
                    ...row,
                    first_name: 'deleted_user',
                    last_name: row.requester_id?.toString() || '',
                    email: `deleted_user_${row.requester_id}@deleted.local`,
                    phone: null,
                };
            }
            return row;
        });

        res.json(formattedRows);
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

        const requestInfo = await client.query(`
            SELECT r.property_id, r.requester_id, p.owner_id
            FROM property_requests r
            JOIN properties p ON r.property_id = p.id
            WHERE r.id = $1
        `, [id]);

        if (requestInfo.rows.length === 0) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }

        const { property_id, requester_id, owner_id } = requestInfo.rows[0];

        const result = await client.query(`
            UPDATE property_requests 
            SET status = $1 
            WHERE id = $2 
            RETURNING property_id, *
        `, [status, id]);

        if (status === 'accepted') {
            // Transactions batch pour performance
            await Promise.all([
                client.query(`UPDATE properties SET status = 'rented' WHERE id = $1`, [property_id]),
                client.query(`
                    UPDATE property_requests 
                    SET status = 'rejected' 
                    WHERE property_id = $1 AND id != $2 AND status = 'pending'
                `, [property_id, id])
            ]);

            // Créer automatiquement une conversation
            try {
                const existingConversation = await client.query(
                    'SELECT * FROM conversations WHERE property_id = $1 AND student_id = $2 AND owner_id = $3',
                    [property_id, requester_id, owner_id]
                );

                if (existingConversation.rows.length === 0) {
                    await client.query(
                        'INSERT INTO conversations (property_id, student_id, owner_id) VALUES ($1, $2, $3) RETURNING *',
                        [property_id, requester_id, owner_id]
                    );
                }
            } catch (convError) {
                console.error('⚠️ Erreur lors de la création automatique de la conversation:', convError.message);
            }
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
// ROUTES MESSAGERIE - OPTIMISÉES
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
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;
        
        // Vérifier si la colonne deleted_at existe
        const hasDeletedAt = await checkDeletedAtColumn(client);
        const ownerDeletedAtSelect = hasDeletedAt ? ', u_owner.deleted_at as owner_deleted_at' : ', NULL as owner_deleted_at';
        const studentDeletedAtSelect = hasDeletedAt ? ', u_student.deleted_at as student_deleted_at' : ', NULL as student_deleted_at';
        
        const result = await client.query(`
            SELECT c.*, 
                   p.title as property_title, p.city_name,
                   u_owner.first_name as owner_first_name, u_owner.last_name as owner_last_name${ownerDeletedAtSelect},
                   u_student.first_name as student_first_name, u_student.last_name as student_last_name${studentDeletedAtSelect},
                   (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND read_at IS NULL) as unread_count
            FROM conversations c
            LEFT JOIN properties p ON c.property_id = p.id
            LEFT JOIN users u_owner ON c.owner_id = u_owner.id
            LEFT JOIN users u_student ON c.student_id = u_student.id
            WHERE c.student_id = $1 OR c.owner_id = $1
            ORDER BY c.last_message_at DESC
            LIMIT $2 OFFSET $3
        `, [req.user.id, limit, offset]);
        
        // Compter le total
        const countResult = await client.query(
            'SELECT COUNT(*) as total FROM conversations WHERE student_id = $1 OR owner_id = $1',
            [req.user.id]
        );
        const total = parseInt(countResult.rows[0]?.total || 0);
        
        // Formater les utilisateurs supprimés
        const formattedRows = result.rows.map(row => {
            let other_user_name = '';
            if (row.student_id === req.user.id) {
                // L'utilisateur actuel est l'étudiant, donc l'autre est le propriétaire
                if (hasDeletedAt && row.owner_deleted_at) {
                    other_user_name = `deleted_user_${row.owner_id}`;
                } else {
                    other_user_name = `${row.owner_first_name || ''} ${row.owner_last_name || ''}`.trim();
                }
            } else {
                // L'utilisateur actuel est le propriétaire, donc l'autre est l'étudiant
                if (hasDeletedAt && row.student_deleted_at) {
                    other_user_name = `deleted_user_${row.student_id}`;
                } else {
                    other_user_name = `${row.student_first_name || ''} ${row.student_last_name || ''}`.trim();
                }
            }
            
            return {
                ...row,
                other_user_name,
            };
        });

        res.json({
            conversations: formattedRows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: offset + limit < total
            }
        });
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

        // Insertion et mise à jour en parallèle pour performance
        const [result] = await Promise.all([
            client.query(
                'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
                [conversation_id, req.user.id, content]
            ),
            client.query(
                'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
                [conversation_id]
            )
        ]);

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

        // Récupération et mise à jour en parallèle
        // Vérifier si la colonne deleted_at existe
        const hasDeletedAt = await checkDeletedAtColumn(client);
        const deletedAtSelect = hasDeletedAt ? ', u.deleted_at' : ', NULL as deleted_at';
        
        const [result] = await Promise.all([
            client.query(`
                SELECT m.*, u.first_name, u.last_name${deletedAtSelect}
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = $1
                ORDER BY m.created_at ASC
            `, [conversation_id]),
            client.query(
                'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL',
                [conversation_id, req.user.id]
            )
        ]);
        
        // Formater les utilisateurs supprimés
        const formattedRows = result.rows.map(row => {
            if (hasDeletedAt && row.deleted_at) {
                return {
                    ...row,
                    first_name: 'deleted_user',
                    last_name: row.sender_id?.toString() || '',
                };
            }
            return row;
        });

        res.json(formattedRows);
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

// Import du service de validation téléphone
const { validatePhoneNumber, normalizePhoneNumber } = require('./utils/sms');

app.put('/api/users/profile', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { first_name, last_name, phone, profile_picture } = req.body;

        // Construire la requête dynamiquement selon les champs fournis
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (first_name !== undefined) {
            updates.push(`first_name = $${paramIndex++}`);
            values.push(first_name);
        }
        if (last_name !== undefined) {
            updates.push(`last_name = $${paramIndex++}`);
            values.push(last_name);
        }
        
        // Gestion spéciale du téléphone
        // Si le téléphone est modifié, on le valide et on reset phone_verified
        if (phone !== undefined) {
            // Si le téléphone n'est pas vide, le valider
            if (phone && phone.trim() !== '') {
                const phoneValidation = validatePhoneNumber(phone);
                if (!phoneValidation.valid) {
                    return res.status(400).json({ 
                        error: phoneValidation.error,
                        code: 'INVALID_PHONE'
                    });
                }
                
                // Normaliser le numéro
                const normalizedPhone = normalizePhoneNumber(phone);
                
                // Vérifier si le téléphone a changé
                const currentUser = await client.query(
                    'SELECT phone FROM users WHERE id = $1',
                    [req.user.id]
                );
                
                const currentPhone = currentUser.rows[0]?.phone;
                
                if (normalizedPhone !== currentPhone) {
                    // Le téléphone a changé - on doit passer par la vérification SMS
                    return res.status(400).json({ 
                        error: 'Pour modifier votre numéro de téléphone, veuillez utiliser la vérification par SMS. Allez dans Paramètres > Vérifier le téléphone.',
                        code: 'PHONE_VERIFICATION_REQUIRED',
                        requires_verification: true
                    });
                }
            } else {
                // Suppression du téléphone (téléphone vide)
                updates.push(`phone = $${paramIndex++}`);
                values.push(null);
                updates.push(`phone_verified = $${paramIndex++}`);
                values.push(false);
            }
        }
        
        if (profile_picture !== undefined) {
            updates.push(`profile_picture = $${paramIndex++}`);
            values.push(profile_picture);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(req.user.id);

        const result = await client.query(`
            UPDATE users SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
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

app.get('/api/users/students', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Seuls les propriétaires peuvent accéder à cette liste' });
        }

        const result = await client.query(`
            SELECT id, email, first_name, last_name, phone, email_verified
            FROM users 
            WHERE role = 'student' AND email_verified = TRUE
            ORDER BY first_name, last_name
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur récupération étudiants:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// MIDDLEWARE D'ERREUR GLOBAL - GARANTIT LES HEADERS CORS
// =========================================
app.use((err, req, res, next) => {
    // Toujours ajouter les headers CORS, même en cas d'erreur
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
    
    console.error('Erreur serveur:', err);
    
    // Si la réponse n'a pas encore été envoyée
    if (!res.headersSent) {
        res.status(err.status || 500).json({
            error: err.message || 'Erreur serveur',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
});

// Handler pour les routes non trouvées - avec headers CORS
app.use((req, res) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(404).json({ error: 'Route non trouvée' });
});

// =========================================
// DÉMARRAGE DU SERVEUR
// =========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   🏠 Serveur Hoomy Suisse - ULTRA RAPIDE ⚡        ║
║   ⚡ Optimisations: Compression, Cache, Pool       ║
╠═══════════════════════════════════════════════════╣
║   IP Locale: ${LOCAL_IP.padEnd(39)}║
║   Port: ${PORT.toString().padEnd(41)}║
║   URL: ${BASE_URL.padEnd(42)}║
║   Base de données: hoomy_ch                       ║
║   Pool PostgreSQL: 5-20 connexions                ║
║   Cache: Activé (5 min TTL)                       ║
║   Compression: Gzip activé                        ║
║   Rate Limiting: Activé                           ║
╚═══════════════════════════════════════════════════╝
    `);
});
